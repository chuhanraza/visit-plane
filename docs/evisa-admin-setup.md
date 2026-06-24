# e-Visa system — admin & environment setup

## How Hamad becomes an admin

The admin guard (`lib/admin/guard.ts`) accepts **either** credential:

### Option A — legacy admin password (works today)
1. In Vercel → Project → Settings → Environment Variables, set **`ADMIN_SECRET`** to a
   strong secret (this already gates the existing `/admin/*` SEO/affiliate pages).
2. Go to `/admin/login`, enter the secret. You can now reach every `/admin/*` page,
   including the new `/admin/orders`, `/admin/services`, `/admin/invoices`, `/admin/audit`.

### Option B — per-user Supabase admin role (recommended)
1. Create your account at `/portal` (sign up with email + password, confirm email).
2. Find your auth user id:
   - Supabase Dashboard → Authentication → Users → copy your **User UID**, or run SQL:
     ```sql
     select id, email from auth.users where email = 'relianmfg@gmail.com';
     ```
3. Add yourself to the admin allowlist:
   ```sql
   insert into app_admins (user_id, note) values ('<your-user-uid>', 'Hamad — owner');
   -- optional: reflect it on the profile
   update profiles set role = 'admin' where id = '<your-user-uid>';
   ```
4. Your Supabase session now passes `is_admin()` for both RLS and the admin guard — no
   password cookie needed.

> Either credential is sufficient. Option B is preferred long-term because it is
> per-user, revocable, and drives database RLS directly.

## Environment variables

| Var | Required? | Purpose |
|-----|-----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Anon key (browser + RLS-scoped server reads) |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Server-only privileged client (PII, audit, invoices) |
| `ADMIN_SECRET` | for Option A | Legacy admin password (cookie gate) |
| `NEXT_PUBLIC_SITE_URL` | recommended | Absolute URLs in emails / PDFs |
| `RESEND_API_KEY` | optional | Transactional email. Absent → emails are logged, not sent |
| `PAYMENTS_ENABLED` | optional | `true` to enable live Stripe. **Default/absent = OFF (manual invoice mode)** |
| `STRIPE_SECRET_KEY` | for payments | Stripe secret (server) |
| `STRIPE_WEBHOOK_SECRET` | for payments | Verifies Stripe webhook signatures |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | for payments | Stripe.js publishable key |

When an optional var is missing the system **degrades safely** — it never crashes an
order. See `docs/evisa-payments-activation.md` for turning payments on later.
