# Revenue Measurement + Email Activation — System Summary

How the revenue-tracking + email-activation system works, how to read the
dashboard, and what still needs Hamad. Built additively on the existing marketing
spine (see `docs/revenue-tracking-plan.md` for the Phase 0 inventory).

## What is measured

| Signal | Where it's captured | Stored in |
|---|---|---|
| **Visitors / page views** (money pages) | `FunnelBeacon` (root layout) → `POST /api/track` | `marketing_events` (`metric='page.view'`, anonymous `vp_sid` session + page + country in `properties`) |
| **Email captures** | `POST /api/subscribe` (existing) | `email_subscribers` + `lead.captured` event |
| **Opt-in confirmations** | `GET /api/confirm` (existing) | `email_subscribers.confirmed_at` |
| **Affiliate clicks** | `/go/[partner]` redirect (existing, extended) | `affiliate_clicks` — now incl. `source_page` + `country` |
| **Email sends** | flow worker | `marketing_events` (`flow.email_sent`) |

Money pages tracked by the beacon: `/visa/*`, `/seo/*`, `/visa-data*`, `/wizard`,
`/itinerary-generator`, `/blog/*`.

### Privacy
- Anonymous first-party session id only (`vp_sid` cookie). No names/emails on
  page-view or click events.
- IP is **hashed** (affiliate clicks) or not stored (page views); country is the
  coarse Vercel edge header only.
- **Do-Not-Track / Global Privacy Control are honored** client- and server-side.
- No third-party analytics added; no cross-site tracking.
- RLS is enabled on every table involved; the service-role key is server-only.

## The dashboard — `/admin/funnel` ("Revenue & Funnel")

Auth-gated (same admin login as the rest of `/admin`). Date-range filter (7d / 30d
/ 90d / 12mo / custom). Everything is **real data** — empty sources show "no data
yet", nothing is fabricated.

- **Funnel**: Visitors → Email captures → Affiliate clicks, with the conversion
  rate between each step. (The Visitors stage appears once page-view data exists in
  the range — tracking went live with this sprint, so history starts now.)
- **Value per visitor (ESTIMATE)**: shown only after you enter earnings-per-click
  (EPC) estimates. Computed as `Σ(clicks × EPC) ÷ visitors`. Clearly labeled an
  estimate — it is **not** confirmed affiliate revenue. Until you set EPC, affiliate
  clicks are the proxy for value.
- **Email list growth**: captures + confirmations in range, plus all-time list
  size / confirmed / unsubscribed.
- **Affiliate performance**: clicks (and est. value) by **partner**, plus
  breakdowns by **placement**, **country**, and **top source pages** — so you can
  see exactly which pages and placements drive clicks.

`/admin/analytics` (existing) remains the deeper view (cohorts, attribution, daily
trend, revenue-by-source).

## The welcome email sequence

Built on the existing flow engine (`lib/admin/flows.ts`); editable in
`/admin/marketing`.

- **Flow**: "Welcome sequence", trigger `lead.created`, 3 steps:
  1. **Immediate** — lead magnet (visa checklist) + warm intro + a real tip.
  2. **+2 days** — the 3 most useful free tools (wizard, checklist, passport
     strength) → drives back to money pages.
  3. **+4 days** — visa-prep email featuring the relevant affiliates (SafetyWing
     insurance, Airalo eSIM) via tracked `/go?placement=email_sequence` links.
- **Trigger**: on confirmation, `/api/confirm` kicks the flow worker so email 1
  goes out immediately; the daily Vercel cron (`/api/cron/flows`) is the backstop
  for steps 2 & 3.
- **Safety**: only leads confirmed *after* the flow was created are enrolled (no
  retroactive blast of the existing list); idempotent per (flow, email, step);
  every email carries a per-recipient unsubscribe link; unsubscribed/​unconfirmed
  recipients are skipped/cancelled; all sends gated behind the
  `email_broadcasts_enabled` flag.
- Email-driven affiliate clicks are attributed with `placement=email_sequence`.

## NEEDS HAMAD

1. **Enter commission/EPC estimates** at `/admin/funnel` (bottom card) so
   value-per-visitor populates. Use the EPC figure from each partner's dashboard
   (e.g. Travelpayouts). These are estimates only.
2. **Confirm real conversions** in each affiliate program's own dashboard
   (SafetyWing, Airalo, Travelpayouts/WayAway, etc.). We track clicks; partners
   confirm the actual paid conversions. The `subID` on each `/go` link
   (`{partner}_{placement}_{ts}`) is passed through for match-back.
3. **Affiliate IDs**: replace the env placeholders in `src/lib/affiliates.ts`
   (`NEXT_PUBLIC_SAFETYWING_ID`, `NEXT_PUBLIC_AIRALO_CODE`, `NEXT_PUBLIC_TP_MARKER`,
   etc.) once each program is approved, so commissions actually attribute.
4. **Email sending switch**: the welcome sequence sends only when
   `email_broadcasts_enabled` is ON and `RESEND_API_KEY` is set. (Activated this
   sprint — toggle off in `/admin/settings` if ever needed.)
5. **Payments**: still OFF by design. Live card charging needs Hamad's legal entity
   + a payment processor — out of scope here.
