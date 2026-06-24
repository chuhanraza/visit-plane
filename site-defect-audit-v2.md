# VisitPlane — Fresh Full-Site Defect & Polish Audit v2 (Sprint 19)

**Date:** 2026-06-25
**Mandate:** DIAGNOSIS ONLY. No data values changed; no product code changed by this audit.
**Method:** Live testing of https://www.visitplane.com — HTTP status sweep (curl), real browser
rendering + interaction (Chrome, desktop **1280px** + mobile **375px / 390px**), live API/AI probes,
Vercel deployment inspection, and source-code root-cause analysis.

---

## ⚠️ Important timing note — sprint18 deployed *during* this audit

When this audit began, production (`www.visitplane.com`) was serving **sprint17** (`8d87e24`) and
exhibited every prior defect (500s on unmatched routes, fabricated stats, double titles, document
bleed). Partway through, a **sprint18** commit (`b88f46e`, authored by a parallel session) finished
building on Vercel and its production-domain alias propagated. The custom domain flipped from sprint17
to sprint18 mid-session (verified: `/nonexistent` returned **500** at first re-test, then **404** ~4
minutes later once the alias propagated; the b88f46e deployment's alias list initially lacked
`www.visitplane.com`, then gained it).

**Net effect:** most of the prior audit's CRITICAL/POLISH items are now **FIXED AND LIVE**, verified
post-deploy with cache-busting. This report reflects the **final, post-sprint18 live state.** Sprint18
also deleted 7 legacy partial-param route folders (root cause of the unmatched-route 500: they threw a
Next.js `InvariantError` before `not-found` could catch) and removed the stale duplicate
`next.config.ts`; the clean SEO URLs still serve 200 via `next.config.mjs` rewrites → `/seo/*`
(verified: `/visa-requirements-for-pakistani-citizens-to-germany` = 200).

---

## PREVIOUS ISSUES STATUS (sprint13 audit items, re-tested on the live post-sprint18 site)

| ID | Issue | Final live status | Evidence |
|----|-------|-------------------|----------|
| **C1** | Unmatched routes → 500 not 404 | **FIXED (live)** | `/nonexistent`, `/es`, `/authorss`, `/visa`, `/authors` all now → **404** (branded not-found). Was 500 at audit start; fixed once sprint18 alias propagated. |
| **D1** | visa-free-map counts inflated (372>197) | **FIXED (live)** | `/api/visa-map?passport=Pakistan` = 59 visa-free + 16 VoA + 121 required = 196 distinct, no dup names. (sprint16) — but see **N2**. |
| **D2** | UAE document text bleeds onto other countries | **FIXED (live)** | `/visa/Pakistan/Germany` HTML no longer contains `icp.gov.ae`/`smartservices`. Country-neutral copy now. |
| **D3** | Slow fade-in → "feels unfinished" | **IMPROVED, residual (live, minor)** | Tool pages (e.g. `/checklist`) still show a brief content fade (~1–1.5s) on load/scroll before settling. Much reduced, not eliminated. Low severity. |
| **D4** | embassy-finder wrong direction + sparse | **Direction FIXED / coverage DEGRADED** | Direction logic correct (`e.ofCountry===to && e.inCountry===from`, `app/embassy-finder/page.tsx:41`). Dataset is only **5 hardcoded embassies**; most routes (e.g. Pakistan→Turkey) hit the empty fallback. |
| **T1** | Fabricated stats on /visa-checker | **FIXED (live)** | "94%/200+/100,000+" gone; honest stats now ("197 Countries", "60s", "No Signup"). |
| **P1** | Double "\| VisitPlane \| VisitPlane" titles | **FIXED (live)** | `/compare`, `/blog`, `/visa/Pakistan/Germany` now single suffix. `layout.tsx` template is `"%s"`. |
| **P2** | CountrySelect search/dedup/UAE-flag/counter | **FIXED (live), minor nit** | Live test on `/checklist`: typing **"United Arab"** → "1 country found", **UAE renders with its 🇦🇪 flag** (was "0 countries found"). Nit: a second unrelated row ("Democratic Republic…" w/ 🌍 globe) also renders despite the "1 country found" counter — list vs counter mismatch. |
| **P3** | cost-calculator only 8 destinations | **STILL OPEN** | `VISA_COSTS['Tourist']` still 8 hardcoded (`app/cost-calculator/page.tsx:8-19`); Business/Student/Work = "coming soon". Not addressed by sprint18. |
| **P4** | visa-vault generic default title | **STILL OPEN** (see **N1**) | Live `/visa-vault` `<title>` = generic "VisitPlane - Visa Requirements for 197 Countries". The fix is dead code. |
| **P5** | "Get notified" modal overlaps /visa content | **RESOLVED** | Desktop: modal sits in bottom-right gutter (no overlap). Mobile: a clean sticky bottom CTA bar instead. |

