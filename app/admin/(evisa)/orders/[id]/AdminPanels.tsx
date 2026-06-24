'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AdminNotes({ orderId, initial }: { orderId: string; initial: string }) {
  const router = useRouter()
  const [notes, setNotes] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setBusy(true); setSaved(false)
    const res = await fetch(`/api/admin/orders/${orderId}/notes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes }),
    })
    setBusy(false)
    if (res.ok) { setSaved(true); router.refresh() }
  }
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <h2 className="font-semibold text-white mb-3">Internal notes <span className="text-gray-500 text-xs font-normal">(staff only)</span></h2>
      <textarea value={notes} onChange={e => { setNotes(e.target.value); setSaved(false) }} rows={4}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500" placeholder="Notes visible to admins only…" />
      <div className="flex items-center gap-3 mt-2">
        <button onClick={save} disabled={busy} className="bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg px-4 py-1.5">{busy ? 'Saving…' : 'Save notes'}</button>
        {saved && <span className="text-green-400 text-xs">Saved</span>}
      </div>
    </div>
  )
}

interface Doc { id: string; doc_type: string; file_name: string; status: string }
export function AdminDocReview({ docs }: { docs: Doc[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)

  async function review(docId: string, status: string) {
    setBusy(docId)
    const res = await fetch(`/api/admin/documents/${docId}/review`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    })
    setBusy(null)
    if (res.ok) router.refresh()
  }

  if (docs.length === 0) return <p className="text-sm text-gray-500">No documents uploaded yet.</p>
  return (
    <ul className="space-y-2">
      {docs.map(d => (
        <li key={d.id} className="flex items-center justify-between gap-3 bg-gray-800/50 rounded-lg px-3 py-2">
          <div className="min-w-0">
            <a href={`/api/documents/${d.id}`} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline truncate block">{d.file_name}</a>
            <span className="text-xs text-gray-500">{d.doc_type} · {d.status}</span>
          </div>
          <div className="flex gap-1 shrink-0">
            <button onClick={() => review(d.id, 'approved')} disabled={busy === d.id}
              className={`text-xs px-2 py-1 rounded ${d.status === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-green-700'}`}>Approve</button>
            <button onClick={() => review(d.id, 'rejected')} disabled={busy === d.id}
              className={`text-xs px-2 py-1 rounded ${d.status === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-red-700'}`}>Reject</button>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function AdminInvoiceActions({ invoiceId, status }: { invoiceId: string; status: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function act(action: string) {
    setBusy(true); setMsg('')
    const res = await fetch(`/api/admin/invoices/${invoiceId}/pay`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }),
    })
    const json = await res.json().catch(() => ({}))
    setBusy(false)
    if (res.ok) { if (json.note) setMsg(json.note); router.refresh() } else setMsg(json.error || 'Failed')
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status !== 'paid' && <button onClick={() => act('paid')} disabled={busy} className="bg-green-600 hover:bg-green-500 text-white text-xs rounded-lg px-3 py-1.5">Mark paid (manual)</button>}
      {status === 'paid' && <button onClick={() => act('unpaid')} disabled={busy} className="bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg px-3 py-1.5">Mark unpaid</button>}
      {status !== 'refunded' && <button onClick={() => act('refund')} disabled={busy} className="bg-orange-700 hover:bg-orange-600 text-white text-xs rounded-lg px-3 py-1.5">Mark refunded</button>}
      {msg && <span className="text-xs text-gray-400">{msg}</span>}
    </div>
  )
}
