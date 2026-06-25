-- ════════════════════════════════════════════════════════════════════════════
-- Operator Backend v2–v4 schema (mirror of migrations applied via Supabase MCP).
-- Additive. RLS on every table; anon denied; admin via service-role + the
-- app_admins-scoped policy using public.is_app_admin(). Idempotent.
-- ════════════════════════════════════════════════════════════════════════════

-- ── v2: saved reports / analytics views ──────────────────────────────────────
create table if not exists public.saved_reports (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null default 'analytics' check (kind in ('analytics','leads','revenue','custom')),
  config jsonb not null default '{}'::jsonb,
  created_by text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- ── v2: developer platform ───────────────────────────────────────────────────
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  name text not null, key_prefix text not null, key_hash text not null unique,
  scopes text[] not null default '{}', active boolean not null default true,
  created_by text, created_at timestamptz not null default now(),
  last_used_at timestamptz, revoked_at timestamptz
);
create table if not exists public.webhook_endpoints (
  id uuid primary key default gen_random_uuid(),
  url text not null, events text[] not null default '{}', secret text not null,
  active boolean not null default true, description text, created_at timestamptz not null default now()
);
create table if not exists public.webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  endpoint_id uuid references public.webhook_endpoints(id) on delete cascade,
  event text not null, payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','success','failed')),
  response_code integer, error text, attempts integer not null default 0,
  created_at timestamptz not null default now(), delivered_at timestamptz
);

-- ── v2: marketing event spine + segments + flows ─────────────────────────────
create table if not exists public.marketing_metrics (
  id uuid primary key default gen_random_uuid(), name text not null unique, created_at timestamptz not null default now()
);
create table if not exists public.marketing_events (
  id uuid primary key default gen_random_uuid(),
  email text, metric text not null, properties jsonb not null default '{}'::jsonb,
  value numeric, occurred_at timestamptz not null default now(),
  unique_id text, backfill boolean not null default false, created_at timestamptz not null default now()
);
create unique index if not exists marketing_events_idem on public.marketing_events(email, metric, unique_id) where unique_id is not null;
create table if not exists public.marketing_segments (
  id uuid primary key default gen_random_uuid(), name text not null,
  definition jsonb not null default '{}'::jsonb, created_by text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.flows (
  id uuid primary key default gen_random_uuid(), name text not null,
  trigger_type text not null default 'lead.created' check (trigger_type in ('lead.created')),
  trigger_config jsonb not null default '{}'::jsonb, active boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.flow_steps (
  id uuid primary key default gen_random_uuid(), flow_id uuid not null references public.flows(id) on delete cascade,
  position integer not null default 0, delay_minutes integer not null default 0 check (delay_minutes >= 0),
  subject text not null, body text not null, created_at timestamptz not null default now()
);
create table if not exists public.flow_runs (
  id uuid primary key default gen_random_uuid(), flow_id uuid not null references public.flows(id) on delete cascade,
  email text not null, current_step integer not null default 0,
  status text not null default 'active' check (status in ('active','completed','cancelled')),
  next_action_at timestamptz not null default now(), enrolled_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), unique (flow_id, email)
);

-- ── v2: RBAC columns on the admin allowlist ──────────────────────────────────
alter table public.app_admins
  add column if not exists role text not null default 'admin' check (role in ('owner','admin','analyst','support','viewer')),
  add column if not exists permissions jsonb not null default '{}'::jsonb,
  add column if not exists email text;

-- ── v4: threshold alert rules ────────────────────────────────────────────────
create table if not exists public.alert_rules (
  id uuid primary key default gen_random_uuid(), name text not null,
  metric text not null check (metric in ('leads_today','pending_corrections','pending_optins','failed_webhooks_24h','active_flow_runs')),
  op text not null check (op in ('gt','gte','lt','lte')), threshold numeric not null default 0,
  active boolean not null default true, last_triggered_at timestamptz, created_at timestamptz not null default now()
);

-- ── RLS: enable + app_admins-scoped policy on every table above ───────────────
do $$
declare t text;
begin
  foreach t in array array[
    'saved_reports','api_keys','webhook_endpoints','webhook_deliveries',
    'marketing_metrics','marketing_events','marketing_segments',
    'flows','flow_steps','flow_runs','alert_rules'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists %I on public.%I;', t||'_admin_all', t);
    execute format(
      'create policy %I on public.%I for all to authenticated
         using (public.is_app_admin()) with check (public.is_app_admin());', t||'_admin_all', t);
  end loop;
end $$;
