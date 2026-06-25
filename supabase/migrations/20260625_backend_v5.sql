-- ════════════════════════════════════════════════════════════════════════════
-- Operator Backend v5 — Shopify-parity gaps (mirror of MCP migrations). Additive.
-- (Discounts reuse the existing public.promo_codes table — no new table.)
-- ════════════════════════════════════════════════════════════════════════════

-- Email template editor
create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null unique, name text not null,
  kind text not null default 'marketing' check (kind in ('transactional','marketing')),
  subject text not null, body_html text not null,
  updated_by text, updated_at timestamptz not null default now(), created_at timestamptz not null default now()
);
alter table public.email_templates enable row level security;
drop policy if exists email_templates_admin_all on public.email_templates;
create policy email_templates_admin_all on public.email_templates
  for all to authenticated using (public.is_app_admin()) with check (public.is_app_admin());

-- Flows: allow a wizard.completed trigger (abandoned-wizard recovery)
alter table public.flows drop constraint if exists flows_trigger_type_check;
alter table public.flows add constraint flows_trigger_type_check
  check (trigger_type in ('lead.created','wizard.completed'));

-- (Scheduled digests use app_settings keys: digest_enabled / digest_frequency /
--  digest_recipient / digest_last_sent — no table.)
