'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Operator-entered earnings-per-click (EPC) per partner. Drives the
 * value-per-visitor ESTIMATE. Honest by construction: blank = not estimated.
 */
export default function EpcEditor({
  partners, initial,
}: {
  partners: { partner: string; name: string }[]
  initial: Record<string, number>
}) {
  const router = useRouter()
  const [epc, setEpc] = useState<Record<string, string>>(
    Object.fromEntries(partners.map(p => [p.partner, initial[p.partner] ? String(initial[p.partner]) : '']))
  )
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function save() {
    setSaving(true); setMsg(null)
    const payload: Record<string, number> = {}
    for (const [k, v] of Object.entries(epc)) { const n = Number(v); if (Number.isFinite(n) && n > 0) payload[k] = n }
    try {
      const res = await fetch('/api/admin/funnel/epc', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ epc: payload }),
      })
      if (!res.ok) { const j = await res.json().catch(() => ({})); setMsg(j.error || 'Save failed') }
      else { setMsg('Saved'); router.refresh() }
    } catch { setMsg('Save failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <h2 className="font-semibold text-white mb-1">Estimated earnings per click (EPC)</h2>
      <p className="text-xs text-gray-500 mb-4">
        Enter your <strong>estimated</strong> $ earned per click for each partner (from your affiliate
        dashboards, e.g. Travelpayouts EPC). Used only for the value-per-visitor <em>estimate</em> —
        never shown as confirmed revenue. Leave blank if unknown.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {partners.map(p => (
          <label key={p.partner} className="flex items-center justify-between gap-2 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2">
            <span className="text-sm text-gray-300 truncate">{p.name}</span>
            <span className="flex items-center gap-1 text-gray-500 text-sm">
              $
              <input
                type="number" min="0" step="0.01" inputMode="decimal"
                value={epc[p.partner] ?? ''}
                onChange={e => setEpc(s => ({ ...s, [p.partner]: e.target.value }))}
                placeholder="0.00"
                className="w-20 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-right text-gray-100"
              />
            </span>
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-4">
        <button onClick={save} disabled={saving}
          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm disabled:opacity-50">
          {saving ? 'Saving…' : 'Save estimates'}
        </button>
        {msg && <span className="text-xs text-gray-400">{msg}</span>}
      </div>
    </div>
  )
}
