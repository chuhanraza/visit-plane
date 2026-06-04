-- VisitPlane Sprint 8: Visa Application Service
-- Migration: 20260603_visa_applications
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run

-- ─── Enums ─────────────────────────────────────────────────────────────────

CREATE TYPE application_status AS ENUM (
  'received',
  'in_review',
  'action_needed',
  'submitted_to_embassy',
  'approved',
  'rejected',
  'delivered',
  'refunded',
  'cancelled'
);

CREATE TYPE application_corridor AS ENUM (
  'PAK_UAE',
  'PAK_DEU'
);

-- ─── visa_applications ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS visa_applications (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Corridor
  corridor              application_corridor NOT NULL DEFAULT 'PAK_UAE',
  passport_iso          char(3) NOT NULL DEFAULT 'PAK',
  destination_iso       char(3) NOT NULL DEFAULT 'ARE',

  -- Personal details
  full_name             text NOT NULL,
  date_of_birth         date NOT NULL,
  passport_number       text NOT NULL,
  passport_expiry       date NOT NULL,
  gender                text NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  nationality           text NOT NULL DEFAULT 'Pakistani',

  -- Travel details
  travel_date_from      date NOT NULL,
  travel_date_to        date NOT NULL,
  purpose               text NOT NULL DEFAULT 'tourism',
  accommodation_name    text,
  accommodation_address text,

  -- Contact
  whatsapp_number       text NOT NULL,
  email                 text NOT NULL,

  -- Status
  status                application_status NOT NULL DEFAULT 'received',
  urgency_flag          boolean NOT NULL DEFAULT false,
  internal_notes        text,

  -- Payment
  stripe_session_id     text,
  stripe_payment_intent text,
  service_fee_paid      boolean NOT NULL DEFAULT false,
  service_fee_amount    decimal(10,2) NOT NULL DEFAULT 39.00,
  service_fee_currency  char(3) NOT NULL DEFAULT 'USD',
  govt_fee_amount       decimal(10,2) NOT NULL DEFAULT 90.00,

  -- Refund
  refunded              boolean NOT NULL DEFAULT false,
  refund_reason         text,
  stripe_refund_id      text,
  refunded_at           timestamptz,

  -- Eligibility
  has_prior_rejection   boolean NOT NULL DEFAULT false,
  prior_rejection_notes text,

  -- Tracking token (for customer status page — no auth needed)
  tracking_token        text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),

  -- Meta
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  submitted_at          timestamptz,
  approved_at           timestamptz,
  rejected_at           timestamptz,
  delivered_at          timestamptz,

  -- UAE ICP reference (once submitted)
  icp_reference         text,

  -- Source / UTM
  utm_source            text,
  utm_medium            text,
  utm_campaign          text,
  referrer_url          text
);

-- ─── application_documents ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS application_documents (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id    uuid NOT NULL REFERENCES visa_applications(id) ON DELETE CASCADE,

  doc_type          text NOT NULL,  -- 'passport', 'photo', 'bank_statement', 'employment_letter', etc.
  file_name         text NOT NULL,
  file_size         bigint,
  mime_type         text,
  storage_path      text NOT NULL,  -- Supabase Storage path

  -- AI validation result
  ai_check_passed   boolean,
  ai_check_score    int,           -- 0-100
  ai_check_result   jsonb,        -- full AI response
  ai_checked_at     timestamptz,

  -- Manual review override
  manually_approved boolean,
  reviewed_by       text,
  reviewed_at       timestamptz,

  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ─── application_status_history ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS application_status_history (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id    uuid NOT NULL REFERENCES visa_applications(id) ON DELETE CASCADE,

  from_status       application_status,
  to_status         application_status NOT NULL,
  changed_by        text NOT NULL DEFAULT 'system',  -- 'system', 'admin', 'customer'
  notes             text,

  -- Notification tracking
  email_sent        boolean NOT NULL DEFAULT false,
  whatsapp_sent     boolean NOT NULL DEFAULT false,
  email_sent_at     timestamptz,
  whatsapp_sent_at  timestamptz,

  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ─── Indexes ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_visa_apps_status ON visa_applications(status);
CREATE INDEX IF NOT EXISTS idx_visa_apps_email ON visa_applications(email);
CREATE INDEX IF NOT EXISTS idx_visa_apps_created ON visa_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visa_apps_tracking ON visa_applications(tracking_token);
CREATE INDEX IF NOT EXISTS idx_visa_apps_stripe ON visa_applications(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_app_docs_app_id ON application_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_app_history_app_id ON application_status_history(application_id);

-- ─── Updated_at trigger ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS visa_applications_updated_at ON visa_applications;
CREATE TRIGGER visa_applications_updated_at
  BEFORE UPDATE ON visa_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── RLS Policies ─────────────────────────────────────────────────────────

ALTER TABLE visa_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;

-- Public can INSERT (create application)
CREATE POLICY "Anyone can create application"
  ON visa_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Public can SELECT own application via tracking token (no auth needed)
CREATE POLICY "Public can read own application via token"
  ON visa_applications FOR SELECT
  TO anon, authenticated
  USING (true);  -- Enforced at API level with tracking_token

-- Service role has full access (admin operations)
CREATE POLICY "Service role full access applications"
  ON visa_applications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access documents"
  ON application_documents FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access history"
  ON application_status_history FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Anon can read their own documents via app_id (validated at API level)
CREATE POLICY "Public can read documents"
  ON application_documents FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert documents"
  ON application_documents FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can read history"
  ON application_status_history FOR SELECT
  TO anon, authenticated
  USING (true);

-- ─── Storage bucket for documents ─────────────────────────────────────────
-- Run this separately if storage bucket doesn't exist:
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'visa-documents',
--   'visa-documents',
--   false,  -- private bucket
--   10485760,  -- 10MB limit per file
--   ARRAY['image/jpeg','image/png','image/webp','application/pdf']
-- ) ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE visa_applications IS 'Sprint 8: Visa application service — Pakistan→UAE corridor';
COMMENT ON TABLE application_documents IS 'Uploaded documents per application with AI validation results';
COMMENT ON TABLE application_status_history IS 'Full audit trail of status changes with notification tracking';
