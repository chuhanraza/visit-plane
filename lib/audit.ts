import { getServiceClient } from '@/lib/supabase/admin'

export type AuditActorType = 'admin' | 'customer' | 'system'

export interface AuditEntry {
  actor: string
  actorType: AuditActorType
  action: string
  entityType?: string
  entityId?: string
  metadata?: Record<string, unknown>
  ip?: string | null
}

/**
 * Append an audit_log row. Best-effort: never throws into the caller (an audit
 * failure must not break a real operation), but logs to the server console.
 */
export async function writeAudit(entry: AuditEntry): Promise<void> {
  try {
    const svc = getServiceClient()
    const { error } = await svc.from('audit_log').insert({
      actor: entry.actor,
      actor_type: entry.actorType,
      action: entry.action,
      entity_type: entry.entityType ?? null,
      entity_id: entry.entityId ?? null,
      metadata: entry.metadata ?? {},
      ip: entry.ip ?? null,
    })
    if (error) console.error('[audit] insert failed:', error.message)
  } catch (e) {
    console.error('[audit] unexpected error:', (e as Error).message)
  }
}