**Score:** 8 of 11 prior items now **FIXED & live** (C1, D1, D2, T1, P1, P2, P5, + D3 improved);
**1 partial** (D4 direction fixed / coverage thin); **2 still open** (P3, P4).

---

## CRITICAL (current, post-sprint18)

None outstanding from the prior list — C1/C2(T1)/C3(D2) are now fixed and live. The remaining
highest-impact issues are data-trust and SEO items below.

---

## DEGRADED / STUB & NEW ISSUES

### N1 — visa-vault metadata fix is DEAD CODE (title still generic, even post-deploy) — *trust/SEO, S*
- `app/visa-vault/page.tsx:1` is `'use client'`; the page-specific title lives in
  `app/visa-vault/metadata.ts`, which is **never imported** (a client page can't export `metadata`,
  and no `layout.tsx` re-exports it). Live title confirmed generic.
- **Fix:** add `app/visa-vault/layout.tsx` (server) exporting the metadata. **Effort:** S. Free.

### N2 — "Visa-free" entries carry a fee + the China classification looks wrong — *YMYL/trust, M* 🔴
- `/api/visa-map?passport=Pakistan` returns **58 of 59 visa-free entries with a non-zero fee**
  (Cuba $125, Haiti $125, Barbados $110…) and multi-week processing times — a visa-free country has no
  visa fee, so the fields contradict the classification.
- **China is listed visa-free ("30 days free") for a Pakistani passport** — on the homepage
  "No Visa Required" section *and* in the visa-map `visa_free` list (verified `China in visa_free: True`).
  China is **not** visa-free for Pakistani citizens. Credibility-damaging on the homepage.
- **No data was changed** (per mandate). Cross-references `visa-data-review.md`.
- **Fix:** review classification + gate fee/processing-time display off visa-free rows. **Effort:** M. Free.

### N3 — Soft-404s: fake passports/countries render as HTTP 200 — *SEO thin-content, M*
- Verified live: `/visa/Faketopia/Germany`, `/destinations/Nonexistentland`,
  `/visa/Pakistan/Nonexistentland` all return **200** with a real-looking `<title>` but empty body.
  (Inverse of C1 — these *should* 404.) Sprint18 deleted the legacy folders but didn't add country
  validation to `/visa/[passport]/[destination]` or `/destinations/[country]`.
- **Fix:** validate passport/destination against the known country set; `notFound()` if unknown. **Effort:** M. Free.

### N4 — Cambodia & Senegal lack hero photos in homepage "No Visa Required" — *polish, S*
- Verified live: Maldives/Nepal/China/Rwanda show real photos; **Cambodia and Senegal show a plain
  flag-on-teal gradient fallback** (no photo). The old "Senegal apple / Cambodia broken" bug is gone
  (flags correct now), but these two still miss images. Homepage was not touched by sprint18.
- **Fix:** supply image source for Cambodia & Senegal in `lib/data/countryImages.ts`. **Effort:** S. Free.

### Tool feature-states (verified live and/or in code)

| Tool | State | Note |
|------|-------|------|
| `/cost-calculator` | **STUB** | 8 hardcoded destinations only. Expand or label scope honestly. |
| `/embassy-finder` | **DEGRADED** | Direction correct; only **5 embassies** in data → most routes hit fallback. |
| `/passport-scanner` | **DEGRADED** | Client-side Tesseract/mrz OCR only; server route `api/scan-passport` is empty (`export {}`); optional Gemini needs the user's own key. Works in-browser. |
| `/itinerary-generator` | **WORKS, mislabeled** | Not AI — jsPDF template generator (random PNR/refs). Consider clarifying copy. |
| `/interview-prep/[country]` (1-segment) | **404 by design** | `/interview-prep/Germany` 404s; valid path is `/interview-prep/germany/schengen` (`[country]/[visaType]`). Confirm nothing links to the bare path. |

