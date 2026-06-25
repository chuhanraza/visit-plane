import { createHash } from 'crypto'
import { getServiceClient } from '@/lib/supabase/admin'

/**
 * GDPR tooling for a lead's PII (keyed by email). Export gathers everything;
 * erase removes the marketing footprint and anonymizes the email on financial
 * records (which are retained under the legal-obligation exception). Audited by
 * email HASH so the erasure is provable without retaining the address.
 * Service-role, behind requireAdmin() with leads:edit.
 */

export function emailHash(email: string): string {
  return createHash('sha256').update(email.trim().toLowerCase()).digest('hex').slice(0, 32)
}

export async function exportLeadData(email: string): Promise<Record<string, unknown>> {
  const svc = getServiceClient()
  const e = email.trim().toLowerCase()
  const [subscriber, events, manualOrders, conversions, corrections, evisaOrders, customer] = await Promise.all([
    svc.from('email_subscribers').select('*').ilike('email', e).maybeSingle(),
    svc.from('marketing_events').select('metric, properties, value, occurred_at').ilike('email', e).order('occurred_at', { ascending: false }).limit(1000),
    svc.from('manual_orders').select('*').ilike('customer_email', e),
    svc.from('affiliate_conversions').select('*').ilike('customer_email', e),
    svc.from('data_corrections').select('*').ilike('submitter_email', e),
    svc.from('orders').select('id, order_ref, status, total, currency, created_at').ilike('contact_email', e),
    svc.from('customers').select('id, email, full_name, phone, created_at').ilike('email', e).maybeSingle(),
  ])
  return {
    exported_at: new Date().toISOString(),
    email: e,
    subscriber: subscriber.data ?? null,
    marketing_events: events.data ?? [],
    manual_orders: manualOrders.data ?? [],
    affiliate_conversions: conversions.data ?? [],
    data_corrections: corrections.data ?? [],
    evisa_orders: evisaOrders.data ?? [],
    customer: customer.data ?? null,
  }
}

export async function eraseLeadData(email: string): Promise<{ subscribersDeleted: number; eventsDeleted: number; ordersAnonymized: number; conversionsAnonymized: number; correctionsAnonymized: number }> {
  const svc = getServiceClient()
  const e = email.trim().toLowerCase()
  const anon = `erased-${emailHash(e).slice(0, 12)}@gdpr.local`

  const [subDel, evDel, moAnon, acAnon, dcAnon] = await Promise.all([
    svc.from('email_subscribers').delete().ilike('email', e).select('id'),
    svc.from('marketing_events').delete().ilike('email', e).select('id'),
    svc.from('manual_orders').update({ customer_email: anon }).ilike('customer_email', e).select('id'),
    svc.from('affiliate_conversions').update({ customer_email: anon }).ilike('customer_email', e).select('id'),
    svc.from('data_corrections').update({ submitter_email: null }).ilike('submitter_email', e).select('id'),
  ])
  return {
    subscribersDeleted: (subDel.data ?? []).length,
    eventsDeleted: (evDel.data ?? []).length,
    ordersAnonymized: (moAnon.data ?? []).length,
    conversionsAnonymized: (acAnon.data ?? []).length,
    correctionsAnonymized: (dcAnon.data ?? []).length,
  }
}
