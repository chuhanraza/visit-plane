# VisitPlane — Full X-Ray Audit & Feature Roadmap

**Date:** 2026-07-02 · **Auditor:** fused principal operator (SEO / travel-domain / full-stack / UX-CRO / competitive intel)
**Scope:** live production (www.visitplane.com) + local codebase, competitors, GitHub implementation research
**Method:** live crawl (18 pages + 8 invalid-pair probes + sitemap sample of 20), Lighthouse mobile @ throttled 3G (300 ms RTT / 700 Kbps / 4× CPU), full codebase read (affiliates, routing, sitemap, security, RLS migrations), 6-competitor teardown, 25-repo GitHub study.
**Rule for this pass:** audit + plan only. Nothing deployed, nothing changed.

---

## Executive summary

The site's technical SEO plumbing is fundamentally healthy — SSR everywhere, real 404s on invalid pairs (recent fix verified working), clean sitemap sample, safe redirect endpoint, RLS on every table. But **the single biggest problem is a dead revenue pipe: every WayAway/Travelpayouts link in production carries `marker=0`, so 100% of flight-affiliate conversions are unattributed and unpaid.** The single biggest opportunity is **caching + template polish on the ~1,950-page money cluster** (force-dynamic pages with 0.5–1.3 s TTFB, truncated titles on ~90% of pages, weak H1s on all 555 visa pairs) — template-level fixes that multiply across every URL. Headline numbers: LCP 7.5–11 s on 3G for money pages (target ≤ 2.5 s), blog page weight 8.3 MB, 16 of 18 sampled titles over 60 chars.

---

# PHASE 1 — LIVE X-RAY FINDINGS

## 1.0 Severity-ranked findings table

