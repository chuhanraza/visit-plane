import { getServiceClient } from '@/lib/supabase/admin'

/**
 * Admin allowlist management (app_admins ↔ auth.users). Emails resolved via the
 * service-role auth admin API (auth.users is not exposed over PostgREST).
 * Service-role, behind requireAdmin().
 */

export interface AdminRow {
  user_id: string
  email: string | null
  note: string | null
  created_at: string
}

async function emailMap(): Promise<Map<string, string>> {
  const svc = getServiceClient()
  const map = new Map<string, string>()
  try {
    const { data } = await svc.auth.admin.listUsers({ page: 1, perPage: 1000 })
    for (const u of data?.users ?? []) if (u.email) map.set(u.id, u.email)
  } catch { /* best-effort: emails just show as unknown */ }
  return map
}

export async function listAdmins(): Promise<AdminRow[]> {
  const svc = getServiceClient()
  const [{ data: admins }, emails] = await Promise.all([
    svc.from('app_admins').select('user_id, note, created_at').order('created_at'),
    emailMap(),
  ])
  return ((admins ?? []) as { user_id: string; note: string | null; created_at: string }[])
    .map(a => ({ ...a, email: emails.get(a.user_id) ?? null }))
}

/** Look up an auth user id by email (case-insensitive). */
async function findUserIdByEmail(email: string): Promise<string | null> {
  const svc = getServiceClient()
  const target = email.toLowerCase()
  try {
    const { data } = await svc.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const u = (data?.users ?? []).find(u => u.email?.toLowerCase() === target)
    return u?.id ?? null
  } catch {
    return null
  }
}

export async function addAdminByEmail(email: string, note: string | null): Promise<{ ok: boolean; error?: string; userId?: string }> {
  const userId = await findUserIdByEmail(email)
  if (!userId) return { ok: false, error: 'No Supabase Auth user with that email. They must sign up / log in once first.' }
  const svc = getServiceClient()
  const { error } = await svc.from('app_admins').upsert({ user_id: userId, note }, { onConflict: 'user_id' })
  if (error) return { ok: false, error: error.message }
  return { ok: true, userId }
}

export async function removeAdmin(userId: string): Promise<{ ok: boolean; error?: string }> {
  const svc = getServiceClient()
  const { error } = await svc.from('app_admins').delete().eq('user_id', userId)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

/** API-key / secret presence — STATUS ONLY, never the value. */
export function keyStatus(): { key: string; label: string; configured: boolean }[] {
  const e = process.env
  const defs: { key: string; label: string }[] = [
    { key: 'SUPABASE_SERVICE_ROLE_KEY', label: 'Supabase service role' },
    { key: 'NEXT_PUBLIC_SUPABASE_URL', label: 'Supabase URL' },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', label: 'Supabase anon key' },
    { key: 'ADMIN_SECRET', label: 'Legacy admin secret' },
    { key: 'RESEND_API_KEY', label: 'Resend (email)' },
    { key: 'NEXT_PUBLIC_SITE_URL', label: 'Site URL' },
    { key: 'STRIPE_SECRET_KEY', label: 'Stripe secret (payments)' },
    { key: 'GEMINI_API_KEY', label: 'Gemini (AI)' },
    { key: 'GOOGLE_GENERATIVE_AI_API_KEY', label: 'Google Generative AI' },
  ]
  return defs.map(d => ({ ...d, configured: !!(e[d.key] && String(e[d.key]).length > 0) }))
}
