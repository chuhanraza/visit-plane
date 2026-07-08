# Group Sync — PRD (MVP)

**Status:** DRAFT — awaiting owner approval before any Phase 2 code.
**Branch:** `feature/group-sync` (never merged/deployed to production without explicit approval).
**Date:** 2026-07-09

Group Sync turns one visa applicant into an acquisition channel: a user planning a
group trip creates a **Crew**, shares an invite link themselves (WhatsApp / copy /
native share sheet), and companions join a shared dashboard that tracks each
person's **document-readiness status — and nothing else**. Each companion is a
new authenticated VisitPlane user with their own private application funnel.

---

## 1. Hard constraints (restated, non-negotiable)

1. **Share-a-link only.** The app never sends SMS/WhatsApp/email to third-party
   contact details. The only invite mechanic is a link the user shares from
   their own device (`wa.me/?text=` prefill, copy-to-clipboard, `navigator.share`
   — all three patterns already exist in this codebase, e.g.
   `app/blog/[slug]/BlogPostClient.tsx`, `components/visa/SourcesAndTrust.tsx`).
   No SMS provider, no contact import, no auto-notify.
2. **Status only, never data.** Crew members see each other's per-document
   **coarse status ticks** (e.g. "Passport: ready") — never files, file names,
   passport numbers, DOB, emails, or any application content. Enforced by
   schema design (the shared table physically contains no PII) + RLS, not by
   client-side filtering.
3. **RLS from the first migration** on every new table; no anon policies;
   one member can never read/write another member's application data.
4. **No `force-dynamic` or `cookies()` in root layout / next-intl config.**
   Crew pages are per-route `force-dynamic` like the existing portal pages
   (`app/portal/(dash)/page.tsx` precedent) — auth'd, noindexed, never ISR.
   Bot-block middleware and 30-day SEO revalidate untouched.
5. **CHECK/enum discipline:** every constrained status column ships with all
   its values in the same migration (lesson from `affiliate_clicks` where a
   missed CHECK value made inserts fail silently).

---

## 2. What exists today (research findings this builds on)

| Piece | Where | Reuse |
|---|---|---|
| Supabase Auth (email+password, signup, magic link) with `?next=` redirect | `app/portal/login`, `app/portal/components/PortalAuthForm.tsx`, `app/portal/auth/callback/route.ts` | Join flow sends unauthenticated invitees to `/portal/login?next=/crew/join/<token>` — zero new auth code |
| Auto-provisioning: signup trigger creates `profiles` + `customers` rows | `supabase/migrations/20260625_evisa_auth_triggers.sql` (`handle_new_evisa_user`) | New users arriving via invite link get profiles automatically |
| Page guard `requireCustomer()` | `lib/portal/auth.ts` | Same guard on all crew pages |
| RLS-scoped server client / browser client / service-role client | `lib/supabase/server.ts`, `client.ts`, `admin.ts` | All crew reads go through the RLS-scoped server client; the join-by-token op uses the service client in one server route with explicit checks (established pattern for privileged ops) |
| Visa application + document upload | `orders` → `order_items` → `order_documents` (private bucket, per-doc `doc_status` pending/approved/rejected); `services.required_documents` jsonb `[{key,label,required}]`; `DocumentUploader` posts to `/api/orders/[id]/documents` | A member's own uploads auto-advance their crew status; `services.required_documents` seeds the crew checklist slots |
| RLS conventions | `20260625_evisa_orders_schema.sql`: RLS on every table, `is_admin()` SECURITY DEFINER helper, ownership via `auth.uid()` joins, idempotent `DROP POLICY IF EXISTS`, `DO $$` enum guards, `evisa_touch_updated_at` trigger | Crew migration follows the exact same style, incl. a `is_crew_member()` SECURITY DEFINER helper mirroring `is_admin()` |
| Rate limiter | `lib/rateLimit.ts` (in-memory sliding window, used by 4 public API routes) | Join/token-lookup endpoints |
| Design system | Tailwind; portal look: white `rounded-2xl` cards, `border-gray-200`, `STATUS_BADGE` maps (`lib/orders/lifecycle.ts`); public look: teal `#14B8A6` accents | Crew UI = portal look; share buttons = existing wa.me/native-share pattern |
| Audit | `audit_log` table (service-role writes) | Crew create/join/leave/rotate-token events audited |

---

## 3. User stories

**Leader (crew creator)**
- As a traveler planning a group trip, I create a Crew (name + destination +
  optional travel date) from my portal, so my companions and I can track
  everyone's document readiness in one place.
- I get a share block with WhatsApp / copy-link / native share so I can invite
  companions myself.
