import Link from 'next/link'
import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin/guard'
import { getAnalytics, listSavedReports, type Metric } from '@/lib/admin/analytics'
import { SaveViewButton, DeleteReportButton } from './AnalyticsControls'

export const metadata: Metadata = { title: 'Analytics — VisitPlane Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

function isoDaysAgo(n: number) { return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10) }

function delta(m: Metric): { pct: number | null; up: boolean } {
  if (m.previous === 0) return { pct: m.current === 0 ? 0 : null, up: m.current >= 0 }
  const pct = Math.round(((m.current - m.previous) / m.previous) * 100)
  return { pct, up: pct >= 0 }
}

export default async function AdminAnalytics({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireAdmin()
  const sp = await searchParams
  const to = sp.to || isoDaysAgo(0)
  const from = sp.from || isoDaysAgo(29)
  const fromISO = `${from}T00:00:00.000Z`
  const toISO = `${to}T23:59:59.999Z`

  const [a, saved] = await Promise.all([getAnalytics(fromISO, toISO), listSavedReports()])

  const presets = [
    { label: '7d', from: isoDaysAgo(6) }, { label: '30d', from: isoDaysAgo(29) },
    { label: '90d', from: isoDaysAgo(89) }, { label: '12mo', from: isoDaysAgo(364) },
  ]

  const money = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  const maxDailyLeads = Math.max(1, ...a.daily.map(d => d.leads))
  const maxDailyRev = Math.max(1, ...a.daily.map(d => d.revenue))

  const Kpi = ({ label, m, fmt = String }: { label: string; m: Metric; fmt?: (n: number) => string }) => {
    const d = delta(m)
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <div className="text-gray-400 text-xs uppercase tracking-wide">{label}</div>
        <div className="text-2xl font-bold text-white mt-1">{fmt(m.current)}</div>
        <div className="text-xs mt-1">
          {d.pct === null
            ? <span className="text-gray-500">new vs 0</span>
            : <span className={d.up ? 'text-emerald-400' : 'text-red-400'}>{d.up ? '▲' : '▼'} {Math.abs(d.pct)}%</span>}
          <span className="text-gray-600"> vs prev {a.range.days}d ({fmt(m.previous)})</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-white">Analytics <span className="text-gray-500 text-sm font-normal">{a.range.from} → {a.range.to}</span></h1>
        <div className="flex items-center gap-2 flex-wrap">
          {presets.map(p => (
            <Link key={p.label} href={`/admin/analytics?from=${p.from}&to=${isoDaysAgo(0)}`}
              className={`px-2.5 py-1.5 rounded-lg text-sm ${from === p.from ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:text-white'}`}>{p.label}</Link>
          ))}
          <form method="get" className="flex items-center gap-1">
            <input type="date" name="from" defaultValue={from} className="bg-gray-900 border border-gray-800 rounded-lg px-2 py-1.5 text-xs text-gray-200" />
            <input type="date" name="to" defaultValue={to} className="bg-gray-900 border border-gray-800 rounded-lg px-2 py-1.5 text-xs text-gray-200" />
            <button className="px-2.5 py-1.5 bg-gray-800 rounded-lg text-gray-200 text-sm">Go</button>
          </form>
          <SaveViewButton from={from} to={to} />
        </div>
      </div>

      {saved.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-sm">
          <span className="text-gray-500 text-xs uppercase">Saved:</span>
          {saved.map(r => {
            const c = r.config as { from?: string; to?: string }
            return (
              <span key={r.id} className="inline-flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-lg pl-2.5 pr-1.5 py-1">
                <Link href={`/admin/analytics?from=${c.from ?? from}&to=${c.to ?? to}`} className="text-gray-300 hover:text-white">{r.name}</Link>
                <DeleteReportButton id={r.id} />
              </span>
            )
          })}
        </div>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="New leads" m={a.metrics.leads} />
        <Kpi label="Confirmed opt-ins" m={a.metrics.confirmed} />
        <Kpi label="Customers" m={a.metrics.customers} />
        <Kpi label="Unsubscribes" m={a.metrics.unsubscribed} />
        <Kpi label="Affiliate clicks" m={a.metrics.affiliateClicks} />
        <Kpi label="Affiliate conv." m={a.metrics.affiliateConversions} />
        <Kpi label="Manual revenue" m={a.metrics.manualRevenue} fmt={money} />
        <Kpi label="e-Visa revenue" m={a.metrics.evisaRevenue} fmt={money} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Conversion funnel */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-4">Conversion funnel</h2>
          {a.funnel.leads === 0 ? <p className="text-gray-500 text-sm">No leads in this range.</p> : (
            <div className="space-y-3">
              {[
                { label: 'Leads captured', val: a.funnel.leads, pct: 100 },
                { label: 'Opt-in confirmed', val: a.funnel.confirmed, pct: a.funnel.leadToConfirm },
                { label: 'Became customer', val: a.funnel.customers, pct: a.funnel.leadToCustomer },
              ].map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1"><span className="text-gray-300">{s.label}</span><span className="text-gray-400">{s.val} · {s.pct}%</span></div>
                  <div className="h-6 bg-gray-800 rounded overflow-hidden"><div className="h-full bg-blue-600/70" style={{ width: `${Math.max(2, s.pct)}%` }} /></div>
                </div>
              ))}
              <p className="text-xs text-gray-600 pt-1">“Visits” and “wizard starts” aren’t tracked yet — added in the marketing track.</p>
            </div>
          )}
        </div>

        {/* Attribution */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-4">Lead source attribution</h2>
          {a.attribution.length === 0 ? <p className="text-gray-500 text-sm">No leads in this range.</p> : (
            <div className="space-y-2">
              {a.attribution.map(s => (
                <div key={s.source} className="flex items-center gap-3">
                  <span className="w-32 text-xs text-gray-400 truncate">{s.source}</span>
                  <div className="flex-1 h-5 bg-gray-800 rounded overflow-hidden"><div className="h-full bg-emerald-600/70" style={{ width: `${s.pct}%` }} /></div>
                  <span className="w-14 text-right text-xs text-gray-300">{s.count} · {s.pct}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Daily trend */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h2 className="font-semibold text-white mb-4">Daily trend <span className="text-gray-500 text-xs font-normal">leads (blue) · revenue (emerald)</span></h2>
        {a.daily.every(d => d.leads === 0 && d.revenue === 0) ? <p className="text-gray-500 text-sm">No activity in this range.</p> : (
          <div className="flex items-end gap-px h-32 overflow-hidden">
            {a.daily.map(d => (
              <div key={d.date} className="flex-1 min-w-0 flex flex-col justify-end gap-px group relative" title={`${d.date}: ${d.leads} leads, $${d.revenue.toFixed(0)}`}>
                <div className="w-full bg-emerald-600/60" style={{ height: `${(d.revenue / maxDailyRev) * 50}%` }} />
                <div className="w-full bg-blue-600/70" style={{ height: `${(d.leads / maxDailyLeads) * 50}%` }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {a.revenueBySource.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-3">Revenue by source <span className="text-gray-500 text-xs font-normal">(paid manual orders)</span></h2>
          <ul className="divide-y divide-gray-800 text-sm">
            {a.revenueBySource.map(r => (
              <li key={r.source} className="flex justify-between py-2"><span className="text-gray-300">{r.source}</span><span className="text-gray-200">{money(r.amount)}</span></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
