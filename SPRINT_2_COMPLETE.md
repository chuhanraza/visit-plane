# Sprint 2 — Bug Fixes Complete

**Date:** June 10, 2026  
**Scope:** Fix visa page render bugs + data contradictions  
**Status:** ✅ DONE

---

## Bug 1 — Related Routes Duplicates ✅ FIXED

**Root cause:** The `destinations` table has multiple rows per country (one per visa type — e.g. Tourist, Work, Residence). `fetchRelatedDestinations` and `fetchOtherPassports` did `.limit(5)` on raw rows, returning 5 rows that could include 2–3 duplicates of the same country.

**Fix applied in:** `app/visa/[passport]/[destination]/page.tsx`

Changed both fetch functions to:
- Fetch 25 rows (instead of 5/6) to have enough data after deduplication
- Iterate with a `Set<string>` to collect only unique country names
- Stop once 5 unique entries are found

**Result:**
- "Pakistan also check..." shows 5 distinct destinations
- "Visa requirements for UAE by passport" shows 5 distinct passports
- No country appears more than once in either section

---

## Bug 2 — Cost Field Contradiction ✅ FIXED

**Root cause (two parts):**

1. `ApplicationSteps.tsx` only read `record.price ?? record.fee ?? record.cost` — it did NOT read the actual DB column `pricing`. `VisaHeroCard.tsx` correctly reads `(record as Record<string, unknown>).pricing` as a fallback.

2. `ApplicationSteps.tsx` had a hardcoded `'$90'` fallback when the fee was empty, causing it to always show "$90" even when the hero card showed the real fee (or "Check official source").

**Fix applied in:** `components/visa/ApplicationSteps.tsx`

- `resolveSteps()` now reads `pricing` via the index signature, identical to `VisaHeroCard.resolveSmartFee`
- Removed the hardcoded `'$90'` fallback — if fee is unknown, steps show "Pay visa fee" (no amount) with a note to check the official portal
- Hero and step #4 now read from the same source — they will always match

**Effect for Pakistan → UAE (eVisa Required, AED 300 ~$82):**
- Hero shows: `Cost: AED 300 (~$82)`
- Step #4 shows: `Pay AED 300 (~$82) visa fee`

---

## Bug 3 — Duplicate "Check My Visa →" Button ✅ FIXED

**Root cause:** Desktop CTA had class `hidden sm:inline-flex` (visible from 640px+), but the hamburger menu has class `md:hidden` (visible below 768px). At viewport widths 640–767px both the desktop CTA AND the hamburger (plus its mobile menu CTA) were simultaneously visible.

**Fix applied in:** `components/layout/SiteHeader.tsx`

Changed desktop CTA from `hidden sm:inline-flex` → `hidden md:inline-flex`

**Visibility matrix after fix:**

| Viewport | Desktop CTA | Hamburger | Mobile Menu CTA |
|----------|-------------|-----------|-----------------|
| < 640px  | ❌ hidden   | ✅ visible | Only when menu open |
| 640–767px| ❌ hidden   | ✅ visible | Only when menu open |
| 768px+   | ✅ visible  | ❌ hidden  | N/A (menu hidden) |

---

## Files Changed

1. `app/visa/[passport]/[destination]/page.tsx` — Bug 1 fix (deduplication)
2. `components/visa/ApplicationSteps.tsx` — Bug 2 fix (fee consistency)
3. `components/layout/SiteHeader.tsx` — Bug 3 fix (CTA visibility)

## Commit

```
fix(visa): deduplicate related routes, fix cost contradiction, remove duplicate CTA
```
