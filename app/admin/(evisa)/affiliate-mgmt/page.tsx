import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin/guard'

export const metadata: Metadata = { title: 'Affiliates — VisitPlane Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AdminAffiliateMgmtPlaceholder() {
  await requireAdmin()
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">Affiliate management</h1>
      <p className="text-gray-400 text-sm">This module is being wired up in this build.</p>
    </div>
  )
}
