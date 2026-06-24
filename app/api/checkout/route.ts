import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase/admin'
import { resolveOrderAccess } from '@/lib/orders/access'
import { paymentsEnabled } from '@/lib/payments/config'
import { createCheckoutSession } from '@/lib/payments/stripe'

export const dynamic = 'force-dynamic'

function siteUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || new URL(req.url).origin
}

/**
 * Start payment for an order's invoice. When PAYMENTS_ENABLED is off (default) this
 * returns mode:'manual' — the customer pays via the invoice and an admin marks it
 * paid. When enabled, it returns a Stripe Checkout URL.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const orderId = String(body.orderId ?? '')
  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 })

  const access = await resolveOrderAccess(orderId)
  if (!access.allowed) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  if (!paymentsEnabled()) {
    return NextResponse.json({
      mode: 'manual',
      message: 'Online payment is not enabled yet. Your invoice has been issued — we will confirm payment manually.',
    })
  }

  const svc = getServiceClient()
  const { data: order } = await svc.from('orders')
    .select('order_ref, total, currency, contact_email, invoices(id, status)')
    .eq('id', orderId).maybeSingle()
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  const invoice = (order.invoices as { id: string; status: string }[] | null)?.[0]
  if (!invoice) return NextResponse.json({ error: 'No invoice' }, { status: 404 })
  if (invoice.status === 'paid') return NextResponse.json({ error: 'Invoice already paid' }, { status: 409 })

  const base = siteUrl(req)
  try {
    const session = await createCheckoutSession({
      orderId, orderRef: order.order_ref as string, invoiceId: invoice.id,
      amount: Number(order.total), currency: order.currency as string,
      customerEmail: order.contact_email as string,
      successUrl: `${base}/portal/orders/${orderId}?paid=1`,
      cancelUrl: `${base}/portal/orders/${orderId}`,
    })
    return NextResponse.json({ mode: 'stripe', url: session.url })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
