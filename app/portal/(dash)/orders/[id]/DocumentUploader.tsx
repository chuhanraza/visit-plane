'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { RequiredDoc } from '@/lib/orders/types'

interface ExistingDoc { id: string; doc_type: string; file_name: string; status: string }

const STATUS_DOT: Record<string, string> = {
  pending: 'bg-amber-400', approved: 'bg-green-500', rejected: 'bg-red-500',
}

export default function DocumentUploader({ orderId, requiredDocs, existing }: {
  orderId: string; requiredDocs: RequiredDoc[]; existing: ExistingDoc[]
}) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const inputs = useRef<Record<string, HTMLInputElement | null>>({})

  // Build the slot list from required docs; always allow a generic "other".
  const slots: RequiredDoc[] = requiredDocs.length
    ? [...requiredDocs, { key: 'other', label: 'Other supporting document', required: false }]
    : [{ key: 'other', label: 'Supporting document', required: false }]

  async function upload(docType: string, file: File) {
    setBusy(docType); setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('docType', docType)
      const res = await fetch(`/api/orders/${orderId}/documents`, { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Upload failed')
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-3">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}

      {slots.map(slot => {
        const uploaded = existing.filter(e => e.doc_type === slot.key)
        return (
          <div key={slot.key} className="border border-gray-200 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium text-gray-900">{slot.label}</span>
                {slot.required && <span className="ml-2 text-[10px] uppercase tracking-wide text-red-600">Required</span>}
              </div>
              <button
                type="button"
                onClick={() => inputs.current[slot.key]?.click()}
                disabled={busy === slot.key}
                className="text-sm bg-gray-900 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded-lg px-3 py-1.5">
                {busy === slot.key ? 'Uploading…' : uploaded.length ? 'Add another' : 'Upload'}
              </button>
              <input
                ref={el => { inputs.current[slot.key] = el }}
                type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) upload(slot.key, f); e.target.value = '' }} />
            </div>
            {uploaded.length > 0 && (
              <ul className="mt-2 space-y-1">
                {uploaded.map(d => (
                  <li key={d.id} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className={`w-2 h-2 rounded-full ${STATUS_DOT[d.status] || 'bg-gray-300'}`} />
                    <a href={`/api/documents/${d.id}`} target="_blank" rel="noreferrer" className="hover:underline truncate max-w-[60%]">{d.file_name}</a>
                    <span className="text-gray-400">· {d.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}
