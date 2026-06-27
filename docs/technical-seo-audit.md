# VisitPlane — Technical SEO Audit (Phase 1)

**Date:** 2026-06-27
**Auditor:** Principal technical-SEO engineer (sprint: technical SEO + link-worthy data pages)
**Scope:** Crawlability, indexing, structured data, internal linking, metadata, performance.
**Method:** Live-site checks (`robots.txt`, `sitemap.xml`) + full source read of `app/`, `lib/`, `components/`.

> **Context:** VisitPlane is a YMYL site recovering from a past content-farm penalty. Prior
> sprints already pruned doorway clones (301), noindexed dead pages, fixed the 500-route bug
> (pretty URLs → `/seo/*` via `next.config.mjs` rewrites), shipped a site-wide honesty
> disclaimer + official-source links, and built E-E-A-T author/editorial pages. This audit
> therefore finds the site in **good baseline health** — the gaps below are refinements, not
> emergencies. Nothing here recommends pruning, noindexing, or touching verified visa data.

---

## 0. Verdict at a glance

| Area | Status | Notes |
|---|---|---|
| robots.txt | ✅ Correct | References both sitemaps + host; blocks `/api/`, `/_next/`, app-like `/passport-scanner`. |
| Sitemap validity | ✅ Valid | 1,934 URLs in `sitemap.xml` + blog sitemap; excludes noindexed + 301'd slugs. |
| Sitemap lastmod | ⚠️ Minor | Most static/programmatic URLs use `new Date()` (today) every regen — not true lastmod. |
| Canonicals | ⚠️ 4 gaps | `visa-requirements`, `how-it-works`, `travel-insurance`, `visa-vault` lack a canonical. |
| Structured data | ✅ Broad, ⚠️ 2 gaps | Blog, visa, all 6 SEO templates, destinations, authors, interview-prep covered. **Homepage** + **/faq** + **tool breadcrumbs** missing schema. |
| Metadata (title/desc/OG) | ✅ Strong | `template:"%s"` (single suffix) correct; tool pages use sibling `layout.tsx` metadata. 2 server pages lack their own title/desc. |
| Internal linking / orphans | ✅ 0 orphans expected | Programmatic interlinking + footer + breadcrumbs. New data pages (Phase 4) must be linked in. |
| Performance / CWV | ⚠️ Opportunities | Homepage is a large `'use client'` bundle; `next/image` usage uneven; two 300 KB identical logo PNGs. |

---

## 1. Crawlability

