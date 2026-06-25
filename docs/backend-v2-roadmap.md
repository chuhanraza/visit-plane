# Operator Backend v2 — Pro-Grade Roadmap

_Synthesis of how the best operator backends work (Shopify, Magento/Adobe Commerce,
BigCommerce, WooCommerce, Stripe, HubSpot, Klaviyo, Intercom, Linear, Metabase/Retool),
mapped to VisitPlane — a lead-gen + affiliate + e-visa-service + programmatic-SEO business
on Supabase (Postgres) + Resend. Built additively on the existing operator admin._

## Guiding principle
VisitPlane has **no physical-goods spine** (no inventory, shipments, shipping zones, tax
engine, POS, SKUs/variations, B2B companies). The *patterns* of great backends transfer
(RBAC, audit, saved views, segments, dashboards, signed webhooks, command palette); the
*nouns* (shipments, packing slips) do not. We **skip**: multi-touch attribution, drag-drop
email designer, SMS/WhatsApp/in-product channels, team-of-teams routing/SLAs, OAuth-app
marketplaces, SCIM/seat-billing, revenue recognition, and **building a BI report builder**
(embed Metabase instead, which speaks Supabase Postgres natively).

## The "best-of" patterns we adopt (impact-ranked)
**Foundational:** event spine (events→metrics→profiles, Klaviyo) · per-lead/order activity
timeline · command palette ⌘K + `/` search (Linear) · signed webhook receiver + affiliate
postback (Stripe/Linear: HMAC over raw body, constant-time compare, ±timestamp replay window,
idempotency) · scoped Read/Write/None API keys (Stripe `rk_`) · per-object RBAC matrix →
Supabase RLS with a concrete role taxonomy (Stripe roles) + least-one-admin guardrail.

**High value:** dynamic segments (jsonb condition tree → SQL) · event-triggered flows
(delays + conditional/trigger splits, cron worker, smart-send suppression) · notification
inbox (read/unread, snooze, subscriptions, digest-vs-immediate) · threshold alert rules ·
saved views = saved filters · bulk actions · consent/double-opt-in/subscription-types ·
KPI dashboards + scheduled email digests · webhook delivery logs + retries · idempotency keys.

**Later (P2):** triage/auto-assignment · inbound rate limiting · send-time optimization ·
A/B testing · cohort/retention · scheduled SQL → CSV email · onboarding checklist ·
GDPR export/erase tooling · login-as-customer (audited) · scheduled-jobs viewer.

Full per-platform inventories with source citations are preserved in the research that
produced this doc (Shopify help, Magento/Adobe Commerce docs, BigCommerce support,
WooCommerce docs, docs.stripe.com, knowledge.hubspot.com, help.klaviyo.com,
developers.intercom.com, linear.app/docs+developers, metabase.com/docs).

## Tracks & status
| Track | Scope | Status |
|---|---|---|
| **1 · Analytics & reporting 2.0** | Date-range + period comparison, conversion funnel, source attribution, daily trend, revenue-by-source, saved report views (`saved_reports`). | **DONE** — `/admin/analytics` |
| **2 · Command palette, search & notifications** | ⌘K palette + `/`-style global search across leads/orders/content/partners; notification bell with merged activity feed + unread marker. | **DONE** — shell-wide |
| **3 · Developer platform** | Scoped, hashed API keys; outbound webhooks (HMAC-signed) + delivery log; **public affiliate conversion postback** (key-auth, idempotent). | **DONE** — `/admin/developers`, `/api/affiliate/postback` |
| **4 · Marketing automation & growth** | Klaviyo-style **event spine** (`marketing_profiles`/`metrics`/`events` with idempotency + backfill) → per-lead timeline; dynamic **segments**; **flows** (trigger→delay→split→Resend) advanced by cron; smart-send suppression; consent/subscription-types. | **PLANNED** |
| **5 · Staff accounts & RBAC** | Roles (owner/admin/analyst/support/viewer) + per-module View/Edit/Delete permissions on `app_admins`; enforce in guard (additive — secret-login & existing admins stay owner); invites; least-one-admin guardrail; key-visibility gated to owner. | **PLANNED** |

## Concrete models for the planned tracks
**Track 4 — marketing on Supabase + Resend** (Klaviyo-distilled): tables `marketing_profiles`
(email, properties jsonb, consent fields), `metrics` (auto-create-by-name), `events`
(profile_id, metric_id, properties, value, time, `unique_id` idempotency, `backfill`),
`segments` (jsonb condition tree compiled to WHERE), `flows` (trigger config), `flow_steps`
(email|delay|conditional_split|trigger_split), `flow_runs` (next_action_at). A cron worker
advances waiting profiles, honoring a smart-send suppression window; Resend open/click
webhooks write back as events for reporting but do **not** trigger flows. Abandoned-wizard
recovery = capture a `wizard.started` event and trigger a flow when no `lead.captured`
follows.

**Track 5 — RBAC → RLS:** roles per Stripe (Administrator/Developer/Analyst/Support/Viewer);
per-object permission matrix (View/Edit/Delete × {all, owned}); **Super Admin** + reusable
permission-set presets; least-one-admin guardrail; viewers cannot see API keys. Additive:
the legacy `admin_secret` login and any existing `app_admins` row map to full **owner** so
nothing breaks; new Supabase-auth staff get assigned roles.

## Boundaries (unchanged from v1)
Additive only; RLS on every new table (anon denied); service-role behind `requireAdmin*`;
no secrets client-side; **payments stay OFF**; real data or "no data yet"; every mutation
audited; Zod-validated input; commit + deploy + verify READY per track.
