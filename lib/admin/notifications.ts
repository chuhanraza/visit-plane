import { getServiceClient } from '@/lib/supabase/admin'
import { getSettings, setSetting } from '@/lib/admin/settings'

/**
 * Operator activity feed — merges recent real events (new leads, data
 * corrections, manual + e-visa orders, affiliate conversions) into one
 * time-sorted stream. "Unread" is tracked by a global last-seen timestamp in
 * app_settings. Service-role, behind requireAdmin().
 */

export interface Activity { ts: string; kind: 'lead' | 'correction' | 'revenue' | 'order' | 'conversion' | 'alert'; title: string; href: string }

const LAST_SEEN_KEY = 'notif_last_seen'

export async function recentActivity(limit = 40): Promise<Activity[]> {
  const svc = getServiceClient()
  const [leads, corrections, manual, evisa, convs, alerts] = await Promise.all([
    svc.from('email_subscribers').select('email, captured_from, captured_at').order('captured_at', { ascending: false }).limit(15),
    svc.from('data_corrections').select('what_is_wrong, status, created_at').order('created_at', { ascending: false }).limit(10),
    svc.from('manual_orders').select('order_ref, status, created_at').order('created_at', { ascending: false }).limit(10),
    svc.from('orders').select('id, order_ref, created_at').order('created_at', { ascending: false }).limit(10),
    svc.from('affiliate_conversions').select('partner_slug, amount, occurred_at').order('occurred_at', { ascending: false }).limit(10),
    svc.from('audit_log').select('metadata, created_at').eq('action', 'alert.triggered').order('created_at', { ascending: false }).limit(10),
  ])

  const out: Activity[] = []
  for (const l of (leads.data ?? []) as { email: string; captured_from: string | null; captured_at: string }[])
    out.push({ ts: l.captured_at, kind: 'lead', title: `New lead: ${l.email} (${l.captured_from ?? 'unknown'})`, href: '/admin/leads' })
  for (const c of (corrections.data ?? []) as { what_is_wrong: string; status: string; created_at: string }[])
    out.push({ ts: c.created_at, kind: 'correction', title: `Data correction (${c.status}): ${c.what_is_wrong.slice(0, 60)}`, href: '/admin/leads?tab=corrections' })
  for (const m of (manual.data ?? []) as { order_ref: string; status: string; created_at: string }[])
    out.push({ ts: m.created_at, kind: 'revenue', title: `Manual order ${m.order_ref} (${m.status})`, href: '/admin/revenue' })
  for (const o of (evisa.data ?? []) as { id: string; order_ref: string; created_at: string }[])
    out.push({ ts: o.created_at, kind: 'order', title: `e-Visa order ${o.order_ref}`, href: `/admin/orders/${o.id}` })
  for (const c of (convs.data ?? []) as { partner_slug: string; amount: number; occurred_at: string }[])
    out.push({ ts: c.occurred_at, kind: 'conversion', title: `Affiliate conversion: ${c.partner_slug} ($${Number(c.amount).toFixed(2)})`, href: '/admin/affiliate-mgmt' })
  for (const a of (alerts.data ?? []) as { metadata: { name?: string; metric?: string; value?: number }; created_at: string }[])
    out.push({ ts: a.created_at, kind: 'alert', title: `⚠ Alert: ${a.metadata?.name ?? a.metadata?.metric ?? 'threshold'} (${a.metadata?.value})`, href: '/admin/ops' })

  return out.filter(a => a.ts).sort((a, b) => (a.ts < b.ts ? 1 : -1)).slice(0, limit)
}

export async function getLastSeen(): Promise<string | null> {
  const s = await getSettings()
  const v = s[LAST_SEEN_KEY]
  return typeof v === 'string' ? v : null
}

export async function setSeen(actor: string): Promise<string> {
  const now = new Date().toISOString()
  await setSetting(LAST_SEEN_KEY, now, actor)
  return now
}

export function countUnread(activity: Activity[], lastSeen: string | null): number {
  if (!lastSeen) return activity.length
  return activity.filter(a => a.ts > lastSeen).length
}
