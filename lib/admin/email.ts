import { getServiceClient } from '@/lib/supabase/admin'

/**
 * Email campaigns data layer over `email_subscribers`. Segments and the
 * double-opt-in queue are REAL counts. Open/click stats are NOT tracked (no
 * webhook wired) and are reported as "no data yet" — never fabricated.
 * Service-role, behind requireAdmin().
 */

export interface EmailSegments {
  total: number
  confirmed: number
  pending: number
  unsubscribed: number
  sendable: number
  bySource: { source: string; sendable: number }[]
  byLeadMagnet: { magnet: string; sendable: number }[]
}

export async function emailSegments(): Promise<EmailSegments> {
  const svc = getServiceClient()
  const { data } = await svc.from('email_subscribers')
    .select('captured_from, lead_magnet, confirmed_at, unsubscribed_at')
    .limit(50000)
  const rows = (data ?? []) as { captured_from: string | null; lead_magnet: string | null; confirmed_at: string | null; unsubscribed_at: string | null }[]

  let confirmed = 0, pending = 0, unsubscribed = 0
  const bySource = new Map<string, number>()
  const byMagnet = new Map<string, number>()
  for (const r of rows) {
    const sendable = !!r.confirmed_at && !r.unsubscribed_at
    if (r.unsubscribed_at) unsubscribed++
    else if (r.confirmed_at) confirmed++
    else pending++
    if (sendable) {
      const s = (r.captured_from || 'unknown').trim()
      bySource.set(s, (bySource.get(s) ?? 0) + 1)
      if (r.lead_magnet) byMagnet.set(r.lead_magnet, (byMagnet.get(r.lead_magnet) ?? 0) + 1)
    }
  }
  return {
    total: rows.length, confirmed, pending, unsubscribed, sendable: confirmed,
    bySource: [...bySource.entries()].map(([source, sendable]) => ({ source, sendable })).sort((a, b) => b.sendable - a.sendable),
    byLeadMagnet: [...byMagnet.entries()].map(([magnet, sendable]) => ({ magnet, sendable })).sort((a, b) => b.sendable - a.sendable),
  }
}

export async function listPendingOptIn(params: { page?: number; pageSize?: number }) {
  const svc = getServiceClient()
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, params.pageSize ?? 25)
  const from = (page - 1) * pageSize
  const { data, count } = await svc.from('email_subscribers')
    .select('id, email, captured_from, captured_at, consent_at', { count: 'exact' })
    .is('confirmed_at', null).is('unsubscribed_at', null)
    .order('captured_at', { ascending: false })
    .range(from, from + pageSize - 1)
  return { rows: (data ?? []) as { id: number; email: string; captured_from: string | null; captured_at: string; consent_at: string | null }[], total: count ?? 0, page, pageSize }
}

/** Sendable recipients (confirmed, not unsubscribed) for a segment. */
export async function recipientsFor(filter: { source?: string; leadMagnet?: string }): Promise<{ email: string; unsubscribe_token: string }[]> {
  const svc = getServiceClient()
  let q = svc.from('email_subscribers')
    .select('email, unsubscribe_token')
    .not('confirmed_at', 'is', null)
    .is('unsubscribed_at', null)
  if (filter.source) q = q.eq('captured_from', filter.source)
  if (filter.leadMagnet) q = q.eq('lead_magnet', filter.leadMagnet)
  const { data } = await q.limit(2000)
  return (data ?? []) as { email: string; unsubscribe_token: string }[]
}

/** Email engagement counts from the event spine (Resend webhook), last N days. */
export async function emailEngagement(days = 30): Promise<{ delivered: number; opened: number; clicked: number; bounced: number; tracked: boolean }> {
  const svc = getServiceClient()
  const since = new Date(Date.now() - days * 86400000).toISOString()
  const { data } = await svc.from('marketing_events')
    .select('metric').gte('occurred_at', since)
    .in('metric', ['email.delivered', 'email.opened', 'email.clicked', 'email.bounced']).limit(100000)
  const rows = (data ?? []) as { metric: string }[]
  const c = (m: string) => rows.filter(r => r.metric === m).length
  return { delivered: c('email.delivered'), opened: c('email.opened'), clicked: c('email.clicked'), bounced: c('email.bounced'), tracked: rows.length > 0 }
}

/** Sendable recipients within a saved segment (confirmed, not unsubscribed). */
export async function recipientsForSegment(segmentId: string): Promise<{ email: string; unsubscribe_token: string }[]> {
  const { getSegment, resolveSegment } = await import('@/lib/admin/segments')
  const seg = await getSegment(segmentId)
  if (!seg) return []
  const { emails } = await resolveSegment(seg.definition)
  if (emails.length === 0) return []
  const svc = getServiceClient()
  const lower = new Set(emails.map(e => e.toLowerCase()))
  const { data } = await svc.from('email_subscribers')
    .select('email, unsubscribe_token')
    .not('confirmed_at', 'is', null).is('unsubscribed_at', null).limit(50000)
  return ((data ?? []) as { email: string; unsubscribe_token: string }[]).filter(r => lower.has(r.email.toLowerCase()))
}

/** Recent broadcasts, reconstructed from the audit log (no separate table). */
export async function recentBroadcasts(limit = 10) {
  const svc = getServiceClient()
  const { data } = await svc.from('audit_log')
    .select('created_at, actor, metadata')
    .eq('action', 'email.broadcast')
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data ?? []) as { created_at: string; actor: string; metadata: Record<string, unknown> }[]
}
