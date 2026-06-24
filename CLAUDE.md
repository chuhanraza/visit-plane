@AGENTS.md

# Operator Admin Backend — conventions & boundaries

Full detail: `docs/admin-current-state.md` and `docs/admin-PRD.md`.

## Stack
Next.js 16.2.6 App Router + TS + Turbopack. Supabase project `wmoywcqadkjxujgwduup`.
Resend for email. Vercel auto-deploy on push to `main`. Keep `force-dynamic` on dynamic admin
pages and `eslint.ignoreDuringBuilds`.

## Admin auth & data (REUSE — never reinvent)
- Gate pages with `requireAdmin()` and route handlers with `requireAdminApi()` from
  `lib/admin/guard.ts` (accepts legacy `admin_secret` cookie OR a Supabase Auth user in
  `app_admins`).
- Privileged reads/writes use `getServiceClient()` (`lib/supabase/admin.ts`, service-role,
  server-only) ONLY behind an admin guard. RLS-scoped user data uses `getSupabaseServerClient()`.
- Every destructive/mutating action calls `writeAudit(...)` (`lib/audit.ts`).
- Validate input with Zod. Use `.maybeSingle()`. Run `node --check`/lint after edits.

## Hard boundaries
- ADDITIVE only: new `/admin/*` routes + new tables. Do NOT touch/break the public site,
  prune/noindex/redirect, visa data, content hub, or E-E-A-T/disclaimer work.
- RLS on EVERY admin/PII table; anon/public reads nothing. Service-role key never `NEXT_PUBLIC_*`,
  never client-side.
- PAYMENTS OFF — manual orders + affiliate ledger only, flagged off. No live card charging.
- No fabricated metrics (real data or "no data yet"). No hardcoded defect lists / page counts.
- New module URLs must not collide with existing: `/admin`, `/admin/orders`, `/admin/customers`,
  `/admin/invoices`, `/admin/services`, `/admin/audit`, `/admin/affiliates`, `/admin/subscribers`,
  `/admin/data-quality`, `/admin/seo`, `/admin/login` are taken.
- Never print or commit secrets. Commit only admin-build files — leave unrelated working-tree
  changes (homepage/marquee work) untouched.
