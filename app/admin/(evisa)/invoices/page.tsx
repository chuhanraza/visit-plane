import Link from 'next/link'
import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin/guard'
import { listInvoices } from '@/lib/admin/data'
import { INVOICE_STATUS_BADGE } from '@/lib/orders/lifecycle'

export const metadata: Metadata = { title: 'Invoices — VisitPlane Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

const STATUSES = ['unpaid', 'paid', 'refunded', 'void']

export default async function AdminInvoices({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireAdmin()
  const sp = await searchParams
  const page = parseInt(sp.page ?? '1', 10) || 1
  const { rows, total, pageSize } = await listInvoices({ status: sp.status, page })
  const pages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-white">Invoices <span className="text-gray-500 text-sm font-normal">({total})</span></h1>
      <div className="flex gap-2 text-sm">
        <Link href="/admin/invoices" className={`px-3 py-1.5 rounded-lg ${!sp.status ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}>All</Link>
        {STATUSES.map(s => (
          <Link key={s} href={`/admin/invoices?status=${s}`} className={`px-3 py-1.5 rounded-lg capitalize ${sp.status === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}>{s}</Link>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase">
            <tr><th className="text-left font-medium px-4 py-3">Invoice</th><th className="text-left font-medium px-4 py-3">Order</th><th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Customer</th><th className="text-left font-medium px-4 py-3">Status</th><th className="text-right font-medium px-4 py-3">Total</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">No invoices.</td></tr>}
            {rows.map((inv: Record<string, unknown>) => {
              const ord = inv.orders as { order_ref?: string; contact_email?: string } | null
              return (
                <tr key={inv.id as string} className="hover:bg-gray-800/40">
                  <td className="px-4 py-3 text-gray-200">{inv.invoice_number as string}</td>
                  <td className="px-4 py-3"><Link href={`/admin/orders/${inv.order_id}`} className="text-blue-400 hover:underline">{ord?.order_ref ?? '—'}</Link></td>
                  <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{ord?.contact_email ?? '—'}</td>
                  <td className="px-4 py-3"><span className={`text-[11px] px-2 py-0.5 rounded-full ${INVOICE_STATUS_BADGE[inv.status as string]}`}>{inv.status as string}</span></td>
                  <td className="px-4 py-3 text-right text-gray-200">{inv.currency as string} {Number(inv.total).toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex justify-end gap-2 text-sm">
          {page > 1 && <Link href={`/admin/invoices?${new URLSearchParams({ ...sp, page: String(page - 1) })}`} className="px-3 py-1.5 bg-gray-800 rounded-lg text-gray-200">Prev</Link>}
          {page < pages && <Link href={`/admin/invoices?${new URLSearchParams({ ...sp, page: String(page + 1) })}`} className="px-3 py-1.5 bg-gray-800 rounded-lg text-gray-200">Next</Link>}
        </div>
      )}
    </div>
  )
}
