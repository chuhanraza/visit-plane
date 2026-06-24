import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit, type AuditActorType } from '@/lib/audit'
import type { ServiceRecord, TravelerInput } from './types'

/** Round to 2dp to avoid float drift in money math. */
const money = (n: number) => Math.round(n * 100) / 100

export interface CreateOrderArgs {
  customerId: string
  contactEmail: string
  serviceId: string
  travelers: TravelerInput[]
  actor: string
  actorType: AuditActorType
  ip?: string | null
}

export interface CreateOrderResult {
  orderId: string
  orderRef: string
  invoiceId: string
  total: number
  currency: string
}

/**
 * Create a SUBMITTED order with its items + invoice, using the service-role client.
 * Validates the service exists/active and that traveler fields are present. Writes
 * the initial status-history row and an audit entry. Pure data layer — callers
 * (API routes) own auth, the customer record, and email.
 */
export async function createSubmittedOrder(args: CreateOrderArgs): Promise<CreateOrderResult> {
  const svc = getServiceClient()

  const { data: service, error: sErr } = await svc
    .from('services')
    .select('*')
    .eq('id', args.serviceId)
    .eq('active', true)
    .maybeSingle()
  if (sErr) throw new Error(`Service lookup failed: ${sErr.message}`)
  if (!service) throw new Error('Selected visa service is unavailable')

  const s = service as ServiceRecord
  if (!args.travelers.length) throw new Error('At least one traveller is required')

  const govt = money(s.govt_fee)
  const serviceFee = money(s.service_fee)
  const perTraveler = money(govt + serviceFee)
  const n = args.travelers.length
  const subtotalGovt = money(govt * n)
  const subtotalService = money(serviceFee * n)
  const total = money(perTraveler * n)

  // 1. order (status submitted)
  const { data: order, error: oErr } = await svc.from('orders').insert({
    customer_id: args.customerId,
    status: 'submitted',
    currency: s.currency,
    subtotal_govt: subtotalGovt,
    subtotal_service: subtotalService,
    discount_total: 0,
    total,
    contact_email: args.contactEmail,
    submitted_at: new Date().toISOString(),
  }).select('id, order_ref').single()
  if (oErr) throw new Error(`Order create failed: ${oErr.message}`)
  const orderId = order.id as string
  const orderRef = order.order_ref as string

  // 2. order_items (one per traveller)
  const items = args.travelers.map(t => ({
    order_id: orderId,
    service_id: s.id,
    service_snapshot: {
      slug: s.slug, country_name: s.country_name, visa_type: s.visa_type,
      govt_fee: govt, service_fee: serviceFee, currency: s.currency,
    },
    traveler_full_name: t.full_name.trim(),
    traveler_passport_number: t.passport_number.trim(),
    traveler_dob: t.dob || null,
    traveler_nationality: t.nationality?.trim() || null,
    traveler_passport_expiry: t.passport_expiry || null,
    govt_fee: govt,
    service_fee: serviceFee,
    line_total: perTraveler,
  }))
  const { error: iErr } = await svc.from('order_items').insert(items)
  if (iErr) throw new Error(`Order items create failed: ${iErr.message}`)

  // 3. invoice (unpaid)
  const { data: invoice, error: invErr } = await svc.from('invoices').insert({
    order_id: orderId,
    status: 'unpaid',
    currency: s.currency,
    subtotal: money(subtotalGovt + subtotalService),
    discount: 0,
    total,
  }).select('id').single()
  if (invErr) throw new Error(`Invoice create failed: ${invErr.message}`)

  // 4. status history (null -> submitted)
  await svc.from('order_status_history').insert({
    order_id: orderId, from_status: null, to_status: 'submitted',
    changed_by: args.actor, note: 'Order placed by customer',
  })

  // 5. audit
  await writeAudit({
    actor: args.actor, actorType: args.actorType,
    action: 'order.created', entityType: 'order', entityId: orderId,
    metadata: { order_ref: orderRef, service: s.slug, travelers: n, total, currency: s.currency },
    ip: args.ip,
  })

  return { orderId, orderRef, invoiceId: invoice.id as string, total, currency: s.currency }
}
