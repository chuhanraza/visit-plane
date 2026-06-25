'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SaveViewButton({ from, to }: { from: string; to: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  async function save() {
    const name = window.prompt('Name this report view:')
    if (!name) return
    setBusy(true)
    const res = await fetch('/api/admin/analytics/reports', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, kind: 'analytics', config: { from, to } }),
    })
    setBusy(false)
    if (res.ok) router.refresh()
    else alert((await res.json().catch(() => ({}))).error || 'Save failed')
  }
  return (
    <button onClick={save} disabled={busy} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-gray-200 text-sm">
      {busy ? 'Saving…' : '☆ Save view'}
    </button>
  )
}

export function DigestControl({ config }: { config: { enabled: boolean; frequency: 'daily' | 'weekly'; recipient: string } }) {
  const router = useRouter()
  const [enabled, setEnabled] = useState(config.enabled)
  const [frequency, setFrequency] = useState(config.frequency)
  const [recipient, setRecipient] = useState(config.recipient)
  const [msg, setMsg] = useState('')

  async function save() {
    const res = await fetch('/api/admin/digest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled, frequency, recipient }) })
    setMsg(res.ok ? 'Saved.' : 'Save failed'); if (res.ok) router.refresh()
  }
  async function sendNow() {
    if (!recipient) { setMsg('Enter a recipient first'); return }
    setMsg('Sending…')
    const res = await fetch('/api/admin/digest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ op: 'send', recipient }) })
    const j = await res.json().catch(() => ({}))
    setMsg(j.sent ? 'Digest sent.' : `Not sent (${j.reason || 'error'}).`)
  }

  const inp = 'bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-sm text-gray-200'
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-wrap items-center gap-2 text-sm">
      <span className="font-semibold text-white">Email digest</span>
      <label className="flex items-center gap-1 text-gray-400"><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} /> enabled</label>
      <select value={frequency} onChange={e => setFrequency(e.target.value as 'daily' | 'weekly')} className={inp}><option value="daily">daily</option><option value="weekly">weekly</option></select>
      <input value={recipient} onChange={e => setRecipient(e.target.value)} type="email" placeholder="you@email.com" className={`${inp} w-52`} />
      <button onClick={save} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white">Save</button>
      <button onClick={sendNow} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-200">Send now</button>
      {msg && <span className="text-gray-400">{msg}</span>}
    </div>
  )
}

export function DeleteReportButton({ id }: { id: string }) {
  const router = useRouter()
  async function del() {
    if (!confirm('Delete this saved report?')) return
    const res = await fetch('/api/admin/analytics/reports', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ op: 'delete', id }),
    })
    if (res.ok) router.refresh()
    else alert('Delete failed')
  }
  return <button onClick={del} className="text-gray-600 hover:text-red-400 text-xs">✕</button>
}
