-- The TS-side AffiliatePlacement type gained 'req_page' / 'guide_page'
-- (Template 1 /seo/req + Template 4 /seo/guide affiliate placement), but the
-- DB-level check constraint was never updated to match — every click from
-- those two templates silently failed to log (redirect still worked; only
-- attribution was lost, since the insert error is caught by design).
-- Additive only — widens the allowed set, drops nothing, no rows touched.

ALTER TABLE public.affiliate_clicks
  DROP CONSTRAINT IF EXISTS affiliate_clicks_placement_check;

ALTER TABLE public.affiliate_clicks
  ADD CONSTRAINT affiliate_clicks_placement_check
  CHECK (placement = ANY (ARRAY[
    'visa_page'::text, 'blog_post'::text, 'homepage'::text, 'checkout_flow'::text,
    'email'::text, 'email_sequence'::text, 'cheapest_page'::text, 'route_page'::text,
    'itinerary'::text, 'req_page'::text, 'guide_page'::text
  ]));
