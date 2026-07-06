-- Add 'flight_delay_page' to the affiliate_clicks placement check constraint —
-- used by the new /flight-compensation tool's /go/airhelp CTA (dark/placeholder
-- partner, see src/lib/affiliates.ts). Additive only — widens the allowed set,
-- drops nothing, no rows touched. Mirrors 20260706_affiliate_clicks_placement_req_guide.sql.

ALTER TABLE public.affiliate_clicks
  DROP CONSTRAINT IF EXISTS affiliate_clicks_placement_check;

ALTER TABLE public.affiliate_clicks
  ADD CONSTRAINT affiliate_clicks_placement_check
  CHECK (placement = ANY (ARRAY[
    'visa_page'::text, 'blog_post'::text, 'homepage'::text, 'checkout_flow'::text,
    'email'::text, 'email_sequence'::text, 'cheapest_page'::text, 'route_page'::text,
    'itinerary'::text, 'req_page'::text, 'guide_page'::text, 'flight_delay_page'::text
  ]));
