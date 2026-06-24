-- ════════════════════════════════════════════════════════════════════════════
-- Operator Admin Backend — Phase 1 schema
-- Applied to project wmoywcqadkjxujgwduup via Supabase MCP (mirror kept here).
-- Additive only. RLS on every new table; anon/public reads NOTHING.
-- Admin access via service-role (bypasses RLS) behind requireAdmin*, plus
-- explicit app_admins-scoped policies for the Supabase-Auth admin path.
-- ════════════════════════════════════════════════════════════════════════════

-- Helper: is the current Supabase-Auth user an app admin?
create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.app_admins where user_id = auth.uid());
$$;

revoke all on function public.is_app_admin() from public, anon;
grant execute on function public.is_app_admin() to authenticated;

-- ── affiliate_partners ───────────────────────────────────────────────────────
create table if not exists public.affiliate_partners (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  type            text not null default 'other'
                    check (type in ('insurance','esim','flights','other')),
  commission_rate numeric not null default 0 check (commission_rate >= 0),
  commission_model text,
  tracking_link   text,
  active          boolean not null default true,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
alter table public.affiliate_partners enable row level security;

-- ── affiliate_conversions ────────────────────────────────────────────────────
create table if not exists public.affiliate_conversions (
  id                uuid primary key default gen_random_uuid(),
  partner_slug      text not null,
  click_id          uuid references public.affiliate_clicks(id) on delete set null,
  external_ref      text,
  customer_email    text,
  amount            numeric not null default 0 check (amount >= 0),
  currency          char(3) not null default 'USD',
  commission_amount numeric not null default 0 check (commission_amount >= 0),
  status            text not null default 'pending'
                      check (status in ('pending','confirmed','paid','rejected')),
  source            text,
  note              text,
  occurred_at       timestamptz not null default now(),
  created_at        timestamptz not null default now()
);
create index if not exists affiliate_conversions_partner_idx on public.affiliate_conversions(partner_slug);
create index if not exists affiliate_conversions_status_idx  on public.affiliate_conversions(status);
alter table public.affiliate_conversions enable row level security;

-- ── manual_orders (manual/affiliate revenue ledger; payments stay OFF) ───────
create sequence if not exists public.manual_order_ref_seq;
create table if not exists public.manual_orders (
  id                uuid primary key default gen_random_uuid(),
  order_ref         text not null unique
                      default ('MO-' || to_char(now(),'YYYY') || '-' ||
                               lpad(nextval('public.manual_order_ref_seq')::text, 5, '0')),
  customer_email    text not null,
  product_type      text not null default 'other'
                      check (product_type in ('evisa','affiliate','consulting','other')),
  amount            numeric not null default 0 check (amount >= 0),
  currency          char(3) not null default 'USD',
  status            text not null default 'pending'
                      check (status in ('pending','paid','refunded','cancelled')),
  affiliate_partner text,
  commission_amount numeric not null default 0 check (commission_amount >= 0),
  source            text,
  notes             text,
  created_at        timestamptz not null default now(),
  fulfilled_at      timestamptz
);
create index if not exists manual_orders_status_idx on public.manual_orders(status);
alter table public.manual_orders enable row level security;

-- ── app_settings (feature flags incl. payments-off) ──────────────────────────
create table if not exists public.app_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_by text,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;

insert into public.app_settings (key, value) values
  ('payments_enabled', 'false'::jsonb),
  ('email_broadcasts_enabled', 'false'::jsonb)
on conflict (key) do nothing;

-- ── email_subscribers enrichment (operator tags + note) ──────────────────────
alter table public.email_subscribers
  add column if not exists admin_tags text[] not null default '{}',
  add column if not exists admin_note text;

-- ── RLS policies: app_admins (authenticated) only; anon gets nothing ─────────
do $$
declare t text;
begin
  foreach t in array array[
    'affiliate_partners','affiliate_conversions','manual_orders','app_settings'
  ] loop
    execute format('drop policy if exists %I on public.%I;', t||'_admin_all', t);
    execute format(
      'create policy %I on public.%I for all to authenticated
         using (public.is_app_admin()) with check (public.is_app_admin());',
      t||'_admin_all', t);
  end loop;
end $$;
