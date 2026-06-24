# VisitPlane Admin Backend — Current-State Research (Phase 0)

_Authored: 2026-06-25. This documents the EXISTING system before the operator-control-panel
build. The live Supabase project (`wmoywcqadkjxujgwduup`) schema was queried directly via MCP
and is authoritative — local `supabase/migrations/*.sql` files are partially out of sync (see
§6 Migration drift)._

---

## 1. Stack & router

- **Next.js 16.2.6**, App Router, TypeScript, Turbopack.
- React 19.2.4, Tailwind, `next-intl` (locale via `NEXT_LOCALE` cookie set in `middleware.ts`).
- `force-dynamic` is used on dynamic/admin pages; `eslint.ignoreDuringBuilds` must stay true.
- Supabase (Postgres) project `wmoywcqadkjxujgwduup`. Email via **Resend** (`lib/email.ts`).
- Deploy: push to `main` → Vercel auto-deploy (project `prj_1SBNWe04kHh8h0kNYGnySuS0NErR`,
  team `team_mwf0bouQEGPATVzJyGKBm2gE`).
- **`middleware.ts` is locale-only** — it does NOT gate `/admin`. Admin protection is
  layout/page-level (server components calling `requireAdmin()`), and per-route-handler.

---

## 2. Existing Supabase schema (live, RLS-enabled on every table)

### 2a. Public-site / content data
| Table | Rows | Purpose |
|---|---|---|
| `destinations` | 73,366 | Legacy visa rows (country_name, visa_type, pricing, …, data_confidence). |
| `visa_requirements` | 20 | Structured visa engine (enums: visa_category, purpose, data_confidence). |
| `visa_pipeline_audit` | 0 | Gemini/IATA pipeline run log. |
| `data_corrections` | 0 | **User-submitted visa data corrections** (what_is_wrong, corrected_value, source_url, status pending/accepted/rejected, reviewed_by/at, admin_notes). |
| `data_reports` | 0 | Older report table (passport_name, destination_name, issue_type, status). |
| `visa_data_history` | 0 | Field-level change history. |
| `seo_page_content` | 4 | Generated SEO pages + quality flags (word_count, reading_ease, quality_passed, quality_uniqueness, quality_sources_count, quality_min_words_ok, quality_links_ok, generation_status, published, gsc_* metrics). |
| `seo_generation_jobs` | 0 | SEO batch-generation job tracker. |
| `push_subscriptions` | 0 | Web-push subscriptions. |

### 2b. Leads / PII (the CRM surface)
| Table | Rows | Purpose |
|---|---|---|
| **`email_subscribers`** | 6 | **THE single lead store.** email (unique), route_passport, route_destination, captured_at, captured_from, unsubscribe_token, consent_at, ip_address, user_agent, **confirm_token, confirmed_at, unsubscribed_at, lead_magnet** (double-opt-in). |
| `waitlist` | 0 | email + created_at (legacy/unused). |

### 2c. Affiliate tracking
| Table | Rows | Purpose |
|---|---|---|
| **`affiliate_clicks`** | **3,413** | Click log. partner ∈ {safetywing,heymondo,airalo,saily,wayaway,kiwi}; placement ∈ {visa_page,blog_post,homepage,checkout_flow,email}; route_passport, route_dest, blog_slug, clicked_at, user_session_id, user_ip_hash, user_agent. **Clicks only — NO conversion/partner tables exist.** |

### 2d. e-Visa order system (built in prior sprints — DO NOT break/duplicate)
`profiles` (id→auth.users, role customer/admin), **`app_admins`** (user_id allowlist), `services`,
`customers`, `promo_codes`, **`orders`** (order_ref VP-YYYY-NNNNNN, status enum
draft→…→completed/refunded/cancelled, totals, contact_email, internal_notes), `order_items`,
`order_documents`, `invoices` (INV-YYYY-NNNNNN, status unpaid/paid/refunded/void), `payments`
(provider stripe/manual, **flagged off**), `order_status_history`, and **`audit_log`**
(actor, actor_type admin/customer/system, action, entity_type, entity_id, metadata jsonb, ip, created_at).

---

## 3. Auth model (REUSE THIS — do not reinvent)

Two admin-auth mechanisms coexist; the canonical helper accepts **either**:

`lib/admin/guard.ts`:
- **`requireAdmin(redirectTo='/admin/login')`** — for Server Components/pages. Redirects if not admin.
- **`requireAdminApi()`** — for Route Handlers. Returns actor label or `null` (caller 401s).
- **`getAdminIdentity()`** — returns `{ isAdmin, actor }`. Admin if EITHER:
  1. **Legacy `admin_secret`** cookie / `x-admin-secret` header === `process.env.ADMIN_SECRET`
     (set by `POST /api/admin/login`; the current production login at `/admin/login`), OR
  2. **Supabase Auth** session whose `user.id` is in `app_admins` (checked via service-role read).

Supabase clients (`lib/supabase/`):
- `server.ts` → `getSupabaseServerClient()` — anon key + caller cookies, **RLS-scoped**. Use for
  the signed-in user's own data only.
- `admin.ts` → `getServiceClient()` — **service-role, bypasses RLS, server-only** (throws in
  browser; key in `SUPABASE_SERVICE_ROLE_KEY`, never `NEXT_PUBLIC_*`). Use ONLY behind an admin guard.
- `client.ts` → browser anon client.

Audit: `lib/audit.ts` → **`writeAudit({actor, actorType, action, entityType, entityId, metadata, ip})`**
inserts into `audit_log` (best-effort, never throws into caller).

