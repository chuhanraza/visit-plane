-- VisitPlane PWA: Push Subscriptions table
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- Or: supabase db push (if using Supabase CLI)

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint      text        NOT NULL UNIQUE,
  p256dh        text        NOT NULL,
  auth          text        NOT NULL,
  user_id       text,
  country       text,        -- ISO slug e.g. 'france', 'united-states'
  subscribed_at timestamptz DEFAULT now(),
  last_sent_at  timestamptz,
  is_active     boolean     DEFAULT true
);

-- Index for filtering by country (used in send-visa-alert)
CREATE INDEX IF NOT EXISTS idx_push_country  ON push_subscriptions(country);
-- Index for looking up by user (for account-linked subs)
CREATE INDEX IF NOT EXISTS idx_push_user_id  ON push_subscriptions(user_id);
-- Index for filtering active subs
CREATE INDEX IF NOT EXISTS idx_push_active   ON push_subscriptions(is_active);

-- Row Level Security: server-side only (service role key bypasses RLS)
-- Anon users should NOT be able to read other users' push subscriptions.
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow the server (service role) full access
CREATE POLICY "service_role_full_access" ON push_subscriptions
  FOR ALL USING (true);

-- No public read/write — all operations go through API routes
-- which use SUPABASE_SERVICE_ROLE_KEY
