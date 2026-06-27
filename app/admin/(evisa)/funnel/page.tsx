import Link from 'next/link'
import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin/guard'
import { getFunnel, type Bucket } from '@/lib/admin/funnel'
import { AFFILIATE_PARTNERS } from '@/src/lib/affiliates'
import EpcEditor from './EpcEditor'

export const metadata: Metadata = { title: 'Revenue & Funnel — VisitPlane Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

function isoDaysAgo(n: number) { return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10) }

export default async function AdminFunnel({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireAdmin()
  const sp = await searchParams
  const to = sp.to || isoDaysAgo(0)
  const from = sp.from || isoDaysAgo(29)
  const f = await getFunnel(`${from}T00:00:00.000Z`, `${to}T23:59:59.999Z`)

  const presets = [
    { label: '7d', from: isoDaysAgo(6) }, { label: '30d', from: isoDaysAgo(29) },
    { label: '90d', from: isoDaysAgo(89) }, { label: '12mo', from: isoDaysAgo(364) },
  ]
  const money = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const partnerList = Object.values(AFFILIATE_PARTNERS).map(p => ({ partner: p.id, name: p.name }))

  // Funnel stages (visitors only show when page-view tracking has data).
  const stages = [
    ...(f.pageViewTracked ? [{ label: 'Visitors', sub: 'distinct sessions on money pages', val: f.visitors }] : []),
    { label: 'Email captures', sub: 'leads captured in range', val: f.leads },
    { label: 'Affiliate clicks', sub: 'tracked /go clicks', val: f.affiliateClicks },
  ]
  const top = Math.max(1, stages[0]?.val ?? 1)

  const BucketTable = ({ title, rows, kind }: { title: string; rows: Bucket[]; kind?: 'placement' | 'country' | 'page' }) => {
    const maxC = Math.max(1, ...rows.map(r => r.clicks))
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h2 className="font-semibold text-white mb-3">{title}</h2>
        {rows.length === 0 ? <p className="text-gray-500 text-sm">No data yet.</p> : (
          <div className="space-y-1.5">
            {rows.map(r => (
              <div key={r.key} className="flex items-center gap-3">
                <span className={`text-xs text-gray-300 truncate ${kind === 'page' ? 'w-56' : 'w-32'}`} title={r.key}>{r.key}</span>
                <div className="flex-1 h-4 bg-gray-800 rounded overflow-hidden"><div className="h-full bg-blue-600/60" style={{ width: `${Math.max(3, (r.clicks / maxC) * 100)}%` }} /></div>
                <span className="w-10 text-right text-xs text-gray-400">{r.clicks}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-white">Revenue &amp; Funnel <span className="text-gray-500 text-sm font-normal">{f.range.from} → {f.range.to}</span></h1>
        <div className="flex items-center gap-2 flex-wrap">
          {presets.map(p => (
            <Link key={p.label} href={`/admin/funnel?from=${p.from}&to=${isoDaysAgo(0)}`}
              className={`px-2.5 py-1.5 rounded-lg text-sm ${from === p.from ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:text-white'}`}>{p.label}</Link>
          ))}
          <form method="get" className="flex items-center gap-1">
            <input type="date" name="from" defaultValue={from} className="bg-gray-900 border border-gray-800 rounded-lg px-2 py-1.5 text-xs text-gray-200" />
            <input type="date" name="to" defaultValue={to} className="bg-gray-900 border border-gray-800 rounded-lg px-2 py-1.5 text-xs text-gray-200" />
            <button className="px-2.5 py-1.5 bg-gray-800 rounded-lg text-gray-200 text-sm">Go</button>
          </form>
          <Link href="/admin/analytics" className="px-2.5 py-1.5 bg-gray-800 rounded-lg text-gray-300 hover:text-white text-sm">Full analytics →</Link>
        </div>
      </div>

      {/* Funnel */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-4">Funnel <span className="text-gray-500 text-xs font-normal">visitors → captures → affiliate clicks</span></h2>
          {!f.pageViewTracked && (
            <p className="text-xs text-amber-400/80 mb-3">Visitor (page-view) tracking is live — the Visitors stage appears once money-page views are recorded in this range.</p>
          )}
          <div className="space-y-3">
            {stages.map((s, i) => {
              const p = Math.round((s.val / top) * 100)
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{s.label} <span className="text-gray-600 text-xs">· {s.sub}</span></span>
                    <span className="text-gray-400">{s.val.toLocaleString()} · {p}%</span>
                  </div>
                  <div className="h-6 bg-gray-800 rounded overflow-hidden"><div className="h-full bg-emerald-600/60" style={{ width: `${Math.max(2, p)}%` }} /></div>
                </div>
              )
            })}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5 text-center">
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-3">
              <div className="text-gray-500 text-[11px] uppercase tracking-wide">Visitor → lead</div>
              <div className="text-lg font-bold text-white">{f.rates.visitorToLead == null ? '—' : `${f.rates.visitorToLead}%`}</div>
            </div>
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-3">
              <div className="text-gray-500 text-[11px] uppercase tracking-wide">Lead → click</div>
              <div className="text-lg font-bold text-white">{f.rates.leadToClick == null ? '—' : `${f.rates.leadToClick}%`}</div>
            </div>
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-3">
              <div className="text-gray-500 text-[11px] uppercase tracking-wide">Visitor → click</div>
              <div className="text-lg font-bold text-white">{f.rates.visitorToClick == null ? '—' : `${f.rates.visitorToClick}%`}</div>
            </div>
          </div>
        </div>

        {/* Value-per-visitor estimate */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col">
          <h2 className="font-semibold text-white mb-1">Value per visitor <span className="text-amber-400/80 text-xs font-normal">(estimate)</span></h2>
          {f.hasEpc && f.valuePerVisitor != null ? (
            <>
              <div className="text-3xl font-bold text-emerald-400 mt-2">{money(f.valuePerVisitor)}</div>
              <div className="text-xs text-gray-500 mt-1">est. {money(f.estimatedRevenue)} affiliate value ÷ {f.visitors.toLocaleString()} visitors</div>
            </>
          ) : (
            <p className="text-sm text-gray-400 mt-2">
              {f.hasEpc ? 'No visitor data in range yet.' : 'Enter estimated earnings-per-click below to compute this. Until then, affiliate clicks are the proxy for value.'}
            </p>
          )}
          <p className="text-[11px] text-gray-600 mt-auto pt-4">
            Estimate only — derived from operator-entered EPC, not confirmed affiliate payouts.
            Confirm actual conversions in each partner dashboard.
          </p>
        </div>
      </div>

      {/* Email list growth */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5"><div className="text-gray-400 text-xs uppercase tracking-wide">Captures (range)</div><div className="text-2xl font-bold text-white mt-1">{f.leads.toLocaleString()}</div></div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5"><div className="text-gray-400 text-xs uppercase tracking-wide">Confirmed (range)</div><div className="text-2xl font-bold text-white mt-1">{f.confirmed.toLocaleString()}</div></div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5"><div className="text-gray-400 text-xs uppercase tracking-wide">List total (all-time)</div><div className="text-2xl font-bold text-white mt-1">{f.list.total.toLocaleString()}</div><div className="text-xs text-gray-500 mt-0.5">{f.list.confirmed} confirmed · {f.list.unsubscribed} unsub</div></div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5"><div className="text-gray-400 text-xs uppercase tracking-wide">Affiliate clicks (range)</div><div className="text-2xl font-bold text-white mt-1">{f.affiliateClicks.toLocaleString()}</div></div>
      </div>

      {/* Affiliate performance */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h2 className="font-semibold text-white mb-3">Affiliate performance by partner</h2>
        {f.byPartner.length === 0 ? <p className="text-gray-500 text-sm">No affiliate clicks in this range.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[420px]">
              <thead className="text-gray-400 text-xs uppercase"><tr><th className="text-left font-medium py-2">Partner</th><th className="text-right font-medium py-2">Clicks</th><th className="text-right font-medium py-2">EPC</th><th className="text-right font-medium py-2">Est. value</th></tr></thead>
              <tbody className="divide-y divide-gray-800">
                {f.byPartner.map(p => (
                  <tr key={p.partner}>
                    <td className="py-2 text-gray-300">{p.name}</td>
                    <td className="py-2 text-right text-gray-200">{p.clicks.toLocaleString()}</td>
                    <td className="py-2 text-right text-gray-500">{p.epc ? money(p.epc) : '—'}</td>
                    <td className="py-2 text-right text-emerald-300">{p.epc ? money(p.estValue) : '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr className="border-t border-gray-700"><td className="py-2 text-gray-400">Total</td><td className="py-2 text-right text-gray-200">{f.affiliateClicks.toLocaleString()}</td><td /><td className="py-2 text-right text-emerald-300">{f.hasEpc ? money(f.estimatedRevenue) : '—'}</td></tr></tfoot>
            </table>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <BucketTable title="Clicks by placement" rows={f.byPlacement} kind="placement" />
        <div className="lg:col-span-1"><BucketTable title="Clicks by country" rows={f.byCountry} kind="country" /></div>
        <BucketTable title="Top source pages" rows={f.bySourcePage} kind="page" />
      </div>

      <EpcEditor partners={partnerList} initial={f.epc} />
    </div>
  )
}
