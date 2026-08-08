-- Server-side capture for client error-boundary triggers (app/error.tsx,
-- app/global-error.tsx). Additive only. Lets us pull a real stack trace after
-- the fact instead of needing `wrangler tail` running at the exact moment an
-- "unexpected error" fires in production.

create table if not exists public.error_log (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  error_message  text not null,
  error_stack    text,
  error_digest   text,           -- Next.js error.digest (server-side error id)
  path           text,           -- route the boundary fired on, if known
  user_agent     text,
  is_bot         boolean not null default false,
  request_id     text            -- client-generated correlation hint
);

create index if not exists error_log_created_idx on public.error_log (created_at desc);
create index if not exists error_log_digest_idx   on public.error_log (error_digest);

alter table public.error_log enable row level security;

-- Writes only ever happen via service-role (app/api/log-client-error), which
-- bypasses RLS — no insert policy needed, and none is granted to anon/
-- authenticated. Reads are admin-only, reusing the is_app_admin() helper
-- from 20260625_admin_operator_backend_phase1.sql.
drop policy if exists error_log_admin_select on public.error_log;
create policy error_log_admin_select on public.error_log
  for select to authenticated
  using (public.is_app_admin());
