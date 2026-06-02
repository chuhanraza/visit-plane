-- VisitPlane: Route-specific visa requirements with full verification pipeline support
-- Migration: 20260602_visa_requirements
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- Or: supabase db push

-- ─── Enums ─────────────────────────────────────────────────────────────────────

CREATE TYPE visa_purpose AS ENUM (
  'tourist', 'business', 'transit', 'student', 'work', 'family'
);

CREATE TYPE visa_category AS ENUM (
  'visa_free', 'visa_on_arrival', 'evisa', 'eta',
  'visa_required', 'not_permitted', 'conditional'
);

CREATE TYPE data_confidence_level AS ENUM ('high', 'medium', 'low');

-- ─── Main table ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS visa_requirements (
  id                       uuid                  PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Route identifiers
  passport_iso             char(3)               NOT NULL,  -- ISO 3166-1 alpha-3, e.g. 'PAK'
  destination_iso          char(3)               NOT NULL,  -- ISO 3166-1 alpha-3, e.g. 'ARE'
  purpose                  visa_purpose          NOT NULL DEFAULT 'tourist',

  -- Visa classification
  visa_category            visa_category         NOT NULL,
  max_stay_days            int,                            -- null = unlimited or unclear
  multiple_entry           boolean,
  validity_days            int,                            -- how long visa is valid from issue date

  -- Fee (all three stored for flexibility)
  fee_amount               decimal(10, 2),
  fee_currency             char(3),                        -- ISO 4217
  fee_amount_usd           decimal(10, 2),                 -- denormalized for sort/filter
  fee_is_free              boolean               NOT NULL DEFAULT false,
  fee_notes                text,

  -- Processing
  processing_min_hours     int,
  processing_max_hours     int,
  processing_label         text,                           -- human-readable, e.g. "1–3 hours on arrival"

  -- Passport requirements
  passport_validity_months int,                            -- months of validity required beyond stay

  -- Route-specific documents (JSONB array)
  -- Each item: { name, detail, mandatory, applies_when }
  required_documents       jsonb                 NOT NULL DEFAULT '[]'::jsonb,

  -- Eligibility conditions (e.g. must have valid US/UK/Schengen visa)
  eligibility_conditions   jsonb                 NOT NULL DEFAULT '[]'::jsonb,

  -- Warnings / gotchas travellers must know
  warnings                 jsonb                 NOT NULL DEFAULT '[]'::jsonb,

  -- Application portal (for eVisa routes)
  application_url          text,

  -- Source citations
  -- Each item: { type, label, url, verified_at, is_authoritative }
  official_sources         jsonb                 NOT NULL DEFAULT '[]'::jsonb,

  -- Any fields the pipeline could not verify from primary sources
  unverified_fields        jsonb                 NOT NULL DEFAULT '[]'::jsonb,

  -- Data quality
  data_confidence          data_confidence_level NOT NULL DEFAULT 'low',
  data_confidence_reason   text,

  -- Timestamps
  verified_at              timestamptz,
  next_review_due          timestamptz,
  last_rule_change         date,
  created_at               timestamptz           NOT NULL DEFAULT now(),
  updated_at               timestamptz           NOT NULL DEFAULT now(),

  -- Uniqueness: one record per route+purpose combination
  UNIQUE (passport_iso, destination_iso, purpose)
);

-- ─── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_visa_req_route
  ON visa_requirements (passport_iso, destination_iso, purpose);

CREATE INDEX IF NOT EXISTS idx_visa_req_confidence
  ON visa_requirements (data_confidence);

CREATE INDEX IF NOT EXISTS idx_visa_req_review_due
  ON visa_requirements (next_review_due)
  WHERE next_review_due IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_visa_req_category
  ON visa_requirements (visa_category);

-- ─── updated_at trigger ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_visa_req_updated_at ON visa_requirements;
CREATE TRIGGER trg_visa_req_updated_at
  BEFORE UPDATE ON visa_requirements
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Pipeline audit log ────────────────────────────────────────────────────────
-- Stores full LLM response + IATA snapshot + diff for every pipeline run

