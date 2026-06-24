'use client'

/**
 * Supabase browser client (@supabase/ssr). Persists the session in cookies so the
 * server can read it. Anon key only — RLS confines it to the user's own rows.
 */
import { createBrowserClient } from '@supabase/ssr'

export function getSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
