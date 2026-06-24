import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit, type AuditActorType } from '@/lib/audit'
import { canTransition, STATUS_LABELS, type OrderStatus } from './lifecycle'
import { sendStatusUpdate, sendDocumentRequest } from '@/lib/email'

export interface TransitionArgs {
  orderId: string
  toStatus: OrderStatus
  actor: string
  actorType: AuditActorType
  note?: string
  notifyCustomer?: boolean
  ip?: string | null
}

export interface TransitionResult { ok: true; from: OrderStatus; to: OrderStatus }

/**
 * Move an order to `toStatus` with full enforcement + side effects. Validates the
 * transition in app code (the DB trigger is the backstop), writes the history row,
 * the audit entry, sets submitted_at when entering 'submitted', and optionally emails
 * the customer. Throws Error('illegal_transition') / Error('order_not_found') on failure.
 */
export async function performTransition(args: TransitionArgs): Promise<TransitionResult> {
  const svc = getServiceClient()

  const { data: order, error } = await svc
    .from('orders')
    .select('id, order_ref, status, contact_email')
    .eq('id', args.orderId)
    .maybeSingle()
  if (error || !order) throw new Error('order_not_found')

  const from = order.status as OrderStatus
  const to = args.toStatus
  if (!canTransition(from, to)) throw new Error('illegal_transition')

  const patch: Record<string, unknown> = { status: to }
  if (to === 'submitted') patch.submitted_at = new Date().toISOString()

  const { error: uErr } = await svc.from('orders').update(patch).eq('id', args.orderId)
  if (uErr) throw new Error(uErr.message)

  await svc.from('order_status_history').insert({
    order_id: args.orderId, from_status: from, to_status: to,
    changed_by: args.actor, note: args.note ?? null,
  })

  await writeAudit({
    actor: args.actor, actorType: args.actorType,
    action: 'order.status_changed', entityType: 'order', entityId: args.orderId,
    metadata: { from, to, order_ref: order.order_ref, note: args.note ?? null },
    ip: args.ip,
  })

  if (args.notifyCustomer && order.contact_email) {
    if (to === 'awaiting_documents') {
      await sendDocumentRequest(order.contact_email, { orderRef: order.order_ref, orderId: args.orderId, note: args.note })
    } else {
      await sendStatusUpdate(order.contact_email, {
        orderRef: order.order_ref, orderId: args.orderId,
        statusLabel: STATUS_LABELS[to] ?? to, note: args.note,
      })
    }
  }

  return { ok: true, from, to }
}
