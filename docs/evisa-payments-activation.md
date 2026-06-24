# Activating online payments (Stripe) — for Hamad

Payments are **scaffolded but OFF by default**. Until you complete the steps below the
system runs in **manual / invoice mode**: every order still creates an invoice, and an
admin marks it paid from `/admin/orders/[id]` (or `/admin/invoices`). Nothing is charged.

## What's already built
- `POST /api/checkout` — creates a Stripe Checkout Session (returns a `manual` message
  while disabled).
- `POST /api/stripe/webhook` — verifies the Stripe signature, is **idempotent** on the
  payment-intent id, marks the invoice paid, records a `payments` row, and advances a
  submitted order into review. Payment status is never trusted from the client.
- Customer "Pay now" button on `/portal/orders/[id]`.
- Feature flag resolution in `lib/payments/config.ts`.

## Prerequisites (your side)
1. A registered business / legal entity that can accept card payments.
2. A Stripe account (activated, with a bank account connected for payouts).
3. Terms of Service, Refund Policy, and Privacy Policy published (Stripe requires these).

## Switch it on
1. In **Vercel → Project → Settings → Environment Variables** add:
   | Var | Value |
   |-----|-------|
   | `PAYMENTS_ENABLED` | `true` |
   | `STRIPE_SECRET_KEY` | `sk_live_…` (from Stripe → Developers → API keys) |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_…` |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_…` (from step 2) |
   | `NEXT_PUBLIC_SITE_URL` | `https://visitplane.com` |
2. In **Stripe → Developers → Webhooks**, add an endpoint:
   - URL: `https://visitplane.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`
   - Copy the **Signing secret** into `STRIPE_WEBHOOK_SECRET`.
3. Redeploy (any push to `main`, or "Redeploy" in Vercel). Both `PAYMENTS_ENABLED=true`
   **and** a `STRIPE_SECRET_KEY` must be present for live charging — otherwise it stays
   in manual mode automatically.
4. Test with Stripe **test keys** first (`sk_test_…`/`pk_test_…`) and a test card
   (`4242 4242 4242 4242`) before flipping to live keys.

## Turning it back off
Set `PAYMENTS_ENABLED=false` (or remove `STRIPE_SECRET_KEY`) and redeploy. The system
reverts to manual mode with no code changes.

## Safety properties
- The secret key is server-only (never shipped to the browser).
- The webhook rejects unsigned/forged requests and processes each payment once.
- Invoice "paid" state is set **only** by the verified webhook (Stripe mode) or an
  explicit admin action (manual mode) — never by the customer's browser.