CREATE TABLE IF NOT EXISTS visa_pipeline_audit (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  passport_iso        char(3)     NOT NULL,
  destination_iso     char(3)     NOT NULL,
  purpose             visa_purpose NOT NULL DEFAULT 'tourist',
  run_at              timestamptz NOT NULL DEFAULT now(),

  -- What the pipeline produced
  gemini_raw_response text,                   -- full LLM text output
  gemini_parsed_json  jsonb,                  -- parsed (may be null if parse failed)
  iata_snapshot       jsonb,                  -- scraped IATA Travel Centre result
  diff_notes          text,                   -- mismatch notes between Gemini and IATA

  -- Outcome
  confidence_set      data_confidence_level,
  flagged_for_review  boolean NOT NULL DEFAULT false,
  flag_reason         text,
  visa_req_id         uuid REFERENCES visa_requirements(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pipeline_audit_route
  ON visa_pipeline_audit (passport_iso, destination_iso, run_at DESC);

-- ─── User-submitted corrections ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS data_corrections (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  visa_req_id      uuid        REFERENCES visa_requirements(id) ON DELETE SET NULL,
  passport_iso     char(3),
  destination_iso  char(3),
  purpose          visa_purpose DEFAULT 'tourist',

  what_is_wrong    text        NOT NULL,   -- dropdown value from UI
  corrected_value  text,
  source_url       text,
  submitter_email  text,

  status           text        NOT NULL DEFAULT 'pending',  -- pending | accepted | rejected
  reviewed_by      text,
  reviewed_at      timestamptz,
  admin_notes      text,

  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_corrections_status
  ON data_corrections (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_corrections_route
  ON data_corrections (passport_iso, destination_iso);

-- ─── Row-level security (public read, service role write) ─────────────────────

ALTER TABLE visa_requirements   ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_pipeline_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_corrections    ENABLE ROW LEVEL SECURITY;

-- Anyone can read verified visa requirements
CREATE POLICY "public_read_visa_requirements"
  ON visa_requirements FOR SELECT USING (true);

-- Only service role can insert/update/delete
CREATE POLICY "service_write_visa_requirements"
  ON visa_requirements FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Audit log: service role only
CREATE POLICY "service_all_pipeline_audit"
  ON visa_pipeline_audit FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Corrections: public insert (for report modal), service role for updates
CREATE POLICY "public_insert_corrections"
  ON data_corrections FOR INSERT WITH CHECK (true);

CREATE POLICY "public_read_corrections"
  ON data_corrections FOR SELECT USING (true);

CREATE POLICY "service_update_corrections"
  ON data_corrections FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ─── Helper view: routes needing review ───────────────────────────────────────

CREATE OR REPLACE VIEW visa_routes_needing_review AS
SELECT
  passport_iso,
  destination_iso,
  purpose,
  data_confidence,
  verified_at,
  next_review_due,
  CASE
    WHEN next_review_due < now() THEN 'overdue'
    WHEN next_review_due < now() + interval '7 days' THEN 'due_soon'
    ELSE 'ok'
  END AS review_status
FROM visa_requirements
WHERE next_review_due IS NOT NULL
ORDER BY next_review_due ASC;

-- ─── Helper view: admin data quality summary ──────────────────────────────────

CREATE OR REPLACE VIEW visa_data_quality_summary AS
SELECT
  COUNT(*)                                                     AS total_routes,
  COUNT(*) FILTER (WHERE data_confidence = 'high')             AS high_confidence,
  COUNT(*) FILTER (WHERE data_confidence = 'medium')           AS medium_confidence,
  COUNT(*) FILTER (WHERE data_confidence = 'low')              AS low_confidence,
  COUNT(*) FILTER (WHERE verified_at IS NOT NULL)              AS verified,
  COUNT(*) FILTER (WHERE verified_at IS NULL)                  AS unverified,
  COUNT(*) FILTER (WHERE next_review_due < now())              AS overdue_review,
  COUNT(*) FILTER (WHERE next_review_due < now() + interval '7 days'
                     AND next_review_due >= now())             AS due_this_week
FROM visa_requirements;
