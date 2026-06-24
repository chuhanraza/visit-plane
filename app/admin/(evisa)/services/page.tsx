import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import type { ServiceRecord } from '@/lib/orders/types'
import ServicesManager from './ServicesManager'

export const metadata: Metadata = { title: 'Services — VisitPlane Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AdminServices() {
  await requireAdmin()
  const svc = getServiceClient()
  const { data } = await svc.from('services').select('*').order('country_name')
  const services = (data ?? []) as ServiceRecord[]

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-white">Services <span className="text-gray-500 text-sm font-normal">({services.length})</span></h1>
      <p className="text-gray-400 text-sm">Visa products customers can order. Fees are captured onto each order at purchase time, so editing a price here does not change existing orders.</p>
      <ServicesManager initial={services} />
    </div>
  )
}
