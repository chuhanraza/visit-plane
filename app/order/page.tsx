import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/supabase/admin'
import type { ServiceRecord } from '@/lib/orders/types'
import OrderBuilder from './components/OrderBuilder'

export const metadata: Metadata = { title: 'Start a visa order — VisitPlane', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function OrderPage() {
  const user = await getSessionUser()
  if (!user) redirect('/portal/login?next=/order')

  // Active services for the catalogue (public-readable, but read server-side here).
  const svc = getServiceClient()
  const { data } = await svc
    .from('services')
    .select('*')
    .eq('active', true)
    .order('country_name', { ascending: true })

  const services = (data ?? []) as ServiceRecord[]

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Start a visa order</h1>
        <p className="text-gray-500 text-sm mb-6">
          Choose a service, add travellers, and review the fees before placing your order.
        </p>
        {services.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-500">
            No visa services are available right now. Please check back soon.
          </div>
        ) : (
          <OrderBuilder services={services} />
        )}
      </div>
    </div>
  )
}