### 1.1 robots.txt — ✅ correct
`app/robots.ts` emits (verified live):
- `User-Agent: *` → allow `/`, disallow `/api/`, `/_next/`, `/passport-scanner`.
- `User-Agent: Googlebot` → allow `/`, disallow `/api/`, `/_next/` (intentionally lets Googlebot
  see `/passport-scanner` shell — harmless, it's an app tool).
- `Host:` + both `Sitemap:` lines present. **No action needed.**

### 1.2 Sitemaps — ✅ valid, well-structured
- `app/sitemap.ts` (dynamic, `force-dynamic`, `revalidate=86400`) emits **1,934 URLs**: static pages,
  blog posts (filtered against `noindexedPostSet` + `redirectedSlugSet`), blog taxonomy, all 4
  programmatic templates (incl. published rows from `seo_page_content`), legacy visa pages, and
  destination hubs. **Deduped by URL** at the end. This is correct and defensive.
- `app/sitemap-blog.xml` is a second, static blog sitemap. Both are referenced in robots.
- **Honesty checks pass:** noindexed + 301-redirected slugs are excluded from `sitemap.xml`. ✅

**Findings:**
- **F-1 (low):** `lastModified: new Date()` is used for nearly all static + programmatic entries, so
  every regeneration stamps *today* as the change date even when content didn't change. Google
  largely ignores `lastmod` it learns to distrust. Blog posts correctly use `post.date`; published
  SEO rows correctly use `updated_at`. → *Phase 2: use a stable build/`updated_at` date for static
  and template entries instead of `new Date()`.*
- **F-2 (low):** A single 1,934-URL sitemap is within the 50k/50 MB limit, so a sitemap **index** is
  not strictly required yet, but adding `sitemap-blog.xml` as a sibling already approximates one. As
  the corpus grows past ~10k, split by type (pages/blog/programmatic) under an index. *Not urgent.*

---

## 2. Indexing & canonicals

### 2.1 Global directives — ✅
`app/layout.tsx` sets `robots: {index:true, follow:true, googleBot:{max-image-preview:large,…}}`,
`metadataBase`, Google Search Console verification token, and a default canonical
(`https://www.visitplane.com`). `template: "%s"` is correct — page titles already carry their own
`| VisitPlane` suffix, so the template must **not** double it. ✅

### 2.2 Canonical coverage — ⚠️ 4 gaps
Most pages set `alternates.canonical` (blog, visa, all SEO templates, destinations, and the 11 tool
pages that ship a sibling `layout.tsx`). **Missing canonical / own metadata:**

| Page | Type | Problem |
|---|---|---|
| `app/visa-requirements/page.tsx` | server | No `metadata` export at all → inherits the generic default title + **no canonical**. |
| `app/how-it-works/page.tsx` | server | No `metadata` export → generic default title + **no canonical**. |
| `app/travel-insurance/page.tsx` | client | No sibling `layout.tsx` → **no canonical**, no unique title/desc. |
| `app/visa-vault/page.tsx` | client | No sibling `layout.tsx` → **no canonical**, no unique title/desc. |

→ *Phase 2: add `metadata` (title/desc/canonical/OG) to the two server pages and a sibling
`layout.tsx` for the two client pages.*

### 2.3 hreflang — N/A (by design)
The site ships `next-intl` but serves one indexable locale (en) for SEO; RTL handling is cosmetic.
No hreflang cluster is needed for the current single-language indexable surface. No action.

---

## 3. Structured data (JSON-LD)

**Correction to a common assumption:** all six `/seo/*` programmatic templates **already emit JSON-LD**
(verified: 2–3 `application/ld+json` blocks each — BreadcrumbList + FAQPage/Article). They are *not* a gap.

### 3.1 Coverage matrix

| Page type | Schemas present | Source |
|---|---|---|
| Root (all pages) | Organization, WebSite (+SearchAction), WebApplication | `app/layout.tsx` |
| Blog post | BlogPosting, BreadcrumbList, FAQPage (conditional) | `app/blog/[slug]` |
| Visa detail | BreadcrumbList, HowTo, FAQPage | `app/visa/[passport]/[destination]` |
| SEO route / req / guide | BreadcrumbList + Article/FAQPage | `app/seo/route`, `/req`, `/guide` |
| SEO cheapest / req-nat / visa-free | BreadcrumbList + FAQPage/Article | `app/seo/cheapest`, `/req-nat`, `/visa-free` |
| Destinations index + country | ItemList | `app/destinations/*` |
| Author (E-E-A-T) | Person | `app/authors/*` + `lib/data/authors.ts` `authorPersonSchema()` |
| About | Organization | `app/about` |
| Editorial standards | WebPage | `app/editorial-standards` |
| Interview prep | FAQPage, BreadcrumbList | `app/interview-prep/[country]/[visaType]` |
| Wizard result | FAQPage | `app/wizard/result/[state]` |

### 3.2 Gaps — ⚠️

- **F-3 (medium):** **Homepage (`app/page.tsx`)** emits no page-specific schema. Org/WebSite/WebApp come
  from the layout (good), but the homepage has no `FAQPage` despite being the strongest rich-result
  candidate. → *Phase 2: add a homepage FAQPage (common visa questions) — server-rendered via a small
  JSON-LD injection so the `'use client'` page keeps a static schema block.*
- **F-4 (medium):** **`/faq` (`app/faq/page.tsx`)** is a client component with 10+ Q&A pairs but **no
  FAQPage JSON-LD** (its layout sets title/desc/canonical only). Clear rich-result miss. → *Phase 2:
  add FAQPage schema from the same Q&A source.*
- **F-5 (medium):** **`ToolBreadcrumb`** renders a visible Home › Tools › {Tool} trail on ~11 tool
  pages but emits **no BreadcrumbList JSON-LD**. (`BlogBreadcrumb` does emit it.) Adding it to the one
  shared component lights up breadcrumb rich results across every tool page at once. → *Phase 2.*
- **F-6 (low):** No centralized schema helper (`lib/seo/schema.ts`). Builders are inlined per page.
  Consolidating `breadcrumbList()`, `faqPage()`, `dataset()` reduces drift and powers Phase 4 cleanly.

### 3.3 Validity — ✅
Spot-read JSON-LD blocks are well-formed (objects → `JSON.stringify` → `dangerouslySetInnerHTML`), no
trailing commas, `@context`/`@type` present. No malformed JSON-LD found in source.

---

## 4. Internal linking & orphans

- Programmatic interlinking (`lib/seo/internalLinks.ts`), the site footer, `ToolBreadcrumb`,
  `BlogBreadcrumb`, and cross-template "related" blocks keep the proven winners linked. Prior sprint
  reported **0 orphans**; structurally this still holds (every sitemap URL is reachable from a hub).
- **F-7 (medium, forward-looking):** the **Phase 4 data pages are new** and will be orphaned unless we
  (a) add them to the sitemap, (b) link them from a "Visa Data & Research" hub / nav / footer, and
  (c) interlink them with the cheapest-countries winners and relevant `/visa/*` pages. Addressed in
  Phases 4–5.

---

## 5. Metadata

- **Titles:** `template:"%s"` + per-page `| VisitPlane` suffix → single suffix, no doubling. ✅ Unique
  per page-type via `generateMetadata`. The two server pages in §2.2 fall back to the generic default
  title (not unique) — fix in Phase 2.
- **Descriptions:** present + unique on blog, visa, SEO templates, destinations, and the tool pages
  with `layout.tsx`. Missing on the four §2.2 pages.
- **OG / Twitter:** site-wide defaults in layout; dynamic OG images via `/api/og` (per blog/SEO
  template) and `/api/og-default`. Twitter `summary_large_image`. ✅
- **Keywords meta:** present (ignored by Google; harmless). No action.

---

## 6. Performance / Core Web Vitals (signals from source)

This is a source-level read; field CWV should be confirmed in PageSpeed/CrUX. Signals:

- **F-8 (medium):** **Homepage is a large `'use client'` component** (`app/page.tsx`) pulling
  `framer-motion`, router, marquee, modals. Heavy client JS on the most-linked page risks LCP/INP on
  mid-range mobile. → *Phase 3: ensure below-the-fold/animation work is deferred; verify the marquee
  and carousels don't block LCP; keep any hero text server-rendered.*
- **F-9 (low):** **Duplicate 300 KB logo PNGs** — `public/logo.png` and `public/logo-v2.png` are byte-
  identical 307,644-byte files; the Org schema references `logo-v2.png`. Ship one optimized logo.
- **F-10 (medium):** **`next/image` usage is uneven.** Country/hero imagery in some components uses
  raw `<img>` or background images without width/height → CLS risk + no lazy-load/AVIF. → *Phase 3:
  convert above-list `<img>` to `next/image` with explicit dimensions; lazy-load below-the-fold.*
- **F-11 (low):** `next.config.mjs` `images.remotePatterns` allows Pexels/Unsplash but there's no
  `images.formats`/`deviceSizes` tuning. Defaults are fine; revisit only if image weight shows up.
- Fonts already use `display:'swap'` (good for CLS/LCP). GTM + Vercel Analytics load late. ✅

---

## 7. Phase 2–5 action list (derived from findings)

**Phase 2 (crawl/index/schema/metadata):**
1. F-2.2: add `metadata`+canonical to `visa-requirements`, `how-it-works`; add `layout.tsx`
   meta+canonical to `travel-insurance`, `visa-vault`.
2. F-3: homepage FAQPage JSON-LD. F-4: `/faq` FAQPage JSON-LD. F-5: BreadcrumbList in `ToolBreadcrumb`.
3. F-6: add `lib/seo/schema.ts` helpers (breadcrumbList/faqPage/dataset) and reuse.
4. F-1: replace `new Date()` lastmod for static/template sitemap entries with a stable date.
5. Confirm Organization + WebSite(+SearchAction) + Person are correct (they are) — verify only.

**Phase 3 (CWV/perf):** F-8 homepage JS, F-9 logo dedupe, F-10 `next/image` + dimensions + lazy-load.

**Phase 4 (link-worthy data pages):** build 3 accurate, schema'd, methodology-backed data resources
from VisitPlane's own data (Visa Cost Index, Passport Power / Visa-Free Access, Visa Document
Requirements Index — the verified routes). Add Dataset + Article + FAQ schema, sortable tables, light
SVG/CSS charts, honesty/limitations notes, internal links. Add to sitemap.

**Phase 5 (discoverability):** "Visa Data & Research" hub + nav/footer links; sitemap regen; final
coherence check.

---

## 8. Accuracy guardrails for Phase 4 (binding)

- Prefer **verified** data: `lib/data/officialRequirements.ts` (56 cited routes), `officialPortals.ts`,
  `visaFreeVerified.ts` (IATA-derived, dated, deduped ≤197 distinct countries).
- The curated `app/destinations/data.ts` fees/stays are **VisitPlane's own dataset** — present them as
  *"based on VisitPlane's dataset — verify specifics at the official source,"* use **ranges/patterns**,
  never a precise wrong number as fact. Keep the Sprint-17 disclaimer + official-source links on every
  data page.
- **No fabricated metrics, no auto-generated/bought backlinks, no link schemes.** These pages earn
  links by being genuinely citable — that is the only legitimate mechanism.
