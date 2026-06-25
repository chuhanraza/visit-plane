import { getServiceClient } from '@/lib/supabase/admin'

/**
 * A/B subject test results, derived from the event spine:
 *  - broadcast.email_sent events carry { variant, test_id, subjectA, subjectB }.
 *  - email.opened events (Resend webhook) are correlated by recipient email.
 * Service-role, behind requireAdmin().
 */

export interface ABTest {
  test_id: string
  when: string
  subjectA: string
  subjectB: string
  sentA: number; sentB: number
  openedA: number; openedB: number
  openRateA: number; openRateB: number
  winner: 'A' | 'B' | 'tie' | null
}

export async function abTestResults(limit = 10): Promise<ABTest[]> {
  const svc = getServiceClient()
  const since = new Date(Date.now() - 60 * 86400000).toISOString()
  const [sentRes, openRes] = await Promise.all([
    svc.from('marketing_events').select('email, properties, occurred_at').eq('metric', 'broadcast.email_sent').gte('occurred_at', since).limit(50000),
    svc.from('marketing_events').select('email, occurred_at').eq('metric', 'email.opened').gte('occurred_at', since).limit(50000),
  ])

  // earliest open per email
  const openedAt = new Map<string, string>()
  for (const o of (openRes.data ?? []) as { email: string | null; occurred_at: string }[]) {
    if (!o.email) continue
    const e = o.email.toLowerCase()
    const prev = openedAt.get(e)
    if (!prev || o.occurred_at < prev) openedAt.set(e, o.occurred_at)
  }

  interface Bucket { when: string; subjectA: string; subjectB: string; A: Set<string>; B: Set<string> }
  const tests = new Map<string, Bucket>()
  for (const s of (sentRes.data ?? []) as { email: string | null; properties: Record<string, unknown>; occurred_at: string }[]) {
    const p = s.properties || {}
    const testId = p.test_id as string | undefined
    const variant = p.variant as string | undefined
    if (!testId || !variant || !s.email) continue
    const b = tests.get(testId) ?? { when: s.occurred_at, subjectA: String(p.subjectA ?? ''), subjectB: String(p.subjectB ?? ''), A: new Set(), B: new Set() }
    if (s.occurred_at < b.when) b.when = s.occurred_at
    ;(variant === 'B' ? b.B : b.A).add(s.email.toLowerCase())
    tests.set(testId, b)
  }

  const openedCount = (emails: Set<string>, after: string) => {
    let n = 0
    for (const e of emails) { const o = openedAt.get(e); if (o && o >= after) n++ }
    return n
  }

  return [...tests.entries()].map(([test_id, b]) => {
    const sentA = b.A.size, sentB = b.B.size
    const openedA = openedCount(b.A, b.when), openedB = openedCount(b.B, b.when)
    const openRateA = sentA ? Math.round((openedA / sentA) * 100) : 0
    const openRateB = sentB ? Math.round((openedB / sentB) * 100) : 0
    let winner: ABTest['winner'] = null
    if (sentA && sentB) winner = openRateA === openRateB ? 'tie' : openRateA > openRateB ? 'A' : 'B'
    return { test_id, when: b.when, subjectA: b.subjectA, subjectB: b.subjectB, sentA, sentB, openedA, openedB, openRateA, openRateB, winner }
  }).sort((a, b) => (a.when < b.when ? 1 : -1)).slice(0, limit)
}
