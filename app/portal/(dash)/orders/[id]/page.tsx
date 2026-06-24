import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requireCustomer } from '@/lib/portal/auth'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { STATUS_LABELS, STATUS_BADGE, INVOICE_STATUS_BADGE } from '@/lib/orders/lifecycle'
import type { RequiredDoc } from '@/lib/orders/types'
import DocumentUploader from './DocumentUploader'

export const metadata: Metadata = { title: 'Order — VisitPlane Portal', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function CustomerOrderDetail(
  { params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ placed?: string }> },
) {
  await requireCustomer()
  const { id } = await params
  const { placed } = await searchParams
  const supabase = await getSupabaseServerClient()

  // RLS confines these reads to the signed-in customer's own order.
  const { data: order } = await supabase
    .from('orders')
    .select('id, order_ref, status, currency, subtotal_govt, subtotal_service, discount_total, total, created_at')
    .eq('id', id).maybeSingle()
  if (!order) notFound()

  const [{ data: items }, { data: docs }, { data: invoice }, { data: history }] = await Promise.all([
    supabase.from('order_items').select('id, traveler_full_name, traveler_nationality, service_snapshot, line_total').eq('order_id', id),
    supabase.from('order_documents').select('id, doc_type, file_name, status, created_at').eq('order_id', id).order('created_at'),
    supabase.from('invoices').select('id, invoice_number, status, total, currency').eq('order_id', id).maybeSingle(),
    supabase.from('order_status_history').select('to_status, note, created_at').eq('order_id', id).order('created_at'),
  ])

  const snapshot = (items?.[0]?.service_snapshot ?? {}) as { country_name?: string; visa_type?: string; required_documents?: RequiredDoc[] }
  const fmt = (n: number) => `${order.currency} ${Number(n).toFixed(2)}`

  return (
    <div className="space-y-6">
      <Link href="/portal" className="text-sm text-gray-500 hover:text-gray-900">← All orders</Link>

      {placed && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl px-5 py-4">
          <p className="font-semibold">Order placed — {order.order_ref}</p>
          <p className="text-sm">We've emailed your confirmation. Upload your documents below so we can begin the review.</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{order.order_ref}</h1>
          <p className="text-gray-500 text-sm">
            {snapshot.country_name ? `${snapshot.country_name} — ${snapshot.visa_type}` : 'Visa order'} ·
            {' '}{new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-700'}`}>
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      {/* Travellers */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Travellers</h2>
        <ul className="divide-y divide-gray-100">
          {(items ?? []).map(it => (
            <li key={it.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-gray-900">{it.traveler_full_name}{it.traveler_nationality ? ` · ${it.traveler_nationality}` : ''}</span>
              <span className="text-gray-600">{fmt(it.line_total)}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Invoice */}
      {invoice && (
        <section className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Invoice {invoice.invoice_number}</h2>
              <p className="text-sm text-gray-500">Total {invoice.currency} {Number(invoice.total).toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${INVOICE_STATUS_BADGE[invoice.status] || 'bg-gray-100'}`}>
                {invoice.status}
              </span>
              <a href={`/api/invoices/${order.id}/pdf`} className="text-sm text-blue-600 hover:underline">Download PDF</a>
            </div>
          </div>
        </section>
      )}

      {/* Documents */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="font-semibold text-gray-900 mb-1">Documents</h2>
        <p className="text-sm text-gray-500 mb-4">Upload clear photos or PDFs (max 10 MB each). Your files are private and encrypted.</p>
        <DocumentUploader
          orderId={order.id}
          requiredDocs={snapshot.required_documents ?? []}
          existing={(docs ?? []).map(d => ({ id: d.id, doc_type: d.doc_type, file_name: d.file_name, status: d.status }))}
        />
      </section>

      {/* Timeline */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="font-semibold text-gray-900 mb-3">History</h2>
        <ol className="space-y-2">
          {(history ?? []).map((h, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <div>
                <span className="text-gray-900 font-medium">{STATUS_LABELS[h.to_status] || h.to_status}</span>
                {h.note && <span className="text-gray-500"> — {h.note}</span>}
                <div className="text-xs text-gray-400">{new Date(h.created_at).toLocaleString()}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
