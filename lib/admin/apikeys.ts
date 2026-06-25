import { randomBytes, createHash } from 'crypto'
import { getServiceClient } from '@/lib/supabase/admin'

/**
 * Scoped API keys. Keys are stored HASHED (sha256); the raw key is shown once at
 * creation and never recoverable. Used to authenticate inbound calls such as the
 * affiliate conversion postback. Service-role, behind requireAdmin() for mgmt;
 * verifyApiKey() is for public/inbound routes.
 */

export const API_SCOPES = ['affiliate:write', 'leads:read', 'orders:read'] as const
export type ApiScope = (typeof API_SCOPES)[number]

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex')

export interface ApiKeyRow {
  id: string; name: string; key_prefix: string; scopes: string[]
  active: boolean; created_at: string; last_used_at: string | null; revoked_at: string | null
}

export async function createApiKey(name: string, scopes: string[], actor: string): Promise<{ row: ApiKeyRow; raw: string }> {
  const raw = `vp_live_${randomBytes(24).toString('base64url')}`
  const prefix = raw.slice(0, 12)
  const svc = getServiceClient()
  const { data, error } = await svc.from('api_keys')
    .insert({ name, key_prefix: prefix, key_hash: sha256(raw), scopes, created_by: actor })
    .select('id, name, key_prefix, scopes, active, created_at, last_used_at, revoked_at').maybeSingle()
  if (error) throw new Error(error.message)
  return { row: data as ApiKeyRow, raw }
}

export async function listApiKeys(): Promise<ApiKeyRow[]> {
  const svc = getServiceClient()
  const { data } = await svc.from('api_keys')
    .select('id, name, key_prefix, scopes, active, created_at, last_used_at, revoked_at')
    .order('created_at', { ascending: false })
  return (data ?? []) as ApiKeyRow[]
}

export async function revokeApiKey(id: string): Promise<void> {
  const svc = getServiceClient()
  await svc.from('api_keys').update({ active: false, revoked_at: new Date().toISOString() }).eq('id', id)
}

/** Verify an inbound raw key has the required scope. Updates last_used_at. */
export async function verifyApiKey(raw: string | null | undefined, requiredScope: ApiScope): Promise<{ ok: boolean; keyId?: string; name?: string }> {
  if (!raw) return { ok: false }
  const svc = getServiceClient()
  const { data } = await svc.from('api_keys')
    .select('id, name, scopes, active, revoked_at')
    .eq('key_hash', sha256(raw.trim())).maybeSingle()
  const k = data as { id: string; name: string; scopes: string[]; active: boolean; revoked_at: string | null } | null
  if (!k || !k.active || k.revoked_at || !k.scopes.includes(requiredScope)) return { ok: false }
  await svc.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', k.id)
  return { ok: true, keyId: k.id, name: k.name }
}