**RLS pattern that locks the public site out:** every admin/PII table has RLS enabled with NO
`anon`/`authenticated`-broad SELECT policy; the public site uses the anon/RLS-scoped client and
therefore reads nothing. All admin reads/writes go through `getServiceClient()` (service-role)
**behind `requireAdmin*`**. The service key is server-only. New admin tables follow the same rule:
RLS enabled, no anon policy, optional `app_admins`-scoped policy for authenticated admins.

---

## 4. Existing admin surface (two shells today)

**A. `(evisa)` route group** — `app/admin/(evisa)/layout.tsx` gates the whole shell with
`requireAdmin()` and renders the dark nav. URLs: `/admin` (Overview), `/admin/orders`,
`/admin/customers`, `/admin/invoices`, `/admin/services`, `/admin/audit`. Data via
`lib/admin/data.ts` (`listOrders`, `getOrderDetail`, `listCustomers`, `listInvoices`,
`dashboardStats`, `listAudit`).

**B. Flat legacy pages** (siblings, NOT under the evisa layout) — each does its OWN inline
`ADMIN_SECRET` cookie check: `/admin/affiliates` (affiliate_clicks analytics),
`/admin/subscribers` (email_subscribers analytics), `/admin/data-quality` (visa pipeline),
`/admin/seo` + `/admin/seo/generate`, `/admin/login`.

**Admin API routes** (`app/api/admin/*`): `login`, `orders/[id]/status`, `orders/[id]/notes`,
`services` (+`[id]`), `invoices/[id]/pay`, `documents/[docId]/review`. Convention:
`requireAdminApi()` → validate → mutate via service-role → `writeAudit()` → JSON.

**Routing constraint:** `/admin/affiliates`, `/admin/subscribers`, `/admin/data-quality`,
`/admin/seo`, `/admin/login` are taken — new modules must use NON-colliding URLs (e.g.
`/admin/leads`, `/admin/affiliate-mgmt`, `/admin/content`, `/admin/email`, `/admin/settings`).

---

## 5. Where lead / email / wizard data actually lands

| User action | Persisted? | Where |
|---|---|---|
| **AI Wizard** (`app/wizard`, `app/api/wizard`) | **No.** Gemini call + in-memory cache only. | — |
| Wizard "email me this" (`app/api/wizard-email`) | Yes | `email_subscribers`, `captured_from='wizard_completion'`, route_passport/destination set |
| Homepage hero signup (`app/page.tsx` → `app/api/subscribe`) | Yes | `email_subscribers`, `captured_from='hero'` |
| Post-lookup modal | Yes | `email_subscribers`, `captured_from='post_lookup'` (+routes) |
| Exit-intent modal | Yes | `email_subscribers`, `captured_from='exit_intent'` |
| Interview-prep email report (`app/api/interview/email-report`) | Email row only | `email_subscribers`, `captured_from='interview_prep'` |
| Blog lead magnets (`components/blog/BlogEmailCapture`) | Yes | `email_subscribers`, `lead_magnet` set |
| Double opt-in confirm / unsubscribe | Yes | `app/api/confirm`, `app/api/unsubscribe` → `confirmed_at` / `unsubscribed_at` |
| **Interview-prep sessions/scores** (`app/interview-prep`, `app/api/interview/feedback`) | **No.** Client-side + in-memory Gemini cache only. | — |
| Affiliate link click (`app/go/[partner]`) | Yes | `affiliate_clicks` (fire-and-forget). Partners in `src/lib/affiliates.ts`. **No conversion postback.** |
| Visa data correction (`app/api/visa/report-correction`) | Yes | `data_corrections` (submitter_email currently not captured) |

**Net:** operator-relevant PII lives in **`email_subscribers`** (segment by `captured_from` /
`lead_magnet`) and **`data_corrections`**. Wizard and interview answers are ephemeral by design.

---

## 6. Migration drift (note, not a blocker)

Live DB has migrations applied via MCP that are NOT mirrored into `supabase/migrations/`:
`create_affiliate_clicks`, `add_double_optin_to_email_subscribers`, `add_unsubscribed_at_…`,
`add_lead_magnet_…`, the `evisa_*` set. The **live schema is authoritative**. New admin
migrations will be applied via MCP AND written to `supabase/migrations/` to reduce future drift.

---

## 7. Entities an operator needs to view/act on

Email captures (newsletter + wizard + lead magnets, by source) · double-opt-in queue ·
visa data corrections · affiliate partners + clicks + **(new) conversions** · e-Visa orders &
invoices (existing) · **(new) manual/affiliate revenue ledger** · SEO/content pages + quality
flags · authors/E-E-A-T (`lib/data/authors.ts`, static) · audit log · admin allowlist &
feature flags/key status.

## 8. Gaps the new build fills (missing today)

1. `affiliate_partners` table (partner config in code only).
2. `affiliate_conversions` table (clicks tracked, conversions not).
3. Manual/affiliate **revenue ledger** (briefing "orders" schema) — separate from e-Visa orders.
4. Lead enrichment (operator tags/notes) on `email_subscribers`.
5. Unified operator dashboard (current `/admin` overview is order-only).
6. Leads CRM (current `/admin/subscribers` is analytics, not a searchable/editable CRM).
7. Email campaign/broadcast surface (Resend is transactional-only today).
8. Settings (allowlist mgmt UI, key-status, feature flags incl. payments-off).
