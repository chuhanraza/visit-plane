-- ──────────────────────────────────────────────────────────────────────────────
-- SEO Generation Jobs
-- Tracks bulk Gemini content generation batches (launch phases 1–4)
-- ──────────────────────────────────────────────────────────────────────────────

create table if not exists public.seo_generation_jobs (
  id            text        primary key,
  phase         int2        not null check (phase between 1 and 4),
  total_routes  int4        not null default 0,
  completed     int4        not null default 0,
  failed        int4        not null default 0,
  status        text        not null default 'running' check (status in ('running','done','error','cancelled')),
  error         text,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  updated_at    timestamptz not null default now()
);

-- Index for dashboard queries
create index if not exists seo_generation_jobs_started_at_idx
  on public.seo_generation_jobs (started_at desc);

-- RLS: service_role only (no public access to job data)
alter table public.seo_generation_jobs enable row level security;

create policy "service_role_all_jobs"
  on public.seo_generation_jobs
  for all
  using     (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists seo_generation_jobs_updated_at on public.seo_generation_jobs;
create trigger seo_generation_jobs_updated_at
  before update on public.seo_generation_jobs
  for each row execute procedure public.set_updated_at();
