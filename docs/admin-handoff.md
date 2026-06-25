# VisitPlane Operator Admin Backend — Handoff

_Built additively on top of the existing e-Visa admin. All routes live under the
auth-gated `(evisa)` shell at `/admin/*`. Background: `docs/admin-current-state.md`,
`docs/admin-PRD.md`._

## What's live, per module

| Module | Route | Status |
|---|---|---|
| **A. Dashboard** | `/admin` | Live. Real KPIs only: total/7-day leads, confirmed vs pending opt-in, leads-by-source, wizard completions, 12-week lead-growth bars, top destinations, affiliate clicks (lifetime/30d) + conversions, manual revenue, pending corrections, e-Visa order snapshot. Empty sources show **"no data yet"**. |
| **B. Leads / CRM** | `/admin/leads` | Live. Searchable/filterable/paginated `email_subscribers` (by source + opt-in status), row drawer with full per-person record, operator **tags + private note** (audited), **CSV export** (filter-aware, audited). Second tab: user `data_corrections`. |
| **C. Revenue / Orders** | `/admin/revenue` | Live. `manual_orders` ledger: paid-revenue + commission + status totals, manual order entry (Zod), inline status change (audited, sets `fulfilled_at` on paid). **Payments OFF** banner. Links to e-Visa `/admin/orders`. |
| **D. Affiliates** | `/admin/affiliate-mgmt` | Live. `affiliate_partners` (seeded from `src/lib/affiliates.ts`) with per-partner performance from **real** `affiliate_clicks` (~3.4k) + conversions; inline edit (rate/link/active); manual conversion log + form. Links to legacy click analytics. |
| **E. Content** | `/admin/content` | Live. Editor over `seo_page_content`: index status, word count, last-modified, GSC clicks, **DETECTED** pipeline quality flags (`quality_*`, not hardcoded); quick-edit title/meta/h1 (audited); **regenerate-sitemap** action (`revalidatePath`, audited). |
| **F. Email** | `/admin/email` | Live. Real segments (source/lead-magnet, confirmed/pending/unsubscribed); composer with HTML preview + **test send**; segment **broadcast gated behind `email_broadcasts_enabled` (OFF)** → sends only to confirmed+subscribed via Resend with per-recipient unsubscribe link, audited; double-opt-in queue; recent broadcasts from audit log. Open/click stats = "no data yet" (not tracked). |
| **G. Audit log** | `/admin/audit` | Live. Filter by actor/action/entity/date-range; expandable metadata. |
| **H. Settings** | `/admin/settings` | Live. Admin allowlist mgmt (`app_admins` ↔ auth emails, add/remove, audited); feature-flag toggles; **API-key status only** (configured/missing — values never shown). |

Legacy flat admin pages remain intact and linked: `/admin/affiliates`, `/admin/subscribers`,
`/admin/data-quality`, `/admin/seo`.

## Schema added (Phase 1, migration `20260625_admin_operator_backend_phase1.sql`)
`affiliate_partners`, `affiliate_conversions`, `manual_orders`, `app_settings`
(+ `email_subscribers.admin_tags/admin_note`), helper `is_app_admin()`.
RLS **enabled on every new table**, no anon policy (deny-all to public); authenticated
access only via `is_app_admin()`; all server reads use the service-role client behind
`requireAdmin*`.

## Security posture
- **Auth:** every `/admin/*` page gated by `requireAdmin()` (shell layout + per-page); every
  admin API by `requireAdminApi()`. Verified: unauthenticated requests to all new routes
  redirect to `/admin/login`.
