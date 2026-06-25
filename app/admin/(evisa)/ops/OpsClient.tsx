'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ALERT_METRICS, ALERT_OPS, type AlertRule, type AlertMetric } from '@/lib/admin/ops'

const inp = 'bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-sm text-gray-200'

export default function OpsClient({ rules, metrics }: { rules: AlertRule[]; metrics: Record<AlertMetric, number> }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function act(payload: Record<string, unknown>) {
    setBusy(true)
    const res = await fetch('/api/admin/alerts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const j = await res.json().catch(() => ({}))
    setBusy(false)
    if (res.ok) { if (payload.op === 'evaluate') alert(`Evaluated ${j.evaluated} rule(s); ${j.triggered.length} triggered.`); router.refresh() }
    else alert(j.error || 'Failed')
  }

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    await act({ name: f.get('name'), metric: f.get('metric'), op: f.get('op'), threshold: f.get('threshold') })
    ;(e.target as HTMLFormElement).reset()
  }

  const opLabel = (k: string) => ALERT_OPS.find(o => o.key === k)?.label ?? k
  const metricLabel = (k: string) => ALERT_METRICS.find(m => m.key === k)?.label ?? k

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white">Alert rules <span className="text-gray-500 text-sm font-normal">({rules.length})</span></h2>
        <button onClick={() => act({ op: 'evaluate' })} disabled={busy} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-200 text-sm">Evaluate now</button>
      </div>

      <form onSubmit={create} className="flex flex-wrap items-center gap-2 bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <input name="name" required placeholder="Alert name" className={`${inp} w-44`} />
        <select name="metric" className={inp}>{ALERT_METRICS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}</select>
        <select name="op" className={inp}>{ALERT_OPS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}</select>
        <input name="threshold" type="number" step="1" min="0" defaultValue="0" className={`${inp} w-24`} />
        <button disabled={busy} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm">Add rule</button>
      </form>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl divide-y divide-gray-800">
        {rules.length === 0 && <p className="px-4 py-8 text-center text-gray-500 text-sm">No alert rules. Add one above (e.g. “Failed webhooks &gt; 0”).</p>}
        {rules.map(r => {
          const value = metrics[r.metric] ?? 0
          return (
            <div key={r.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-white text-sm">{r.name} <span className="text-gray-500">· {metricLabel(r.metric)} {opLabel(r.op)} {Number(r.threshold)}</span></div>
                <div className="text-xs text-gray-600">current: {value}{r.last_triggered_at ? ` · last fired ${new Date(r.last_triggered_at).toLocaleString()}` : ''}</div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => act({ op: 'toggle', id: r.id, active: !r.active })} className={`text-xs px-2 py-0.5 rounded-full ${r.active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-gray-700 text-gray-400'}`}>{r.active ? 'active' : 'off'}</button>
                <button onClick={() => act({ op: 'delete', id: r.id })} className="text-gray-600 hover:text-red-400 text-xs">delete</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
