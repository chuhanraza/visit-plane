import Link from 'next/link'
import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin/guard'
import { listManualOrders, revenueTotals, activePartners } from '@/lib/admin/revenue'
import { getFlag } from '@/lib/admin/settings'
import RevenueManager from './RevenueManager'

export const metadata: Metadata = { title: 'Revenue — VisitPlane Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AdminRevenue({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireAdmin()
  const sp = await searchParams
  const page = parseInt(sp.page ?? '1', 10) || 1
  const filters = { q: sp.q ?? '', status: sp.status ?? '' }

  const [{ rows, total, pageSize }, totals, partners, paymentsOn] = await Promise.all([
    listManualOrders({ ...filters, page }),
    revenueTotals(),
    activePartners(),
    getFlag('payments_enabled'),
  ])

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
        <h1 className="text-xl font-bold text-white">Revenue <span className="text-gray-500 text-sm font-normal">— manual / affiliate ledger</span></h1>
        <Link href="/admin/orders" className="text-sm text-gray-400 hover:text-white">e-Visa orders →</Link>
      </div>

      <div className={`rounded-xl border px-4 py-2.5 text-sm ${paymentsOn ? 'border-amber-700 bg-amber-900/20 text-amber-200' : 'border-gray-800 bg-gray-900 text-gray-400'}`}>
        {paymentsOn
          ? '⚠ payments_enabled flag is ON — but this ledger never charges cards; entries are recorded manually.'
          : 'Payments are OFF. Orders here are recorded manually — no cards are charged. Live processing is deferred until a legal entity + processor are in place.'}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Revenue (paid)" value={`${totals.currency} ${totals.paidTotal.toFixed(2)}`} sub={`${totals.byStatus.paid} paid order${totals.byStatus.paid === 1 ? '' : 's'}`} />
        <Stat label="Commission (paid)" value={`${totals.currency} ${totals.paidCommission.toFixed(2)}`} sub="affiliate commission earned" />
        <Stat label="Pending" value={String(totals.byStatus.pending)} sub="awaiting payment" />
        <Stat label="Total orders" value={String(totals.count)} sub={`${totals.byStatus.refunded} refunded · ${totals.byStatus.cancelled} cancelled`} />
      </div>

      <RevenueManager rows={rows} partners={partners} filters={filters} total={total} page={page} pageSize={pageSize} />
    </div>
  )
}
