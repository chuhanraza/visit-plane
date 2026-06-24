import Link from 'next/link'
import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin/guard'
import { dashboardStats } from '@/lib/admin/data'
import { STATUS_LABELS, STATUS_BADGE, ORDER_STATUSES } from '@/lib/orders/lifecycle'

export const metadata: Metadata = { title: 'Overview — VisitPlane Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AdminOverview() {
  await requireAdmin()
  const s = await dashboardStats()
  const maxCount = Math.max(1, ...ORDER_STATUSES.map(k => s.byStatus[k] ?? 0))

  const Stat = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="text-gray-400 text-xs uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-bold text-white mt-1">{value}</div>
      {sub && <div className="text-gray-500 text-xs mt-0.5">{sub}</div>}
    </div>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total orders" value={String(s.totalOrders)} />
        <Stat label="Revenue (paid)" value={`$${s.revenue.toFixed(2)}`} sub={`${s.paidCount} paid invoice${s.paidCount === 1 ? '' : 's'}`} />
        <Stat label="Customers" value={String(s.customerCount)} />
        <Stat label="In review + processing" value={String((s.byStatus.in_review ?? 0) + (s.byStatus.processing ?? 0))} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status breakdown */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-4">Orders by status</h2>
          <div className="space-y-2">
            {ORDER_STATUSES.map(k => {
              const n = s.byStatus[k] ?? 0
              return (
                <Link key={k} href={`/admin/orders?status=${k}`} className="flex items-center gap-3 group">
                  <span className="w-32 text-xs text-gray-400 group-hover:text-white">{STATUS_LABELS[k]}</span>
                  <div className="flex-1 h-5 bg-gray-800 rounded overflow-hidden">
                    <div className="h-full bg-blue-600/70 group-hover:bg-blue-500" style={{ width: `${(n / maxCount) * 100}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs text-gray-300">{n}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-4">Recent orders</h2>
          {s.recent.length === 0 ? (
            <p className="text-gray-500 text-sm">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-gray-800">
              {s.recent.map((o: Record<string, unknown>) => (
                <li key={o.id as string}>
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between py-2.5 hover:bg-gray-800/50 -mx-2 px-2 rounded">
                    <div>
                      <div className="text-sm text-white">{o.order_ref as string}</div>
                      <div className="text-xs text-gray-500">{o.contact_email as string}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-300">{o.currency as string} {Number(o.total).toFixed(2)}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${STATUS_BADGE[o.status as string]}`}>{STATUS_LABELS[o.status as string]}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