**Confirmed WORKING (live or live-API verified):** homepage funnel, **wizard + real Gemini AI**
(live `POST /api/wizard` returned a coherent Pakistan→Germany insight in ~6.4s), passport-strength,
compare, checklist, processing-times, currency-converter (live rates), visa-tracker, visa-checker quiz,
visa-free-map, interview-prep landing + mock (real Gemini scoring), document checker
(`/api/check-document` validates input → 400 not 500; sprint11 fix holds).

---

## UX / VISUAL / MOBILE (real tests)

- **Mobile (375px & 390px, real device-width render):** Homepage **passes** — hamburger nav,
  single-column stacking, full-width CTA, destination cards stack full-width, **no horizontal scroll,
  no overlap**. Visa page on mobile uses a clean sticky bottom CTA bar. Mobile is in good shape.
- **Desktop (1280px):** Homepage redesign is clean and professional — hero checker, problem-vs-solution,
  3-step process, popular destinations (UAE/Turkey/Japan photos correct + visa-status badges),
  visa-free grid, tools grid, affiliate "Complete Your Trip", consistent white header / dark footer
  with affiliate disclosure and "Always verify before traveling" line.
- **Residual fade-in (D3):** still mildly visible on tool pages; resolves in ~1–1.5s. Low severity.
- **Country images:** Senegal "apple" bug **gone**; flags correct sitewide. Only gap: Cambodia & Senegal
  hero photos on the homepage visa-free grid (**N4**).

---

## TECHNICAL SEO / TRUST CHECK

- **Titles:** ✅ now single "| VisitPlane" sitewide (P1 fixed).
- **Meta description:** ✅ present, route-specific on visa pages.
- **Canonical:** ✅ correct (`/visa/Pakistan/Germany`).
- **Schema:** ✅ rich — BreadcrumbList, FAQPage, HowTo/HowToStep, Organization, Offer, ContactPoint.
- **YMYL disclaimer (sprint17):** ✅ top "Estimated data…" banner + in-body "free guide to help you prepare" box on visa pages.
- **Official-source links (sprint16/17):** ✅ present + resolving (German Federal Foreign Office → 200, "Verified 2026-06-02").
- **Sitemap:** ✅ `/sitemap.xml` 200, 1,922 URLs. **robots.txt:** ✅ 200.
- **404 handling:** ✅ unmatched routes now 404 (C1).
- **Soft-404s (N3):** ❌ fake routes still return 200 — thin-content risk.

---

## FABRICATED CONTENT FOUND

- `/visa-checker` fabricated stats (94%/200+/100,000+) — **removed & live** (was the main offender).
- `InterviewSocialProof.tsx` fabricated testimonials — **deleted** (not imported anywhere; safe).
- No fabricated star-ratings/testimonials render on the live homepage, visa pages, or footer.
- Remaining "false claim" is data, not marketing: **China shown visa-free for Pakistan** + fee-on-
  visa-free contradiction (**N2**) — flagged, not changed.

---

## RECOMMENDED FIX ORDER (impact ÷ cost)

1. **N2 — visa-free data review** (China + fee-on-visa-free contradiction). Highest live trust impact. *M, free.*
2. **N1 — visa-vault metadata via real `layout.tsx`** (current fix is dead code). *S, free.*
3. **N4 — Cambodia & Senegal homepage hero images.** *S, free.*
4. **N3 — soft-404 validation** on `/visa/*` and `/destinations/*`. *M, free.*
5. **D4 / P3 — expand embassy + cost-calculator datasets**, or reframe scope honestly. *M, free.*
6. **D3 polish** — remove the residual tool-page fade. *S, free.*
7. **P2 nit** — make CountrySelect's rendered list match its "N found" counter. *S, free.*
8. **Itinerary-generator copy** — clarify it's a document generator, not AI. *S, free.*

---

## TESTING-TOOL NOTE (honest disclosure)

Mobile testing this round was **real**: the connected Chrome browser resized to **375×812** and
**390×844** and rendered the true mobile layout (hamburger nav, single-column stack); screenshots
reflect the mobile viewport. Desktop tested at **1280×900**. Live HTTP statuses via cache-busted
`curl`; AI/API behavior via live POST probes; deploy state via Vercel API. The sprint18 production
flip was observed live and is documented above so the findings are not stale.
