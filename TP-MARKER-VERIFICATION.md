# Trust-badge & application-method honesty fix — diagnosis + duplicate scope report

**Date:** 2026-08-26
**Scope:** `/visa/[passport]/[destination]` (the live route page — high traffic). No visa data was changed. No dedupe migration was run.

---

## Task 1 — Diagnosis (read-only findings)

### 1a. "Last reviewed [date] · cross-checked with official sources" badge
- **Component:** [components/visa/VisaHeroCard.tsx](components/visa/VisaHeroCard.tsx) — footer at the bottom of the hero card (was line 265-270).
- **Before the fix:** the badge was **unconditional** — it rendered on every route regardless of any field on the row. The "Last reviewed" date wasn't even read correctly in the honest case: when `last_verified` was `null` (the case for ~100% of rows), the code fell back to a **hardcoded fake date** `'26 May 2026'` instead of omitting the claim.
- **Underlying data:** confirmed directly against the live `destinations` table (project `wmoywcqadkjxujgwduup`) — **100% of 73,366 rows have `data_confidence = 'unverified'`**, and **99.99% have `official_source_url` empty** (matches the existing `visa-data-review.md` audit from Sprint 16). So this badge was making a false "cross-checked with official sources" claim on essentially every single visa route page — this is the core issue this task fixes.

### 1b. "How to Apply: Apply online"
- **Rendered in two places**, both hardcoded, neither derived from any real field:
  - [components/visa/VisaHeroCard.tsx](components/visa/VisaHeroCard.tsx) — the "How to apply" stat tile: `applyLabel = isFree ? 'No visa needed' : isArrival ? 'On arrival' : 'Apply online'`. The `'Apply online'` branch fires for every non-free, non-arrival route (the majority of routes), with no check of any application-method field.
  - [components/visa/ApplicationSteps.tsx](components/visa/ApplicationSteps.tsx) — step 3 of the "How to Apply" checklist was hardcoded `title: 'Apply online'` with copy assuming an online account/form ("Create an account and fill out the application form carefully...").
- **Confirmed:** the `destinations` table schema (`id, country_name, visa_type, processing_time, pricing, validity, required_docs, passport_country, last_verified, notes, official_source_url, data_confidence`) has **no application-method column at all** — no online/VFS/embassy distinction exists anywhere in the data. The claim was a pure UI assumption, wrong for any route that actually requires an in-person VFS/embassy visit.

### 1c. How duplicate rows are picked for display
- Both `fetchAllVisaTypes` and the soft-404 guard `fetchVisaTypesResult` in [app/visa/[passport]/[destination]/page.tsx](app/visa/[passport]/[destination]/page.tsx) query:
  ```
  .from('destinations').select('*')
    .ilike('passport_country', passportName)
    .ilike('country_name', destinationName)
    .order('id', { ascending: true })
    .limit(20)
  ```
  and the page then uses `allVisaData[0]` as `primaryVisa` for the hero card, JSON-LD, and metadata.
- **Answer: deterministic, not random — the row with the lowest `id` (i.e., the oldest/first-inserted row) always wins.** This matches the same "keep lowest-id row" pattern already documented for the visa-free map fix in `visa-data-review.md` §1.
- **Confirmed live** with the example cited in this task: `Germany → Pakistan` has two rows —
  - id `13784`: `$65`, `5-7 days` ← this is the one the page renders (lower id)
  - id `13785`: `$95`, `1-2 weeks` ← silently hidden
- **Urgency assessment:** because selection is deterministic by id (not undefined/random), the *display* is at least stable and reproducible — it won't flip between requests. But that stability does nothing to make the shown value *correct*; it's simply an arbitrary "first row wins" rule with no relationship to which value is actually accurate. Given ~20,618 passport→destination→visa_type triples in the table have genuinely conflicting `pricing`/`processing_time` for the *same* visa type (see Task 4), this remains a real accuracy problem, just not a "different visitors see different numbers" one.

### 1d. `visa_requirements` table usage
- **Not used by the main `/visa/[passport]/[destination]` template at all** — that page only ever queries `destinations`.
- It **is** used, read-only, by three separate long-form SEO templates: [app/seo/route/[passport]/[destination]/page.tsx](app/seo/route/[passport]/[destination]/page.tsx), [app/seo/guide/[destination]/[passport]/page.tsx](app/seo/guide/[destination]/[passport]/page.tsx), and [app/seo/req/[passport]/[destination]/page.tsx](app/seo/req/[passport]/[destination]/page.tsx), each of which tries `visa_requirements` first (exact `passport_iso`/`destination_iso`/`purpose='tourist'` match) and falls back to `destinations` for page-existence/SEO only if no verified row exists. Since `visa_requirements` only has 20 rows (Pakistan-outbound only), this verified path only ever fires for a small number of Pakistan routes on those three SEO templates — the main high-traffic `/visa/...` template never benefits from it.

---

## Tasks 2 & 3 — What changed

