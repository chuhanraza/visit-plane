-- Replace blanket "authenticated" read access on email_subscribers with
-- admin-gated access, matching flows/flow_steps/flow_runs/marketing_events.
-- Previously any logged-in Supabase Auth user (not just admins) could read
-- every subscriber's email/IP/user-agent via the "allow auth read" policy.
drop policy if exists "allow auth read" on public.email_subscribers;

create policy "email_subscribers_admin_select"
  on public.email_subscribers
  for select
  to authenticated
  using (is_app_admin());
