-- Widen affiliate_clicks CHECK constraints for the three previously-unmonetized
-- ranking templates gaining a TripEssentials decision-point block:
--   'visa_free_page'   → /seo/visa-free/[nationality]   (197 pages)
--   'nat_hub_page'     → /seo/req-nat/[nationality]     (197 pages)
--   'destination_page' → /destinations/[country]        (197 pages)
-- Also adds 'ivisa' to the partner CHECK: the /go/ivisa route and the
-- TripEssentials card already exist in code (dark until approved), and the
-- airhelp incident (20260707_affiliate_clicks_partner_airhelp.sql) showed a
-- missing partner value silently swallows every click log. Additive only —
-- widens the allowed sets, drops nothing, no rows touched.

ALTER TABLE public.affiliate_clicks
  DROP CONSTRAINT IF EXISTS affiliate_clicks_placement_check;

ALTER TABLE public.affiliate_clicks
  ADD CONSTRAINT affiliate_clicks_placement_check
  CHECK (placement = ANY (ARRAY[
    'visa_page'::text, 'blog_post'::text, 'homepage'::text, 'checkout_flow'::text,
    'email'::text, 'email_sequence'::text, 'cheapest_page'::text, 'route_page'::text,
    'itinerary'::text, 'req_page'::text, 'guide_page'::text, 'flight_delay_page'::text,
    'visa_free_page'::text, 'nat_hub_page'::text, 'destination_page'::text
  ]));

ALTER TABLE public.affiliate_clicks
  DROP CONSTRAINT IF EXISTS affiliate_clicks_partner_check;

ALTER TABLE public.affiliate_clicks
  ADD CONSTRAINT affiliate_clicks_partner_check
  CHECK (partner = ANY (ARRAY[
    'safetywing'::text, 'heymondo'::text, 'airalo'::text, 'saily'::text,
    'wayaway'::text, 'kiwi'::text, 'airhelp'::text, 'ivisa'::text
  ]));
