/**
 * Supabase server client (RSC / Route Handlers / Server Actions).
 * Uses the ANON key + the caller's session cookies, so every query is RLS-scoped
 * to the signed-in user. NEVER use this for privileged/admin reads of others' PII —
 * use `lib/supabase/admin.ts` (service-role) behind an admin guard for that.
 *
 * Next 16: cookies() is async and Server Components cannot write cookies, so setAll
 * is wrapped in try/catch (no-op in RSC; works in Route Handlers / Server Actions).
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Called from a Server Component — cookie writes are not allowed here.
            // Token refresh still happens in Route Handlers / Server Actions.
          }
        },
      },
    },
  )
}

/** Convenience: the current signed-in auth user (or null). */
export async function getSessionUser() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
