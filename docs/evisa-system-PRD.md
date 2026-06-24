# VisitPlane e-Visa Order Management — Product Requirements (PRD)

> Status: **Build sprint** (this document is the source of truth for scope).
> Payments are scaffolded but **flagged OFF** (`PAYMENTS_ENABLED=false`) until Hamad
> supplies live Stripe keys and completes legal/entity setup. Until then the system
> runs in **manual / invoice mode**: orders are created, invoices issued, and an admin
> marks them paid by hand. Nothing charges anyone.

---

## 1. Purpose

Give VisitPlane a secure, auditable system to take e-visa orders from customers and
manage them end-to-end from an admin back office. It handles **PII** (passport numbers,
dates of birth, document scans) and will later handle **payments**, so security, input
validation, access control, and an audit trail are first-class requirements — not
afterthoughts.

This system is **additive**. It introduces new routes (`/order`, `/portal`,
`/admin/orders`, …) and new database tables. It does **not** touch the existing public
marketing site, visa data (`destinations`), SEO engine, blog, or tools.

## 2. Users

| Actor | Who | What they do |
|-------|-----|--------------|
| **Customer** | A traveller buying a visa service | Browses services, places an order, enters traveller details, uploads documents, pays (later), tracks status, downloads invoice. |
| **Admin** | Hamad / VisitPlane staff | Manages all orders, moves them through the lifecycle, reviews documents, manages services & invoices, sees revenue & audit log. |
| **System** | Server (service-role) | Creates audit entries, sends email, generates invoices, processes Stripe webhooks (when enabled). |

## 3. Core entities

| Entity | Purpose |
|--------|---------|
| `customers` | A buyer. Optionally linked to a Supabase Auth user (`user_id`) for the portal; guest orders allowed. |
| `services` | A visa product: country, visa type, govt fee, service fee, processing time, required-documents list. |
| `orders` | One purchase. Has a human ref (`VP-YYYY-XXXXXX`), status, money totals. |
| `order_items` | One traveller / visa within an order. Holds traveller PII and the per-traveller fees. |
| `order_documents` | Uploaded files (passport scans, photos) in a **private** Storage bucket. |
| `invoices` | One per order. Line totals, status (unpaid/paid/refunded/void), optional PDF path. |
| `payments` | A payment attempt/record against an invoice (Stripe or manual). Idempotent on provider id. |
| `order_status_history` | Append-only lifecycle trail (from → to, who, note, when). |
| `audit_log` | Append-only record of **every** sensitive state change (who/what/when/metadata). |
| `promo_codes` | Optional discounts (percent or fixed). |
| `app_admins` | Allowlist of Supabase Auth users designated as admins. |
| `profiles` | One row per auth user (role, name, phone). |

## 4. Order lifecycle

```
draft ──▶ submitted ──▶ awaiting_documents ──▶ in_review ──▶ processing ──▶ approved ──▶ completed
                │              │                    │             │            │
                │              └────────────────────┴─────────────┴──▶ rejected
                └────────────────────────────────────────────────────▶ cancelled
                                                              approved/completed/rejected ──▶ refunded
```

**Allowed transitions** (enforced in code AND by a DB trigger):

| From | Allowed → |
|------|-----------|
| `draft` | submitted, cancelled |
| `submitted` | awaiting_documents, in_review, cancelled |
| `awaiting_documents` | in_review, cancelled |
| `in_review` | processing, awaiting_documents, rejected, cancelled |
| `processing` | approved, rejected, awaiting_documents, cancelled |
| `approved` | completed, refunded |
| `rejected` | in_review, refunded, cancelled |
| `completed` | refunded |
| `refunded` | _(terminal)_ |
| `cancelled` | _(terminal)_ |

Any disallowed transition is rejected (HTTP 422) and never written.

## 5. Money model

- Each **order_item** carries a `govt_fee` and a `service_fee` (VisitPlane's margin),
  captured from the `service` at order time (so later price changes don't rewrite history).
- **Order subtotal** = Σ(item govt_fee + item service_fee).
- **Discount** = from an applied promo code (percent or fixed), if any.
- **Order total** = subtotal − discount.
- An **invoice** is generated per order mirroring these numbers, with an `invoice_number`.
- **Payment** is optional and feature-flagged. With `PAYMENTS_ENABLED=false`, the invoice
  is created `unpaid` and an admin marks it `paid` manually (records a `manual` payment).

All money stored as `numeric(10,2)` with an explicit `currency` (default `USD`). Fees are
**not** invented in seed data — sample services are clearly marked `is_test = true`.

## 6. Security & compliance requirements

1. **RLS on every table.** Customers can read/write only their own rows; admins (via
   `is_admin()`) see all; the server uses `service_role` for privileged operations.
2. **PII server-side only.** Passport numbers, DOB, and documents are read/written through
   server actions / route handlers using the service-role client. The service-role key is
   **never** shipped to the browser.
3. **Documents** live in a **private** Storage bucket (`order-documents`); access is via
   short-lived signed URLs generated server-side for the owner or an admin. No public URLs.
4. **Admin routes are auth-gated server-side.** No admin page or admin API is reachable
   without a valid admin credential (see Architecture §Auth).
5. **Audit log** is written for every state change (order status, invoice paid, document
   review, service edits) with actor, action, entity, and metadata.
6. **Input validation & sanitisation** on every write (server-side schema checks).
7. **Payments are flagged OFF.** No live charge until Hamad provides keys and flips the flag.
   Webhooks verify Stripe signatures and are idempotent.
8. **No secrets in code or git.** Stripe/Supabase/Resend secrets come from env vars only.

## 7. Scope — built now vs deferred

**Built now**
- Full schema + RLS + audit (Phase 1).
- Customer auth (Supabase Auth) + admin gating (Phase 2).
- Customer order flow + dashboard with private document upload (Phase 3).
- Admin panel: orders, detail, status mgmt, customers, invoices, services CRUD, dashboard,
  audit viewer (Phase 4).
- Invoice PDF + Stripe **scaffold** (checkout + webhook) flagged OFF; manual-paid path (Phase 5).
- Email flows via Resend + responsive polish (Phase 6).

**Deferred (needs Hamad)**
- Going live with payments: legal entity, Stripe account + real keys in Vercel env,
  `PAYMENTS_ENABLED=true`, webhook endpoint configured, terms/refund/privacy policies.
- Real visa-service catalogue, fees, and processing times (current ones are TEST data).
- WhatsApp notifications (email only for now).

## 8. Non-goals

- We do not submit anything to any government portal automatically.
- We do not store full card data (Stripe handles PCI scope when enabled).
- We do not modify existing public-site behaviour, visa data, redirects, or `force-dynamic`.
