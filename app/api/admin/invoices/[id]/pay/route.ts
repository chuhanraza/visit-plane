import { NextRequest, NextResponse } from 'next/server'
import { requirePermissionApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'
import { sendInvoiceEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

/**
 * Manual invoice actions (used in manual/invoice mode while Stripe is flagged off):
 *   action = 'paid'   -> mark paid, record a manual payment
 *   action = 'unpaid' -> revert to unpaid
 *   action = 'refund' -> mark refunded, record a refund payment
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requirePermissionApi('revenue', 'edit')
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const body = await req.json().catch(() => ({}))
  const action = body.action
  if (!['paid', 'unpaid', 'refund'].includes(action)) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  const svc = getServiceClient()
  const { data: invoice } = await svc.from('invoices').select('*').eq('id', id).maybeSingle()
  if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

  const now = new Date().toISOString()

  if (action === 'paid') {
    const { error } = await svc.from('invoices').update({
      status: 'paid', amount_paid: invoice.total, paid_at: now,
    }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await svc.from('payments').insert({
      invoice_id: id, order_id: invoice.order_id, provider: 'manual',
      amount: invoice.total, currency: invoice.currency, status: 'succeeded', method: 'manual',
      raw: { recorded_by: actor },
    })
    // Receipt email (best-effort)
    const { data: ord } = await svc.from('orders').select('order_ref, contact_email').eq('id', invoice.order_id).maybeSingle()
    if (ord?.contact_email) {
      await sendInvoiceEmail(ord.contact_email, {
        orderRef: ord.order_ref, orderId: invoice.order_id, invoiceNumber: invoice.invoice_number,
        total: Number(invoice.total), currency: invoice.currency, paid: true,
      })
    }
  } else if (action === 'unpaid') {
    const { error } = await svc.from('invoices').update({ status: 'unpaid', amount_paid: 0, paid_at: null }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else { // refund
    const { error } = await svc.from('invoices').update({ status: 'refunded' }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await svc.from('payments').insert({
      invoice_id: id, order_id: invoice.order_id, provider: 'manual',
      amount: -Number(invoice.amount_paid || invoice.total), currency: invoice.currency,
      status: 'refunded', method: 'manual', raw: { recorded_by: actor },
    })
  }

  await writeAudit({
    actor, actorType: 'admin', action: `invoice.${action}`,
    entityType: 'invoice', entityId: id,
    metadata: { order_id: invoice.order_id, invoice_number: invoice.invoice_number, amount: invoice.total },
  })
  return NextResponse.json({ ok: true, action })
}