- I see at a glance who is complete and who is pending, per document.
- I can rotate (invalidate + regenerate) the invite link, remove a member, or
  delete the crew.

**Invited member**
- As a companion, I open the invite link, see what the crew is (name,
  destination, member count) and a clear privacy notice, sign in or create an
  account (existing auth), consent, and land on the shared dashboard.
- I mark my own documents ready as I gather them (self-report), and if I start
  a real VisitPlane order, my uploads advance my status automatically.
- I only ever expose coarse ticks to the crew; my actual data stays mine.
- I can leave the crew at any time; leaving deletes my status rows.

**Any member (viewing progress)**
- I see a member × document matrix of ticks with a per-member completion
  count, my own row highlighted and editable, and a clear "Start your visa
  application" CTA (the acquisition funnel).

---

## 4. Exact user flow

### 4.1 Create
1. Signed-in user (portal nav or `/crew`) → **Create a Crew**.
2. Form: crew name, destination country (existing country picker data),
   optional travel date. Submit → insert `crews` row (creator = leader) +
   `crew_members` row for self + default checklist slots seeded.
3. Redirect to `/crew/[id]` which shows the **share block**:
   - WhatsApp: `https://wa.me/?text=<prefilled invite text + link>`
   - Copy link (clipboard)
   - Native share sheet via `navigator.share` where supported (mobile-first;
     69% of traffic is mobile)
   - Link shown: `https://www.visitplane.com/crew/join/<token>`

### 4.2 Join
1. Invitee opens `/crew/join/<token>` (public landing, `noindex`):
   shows crew name, destination, member count, who invited them (leader
   display name), the **privacy notice** (§8), and Join CTA.
   - Invalid/expired token or full crew → friendly error, no info leaked.
2. Not signed in → `/portal/login?next=/crew/join/<token>` (existing auth,
   both sign-in and sign-up paths return via `next`).
3. Signed in → consent checkbox ("Share my document-readiness status with
   this crew") → **Join** → server route validates token (expiry, capacity,
   not already a member), inserts membership + seeds their checklist rows,
   records `consented_at`, audits the join.
4. Redirect to `/crew/[id]` dashboard.

### 4.3 Dashboard `/crew/[id]`
- Header: crew name, destination flag, travel date, member count, share block
  (leader always; members can also share — same link).
- **Progress matrix**: rows = members (display name + "(you)" marker + leader
  badge), columns = document slots. Cell = status tick (see §6).
- Own row: tapping a cell toggles self-reported ready/not-ready; if the slot
  is order-backed (uploaded/approved/rejected), it links to the member's own
  `/portal/orders/[id]` instead of toggling.
- Per-member completion: "4/6 ready". Leader sees the same matrix (no extra
  data) plus Manage: rotate link, remove member, delete crew.
- Acquisition CTA per own row: "Get help with your visa →" → `/order`
  (pre-selecting the crew destination where a matching service exists).
- Footer note (always visible): the privacy notice summary + "Leave crew".

---

## 5. Data model (3 new tables — additive only, nothing existing is touched)

Privacy by schema: **the only table crew-mates can read from each other
(`crew_member_progress`) contains zero PII by construction** — a slot key, a
label, a status enum, and timestamps. There is nothing sensitive in it to leak.

```sql
-- crews: one row per crew
CREATE TABLE crews (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  destination_iso     char(2),                 -- nullable; free-text fallback below
  destination_name    text NOT NULL,
  travel_date         date,
  created_by          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Invite token: 256-bit hex (two UUIDs concatenated, dashes stripped) = unguessable
  invite_token        text UNIQUE NOT NULL DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  invite_expires_at   timestamptz NOT NULL DEFAULT now() + interval '30 days',
  max_members         int NOT NULL DEFAULT 10 CHECK (max_members BETWEEN 2 AND 20),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- crew_members: membership + role + consent
CREATE TABLE crew_members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id       uuid NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          text NOT NULL DEFAULT 'member' CHECK (role IN ('leader','member')),
  display_name  text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 60),
  consented_at  timestamptz NOT NULL DEFAULT now(),   -- consent = joining via link, checkbox recorded
  joined_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (crew_id, user_id)
);

-- crew_member_progress: THE shared surface. Coarse status only — no PII columns exist.
CREATE TABLE crew_member_progress (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id     uuid NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slot_key    text NOT NULL,                  -- 'passport', 'photo', 'bank_statement', ...
  slot_label  text NOT NULL,                  -- display label, e.g. 'Passport (6+ months valid)'
  -- ALL values present from day one (CHECK-constraint lesson):
  status      text NOT NULL DEFAULT 'not_started'
                CHECK (status IN ('not_started','ready','uploaded','approved','rejected')),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (crew_id, user_id, slot_key)
);
```

