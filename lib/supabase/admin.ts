/**
 * Supabase SERVICE-ROLE client. Bypasses RLS — full access to all rows, incl. PII.
 *
 * SECURITY: only use this from Route Handlers / Server Actions that have ALREADY
 * passed an auth/admin guard, or for system operations (audit, invoices). The
 * service-role key lives in SUPABASE_SERVICE_ROLE_KEY (NOT a NEXT_PUBLIC_ var), so
 * Next never inlines it into a client bundle. The runtime guard below is a second
 * line of defence in case this module is ever pulled into client code.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

export function getServiceClient(): SupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('getServiceClient() must never be called in the browser')
  }
  if (cached) return cached
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase service-role env vars are not configured')
  }
  cached = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return cached
}
