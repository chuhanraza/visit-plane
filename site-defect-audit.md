# VisitPlane — Deep Site Defect & Polish Audit (Sprint 13)

**Date:** 2026-06-24
**Method:** Live testing of https://www.visitplane.com (Chrome) + source-code root-cause analysis.
**Mandate:** Diagnosis only. No fixes applied this sprint.

This audit converts the vague "many things don't work / feels thin" complaint into a
concrete, prioritized, evidence-backed defect list. Every item was reproduced on the
*live* site, and the root cause confirmed in code.

---

## Summary table — routes & feature states

| Area | State | Severity |
|------|-------|----------|
| Unmatched routes (`/authors`, `/es`, typos, dead links) | Return **HTTP 500**, not 404 | CRITICAL |
| `/visa-free-map` data | Counts inflated (372 > 197); wrong countries flagged visa-free | DEGRADED |
| `/visa/[passport]/[destination]` document lists | Templated text bleeds across countries (Germany shows UAE govt URL) | DEGRADED |
| All tool pages | 2–5s blank/faded slow fade-in → "feels unfinished" | DEGRADED |
| `/embassy-finder` | Sparse data + confusing direction (returns home-country embassy abroad) | DEGRADED |
| `/visa-checker` landing stats | Fabricated "94% accuracy / 100,000+ travelers / 200+ countries" | TRUST |
| Page `<title>` | Double "\| VisitPlane \| VisitPlane" on nearly all pages | POLISH |
| `CountrySelect` search | Fails on official names ("United Arab" → 0 found); misleading counter; dup UAE rows; UAE globe icon | POLISH |
| `/cost-calculator` | Only 8 destinations | POLISH |
| `/visa-vault` | Missing page-specific metadata (generic default title) | POLISH |
| `/visa/` "Get notified" modal | Overlaps page content | POLISH |
| Core funnel, wizard, AI features, most tools | **WORK** | — |

**Tools confirmed WORKING end-to-end:** cost-calculator, currency-converter, compare,
checklist, passport-strength, itinerary-generator, visa-checker quiz, interview-prep,
visa-vault, passport-scanner, visa-free-map (rendering), homepage funnel, wizard + Gemini
AI insight, document checker, interview scoring, visa-tracker.

---

## CRITICAL