- **RLS:** all admin/PII tables RLS-on; public/anon read nothing. Confirmed via `get_advisors`
  (no new ERROR-level findings; the `is_app_admin` WARN matches the existing `is_admin` pattern
  and exposes only the caller's own admin boolean).
- **Service-role key** is server-only (`SUPABASE_SERVICE_ROLE_KEY`, never `NEXT_PUBLIC_*`); the
  client module throws if imported in the browser.
- **Secrets:** none printed or committed. Settings shows key **status** only.
- **Payments:** OFF. `manual_orders` never charges cards; `payments_enabled` flag default false.
- **Audit:** every mutation across modules writes `audit_log` (create/update/status/export/
  broadcast/flag/admin-add-remove/sitemap).
- **Input:** all mutating routes validate with **Zod**; reads use `.maybeSingle()`.
- **No fabricated data:** empty metrics render "no data yet"; quality flags are pipeline-detected;
  no hardcoded page counts or defect lists. (One smoke-test `manual_orders` row was inserted to
  verify the schema, then deleted — table is empty.)

## NEEDS HAMAD
1. **Designate the admin email.** `app_admins` is empty — admin access is currently the legacy
   `ADMIN_SECRET` cookie (`/admin/login`). To use Supabase-Auth admin: sign up/log in once at
   `/portal/login` with your email, then add it in **Settings → Admin allowlist** (or see
   `docs/evisa-admin-setup.md`).
2. **MFA.** Enable MFA for the admin account in the Supabase Auth dashboard (TOTP). The schema is
   MFA-capable; enforcement is a Supabase Auth setting.
3. **Email broadcasts.** Real sends are OFF by default. Enable `email_broadcasts_enabled` in
   Settings only when ready; test-send first. Requires `RESEND_API_KEY` (status shown in Settings).
4. **Affiliate conversions.** Currently logged manually. To automate, wire each partner's
   postback/webhook to insert into `affiliate_conversions` (clicks already carry a subID).
5. **For real payments later (deferred):** a legal entity + payment processor, then the e-Visa
   Stripe activation (`docs/evisa-payments-activation.md`) and flip `payments_enabled`. Flipping
   the flag alone does not charge cards.

---

## Operator Backend v2 (pro-grade tracks)

_Research-driven (Shopify/Magento/BigCommerce/Woo + Stripe/HubSpot/Klaviyo/Intercom/Linear/
Metabase) — see `docs/backend-v2-roadmap.md`. Additive; RLS on every new table; payments still OFF._

| Track | What's live |
|---|---|
| **Analytics 2.0** (`/admin/analytics`) | Date-range + period-over-period comparison; conversion funnel (leads→confirmed→customer); lead-source attribution; revenue-by-source; daily trend; saved report views (`saved_reports`). |
| **Command palette + search + notifications** (shell-wide) | ⌘K palette + global search across leads/orders/content/partners; notification bell with merged real-time activity feed + unread marker. |
| **Developer platform** (`/admin/developers`) | Scoped, sha256-hashed API keys (shown once, revocable); outbound webhooks (HMAC-signed + delivery log); **public affiliate conversion postback** (`/api/affiliate/postback`, key-auth, idempotent). |
| **Marketing automation** (`/admin/marketing`) | Klaviyo-style event spine (`marketing_events`) + per-lead activity timeline; dynamic **segments** (condition tree) usable as email audiences; **flows** (lead-confirm → delay+email steps) run by a daily Vercel cron + manual trigger, gated behind broadcasts flag. |
| **Staff accounts & RBAC** (`/admin/settings`) | Roles (owner/admin/analyst/support/viewer) + per-module View/Edit/Delete matrix on `app_admins`; nav + sensitive pages enforce permissions; staff management owner-gated. Secret-login = full owner (nothing breaks). |

New tables (all RLS-locked, anon denied; confirmed in `get_advisors`): `saved_reports`,
`api_keys`, `webhook_endpoints`, `webhook_deliveries`, `marketing_metrics`,
`marketing_events`, `marketing_segments`, `flows`, `flow_steps`, `flow_runs`
(+ `app_settings`, `app_admins.role/permissions/email`).

### NEEDS HAMAD (v2)
6. **Set `CRON_SECRET`** in Vercel so the flows cron (`/api/cron/flows`) is authenticated
   (Vercel sends `Authorization: Bearer $CRON_SECRET`). Without it the cron still runs via the
   `x-vercel-cron` header, but setting it is recommended.
7. **Flows + broadcasts** only send when `email_broadcasts_enabled` is ON (Settings). On the
   **Hobby** Vercel plan the flows cron runs **once daily** — upgrade to Pro for finer cadence.
8. **RBAC staff:** roles apply to Supabase-Auth users in `app_admins`. The `ADMIN_SECRET`
   login is always full **owner**. Add staff under Settings → Admin allowlist (they sign in once first).
9. **Affiliate postback:** create an API key (scope `affiliate:write`) under Developers and give
   partners the postback URL to auto-log real conversions.
10. **Optional:** embed **Metabase** (connects to Supabase Postgres natively) for ad-hoc BI rather
    than building a report builder — recommended in the research.

---

## v3 — verification + hardening
- **Smoke-tested end-to-end** as owner against production (manual orders, conversions, segments,
  **affiliate postback incl. idempotent dedup**, **flow worker enroll→advance→complete**). Zero
  bugs; all test data purged.
- **RBAC enforced at the API layer:** every mutation route requires its module's permission
  (`requirePermissionApi`), not just hidden in the nav. Owner/secret passes everything.
- **Engagement:** Resend webhook (`/api/webhooks/resend`, Svix-signature verified) records
  delivered/opened/clicked/bounced into the event spine; the Email module shows real 30-day stats.
- **Compliance:** GDPR **export** + **erase** per lead from the drawer (erase deletes the marketing
  footprint, anonymizes the email on retained financial records; audited by hash).
- **Scale:** analytics is window-scoped (no full-table scans); broadcasts send with bounded
  concurrency, capped at 500/request + `maxDuration=60`; webhooks retry 3× with backoff; the
  affiliate postback is rate-limited to 120/min.

## v4 — productivity + ops
- **Leads bulk actions** (multi-select → add/remove tag, export selected) + **saved views**.
- **Setup checklist** on the dashboard ("0→100", real signals, auto-hides when complete).
- **Ops** (`/admin/ops`): live metrics, SEO-job / flow-run / webhook-delivery health, and
  **threshold alert rules** (evaluated on the daily cron + manually) that fire into the audit log
  and the notification bell. New `ops` RBAC module.

New v3/v4 tables (RLS-locked, mirrored in `supabase/migrations/20260625_backend_v2_v4.sql`):
`alert_rules` (+ `webhook_deliveries.attempts`, `app_admins.role/permissions/email`).

### NEEDS HAMAD (v3/v4)
11. **Rotate `ADMIN_SECRET`** — it appeared in smoke-test commands during this build.
12. Set **`RESEND_WEBHOOK_SECRET`** + point Resend's webhook at `/api/webhooks/resend` to turn on
    open/click tracking; set **`CRON_SECRET`** for the flows+alerts cron.
13. Add **alert rules** in Ops (e.g. "failed_webhooks_24h > 0", "pending_corrections > 0").
14. Replace the **placeholder affiliate IDs** in `src/lib/affiliates.ts` with your approved IDs.

## Intentionally deferred (with reasons)
- **Metabase embed for BI** — needs a Metabase instance + (for row/column security) a Pro plan;
  it's a connect-an-external-tool step, not app code. Recommended over building a report builder.
- **Login-as-customer** — would touch the existing e-Visa auth/customer system, which is
  out-of-scope to modify; deferred to avoid risk.
- **A/B testing, cohort/retention, send-time optimization** — higher-complexity marketing polish;
  the event spine + flows already in place are the foundation to add them later.
- **Custom e-Visa order statuses** — the existing `order_status` enum
  (draft→submitted→awaiting_documents→in_review→processing→approved/rejected→completed/refunded/
  cancelled) is already visa-workflow-shaped, so this was unnecessary.
- **Per-staff notification read-state + queued (vs capped) bulk email** — fine for a solo operator
  now; revisit when multi-staff / large lists arrive.

---

## v5 — Shopify-parity gaps
Built to close the *relevant* gaps vs Shopify Admin (the rest — inventory/shipping/tax/POS/themes
— don't apply to a visa site):
- **Discounts** (`/admin/discounts`): promo codes (percent/fixed) over the existing `promo_codes`
  table, with scheduling (valid from/until), usage limits + redemption count, enable/disable.
- **Email templates** (`/admin/email/templates`): editable subject + HTML templates with live
  preview; loadable into the broadcast composer.
- **Scheduled report digests**: operator analytics digest emailed daily/weekly via Resend
  (configured on the Analytics page; sent by the daily cron + "Send now").
- **Wizard funnel + recovery**: the wizard now emits `wizard.started` (anon) + `wizard.completed`
  events; the analytics funnel shows those stages; flows support a **wizard.completed trigger** for
  an abandoned-wizard recovery sequence.

New v5 tables (mirrored in `supabase/migrations/20260625_backend_v5.sql`): `email_templates`
(+ flows `wizard.completed` trigger). Discounts reuse `promo_codes`; digests use `app_settings`.

### NEEDS HAMAD (v5)
15. To send digests + flow/recovery emails for real: set `RESEND_API_KEY`, enable
    `email_broadcasts_enabled`, and set a digest recipient on the Analytics page.
