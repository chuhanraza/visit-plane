'use client'

import { useState } from 'react'

export default function PayButton({ orderId }: { orderId: string }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function pay() {
    setBusy(true); setMsg('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not start payment')
      if (json.mode === 'stripe' && json.url) { window.location.href = json.url; return }
      setMsg(json.message || 'We will confirm your payment manually.')
    } catch (e) {
      setMsg((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="text-right">
      <button onClick={pay} disabled={busy}
        className="bg-green-600 hover:bg-green-500 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg px-4 py-2">
        {busy ? 'Please wait…' : 'Pay now'}
      </button>
      {msg && <p className="text-xs text-gray-500 mt-2 max-w-xs ml-auto">{msg}</p>}
    </div>
  )
}
