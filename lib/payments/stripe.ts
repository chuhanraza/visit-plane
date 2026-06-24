import Stripe from 'stripe'
import { paymentsEnabled } from './config'

let cached: Stripe | null = null

/** Lazily construct the Stripe client. Throws if called while payments are disabled. */
export function getStripe(): Stripe {
  if (!paymentsEnabled()) throw new Error('payments_disabled')
  if (cached) return cached
  cached = new Stripe(process.env.STRIPE_SECRET_KEY as string)
  return cached
}

export interface CheckoutArgs {
  orderId: string
  orderRef: string
  invoiceId: string
  amount: number     // major units (e.g. dollars)
  currency: string
  customerEmail: string
  successUrl: string
  cancelUrl: string
}

/** Create a Stripe Checkout Session for an order's invoice. Caller must guard the flag. */
export async function createCheckoutSession(a: CheckoutArgs): Promise<{ id: string; url: string | null }> {
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: a.customerEmail || undefined,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: a.currency.toLowerCase(),
        unit_amount: Math.round(a.amount * 100),
        product_data: { name: `VisitPlane visa order ${a.orderRef}` },
      },
    }],
    // Tie the session back to our records; the webhook reads these.
    metadata: { order_id: a.orderId, invoice_id: a.invoiceId, order_ref: a.orderRef },
    payment_intent_data: { metadata: { order_id: a.orderId, invoice_id: a.invoiceId } },
    success_url: a.successUrl,
    cancel_url: a.cancelUrl,
  })
  return { id: session.id, url: session.url }
}
