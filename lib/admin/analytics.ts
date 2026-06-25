import { getServiceClient } from '@/lib/supabase/admin'

/**
 * Analytics 2.0 — REAL Supabase data only, with period-over-period comparison.
 * Stages/metrics that have no data source render as 0 / "no data yet" upstream;
 * nothing is estimated. Service-role, behind requireAdmin().
 *
 * Honesty notes:
 *  - "Visits" and "wizard starts" are NOT tracked yet (no pageview/event table),
 *    so they are intentionally excluded from the funnel until Track 4 adds capture.
 *  - Lead funnel uses real cohorts: leads captured → opt-in confirmed → became a
 *    customer (email present on a manual or e-visa order in the window).
 */

export interface Metric { current: number; previous: number }

export interface WindowAgg {
  leads: number
  confirmed: number
  unsubscribed: number
  affiliateClicks: number
  affiliateConversions: number
  affiliateValue: number
  affiliateCommission: number
  manualRevenue: number
  manualOrders: number
  evisaOrders: number
  evisaRevenue: number
  customers: number
  bySource: Map<string, number>
  revenueBySource: Map<string, number>
  daily: Map<string, { leads: number; revenue: number }>
}

export interface AnalyticsResult {
  range: { from: string; to: string; days: number }
  metrics: Record<
    'leads' | 'confirmed' | 'unsubscribed' | 'affiliateClicks' | 'affiliateConversions' |
    'affiliateValue' | 'affiliateCommission' | 'manualRevenue' | 'manualOrders' |
    'evisaOrders' | 'evisaRevenue' | 'customers', Metric
  >
  funnel: { leads: number; confirmed: number; customers: number; leadToConfirm: number; leadToCustomer: number }
  attribution: { source: string; count: number; pct: number }[]
  revenueBySource: { source: string; amount: number }[]
  daily: { date: string; leads: number; revenue: number }[]
}

const dayStr = (iso: string) => iso.slice(0, 10)

async function aggregate(fromISO: string, toISO: string): Promise<WindowAgg> {
  const svc = getServiceClient()
  const [subs, confirmedRes, unsubRes, manual, clicks, convs, evisaOrders, evisaInv, custMan, custEvisa] = await Promise.all([
    // Only rows captured IN the window (bounded by window size, not whole table).
    svc.from('email_subscribers').select('captured_at, captured_from').gte('captured_at', fromISO).lte('captured_at', toISO).limit(50000),
    svc.from('email_subscribers').select('id', { count: 'exact', head: true }).gte('confirmed_at', fromISO).lte('confirmed_at', toISO),
    svc.from('email_subscribers').select('id', { count: 'exact', head: true }).gte('unsubscribed_at', fromISO).lte('unsubscribed_at', toISO),
    svc.from('manual_orders').select('created_at, amount, status, source').gte('created_at', fromISO).lte('created_at', toISO).limit(50000),
    svc.from('affiliate_clicks').select('clicked_at').gte('clicked_at', fromISO).lte('clicked_at', toISO).limit(100000),
    svc.from('affiliate_conversions').select('amount, commission_amount, occurred_at').gte('occurred_at', fromISO).lte('occurred_at', toISO).limit(50000),
    svc.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', fromISO).lte('created_at', toISO),
    svc.from('invoices').select('total, paid_at').eq('status', 'paid').gte('paid_at', fromISO).lte('paid_at', toISO).limit(50000),
    svc.from('manual_orders').select('customer_email').gte('created_at', fromISO).lte('created_at', toISO).limit(50000),
    svc.from('orders').select('contact_email').gte('created_at', fromISO).lte('created_at', toISO).limit(50000),
  ])

  const agg: WindowAgg = {
    leads: 0, confirmed: 0, unsubscribed: 0, affiliateClicks: 0, affiliateConversions: 0,
    affiliateValue: 0, affiliateCommission: 0, manualRevenue: 0, manualOrders: 0,
    evisaOrders: evisaOrders.count ?? 0, evisaRevenue: 0, customers: 0,
    bySource: new Map(), revenueBySource: new Map(), daily: new Map(),
  }
  agg.confirmed = confirmedRes.count ?? 0
  agg.unsubscribed = unsubRes.count ?? 0

  const bump = (d: string, key: 'leads' | 'revenue', n: number) => {
    const cur = agg.daily.get(d) ?? { leads: 0, revenue: 0 }
    cur[key] += n
    agg.daily.set(d, cur)
  }

  for (const s of (subs.data ?? []) as { captured_at: string | null; captured_from: string | null }[]) {
    if (!s.captured_at) continue
    agg.leads++
    const src = (s.captured_from || 'unknown').trim()
    agg.bySource.set(src, (agg.bySource.get(src) ?? 0) + 1)
    bump(dayStr(s.captured_at), 'leads', 1)
  }

  for (const m of (manual.data ?? []) as { created_at: string; amount: number; status: string; source: string | null }[]) {
    agg.manualOrders++
    if (m.status === 'paid') {
      const amt = Number(m.amount || 0)
      agg.manualRevenue += amt
      const src = (m.source || 'direct').trim()
      agg.revenueBySource.set(src, (agg.revenueBySource.get(src) ?? 0) + amt)
      bump(dayStr(m.created_at), 'revenue', amt)
    }
  }

  agg.affiliateClicks = (clicks.data ?? []).length
  for (const c of (convs.data ?? []) as { amount: number; commission_amount: number }[]) {
    agg.affiliateConversions++
    agg.affiliateValue += Number(c.amount || 0)
    agg.affiliateCommission += Number(c.commission_amount || 0)
  }
  for (const i of (evisaInv.data ?? []) as { total: number; paid_at: string }[]) {
    const amt = Number(i.total || 0)
    agg.evisaRevenue += amt
    if (i.paid_at) bump(dayStr(i.paid_at), 'revenue', amt)
  }

  const emails = new Set<string>()
  for (const r of (custMan.data ?? []) as { customer_email: string | null }[]) if (r.customer_email) emails.add(r.customer_email.toLowerCase())
  for (const r of (custEvisa.data ?? []) as { contact_email: string | null }[]) if (r.contact_email) emails.add(r.contact_email.toLowerCase())
  agg.customers = emails.size

  return agg
}

