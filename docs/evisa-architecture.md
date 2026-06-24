# VisitPlane e-Visa System — Architecture

Companion to [`evisa-system-PRD.md`](./evisa-system-PRD.md). Covers the data model (ERD),
RLS/security model, auth, storage, money flow, and the route map.

Stack: **Next.js 16.2.6** (App Router, TS, Turbopack/webpack build), **Supabase**
(Postgres + Auth + Storage) project `wmoywcqadkjxujgwduup`, **Tailwind v4**, **Resend**
(email), **Stripe** (scaffolded, flagged off), **jsPDF** (invoices). Deploys to Vercel on
push to `main`. `output: force-dynamic` and `eslint.ignoreDuringBuilds` are preserved.

---

## 1. ERD

```
                          ┌────────────────┐
                          │   auth.users   │  (Supabase Auth)
                          └───────┬────────┘
                     user_id (nullable, unique)
        ┌────────────────┐   │            ┌──────────────┐        ┌──────────────┐
        │   profiles     │◀──┘            │  app_admins  │        │  promo_codes │
        │  (role, name)  │                │  (user_id)   │        └──────┬───────┘
        └────────────────┘                └──────────────┘               │ promo_code_id (nullable)
                                                                          │
        ┌────────────────┐        ┌────────────────────┐ ────────────────┘
        │   customers    │◀───────│       orders       │
        │ id, user_id?,  │ cust_id│ id, order_ref,     │
        │ email, name,   │        │ status, totals,    │
        │ phone          │        │ currency, contact  │
        └────────────────┘        └─────────┬──────────┘
                                            │ order_id
            ┌───────────────┬───────────────┼────────────────┬──────────────────┐
            │               │               │                │                  │
   ┌────────▼──────┐ ┌──────▼───────┐ ┌─────▼────────┐ ┌─────▼─────────┐ ┌──────▼──────────────┐
   │  order_items  │ │order_documents│ │   invoices   │ │   payments    │ │ order_status_history│
   │ traveller PII,│ │ doc_type,     │ │ number, status│ │ provider,     │ │ from→to, by, note   │
   │ govt+svc fee  │ │ storage_path  │ │ totals, pdf   │ │ amount, status│ │                     │
   └───────┬───────┘ └───────────────┘ └──────┬────────┘ └──────┬────────┘ └─────────────────────┘
       service_id                          invoice_id ◀─────────┘
           │
   ┌───────▼───────┐                    ┌──────────────┐
   │   services    │                    │  audit_log   │  (append-only, actor/action/entity/meta)
   │ country, type,│                    └──────────────┘
   │ fees, docs[]  │
   └───────────────┘
```

## 2. Tables (key fields)

- **profiles** — `id`(=auth uid PK), `role`(`customer`|`admin`), `full_name`, `phone`, ts.
- **app_admins** — `user_id`(PK→auth.users). Allowlist; presence ⇒ admin.
- **customers** — `id`, `user_id?`(→auth.users, unique), `email`, `full_name`, `phone`, ts.
- **services** — `id`, `country_iso`, `country_name`, `visa_type`, `description`,
  `govt_fee`, `service_fee`, `currency`, `processing_days_min/max`,
  `required_documents jsonb` (`[{key,label,required}]`), `active`, `is_test`, ts.
- **orders** — `id`, `order_ref`(unique, `VP-YYYY-XXXXXX`), `customer_id`→customers,
  `status order_status`, `currency`, `subtotal_govt`, `subtotal_service`, `discount_total`,
  `total`, `promo_code_id?`, `contact_email`, `internal_notes`, `submitted_at`, ts.
- **order_items** — `id`, `order_id`, `service_id`, `service_snapshot jsonb`,
  `traveler_full_name`, `traveler_passport_number`(PII), `traveler_dob`,
  `traveler_nationality`, `traveler_passport_expiry`, `govt_fee`, `service_fee`,
  `line_total`, ts.
- **order_documents** — `id`, `order_id`, `order_item_id?`, `doc_type`, `file_name`,
  `storage_path`(private), `file_size`, `mime_type`, `status`(`pending`|`approved`|`rejected`),
  `uploaded_by`, `reviewed_by`, `reviewed_at`, ts.
- **invoices** — `id`, `order_id`(unique), `invoice_number`(unique), `status`
  (`unpaid`|`paid`|`refunded`|`void`), `currency`, `subtotal`, `discount`, `total`,
  `amount_paid`, `issued_at`, `due_at`, `paid_at`, `pdf_path?`, ts.
- **payments** — `id`, `invoice_id`, `order_id`, `provider`(`stripe`|`manual`),
  `provider_payment_id?`(unique — idempotency), `amount`, `currency`,
  `status`(`pending`|`succeeded`|`failed`|`refunded`), `method`, `raw jsonb`, ts.
- **order_status_history** — `id`, `order_id`, `from_status?`, `to_status`, `changed_by`,
  `note`, `created_at`.
- **audit_log** — `id`, `actor`, `actor_type`(`admin`|`customer`|`system`),
  `action`, `entity_type`, `entity_id`, `metadata jsonb`, `ip`, `created_at`.
- **promo_codes** — `id`, `code`(unique), `description`, `discount_type`(`percent`|`fixed`),
  `discount_value`, `currency`, `max_redemptions?`, `times_redeemed`, `active`,
  `valid_from?`, `valid_until?`, `is_test`, ts.

## 3. Security / RLS model

A `SECURITY DEFINER` function `public.is_admin()` returns true when `auth.uid()` is in
`app_admins`. RLS is enabled on **every** table. Summary:

