'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { promoStatus, type PromoRow } from '@/lib/admin/promos'

const inp = 'bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-sm text-gray-200'
const BADGE: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-300', scheduled: 'bg-blue-500/15 text-blue-300',
  expired: 'bg-gray-600/30 text-gray-400', exhausted: 'bg-amber-500/15 text-amber-300', inactive: 'bg-gray-700 text-gray-400',
}

export default function PromosClient({ promos }: { promos: PromoRow[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [adding, setAdding] = useState(false)

  async function act(payload: Record<string, unknown>) {
    setBusy(true)
    const res = await fetch('/api/admin/promos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setBusy(false)
    if (res.ok) { setAdding(false); router.refresh() }
    else alert((await res.json().catch(() => ({}))).error || 'Failed')
  }

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    await act({
      code: f.get('code'), description: f.get('description') || null,
      discount_type: f.get('discount_type'), discount_value: f.get('discount_value'),
      currency: f.get('currency') || 'USD',
      max_redemptions: f.get('max_redemptions') || null,
      valid_from: f.get('valid_from') ? new Date(f.get('valid_from') as string).toISOString() : '',
      valid_until: f.get('valid_until') ? new Date(f.get('valid_until') as string).toISOString() : '',
      active: true,
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white">Discount codes <span className="text-gray-500 text-sm font-normal">({promos.length})</span></h2>
        <button onClick={() => setAdding(v => !v)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white text-sm">{adding ? 'Close' : '+ New code'}</button>
      </div>

      {adding && (
        <form onSubmit={create} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-2 items-end">
          <label className="text-xs text-gray-400 space-y-1"><span>Code *</span><input name="code" required placeholder="LAUNCH20" className={`${inp} w-full uppercase`} /></label>
          <label className="text-xs text-gray-400 space-y-1"><span>Type</span><select name="discount_type" className={`${inp} w-full`}><option value="percent">percent</option><option value="fixed">fixed</option></select></label>
          <label className="text-xs text-gray-400 space-y-1"><span>Value *</span><input name="discount_value" type="number" step="0.01" min="0" required className={`${inp} w-full`} /></label>
          <label className="text-xs text-gray-400 space-y-1"><span>Currency</span><input name="currency" defaultValue="USD" maxLength={3} className={`${inp} w-full`} /></label>
          <label className="text-xs text-gray-400 space-y-1"><span>Max redemptions</span><input name="max_redemptions" type="number" min="1" placeholder="∞" className={`${inp} w-full`} /></label>
          <label className="text-xs text-gray-400 space-y-1"><span>Valid from</span><input name="valid_from" type="datetime-local" className={`${inp} w-full`} /></label>
          <label className="text-xs text-gray-400 space-y-1"><span>Valid until</span><input name="valid_until" type="datetime-local" className={`${inp} w-full`} /></label>
          <label className="text-xs text-gray-400 space-y-1 sm:col-span-2"><span>Description</span><input name="description" className={`${inp} w-full`} /></label>
          <div className="sm:col-span-2 lg:col-span-4"><button disabled={busy} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg text-white text-sm">Create code</button></div>
        </form>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase">
            <tr><th className="text-left font-medium px-4 py-3">Code</th><th className="text-left font-medium px-4 py-3">Discount</th><th className="text-left font-medium px-4 py-3">Used</th><th className="text-left font-medium px-4 py-3">Window</th><th className="text-left font-medium px-4 py-3">Status</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {promos.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No codes yet.</td></tr>}
            {promos.map(p => {
              const st = promoStatus(p)
              return (
                <tr key={p.id}>
                  <td className="px-4 py-2.5 text-white font-mono">{p.code}{p.description && <div className="text-[11px] text-gray-600 font-sans">{p.description}</div>}</td>
                  <td className="px-4 py-2.5 text-gray-300">{p.discount_type === 'percent' ? `${p.discount_value}%` : `${p.currency} ${Number(p.discount_value).toFixed(2)}`}</td>
                  <td className="px-4 py-2.5 text-gray-400">{p.times_redeemed}{p.max_redemptions != null ? ` / ${p.max_redemptions}` : ''}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-xs">{p.valid_from ? new Date(p.valid_from).toLocaleDateString() : '—'} → {p.valid_until ? new Date(p.valid_until).toLocaleDateString() : '∞'}</td>
                  <td className="px-4 py-2.5"><span className={`text-[11px] px-2 py-0.5 rounded-full ${BADGE[st]}`}>{st}</span></td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <button onClick={() => act({ op: 'toggle', id: p.id, active: !p.active })} className="text-blue-400 hover:text-blue-300 text-xs mr-3">{p.active ? 'disable' : 'enable'}</button>
                    <button onClick={() => { if (confirm(`Delete code ${p.code}?`)) act({ op: 'delete', id: p.id }) }} className="text-gray-600 hover:text-red-400 text-xs">delete</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
