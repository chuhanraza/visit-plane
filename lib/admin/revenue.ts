import { getServiceClient } from '@/lib/supabase/admin'

/**
 * Manual / affiliate revenue ledger (`manual_orders`) — separate from the e-Visa
 * fulfilment `orders` table. PAYMENTS ARE OFF: rows are recorded by the operator;
 * no cards are charged. Service-role reads/writes behind requireAdmin().
 */

export const MANUAL_ORDER_STATUSES = ['pending', 'paid', 'refunded', 'cancelled'] as const
export type ManualOrderStatus = (typeof MANUAL_ORDER_STATUSES)[number]
export const PRODUCT_TYPES = ['evisa', 'affiliate', 'consulting', 'other'] as const
export type ProductType = (typeof PRODUCT_TYPES)[number]

export const STATUS_BADGE: Record<ManualOrderStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-300',
  paid: 'bg-emerald-500/15 text-emerald-300',
  refunded: 'bg-blue-500/15 text-blue-300',
  cancelled: 'bg-gray-600/30 text-gray-400',
}

export interface ManualOrderRow {
  id: string
  order_ref: string
  customer_email: string
  product_type: string
  amount: number
  currency: string
  status: string
  affiliate_partner: string | null
  commission_amount: number
  source: string | null
  notes: string | null
  created_at: string
  fulfilled_at: string | null
}

export async function listManualOrders(params: { status?: string; q?: string; page?: number; pageSize?: number }) {
  const svc = getServiceClient()
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(200, params.pageSize ?? 25)
  const from = (page - 1) * pageSize
  let query = svc.from('manual_orders').select('*', { count: 'exact' })
  if (params.status && (MANUAL_ORDER_STATUSES as readonly string[]).includes(params.status)) query = query.eq('status', params.status)
  if (params.q) {
    const q = params.q.replace(/[%,]/g, '')
    query = query.or(`order_ref.ilike.%${q}%,customer_email.ilike.%${q}%`)
  }
  query = query.order('created_at', { ascending: false }).range(from, from + pageSize - 1)
  const { data, count } = await query
  return { rows: (data ?? []) as ManualOrderRow[], total: count ?? 0, page, pageSize }
}

export async function revenueTotals() {
  const svc = getServiceClient()
  const { data } = await svc.from('manual_orders').select('amount, commission_amount, status, currency').limit(10000)
  const rows = (data ?? []) as { amount: number; commission_amount: number; status: string; currency: string }[]
  const byStatus: Record<string, number> = { pending: 0, paid: 0, refunded: 0, cancelled: 0 }
  let paidTotal = 0, paidCommission = 0
  for (const r of rows) {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1
    if (r.status === 'paid') { paidTotal += Number(r.amount || 0); paidCommission += Number(r.commission_amount || 0) }
  }
  return { count: rows.length, byStatus, paidTotal, paidCommission, currency: rows[0]?.currency || 'USD' }
}

/** Active affiliate partner slugs/names for the create form dropdown. */
export async function activePartners(): Promise<{ slug: string; name: string }[]> {
  const svc = getServiceClient()
  const { data } = await svc.from('affiliate_partners').select('slug, name').eq('active', true).order('name')
  return (data ?? []) as { slug: string; name: string }[]
}
