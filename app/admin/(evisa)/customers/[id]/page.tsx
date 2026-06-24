import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/guard'
import { getCustomerWithOrders } from '@/lib/admin/data'
import { STATUS_LABELS, STATUS_BADGE } from '@/lib/orders/lifecycle'

export const metadata: Metadata = { title: 'Customer — VisitPlane Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AdminCustomerDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const data = await getCustomerWithOrders(id)
  if (!data) notFound()
  const { customer, orders } = data

  return (
    <div className="space-y-5">
      <Link href="/admin/customers" className="text-sm text-gray-400 hover:text-white">← Customers</Link>
      <div>
        <h1 className="text-xl font-bold text-white">{customer.full_name || customer.email}</h1>
        <p className="text-gray-400 text-sm">{customer.email}{customer.phone ? ` · ${customer.phone}` : ''} · {customer.user_id ? 'Registered' : 'Guest'}</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 text-sm font-semibold text-white">Orders ({orders.length})</div>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-800">
            {orders.length === 0 && <tr><td className="px-4 py-8 text-center text-gray-500">No orders.</td></tr>}
            {orders.map((o: Record<string, unknown>) => (
              <tr key={o.id as string} className="hover:bg-gray-800/40">
                <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="text-blue-400 hover:underline">{o.order_ref as string}</Link></td>
                <td className="px-4 py-3"><span className={`text-[11px] px-2 py-0.5 rounded-full ${STATUS_BADGE[o.status as string]}`}>{STATUS_LABELS[o.status as string]}</span></td>
                <td className="px-4 py-3 text-right text-gray-300">{o.currency as string} {Number(o.total).toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-gray-500">{new Date(o.created_at as string).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
