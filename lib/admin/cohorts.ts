import { getServiceClient } from '@/lib/supabase/admin'

/**
 * Lead cohort / retention: group leads by signup week, then measure opt-in
 * confirmation and conversion-to-customer per cohort. Real data only.
 * Service-role, behind requireAdmin().
 */

export interface Cohort {
  week: string
  size: number
  confirmed: number
  converted: number
  confirmRate: number
  convRate: number
}

function weekKey(d: Date): string {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const dayNum = (date.getUTCDay() + 6) % 7
  date.setUTCDate(date.getUTCDate() - dayNum + 3)
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4))
  const week = 1 + Math.round(((date.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7)
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

export async function cohortReport(weeks = 12): Promise<Cohort[]> {
  const svc = getServiceClient()
  const since = new Date(Date.now() - weeks * 7 * 86400000).toISOString()
  const [subs, custMan, custEvisa] = await Promise.all([
    svc.from('email_subscribers').select('email, captured_at, confirmed_at').gte('captured_at', since).limit(50000),
    svc.from('manual_orders').select('customer_email').limit(50000),
    svc.from('orders').select('contact_email').limit(50000),
  ])

  const customers = new Set<string>()
  for (const r of (custMan.data ?? []) as { customer_email: string | null }[]) if (r.customer_email) customers.add(r.customer_email.toLowerCase())
  for (const r of (custEvisa.data ?? []) as { contact_email: string | null }[]) if (r.contact_email) customers.add(r.contact_email.toLowerCase())

  const map = new Map<string, { size: number; confirmed: number; converted: number }>()
  for (const s of (subs.data ?? []) as { email: string; captured_at: string | null; confirmed_at: string | null }[]) {
    if (!s.captured_at) continue
    const k = weekKey(new Date(s.captured_at))
    const c = map.get(k) ?? { size: 0, confirmed: 0, converted: 0 }
    c.size++
    if (s.confirmed_at) c.confirmed++
    if (customers.has(s.email.toLowerCase())) c.converted++
    map.set(k, c)
  }

  return [...map.entries()]
    .map(([week, c]) => ({
      week, size: c.size, confirmed: c.confirmed, converted: c.converted,
      confirmRate: c.size ? Math.round((c.confirmed / c.size) * 100) : 0,
      convRate: c.size ? Math.round((c.converted / c.size) * 100) : 0,
    }))
    .sort((a, b) => (a.week < b.week ? 1 : -1))
}
