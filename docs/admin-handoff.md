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
