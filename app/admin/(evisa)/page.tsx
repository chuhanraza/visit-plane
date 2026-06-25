import Link from 'next/link'
import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin/guard'
import { dashboardStats } from '@/lib/admin/data'
import { operatorDashboard } from '@/lib/admin/dashboard'
import { setupChecklist } from '@/lib/admin/setup'
import { STATUS_LABELS, STATUS_BADGE, ORDER_STATUSES } from '@/lib/orders/lifecycle'

export const metadata: Metadata = { title: 'Dashboard — VisitPlane Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AdminOverview() {
  await requireAdmin()
  const [s, d, setup] = await Promise.all([dashboardStats(), operatorDashboard(), setupChecklist()])
  const maxCount = Math.max(1, ...ORDER_STATUSES.map(k => s.byStatus[k] ?? 0))
  const maxSource = Math.max(1, ...d.leads.bySource.map(x => x.count))
  const maxGrowth = Math.max(1, ...d.leads.growth.map(x => x.count))

  const Stat = ({ label, value, sub, href }: { label: string; value: string; sub?: string; href?: string }) => {
    const inner = (
      <>
        <div className="text-gray-400 text-xs uppercase tracking-wide">{label}</div>
        <div className="text-2xl font-bold text-white mt-1">{value}</div>
        {sub && <div className="text-gray-500 text-xs mt-0.5">{sub}</div>}
      </>
    )
    return href
      ? <Link href={href} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 block">{inner}</Link>
      : <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">{inner}</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Dashboard</h1>

      {/* ── Setup checklist (hidden once complete) ──────────────────────── */}
      {setup.done < setup.total && (
        <details className="bg-gray-900 border border-gray-800 rounded-2xl p-5" open>
          <summary className="cursor-pointer flex items-center justify-between">
            <span className="font-semibold text-white">Get set up <span className="text-gray-500 text-sm font-normal">— {setup.done}/{setup.total} done</span></span>
            <div className="w-40 h-2 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${(setup.done / setup.total) * 100}%` }} /></div>
          </summary>
          <ul className="mt-4 space-y-2">
            {setup.items.map(i => (
              <li key={i.key} className="flex items-start gap-2.5 text-sm">
                <span className={`mt-0.5 ${i.done ? 'text-emerald-400' : 'text-gray-600'}`}>{i.done ? '✓' : '○'}</span>
                <div>
                  <Link href={i.href} className={`${i.done ? 'text-gray-400 line-through' : 'text-gray-200 hover:text-white'}`}>{i.label}</Link>
                  {!i.done && <div className="text-xs text-gray-600">{i.hint}</div>}
                </div>
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* ── Leads & growth (real lead data) ─────────────────────────────── */}
      <div>
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-2">Leads</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Total leads" value={String(d.leads.total)} sub={`${d.leads.confirmed} confirmed · ${d.leads.pending} pending`} href="/admin/leads" />
          <Stat label="Leads this week" value={String(d.leads.last7d)} sub="last 7 days" href="/admin/leads" />
          <Stat label="Wizard completions" value={String(d.leads.wizardCompletions)} sub="captured via AI wizard" href="/admin/leads?source=wizard_completion" />
          <Stat label="Pending corrections" value={String(d.corrections.pending)} sub="user data reports" href="/admin/leads?tab=corrections" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lead sources */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-4">Leads by source</h2>
          {d.leads.bySource.length === 0 ? (
            <p className="text-gray-500 text-sm">No leads yet.</p>
          ) : (
            <div className="space-y-2">
              {d.leads.bySource.map(({ source, count }) => (
                <Link key={source} href={`/admin/leads?source=${encodeURIComponent(source)}`} className="flex items-center gap-3 group">
                  <span className="w-32 text-xs text-gray-400 group-hover:text-white truncate">{source}</span>
                  <div className="flex-1 h-5 bg-gray-800 rounded overflow-hidden">
                    <div className="h-full bg-emerald-600/70 group-hover:bg-emerald-500" style={{ width: `${(count / maxSource) * 100}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs text-gray-300">{count}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Email-list growth (12 weeks) */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-4">New leads / week <span className="text-gray-500 text-xs font-normal">(12 wks)</span></h2>
          {d.leads.total === 0 ? (
            <p className="text-gray-500 text-sm">No data yet.</p>
          ) : (
            <div className="flex items-end gap-1 h-32">
              {d.leads.growth.map(({ week, count }) => (
                <div key={week} className="flex-1 flex flex-col items-center justify-end group" title={`${week}: ${count}`}>
                  <div className="w-full bg-blue-600/70 group-hover:bg-blue-500 rounded-t" style={{ height: `${(count / maxGrowth) * 100}%`, minHeight: count > 0 ? 4 : 0 }} />
                  <span className="text-[9px] text-gray-600 mt-1 rotate-0">{week.slice(-2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Revenue & affiliates ────────────────────────────────────────── */}
      <div>
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-2">Revenue & affiliates</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="e-Visa revenue (paid)" value={`$${s.revenue.toFixed(2)}`} sub={`${s.paidCount} paid invoice${s.paidCount === 1 ? '' : 's'}`} href="/admin/invoices" />
          <Stat label="Manual revenue (paid)" value={`${d.manualRevenue.currency} ${d.manualRevenue.paidTotal.toFixed(2)}`} sub={`${d.manualRevenue.paidCount} paid · ${d.manualRevenue.pendingCount} pending`} href="/admin/revenue" />
          <Stat label="Affiliate clicks" value={String(d.affiliates.clicksLifetime)} sub={`${d.affiliates.clicks30d} in last 30d`} href="/admin/affiliate-mgmt" />
          <Stat label="Affiliate conversions" value={d.affiliates.conversions === 0 ? 'no data yet' : String(d.affiliates.conversions)} sub={d.affiliates.conversions === 0 ? 'no postback wired' : `$${d.affiliates.conversionValue.toFixed(2)} · $${d.affiliates.commission.toFixed(2)} comm.`} href="/admin/affiliate-mgmt" />
        </div>
      </div>

      {/* ── e-Visa orders snapshot ──────────────────────────────────────── */}
      <div>
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-2">e-Visa orders</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Total orders" value={String(s.totalOrders)} href="/admin/orders" />
          <Stat label="Customers" value={String(s.customerCount)} href="/admin/customers" />
          <Stat label="In review + processing" value={String((s.byStatus.in_review ?? 0) + (s.byStatus.processing ?? 0))} href="/admin/orders" />
          <Stat label="Top destinations (leads)" value={d.leads.topDestinations[0]?.dest ?? 'no data yet'} sub={d.leads.topDestinations[0] ? `${d.leads.topDestinations[0].count} leads` : undefined} />
        </div>
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
