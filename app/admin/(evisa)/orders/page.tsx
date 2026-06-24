import Link from 'next/link'
import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin/guard'
import { listOrders } from '@/lib/admin/data'
import { STATUS_LABELS, STATUS_BADGE, ORDER_STATUSES } from '@/lib/orders/lifecycle'

export const metadata: Metadata = { title: 'Orders — VisitPlane Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AdminOrders({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireAdmin()
  const sp = await searchParams
  const page = parseInt(sp.page ?? '1', 10) || 1
  const { rows, total, pageSize } = await listOrders({
    status: sp.status, q: sp.q, sort: (sp.sort as 'newest' | 'oldest' | 'highest') ?? 'newest', page,
  })
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const qs = (patch: Record<string, string | number | undefined>) => {
    const m = new URLSearchParams(sp as Record<string, string>)
    for (const [k, v] of Object.entries(patch)) { if (v === undefined || v === '') m.delete(k); else m.set(k, String(v)) }
    return `?${m.toString()}`
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Orders <span className="text-gray-500 text-sm font-normal">({total})</span></h1>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-2 items-center" action="/admin/orders" method="get">
        <input name="q" defaultValue={sp.q ?? ''} placeholder="Search ref or email"
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        <select name="status" defaultValue={sp.status ?? ''} className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select name="sort" defaultValue={sp.sort ?? 'newest'} className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="highest">Highest value</option>
        </select>
        <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg px-4 py-2">Filter</button>
        {(sp.q || sp.status) && <Link href="/admin/orders" className="text-gray-400 hover:text-white text-sm px-2">Clear</Link>}
      </form>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase">
            <tr>
              <th className="text-left font-medium px-4 py-3">Reference</th>
              <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Customer</th>
              <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Country</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-right font-medium px-4 py-3">Total</th>
              <th className="text-right font-medium px-4 py-3 hidden sm:table-cell">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">No orders match.</td></tr>
            )}
            {rows.map(o => (
              <tr key={o.id} className="hover:bg-gray-800/40">
                <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="text-blue-400 hover:underline font-medium">{o.order_ref}</Link></td>
                <td className="px-4 py-3 text-gray-300 hidden sm:table-cell">{o.contact_email}</td>
                <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{o.country ?? '—'}</td>
                <td className="px-4 py-3"><span className={`text-[11px] px-2 py-0.5 rounded-full ${STATUS_BADGE[o.status]}`}>{STATUS_LABELS[o.status]}</span></td>
                <td className="px-4 py-3 text-right text-gray-200">{o.currency} {o.total.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-gray-500 hidden sm:table-cell">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Page {page} of {pages}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={qs({ page: page - 1 })} className="px-3 py-1.5 bg-gray-800 rounded-lg text-gray-200 hover:bg-gray-700">Prev</Link>}
            {page < pages && <Link href={qs({ page: page + 1 })} className="px-3 py-1.5 bg-gray-800 rounded-lg text-gray-200 hover:bg-gray-700">Next</Link>}
          </div>
        </div>
      )}
    </div>
  )
}
