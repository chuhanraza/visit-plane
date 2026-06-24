import { getServiceClient } from '@/lib/supabase/admin'

/** Feature flags / app settings (app_settings table). Service-role, behind requireAdmin(). */
export async function getSettings(): Promise<Record<string, unknown>> {
  const svc = getServiceClient()
  const { data } = await svc.from('app_settings').select('key, value')
  const out: Record<string, unknown> = {}
  for (const r of (data ?? []) as { key: string; value: unknown }[]) out[r.key] = r.value
  return out
}

export async function getFlag(key: string): Promise<boolean> {
  const s = await getSettings()
  return s[key] === true
}

export async function setSetting(key: string, value: unknown, actor: string): Promise<void> {
  const svc = getServiceClient()
  await svc.from('app_settings').upsert({ key, value, updated_by: actor, updated_at: new Date().toISOString() }, { onConflict: 'key' })
}
