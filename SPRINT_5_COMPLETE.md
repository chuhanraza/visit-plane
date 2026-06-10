# Sprint 5 Complete — Email Capture Infrastructure

**Date:** June 2026  
**Status:** ✅ Shipped

---

## What was built

### Phase 1 — Backend storage
Storage: **Supabase** (already configured)  
Email delivery: **Resend** (free tier: 3,000 emails/month)

Schema changes applied to `email_subscribers`:
- Added `confirm_token` (text) — sent in confirmation email
- Added `confirmed_at` (timestamptz) — set when user clicks confirmation link
- Added `unsubscribed_at` (timestamptz) — set when user clicks unsubscribe link
- Added indexes on `confirm_token` and `unsubscribe_token` for fast lookups

### Phase 2 — Homepage form (Capture Point 1)
**File:** `app/page.tsx`  
- Wired to `/api/subscribe`
- Consent checkbox now unchecked by default (GDPR compliant)
- Success state now shows "Check your email to confirm"

### Phase 3 — Visa page slide-up (Capture Point 2)
**File:** `components/PostLookupModal.tsx`  
- Slides up from bottom-right after 15 seconds on any `/visa/{passport}/{destination}` page
- Suppresses for 30 days after dismissal (localStorage)
- Consent unchecked by default
- Success state updated to reflect double opt-in

### Phase 4 — Exit intent modal (Capture Point 3)
**File:** `components/ExitIntentModal.tsx`  
- Desktop only (≥768px viewport)
- Fires once when cursor exits viewport via top edge
- **Homepage only** — never fires on visa pages or other routes (fixed this sprint)
- sessionStorage flag prevents re-firing in same session
- Consent unchecked by default

### Phase 5 — Confirmation + unsubscribe flow
**Files:**
- `app/api/subscribe/route.ts` — generates `confirm_token`, sends confirmation email via Resend
- `app/api/confirm/route.ts` — validates token, sets `confirmed_at`
- `app/api/unsubscribe/route.ts` — validates token, sets `unsubscribed_at`
- `app/confirm/page.tsx` — shows ✓ confirmation with "Continue exploring" CTA
- `app/unsubscribe/page.tsx` — shows unsubscribe success with resubscribe option

Every outgoing email includes an unsubscribe link in the footer.  
Double opt-in: subscribers only receive marketing emails after clicking the confirmation link.

### Phase 6 — Admin dashboard
**File:** `app/admin/subscribers/page.tsx`  
Protected by `admin_secret` cookie (same auth as other admin pages).

**URL:** `/admin/subscribers`  
**Password:** your `ADMIN_SECRET` env var

Dashboard shows:
- Total / Confirmed / Unconfirmed / Active subscriber counts
- 30-day daily signup bar chart
- Source breakdown (homepage_form / post_lookup / exit_intent)
- Top passport → destination pairs
- Full subscriber table (last 100, with status badges)
- CSV export button (all subscribers, all fields)

---

## Environment variables required

### Already set
```
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SUPABASE_ANON_KEY
ADMIN_SECRET
```

### Need to add (in Vercel: Settings → Environment Variables)

```
RESEND_API_KEY=re_...        # Get free key at https://resend.com/api-keys
NEXT_PUBLIC_SITE_URL=https://visitplane.com
```

**Steps to get Resend API key:**
1. Go to https://resend.com → Sign up (free, no credit card)
2. Verify your domain `visitplane.com` under Domains
3. Go to API Keys → Create API Key
4. Add key to Vercel env vars + `.env.local`
5. Redeploy

> Until RESEND_API_KEY is set, subscribers are still stored in Supabase — confirmation emails just won't send (graceful degradation, logged as warning).

---

## Manual verification checklist

```
✓ Homepage form: submit with valid email → "Check your email to confirm"
✓ Confirmation email arrives within 60 seconds
✓ Click confirm link → /confirm shows ✓ You're confirmed!
✓ Visa page: stay 15s → modal slides up from bottom-right
✓ Dismiss modal → doesn't appear again for 30 days (localStorage)
✓ Exit intent on desktop homepage → modal appears on cursor-to-top
✓ Exit intent does NOT appear on /visa/* pages
✓ /admin/subscribers shows new entries (after logging in)
✓ Click unsubscribe link in email → /unsubscribe shows success
✓ Consent checkbox is unchecked by default on all 3 capture points
```

---

## Test it yourself

Subscribe from all 3 entry points with `relianmfg@gmail.com`:

1. **Homepage form** → scroll down to "Get Visa Updates for Your Route"
2. **Visa page modal** → visit `/visa/Pakistan/UAE` and wait 15 seconds
3. **Exit intent** → on the homepage (desktop), move cursor to the top of the browser window

Then check `/admin/subscribers` to see all 3 entries.

---

## API summary

| Route | Method | Purpose |
|---|---|---|
| `POST /api/subscribe` | POST | Subscribe, store in Supabase, send confirmation email |
| `GET /api/confirm?token=...` | GET | Confirm subscription, redirect to /confirm |
| `GET /api/unsubscribe?token=...` | GET | Unsubscribe, redirect to /unsubscribe |
| `GET /admin/subscribers` | GET | Admin dashboard (requires auth) |