export async function getAnalytics(fromISO: string, toISO: string): Promise<AnalyticsResult> {
  const fromMs = new Date(fromISO).getTime()
  const toMs = new Date(toISO).getTime()
  const days = Math.max(1, Math.round((toMs - fromMs) / 86400000) + 1)
  const prevTo = new Date(fromMs - 1).toISOString()
  const prevFrom = new Date(fromMs - days * 86400000).toISOString()

  const [cur, prev] = await Promise.all([aggregate(fromISO, toISO), aggregate(prevFrom, prevTo)])

  const m = (k: keyof WindowAgg): Metric => ({ current: cur[k] as number, previous: prev[k] as number })

  const attribution = [...cur.bySource.entries()]
    .map(([source, count]) => ({ source, count, pct: cur.leads ? Math.round((count / cur.leads) * 100) : 0 }))
    .sort((a, b) => b.count - a.count)
  const revenueBySource = [...cur.revenueBySource.entries()]
    .map(([source, amount]) => ({ source, amount })).sort((a, b) => b.amount - a.amount)

  // Continuous daily series across the window (zero-filled).
  const daily: { date: string; leads: number; revenue: number }[] = []
  for (let t = fromMs; t <= toMs; t += 86400000) {
    const d = new Date(t).toISOString().slice(0, 10)
    const v = cur.daily.get(d) ?? { leads: 0, revenue: 0 }
    daily.push({ date: d, leads: v.leads, revenue: v.revenue })
  }

  return {
    range: { from: dayStr(fromISO), to: dayStr(toISO), days },
    metrics: {
      leads: m('leads'), confirmed: m('confirmed'), unsubscribed: m('unsubscribed'),
      affiliateClicks: m('affiliateClicks'), affiliateConversions: m('affiliateConversions'),
      affiliateValue: m('affiliateValue'), affiliateCommission: m('affiliateCommission'),
      manualRevenue: m('manualRevenue'), manualOrders: m('manualOrders'),
      evisaOrders: m('evisaOrders'), evisaRevenue: m('evisaRevenue'), customers: m('customers'),
    },
    funnel: {
      leads: cur.leads, confirmed: cur.confirmed, customers: cur.customers,
      leadToConfirm: cur.leads ? Math.round((cur.confirmed / cur.leads) * 100) : 0,
      leadToCustomer: cur.leads ? Math.round((cur.customers / cur.leads) * 100) : 0,
    },
    attribution, revenueBySource, daily,
  }
}

export async function listSavedReports() {
  const svc = getServiceClient()
  const { data } = await svc.from('saved_reports').select('*').order('created_at', { ascending: false })
  return (data ?? []) as { id: string; name: string; kind: string; config: Record<string, unknown>; created_at: string }[]
}
