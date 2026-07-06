-- The flight_delay_page migration (20260707_affiliate_clicks_placement_flight_delay.sql)
-- widened the placement CHECK constraint to allow 'flight_delay_page' but missed the
-- separate partner CHECK constraint, which still only allowed the original 6 partners.
-- Every /go/airhelp click from /flight-compensation silently failed to log (insert
-- swallowed by the existing try/catch, so the redirect itself kept working — only
-- attribution was lost). Caught during live verification. Additive only: widens the
-- allowed set, drops nothing.

ALTER TABLE affiliate_clicks DROP CONSTRAINT affiliate_clicks_partner_check;
ALTER TABLE affiliate_clicks ADD CONSTRAINT affiliate_clicks_partner_check
  CHECK (partner = ANY (ARRAY['safetywing'::text, 'heymondo'::text, 'airalo'::text, 'saily'::text, 'wayaway'::text, 'kiwi'::text, 'airhelp'::text]));
