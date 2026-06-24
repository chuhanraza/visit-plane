'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ALLOWED_TRANSITIONS, STATUS_LABELS, type OrderStatus } from '@/lib/orders/lifecycle'

export default function AdminOrderActions({ orderId, current }: { orderId: string; current: OrderStatus }) {
  const router = useRouter()
  const options = ALLOWED_TRANSITIONS[current] ?? []
  const [to, setTo] = useState<OrderStatus | ''>(options[0] ?? '')
  const [note, setNote] = useState('')
  const [notify, setNotify] = useState(true)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function apply() {
    if (!to) return
    setBusy(true); setMsg('')
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: to, note, notify }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed')
      setNote(''); router.refresh()
    } catch (e) { setMsg((e as Error).message) } finally { setBusy(false) }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <h2 className="font-semibold text-white mb-3">Manage status</h2>
      {options.length === 0 ? (
        <p className="text-sm text-gray-500">This order is in a terminal state ({STATUS_LABELS[current]}). No further transitions.</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Move to</span>
            <select value={to} onChange={e => setTo(e.target.value as OrderStatus)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white flex-1">
              {options.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
            placeholder="Note (optional — included in customer email if notifying)"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500" />
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={notify} onChange={e => setNotify(e.target.checked)} />
            Email the customer about this update
          </label>
          {msg && <div className="text-red-400 text-sm">{msg}</div>}
          <button onClick={apply} disabled={busy}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white text-sm font-medium rounded-lg px-4 py-2">
            {busy ? 'Applying…' : 'Apply change'}
          </button>
        </div>
      )}
    </div>
  )
}
