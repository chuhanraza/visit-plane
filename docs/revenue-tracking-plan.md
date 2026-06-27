# Revenue Measurement + Email Activation — Plan & Inventory

_Phase 0 of the revenue sprint. Documents what already exists (a prior sprint built
a large marketing/admin spine) vs. the real gaps this sprint fills. Additive only —
no payments, no public-site changes, RLS on every new table._

## TL;DR — what exists vs. what's missing

| Capability | State | This sprint |
|---|---|---|
| `/go/[partner]` affiliate redirect + click logging | **EXISTS** (5,675 rows logged) | Extend: capture `source_page` (referrer) + `country` |
| `affiliate_clicks` table (RLS) | **EXISTS** | Add `source_page`, `country` columns |
| Affiliate links carry `placement` | **EXISTS** on visa pages, blog, footer | Standardize + add placements for SEO money pages |
| Affiliate links on `/seo/cheapest`, `/seo/route`, `/itinerary-generator` | **MISSING** | Phase 5 — add tasteful offers |
| Funnel events (`marketing_events` + `recordEvent`) | **EXISTS** (lead.captured, wizard.started/completed) | Add `page.view` on money pages |
| Page-view / "visitors" tracking | **MISSING** (analytics.ts notes this gap explicitly) | Phase 2 — lightweight first-party beacon |
| Admin analytics dashboard | **EXISTS** (`/admin/analytics`) | Complement, don't duplicate |
| Affiliate-click breakdown by partner/placement/page/country | **MISSING** | Phase 3 — new Revenue & Funnel view |
| Value-per-visitor estimate | **MISSING** | Phase 3 — editable commission-per-partner |
| Email flows engine (`flows`/`flow_steps`/`flow_runs`, cron worker) | **EXISTS** but **0 flows seeded** | Phase 4 — seed + activate welcome sequence |
| Double opt-in (subscribe → confirm → unsubscribe) | **EXISTS** | Reuse; kick worker on confirm for instant email 1 |
| Welcome/onboarding email sequence | **MISSING** (only the confirmation email is sent) | Phase 4 — 3-email sequence via Resend |

## 1. Affiliate routes — `/go/[partner]`

- `app/go/[partner]/route.ts`: validates partner against `AFFILIATE_PARTNERS`
  (`src/lib/affiliates.ts`), logs a row to `affiliate_clicks` **fire-and-forget**
  (never blocks the 302), builds the partner URL with a `subID`
  (`{partner}_{placement}_{ts}`) for conversion match-back, sets a `vp_sid` session
  cookie, returns `no-store` + `noindex`.
- Partners: `safetywing`, `heymondo` (insurance), `airalo`, `saily` (eSIM),
  `wayaway`, `kiwi` (flights). All via Travelpayouts where available. IDs are
  env-driven placeholders until Hamad's affiliate applications are approved.
- `affiliate_clicks` columns today: `id, partner, placement, route_passport,
  route_dest, blog_slug, clicked_at, user_session_id, user_ip_hash, user_agent`.
  **Gap:** no `source_page` (referrer URL) and no `country`.
- `affiliateTrackingUrl(partner, {placement, destIso, routePassport, blogSlug})`
  builds the `/go/...` CTA. Used by `TravelReadinessGrid` (visa pages, wizard
  results), `BlogTripBox` + `app/blog/[slug]` (blog), `SiteFooter`.
- `placement` enum: `visa_page | blog_post | homepage | checkout_flow | email`.
  **Gap:** no placement for the SEO winner pages.
- All affiliate `<a>` tags use `rel="nofollow sponsored"` + an FTC disclosure block. ✅ honest/disclosed.

## 2. Email stack

- `email_subscribers` (RLS, 9 rows): `email, route_passport, route_destination,
  captured_at, captured_from, confirm_token, confirmed_at, unsubscribe_token,
  unsubscribed_at, consent_at, lead_magnet, ip_address, user_agent, admin_tags, admin_note`.
- `POST /api/subscribe`: validates email + consent, inserts subscriber, sends a
  **double-opt-in confirmation email** (Resend, direct fetch), records
  `lead.captured`. Resend-from `alerts@visitplane.com`.
