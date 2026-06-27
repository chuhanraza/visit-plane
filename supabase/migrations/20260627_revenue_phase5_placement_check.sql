-- Revenue sprint Phase 5 fix: the affiliate_clicks.placement CHECK only allowed
-- the original 5 values, so the new placements (cheapest_page, route_page,
-- itinerary, email_sequence) were silently rejected and those clicks were dropped.
-- Expand the constraint (additive). Applied to project wmoywcqadkjxujgwduup.

ALTER TABLE public.affiliate_clicks DROP CONSTRAINT IF EXISTS affiliate_clicks_placement_check;
ALTER TABLE public.affiliate_clicks ADD CONSTRAINT affiliate_clicks_placement_check
  CHECK (placement = ANY (ARRAY[
    'visa_page','blog_post','homepage','checkout_flow','email',
    'email_sequence','cheapest_page','route_page','itinerary'
  ]::text[]));
