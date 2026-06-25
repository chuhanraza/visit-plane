'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { EmailTemplate } from '@/lib/admin/templates'

const inp = 'w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200'
type Draft = { id?: string; key: string; name: string; kind: 'transactional' | 'marketing'; subject: string; body_html: string }
const BLANK: Draft = { key: '', name: '', kind: 'marketing', subject: '', body_html: '<p>Hi,</p>' }

export default function TemplateEditor({ templates }: { templates: EmailTemplate[] }) {
  const router = useRouter()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [busy, setBusy] = useState(false)

  function edit(t: EmailTemplate) { setDraft({ id: t.id, key: t.key, name: t.name, kind: t.kind, subject: t.subject, body_html: t.body_html }) }

  async function save() {
    if (!draft) return
    setBusy(true)
    const res = await fetch('/api/admin/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) })
    setBusy(false)
    if (res.ok) { setDraft(null); router.refresh() } else alert((await res.json().catch(() => ({}))).error || 'Save failed')
  }
  async function del(id: string) {
    if (!confirm('Delete this template?')) return
    const res = await fetch('/api/admin/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ op: 'delete', id }) })
    if (res.ok) { setDraft(null); router.refresh() }
  }

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-5">
      {/* List */}
      <div className="space-y-2">
        <button onClick={() => setDraft({ ...BLANK })} className="w-full px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white text-sm">+ New template</button>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl divide-y divide-gray-800">
          {templates.length === 0 && <p className="px-4 py-6 text-center text-gray-500 text-sm">No templates.</p>}
          {templates.map(t => (
            <button key={t.id} onClick={() => edit(t)} className={`w-full text-left px-4 py-2.5 hover:bg-gray-800/50 ${draft?.id === t.id ? 'bg-gray-800/60' : ''}`}>
              <div className="text-white text-sm">{t.name}</div>
              <div className="text-[11px] text-gray-600">{t.key} · {t.kind}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      {draft ? (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-3 gap-2">
            <label className="text-xs text-gray-400 space-y-1"><span>Key</span><input value={draft.key} onChange={e => setDraft({ ...draft, key: e.target.value })} readOnly={!!draft.id} className={inp} /></label>
            <label className="text-xs text-gray-400 space-y-1"><span>Name</span><input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className={inp} /></label>
            <label className="text-xs text-gray-400 space-y-1"><span>Kind</span><select value={draft.kind} onChange={e => setDraft({ ...draft, kind: e.target.value as Draft['kind'] })} className={inp}><option value="marketing">marketing</option><option value="transactional">transactional</option></select></label>
          </div>
          <label className="block text-xs text-gray-400 space-y-1"><span>Subject</span><input value={draft.subject} onChange={e => setDraft({ ...draft, subject: e.target.value })} className={inp} /></label>
          <label className="block text-xs text-gray-400 space-y-1"><span>Body (HTML)</span><textarea value={draft.body_html} onChange={e => setDraft({ ...draft, body_html: e.target.value })} rows={10} className={`${inp} font-mono`} /></label>
          <div>
            <div className="text-xs text-gray-500 mb-1">Preview</div>
            <div className="bg-white text-black rounded-lg p-4 text-sm max-h-72 overflow-y-auto" dangerouslySetInnerHTML={{ __html: draft.body_html }} />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={save} disabled={busy} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-white text-sm">{busy ? 'Saving…' : 'Save template'}</button>
            <button onClick={() => setDraft(null)} className="px-4 py-2 bg-gray-800 rounded-lg text-gray-300 text-sm">Cancel</button>
            {draft.id && <button onClick={() => del(draft.id!)} className="ml-auto text-red-400 hover:text-red-300 text-sm">Delete</button>}
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center text-gray-500 text-sm">Select a template to edit, or create a new one.</div>
      )}
    </div>
  )
}
