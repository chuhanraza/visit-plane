-- ─── affiliate_clicks table ────────────────────────────────────────────────────
-- Run once in Supabase SQL Editor: supabase.com → your project → SQL Editor

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  partner         text        NOT NULL
                              CHECK (partner IN (
                                'safetywing','heymondo','airalo','saily','wayaway','kiwi'
                              )),
  placement       text        NOT NULL
                              CHECK (placement IN (
                                'visa_page','blog_post','homepage','checkout_flow','email'
                              )),
  route_passport  char(3),
  route_dest      char(3),
  blog_slug       text,
  clicked_at      timestamptz NOT NULL DEFAULT now(),
  user_session_id text,
  user_ip_hash    text,        -- SHA-256 of IP, not raw IP
  user_agent      text
);

-- Indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_partner      ON affiliate_clicks (partner);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_placement    ON affiliate_clicks (placement);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_clicked_at   ON affiliate_clicks (clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_route        ON affiliate_clicks (route_passport, route_dest);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_partner_day  ON affiliate_clicks (partner, date_trunc('day', clicked_at));

-- Enable Row Level Security (admins use service role key, so this blocks anon reads)
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (used by our API routes)
-- No policy needed for service role — it bypasses RLS by default

-- Optional: allow anon INSERT (clicks happen without auth)
-- We INSERT via service role key on the server, so this is not strictly needed
-- but included for flexibility.
CREATE POLICY "allow_insert" ON affiliate_clicks
  FOR INSERT
  WITH CHECK (true);

-- ─── Convenience view for dashboard ────────────────────────────────────────────
CREATE OR REPLACE VIEW affiliate_clicks_daily AS
  SELECT
    date_trunc('day', clicked_at) AS day,
    partner,
    placement,
    route_passport,
    route_dest,
    count(*) AS clicks
  FROM affiliate_clicks
  GROUP BY 1, 2, 3, 4, 5
  ORDER BY 1 DESC, 6 DESC;
