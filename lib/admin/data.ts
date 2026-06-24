import { getServiceClient } from '@/lib/supabase/admin'
import { ORDER_STATUSES } from '@/lib/orders/lifecycle'

export interface OrderListRow {
  id: string; order_ref: string; status: string; total: number; currency: string
  contact_email: string; created_at: string; country?: string
}

export interface ListOrdersParams {
  status?: string; q?: string; sort?: 'newest' | 'oldest' | 'highest'; page?: number; pageSize?: number
}

export async function listOrders(params: ListOrdersParams): Promise<{ rows: OrderListRow[]; total: number; page: number; pageSize: number }> {
  const svc = getServiceClient()
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, params.pageSize ?? 20)
  const from = (page - 1) * pageSize

  let query = svc.from('orders').select(
    'id, order_ref, status, total, currency, contact_email, created_at, order_items(service_snapshot)',
    { count: 'exact' },
  )
  if (params.status && ORDER_STATUSES.includes(params.status as never)) query = query.eq('status', params.status)
  if (params.q) {
    const q = params.q.replace(/[%,]/g, '')
    query = query.or(`order_ref.ilike.%${q}%,contact_email.ilike.%${q}%`)
  }
  if (params.sort === 'oldest') query = query.order('created_at', { ascending: true })
  else if (params.sort === 'highest') query = query.order('total', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  query = query.range(from, from + pageSize - 1)
  const { data, count } = await query

  const rows: OrderListRow[] = (data ?? []).map((o: Record<string, unknown>) => {
    const items = (o.order_items as { service_snapshot?: { country_name?: string } }[]) ?? []
    return {
      id: o.id as string, order_ref: o.order_ref as string, status: o.status as string,
      total: Number(o.total), currency: o.currency as string, contact_email: o.contact_email as string,
      created_at: o.created_at as string, country: items[0]?.service_snapshot?.country_name,
    }
  })
  return { rows, total: count ?? 0, page, pageSize }
}

export async function getOrderDetail(id: string) {
  const svc = getServiceClient()
  const { data: order } = await svc.from('orders')
    .select('*, customers(id, email, full_name, phone, user_id)')
    .eq('id', id).maybeSingle()
  if (!order) return null
  const [{ data: items }, { data: docs }, { data: invoice }, { data: history }, { data: payments }] = await Promise.all([
    svc.from('order_items').select('*').eq('order_id', id).order('created_at'),
    svc.from('order_documents').select('*').eq('order_id', id).order('created_at'),
    svc.from('invoices').select('*').eq('order_id', id).maybeSingle(),
    svc.from('order_status_history').select('*').eq('order_id', id).order('created_at'),
    svc.from('payments').select('*').eq('order_id', id).order('created_at'),
  ])
  return { order, items: items ?? [], docs: docs ?? [], invoice, history: history ?? [], payments: payments ?? [] }
}

export async function listCustomers(params: { q?: string; page?: number; pageSize?: number }) {
  const svc = getServiceClient()
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, params.pageSize ?? 25)
  const from = (page - 1) * pageSize
  let query = svc.from('customers').select('id, email, full_name, phone, created_at, user_id', { count: 'exact' })
  if (params.q) {
    const q = params.q.replace(/[%,]/g, '')
    query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
  }
  query = query.order('created_at', { ascending: false }).range(from, from + pageSize - 1)
  const { data, count } = await query
  return { rows: data ?? [], total: count ?? 0, page, pageSize }
}

export async function getCustomerWithOrders(id: string) {
  const svc = getServiceClient()
  const { data: customer } = await svc.from('customers').select('*').eq('id', id).maybeSingle()
  if (!customer) return null
  const { data: orders } = await svc.from('orders')
    .select('id, order_ref, status, total, currency, created_at')
    .eq('customer_id', id).order('created_at', { ascending: false })
  return { customer, orders: orders ?? [] }
}

export async function listInvoices(params: { status?: string; page?: number; pageSize?: number }) {
  const svc = getServiceClient()
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, params.pageSize ?? 25)
  const from = (page - 1) * pageSize
  let query = svc.from('invoices')
    .select('id, invoice_number, status, total, currency, created_at, paid_at, order_id, orders(order_ref, contact_email)', { count: 'exact' })
  if (params.status) query = query.eq('status', params.status)
  query = query.order('created_at', { ascending: false }).range(from, from + pageSize - 1)
  const { data, count } = await query
  return { rows: data ?? [], total: count ?? 0, page, pageSize }
}

export async function dashboardStats() {
  const svc = getServiceClient()
  const [{ data: statuses }, { data: paidInvoices }, { data: recent }, { count: customerCount }] = await Promise.all([
    svc.from('orders').select('status'),
    svc.from('invoices').select('total, currency').eq('status', 'paid'),
    svc.from('orders').select('id, order_ref, status, total, currency, created_at, contact_email').order('created_at', { ascending: false }).limit(8),
    svc.from('customers').select('id', { count: 'exact', head: true }),
  ])
  const byStatus: Record<string, number> = {}
  for (const s of ORDER_STATUSES) byStatus[s] = 0
  for (const r of statuses ?? []) byStatus[(r as { status: string }).status] = (byStatus[(r as { status: string }).status] ?? 0) + 1
  const revenue = (paidInvoices ?? []).reduce((sum, i) => sum + Number((i as { total: number }).total), 0)
  return {
    byStatus,
    totalOrders: (statuses ?? []).length,
    revenue,
    paidCount: (paidInvoices ?? []).length,
    customerCount: customerCount ?? 0,
    recent: recent ?? [],
  }
}

export async function listAudit(params: { page?: number; pageSize?: number; entityType?: string }) {
  const svc = getServiceClient()
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, params.pageSize ?? 40)
  const from = (page - 1) * pageSize
  let query = svc.from('audit_log').select('*', { count: 'exact' })
  if (params.entityType) query = query.eq('entity_type', params.entityType)
  query = query.order('created_at', { ascending: false }).range(from, from + pageSize - 1)
  const { data, count } = await query
  return { rows: data ?? [], total: count ?? 0, page, pageSize }
}
