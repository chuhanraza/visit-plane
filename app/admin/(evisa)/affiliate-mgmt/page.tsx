import Link from 'next/link'
import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin/guard'
import { listPartnersWithPerf, listConversions } from '@/lib/admin/affiliates'
import AffiliatesManager from './AffiliatesManager'

export const metadata: Metadata = { title: 'Affiliates — VisitPlane Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AdminAffiliateMgmt() {
  await requireAdmin()
  const [partners, { rows: conversions }] = await Promise.all([
    listPartnersWithPerf(),
    listConversions({ page: 1, pageSize: 50 }),
  ])

  const totalClicks = partners.reduce((s, p) => s + p.clicksLifetime, 0)
  const totalConv = partners.reduce((s, p) => s + p.conversions, 0)
  const totalComm = partners.reduce((s, p) => s + p.commissionEarned, 0)

  const Stat = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="text-gray-400 text-xs uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-bold text-white mt-1">{value}</div>
      {sub && <div className="text-gray-500 text-xs mt-0.5">{sub}</div>}
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-white">Affiliate management</h1>
        <Link href="/admin/affiliates" className="text-sm text-gray-400 hover:text-white">Click analytics →</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Active partners" value={String(partners.filter(p => p.active).length)} sub={`${partners.length} total`} />
        <Stat label="Clicks (lifetime)" value={String(totalClicks)} sub="across all partners" />
        <Stat label="Conversions" value={totalConv === 0 ? 'no data yet' : String(totalConv)} sub={totalConv === 0 ? 'logged manually' : undefined} />
        <Stat label="Commission earned" value={`$${totalComm.toFixed(2)}`} sub="from logged conversions" />
      </div>

      <AffiliatesManager partners={partners} conversions={conversions} />
    </div>
  )
}
