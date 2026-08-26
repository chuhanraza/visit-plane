-- ════════════════════════════════════════════════════════════════════════════
-- Destination photo library — cached country photos for the 15-cheapest-
-- countries blog template (Phase 1: this template only, not the full
-- 197-nationality matrix). ADDITIVE only. Named destination_photo_* to avoid
-- colliding with the existing public.destinations table (73k-row passport×
-- country visa dataset — unrelated to this photo pipeline).
--
-- Read model: destination_photo_countries is not sensitive (country name,
-- region, a rounded daily-cost estimate) so anon may SELECT it directly for
-- public blog rendering. destination_photos carries provider/attribution
-- metadata and a human review gate (is_active) — anon may SELECT only rows
-- that have cleared review; writes are service-role/admin only via RLS.
-- Applied to project wmoywcqadkjxujgwduup.
-- ════════════════════════════════════════════════════════════════════════════

-- 1) Country dimension for the photo pipeline.
create table if not exists public.destination_photo_countries (
  id                  uuid primary key default gen_random_uuid(),
  country_code        text not null unique,   -- ISO 3166-1 alpha-2, e.g. 'TH'
  country_name        text not null unique,   -- canonical display name, e.g. 'Thailand'
  region               text,                   -- e.g. 'Southeast Asia'
  avg_daily_cost_usd  numeric,                -- rounded budget-traveller daily estimate
  created_at          timestamptz not null default now()
);

comment on table public.destination_photo_countries is
  'Country dimension for the cached destination-photo pipeline (15-cheapest-countries template, Phase 1). Not the visa-rules dataset — see public.destinations / public.visa_requirements for that.';

-- 2) Cached photos per country. One country can have several candidates;
--    is_primary marks the one currently shown, is_active marks it as having
--    cleared the human review gate (Task 5 admin review page).
create table if not exists public.destination_photos (
  id                    uuid primary key default gen_random_uuid(),
  destination_id        uuid not null references public.destination_photo_countries(id) on delete cascade,
  provider              text not null check (provider in ('unsplash', 'pexels')),
  provider_asset_id     text not null,
  image_url             text not null,          -- provider CDN URL with resize params, hotlinked (never re-hosted)
  download_tracking_url text,                    -- Unsplash download_location endpoint (fired once at ingestion)
  width                 int,
  height                int,
  blurhash              text,
  photographer_name     text,
  photographer_url      text,
  is_primary            boolean not null default false,
  is_active             boolean not null default false,  -- flips true only after admin approval (Task 5)
  created_at            timestamptz not null default now(),
  unique (provider, provider_asset_id)
);

create index if not exists destination_photos_destination_idx on public.destination_photos (destination_id);
create index if not exists destination_photos_active_idx on public.destination_photos (destination_id, is_active, is_primary);

comment on table public.destination_photos is
  'Cached Unsplash/Pexels photo candidates per destination country. is_active gates public display (human review required before a photo goes live — see /admin/social-pattern review UI).';

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.destination_photo_countries enable row level security;
alter table public.destination_photos           enable row level security;

-- Countries table: harmless metadata, safe to read publicly for card rendering.
drop policy if exists p_destination_photo_countries_read on public.destination_photo_countries;
create policy p_destination_photo_countries_read on public.destination_photo_countries
  for select to anon, authenticated using (true);

drop policy if exists p_destination_photo_countries_admin on public.destination_photo_countries;
create policy p_destination_photo_countries_admin on public.destination_photo_countries
  for all to authenticated using (public.is_app_admin()) with check (public.is_app_admin());

-- Photos table: public may read only photos that cleared review; everything
-- else (insert/update/delete, and reading unapproved rows) is admin-only.
drop policy if exists p_destination_photos_read_active on public.destination_photos;
create policy p_destination_photos_read_active on public.destination_photos
  for select to anon, authenticated using (is_active = true);

drop policy if exists p_destination_photos_admin on public.destination_photos;
create policy p_destination_photos_admin on public.destination_photos
  for all to authenticated using (public.is_app_admin()) with check (public.is_app_admin());
