import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/payments/stripe'
import { paymentsEnabled } from '@/lib/payments/config'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'
import { performTransition } from '@/lib/orders/transition'

export const dynamic = 'force-dynamic'

/**
 * Stripe webhook. Verifies the signature, is idempotent on the payment intent id,
 * marks the invoice paid, records a payment, and (best-effort) advances the order.
 * Never trusts the client for payment status. No-op when payments are disabled.
 */
export async function POST(req: NextRequest) {
  if (!paymentsEnabled()) return NextResponse.json({ received: true, mode: 'manual' })

  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const sig = req.headers.get('stripe-signature')
  if (!secret || !sig) return NextResponse.json({ error: 'Missing webhook secret/signature' }, { status: 400 })

  const raw = await req.text()
  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, secret)
  } catch (e) {
    return NextResponse.json({ error: `Signature verification failed: ${(e as Error).message}` }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed' && event.type !== 'payment_intent.succeeded') {
    return NextResponse.json({ received: true, ignored: event.type })
  }

  // Pull identifiers from the event
  const obj = event.data.object as Stripe.Checkout.Session | Stripe.PaymentIntent
  const meta = (obj.metadata ?? {}) as Record<string, string>
  const orderId = meta.order_id
  const invoiceId = meta.invoice_id
  const paymentIntentId =
    'payment_intent' in obj && typeof obj.payment_intent === 'string' ? obj.payment_intent
    : obj.id
  if (!orderId || !invoiceId) return NextResponse.json({ received: true, note: 'no metadata' })

  const svc = getServiceClient()

  // Idempotency: if we already recorded this payment intent, stop.
  const { data: existing } = await svc.from('payments').select('id').eq('provider_payment_id', paymentIntentId).maybeSingle()
  if (existing) return NextResponse.json({ received: true, idempotent: true })

  const { data: invoice } = await svc.from('invoices').select('total, currency, status').eq('id', invoiceId).maybeSingle()
  if (!invoice) return NextResponse.json({ received: true, note: 'invoice missing' })

  // Record payment (UNIQUE provider_payment_id is the final idempotency guard)
  const { error: payErr } = await svc.from('payments').insert({
    invoice_id: invoiceId, order_id: orderId, provider: 'stripe', provider_payment_id: paymentIntentId,
    amount: invoice.total, currency: invoice.currency, status: 'succeeded', method: 'card',
    raw: { event_id: event.id, type: event.type },
  })
  if (payErr && !payErr.message.includes('duplicate')) {
    return NextResponse.json({ error: payErr.message }, { status: 500 })
  }

  await svc.from('invoices').update({ status: 'paid', amount_paid: invoice.total, paid_at: new Date().toISOString() }).eq('id', invoiceId)

  await writeAudit({
    actor: 'system:stripe', actorType: 'system', action: 'invoice.paid',
    entityType: 'invoice', entityId: invoiceId,
    metadata: { order_id: orderId, payment_intent: paymentIntentId, amount: invoice.total },
  })

  // Best-effort: a paid submitted order moves into review.
  try {
    const { data: order } = await svc.from('orders').select('status').eq('id', orderId).maybeSingle()
    if (order?.status === 'submitted') {
      await performTransition({ orderId, toStatus: 'in_review', actor: 'system:stripe', actorType: 'system', note: 'Payment received', notifyCustomer: true })
    }
  } catch { /* non-fatal */ }

  return NextResponse.json({ received: true })
}