- **[components/visa/VisaHeroCard.tsx](components/visa/VisaHeroCard.tsx):** added `resolveVerification()`, which only treats a row as verified when `data_confidence` is populated and not `'unverified'`, **and** `official_source_url` is non-empty, **and** `last_verified` is populated. Only then does the badge show "Last reviewed [real date] · cross-checked with official sources". Otherwise it shows: *"Not yet independently verified by VisitPlane — always confirm current requirements with the official embassy or VFS source before booking non-refundable travel."*, plus a real link to `official_source_url` when one exists even though the row is otherwise unverified. Removed the hardcoded fake `'26 May 2026'` fallback date entirely.
- **[components/visa/VisaHeroCard.tsx](components/visa/VisaHeroCard.tsx):** "How to apply" tile no longer asserts `'Apply online'`; non-free/non-arrival routes now show `'Check process'`.
- **[components/visa/ApplicationSteps.tsx](components/visa/ApplicationSteps.tsx):** step 3 renamed from "Apply online" to "Submit your application"; copy no longer assumes an online form/account, and explicitly says the process may be an online portal, a VFS/visa-centre appointment, or an in-person embassy visit depending on the destination. The step's link is now only shown when a real portal URL is actually known (`resolveApplyInfo` found a stored `apply_url` or a curated official portal) — no link is fabricated when none exists.
- No visa fee, processing-time, validity, or visa-type values were changed anywhere.

---

## Task 4 — Duplicate-pair scope report (report only, no cleanup)

No `Pages.csv`-style traffic export was found in the repo, so this is prioritized by **passport-country traffic tier** (using the same high-traffic passport list `visa-data-review.md` already recommends: India, Pakistan, Nigeria, Philippines, China, Bangladesh, plus other large-population passports) and by conflict severity, not by per-URL analytics.

**Important distinction the existing audit already called out and this confirms:** most 3-4-row "duplicate" groups are **not** data errors — they're legitimate different visa *products* for the same country pair (Tourist / Business / Student / Transit, each a separate row with its own `visa_type`). The genuinely dangerous case is when **the same `visa_type`** has multiple rows with **different** `pricing`/`processing_time` — that's a real, unresolvable contradiction. Across the whole table there are **20,618** `(passport, destination, visa_type)` triples with this same-type conflict.

### Confirmed conflicting same-visa-type rows (top sample, high-traffic passports first)

| Passport → Destination | Visa type | Conflicting rows (id: price / processing / validity) |
|---|---|---|
| **Germany → Pakistan** *(task's cited example)* | Visa Required | `13784`: $65 / 5-7 days  vs.  `13785`: $95 / 1-2 weeks — **app currently shows the first, $65/5-7 days, only because it has the lower id** |
| China → United States | Visa Required | `43053`: $75/1-2wk · `43054`: $120/5-7d · `43055`: $35/3-5d · `73576`: $140/4-5d (validity: "up to 10 years") |
| China → Saint Lucia | **Visa Free** | `43095`: $90/5-7d · `43096`: $150/5-7d · `43097`: $150/2-3wk · `43098`: $30/3-5d — **a "Visa Free" row should never carry a fee at all; all 4 values are suspect** |
| India → Canada | Visa Required | `34746`: $75/5-7d · `34747`: $150/5-7d · `34748`: $35/3-5d · `73571`: $227/2-4wk (validity: "1-3 years, tied to job offer") |
| India → Hong Kong | Visa Required | `34989`: $95/5-7d · `34990`: $125/5-7d · `34991`: $150/2-3wk · `34992`: $25/1-2d |
| Bangladesh → Egypt | Visa Required | `35807`: $90/2-3wk · `35808`: $110/1-2wk · `35809`: $135/2-3wk · `35810`: $30/3-5d |
| Egypt → Kuwait | Visa Required | `52429`: $95/5-7d · `52430`: $125/1-2wk · `52431`: $120/2-3wk · `52432`: $30/24h |
| Ghana → Turkey | Visa Required | `54919`: $80/1-2wk · `54920`: $150/5-7d · `54921`: $150/2-3wk · `54922`: $30/3-5d |
| India → Czech Republic | 4 distinct types (Tourist/Business/Student/Transit) — legitimate variants, not a same-type conflict | — |
| Philippines → United States | 4 rows, 3 legitimate variants **+ one true conflict**: `39434` Tourist eVisa $80/1-2wk vs. `73575` Tourist Visa $160/3-5d (validity: "up to 10 years") — same trip purpose, different visa product name/price | — |

*(This is a representative sample, not the full 20,618 — a proper "top 30 by traffic" ranking needs real analytics data, which isn't available in-repo. The `Sweden`/`Estonia`/`Uruguay`/etc.-style 4-row groups from obscure passport countries seen in a first, traffic-blind pass were excluded here in favor of higher-traffic passports.)*

**Recommendation (unchanged from the existing Sprint 16 audit):** resolve these against official sources row-by-row; do not auto-merge. The `China → Saint Lucia` "Visa Free" case in particular looks like outright data corruption (a free-entry status should never carry a fee) and may be worth triaging before the rest.
