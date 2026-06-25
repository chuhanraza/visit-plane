import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/supabase/admin'
import { can, type AdminContext, type Module, type Level, type Role } from '@/lib/admin/rbac'

/**
 * Admin authentication, server-side only. An admin is anyone who presents EITHER:
 *  1. the legacy `admin_secret` cookie (or `x-admin-secret` header) === ADMIN_SECRET
 *     — the existing production admin login at /admin/login, OR
 *  2. a Supabase Auth session whose user id is listed in `app_admins`.
 *
 * See docs/evisa-admin-setup.md for how Hamad becomes an admin.
 */

function readCookie(cookieHeader: string, name: string): string {
  const found = cookieHeader.split(';').map(c => c.trim())
    .find(c => c.startsWith(`${name}=`))
  return found ? decodeURIComponent(found.slice(name.length + 1)) : ''
}

/** True if the request carries the legacy admin secret. */
async function hasAdminSecret(): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET
  if (!secret) return false
  const hdrs = await headers()
  if (hdrs.get('x-admin-secret') === secret) return true
  const cookieStore = await cookies()
  return cookieStore.get('admin_secret')?.value === secret
}

/** True if the signed-in Supabase user is in app_admins; resolves role + perms. */
async function isSupabaseAdmin(): Promise<{ ok: boolean; userId?: string; email?: string; role?: Role; permissions?: Record<string, Level> }> {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false }
    // service-role read (app_admins is RLS-locked to admins; we check by id)
    const svc = getServiceClient()
    const { data } = await svc.from('app_admins').select('user_id, role, permissions').eq('user_id', user.id).maybeSingle()
    if (!data) return { ok: false }
    const row = data as { role?: Role; permissions?: Record<string, Level> }
    return { ok: true, userId: user.id, email: user.email ?? undefined, role: row.role ?? 'admin', permissions: row.permissions ?? {} }
  } catch {
    return { ok: false }
  }
}

/** Resolve whether the current request is an admin, and a label for audit. */
export async function getAdminIdentity(): Promise<{ isAdmin: boolean; actor: string }> {
  if (await hasAdminSecret()) return { isAdmin: true, actor: 'admin:secret' }
  const sb = await isSupabaseAdmin()
  if (sb.ok) return { isAdmin: true, actor: `admin:${sb.email ?? sb.userId}` }
  return { isAdmin: false, actor: 'anonymous' }
}

/** Full admin context incl. role + permissions. Secret login = full owner. */
export async function getAdminContext(): Promise<AdminContext> {
  if (await hasAdminSecret()) return { isAdmin: true, actor: 'admin:secret', role: 'owner', permissions: {} }
  const sb = await isSupabaseAdmin()
  if (sb.ok) return { isAdmin: true, actor: `admin:${sb.email ?? sb.userId}`, role: sb.role ?? 'admin', permissions: sb.permissions ?? {} }
  return { isAdmin: false, actor: 'anonymous', role: 'viewer', permissions: {} }
}

/** Page guard: must be admin AND have `level` on `module`, else redirect. */
export async function requirePermission(module: Module, level: Level = 'view', redirectTo = '/admin/login'): Promise<AdminContext> {
  const ctx = await getAdminContext()
  if (!ctx.isAdmin) redirect(redirectTo)
  if (!can(ctx, module, level)) redirect('/admin')
  return ctx
}

/** Route guard: returns actor if admin AND permitted, else null (caller 401/403s). */
export async function requirePermissionApi(module: Module, level: Level = 'view'): Promise<string | null> {
  const ctx = await getAdminContext()
  if (!ctx.isAdmin || !can(ctx, module, level)) return null
  return ctx.actor
}

/** For Server Components / pages: redirect to login if not admin. Returns actor label. */
export async function requireAdmin(redirectTo = '/admin/login'): Promise<string> {
  const { isAdmin, actor } = await getAdminIdentity()
  if (!isAdmin) redirect(redirectTo)
  return actor
}

/** For Route Handlers: returns the actor label, or null if unauthorized (caller 401s). */
export async function requireAdminApi(): Promise<string | null> {
  const { isAdmin, actor } = await getAdminIdentity()
  return isAdmin ? actor : null
}
