import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/guard'
import { getOrderDetail } from '@/lib/admin/data'
import { STATUS_LABELS, STATUS_BADGE, INVOICE_STATUS_BADGE, type OrderStatus } from '@/lib/orders/lifecycle'
import AdminOrderActions from './AdminOrderActions'
import { AdminNotes, AdminDocReview, AdminInvoiceActions } from './AdminPanels'

export const metadata: Metadata = { title: 'Order — VisitPlane Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const detail = await getOrderDetail(id)
  if (!detail) notFound()
  const { order, items, docs, invoice, history, payments } = detail
  const customer = (order as Record<string, unknown>).customers as { email?: string; full_name?: string; phone?: string } | null
  const fmt = (n: number) => `${order.currency} ${Number(n).toFixed(2)}`

  return (
    <div className="space-y-5">
      <Link href="/admin/orders" className="text-sm text-gray-400 hover:text-white">← Orders</Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">{order.order_ref}</h1>
          <p className="text-gray-400 text-sm">{customer?.full_name || customer?.email || order.contact_email} · {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[order.status]}`}>{STATUS_LABELS[order.status]}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left: details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Travellers (PII) */}
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="font-semibold text-white mb-3">Travellers</h2>
            <div className="space-y-3">
              {items.map((it: Record<string, unknown>) => (
                <div key={it.id as string} className="border border-gray-800 rounded-xl p-3 text-sm">
                  <div className="font-medium text-white">{it.traveler_full_name as string}</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-gray-400">
                    <span>Passport: <span className="text-gray-200">{it.traveler_passport_number as string}</span></span>
                    <span>Nationality: <span className="text-gray-200">{(it.traveler_nationality as string) || '—'}</span></span>
                    <span>DOB: <span className="text-gray-200">{(it.traveler_dob as string) || '—'}</span></span>
                    <span>Expiry: <span className="text-gray-200">{(it.traveler_passport_expiry as string) || '—'}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Documents review */}
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="font-semibold text-white mb-3">Documents</h2>
            <AdminDocReview docs={docs.map((d: Record<string, unknown>) => ({ id: d.id as string, doc_type: d.doc_type as string, file_name: d.file_name as string, status: d.status as string }))} />
          </section>

          {/* Invoice */}
          {invoice && (
            <section className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-white">Invoice {invoice.invoice_number}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full ${INVOICE_STATUS_BADGE[invoice.status]}`}>{invoice.status}</span>
              </div>
              <table className="w-full text-sm text-gray-300 mb-3">
                <tbody>
                  <tr><td className="py-1 text-gray-500">Government fees</td><td className="py-1 text-right">{fmt(order.subtotal_govt)}</td></tr>
                  <tr><td className="py-1 text-gray-500">Service fees</td><td className="py-1 text-right">{fmt(order.subtotal_service)}</td></tr>
                  {Number(order.discount_total) > 0 && <tr><td className="py-1 text-gray-500">Discount</td><td className="py-1 text-right">-{fmt(order.discount_total)}</td></tr>}
                  <tr className="border-t border-gray-800"><td className="pt-2 font-semibold text-white">Total</td><td className="pt-2 text-right font-bold text-white">{fmt(order.total)}</td></tr>
                </tbody>
              </table>
              <div className="flex items-center justify-between">
                <a href={`/api/invoices/${order.id}/pdf`} className="text-sm text-blue-400 hover:underline">Download PDF</a>
                <AdminInvoiceActions invoiceId={invoice.id} status={invoice.status} />
              </div>
              {payments.length > 0 && (
                <ul className="mt-3 text-xs text-gray-500 space-y-1">
                  {payments.map((p: Record<string, unknown>) => (
                    <li key={p.id as string}>{p.provider as string} · {p.status as string} · {order.currency} {Number(p.amount).toFixed(2)} · {new Date(p.created_at as string).toLocaleDateString()}</li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* History */}
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="font-semibold text-white mb-3">Status history</h2>
            <ol className="space-y-2">
              {history.map((h: Record<string, unknown>, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <div>
                    <span className="text-white">{(h.from_status ? `${STATUS_LABELS[h.from_status as string]} → ` : '')}{STATUS_LABELS[h.to_status as string]}</span>
                    <span className="text-gray-500"> · {h.changed_by as string}</span>
                    {(h.note as string) && <div className="text-gray-400">{h.note as string}</div>}
                    <div className="text-xs text-gray-600">{new Date(h.created_at as string).toLocaleString()}</div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Right: actions */}
        <div className="space-y-5">
          <AdminOrderActions orderId={order.id} current={order.status as OrderStatus} />
          <AdminNotes orderId={order.id} initial={(order.internal_notes as string) || ''} />
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-sm">
            <h2 className="font-semibold text-white mb-2">Customer</h2>
            <div className="text-gray-300">{customer?.full_name || '—'}</div>
            <div className="text-gray-400">{customer?.email || order.contact_email}</div>
            {customer?.phone && <div className="text-gray-400">{customer.phone}</div>}
          </section>
        </div>
      </div>
    </div>
  )
}
