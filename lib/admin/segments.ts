import { getServiceClient } from '@/lib/supabase/admin'
import { optInStatus } from '@/lib/admin/leads'

/**
 * Dynamic segments. A definition is { match: 'all'|'any', conditions: Condition[] }.
 * Evaluated in-memory over the lead list (modest size) for correctness across
 * AND/OR + heterogeneous condition types, with metric conditions backed by
 * marketing_events. Service-role, behind requireAdmin().
 */

export type ConditionType = 'source' | 'status' | 'captured_within_days' | 'destination' | 'has_tag' | 'did_metric'
export interface Condition { type: ConditionType; value: string; days?: number }
export interface SegmentDef { match: 'all' | 'any'; conditions: Condition[] }

export const CONDITION_TYPES: { type: ConditionType; label: string; needsDays?: boolean }[] = [
  { type: 'source', label: 'Source equals' },
  { type: 'status', label: 'Opt-in status is' },
  { type: 'destination', label: 'Destination interest equals' },
  { type: 'has_tag', label: 'Has operator tag' },
  { type: 'captured_within_days', label: 'Captured within N days', needsDays: true },
  { type: 'did_metric', label: 'Did metric (within N days)', needsDays: true },
]

interface Profile {
  email: string; captured_from: string | null; captured_at: string | null
  confirmed_at: string | null; unsubscribed_at: string | null
  route_destination: string | null; admin_tags: string[] | null
}

async function metricEmails(metric: string, days: number): Promise<Set<string>> {
  const svc = getServiceClient()
  const since = new Date(Date.now() - Math.max(1, days) * 86400000).toISOString()
  const { data } = await svc.from('marketing_events').select('email').eq('metric', metric).gte('occurred_at', since).limit(50000)
  const set = new Set<string>()
  for (const r of (data ?? []) as { email: string | null }[]) if (r.email) set.add(r.email.toLowerCase())
  return set
}

function matchOne(p: Profile, c: Condition, metricSets: Map<string, Set<string>>): boolean {
  switch (c.type) {
    case 'source': return (p.captured_from ?? 'unknown') === c.value
    case 'status': return optInStatus(p) === c.value
    case 'destination': return (p.route_destination ?? '') === c.value
    case 'has_tag': return (p.admin_tags ?? []).includes(c.value)
    case 'captured_within_days': {
      const since = Date.now() - Math.max(1, c.days ?? 30) * 86400000
      return !!p.captured_at && new Date(p.captured_at).getTime() >= since
    }
    case 'did_metric': {
      const key = `${c.value}::${c.days ?? 30}`
      return metricSets.get(key)?.has(p.email.toLowerCase()) ?? false
    }
    default: return false
  }
}

export async function resolveSegment(def: SegmentDef): Promise<{ count: number; emails: string[]; sample: string[] }> {
  const svc = getServiceClient()
  const { data } = await svc.from('email_subscribers')
    .select('email, captured_from, captured_at, confirmed_at, unsubscribed_at, route_destination, admin_tags').limit(50000)
  const profiles = (data ?? []) as Profile[]

  // Pre-resolve metric conditions once.
  const metricSets = new Map<string, Set<string>>()
  for (const c of def.conditions) {
    if (c.type === 'did_metric') {
      const key = `${c.value}::${c.days ?? 30}`
      if (!metricSets.has(key)) metricSets.set(key, await metricEmails(c.value, c.days ?? 30))
    }
  }

  const conds = def.conditions ?? []
  const matched = profiles.filter(p => {
    if (conds.length === 0) return false
    return def.match === 'any' ? conds.some(c => matchOne(p, c, metricSets)) : conds.every(c => matchOne(p, c, metricSets))
  }).map(p => p.email)

  return { count: matched.length, emails: matched, sample: matched.slice(0, 8) }
}

export async function listSegments() {
  const svc = getServiceClient()
  const { data } = await svc.from('marketing_segments').select('*').order('created_at', { ascending: false })
  return (data ?? []) as { id: string; name: string; definition: SegmentDef; created_at: string }[]
}

export async function getSegment(id: string): Promise<{ id: string; name: string; definition: SegmentDef } | null> {
  const svc = getServiceClient()
  const { data } = await svc.from('marketing_segments').select('id, name, definition').eq('id', id).maybeSingle()
  return (data as { id: string; name: string; definition: SegmentDef }) ?? null
}
