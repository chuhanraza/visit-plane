import { getServiceClient } from '@/lib/supabase/admin'
import { getSettings } from '@/lib/admin/settings'
import { AFFILIATE_PARTNERS, type AffiliatePartner } from '@/src/lib/affiliates'

/**
 * Revenue & Funnel aggregation — REAL Supabase data only. Nothing is fabricated;
 * empty sources render as 0 / "no data yet" upstream. The only *estimated* number
 * is value-per-visitor, computed from operator-entered earnings-per-click (EPC)
 * and clearly labeled as an estimate everywhere it appears.
 *
 * Funnel: visitors (distinct page.view sessions) → email captures → affiliate
 * clicks. Affiliate clicks are broken down by partner / placement / source page /
 * country so the operator can see exactly what is working.
 */

export const EPC_SETTINGS_KEY = 'affiliate_epc_estimates'

export interface PartnerPerf { partner: string; name: string; clicks: number; epc: number; estValue: number }
export interface Bucket { key: string; clicks: number }

export interface FunnelResult {
  range: { from: string; to: string; days: number }
  visitors: number
  pageViews: number
  leads: number
  confirmed: number
  affiliateClicks: number
  rates: { visitorToLead: number | null; leadToClick: number | null; visitorToClick: number | null }
  byPartner: PartnerPerf[]
  byPlacement: Bucket[]
  bySourcePage: Bucket[]
  byCountry: Bucket[]
  epc: Record<string, number>
  hasEpc: boolean
  estimatedRevenue: number
  valuePerVisitor: number | null
  pageViewTracked: boolean
  list: { total: number; confirmed: number; unsubscribed: number }
}

function pct(n: number, d: number): number | null {
  if (!d) return null
  return Math.round((n / d) * 1000) / 10 // one decimal
}

export async function getEpcEstimates(): Promise<Record<string, number>> {
  const s = await getSettings()
  const raw = s[EPC_SETTINGS_KEY]
  const out: Record<string, number> = {}
  if (raw && typeof raw === 'object') {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      const n = Number(v)
      if (Number.isFinite(n) && n >= 0) out[k] = n
    }
  }
  return out
}

export async function getFunnel(fromISO: string, toISO: string): Promise<FunnelResult> {
  const svc = getServiceClient()
  const fromMs = new Date(fromISO).getTime()
  const toMs = new Date(toISO).getTime()
  const days = Math.max(1, Math.round((toMs - fromMs) / 86400000) + 1)

  const [pageViews, clicks, leadsRes, confirmedRes, listTotal, listConfirmed, listUnsub, epc] = await Promise.all([
    svc.from('marketing_events').select('properties').eq('metric', 'page.view').gte('occurred_at', fromISO).lte('occurred_at', toISO).limit(100000),
    svc.from('affiliate_clicks').select('partner, placement, source_page, country, user_session_id').gte('clicked_at', fromISO).lte('clicked_at', toISO).limit(100000),
    svc.from('email_subscribers').select('id', { count: 'exact', head: true }).gte('captured_at', fromISO).lte('captured_at', toISO),
    svc.from('email_subscribers').select('id', { count: 'exact', head: true }).gte('confirmed_at', fromISO).lte('confirmed_at', toISO),
    svc.from('email_subscribers').select('id', { count: 'exact', head: true }),
    svc.from('email_subscribers').select('id', { count: 'exact', head: true }).not('confirmed_at', 'is', null),
    svc.from('email_subscribers').select('id', { count: 'exact', head: true }).not('unsubscribed_at', 'is', null),
    getEpcEstimates(),
  ])

  // ── Visitors = distinct anonymous sessions that viewed a money page ────────
  const pvRows = (pageViews.data ?? []) as { properties: { session?: string } | null }[]
  const sessions = new Set<string>()
  for (const r of pvRows) { const s = r.properties?.session; if (s) sessions.add(s) }
  const visitors = sessions.size
  const pageViewsCount = pvRows.length

  // ── Affiliate clicks + breakdowns ─────────────────────────────────────────
  const clickRows = (clicks.data ?? []) as { partner: string; placement: string | null; source_page: string | null; country: string | null }[]
  const affiliateClicks = clickRows.length
  const byPartnerMap = new Map<string, number>()
  const byPlacementMap = new Map<string, number>()
  const bySourceMap = new Map<string, number>()
  const byCountryMap = new Map<string, number>()
  for (const c of clickRows) {
    byPartnerMap.set(c.partner, (byPartnerMap.get(c.partner) ?? 0) + 1)
    byPlacementMap.set(c.placement || 'unknown', (byPlacementMap.get(c.placement || 'unknown') ?? 0) + 1)
    bySourceMap.set(c.source_page || '(direct/unknown)', (bySourceMap.get(c.source_page || '(direct/unknown)') ?? 0) + 1)
    byCountryMap.set(c.country || '—', (byCountryMap.get(c.country || '—') ?? 0) + 1)
  }

  const byPartner: PartnerPerf[] = [...byPartnerMap.entries()].map(([partner, c]) => {
    const cfg = AFFILIATE_PARTNERS[partner as AffiliatePartner]
    const rate = epc[partner] ?? 0
    return { partner, name: cfg?.name ?? partner, clicks: c, epc: rate, estValue: Math.round(c * rate * 100) / 100 }
  }).sort((a, b) => b.clicks - a.clicks)

  const sortBucket = (m: Map<string, number>, n = 20): Bucket[] =>
    [...m.entries()].map(([key, clicks]) => ({ key, clicks })).sort((a, b) => b.clicks - a.clicks).slice(0, n)

  const leads = leadsRes.count ?? 0
  const hasEpc = Object.values(epc).some(v => v > 0)
  const estimatedRevenue = Math.round(byPartner.reduce((s, p) => s + p.estValue, 0) * 100) / 100
  const valuePerVisitor = hasEpc && visitors > 0 ? Math.round((estimatedRevenue / visitors) * 100) / 100 : null

  return {
    range: { from: fromISO.slice(0, 10), to: toISO.slice(0, 10), days },
    visitors,
    pageViews: pageViewsCount,
    leads,
    confirmed: confirmedRes.count ?? 0,
    affiliateClicks,
    rates: {
      visitorToLead: pct(leads, visitors),
      leadToClick: pct(affiliateClicks, leads),
      visitorToClick: pct(affiliateClicks, visitors),
    },
    byPartner,
    byPlacement: sortBucket(byPlacementMap),
    bySourcePage: sortBucket(bySourceMap),
    byCountry: sortBucket(byCountryMap),
    epc,
    hasEpc,
    estimatedRevenue,
    valuePerVisitor,
    pageViewTracked: pageViewsCount > 0,
    list: { total: listTotal.count ?? 0, confirmed: listConfirmed.count ?? 0, unsubscribed: listUnsub.count ?? 0 },
  }
}
