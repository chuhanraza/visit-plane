-- VisitPlane Programmatic SEO: Content storage + pipeline state
-- Migration: 20260603_seo_page_content
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run

-- ─── SEO Page Content (generated + cached per route) ─────────────────────────

CREATE TABLE IF NOT EXISTS seo_page_content (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Route identifiers
  template          text        NOT NULL, -- 'template1' | 'template2' | 'template3' | 'template4'
  passport_iso      char(3),              -- ISO 3166-1 alpha-3, null for destination-only pages
  destination_iso   char(3),              -- ISO 3166-1 alpha-3, null for passport-only pages

  -- URL slug (canonical)
  url_slug          text        NOT NULL UNIQUE,

  -- Generated content (structured JSON from Gemini pipeline)
  title             text,
  meta_description  text,
  h1                text,
  intro_paragraph   text,      -- 200-word unique intro
  content_json      jsonb,     -- Full structured content: sections[], faq[], sources[]
  word_count        int,
  reading_ease      numeric(5,2), -- Flesch-Kincaid score

  -- Quality gate results
  quality_passed        boolean   NOT NULL DEFAULT false,
  quality_uniqueness    numeric(5,2),  -- 0-100 similarity score (lower = more unique)
  quality_sources_count int,
  quality_min_words_ok  boolean,
  quality_links_ok      boolean,
  quality_notes         text,          -- comma-separated gate failures

  -- Pipeline status
  generation_status text    NOT NULL DEFAULT 'pending',
  -- pending | generating | review_needed | published | failed
  generation_attempt int    NOT NULL DEFAULT 0,
  generation_error   text,
  generated_at       timestamptz,

  -- Publish control (phase rollout)
  phase             int     NOT NULL DEFAULT 4, -- 1=top50, 2=+500, 3=+2000, 4=full
  published         boolean NOT NULL DEFAULT false,
  published_at      timestamptz,

  -- Traffic data (synced from GSC)
  gsc_impressions   int     DEFAULT 0,
  gsc_clicks        int     DEFAULT 0,
  gsc_avg_position  numeric(5,2),
  gsc_synced_at     timestamptz,

  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seo_content_template    ON seo_page_content (template);
CREATE INDEX IF NOT EXISTS idx_seo_content_passport    ON seo_page_content (passport_iso);
CREATE INDEX IF NOT EXISTS idx_seo_content_destination ON seo_page_content (destination_iso);
CREATE INDEX IF NOT EXISTS idx_seo_content_status      ON seo_page_content (generation_status);
CREATE INDEX IF NOT EXISTS idx_seo_content_published   ON seo_page_content (published);
CREATE INDEX IF NOT EXISTS idx_seo_content_phase       ON seo_page_content (phase);
CREATE INDEX IF NOT EXISTS idx_seo_content_clicks      ON seo_page_content (gsc_clicks DESC);

-- updated_at trigger
CREATE OR REPLACE FUNCTION seo_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_seo_content_updated_at ON seo_page_content;
CREATE TRIGGER trg_seo_content_updated_at
  BEFORE UPDATE ON seo_page_content
  FOR EACH ROW EXECUTE FUNCTION seo_set_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE seo_page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_published_seo_content"
  ON seo_page_content FOR SELECT
  USING (published = true);

CREATE POLICY "service_all_seo_content"
  ON seo_page_content FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ─── Dashboard views ─────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW seo_dashboard_summary AS
SELECT
  template,
  COUNT(*)                                                     AS total,
  COUNT(*) FILTER (WHERE published = true)                     AS published,
  COUNT(*) FILTER (WHERE generation_status = 'pending')        AS pending,
  COUNT(*) FILTER (WHERE generation_status = 'generating')     AS generating,
  COUNT(*) FILTER (WHERE generation_status = 'review_needed')  AS review_needed,
  COUNT(*) FILTER (WHERE generation_status = 'failed')         AS failed,
  COUNT(*) FILTER (WHERE quality_passed = true)                AS quality_passed,
  SUM(gsc_clicks)                                              AS total_clicks,
  SUM(gsc_impressions)                                         AS total_impressions
FROM seo_page_content
GROUP BY template;

CREATE OR REPLACE VIEW seo_top_pages AS
SELECT
  url_slug,
  template,
  passport_iso,
  destination_iso,
  title,
  gsc_clicks,
  gsc_impressions,
  gsc_avg_position,
  quality_passed,
  published
FROM seo_page_content
WHERE gsc_clicks > 0
ORDER BY gsc_clicks DESC
LIMIT 100;
