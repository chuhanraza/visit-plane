# Sprint: Close Loops + Polish

_Interview Prep landing · Mock results verification · Question bank expansion · Homepage residual bugs_

Date: 2026-06-15

---

## Section A — /interview-prep landing diagnostic

### Diagnostic result: **CASE (a) — code is NEW and already live**

The premise in the brief (production serving the old "225,000+ interview experiences"
landing) is **no longer true**. A fresh production fetch of
`https://www.visitplane.com/interview-prep` returns the **new** landing:

- ✅ "Pass Your Visa Interview With Confidence" hero
- ✅ "What officers actually ask" sample Q&A accordion (strong vs weak answers + pro tip)
- ✅ Unified `<SiteHeader />` (Destinations · Tools · Blog) + footer (Product / Trust / Legal + brand column)
- ❌ No "225,000+" / "26,000+" stat block
- ❌ No old 5-tips layout / old 3-column footer

### Why the code was already correct

- `app/interview-prep/page.tsx` → renders `InterviewPrepClient`
- `InterviewPrepClient` → `InterviewHero` + `InterviewLandingSections` (the new design)
- `SiteHeader` / `SiteFooter` come from the root `app/layout.tsx`, so the unified
  chrome is applied to `/interview-prep` automatically — same as `/destinations`, `/visa/*`, `/wizard`.
- The stale `225,000+` string lived only in `InterviewSocialProof.tsx`, an **orphan
  component not imported by any page** — which is why it never reached production HTML.

So this was Case (a) (code shipped, not a stale-cache-vs-missing-route problem). The most
likely explanation for the founder's observation: a stale CDN/browser snapshot captured
before the new landing propagated.

### Actions taken (case-(a) remediation)

1. Added `export const revalidate = 3600` (1-hour ISR) to `app/interview-prep/page.tsx`
   so the rendered HTML can't silently drift from committed source again.
2. Updated meta description / OG / Twitter copy to reflect **7 countries**
   (US, UK, Canada, Australia, Germany, UAE, Japan) instead of the old 5.
3. Neutralized the dead `225,000+` stat in the orphan `InterviewSocialProof.tsx`
   so the string no longer exists anywhere in the repo (`grep` → 0 matches).

### Verification (post-deploy targets)

```
curl -s https://www.visitplane.com/interview-prep | grep -c "What officers actually ask"   # ≥1
curl -s https://www.visitplane.com/interview-prep | grep -c "225,000"                        # 0
```

Pre-deploy, the live HTML already satisfies both (≥1 and 0). Will re-confirm after the
sprint deploy. _(Note: production HTML was read via the sandboxed web-fetch tool rather than
raw `curl`, since outbound `curl` to arbitrary hosts is restricted in this environment; the
returned server-rendered HTML is equivalent for this check.)_

---

## Section B — Mock results + email report (config-verified)

