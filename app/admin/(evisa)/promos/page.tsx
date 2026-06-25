import type { Metadata } from 'next'
import { requirePermission } from '@/lib/admin/guard'
import { listPromos } from '@/lib/admin/promos'
import PromosClient from './PromosClient'

export const metadata: Metadata = { title: 'Discounts — VisitPlane Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AdminPromos() {
  await requirePermission('revenue', 'view')
  const promos = await listPromos()
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-white">Discounts <span className="text-gray-500 text-sm font-normal">— promo codes</span></h1>
      <PromosClient promos={promos} />
      <p className="text-xs text-gray-600">Codes apply to e-Visa service fees (and any future manual checkout). Scheduling + usage limits are enforced when a code is redeemed.</p>
    </div>
  )
}
