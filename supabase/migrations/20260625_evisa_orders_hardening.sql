-- e-Visa schema hardening (applied after 20260625_evisa_orders_schema.sql)
-- Addresses Supabase security advisors for the new objects only.

-- Pin search_path on trigger functions (advisor: function_search_path_mutable)
ALTER FUNCTION public.evisa_touch_updated_at() SET search_path = public;
ALTER FUNCTION public.evisa_enforce_order_transition() SET search_path = public;

-- Split the services SELECT policy so the anon role never needs to call is_admin(),
-- then revoke EXECUTE on is_admin() from anon (advisor: anon_security_definer_function_executable).
DROP POLICY IF EXISTS p_services_public_read ON services;
CREATE POLICY p_services_anon_read ON services FOR SELECT TO anon USING (active = true);
CREATE POLICY p_services_auth_read ON services FOR SELECT TO authenticated USING (active = true OR is_admin());
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
