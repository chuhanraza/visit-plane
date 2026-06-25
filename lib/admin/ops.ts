import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'

/**
 * Ops: a window into background work (SEO jobs, flow runs, webhook deliveries)
 * and threshold alert rules evaluated by the cron / manually. Service-role,
 * behind requireAdmin().
 */

export type AlertMetric = 'leads_today' | 'pending_corrections' | 'pending_optins' | 'failed_webhooks_24h' | 'active_flow_runs'
export const ALERT_METRICS: { key: AlertMetric; label: string }[] = [
  { key: 'leads_today', label: 'New leads today' },
  { key: 'pending_corrections', label: 'Pending data corrections' },
  { key: 'pending_optins', label: 'Pending opt-ins' },
  { key: 'failed_webhooks_24h', label: 'Failed webhooks (24h)' },
  { key: 'active_flow_runs', label: 'Active flow runs' },
]
export const ALERT_OPS: { key: string; label: string }[] = [
  { key: 'gt', label: '>' }, { key: 'gte', label: '≥' }, { key: 'lt', label: '<' }, { key: 'lte', label: '≤' },
]

export interface AlertRule { id: string; name: string; metric: AlertMetric; op: string; threshold: number; active: boolean; last_triggered_at: string | null }

export async function computeMetrics(): Promise<Record<AlertMetric, number>> {
  const svc = getServiceClient()
  const dayStart = new Date(); dayStart.setUTCHours(0, 0, 0, 0)
  const since24h = new Date(Date.now() - 86400000).toISOString()
  const [leads, corrections, optins, failedWh, flowRuns] = await Promise.all([
    svc.from('email_subscribers').select('id', { count: 'exact', head: true }).gte('captured_at', dayStart.toISOString()),
    svc.from('data_corrections').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    svc.from('email_subscribers').select('id', { count: 'exact', head: true }).is('confirmed_at', null).is('unsubscribed_at', null),
    svc.from('webhook_deliveries').select('id', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', since24h),
    svc.from('flow_runs').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ])
  return {
    leads_today: leads.count ?? 0,
    pending_corrections: corrections.count ?? 0,
    pending_optins: optins.count ?? 0,
    failed_webhooks_24h: failedWh.count ?? 0,
    active_flow_runs: flowRuns.count ?? 0,
  }
}

export async function opsOverview() {
  const svc = getServiceClient()
  const since7d = new Date(Date.now() - 7 * 86400000).toISOString()
  const [seoJobs, flowRuns, whDeliveries, metrics] = await Promise.all([
    svc.from('seo_generation_jobs').select('id, phase, status, total_routes, completed, failed, started_at, finished_at').order('started_at', { ascending: false }).limit(10),
    svc.from('flow_runs').select('status'),
    svc.from('webhook_deliveries').select('status, event, response_code, created_at').gte('created_at', since7d).order('created_at', { ascending: false }).limit(50),
    computeMetrics(),
  ])
  const flowStats = { active: 0, completed: 0, cancelled: 0 }
  for (const r of (flowRuns.data ?? []) as { status: string }[]) if (r.status in flowStats) (flowStats as Record<string, number>)[r.status]++
  const wh = (whDeliveries.data ?? []) as { status: string; event: string; response_code: number | null; created_at: string }[]
  const whStats = { success: wh.filter(d => d.status === 'success').length, failed: wh.filter(d => d.status === 'failed').length }
  return { seoJobs: seoJobs.data ?? [], flowStats, webhookRecent: wh.slice(0, 15), whStats, metrics }
}

export async function listAlertRules(): Promise<AlertRule[]> {
  const svc = getServiceClient()
  const { data } = await svc.from('alert_rules').select('*').order('created_at', { ascending: false })
  return (data ?? []) as AlertRule[]
}

function triggered(value: number, op: string, threshold: number): boolean {
  switch (op) { case 'gt': return value > threshold; case 'gte': return value >= threshold; case 'lt': return value < threshold; case 'lte': return value <= threshold; default: return false }
}

/** Evaluate active rules; audit + cooldown (6h) on trigger. Returns triggered names. */
export async function evaluateAlerts(): Promise<{ evaluated: number; triggered: string[] }> {
  const svc = getServiceClient()
  const [{ data: rules }, metrics] = await Promise.all([svc.from('alert_rules').select('*').eq('active', true), computeMetrics()])
  const fired: string[] = []
  const now = Date.now()
  for (const r of (rules ?? []) as AlertRule[]) {
    const value = metrics[r.metric] ?? 0
    if (!triggered(value, r.op, Number(r.threshold))) continue
    if (r.last_triggered_at && now - new Date(r.last_triggered_at).getTime() < 6 * 3600000) continue // cooldown
    await writeAudit({ actor: 'system', actorType: 'system', action: 'alert.triggered', entityType: 'alert', entityId: r.id, metadata: { name: r.name, metric: r.metric, op: r.op, threshold: Number(r.threshold), value } })
    await svc.from('alert_rules').update({ last_triggered_at: new Date().toISOString() }).eq('id', r.id)
    fired.push(r.name)
  }
  return { evaluated: (rules ?? []).length, triggered: fired }
}
