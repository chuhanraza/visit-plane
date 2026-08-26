-- Human-review tracking for `destinations` rows whose duplicates disagree on
-- visa_type itself (the 5,319-pair issue flagged in visa-data-review.md §2).
-- Additive only: no existing table/column touched, no row deleted or altered.
create table if not exists destination_conflict_resolutions (
  id             bigint generated always as identity primary key,
  passport_country text not null,
  country_name      text not null,
  decision       text not null check (decision in ('kept_row', 'needs_research', 'flagged_corrupt')),
  kept_row_id    bigint references destinations(id) on delete set null,
  note           text,
  resolved_by    text not null,
  resolved_at    timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (passport_country, country_name)
);

alter table destination_conflict_resolutions enable row level security;
-- No policies added: anon/public gets zero access; only the service-role
-- client (used server-side, behind requireAdmin/requireAdminApi) can read or write.

-- Precomputes the conflicting pairs (same passport+destination, >1 distinct
-- visa_type across duplicate rows) so the admin page doesn't scan 73k rows
-- per request. Read-only view — never changes underlying data.
create or replace view destination_visa_type_conflicts as
select
  d.passport_country,
  d.country_name,
  count(*)                          as row_count,
  count(distinct d.visa_type)       as distinct_type_count,
  array_agg(distinct d.visa_type)   as visa_types
from destinations d
group by d.passport_country, d.country_name
having count(distinct d.visa_type) > 1;