| # | Sev | Finding | Where | Impact | Effort |
|---|-----|---------|-------|--------|--------|
| F1 | **P0** | All WayAway/Travelpayouts links emit `marker=0` → zero commission on every flight click, site-wide | `/go/wayaway` → `tp.media/r?marker=0…`; root cause `src/lib/affiliates.ts:123` (`?? '0'` fallback, `NEXT_PUBLIC_TP_MARKER` unset in Vercel) | High (revenue) | Low |
| F2 | **P0** | Case-variant visa URLs bypass the 404 fix: `/visa/pakistan/turkey` & `/visa/PAKISTAN/TURKEY` return **200, index,follow, self-canonical** duplicates with garbled casing | `/visa/[passport]/[destination]` — lookups are case-insensitive but canonical echoes raw slug | High (dupe indexation of the money cluster) | Low |
| F3 | **P1** | Canonical host split: homepage + `/destinations` canonical to **non-www** while site 301s to **www**; all other pages canonical to www | homepage, `/destinations` | Med-High (signal split on the two highest-authority pages) | Low |
| F4 | **P1** | Title truncation at scale: 16/18 sampled titles > 60 chars; universal ` \| VisitPlane` suffix (+14 chars) pushes the whole `/visa/*` (555 pages) and `/blog/*` clusters past the SERP limit | all templates; e.g. `/visa/[p]/[d]` pattern ≈ 74–89 chars | Med-High (CTR on every money page) | Low |
| F5 | **P1** | Zero caching on money templates: `force-dynamic`, `cache-control: no-store`, `x-vercel-cache: MISS` on every hit; TTFB 0.5–1.3 s; every Googlebot crawl of ~1,950 URLs is a live Supabase render (template1 = 5 queries/request); `unstable_cache` used **nowhere** | `/visa` (`page.tsx:8`), `/seo/req:22`, `/seo/route:22`, `/seo/guide:23`, `app/sitemap.ts` | High (CWV + crawl budget + DB load) | Med |
| F6 | **P1** | Blog images: `/api/photo` serves full-size ~340–540 KB JPEGs (8.3 MB page weight, LCP 55.6 s on 3G); `cache-control: max-age=86400` only, no `s-maxage`, no resizing/AVIF | `/blog` listing + blog cards | High (CWV on 791 blog URLs) | Med |
| F7 | **P1** | Broken internal links on every visa-free page: `/cheapest-visas-from-{nationality}` missing required `-passport` suffix → 404 | `app/seo/visa-free/[nationality]/page.tsx:452,514` (~195 pages × 2 links) | Med (link equity leaks to 404s) | Low |
| F8 | **P1** | Error-vs-empty conflation: `/seo/route`, `/seo/req`, `/seo/guide` call `notFound()` when Supabase errors → a transient outage mass-404s whole templates (the `/visa` template is hardened; these aren't) | `app/seo/route/.../page.tsx:139`; `req:263–269`; `guide:246` | Med (latent mass-deindexation risk) | Low |
| F9 | **P1** | Sitemap integrity: (a) T2/T3 URLs emitted for all 140 countries regardless of data existence → sitemap 404s for thin passports; (b) `/passport-scanner` in sitemap but `Disallow`ed in robots.txt; (c) single un-sharded sitemap will breach the 50k-URL cap as `/visa/*` grows (destinations = 73,366 rows) | `app/sitemap.ts:187–192, 281–297`; `robots.txt` | Med | Med |
| F10 | **P2** | Weak/garbled H1s: `/visa/*` H1 is just the origin country name ("Pakistan") on 555 pages; homepage H1 renders "smartest**easiesteasiest** wayto" in raw HTML (word-rotator); `/interview-prep` "InterviewWith" | visa template; `app/page.tsx` hero | Med (relevance + quality signal) | Low |
| F11 | **P2** | `/destinations` title hardcodes "United States Passport Holders" for all visitors (default-passport leak) | `/destinations` | Low-Med | Low |
| F12 | **P2** | Homepage is a 775-line `'use client'` component querying Supabase from the browser; CLS 0.189 (fails ≤ 0.1) from a decorative absolute-positioned blob | `app/page.tsx:1` | Med (CWV + bundle) | Med |
| F13 | **P2** | Abuse surface: `app/api/visa/report-correction` = unauthenticated, un-rate-limited, module-scope **service-role** insert; `data_corrections` has a **public-read** policy; `/api/subscribe`, `/api/wizard-email`, `/api/push/subscribe` have no rate limits (Resend cost sink) | route files + `20260602` migration `:192–195` | Med (spam/cost/PII) | Med |
| F14 | **P2** | Placeholder affiliate IDs live in production: SafetyWing `referenceID=visitplane`, Airalo `aff=visitplane` are the code's *fallback* strings (`?? 'visitplane'`) — verify these are the real approved IDs or those two pipes are also unattributed | `src/lib/affiliates.ts:120–128`; confirmed in live redirects | Med (revenue, unverified) | Low |
| F15 | **P2** | `lib/seo/internalLinks.ts` cross-template linking algorithm is fully built but **dead code** (only `getSitemapPriority` imported) — and contains the same `-passport` bug at `:78` | `lib/seo/internalLinks.ts` | Med (opportunity) | Low |
| F16 | **P3** | Wizard page thin (226 words, meta 107 chars); `email_subscribers` open anon insert; sitemap-blog.xml 100% duplicated inside sitemap.xml (harmless but noisy) | `/wizard`, migrations, sitemaps | Low | Low |

**Verified clean (no issue):** invalid-pair soft-404s now genuinely return 404+noindex (7 of 8 probe classes); open-redirect on `/go/` — negative (allowlist enforced, user URLs ignored, unknown partners 404); service-role key server-only, zero hits in client code, no env files committed; RLS enabled on every table in migrations; admin guards present on all `/api/admin/*` except login (expected); all pages SSR with full meta in raw HTML; sitemap sample 20/20 = 200/self-canonical/indexable; affiliate links `rel="nofollow sponsored"` + FTC disclosure; no GTM/third-party script bloat (Vercel Analytics only); fonts self-hosted via next/font.

## 1.1 Core Web Vitals (Lighthouse lab, mobile, 3G-throttled: 300 ms RTT / 700 Kbps / 4× CPU — worst-case emerging-market)

| Template (www URLs) | Perf | TTFB | FCP | LCP | CLS | TBT |
|---|---|---|---|---|---|---|
| Homepage `/` | 0.58 | 350 ms | 3.5 s | **11.1 s** | **0.189** ❌ | 0 ms ✅ |
| `/destinations` | 0.68 | 360 ms | 3.4 s | 7.8 s | 0.001 ✅ | 70 ms ✅ |
| Visa detail (`/visa-requirements-for-pakistan-citizens-to-turkey`) | 0.69 | 600 ms | 3.4 s | 7.5 s | 0 ✅ | 0 ms ✅ |
| `/blog` | 0.62 | 390 ms | 5.2 s | **55.6 s** ❌ | 0 ✅ | 50 ms ✅ |

Read: interactivity (TBT/INP proxy) and layout stability are excellent everywhere except the homepage blob (F12). LCP is the failing vital, driven by (a) uncached origin renders (F5) and (b) unoptimized images (F6). Apex `visitplane.com` → `www` adds a full extra redirect round-trip for any traffic landing on non-www links — keep all internal/sitemap/canonical URLs on www.

Note: lab-only. Pull GSC → Core Web Vitals (CrUX field data) to confirm; field 4G will be kinder than this 3G lab, but the blog cluster will fail LCP in any field cohort.

## 1.2 Exact fixes for P0/P1 (copy-paste level)

**F1 — WayAway marker (do first, ~30 min):**
1. Get the real Travelpayouts marker from the TP dashboard (Profile → marker/affiliate ID).
2. Vercel → Project → Settings → Environment Variables → add `NEXT_PUBLIC_TP_MARKER=<real marker>` (Production+Preview) → redeploy.
3. Harden `src/lib/affiliates.ts:123`: remove the `?? '0'` fallback; if the marker is missing, log an error and link directly to `wayaway.io` (unattributed but honest) — never emit `marker=0`.
4. Verify: `curl -sI "https://www.visitplane.com/go/wayaway?placement=homepage"` → `location:` must contain `marker=<real>`.
5. Same pass: replace `?? 'visitplane'` fallbacks (F14) with real approved IDs from each partner dashboard, or env-var them identically.

**F2 — case-variant duplicates:** in `app/visa/[passport]/[destination]/page.tsx`, before data fetch: if `params.passport !== canonicalCase(params.passport) || params.destination !== canonicalCase(params.destination)` → `redirect(301)` to the canonical-case URL (or `permanentRedirect()`). Canonical case = the exact `destinations` row values. Also lowercase-normalize canonicals on the `/seo/req` template (`page.tsx:215`) which echoes raw slugs.

**F3 — canonical host:** set `metadataBase = new URL('https://www.visitplane.com')` in `app/layout.tsx` and fix the two hardcoded non-www canonicals (homepage, `/destinations`).

**F4 — titles:** drop ` | VisitPlane` from `/visa/*` and `/blog/*` templates (brand is in the URL/breadcrumb; Google appends brand itself for known sites). New visa pattern: `{Dest} Visa for {Passport} Citizens (2026): Requirements & Fees` — use short display names (`UK`, `US`, `UAE`) via a display-name map to stay ≤ 60.
**F10 — H1:** visa template H1 → `{Destination} Visa Requirements for {Passport} Citizens` (mirror title, not just "Pakistan"). Homepage: render one static phrase in SSR HTML and rotate words client-side after hydration (fixes both garble and the "wayto" spacing); same class of fix for `/interview-prep`.

**F5 — caching:** money templates → `export const revalidate = 86400` (ISR) instead of `force-dynamic`; wrap hot Supabase reads in `unstable_cache`/`"use cache"` (or cachified, see Phase 3 #19). Keep `force-dynamic` only where per-request data is genuinely needed (admin). This alone converts every crawl hit from origin-render to edge HIT and cuts TTFB to <100 ms.

**F6 — images:** serve blog cards through `next/image` with `sizes`/`quality=60` against `/api/photo` (add it to `remotePatterns` or make `/api/photo` accept `w=` and emit AVIF/WebP via sharp) + `cache-control: public, s-maxage=31536000, immutable` (slug+cb already busts).

**F7 — broken links:** `app/seo/visa-free/[nationality]/page.tsx:452,514` → append `-passport`; same fix in `lib/seo/internalLinks.ts:78` before wiring it up (F15).

**F8 — error hardening:** copy the `/visa` template's pattern (distinguish `{error}` from `{data: []}`): on error render a degraded page (200) or `throw` to the error boundary; only `notFound()` on a confirmed-empty result.

**F9 — sitemap:** gate T2/T3 emission on a per-passport row-count check; remove `/passport-scanner` from the sitemap (or un-disallow it — pick one); shard via `generateSitemaps()` (Phase 3 #1) before the `/visa/*` cluster expands.

**F13 — abuse surface:** add a shared rate-limit helper (Upstash ratelimit or a Supabase-counter fallback) on `report-correction`, `subscribe`, `wizard-email`, `push/subscribe`; drop the public-read policy on `data_corrections` (admin-only read); add a honeypot field to public forms.

---

# PHASE 2 — COMPETITIVE TEARDOWN (fetched live 2026-07-02)

Atlys, iVisa, Byevisa, Sherpa fetched raw (HTML + JSON-LD parsed). VisaHQ blocks datacenter IPs; Visalist/PassportIndex behind Cloudflare 403 — those three profiled via SERP evidence and third-party sources (flagged).

## 2.1 Competitor profiles (condensed)

**iVisa.com — the SEO benchmark.** Three-tier URL architecture: `/visas/{dest}` hub → `/visas/{dest}/{nationality}` pair (money template) → `/{dest}/{product}`. Pair title 54 chars: `Turkey visa for Indian citizens – Apply online | iVisa`. **Schema stack per pair page: WebPage + BreadcrumbList + Product (Offer $49.99 + AggregateRating 4.9) + FAQPage**, with FAQ questions matching long-tail intent verbatim ("Do Indian citizens need a visa for Turkey?", "Can I get a visa on arrival…"). Product pages embed 10 dated Review objects. Crucially: **pairs exist only where sellable** (`/visas/turkey/pakistan` = 404) — 2,181 sitemap URLs total, no thin matrix. Dated news layer keyed to country pairs (`/news/2026-06-26-in-bd-india-restores-tourist-visas…`) feeds freshness into the evergreen cluster. Bidirectional link blocks on every pair: "Turkey visas for other nationalities" + "Travel visas for other countries". 70k Trustpilot reviews, "99% approval rate" repeated. Runs an **affiliate program** (`ivisa.com/affiliates`) — directly joinable by us.

**Atlys.com — conversion machine, schema laggard.** Locale-carried nationality (`/en-PK/turkey-e-visa`), dynamic title suffix per locale (`…Guaranteed | Pakistan`). Title formula: `{Dest} Visa for {Demonym}: Fees, Documents, and Process` (56 chars). **Ships BreadcrumbList only — no FAQPage/Product schema despite on-page FAQs** (their beatable gap). Conversion mechanics: Amazon-style "Guaranteed in {date}" delivery promise, "Fee Back" if rejected, "You Pay Now" split payment, rejected-visa insurance + "Essentials" bundle upsells, free visa-photo-maker tool as funnel. robots.txt shows they pruned their old programmatic doorway clusters (`/countries/`, `/embassies/`…) — consolidation, not sprawl.

**Sherpa (apply.joinsherpa.com) — proof programmatic scale can rank.** `/visa/{dest}/{nationality}-citizens` (1,122 pages) + `/travel-requirements/{nat}-citizens/{origin}-to-{dest}` (10,300 pages), and it ranks (top-5 in 2 of 5 SERP tests). **H1 is a verdict: "You need a visa for Türkiye if you have a Pakistani passport"** — instant-answer/snippet bait. "Last checked at" freshness stamps, Timatic-grade daily-refreshed data. Monetizes via eVisa markup (~$6–36/order) + B2B widgets/API ("14.6% conversion on post-booking placements, +31% booking value").

**VisaHQ.com — ccTLD network + news wedge.** Nationality pages (`/turkey/turkey-e-visa-for-citizens-of-pakistan`), sub-intent pages (`…-processing-time`), and per-nationality ccTLDs (visahq.pk ranks for "turkey visa for pakistani citizens"). Their dated news layer (`/news/2026-02-14/in/thailand-approves-60-day-visa-free…`) pierces fresh policy-change SERPs within days.

**Byevisa.com — cautionary tale.** Right URL formats (`/{dest}-visa-for-{nationality}-citizens/`), author schema — but `dateModified 2021-12-20`, self-declared AggregateRating "0 from 0 ratings", abandoned. Freshness decay killed the rankings. Lesson: the pair-page format only compounds with a maintenance/freshness layer.

**Visalist.io / PassportIndex.org — the model validators.** Visalist (solo founder, reported $5k→$21k/mo): visa checker + destination data + **exactly our monetization: ads + Skyscanner flight affiliate + iVisa affiliate + freemium lifetime membership**. PassportIndex: rankings/compare tools as a lead-gen brand play for Arton Capital, earning Fortune-tier links annually from its "World Openness Score" data story.

## 2.2 Synthesis: pattern → best-in-class → our gap → priority

| Feature/pattern | Who does it best | Our current gap | Priority |
|---|---|---|---|
| Verdict-first instant answer H1 ("You need a visa for X if…") | Sherpa | Our `/visa/*` H1 is just "Pakistan" (F10); answer buried | **P0-copy** |
| Pair-page schema stack (FAQPage + Product/Offer + Breadcrumb) | iVisa | We have FAQPage/HowTo/Breadcrumb ✅ but no price/Offer markup and FAQ questions don't hit "do I need a visa" phrasing verbatim | **P1-copy** (FAQ phrasing now; Offer only if/when we sell) |
| "Last checked / Updated on" freshness stamps | Sherpa | None on visa pages | **P0-copy** (we already have honesty-layer infra) |
| Dated, nationality-keyed visa news layer | VisaHQ / iVisa | None — blog is evergreen only | **P1-build** (cheapest ranking wedge) |
| Bidirectional hub↔pair internal-link blocks | iVisa | Built but dead code (`internalLinks.ts`, F15) + broken `-passport` links (F7) | **P0-fix/wire** |
| Title formula ≤60 chars with money modifiers | Atlys (56c) / iVisa (54c) | 74–89 chars with ` \| VisitPlane` suffix (F4) | **P0-fix** |
| Curated pairs only, no thin matrix | iVisa (404s unsellable pairs) | Sitemap emits all-140-country template pages incl. dataless ones (F9) | **P1-fix** |
| Delivery-date promise / Fee Back guarantees | Atlys | N/A (we don't process) — but "processing time by channel" data is copyable as content | P2 |
| Insurance/eSIM upsell at intent peak | Atlys (checkout), Sherpa (post-booking, 14.6%) | We have SafetyWing/Airalo placements but static, not intent-timed; flights pay marker=0 (F1) | **P0-fix, P2-optimize** |
| Affiliate program stacking (sell others' processing) | Visalist (iVisa affiliate + Skyscanner) | We monetize flights/insurance/eSIM but NOT the visa-application intent itself — iVisa affiliates would pay us for the exact "apply" clicks we can't serve | **P1-join** |
| ccTLD / locale nationality targeting | VisaHQ (visahq.pk), Atlys (/en-PK/) | Single .com, no locales — fine for now; currency display is the cheaper 80% (Phase 3 #7) | P2 |
| Author bylines / expert review | Nobody (Byevisa's is stale) | Open E-E-A-T differentiator in the whole niche | **P1-build** |
| Linkable data asset (rankings/index PR hook) | PassportIndex ("World Openness Score") | None | P2-build |

## 2.3 SERP recon (live, 2026-07-02)

| Query | Who wins top-5 | Takeaway |
|---|---|---|
| "turkey visa for pakistani citizens" | evisa spam sites (.it.com/.org), mfa.gov.tr, **Sherpa #4**, visahq.pk #7 | Spam-infested = beatable; "2026 – Requirements, Fees & Processing" title pattern wins |
| "do indians need visa for thailand" | Air India, embassies, **Sherpa #5**, **VisaHQ news #6** | Officials own it; instant-answer pages + dated news are the only wedges |
| "dubai visa for nigerians" | VFS one-pager, mofa.gov.ae, travelstart.com.ng, niche processors | **None of the big 6 rank — Nigeria-outbound is an open flank** |
| "schengen visa requirements for indian citizens" | VFS, **AXA + Acko (insurers!)**, embassy, VisaHQ | Adjacent monetizers rank via requirement checklists — validates our checklist play |
| "do i need a visa for turkey" (no nationality) | mfa.gov.tr, state.gov, Wikipedia | Nationality-less queries go official — don't chase; nationality-qualified is our lane |

---

# PHASE 3 — GITHUB RESEARCH (25 repos studied, verified 2026-07-02)

## Best pattern per problem area

| Area | Winner repo | Stars | What to borrow | Adaptation to our stack |
|---|---|---|---|---|
| pSEO sitemap sharding | **captbaritone/webamp** (`packages/skin-database/app/sitemap.ts`) | 9.8k | Native App Router `generateSitemaps()`: shard count = `Math.ceil(dbCount / 40000)` | `app/sitemap.ts` with a Supabase `count` query; keep 40k/shard margin under the 50k cap; enumerate shard URLs in `app/robots.ts` (trick from mblonyox/peraturan.info); wrap the count in `.catch(() => null)` (gitdiagram) so sitemap never 500s |
| JSON-LD typing | **google/schema-dts** | 1.2k | `WithContext<FAQPage>` compile-time schema validation, zero runtime | Type the existing hand-built schema builders (already auto-built from `post.faqs`); render via `<script type="application/ld+json">` in RSC. `garmeeh/next-seo` (8.5k★) JSON-LD components are the fallback — its meta components are pages-router-only, don't use those |
| Eligibility wizard | **alphagov/smart-answers** (architecture) + **damianricobelli/stepperize** (1.6k★, implementation) | 179 / 1.6k | GOV.UK's production "Check if you need a UK visa" decision-tree: declarative graph of question nodes → outcome nodes, every path unit-tested | Typed node graph in `lib/eligibility/flows/*.ts`, outcomes keyed by Supabase `destinations` lookups, rendered with `defineStepper()` as a small client island; outcome pages deep-link to visa detail pages (internal-link win) |
| Affiliate links & click tracking | **dubinc/dub** (`apps/web/lib/middleware/link.ts`) | 23.8k | Non-blocking click recording via `event.waitUntil()`; bot detection (`detectBot`) excluded from click counts; hashed IP+UA dedup cookie; `X-Robots-Tag: noindex` on redirects; **geo-targeted destination URLs** (`geolocation(req)` → per-country landing pages) | Upgrade `/go/[partner]` with waitUntil click inserts, bot filtering, geo-targeted affiliate landing pages (PK vs IN vs NG users → localized offers). Don't self-host dub (PlanetScale/Tinybird stack) — extract the pattern. kutt (10.9k★) for schema inspiration only |
| Sitemap/robots tooling | **Native `sitemap.ts` + `robots.ts`** (drop next-sitemap idea) | — | `MetadataRoute.Robots` listing all shards | next-sitemap (3.7k★) is build-time only — wrong for ISR'd Supabase-driven pages |
| Edge-cached visa data | **epicweb-dev/cachified** (1.1k★) + **psteinroe/supabase-cache-helpers** (`postgrest-server`, 679★) | | `cachified({ttl: 1h, staleWhileRevalidate: 7d, checkValue: zod})` around `destinations` reads; parallel-fetch dedup | Wrap hot lookups server-side; vendor **mledoze/countries** (6.2k★) JSON as the single static source for country names/ISO/currencies/flags (restcountries repo is ARCHIVED — don't build on it). Vercel Edge Config only for the small hot set (valid slug list for middleware 404 decisions), not the full matrix. **ilyankou/passport-index-dataset** (308★): cross-check/conflict-flag signal ONLY — our `destinations` table is stronger for emerging-market passports (per prior data-quality work) |
| i18n / multi-currency | **amannn/next-intl** (4.3k★) + **fawazahmed0/exchange-api** (2.4k★) | | next-intl: `defineRouting()`, automatic hreflang via `alternates.languages`; exchange-api: free, keyless, CDN-served daily FX for 200+ currencies incl. PKR/BDT/NGN/LKR | **Currency first, locales later**: daily cron → Supabase `fx_rates` → server-render "≈ PKR 25,400" via `Intl.NumberFormat` (no client fetch, no dinero needed for display-only) with an "approximate, updated daily" honesty disclaimer. Full i18n deferred — locale × 1,950 pages is a doorway risk unless each locale is genuinely good |

Other production-grade repos studied: gitdiagram (15.8k★, resilient sitemap), therun.gg (40k/shard constant), Sink (6.9k★, KV-config + append-only analytics split), surveyjs (4.8k★, JSON-driven branching — overkill), quillforms (614★, jump-logic model), refref (194★, attribution ledger), vercel/examples (5.1k★ — `power-parity-pricing` geo-pricing example directly relevant), next-international (1.4k★, type-safe locale keys), dinero.js (6.8k★), agamm/pseo-next (62★, variant-page folder architecture), ArivAfonso/athera (generateSitemaps + supabase-js proof), react-country-region-selector (342★, fallback country picker).

---

# PHASE 4 — FEATURE RECOMMENDATIONS & ROADMAP

## 4.1 Feature recommendations (highest-leverage first)

**FE1 — Verdict-first instant answer block on all visa pair pages.**
Problem: our H1 is "Pakistan" and the answer is buried; Sherpa wins snippets with "You need a visa for Türkiye if you have a Pakistani passport". → SEO impact: featured-snippet/AI-Overview capture across 555+ pages; fixes F10 simultaneously. Complexity: **Low** (template change: verdict H1 + 40-word answer paragraph + visa-status badge, all data already fetched). Dependencies: none. Pattern: Sherpa template + snippet guidance from content module. Also rewrite the FAQ block's first question to the verbatim query ("Do {Nationality} citizens need a visa for {Destination}?") — iVisa's FAQPage play.

**FE2 — "Last checked" freshness layer + visa news wedge.**
Problem: no freshness signals; Byevisa shows the format dies without them; VisaHQ/iVisa rank policy changes within days. → Impact: rank-freshness on evergreen pages + a news cluster that pierces "visa rule change" SERPs and internally links to pair pages. Complexity: **Medium** (a) stamp `Last checked: {date}` from real `updated_at`/content-version data on pair pages — days; (b) news layer `/news/{yyyy-mm-dd}-{nationality}-{dest}-{slug}` as a new blog category with NewsArticle schema + links into the matching pair pages — the social-pipeline curated feed is a ready fact source. Dependencies: honest data only (never fake stamps — YMYL honesty layer applies). Pattern: VisaHQ/iVisa news URL formats.

**FE3 — "Do I need a visa?" eligibility wizard (instant-answer widget).**
Problem: homepage promises "check your travel visa" but the answer path is search-and-browse; no interactive intent capture. → Impact: engagement/dwell, internal-link engine (every outcome deep-links a pair page), email-capture point, linkable tool. Complexity: **Medium**. Dependencies: `destinations` lookups (cached, FE5). Pattern: alphagov/smart-answers node-graph architecture + stepperize (`defineStepper`) as a small client island; snapshot-test every path; vendor mledoze/countries for the picker.

**FE4 — Monetize visa-application intent via processor affiliate programs (iVisa affiliates, etc.).**
Problem: our biggest intent ("apply for X visa") currently earns $0 — we hand it to gov links; competitors earn $6–50/order on it. → Impact: **new primary revenue line**; Visalist proves the model at $20k+/mo scale. Complexity: **Low-Medium** (apply to ivisa.com/affiliates; add "Apply online via iVisa" CTA on routes they sell, gov-link otherwise — honesty layer: always show the official channel + fee alongside). Dependencies: F1 fixed first; partner approval. Pattern: existing `/go/[partner]` registry — add `ivisa` partner + per-route deep links.

**FE5 — Caching/ISR + sitemap sharding infrastructure.**
Problem: F5/F9 — every crawl is an origin render; sitemap will breach 50k. → Impact: TTFB <100 ms sitewide (LCP fix at the root), crawl-budget multiplier, DB load ~zero. Complexity: **Medium**. Dependencies: none (pure infra). Pattern: webamp `generateSitemaps()` + cachified/`unstable_cache` wraps + peraturan.info robots-shard-enumeration.

**FE6 — Multi-currency fee display (PKR/INR/NGN/BDT/PHP…).**
Problem: fees shown in USD to users who think in local currency; Atlys renders ₹7,949, iVisa ₹4,725. → Impact: CTR/conversion on cost-cluster pages (already proven buyer-intent pages), differentiation on "visa cost" queries. Complexity: **Low-Medium** (daily cron → Supabase `fx_rates` ← fawazahmed0/exchange-api; server-render `Intl.NumberFormat` "≈ PKR 25,400 · updated daily"). Dependencies: honesty disclaimer. Pattern: exchange-api + vercel/examples power-parity-pricing.

**FE7 — Interactive requirement checklist generator.**
Problem: SERP recon shows insurers (AXA, Acko) ranking via requirement checklists; we have curated `officialRequirements.ts` + printable but no interactive/personalized version. → Impact: engagement + snippet capture on "requirements" queries + natural insurance/eSIM affiliate placement at peak intent ("travel insurance — often required for Schengen ✓"). Complexity: **Medium** (client island: check-off list per route/purpose, progress bar, print/email export = capture point). Dependencies: existing curated checklists; FE1 template. Pattern: existing printable + HowTo schema already emitted.

**FE8 — Processing-time & cost comparison tables (per route).**
Problem: "how long / how much" is the #2 intent cluster; Atlys converts on delivery promises — we can rank on comparing channels (e-visa vs VoA vs embassy; gov fee vs processor fees). → Impact: buyer-intent long-tail ("{dest} visa processing time for {nat}"), table-snippet capture, FE4 CTA placement. Complexity: **Medium** (data model: per-route channel/fee/time rows; render + Table schema). Dependencies: data curation for top routes first (no fabrication — official sources, dated). Pattern: our cheapest-cluster tables (proven format per memory).

**FE9 — Author bylines + expert-review E-E-A-T layer.**
Problem: nobody in the niche does real bylines (open differentiator); YMYL demands it. → Impact: quality-signal lift across all content; AI-citation eligibility. Complexity: **Low** (author registry, `Person` schema wired into existing BlogPosting/Article, "Reviewed by" + date on money pages). Dependencies: real named authors/reviewers. Pattern: schema-dts typed Person/Article.

**FE10 — Geo-targeted affiliate routing + click intelligence.**
Problem: `/go/` treats all users identically; dub proves geo-targeted destinations + bot-filtered analytics; our clicks include bots and block on DB insert (1s guard). → Impact: higher EPC (PK users → PK-relevant offers), clean conversion data to steer placements. Complexity: **Medium**. Dependencies: F1/F14 fixed. Pattern: dub `link.ts` — `geolocation(req)`, `detectBot`, `waitUntil` inserts, dedup cookie.

**FE11 — "Visa Cost Index" linkable data asset.**
Problem: zero link magnets; PassportIndex earns Fortune-tier links yearly from one data story. → Impact: authority/links that lift the whole domain (our weakest lever vs incumbents). Complexity: **Medium** (quarterly analysis of our own destinations/cost data: "what a passport really costs to travel on" — rankings + methodology page + press blurb). Dependencies: FE6 (currency framing). Pattern: PassportIndex "World Openness Score"; strategy module: original data = strongest link magnet.

**Deliberately deferred:** full i18n locale rollout (doorway risk × 1,950 pages — revisit after FE2/FE5 prove out and one locale can be done well); payments/own processing (PAYMENTS OFF boundary); ccTLDs (expensive, brand-splitting).

## 4.2 Phased roadmap

**PHASE 0 — Stop the bleeding (this week, ~2–3 days of work)**
1. F1+F14 affiliate markers (30 min + partner-dashboard verification) — *the revenue fix*
2. F2 case-variant 301s · F3 canonical host · F4 title suffix drop · F7 broken `-passport` links · F9b robots/sitemap conflict
3. F8 error-vs-empty hardening (protects against mass-deindex during any Supabase blip)
   *Measure: `/go/` redirect headers show real marker; Screaming Frog/curl re-probe of case variants → 301; GSC coverage stable.*

**PHASE 1 — Template-level SEO lift (weeks 2–3)**
4. FE1 verdict-first instant answer + H1s (incl. homepage/interview-prep garble, F10) + iVisa-verbatim FAQ phrasing
5. FE5 ISR/caching + `/api/photo` image optimization (F5, F6) + sitemap sharding + T2/T3 data-gating (F9a)
6. FE9 bylines/reviewed-by · FE2a "Last checked" stamps · F15 wire up internalLinks.ts (after F7-class fixes) · F13 rate limits
   *Measure: TTFB <100 ms on cached hits; LCP <2.5 s lab-4G; GSC CTR on `/visa/*` cluster (expect +15–30% from titles alone); impressions on pages 5–20 positions.*

**PHASE 2 — Revenue & engagement features (month 2)**
7. FE4 iVisa-affiliate integration (apply now — approval takes weeks) · FE10 geo-targeted `/go/` upgrade
8. FE3 eligibility wizard · FE6 multi-currency display · FE7 checklist generator
9. FE2b news layer launch (2–3 dated posts/week from curated feed)
   *Measure: affiliate EPC by placement (clean post-FE10 data); wizard completion→pair-page CTR; news-post indexation speed.*

**PHASE 3 — Compounding bets (quarter)**
10. FE8 comparison tables on top-50 routes → expand · Nigeria-outbound + Pakistan-outbound cluster push (open SERP flanks per recon)
11. FE11 Visa Cost Index (Q3 data story + outreach)
12. Evaluate: US/UK/India probe GSC results (due ~late July per plan) → scale or kill; i18n pilot decision
    *Measure: referring domains (FE11); revenue per 1k sessions; probe cluster positions.*

**Ongoing:** freshness maintenance on pair pages (the Byevisa lesson), GSC CWV field-data watch, monthly competitor SERP re-recon, affiliate conversion reconciliation against the ledger.

---

*End of audit. Nothing has been deployed or changed in production in this pass.*
