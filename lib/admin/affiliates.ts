import { getServiceClient } from '@/lib/supabase/admin'

/**
 * Affiliate management data layer. Partners live in `affiliate_partners`;
 * clicks in `affiliate_clicks` (real, ~3.4k rows); conversions in
 * `affiliate_conversions` (manual until a postback is wired). Service-role,
 * behind requireAdmin().
 */

export const PARTNER_TYPES = ['insurance', 'esim', 'flights', 'other'] as const
export const CONVERSION_STATUSES = ['pending', 'confirmed', 'paid', 'rejected'] as const

export interface PartnerRow {
  id: string
  slug: string
  name: string
  type: string
  commission_rate: number
  commission_model: string | null
  tracking_link: string | null
  active: boolean
  notes: string | null
}

export interface PartnerPerf extends PartnerRow {
  clicksLifetime: number
  clicks30d: number
  conversions: number
  conversionValue: number
  commissionEarned: number
}

export async function listPartnersWithPerf(): Promise<PartnerPerf[]> {
  const svc = getServiceClient()
  const since30d = new Date(Date.now() - 30 * 86400000).toISOString()
  const [{ data: partners }, { data: clicks }, { data: convs }] = await Promise.all([
    svc.from('affiliate_partners').select('*').order('name'),
    svc.from('affiliate_clicks').select('partner, clicked_at').limit(50000),
    svc.from('affiliate_conversions').select('partner_slug, amount, commission_amount'),
  ])

  const clicksLife = new Map<string, number>()
  const clicks30 = new Map<string, number>()
  for (const c of (clicks ?? []) as { partner: string; clicked_at: string }[]) {
    clicksLife.set(c.partner, (clicksLife.get(c.partner) ?? 0) + 1)
    if (c.clicked_at >= since30d) clicks30.set(c.partner, (clicks30.get(c.partner) ?? 0) + 1)
  }
  const convCount = new Map<string, number>()
  const convValue = new Map<string, number>()
  const convComm = new Map<string, number>()
  for (const c of (convs ?? []) as { partner_slug: string; amount: number; commission_amount: number }[]) {
    convCount.set(c.partner_slug, (convCount.get(c.partner_slug) ?? 0) + 1)
    convValue.set(c.partner_slug, (convValue.get(c.partner_slug) ?? 0) + Number(c.amount || 0))
    convComm.set(c.partner_slug, (convComm.get(c.partner_slug) ?? 0) + Number(c.commission_amount || 0))
  }

  return ((partners ?? []) as PartnerRow[]).map(p => ({
    ...p,
    commission_rate: Number(p.commission_rate),
    clicksLifetime: clicksLife.get(p.slug) ?? 0,
    clicks30d: clicks30.get(p.slug) ?? 0,
    conversions: convCount.get(p.slug) ?? 0,
    conversionValue: convValue.get(p.slug) ?? 0,
    commissionEarned: convComm.get(p.slug) ?? 0,
  }))
}

export interface ConversionRow {
  id: string
  partner_slug: string
  external_ref: string | null
  customer_email: string | null
  amount: number
  currency: string
  commission_amount: number
  status: string
  source: string | null
  note: string | null
  occurred_at: string
}

export async function listConversions(params: { page?: number; pageSize?: number }) {
  const svc = getServiceClient()
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(200, params.pageSize ?? 25)
  const from = (page - 1) * pageSize
  const { data, count } = await svc.from('affiliate_conversions')
    .select('*', { count: 'exact' })
    .order('occurred_at', { ascending: false })
    .range(from, from + pageSize - 1)
  return { rows: (data ?? []) as ConversionRow[], total: count ?? 0, page, pageSize }
}
