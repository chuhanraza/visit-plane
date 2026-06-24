import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase/admin'
import { resolveOrderAccess } from '@/lib/orders/access'
import { buildInvoicePdf } from '@/lib/invoices/pdf'

export const dynamic = 'force-dynamic'

/** GET /api/invoices/[orderId]/pdf — branded invoice PDF for the owner or an admin. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: orderId } = await ctx.params

  const access = await resolveOrderAccess(orderId)
  if (!access.allowed) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const svc = getServiceClient()
  const { data: order } = await svc.from('orders')
    .select('*, customers(email, full_name), invoices(*), order_items(traveler_full_name, govt_fee, service_fee, line_total, service_snapshot)')
    .eq('id', orderId).maybeSingle()
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const invoice = (order.invoices as Record<string, unknown>[] | null)?.[0]
  if (!invoice) return NextResponse.json({ error: 'No invoice for this order' }, { status: 404 })

  const items = (order.order_items as Record<string, unknown>[]) ?? []
  const cust = order.customers as { email?: string; full_name?: string } | null
  const snap = (items[0]?.service_snapshot ?? {}) as { country_name?: string; visa_type?: string }

  // One invoice line per traveller (gov + service folded into unit price).
  const lineItems = items.map(it => ({
    description: `Visa service — ${it.traveler_full_name as string}`,
    qty: 1,
    unit: Number(it.line_total),
    amount: Number(it.line_total),
  }))

  const pdf = buildInvoicePdf({
    invoiceNumber: invoice.invoice_number as string,
    orderRef: order.order_ref as string,
    status: invoice.status as string,
    issuedAt: (invoice.issued_at as string) ?? (order.created_at as string),
    currency: order.currency as string,
    customerName: cust?.full_name ?? '',
    customerEmail: cust?.email ?? (order.contact_email as string),
    countryService: snap.country_name ? `${snap.country_name} — ${snap.visa_type}` : 'Visa service',
    lineItems,
    subtotal: Number(order.subtotal_govt) + Number(order.subtotal_service),
    discount: Number(order.discount_total),
    total: Number(order.total),
  })

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${invoice.invoice_number}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
