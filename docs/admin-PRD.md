# VisitPlane Operator Admin Backend — PRD

_Phase 0 deliverable. Build is additive, security-first, skeleton-before-features, real-data-only._

## Goal
A production-grade operator control panel for a solo founder: view/act on leads, orders,
affiliates, content, email, and system settings — without exposing customer PII to the public
site and without enabling live card processing.

## Non-negotiable boundaries
- **Additive only.** New `/admin/*` routes + new tables. Never touch/break the public site,
  prune/noindex/redirect, `force-dynamic`, eslint config, visa data, content hub, or E-E-A-T work.
- **RLS on every admin table**; public/anon reads nothing. Admin reads via service-role behind
  `requireAdmin*`. Service-role key never reaches the browser.
- **Payments OFF.** Build payment-READY structure (manual order entry, manual/affiliate revenue
  ledger), flagged off. No live card charging.
- **No fabricated metrics.** Real Supabase data or an explicit "no data yet".
- **No hardcoded defect lists / page counts.** Detect current state dynamically.
- Every destructive action: confirm step + `writeAudit(...)` (actor, action, target, before/after).
- Validate all input with **Zod**. Use `.maybeSingle()`. `node --check`/lint after edits.

## Architecture decision
Build new modules **inside the existing `(evisa)` admin shell** (`app/admin/(evisa)/`), reusing
`requireAdmin()` (layout gate + per-page re-check), `getServiceClient()`, `writeAudit()`, and the
`app_admins` allowlist. Extend the shell nav. **Leave legacy flat pages
(`/admin/affiliates|subscribers|data-quality|seo`) intact** (still gated by ADMIN_SECRET) and link
to them; do not duplicate their URLs. New module URLs are collision-free: `/admin/leads`,
`/admin/orders-revenue` (or `/admin/revenue`), `/admin/affiliate-mgmt`, `/admin/content`,
`/admin/email`, `/admin/settings`; `/admin` (Overview) becomes the operator dashboard;
`/admin/audit` (existing) is the audit viewer.

Folder structure (new):
```
app/admin/(evisa)/leads/            page.tsx + LeadsTable.tsx + LeadDrawer.tsx
app/admin/(evisa)/revenue/          page.tsx + ManualOrderForm.tsx (manual_orders ledger)
app/admin/(evisa)/affiliate-mgmt/   page.tsx + PartnerManager.tsx + ConversionForm.tsx
app/admin/(evisa)/content/          page.tsx
app/admin/(evisa)/email/            page.tsx + Composer
app/admin/(evisa)/settings/         page.tsx
app/api/admin/leads/...             tag/note, export
app/api/admin/revenue/...           create, status
app/api/admin/affiliates/...        partner CRUD, conversion log
app/api/admin/email/...             broadcast trigger
app/api/admin/settings/...          allowlist, flags
lib/admin/*.ts                      data + zod schemas per module
```

## New tables (Phase 1) — RLS deny-all to anon
- **`affiliate_partners`**: id, slug(unique), name, type(insurance/esim/flights/other),
  commission_rate numeric, commission_model text, tracking_link text, active bool, notes,
  created_at, updated_at.
- **`affiliate_conversions`**: id, partner_slug, click_id (nullable FK→affiliate_clicks),
  external_ref, customer_email, amount numeric, currency, commission_amount numeric,
  status(pending/confirmed/paid/rejected), occurred_at, created_at, note.
- **`manual_orders`** (briefing "orders" schema): id, order_ref, customer_email, product_type,
  amount numeric, currency, status(pending/paid/refunded/cancelled), affiliate_partner,
  commission_amount numeric, source, notes, created_at, fulfilled_at. (Separate from e-Visa
  `orders`; this is the manual/affiliate revenue ledger.)
- **`email_subscribers` enrichment**: add `admin_tags text[]`, `admin_note text`.
- Reuse `app_admins` (allowlist), `audit_log` (audit). Add `app_settings` (key/value/jsonb) for
  feature flags incl. `payments_enabled=false`.

## Modules
- **A Dashboard** (`/admin`): real KPIs — total leads, leads 7d, leads by source, wizard
  completions, confirmed vs pending opt-in, affiliate clicks (lifetime/30d) + conversions,
  top countries by interest, email-list growth (sparkline), e-Visa orders snapshot, manual
  revenue total. "no data yet" where empty.
- **B Leads/CRM** (`/admin/leads`): searchable/filterable/paginated `email_subscribers` +
  `data_corrections`; row drawer (full per-person history); CSV export; tag + note (audited).
- **C Orders/Revenue** (`/admin/revenue`): `manual_orders` list + status filters + status change
  (audited) + manual entry; revenue totals from real entries; link to e-Visa `/admin/orders`.
  Payments OFF.
- **D Affiliates** (`/admin/affiliate-mgmt`): partner CRUD, commission rates, tracking links;
  conversion log; per-partner performance from `affiliate_clicks` + `affiliate_conversions`.
- **E Content** (`/admin/content`): indexable pages with index status, last-modified, word count,
  DETECTED quality flags (from `seo_page_content.quality_*`); quick-edit metadata; sitemap regen.
- **F Email** (`/admin/email`): list segments (captured_from/lead_magnet/confirmed), preview +
  trigger Resend broadcast, double-opt-in queue, send stats. Keys never exposed.
- **G Audit** (`/admin/audit`, existing): filter by actor/action/entity_type/date.
- **H Settings** (`/admin/settings`): allowlist mgmt (`app_admins`), API-key STATUS only,
  feature flags incl. payments-off.

## Definition of done (per phase)
Built → committed → pushed → Vercel **READY** verified → non-admin still blocked → `npm run build`
green. No secrets committed. Final: `docs/admin-handoff.md` + NEEDS HAMAD list.