- `GET /api/confirm?token=`: sets `confirmed_at` (idempotent), redirects to `/confirm`.
- `GET /api/unsubscribe?token=` + `/unsubscribe` page: sets `unsubscribed_at`.
- `lib/email.ts`: Resend wrapper — `sendBroadcastEmail` (per-recipient unsubscribe
  footer), `sendInternalEmail`, order templates. Degrades safely when
  `RESEND_API_KEY` is unset (logs, never throws). From `orders@visitplane.com`.
- **Only the confirmation email is sent today.** No onboarding/welcome sequence runs.

## 3. Email flows engine (already built, unused)

- Tables: `flows` (0 rows), `flow_steps`, `flow_runs`.
- `lib/admin/flows.ts` `runFlowWorker()`: enrolls newly-confirmed leads
  (`confirmed_at >= flow.created_at` — so it never retroactively spams the existing
  list), advances due `flow_runs`, sends each step via `sendBroadcastEmail`, honors
  unsubscribe + a suppression window, is idempotent (`flow_runs` upsert on
  `flow_id,email`), and is gated behind the `email_broadcasts_enabled` flag.
- `GET /api/cron/flows`: worker tick (Vercel cron, `CRON_SECRET`, or admin). Cron in
  `vercel.json` runs **daily at 08:00**.
- Triggers: `lead.created`, `wizard.completed`.
- **Gap:** no welcome flow is seeded or active. With the daily cron, step-1 (delay 0)
  would fire up to 24h late — Phase 4 also kicks the worker on confirm for instant delivery.

## 4. Admin panel

- Route group `app/admin/(evisa)/*` (auth via `requireAdmin()` / `requireAdminApi()`
  in `lib/admin/guard.ts`). Existing views: dashboard, orders, customers, invoices,
  services, leads, content, audit, marketing (flows + segments), ops, promos,
  revenue (manual/affiliate ledger), email (composer + suppression + templates),
  analytics, developers, affiliate-mgmt, settings.
- `/admin/analytics` (`lib/admin/analytics.ts`): KPIs, conversion funnel
  (wizard→leads→confirmed→customers), lead-source attribution, daily trend, revenue
  by source, cohorts. **Real data only**; explicitly excludes "visits" (none tracked).
  Affiliate clicks shown only as a single total.
- `/admin/revenue` (`lib/admin/revenue.ts`): manual/affiliate revenue ledger
  (`manual_orders`), partner list. **Payments OFF** — operator-recorded, no charging.

## 5. Capture + lead-magnet placements

- Capture surfaces: homepage (`app/page.tsx`), `ExitIntentModal`, `PostLookupModal`,
  `BlogEmailCapture`. All POST `/api/subscribe` with `captured_from` + `lead_magnet`.

## Plan for this sprint (gaps only)

1. **Phase 1** — add `source_page` + `country` to `affiliate_clicks`; capture
   `Referer`/`?source=` + `x-vercel-ip-country` in `/go`; standardize params.
2. **Phase 2** — `POST /api/track` first-party beacon → `page.view` in
   `marketing_events` (anonymous `vp_sid`, page path, country). Money pages only.
   DNT-respecting, no third-party analytics.
3. **Phase 3** — new `/admin/funnel` "Revenue & Funnel" view: visitors → captures →
   clicks funnel + rates; affiliate clicks by partner / placement / source page /
   country; value-per-visitor **estimate** (editable commission per partner, clearly
   labeled estimate). Date range.
4. **Phase 4** — seed + activate a 3-step welcome flow (delays 0 / 2d / 4d) using the
   existing engine; kick the worker on confirm for instant email 1; cron backstop;
   email CTAs use `/go?placement=email`; unsubscribe-safe + idempotent.
5. **Phase 5** — add tasteful, relevant, disclosed affiliate offers to the proven
   pages that have none (`/seo/cheapest/[nationality]`, `/seo/route/...`,
   `/itinerary-generator`); standardize placement + source.

## Guardrails honored

ADDITIVE only · RLS on every new table/column · service-role server-only · no secrets
client-side · payments OFF · honest + disclosed affiliates · unsubscribe on every
marketing email · no fabricated metrics (real data or "no data yet") · privacy:
anonymous sessions, IP hashed, DNT respected, no cross-site tracking.
