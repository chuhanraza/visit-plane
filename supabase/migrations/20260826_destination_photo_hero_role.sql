-- ════════════════════════════════════════════════════════════════════════════
-- Extends the destination-photo pipeline (Phase 1: 15-cheapest-countries blog
-- template) with a "hero_iconic" role so the same review-gated infra can also
-- back one landmark hero photo per country on /visa/[passport]/[destination].
-- ADDITIVE only — no existing columns/rows touched, no RLS policy changes
-- needed (policies filter by row via is_active, not by column).
-- Applied to project wmoywcqadkjxujgwduup.
-- ════════════════════════════════════════════════════════════════════════════

do $$ begin
  if not exists (select 1 from pg_type where typname = 'destination_photo_role') then
    create type public.destination_photo_role as enum ('general_destination', 'hero_iconic');
  end if;
end $$;

alter table public.destination_photos
  add column if not exists role public.destination_photo_role not null default 'general_destination',
  add column if not exists landmark_caption text,
  add column if not exists focal_point_x numeric(3,2) not null default 0.50
    check (focal_point_x >= 0 and focal_point_x <= 1),
  add column if not exists focal_point_y numeric(3,2) not null default 0.50
    check (focal_point_y >= 0 and focal_point_y <= 1);

-- At most one LIVE hero_iconic photo per destination country.
drop index if exists idx_one_active_hero_per_destination;
create unique index idx_one_active_hero_per_destination
  on public.destination_photos (destination_id)
  where (role = 'hero_iconic' and is_active = true);

-- Widen destination_photo_countries from the 60-country blog seed to the
-- full 197-country visa-destination matrix. Computed directly against the
-- live `destinations` table (name-normalized: UAE -> United Arab Emirates,
-- Ivory Coast -> Côte d'Ivoire, Cape Verde -> Cabo Verde, Gambia -> The
-- Gambia, Sao Tome and Principe -> São Tomé & Príncipe, to avoid duplicate
-- country rows for names already seeded under a different spelling).
insert into public.destination_photo_countries (country_code, country_name) values
  ('AF','Afghanistan'),
  ('DZ','Algeria'),
  ('AD','Andorra'),
  ('AO','Angola'),
  ('AG','Antigua and Barbuda'),
  ('AR','Argentina'),
  ('AM','Armenia'),
  ('AU','Australia'),
  ('AT','Austria'),
  ('BS','Bahamas'),
  ('BH','Bahrain'),
  ('BD','Bangladesh'),
  ('BY','Belarus'),
  ('BE','Belgium'),
  ('BZ','Belize'),
  ('BA','Bosnia and Herzegovina'),
  ('BR','Brazil'),
  ('BI','Burundi'),
  ('CM','Cameroon'),
  ('CA','Canada'),
  ('CF','Central African Republic'),
  ('TD','Chad'),
  ('CL','Chile'),
  ('KM','Comoros'),
  ('CR','Costa Rica'),
  ('HR','Croatia'),
  ('CU','Cuba'),
  ('CY','Cyprus'),
  ('CZ','Czech Republic'),
  ('CD','Democratic Republic of the Congo'),
  ('DK','Denmark'),
  ('DJ','Djibouti'),
  ('DM','Dominica'),
  ('DO','Dominican Republic'),
  ('EC','Ecuador'),
  ('SV','El Salvador'),
  ('GQ','Equatorial Guinea'),
  ('ER','Eritrea'),
  ('EE','Estonia'),
  ('FI','Finland'),
  ('FR','France'),
  ('GA','Gabon'),
  ('DE','Germany'),
  ('GR','Greece'),
  ('GD','Grenada'),
  ('GN','Guinea'),
  ('GW','Guinea-Bissau'),
  ('GY','Guyana'),
  ('HT','Haiti'),
  ('HN','Honduras'),
  ('HU','Hungary'),
  ('IS','Iceland'),
  ('IR','Iran'),
  ('IQ','Iraq'),
  ('IE','Ireland'),
  ('IL','Israel'),
  ('IT','Italy'),
  ('JM','Jamaica'),
  ('JP','Japan'),
  ('KZ','Kazakhstan'),
  ('KI','Kiribati'),
  ('XK','Kosovo'),
  ('KW','Kuwait'),
  ('LV','Latvia'),
  ('LB','Lebanon'),
  ('LS','Lesotho'),
  ('LR','Liberia'),
  ('LY','Libya'),
  ('LI','Liechtenstein'),
  ('LT','Lithuania'),
  ('LU','Luxembourg'),
  ('MG','Madagascar'),
  ('MW','Malawi'),
  ('ML','Mali'),
  ('MT','Malta'),
  ('MH','Marshall Islands'),
  ('MR','Mauritania'),
  ('FM','Micronesia'),
  ('MD','Moldova'),
  ('MC','Monaco'),
  ('MN','Mongolia'),
  ('ME','Montenegro'),
  ('MZ','Mozambique'),
  ('NA','Namibia'),
  ('NR','Nauru'),
  ('NL','Netherlands'),
  ('NZ','New Zealand'),
  ('NI','Nicaragua'),
  ('NE','Niger'),
  ('KP','North Korea'),
  ('MK','North Macedonia'),
  ('NO','Norway'),
  ('OM','Oman'),
  ('PK','Pakistan'),
  ('PW','Palau'),
  ('PS','Palestine'),
  ('PA','Panama'),
  ('PG','Papua New Guinea'),
  ('PY','Paraguay'),
  ('PL','Poland'),
  ('CG','Republic of the Congo'),
  ('RO','Romania'),
  ('RU','Russia'),
  ('KN','Saint Kitts and Nevis'),
  ('LC','Saint Lucia'),
  ('VC','Saint Vincent and the Grenadines'),
  ('WS','Samoa'),
  ('SM','San Marino'),
  ('SA','Saudi Arabia'),
  ('RS','Serbia'),
  ('SK','Slovakia'),
  ('SI','Slovenia'),
  ('SB','Solomon Islands'),
  ('SO','Somalia'),
  ('KR','South Korea'),
  ('SS','South Sudan'),
  ('ES','Spain'),
  ('SD','Sudan'),
  ('SR','Suriname'),
  ('SZ','Swaziland'),
  ('SE','Sweden'),
  ('CH','Switzerland'),
  ('SY','Syria'),
  ('TW','Taiwan'),
  ('TJ','Tajikistan'),
  ('TO','Tonga'),
  ('TT','Trinidad and Tobago'),
  ('TM','Turkmenistan'),
  ('TV','Tuvalu'),
  ('UA','Ukraine'),
  ('GB','United Kingdom'),
  ('US','United States'),
  ('UY','Uruguay'),
  ('UZ','Uzbekistan'),
  ('VU','Vanuatu'),
  ('VE','Venezuela'),
  ('YE','Yemen')
on conflict (country_code) do nothing;
