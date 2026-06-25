'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SuppressionControl({ hours }: { hours: number }) {
  const router = useRouter()
  const [val, setVal] = useState(hours)
  const [msg, setMsg] = useState('')
  async function save() {
    const res = await fetch('/api/admin/email/suppression', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hours: val }) })
    setMsg(res.ok ? 'Saved.' : 'Failed'); if (res.ok) router.refresh()
  }
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <span>Smart-send: skip recipients emailed in the last</span>
      <input type="number" min={0} max={720} value={val} onChange={e => setVal(Number(e.target.value))} className="bg-gray-900 border border-gray-800 rounded-lg px-2 py-1 text-gray-200 w-16" />
      <span>hours</span>
      <button onClick={save} className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-200">Save</button>
      {val === 0 && <span className="text-amber-400/80">(0 = off)</span>}
      {msg && <span>{msg}</span>}
    </div>
  )
}
