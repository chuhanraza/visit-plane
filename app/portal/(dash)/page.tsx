import Link from 'next/link'
import type { Metadata } from 'next'
import { requireCustomer } from '@/lib/portal/auth'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { STATUS_LABELS, STATUS_BADGE } from '@/lib/orders/lifecycle'

export const metadata: Metadata = { title: 'My orders — VisitPlane Portal', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function PortalDashboard() {
  const { email, customer } = await requireCustomer()
  const supabase = await getSupabaseServerClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_ref, status, total, currency, created_at')
    .order('created_at', { ascending: false })

  const list = orders ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My orders</h1>
          <p className="text-gray-500 text-sm">{customer?.full_name || email}</p>
        </div>
        <Link href="/order" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg px-4 py-2.5">
          + New visa order
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
          <p className="text-gray-900 font-medium">No orders yet</p>
          <p className="text-gray-500 text-sm mt-1 mb-4">Start a visa application to see it tracked here.</p>
          <Link href="/order" className="inline-block bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg px-4 py-2.5">
            Start an order
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
          {list.map(o => (
            <Link key={o.id} href={`/portal/orders/${o.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
              <div>
                <div className="font-medium text-gray-900">{o.order_ref}</div>
                <div className="text-xs text-gray-500">{new Date(o.created_at).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">{o.currency} {Number(o.total).toFixed(2)}</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[o.status] || 'bg-gray-100 text-gray-700'}`}>
                  {STATUS_LABELS[o.status] || o.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
