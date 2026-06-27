-- Revenue sprint Phase 1: enrich affiliate_clicks for attribution.
-- Additive only. RLS already enabled on affiliate_clicks (anon reads nothing;
-- service-role inserts via /go redirect). Applied to project wmoywcqadkjxujgwduup.

ALTER TABLE public.affiliate_clicks
  ADD COLUMN IF NOT EXISTS source_page text,   -- clean path the click came from (Referer or ?source=)
  ADD COLUMN IF NOT EXISTS country text;        -- ISO-2 from x-vercel-ip-country (no precise geo / PII)

CREATE INDEX IF NOT EXISTS affiliate_clicks_clicked_at_idx ON public.affiliate_clicks (clicked_at);
CREATE INDEX IF NOT EXISTS affiliate_clicks_partner_idx ON public.affiliate_clicks (partner);
CREATE INDEX IF NOT EXISTS affiliate_clicks_placement_idx ON public.affiliate_clicks (placement);
