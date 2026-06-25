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