Per agreement, email was **not sent** from this environment (sending on the user's behalf
needs explicit approval, and the inbox can't be read here). Verification is code-level.

### B1 — Results screen (`app/interview-prep/mock/[id]/MockClient.tsx`)

Every required element is present and styled:

- ✅ Score 0–100 in a gradient ring (`h-28 w-28 rounded-full`, `{overall}/100`)
- ✅ Category breakdown — per-category bars with `{val}/10`
- ✅ "💪 What you did well" list
- ✅ "🎯 Improve before your real interview" list
- ✅ Recommended next steps — Retake mock / Back to study mode CTAs
- ✅ Email capture form (with consent checkbox)
- ✅ Share buttons — WhatsApp, X, Copy
- ✅ Mobile responsive — single-column `max-w-xl`, stacks cleanly at 375px
- The page computes a base64url `resultHash` → `/interview-prep/result/<hash>`.

### B2 — Email endpoint (`app/api/interview/email-report/route.ts`)

Audited and **hardened** (two real gaps fixed):

- Provider: Resend; `from: VisitPlane <noreply@visitplane.com>`; subject includes the score.
  Env keys present in `.env.local`: `RESEND_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`,
  `SUPABASE_SERVICE_ROLE_KEY`. If `RESEND_API_KEY` is unset the route degrades gracefully
  ("email sending not configured") rather than erroring.
- HTML already contained score + breakdown + strengths + improvements.
- **Fix 1 — unsubscribe link was missing.** Added a visible unsubscribe link in the
  footer plus a `List-Unsubscribe` header. The token is now generated before the
  subscriber upsert (and stored on it), so the email link matches the DB row; non-
  subscribers get a `mailto:` unsubscribe fallback. Unsubscribe route already exists
  (`/unsubscribe?token=…` → `/api/unsubscribe`).
- **Fix 2 — back-link was generic.** The CTA now points to the specific
  `/interview-prep/result/<hash>` (validated to the visitplane.com domain to avoid an
  open redirect in the email). `MockClient` now posts `resultUrl` in the request body.

**To confirm delivery yourself**, from a completed result page enter your email and click
"Send My Report", or hit the endpoint directly:

```
curl -X POST https://www.visitplane.com/api/interview/email-report \
  -H 'content-type: application/json' \
  -d '{"email":"you@example.com","subscribe":false,"country":"United States",
       "visaLabel":"B1/B2","overall":82,"categories":{"purpose":8,"ties":7},
       "strengths":["Specific itinerary"],"improvements":["Show stronger ties"],
       "resultUrl":"https://www.visitplane.com/interview-prep"}'
```

Expect a 200 `{ ok: true }` and an email within ~2 min; if it 500s, check Resend domain
verification for `visitplane.com` and the Vercel function logs.

---

## Section C — Question bank expansion

Target was 50/country; per the quality-over-speed guidance we shipped **30 excellent
questions per country** this sprint and logged the remainder in `TODO.md`.

| Country | Before | After |
|---|---|---|
| US 🇺🇸 | 31 | 31 |
| UK 🇬🇧 | 13 | 30 |
| Canada 🇨🇦 | 11 | 30 |
| Australia 🇦🇺 | 8 | 30 |
| Germany/Schengen 🇩🇪 | 7 | 30 |
| UAE 🇦🇪 | 4 | 30 |
| Japan 🇯🇵 | 3 | 30 |
| **Total** | **~77** | **211** |

- All 134 new entries are **pre-seeded** in `lib/data/interview-questions.ts` (no runtime
  AI generation), with every schema field populated: `id, country_iso, visa_types,
  category, question, why_asked, strong_answer_pattern, weak_answer_pattern, pro_tip,
  keywords_to_use, keywords_to_avoid, difficulty, source_url`.
- Balanced across all categories (personal / purpose / financial / ties / trip_details /
  red_flag), with student & work visa-type coverage added for UK, Canada, Australia, Germany.
- Every `source_url` points to an **official government page**, URLs confirmed via search:
  travel.state.gov, gov.uk, canada.ca, immi.homeaffairs.gov.au, auswaertiges-amt.de,
  u.ae / icp.gov.ae, mofa.go.jp.
- New IDs use a `cl-<country>-NN` prefix; **no duplicate IDs** (verified).
- The file **type-checks clean under `tsc --strict`** (it is self-contained, no imports).

---

## Section D — Homepage residual bugs

| Step | Status | What changed |
|---|---|---|
| D1 — duplicate "Check My Visa →" | ✅ Fixed | `SiteHeader` responsive classes were already correct (desktop `hidden md:inline-flex`, mobile CTA inside a `md:hidden` panel), but the panel used `hidden={!mobileOpen}` and so still emitted a 2nd CTA into SSR DOM. Mobile menu now **mounts only when open** (`{mobileOpen && (…)}`), so the SSR DOM contains exactly **one** "Check My Visa". |
| D2 — ticker DOM duplication | ✅ Already correct | The duplicate (visual-loop) set already carries `aria-hidden="true"` per entry; the primary set is the only one read by assistive tech. No change needed. |
| D3 — passport stuck on "Detecting…" | ✅ Fixed | `useUserCountry` now aborts `/api/geo` after **2 s** (was 4 s) and, on timeout **or** error, falls back to `localStorage 'visitplane_passport'` then **"United States"**. On success it also writes `visitplane_passport`. The homepage now persists the user's manual passport choice to the same key. "Detecting…" can no longer outlive hydration. |
| D4 — "Always Updated" copy | ✅ Updated | → "Sourced from official embassy data, verified per route with timestamped updates." |
| D5 — "Trusted Data" copy | ✅ Updated | → "Each route links to official MOFA, embassy, and IATA sources you can independently verify." |

---

## Build / verification status

- `lib/data/interview-questions.ts` → `tsc --strict` **passes** (exit 0).
- All edited `.tsx`/`.ts` files → **parse clean** via esbuild (syntax-validated).
- ⚠️ Full `npm run build` could **not** be run from this environment: the sandbox reaches
  the repo over a network mount that fails Node's heavy random reads (`errno -35`) and git's
  index locking (`Resource deadlock avoided`). **Run `npm run build` locally before deploy**;
  the changes are low-risk (data additions + copy + small logic/JSX tweaks) and Vercel CI
  will also build on push.

## Files changed

```
app/interview-prep/page.tsx                       meta → 7 countries, revalidate=3600
app/interview-prep/components/InterviewSocialProof.tsx   removed dead "225,000+" stat
components/layout/SiteHeader.tsx                   mobile menu mounts only when open
app/page.tsx                                       geo persist + D4/D5 copy
hooks/useUserCountry.ts                            2s timeout + visitplane_passport/US fallback
app/api/interview/email-report/route.ts           unsubscribe link + List-Unsubscribe + result link
app/interview-prep/mock/[id]/MockClient.tsx        posts resultUrl
lib/data/interview-questions.ts                    +134 questions → 30/country (211 total)
SPRINT_CLOSE_LOOPS.md, TODO.md                     new docs
```

## Deploy (run locally — not executed from here)

```
npm run build      # confirm no errors
git add .
git commit -m "chore(polish): close-loops sprint — interview-prep landing fix, mock results verification, question bank expansion, homepage residual bugs"
git push           # triggers Vercel production deploy
```

Post-deploy verification:

```
curl -s https://www.visitplane.com/interview-prep | grep -c "What officers actually ask"   # ≥1
curl -s https://www.visitplane.com/interview-prep | grep -c "225,000"                        # 0
curl -s https://www.visitplane.com/ | grep -c "Check My Visa"                                # 1
```