### C1 — Unmatched routes return HTTP 500 instead of 404
- **Evidence (live):** `/authors`, `/es`, and any typo'd/dead URL throw a server error
  page rather than a clean 404. This hits real links — e.g. `/authors` (the author index,
  linked from bylines) and `/es` (locale path that doesn't exist under cookie-based i18n).
- **Root cause (code):** `app/` has **no** `not-found.tsx`, `error.tsx`, or
  `global-error.tsx` (confirmed via `find app -maxdepth 2`). With `force-dynamic`
  everywhere, an unmatched/throwing route surfaces as a 500 instead of Next's 404.
- **Impact:** SEO (Google sees 500s on crawlable links), trust (users hit a raw error),
  and lost link equity. This is the single most damaging technical defect.
- **Fix effort:** **S** — add `app/not-found.tsx` + `app/error.tsx` (+ optionally
  `global-error.tsx`); fix the `/authors` index and kill/redirect `/es`.
- **Cost:** Free.
- **Business value:** High — protects SEO + first-impression trust.

---

## DEGRADED

### D1 — `/visa-free-map` data is wrong and inflated
- **Evidence (live):** For a Pakistan passport the visa-free count sums to **372** —
  impossible against **197** total countries. China, parts of South America, and parts of
  Africa are shown visa-free for Pakistan (incorrect). The page also cites Henley/"197
  countries" elsewhere, contradicting its own numbers.
- **Root cause (code):** The Supabase `destinations` table holds **multiple rows per
  country** (one per visa type). The map counts *rows*, not *distinct countries*, so the
  totals overshoot and mis-classify.
- **Impact:** This is the most credibility-damaging data defect — a visa site that can't
  count visa-free countries undermines the whole value proposition.
- **Fix effort:** **M** — dedupe by country and derive a single visa-free verdict per
  country before counting/coloring.
- **Cost:** Free (data/query logic only).
- **Business value:** High — core feature correctness.

### D2 — Templated visa documents bleed across countries
- **Evidence (live):** `/visa/Pakistan/Germany` renders rich content but its document list
  includes UAE-specific text (`smartservices.icp.gov.ae`). Country-specific detail is
  leaking from one destination's template into another.
- **Root cause (code):** `app/visa/[passport]/[destination]/page.tsx` pulls templated
  content that isn't fully scoped per destination; fallback/shared copy isn't country-gated.
- **Impact:** Users get factually wrong instructions for their actual destination.
- **Fix effort:** **M** — audit the document template source; gate country-specific lines.
- **Cost:** Free.
- **Business value:** High — factual accuracy on the money pages.

### D3 — Slow fade-in animation makes every tool page "feel unfinished"
- **Evidence (live):** On nearly every tool page, content is blank/faded for ~2–5s before
  animating in. On first load this reads as "broken / nothing here" — a major driver of the
  founder's "feels thin/unfinished" complaint.
- **Root cause (code):** A global entrance/fade-in animation gates initial content
  visibility on all tool pages.
- **Impact:** Perceived performance + perceived completeness across the entire site.
- **Fix effort:** **S** — reduce/remove the entrance delay or render content immediately
  and animate non-blocking.
- **Cost:** Free.
- **Business value:** High relative to effort — fixes the dominant "feels unfinished" signal.

### D4 — `/embassy-finder` sparse data + confusing direction
- **Evidence (live):** Pakistan→Turkey returns **no** embassy. The tool also returns the
  *home-country* embassy abroad rather than the *destination's* embassy in the user's home
  country, which is the opposite of what a visa applicant needs.
- **Root cause (code):** Thin embassy dataset + direction logic returns the wrong side of
  the pair.
- **Impact:** Tool returns empty or misleading results for common routes.
- **Fix effort:** **M** — correct the lookup direction; expand dataset coverage.
- **Cost:** Free (data + logic).
- **Business value:** Medium.

---

## TRUST

### T1 — Fabricated stats on `/visa-checker` landing
- **Evidence (live):** Landing shows **"94% Accuracy Rate"**, **"Trusted by 100,000+
  travelers worldwide"**, and **"200+ Countries Covered"** — none verifiable, and they
  directly conflict with the E-E-A-T / honest-positioning work from prior sprints.
- **Root cause (code):** `app/visa-checker/components/LandingSection.tsx`
  - L4: `{ value: '94%', label: 'Accuracy Rate', icon: '🎯' }`
  - L51: `Trusted by 100,000+ travelers worldwide`
  - "200+ Countries Covered" in the same block.
- **Impact:** Fabricated trust claims are a liability and contradict the site's own honesty
  positioning (and the real 197-country figure used elsewhere).
- **Fix effort:** **S** — remove or replace with honest, sourced figures.
- **Cost:** Free.
- **Business value:** High (trust/legal) for trivial effort.

---

## POLISH

### P1 — Double "| VisitPlane | VisitPlane" page titles
- **Root cause (code):** `app/layout.tsx:35–36` —
  `default: "VisitPlane - Visa Requirements for 197 Countries"` + `template: "%s | VisitPlane"`.
  Individual pages already set titles ending in "| VisitPlane", so the template appends a
  second one.
- **Fix effort:** **S** — drop the suffix from page titles **or** change the template to `%s`.
- **Cost:** Free. **Value:** Medium (SEO/branding hygiene).

### P2 — `CountrySelect` search & display issues
- **Evidence (live):** Typing "United Arab" → "0 countries found / No country found"
  (stored as "UAE"). The "0 countries found" counter is misleading; UAE appears as duplicate
  rows; UAE shows a 🌍 globe instead of its flag.
- **Root cause (code):** `components/CountrySelect.tsx` filter (~L246) matches stored short
  names only; counter (~L444) reflects raw filtered rows; duplicate Supabase rows surface;
  missing flag mapping for "UAE".
- **Fix effort:** **M** — add alias/official-name matching, dedupe, fix counter copy, map UAE flag.
- **Cost:** Free. **Value:** Medium (used by homepage/checklist/compare/embassy-finder).

### P3 — `/cost-calculator` only 8 destinations
- **Fix effort:** **S–M** (data expansion). **Cost:** Free. **Value:** Low–Medium.

### P4 — `/visa-vault` missing page-specific metadata
- Uses generic default title/description. **Fix effort:** **S**. **Cost:** Free. **Value:** Low (SEO).

### P5 — "Get notified" modal overlaps `/visa/` content
- Modal layers over page content. **Fix effort:** **S** (z-index/placement). **Cost:** Free. **Value:** Low.

---

## Recommended fix order

1. **C1** — add `not-found.tsx` / `error.tsx`; fix `/authors`, `/es` (stops 500s). *S, free, high.*
2. **T1** — remove fabricated visa-checker stats (trust/legal). *S, free, high.*
3. **D3** — kill the slow fade-in (biggest "feels unfinished" driver). *S, free, high.*
4. **P1** — fix double titles (sitewide SEO hygiene). *S, free, medium.*
5. **D1** — dedupe visa-free-map counts/classification. *M, free, high.*
6. **D2** — stop document-template bleed across countries. *M, free, high.*
7. **D4** — fix embassy-finder direction + data. *M, free, medium.*
8. **P2** — CountrySelect search/dedupe/flag/counter. *M, free, medium.*
9. **P3 / P4 / P5** — data expansion + metadata + modal polish. *S–M, free, low–medium.*

---

## Testing-tool limitation (disclosed honestly)

Reliable **~375px mobile** verification was **not possible** with the available browser
tool: window resize to 390×844 did not change the rendered screenshot width (fixed ~1400px),
and the desktop nav persisted. Mobile-specific layout breaks are therefore **not** asserted
in this report rather than fabricated. A real device / proper responsive emulation pass is
recommended as a follow-up.
