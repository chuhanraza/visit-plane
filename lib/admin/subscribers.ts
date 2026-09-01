/**
 * Shared query/filter logic for the /admin/subscribers list and its CSV export,
 * so both build the exact same filtered result set from the same searchParams.
 */
import { getServiceClient } from '@/lib/supabase/admin'

export interface Subscriber {
  email:             string
  route_passport:    string | null
  route_destination: string | null
  captured_at:       string
  captured_from:     string
  confirmed_at:      string | null
  unsubscribed_at:   string | null
  admin_tags:        string[] | null
  admin_note:        string | null
}

export interface SubscriberFilters {
  q?:        string
  confirmed?: string  // 'yes' | 'no'
  unsub?:     string  // 'yes' | 'no'
  passport?:  string
}

const COLUMNS = 'email,route_passport,route_destination,captured_at,captured_from,confirmed_at,unsubscribed_at,admin_tags,admin_note'

/** Full, unfiltered dataset — backs stats, source breakdown, top routes, daily chart. */
export async function fetchAllSubscribers(): Promise<Subscriber[]> {
  const { data, error } = await getServiceClient()
    .from('email_subscribers')
    .select(COLUMNS)
    .order('captured_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return (data ?? []) as Subscriber[]
}

/** Filtered dataset for the table + CSV export, built server-side from searchParams. */
export async function fetchFilteredSubscribers(filters: SubscriberFilters): Promise<Subscriber[]> {
  let query = getServiceClient()
    .from('email_subscribers')
    .select(COLUMNS)
    .order('captured_at', { ascending: false })

  if (filters.q?.trim()) {
    query = query.ilike('email', `%${filters.q.trim()}%`)
  }
  if (filters.confirmed === 'yes') query = query.not('confirmed_at', 'is', null)
  if (filters.confirmed === 'no')  query = query.is('confirmed_at', null)
  if (filters.unsub === 'yes')     query = query.not('unsubscribed_at', 'is', null)
  if (filters.unsub === 'no')      query = query.is('unsubscribed_at', null)
  if (filters.passport?.trim())    query = query.eq('route_passport', filters.passport.trim())

  const { data, error } = await query
  if (error) { console.error(error); return [] }
  return (data ?? []) as Subscriber[]
}

export function hasActiveFilters(filters: SubscriberFilters): boolean {
  return Boolean(filters.q?.trim() || filters.confirmed || filters.unsub || filters.passport?.trim())
}