| Table | anon | authenticated customer | admin (`is_admin()`) | service_role |
|-------|------|------------------------|----------------------|--------------|
| services | SELECT where `active` | SELECT where `active` | ALL | ALL |
| customers | — | R/W **own** (`user_id=auth.uid()`) | ALL | ALL |
| orders | — | R own; insert own | ALL | ALL |
| order_items | — | R own (via order) | ALL | ALL |
| order_documents | — | R/insert own (via order) | ALL | ALL |
| invoices | — | R own (via order) | ALL | ALL |
| payments | — | R own (via order) | ALL | ALL |
| order_status_history | — | R own (via order) | ALL | ALL |
| audit_log | — | — | SELECT | ALL (insert) |
| promo_codes | — | — | ALL | ALL |
| profiles / app_admins | — | R own profile | ALL | ALL |

**Principle:** the browser only ever uses an **anon** client carrying the customer's own
session — RLS confines it to their rows. All privileged work (admin reads of all PII,
audit writes, invoice/payment mutations, Storage signed URLs) runs **server-side** with the
**service-role** client, which is never exposed to the client bundle.

## 4. Auth & roles

- **Customer auth:** Supabase Auth (email/password + magic link) via `@supabase/ssr`.
  Cookie-based sessions. Server reads the session with a server client; `/portal/*` is
  protected and redirects to `/portal/login`.
- **Admin gating:** server-side guard `requireAdmin()` in `lib/admin/guard.ts` accepts
  **either**
  1. the existing **`admin_secret`** httpOnly cookie === `ADMIN_SECRET` (the current admin
     login at `/admin/login`, already in production), **or**
  2. a Supabase session whose user is in **`app_admins`**.

  This bridges the existing password-cookie admin with a proper per-user role model.
  Every `/admin/*` page and `/api/admin/*` handler calls the guard and `redirect`s / 401s
  on failure. Admin DB reads use the service-role client *after* the guard passes.

### How Hamad becomes admin
- **Today (works now):** set `ADMIN_SECRET` in Vercel env and log in at `/admin/login`.
- **Per-user (recommended once he has an account):** sign up via `/portal`, then insert his
  auth user id into `app_admins` (SQL in `docs/evisa-admin-setup.md`). His session then
  passes `is_admin()` for both RLS and the guard.

## 5. Storage

- Private bucket **`order-documents`** (not public). Path:
  `orders/{order_id}/{uuid}__{safe_filename}`.
- Uploads go through a server route that validates ownership, MIME type, and size (≤10 MB;
  jpeg/png/webp/pdf), then writes with the service-role client.
- Downloads/views use **short-lived signed URLs** minted server-side only for the owning
  customer or an admin. No public links, ever.

## 6. Money flow

1. Customer builds an order from `services`; each traveller becomes an `order_item` with the
   service's fees snapshotted.
2. On **place order**, the order goes to `submitted`, an `invoice` is created `unpaid`, a
   `confirmation` email is sent, and an `order_status_history` + `audit_log` row are written.
3. **Manual mode (default):** admin marks the invoice `paid` → records a `manual` payment,
   advances the order, writes audit + history, emails the customer.
4. **Stripe mode (flagged on later):** customer is sent to a Checkout Session; the webhook
   (`payment_intent.succeeded` / `checkout.session.completed`) verifies the signature, is
   idempotent on `provider_payment_id`, marks the invoice paid, and advances the order.
   Payment status is **never** trusted from the client.

## 7. Route map (new, additive)

```
/order                      Customer order flow (pick service → travellers → docs → review → place)
/order/[ref]/confirmation   Post-submit confirmation
/portal/login               Customer sign-in / magic link
/portal                     Customer dashboard (their orders, statuses, invoices, doc upload)
/portal/orders/[id]         Order detail for the customer
/admin/orders               Admin orders table (filter/search/sort/paginate)
/admin/orders/[id]          Admin order detail (PII, docs, status mgmt, invoice, notes, history)
/admin/customers            Admin customer list + history
/admin/services             Admin services CRUD
/admin/invoices             Admin invoice list / mark paid / PDF
/admin/audit                Admin audit-log viewer
/admin (overview)           Counts by status, revenue, recent orders

API (all admin endpoints behind requireAdmin):
/api/orders                 POST create order (server, validated)
/api/orders/[id]/documents  POST upload (server, ownership-checked, service-role to Storage)
/api/admin/orders/[id]/status   POST transition (allowed-transition enforced)
/api/admin/invoices/[id]/pay    POST mark paid (manual) / refund
/api/admin/services         POST/PATCH/DELETE
/api/stripe/webhook         Stripe webhook (flagged; signature-verified, idempotent)
/api/invoices/[id]/pdf      GET branded PDF (owner or admin)
```

## 8. Feature flags & env

| Var | Purpose | Default |
|-----|---------|---------|
| `PAYMENTS_ENABLED` | Turn live Stripe on/off | `false` |
| `STRIPE_SECRET_KEY` | Stripe secret (server) | _unset → manual mode_ |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature secret | _unset_ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe.js publishable key | _unset_ |
| `ADMIN_SECRET` | Legacy admin password (cookie gate) | _required for admin_ |
| `RESEND_API_KEY` | Email sending | _unset → emails skipped/logged_ |
| `NEXT_PUBLIC_SITE_URL` | Absolute links in emails/PDF | site origin |
| `SUPABASE_SERVICE_ROLE_KEY` | Server privileged client | _required_ |

When a flag/key is absent the system **degrades safely**: no Stripe → manual invoice mode;
no Resend → email is logged, not sent; never an exception that blocks an order.