**Display name:** defaults to the member's `profiles.full_name` **first word**
(first name) at join time; the member can edit it. Emails are never stored in
crew tables and never shown.

**Checklist slots:** seeded at join from the destination's
`services.required_documents` when an active service matches the crew's
destination; otherwise a sensible default set (passport, passport photo,
bank statement, travel itinerary, accommodation proof). Slots live per-member
(seeded copies), so later service changes don't rewrite existing crews.

**Status sync from real orders:** when a member uploads a document through the
existing `/api/orders/[id]/documents` route, a small server-side hook maps
`doc_type` → matching `slot_key` in each crew the uploader belongs to and
advances that row (`uploaded`; review outcomes advance to `approved` /
`rejected`). Writes go through the member's own RLS-scoped session (it is
their own row) — no privileged writes needed. This is the ONLY coupling to
the order system, it flows one way (own order → own coarse status), and it
carries only the status word — never file data.

### Relationships
`crews 1─* crew_members 1─* (per slot) crew_member_progress`, all keyed by
`auth.users.id`. **Deliberately no FK from any crew table to `orders` /
`order_documents`** — the schema cannot express "crew-mate reads my order"
even by accident.

---

## 6. Status model

| Status | Meaning | Set by |
|---|---|---|
| `not_started` | Nothing yet | default at seed |
| `ready` | Self-reported "I have this" | member taps their own cell |
| `uploaded` | Real file uploaded to their own order (pending review) | upload hook, own session |
| `approved` | Reviewed & approved in their order | review hook |
| `rejected` | Rejected — needs attention (shows as an alert tick) | review hook |

