-- ─────────────────────────────────────────────────────────────────────────────
-- email_subscribers — high-intent traveler email list
-- Run once in Supabase SQL editor or via `supabase db push`
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.email_subscribers (
  id                bigserial primary key,
  email             text        not null,
  route_passport    text,
  route_destination text,
  captured_at       timestamptz not null default now(),
  captured_from     text        not null default 'unknown',
  unsubscribe_token text        not null,
  consent_at        timestamptz,
  ip_address        text,
  user_agent        text,
  unique (email)
);

create index if not exists idx_email_sub_captured_from on public.email_subscribers (captured_from);
create index if not exists idx_email_sub_captured_at   on public.email_subscribers (captured_at desc);
create index if not exists idx_email_sub_route         on public.email_subscribers (route_passport, route_destination);

alter table public.email_subscribers enable row level security;

drop policy if exists "allow public insert" on public.email_subscribers;
create policy "allow public insert"
  on public.email_subscribers
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "allow auth read" on public.email_subscribers;
create policy "allow auth read"
  on public.email_subscribers
  for select
  to authenticated
  using (true);
