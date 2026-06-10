# AUDIT_SPRINT1.md — /destinations Sprint Audit

Generated: 2026-06-10

---

## Summary

The `/destinations` page already exists with a complete implementation.
The **only missing piece causing 404s** is `/destinations/[country]` (e.g., `/destinations/UAE`).

---

## A) Every internal link containing "/destinations"

| File | Line(s) | Context |
|---|---|---|
| `components/layout/SiteHeader.tsx` | 176, 353 | Desktop nav + mobile nav: `href="/destinations"` |
| `components/layout/SiteFooter.tsx` | 17 | PRODUCT_LINKS: `{ label: 'Destinations', href: '/destinations' }` |
| `app/page.tsx` | 922, 1074, 1227 | "View all" link, "Browse all 197 destinations" CTA, hero CTA |
| `app/visa/[passport]/[destination]/page.tsx` | 183–186, 283–287 | JSON-LD breadcrumb + visual breadcrumb: `href="/destinations"` and `href="/destinations/${destinationSlug}"` |
| `components/layout/SiteHeader.tsx` | 65 | SmartCTA: `router.push('/destinations?passport=...')` |
| `app/sitemap.ts` | (references /destinations) | Sitemap entry |

### 404 Sources
- `/destinations` — **RESOLVED** (page exists: `app/destinations/page.tsx`)
- `/destinations/UAE`, `/destinations/Turkey`, etc. — **MISSING** (`app/destinations/[country]/` folder does not exist)

---

## B) Visa data records

- **Primary data**: `app/destinations/DestinationsClient.tsx` — `ALL_COUNTRIES` array (197 countries, hardcoded, includes: name, flag, region, visa, max_stay, fee_usd, alt, popular)
- **Live data**: Supabase `destinations` table — queried in `app/visa/[passport]/[destination]/page.tsx` with columns: `passport_country`, `country_name`, `visa_type`, `price/fee/cost`, `processing_time`
- **lib/data/**: Does not exist. All data lives in `app/destinations/DestinationsClient.tsx`.

## C) CountryCard component

No separate `CountryCard` component exists. Cards are rendered inline in `DestinationsClient.tsx` (lines 555–605) as `<Link>` elements.

## D) SiteHeader + SiteFooter locations

- `components/layout/SiteHeader.tsx` — canonical site header, already links to `/destinations`
- `components/layout/SiteFooter.tsx` — canonical site footer, already links to `/destinations`

---

## Status: What's built vs. what's missing

| Route | Status | File |
|---|---|---|
| `/destinations` | ✅ Built | `app/destinations/page.tsx` + `DestinationsClient.tsx` |
| `/destinations/[country]` | ❌ MISSING | Needs `app/destinations/[country]/page.tsx` |
| PassportSwitcher | ✅ Built | `components/PassportSwitcher.tsx` |
| useUserCountry hook | ✅ Built | `hooks/useUserCountry.ts` |
| fuse.js | Not used — manual filtering implemented | n/a |

---

## Action

**Only Phase 4 is needed**: Create `app/destinations/[country]/page.tsx` to fix breadcrumb 404s.
All other phases (2, 3, 5, 6, 7, 8) are already complete.