Displayed to crew-mates as a tick/dot + word — nothing else. `ready` and
`uploaded/approved` all count toward "complete"; `rejected` shows attention
needed (no reason shown — reasons live in the member's private order page).
A member can downgrade their own `ready` back to `not_started`; order-backed
statuses are not manually togglable (source of truth is their order).

---

## 7. RLS design (the security core)

Mirrors `is_admin()`: a SECURITY DEFINER membership helper avoids recursive
RLS on `crew_members`:

```sql
CREATE OR REPLACE FUNCTION is_crew_member(p_crew_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM crew_members WHERE crew_id = p_crew_id AND user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION is_crew_leader(p_crew_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM crew_members WHERE crew_id = p_crew_id AND user_id = auth.uid() AND role = 'leader');
$$;
```

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `crews` | members of that crew (`is_crew_member(id)`) | any authenticated, `created_by = auth.uid()` | leader only (name/date/expiry/token rotation) | leader only |
| `crew_members` | members of that crew | **none via RLS** — join happens through the token-validating server route (service client; §7.1) except the creator's own leader row (`user_id = auth.uid() AND role='leader' AND created_by` matches) | own row only (display_name) | own row (leave) or leader (remove) |
| `crew_member_progress` | members of that crew | own rows only (`user_id = auth.uid()` + `is_crew_member(crew_id)`) | own rows only | own rows only |

- **No `anon` policies on any crew table.** The public join landing page never
  queries with the browser client: a server route looks up the token with the
  service client and returns ONLY `{name, destination_name, member_count, leader_display_name}`.
- `invite_token` is **stripped from every member-facing SELECT** via a column
  grant approach: the dashboard reads go through a server component that
  selects explicit columns; token is only ever returned to the leader
  (and to members via the share block — members may re-share, which is
  intended: any member can grow the crew).
- **What a member CAN see:** crew name/destination/date/member count; each
  member's display name, role, join date; each member's per-slot status word.
- **What a member CANNOT see (RLS-enforced):** any `orders`, `order_items`,
  `order_documents`, `customers`, `profiles` rows of another user (existing
  policies already scope those to owner-only; crew tables add no new paths to
  them); emails; files; document names; any application field.
- Existing PII tables are **not** given any new policies. Zero changes to
  existing tables or policies.

### 7.1 Join-by-token (the one privileged write)
Pure RLS cannot express "insert me if I hold a valid secret token" without
exposing token-equality probing. Following the codebase's established pattern
(service client for privileged ops behind explicit checks — same as admin
routes), `POST /api/crew/join` runs server-side with the service client:
1. rate-limit by IP + user (`lib/rateLimit.ts`),
2. token exists AND `invite_expires_at > now()`,
3. `count(members) < max_members`,
4. not already a member,
5. consent checkbox value present,
then inserts `crew_members` + seeds `crew_member_progress`, writes `audit_log`.
Everything else (dashboard reads, self status writes, leaves, renames) is
plain RLS-scoped anon-key traffic.

### 7.2 Abuse prevention
- 256-bit random token — unguessable; looked up only via exact match.
- 30-day expiry (leader can extend by rotating).
- Leader-initiated **token rotation** invalidates all previously shared links.
- Crew size cap (10 default, 20 hard max).
- Per-user created-crews cap (5 active) enforced in the create route.
- Rate-limited join + token-lookup endpoints (429 on burst).
- All crew pages `noindex`; join links never appear in sitemaps.
- Bot-block middleware already 403s scrapers before these routes.

---

## 8. Consent & privacy notice (shown on join page + dashboard footer)

> **What your crew can see:** your display name and a simple status for each
> document — like "Passport: ready" — so the group can plan together.
> **What stays private:** your documents, files, passport details, email, and
> everything in your visa application. Crew members can never open or view
> your documents. You can leave the crew at any time, which removes your
> status from the group. By joining, you agree to share your readiness status
> with this crew.

Joining requires ticking a consent checkbox; `consented_at` is recorded.
Leaving deletes the member's `crew_member_progress` rows (CASCADE) — no
orphaned status data.

---

## 9. Routes & pages (all new, no collisions)

| Route | Type | Guard |
|---|---|---|
| `/crew` | My crews list + create form | `requireCustomer()`, `force-dynamic` (route-scoped), noindex |
| `/crew/[id]` | Shared dashboard | member-only (RLS returns nothing otherwise → 404), noindex |
| `/crew/join/[token]` | Public landing + consent + join | public page, minimal server-fetched info, noindex |
| `POST /api/crew` | create crew | auth required |
| `POST /api/crew/join` | token join (§7.1) | auth + rate limit |
| `POST /api/crew/[id]/rotate-token` | leader rotates link | leader |
| `PATCH /api/crew/[id]/progress` | own status toggle | member (RLS) |
| `DELETE /api/crew/[id]/members/[userId]` | leave / leader-remove | RLS |

Portal nav gets one "My crews" link. No changes to `/admin/*` reserved URLs,
no changes to SEO routes, sitemap, robots, middleware, or root layout.

---

## 10. Out of scope for MVP (explicit)

- ❌ Any sending of SMS / WhatsApp / email to third parties (permanently out, not just MVP)
- ❌ Cross-member document access or file sharing of any kind (permanently out)
- ❌ Payments (site-wide flag stays OFF)
- ❌ In-crew chat/comments, reactions, activity feeds
- ❌ Push/email notifications ("X joined your crew" etc.)
- ❌ Leadership transfer, multi-leader, member roles beyond leader/member
- ❌ Guest (unauthenticated) dashboard viewing
- ❌ Editing another member's status (leader included — leaders see, never set)
- ❌ Crew-level group orders/discounts (future idea, needs payments)

---

## 11. Build plan (Phase 2, after approval)

1. **Migration** `supabase/migrations/<date>_group_sync_phase1.sql` — 3 tables,
   2 helper functions, full RLS, triggers, all idempotent, additive only.
   Reviewable before applying; applied to Supabase only when approved.
2. **Lib** `lib/crew/` — types, slot-seeding, status mapping, queries.
3. **Routes/pages** per §9, portal design language, mobile-first.
4. **Share block component** reusing the existing wa.me / clipboard /
   `navigator.share` pattern.
5. **Upload hook**: small addition inside the existing document-upload route
   (own-session write to own progress rows; no behavior change for
   non-crew users).
6. **RLS proof test**: script (vitest, mirrors existing `npm run test` setup)
   that creates users A and B in a crew and asserts: A **can** read B's
   progress status rows; A **cannot** read B's `orders` / `order_items` /
   `order_documents` / `customers` rows (expects zero rows), and A cannot
   UPDATE B's progress. Runs against a Supabase branch/local instance —
   never production data.
7. All commits stay on `feature/group-sync`. Local `next dev` testing;
   Vercel **preview** deployment only if explicitly requested. **No
   production deploy, no merge to main.**

---

## 12. Open questions for the owner

1. **Slot seeding source** — OK to fall back to a generic 5-slot checklist
   when no `services` row matches the destination? (Alternative: require a
   destination with a service, which narrows the funnel.)
2. **Member re-sharing** — any member can see/re-share the invite link
   (grows crews faster). Restrict to leader-only instead?
3. **Crew size default 10 / max 20** — right numbers?
4. **`/crew` vs `/portal/crews`** — proposal uses top-level `/crew` for a
   shareable-feeling URL; happy to nest under `/portal` if you prefer.
