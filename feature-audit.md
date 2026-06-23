# VisitPlane — Feature-State Audit (Sprint 10)

**Date:** 2026-06-23
**Scope:** Diagnosis only — no feature code changed. State determined against BOTH the codebase and the live site (https://www.visitplane.com).
**Method:** Code crawl of `app/`, `components/`, `lib/` + live probes of API routes and pages (HTTP status + payload inspection). Secrets never printed — only env-var *names* and whether they are *referenced* / *functioning*.

---

## Headline finding (overturns the sprint hypothesis)

The sprint premise was that the AI features are **dormant because `GEMINI_API_KEY` is missing/unfunded.** This is **FALSE.**

`GEMINI_API_KEY` **is set and funded in production.** Verified live:
- `/api/wizard` returned a real, multi-section Gemini travel insight.
- `/api/interview/feedback` returned a real Gemini-scored answer (score 7/10 with category breakdown).
- `/api/check-document` reached the AI provider (returned `ai_error` only on a deliberately-garbage 1×1 test image, **not** `no_ai_key` 503 — proving the key is present).

So **all three flagship AI features work.** There is no shared "dead key" root cause to fix.

The only genuine backend breakage is **one Supabase schema-drift bug** that kills the Visa-Free Map. Everything else either works or is a non-AI UI stub.

---

## Full feature table

| # | Feature | Route | Dependency | State | Root cause / note | Fix effort | Free/Paid | Business value | Recommendation |
|---|---------|-------|-----------|-------|-------------------|-----------|-----------|----------------|----------------|
| 1 | AI Visa Wizard | `/wizard` → `/api/wizard` | Gemini (funded) + local visa-engine | **WORKS** ✓live | Decision tree always renders; Gemini adds insight. Graceful empty-string fallback if AI fails. | — | Paid (already funded) | High (hero tool, conversions) | Keep |
| 2 | Check My Documents w/ AI | embedded in `/visa/[passport]/[destination]` (DocumentChecker) → `/api/check-document` | Gemini (funded); Anthropic fallback | **WORKS** ✓live | Key present (no `no_ai_key`). Opens in-page modal via `onOpen`. 3 free/IP/day rate-limited. | — | Paid (already funded) | High (trust + Pro upsell) | Keep |
| 3 | Interview Prep — mock + AI scoring | `/interview-prep/mock/[id]` → `/api/interview/feedback` | Gemini (funded); voice = browser Web Speech API | **WORKS** ✓live | Real scoring verified. Voice input is `webkitSpeechRecognition` (browser-native, free, Chrome/Safari only). | — | Paid (already funded) | High | Keep |
| 4 | Interview email report | `/api/interview/email-report` | Supabase + Resend | **WORKS (delivery unverified)** | Route intact; needs `RESEND_API_KEY` to actually send. | — | Free/Paid (Resend) | Med | Keep |
| 5 | Passport Scanner | `/passport-scanner` | Client Tesseract + `mrz` lib; Gemini fallback (consent-gated) | **WORKS** | Fully client-side OCR pipeline. No server cost on primary path. | — | Free | Med | Keep |
| 6 | Passport Strength | `/passport-strength` | Local data | **WORKS** | 839 lines, real compute + share. | — | Free | Med (SEO) | Keep |
| 7 | Compare Visas | `/compare` | Local data | **WORKS** | 986 lines, 34 compute paths. | — | Free | Med | Keep |
| 8 | Checklist | `/checklist` | Local data + localStorage | **WORKS** | Persists progress in localStorage. | — | Free | Med | Keep |
| 9 | Processing Times | `/processing-times` | Local data | **WORKS** | 322 lines, filter/search. | — | Free | Med (SEO) | Keep |
| 10 | Embassy Finder | `/embassy-finder` | Hardcoded `EMBASSIES` array | **WORKS (limited data)** | Functional but coverage limited to the baked-in list. | — | Free | Low-Med | Keep; expand data later |
| 11 | Cost Calculator | `/cost-calculator` | Local compute | **WORKS** | 134 lines, live calc. | — | Free | Med | Keep |
| 12 | Currency Converter | `/currency-converter` | External free API (jsdelivr `fawazahmed0/currency-api`) | **WORKS** | No key needed; free CDN rates. | — | Free | Med | Keep |
| 13 | Visa Checker (quiz) | `/visa-checker` | Local data (5-step quiz) | **WORKS** | Step1–5 + ResultsSection, client-side verdict. | — | Free | High (conversions) | Keep |
| 14 | Itinerary / Onward-Travel Generator | `/itinerary-generator` | Client jsPDF | **WORKS** | Generates flight + hotel reservation PDFs (`handleFlightPDF`/`handleHotelPDF`). 1480 lines. | — | Free | High (affiliate funnel) | Keep |
| 15 | Visa Vault | `/visa-vault` | localStorage | **WORKS** | Client document vault, persists locally. | — | Free | Med | Keep |
| 16 | Visa Requirements engine | `/visa/[passport]/[destination]`, `/api/visa-data` | Local `visa-engine` | **WORKS** ✓live | Returned real data for PK→Turkey. Independent of Supabase. | — | Free | High (core SEO) | Keep |
| 17 | Geo detection | `/api/geo` | Vercel IP header | **WORKS** ✓live | Returned PK/Pakistan. 100% free. | — | Free | Med | Keep |
| 18 | Email capture / subscribe | `/api/subscribe`, `/confirm`, `/unsubscribe` | Supabase + Resend | **WORKS** ✓live | `{"success":true}` with consent; validation (consent required) enforced. Email send needs `RESEND_API_KEY`. | — | Free/Paid | High (list building) | Keep |
| 19 | Wizard email | `/api/wizard-email` | Supabase + Resend | **WORKS (delivery unverified)** | Route intact; depends on Resend key. | — | Free/Paid | Med | Keep |
| 20 | Search (command palette) | `CommandPalette` (cmdk) | Local | **WORKS** | Present and wired in header. | — | Free | Med | Keep |
| 21 | Travel Insurance | `/travel-insurance` | Affiliate links | **WORKS** | Content/affiliate page. | — | Free | High (revenue) | Keep |
| 22 | **Visa-Free Map** | `/visa-free-map` → `/api/visa-map` | Supabase `destinations` | **BROKEN** ✗live | `/api/visa-map` → **500 "column destinations.fee does not exist."** Query at `app/api/visa-map/route.ts:50` selects a `fee` column the table doesn't have. Page renders an error state. | **S** | Free | Med (visual SEO tool) | **Fix: drop `fee` from select (1 line)** |
| 23 | `/check-my-documents` URL | (no app dir — orphan) | — | **BROKEN (orphan)** ✗live | Returns **500**, but **nothing in the app links to it** (Document Check lives inside visa pages). A crawlable 500 only. | **S** | Free | Low | Add 404/redirect or a real landing page |
| 24 | **Visa Tracker** | `/visa-tracker` | none (useState only) | **STUB** | "+ Add Application" button has **no `onClick`**; empty-state text "No applications tracked yet" is **hardcoded**. Form updates state but never persists. Pure shell. | **M** | Free | Low | **Cut/hide OR wire localStorage** (trust risk) |
| 25 | Language Switcher / i18n | `LanguageSwitcher` + `next-intl` | cookie `NEXT_LOCALE` + `messages/*.json` (10 locales) | **STUB (partial)** | Switcher mechanically works (sets cookie, reloads). But **only 3 of 56 pages use translation keys** — homepage translates; ~95% of site (all tools, blog, visa pages) stays English in any locale. `/es` 500/`/es/wizard` 404 is expected (cookie-based, not URL-prefixed — not a bug). | **L** (translate) / **S** (hide) | Free | Low-Med | **Hide non-EN options** until content is localized (overpromises today) |

---

## Phase 3 — Root-cause & effort map

### Shared root causes
1. **AI "dormant" hypothesis is wrong.** `GEMINI_API_KEY` is funded and live. Wizard + Interview + Document Check all work. No action needed; do **not** spend effort "activating" them.
2. **Supabase schema drift (single bug).** `/api/visa-map` selects `fee`, which doesn't exist on the `destinations` table → 500 → Visa-Free Map broken. Isolated: the core `/api/visa-data` uses a separate local engine and is unaffected.
3. **i18n is plumbing-only.** Translation infra exists (next-intl, 10 locale files) but was never applied to the content — only the homepage shell is internationalized.

### Free fixes (no paid dependency)
- **Visa-Free Map** — remove `fee` from the Supabase select in `app/api/visa-map/route.ts:50` (or add the column). ~1 line. **S.**
- **Visa Tracker** — either wire localStorage persistence + `onClick` (reuse the `/visa-vault` pattern) **M**, or hide/cut **S.**
- **`/check-my-documents` orphan 500** — add a redirect to a visa page or a proper 404. **S.**
- **Language switcher** — hide locales with no content coverage. **S.**

### Paid-dependency fixes
- **None.** Every working feature runs on already-funded Gemini or free APIs (Vercel geo, jsdelivr FX, client-side Tesseract/jsPDF, localStorage). Email send (`RESEND_API_KEY`) is the only other paid key and the subscribe insert already succeeds; only delivery is unverified. No new spend required to reach a clean state.

### Trust-risk features (visible but dead/misleading)
- **Visa Tracker** — linked in the Tools menu; "Add Application" silently does nothing. Worst offender.
- **Visa-Free Map** — visible tool that shows an error to every visitor.
- **Language Switcher** — advertises 10 languages, delivers ~1 translated page.

---

## Phase 4 — Recommendation (prioritized)

**Fix order (highest value + lowest cost first):**
1. **Visa-Free Map `fee` column** — 1-line, free, restores an entire visible tool. *(Flagged as a candidate trivial zero-risk fix — NOT applied this sprint per diagnosis-only scope.)*
2. **Visa Tracker** — decide cut vs. wire. If kept, add localStorage persistence (M). If low usage, **cut** — a tracker that doesn't track is worse than no tracker.
3. **`/check-my-documents` orphan 500** — redirect/404, free, removes a crawlable error.
4. **Language switcher** — hide untranslated locales now (S); defer full localization (L) unless there's a clear market reason.

**Recommend CUT/hide rather than fix:**
- **Language switcher's non-English options** — overpromises until content is actually translated.
- **Visa Tracker** — cut unless analytics justify the M-effort localStorage build.

**Do NOT spend effort on:** "turning on" AI features — they are already on and funded.

---

## Appendix — env-var names referenced (no values; presence inferred from live behavior)

| Name | Referenced in | Live evidence |
|------|---------------|---------------|
| `GEMINI_API_KEY` | wizard, check-document, interview/feedback, passport-scanner fallback | **Set & funded** (live AI output) |
| `ANTHROPIC_API_KEY` | check-document (fallback only) | Referenced; presence not separately confirmed |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | visa-map, subscribe, email routes | **Set** (Supabase reachable — returned a schema error, not a connection error) |
| `SUPABASE_SERVICE_ROLE_KEY` | subscribe (preferred) | Referenced |
| `RESEND_API_KEY` | subscribe, wizard-email, interview/email-report | Referenced; subscribe insert works, email delivery unverified |
| `GROQ_API_KEY` | (not in `app/`) | Not used by any live feature |
| affiliate IDs (`NEXT_PUBLIC_*` Airalo/Saily/Heymondo/SafetyWing/Kiwi/WayAway/TP marker) | affiliate routing | Public client IDs |
| `VAPID_*` / push | `/api/push` | Web-push (not audited in depth) |

*Secret values were never read or printed.*
