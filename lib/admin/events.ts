import { getServiceClient } from '@/lib/supabase/admin'

/**
 * Marketing event spine. email_subscribers is the profile table (keyed by
 * lowercased email). Events power the per-lead timeline, segments, and flow
 * triggers. recordEvent is idempotent on (email, metric, unique_id).
 * Never throws into the caller (analytics must not break real operations).
 */

export interface RecordEventInput {
  email: string
  metric: string
  properties?: Record<string, unknown>
  value?: number | null
  uniqueId?: string | null
  backfill?: boolean
  occurredAt?: string
}

export async function recordEvent(input: RecordEventInput): Promise<void> {
  try {
    const svc = getServiceClient()
    const email = input.email.trim().toLowerCase()
    if (!email || !input.metric) return
    // auto-register the metric name (ignore duplicates)
    await svc.from('marketing_metrics').upsert({ name: input.metric }, { onConflict: 'name', ignoreDuplicates: true })
    const { error } = await svc.from('marketing_events').insert({
      email, metric: input.metric, properties: input.properties ?? {},
      value: input.value ?? null, unique_id: input.uniqueId ?? null,
      backfill: input.backfill ?? false,
      occurred_at: input.occurredAt ?? new Date().toISOString(),
    })
    if (error && error.code !== '23505') console.error('[events] insert failed:', error.message)
  } catch (e) {
    console.error('[events] unexpected:', (e as Error).message)
  }
}

export interface TimelineItem { ts: string; kind: string; title: string; stored: boolean }

/**
 * Merge stored marketing_events with events DERIVED from existing records, so
 * the timeline is meaningful even before any events were recorded.
 */
export async function leadTimeline(email: string): Promise<TimelineItem[]> {
  const svc = getServiceClient()
  const e = email.trim().toLowerCase()
  const [events, sub, manual, evisa, convs] = await Promise.all([
    svc.from('marketing_events').select('metric, properties, value, occurred_at').ilike('email', e).order('occurred_at', { ascending: false }).limit(200),
    svc.from('email_subscribers').select('captured_at, captured_from, consent_at, confirmed_at, unsubscribed_at, lead_magnet').ilike('email', e).maybeSingle(),
    svc.from('manual_orders').select('order_ref, status, amount, currency, created_at').ilike('customer_email', e).order('created_at', { ascending: false }).limit(50),
    svc.from('orders').select('order_ref, status, created_at').ilike('contact_email', e).order('created_at', { ascending: false }).limit(50),
    svc.from('affiliate_conversions').select('partner_slug, amount, occurred_at').ilike('customer_email', e).order('occurred_at', { ascending: false }).limit(50),
  ])

  const items: TimelineItem[] = []
  for (const ev of (events.data ?? []) as { metric: string; value: number | null; occurred_at: string }[])
    items.push({ ts: ev.occurred_at, kind: ev.metric, title: ev.metric + (ev.value != null ? ` ($${Number(ev.value).toFixed(2)})` : ''), stored: true })

  const s = sub.data as { captured_at: string | null; captured_from: string | null; consent_at: string | null; confirmed_at: string | null; unsubscribed_at: string | null; lead_magnet: string | null } | null
  if (s) {
    if (s.captured_at) items.push({ ts: s.captured_at, kind: 'lead.captured', title: `Captured via ${s.captured_from ?? 'unknown'}${s.lead_magnet ? ` (${s.lead_magnet})` : ''}`, stored: false })
    if (s.consent_at) items.push({ ts: s.consent_at, kind: 'consent', title: 'Consent given', stored: false })
    if (s.confirmed_at) items.push({ ts: s.confirmed_at, kind: 'lead.confirmed', title: 'Double opt-in confirmed', stored: false })
    if (s.unsubscribed_at) items.push({ ts: s.unsubscribed_at, kind: 'unsubscribed', title: 'Unsubscribed', stored: false })
  }
  for (const o of (manual.data ?? []) as { order_ref: string; status: string; amount: number; currency: string; created_at: string }[])
    items.push({ ts: o.created_at, kind: 'order', title: `Manual order ${o.order_ref} — ${o.currency} ${Number(o.amount).toFixed(2)} (${o.status})`, stored: false })
  for (const o of (evisa.data ?? []) as { order_ref: string; status: string; created_at: string }[])
    items.push({ ts: o.created_at, kind: 'order', title: `e-Visa order ${o.order_ref} (${o.status})`, stored: false })
  for (const c of (convs.data ?? []) as { partner_slug: string; amount: number; occurred_at: string }[])
    items.push({ ts: c.occurred_at, kind: 'conversion', title: `Affiliate conversion: ${c.partner_slug} ($${Number(c.amount).toFixed(2)})`, stored: false })

  return items.filter(i => i.ts).sort((a, b) => (a.ts < b.ts ? 1 : -1))
}
