'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ServiceRecord } from '@/lib/orders/types'

type Draft = {
  country_name: string; country_iso: string; visa_type: string; description: string
  govt_fee: string; service_fee: string; currency: string
  processing_days_min: string; processing_days_max: string
  required_documents: string; active: boolean; is_test: boolean
}

const toDraft = (s?: ServiceRecord): Draft => ({
  country_name: s?.country_name ?? '', country_iso: s?.country_iso ?? '', visa_type: s?.visa_type ?? '',
  description: s?.description ?? '', govt_fee: String(s?.govt_fee ?? '0'), service_fee: String(s?.service_fee ?? '0'),
  currency: s?.currency ?? 'USD', processing_days_min: String(s?.processing_days_min ?? '1'),
  processing_days_max: String(s?.processing_days_max ?? '30'),
  required_documents: (s?.required_documents ?? []).map(d => d.label).join(', '),
  active: s?.active ?? true, is_test: s?.is_test ?? false,
})

function draftToBody(d: Draft) {
  return {
    country_name: d.country_name, country_iso: d.country_iso, visa_type: d.visa_type, description: d.description,
    govt_fee: d.govt_fee, service_fee: d.service_fee, currency: d.currency,
    processing_days_min: d.processing_days_min, processing_days_max: d.processing_days_max,
    required_documents: d.required_documents.split(',').map(s => s.trim()).filter(Boolean).map(label => ({ label, key: label, required: true })),
    active: d.active, is_test: d.is_test,
  }
}

export default function ServicesManager({ initial }: { initial: ServiceRecord[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<string | 'new' | null>(null)
  const [draft, setDraft] = useState<Draft>(toDraft())
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  function startNew() { setDraft(toDraft()); setEditing('new'); setMsg('') }
  function startEdit(s: ServiceRecord) { setDraft(toDraft(s)); setEditing(s.id); setMsg('') }

  async function save() {
    setBusy(true); setMsg('')
    const isNew = editing === 'new'
    const res = await fetch(isNew ? '/api/admin/services' : `/api/admin/services/${editing}`, {
      method: isNew ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draftToBody(draft)),
    })
    const json = await res.json().catch(() => ({}))
    setBusy(false)
    if (res.ok) { setEditing(null); router.refresh() } else setMsg(json.error || 'Save failed')
  }

  async function toggle(s: ServiceRecord) {
    await fetch(`/api/admin/services/${s.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !s.active }) })
    router.refresh()
  }
  async function remove(s: ServiceRecord) {
    if (!confirm(`Delete "${s.country_name} — ${s.visa_type}"? If it's used by orders it will be deactivated instead.`)) return
    const res = await fetch(`/api/admin/services/${s.id}`, { method: 'DELETE' })
    const json = await res.json().catch(() => ({}))
    if (json.note) alert(json.note)
    router.refresh()
  }

  const inp = 'bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 w-full'

  return (
    <div className="space-y-4">
      {editing === null && (
        <button onClick={startNew} className="bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg px-4 py-2">+ New service</button>
      )}

      {editing !== null && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 space-y-3">
          <h2 className="font-semibold text-white">{editing === 'new' ? 'New service' : 'Edit service'}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <input className={inp} placeholder="Country name" value={draft.country_name} onChange={e => setDraft({ ...draft, country_name: e.target.value })} />
            <input className={inp} placeholder="Country ISO (e.g. AE)" value={draft.country_iso} onChange={e => setDraft({ ...draft, country_iso: e.target.value })} />
            <input className={inp} placeholder="Visa type" value={draft.visa_type} onChange={e => setDraft({ ...draft, visa_type: e.target.value })} />
            <input className={inp} placeholder="Currency (USD)" value={draft.currency} onChange={e => setDraft({ ...draft, currency: e.target.value })} />
            <input className={inp} type="number" placeholder="Govt fee" value={draft.govt_fee} onChange={e => setDraft({ ...draft, govt_fee: e.target.value })} />
            <input className={inp} type="number" placeholder="Service fee" value={draft.service_fee} onChange={e => setDraft({ ...draft, service_fee: e.target.value })} />
            <input className={inp} type="number" placeholder="Min days" value={draft.processing_days_min} onChange={e => setDraft({ ...draft, processing_days_min: e.target.value })} />
            <input className={inp} type="number" placeholder="Max days" value={draft.processing_days_max} onChange={e => setDraft({ ...draft, processing_days_max: e.target.value })} />
          </div>
          <textarea className={inp} rows={2} placeholder="Description" value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} />
          <input className={inp} placeholder="Required documents (comma separated, e.g. Passport bio page, Photo)" value={draft.required_documents} onChange={e => setDraft({ ...draft, required_documents: e.target.value })} />
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <label className="flex items-center gap-2"><input type="checkbox" checked={draft.active} onChange={e => setDraft({ ...draft, active: e.target.checked })} /> Active</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={draft.is_test} onChange={e => setDraft({ ...draft, is_test: e.target.checked })} /> Test data</label>
          </div>
          {msg && <div className="text-red-400 text-sm">{msg}</div>}
          <div className="flex gap-2">
            <button onClick={save} disabled={busy} className="bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg px-4 py-2">{busy ? 'Saving…' : 'Save'}</button>
            <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-white text-sm px-3">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase">
            <tr><th className="text-left font-medium px-4 py-3">Service</th><th className="text-right font-medium px-4 py-3">Fees</th><th className="text-left font-medium px-4 py-3 hidden sm:table-cell">State</th><th className="text-right font-medium px-4 py-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {initial.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No services. Create one above.</td></tr>}
            {initial.map(s => (
              <tr key={s.id} className="hover:bg-gray-800/40">
                <td className="px-4 py-3">
                  <div className="text-white">{s.country_name} — {s.visa_type}{s.is_test && <span className="ml-2 text-[10px] uppercase bg-amber-900 text-amber-300 px-1.5 py-0.5 rounded">test</span>}</div>
                  <div className="text-xs text-gray-500">{s.processing_days_min}–{s.processing_days_max} days</div>
                </td>
                <td className="px-4 py-3 text-right text-gray-300">{s.currency} {(Number(s.govt_fee) + Number(s.service_fee)).toFixed(2)}</td>
                <td className="px-4 py-3 hidden sm:table-cell"><span className={`text-[11px] px-2 py-0.5 rounded-full ${s.active ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>{s.active ? 'Active' : 'Inactive'}</span></td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => startEdit(s)} className="text-blue-400 hover:underline text-xs mr-3">Edit</button>
                  <button onClick={() => toggle(s)} className="text-gray-400 hover:text-white text-xs mr-3">{s.active ? 'Deactivate' : 'Activate'}</button>
                  <button onClick={() => remove(s)} className="text-red-400 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
