/**
 * Supabase ANON client for statically-rendered / ISR pages — deliberately does
 * NOT touch cookies() or headers(). Those APIs force a static route into
 * dynamic rendering (see the ISR incident this avoids: reading cookies() in a
 * cached page broke every ISR page site-wide for ~4.5h). Use this only for
 * public, RLS-open reads (e.g. destination_photo_countries/destination_photos)
 * from pages under generateStaticParams. For request-scoped/session-aware
 * reads use lib/supabase/server.ts instead; for privileged reads behind an
 * admin guard use lib/supabase/admin.ts.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

export function getPublicClient(): SupabaseClient {
  if (cached) return cached
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Supabase public env vars are not configured')
  }
  cached = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return cached
}
