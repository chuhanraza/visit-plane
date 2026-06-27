# Technical SEO + Data-Pages Sprint — Summary

**Date:** 2026-06-27 · **Branch:** `main` · **Build:** green each phase · **Deploys:** Vercel READY per phase.

Two missions, one sprint: (1) tighten VisitPlane's crawlability / indexing / structured data /
performance, and (2) ship genuinely original, accurate, link-worthy data resources from VisitPlane's
own data. Additive only — no pruning, no noindex/redirect changes, no homepage/admin/E-E-A-T regressions,
no fabricated metrics, and **no manufactured backlinks** (links are earned by being worth citing).

Full diagnosis: [`docs/technical-seo-audit.md`](./technical-seo-audit.md).

---

## What shipped, by phase

### Phase 1 — Audit (`seo-tech phase1`)
Wrote `docs/technical-seo-audit.md`. Headline: the site was already in good health from prior sprints
(robots correct, 1,934-URL sitemap excluding noindexed/redirected slugs, all 6 programmatic `/seo/*`
templates already emitting JSON-LD, most tool pages already carrying `layout.tsx` metadata). Real gaps
were narrow and specific.

### Phase 2 — Crawl / index / schema / metadata (`seo-tech phase2`)
- **`lib/seo/schema.ts`** — shared, pure JSON-LD builders (`breadcrumbList`, `faqPage`, `dataset`,
  `article`) to stop per-page schema drift and power the data pages.
- **`/faq`** — added `FAQPage` JSON-LD from the visible Q&A (valid rich-result source).
- **`ToolBreadcrumb`** — now emits `BreadcrumbList` JSON-LD, lighting up breadcrumb rich results across
  all ~11 tool pages from one component.
- **`how-it-works`** — added unique title/description/canonical/OG (was inheriting the generic default).
- **`travel-insurance` + `visa-vault`** — added `layout.tsx` metadata + canonical (were missing both).
- **Sitemap** — dropped `/visa-requirements` (it 307-redirects to `/`, so it was a non-canonical
  redirect URL in the sitemap); replaced per-regeneration `new Date()` lastmod with a stable
  content-version date for static + template entries (blog/`updated_at` rows keep their real dates).
- Verified Organization + WebSite(+SearchAction) + WebApplication + Person schema already correct.

> Note: homepage `FAQPage` was intentionally **not** added — the homepage has no visible FAQ block, so
> the schema would be invalid/spammy. The layout-level Org/WebSite/WebApp covers it.

### Phase 3 — Core Web Vitals / performance (`seo-tech phase3`)
- **`layout`** — `preconnect` + `dns-prefetch` to `images.unsplash.com` (every destination card photo
  loads from there → warms TLS, faster LCP on image-heavy pages).
- **`DestinationImage`** — explicit `width`/`height` (600×400) to reserve aspect ratio and kill CLS
  (kept existing `loading="lazy"` + `decoding="async"`).
- **Removed `public/logo.png`** — a byte-identical 307 KB duplicate of `logo-v2.png` (the only logo
  actually referenced anywhere).
- Confirmed the image layer was already healthy (Unsplash `auto=format` WebP/AVIF at `w=600`, lazy +
  async, branded fallback, `next/image`+`priority` logo) — so we made safe wins rather than a risky
  refactor of the homepage client bundle. Orphans remain **0** (every URL reachable from footer + hubs).

### Phase 4 — Original-data, link-worthy pages (`seo-tech phase4`)
A `/visa-data` research hub + three citable datasets. Each has a sortable + filterable table (full data
server-rendered for crawlers; client only adds sorting), a CSS/SVG bar chart (no chart libs), a
**methodology + sources + limitations** section, the honesty disclaimer, and **Article + Dataset +
FAQPage + BreadcrumbList** schema. Author attribution to the real founder (E-E-A-T).

| Page | URL | Data source | Framing |
|---|---|---|---|
| Visa Cost Index 2026 | `/visa-data/visa-cost-index` | VisitPlane curated destination fees (195 destinations) | "Typical, destination-level, verify yours." Only unambiguous fees parsed numerically; non-fixed values excluded from aggregates. |
| Passport Power 2026 | `/visa-data/passport-power` | IATA-derived Passport Index (194 passports) | Sourced + dated; counts distinct no-advance-visa destinations only. |
| Visa Document Requirements Index | `/visa-data/document-requirements-index` | `officialRequirements.ts` — 55 official-source-cited routes (6 passports) | Most original; every row cites its official source + verified date and links to the live checklist. |

All headline stats derive dynamically from the source data — there are **no hardcoded numbers**, so the
prose can never drift from the data.

### Phase 5 — Discoverability (`seo-tech phase5`)
- Added **"Visa Data & Research"** to the site footer (Product column) → the hub is now linked from every
  page; the three datasets are linked from the hub, from each other, and from the proven
  cheapest-visas / visa-free winners and core tools. **0 orphans.**
- Sitemap includes the hub + 3 datasets (priority 0.85, weekly).
- Final coherence check: robots ↔ sitemaps cross-reference, schema validates, internal links resolve.

---

## Accuracy safeguards (YMYL)
- Verified/cited data preferred (`officialRequirements`, `officialPortals`, IATA-derived visa-free set).
- Curated dataset figures (fees) are framed as "VisitPlane's dataset — verify at the official source,"
  shown as ranges/medians, with non-fixed values excluded from aggregates. **No precise wrong number is
  presented as fact.** Sprint-17 honesty disclaimer + official-source links intact on the new pages.

---

## NEEDS HAMAD

1. **Resubmit the sitemap** in Google Search Console (`https://www.visitplane.com/sitemap.xml`) and
   request indexing for the four new URLs:
   - `https://www.visitplane.com/visa-data`
   - `https://www.visitplane.com/visa-data/visa-cost-index`
   - `https://www.visitplane.com/visa-data/passport-power`
   - `https://www.visitplane.com/visa-data/document-requirements-index`
2. **Validate rich results** for `/faq`, a tool page (e.g. `/checklist`), and the three data pages in
   Google's Rich Results Test — confirm FAQPage / BreadcrumbList / Dataset / Article parse cleanly.
3. **OUTREACH (this is how the backlinks are actually earned).** The data pages only become links when
   real publishers cite them. Pitch them to:
   - Travel bloggers and "digital nomad" / emerging-market-travel writers (Pakistan/India/Nigeria/
     Philippines audiences especially) — the Passport Power and Cost Index pages are the natural hooks.
   - Journalists covering visa-policy / passport-ranking stories — offer the dataset + methodology as a
     citable source (the Document Requirements Index is the most distinctive — nobody else publishes
     official-source-cited document counts per route).
   - Relevant subreddits / forums where people ask "how much does a visa cost" or "how strong is my
     passport" — link the specific page that answers it.
   Do **not** buy links, swap links, or use PBNs — that would re-risk the penalty recovery. Earned
   citations only.

> Optional next: add a real founder photo at `/public/authors/muhammad-hamad-ashraf.jpg` to strengthen
> the Person/E-E-A-T signal (currently an initials avatar by design — no fabricated photo).
