import { getServiceClient } from '@/lib/supabase/admin'

/**
 * Leads / CRM data layer. The single lead store is `email_subscribers`
 * (segmented by captured_from); `data_corrections` is surfaced as a second tab.
 * All reads are service-role and MUST be called behind requireAdmin().
 */

export type OptInStatus = 'confirmed' | 'pending' | 'unsubscribed'

export interface LeadRow {
  id: number
  email: string
  captured_from: string | null
  route_passport: string | null
  route_destination: string | null
  lead_magnet: string | null
  captured_at: string | null
  consent_at: string | null
  confirmed_at: string | null
  unsubscribed_at: string | null
  ip_address: string | null
  user_agent: string | null
  admin_tags: string[]
  admin_note: string | null
}

export interface ListLeadsParams {
  q?: string
  source?: string
  status?: OptInStatus | ''
  page?: number
  pageSize?: number
}

const LEAD_COLS =
  'id, email, captured_from, route_passport, route_destination, lead_magnet, captured_at, consent_at, confirmed_at, unsubscribed_at, ip_address, user_agent, admin_tags, admin_note'

export function optInStatus(r: Pick<LeadRow, 'confirmed_at' | 'unsubscribed_at'>): OptInStatus {
  if (r.unsubscribed_at) return 'unsubscribed'
  if (r.confirmed_at) return 'confirmed'
  return 'pending'
}

export async function listLeads(params: ListLeadsParams): Promise<{ rows: LeadRow[]; total: number; page: number; pageSize: number }> {
  const svc = getServiceClient()
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(200, params.pageSize ?? 25)
  const from = (page - 1) * pageSize

  let query = svc.from('email_subscribers').select(LEAD_COLS, { count: 'exact' })

  if (params.q) {
    const q = params.q.replace(/[%,]/g, '')
    query = query.ilike('email', `%${q}%`)
  }
  if (params.source) query = query.eq('captured_from', params.source)
  if (params.status === 'unsubscribed') query = query.not('unsubscribed_at', 'is', null)
  else if (params.status === 'confirmed') query = query.is('unsubscribed_at', null).not('confirmed_at', 'is', null)
  else if (params.status === 'pending') query = query.is('unsubscribed_at', null).is('confirmed_at', null)

  query = query.order('captured_at', { ascending: false }).range(from, from + pageSize - 1)
  const { data, count } = await query
  return { rows: (data ?? []) as LeadRow[], total: count ?? 0, page, pageSize }
}

/** Distinct capture sources, for the filter dropdown. */
export async function leadSources(): Promise<{ source: string; count: number }[]> {
  const svc = getServiceClient()
  const { data } = await svc.from('email_subscribers').select('captured_from').limit(10000)
  const map = new Map<string, number>()
  for (const r of (data ?? []) as { captured_from: string | null }[]) {
    const s = (r.captured_from || 'unknown').trim()
    map.set(s, (map.get(s) ?? 0) + 1)
  }
  return [...map.entries()].map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count)
}

export async function getLead(id: number): Promise<LeadRow | null> {
  const svc = getServiceClient()
  const { data } = await svc.from('email_subscribers').select(LEAD_COLS).eq('id', id).maybeSingle()
  return (data as LeadRow) ?? null
}

export interface CorrectionRow {
  id: string
  passport_iso: string | null
  destination_iso: string | null
  what_is_wrong: string
  corrected_value: string | null
  source_url: string | null
  submitter_email: string | null
  status: string
  admin_notes: string | null
  created_at: string
}

export async function listCorrections(params: { status?: string; page?: number; pageSize?: number }) {
  const svc = getServiceClient()
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(200, params.pageSize ?? 25)
  const from = (page - 1) * pageSize
  let query = svc.from('data_corrections')
    .select('id, passport_iso, destination_iso, what_is_wrong, corrected_value, source_url, submitter_email, status, admin_notes, created_at', { count: 'exact' })
  if (params.status) query = query.eq('status', params.status)
  query = query.order('created_at', { ascending: false }).range(from, from + pageSize - 1)
  const { data, count } = await query
  return { rows: (data ?? []) as CorrectionRow[], total: count ?? 0, page, pageSize }
}

/** Full result set for CSV export (capped). Mirrors listLeads filters. */
export async function leadsForExport(params: Omit<ListLeadsParams, 'page' | 'pageSize'>): Promise<LeadRow[]> {
  const svc = getServiceClient()
  let query = svc.from('email_subscribers').select(LEAD_COLS)
  if (params.q) query = query.ilike('email', `%${params.q.replace(/[%,]/g, '')}%`)
  if (params.source) query = query.eq('captured_from', params.source)
  if (params.status === 'unsubscribed') query = query.not('unsubscribed_at', 'is', null)
  else if (params.status === 'confirmed') query = query.is('unsubscribed_at', null).not('confirmed_at', 'is', null)
  else if (params.status === 'pending') query = query.is('unsubscribed_at', null).is('confirmed_at', null)
  query = query.order('captured_at', { ascending: false }).limit(10000)
  const { data } = await query
  return (data ?? []) as LeadRow[]
}
