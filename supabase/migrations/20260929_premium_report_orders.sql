-- Premium Visa Report (Rs 2,000 PKR one-time) orders, paid via RapidGateway hosted checkout.
-- Additive only. SERVICE-ROLE ONLY: RLS enabled with NO policies and all anon/authenticated
-- privileges revoked. Rows are written by the create route + verified webhook; the browser
-- only ever reads status through /api/checkout/rapidgateway/status.

create table if not exists public.premium_report_orders (
  id                  uuid primary key default gen_random_uuid(),
  basket_id           text not null unique check (char_length(basket_id) <= 64),
  status              text not null default 'pending' check (status in ('pending','paid','failed')),
  passport_country    text not null,
  destination_country text not null,
  customer_email      text not null,
  customer_mobile     text not null,
  amount              numeric(12,2) not null default 2000.00,
  currency            text not null default 'PKR' check (currency = 'PKR'),
  gateway_txn_ref     text,
  webhook_event_id    text,
  created_at          timestamptz not null default now(),
  paid_at             timestamptz
);

-- De-dup: a given gateway eventId can be recorded against at most one order.
create unique index if not exists premium_report_orders_webhook_event_uidx
  on public.premium_report_orders (webhook_event_id) where webhook_event_id is not null;
create index if not exists premium_report_orders_created_idx
  on public.premium_report_orders (created_at desc);

alter table public.premium_report_orders enable row level security;
revoke all on public.premium_report_orders from anon, authenticated;
