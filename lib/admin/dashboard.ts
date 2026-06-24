import { getServiceClient } from '@/lib/supabase/admin'

/**
 * Operator dashboard metrics — REAL Supabase data only. Any metric without a
 * data source returns a falsy/empty shape the UI renders as "no data yet".
 * All reads are service-role and MUST be called behind requireAdmin().
 */

export interface OperatorDashboard {
  leads: {
    total: number
    last7d: number
    confirmed: number
    pending: number
    unsubscribed: number
    bySource: { source: string; count: number }[]
    wizardCompletions: number
    topDestinations: { dest: string; count: number }[]
    growth: { week: string; count: number }[] // last 12 ISO-week buckets, oldest→newest
  }
  affiliates: {
    clicksLifetime: number
    clicks30d: number
    conversions: number
    conversionValue: number
    commission: number
  }
  manualRevenue: {
    paidTotal: number
    paidCount: number
    pendingCount: number
    currency: string
  }
  corrections: { pending: number }
}

function weekKey(d: Date): string {
  // ISO-ish year-week label, e.g. "2026-W26"
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const dayNum = (date.getUTCDay() + 6) % 7
  date.setUTCDate(date.getUTCDate() - dayNum + 3)
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4))
  const week = 1 + Math.round(((date.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7)
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

export async function operatorDashboard(): Promise<OperatorDashboard> {
  const svc = getServiceClient()
  const now = Date.now()
  const since7d = new Date(now - 7 * 86400000).toISOString()
  const since30d = new Date(now - 30 * 86400000).toISOString()
  const since12w = new Date(now - 12 * 7 * 86400000).toISOString()

  const [
    subs,
    clicksLifetime,
    clicks30d,
    conversions,
    manualOrders,
    correctionsPending,
  ] = await Promise.all([
    // Lead list — selected columns only, aggregate in JS. Cap defensively.
    svc.from('email_subscribers')
      .select('captured_from, captured_at, confirmed_at, unsubscribed_at, route_destination')
      .order('captured_at', { ascending: false })
      .limit(10000),
    svc.from('affiliate_clicks').select('id', { count: 'exact', head: true }),
    svc.from('affiliate_clicks').select('id', { count: 'exact', head: true }).gte('clicked_at', since30d),
    svc.from('affiliate_conversions').select('amount, commission_amount, status'),
    svc.from('manual_orders').select('amount, status, currency'),
    svc.from('data_corrections').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const rows = (subs.data ?? []) as {
    captured_from: string | null; captured_at: string | null
    confirmed_at: string | null; unsubscribed_at: string | null
    route_destination: string | null
  }[]

  const total = rows.length
  const last7d = rows.filter(r => r.captured_at && r.captured_at >= since7d).length
  const confirmed = rows.filter(r => r.confirmed_at && !r.unsubscribed_at).length
  const unsubscribed = rows.filter(r => r.unsubscribed_at).length
  const pending = rows.filter(r => !r.confirmed_at && !r.unsubscribed_at).length

  const sourceMap = new Map<string, number>()
  const destMap = new Map<string, number>()
  const weekMap = new Map<string, number>()
  for (const r of rows) {
    const src = (r.captured_from || 'unknown').trim()
    sourceMap.set(src, (sourceMap.get(src) ?? 0) + 1)
    if (r.route_destination) {
      const d = r.route_destination.trim()
      if (d) destMap.set(d, (destMap.get(d) ?? 0) + 1)
    }
    if (r.captured_at && r.captured_at >= since12w) {
      const k = weekKey(new Date(r.captured_at))
      weekMap.set(k, (weekMap.get(k) ?? 0) + 1)
    }
  }

  const bySource = [...sourceMap.entries()].map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count)
  const topDestinations = [...destMap.entries()].map(([dest, count]) => ({ dest, count })).sort((a, b) => b.count - a.count).slice(0, 8)
  const wizardCompletions = sourceMap.get('wizard_completion') ?? 0

  // Build a continuous 12-week growth series (oldest→newest), zero-filling gaps.
  const growth: { week: string; count: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const k = weekKey(new Date(now - i * 7 * 86400000))
    growth.push({ week: k, count: weekMap.get(k) ?? 0 })
  }

  const convRows = (conversions.data ?? []) as { amount: number; commission_amount: number; status: string }[]
  const conversionValue = convRows.reduce((s, c) => s + Number(c.amount || 0), 0)
  const commission = convRows.reduce((s, c) => s + Number(c.commission_amount || 0), 0)

  const moRows = (manualOrders.data ?? []) as { amount: number; status: string; currency: string }[]
  const paid = moRows.filter(o => o.status === 'paid')
  const paidTotal = paid.reduce((s, o) => s + Number(o.amount || 0), 0)
  const currency = moRows[0]?.currency || 'USD'

  return {
    leads: {
      total, last7d, confirmed, pending, unsubscribed,
      bySource, wizardCompletions, topDestinations, growth,
    },
    affiliates: {
      clicksLifetime: clicksLifetime.count ?? 0,
      clicks30d: clicks30d.count ?? 0,
      conversions: convRows.length,
      conversionValue,
      commission,
    },
    manualRevenue: {
      paidTotal,
      paidCount: paid.length,
      pendingCount: moRows.filter(o => o.status === 'pending').length,
      currency,
    },
    corrections: { pending: correctionsPending.count ?? 0 },
  }
}
