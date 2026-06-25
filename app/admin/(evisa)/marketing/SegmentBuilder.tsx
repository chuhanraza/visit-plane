'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CONDITION_TYPES, type Condition, type ConditionType } from '@/lib/admin/segments'

const inp = 'bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-sm text-gray-200'

export default function SegmentBuilder({ sources, metrics }: { sources: string[]; metrics: string[] }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [match, setMatch] = useState<'all' | 'any'>('all')
  const [conditions, setConditions] = useState<Condition[]>([{ type: 'source', value: sources[0] ?? '', days: 30 }])
  const [preview, setPreview] = useState<{ count: number; sample: string[] } | null>(null)
  const [busy, setBusy] = useState(false)

  function setCond(i: number, patch: Partial<Condition>) {
    setConditions(cs => cs.map((c, j) => (j === i ? { ...c, ...patch } : c)))
  }
  const needsDays = (t: ConditionType) => CONDITION_TYPES.find(x => x.type === t)?.needsDays

  function valueField(c: Condition, i: number) {
    if (c.type === 'status') return <select value={c.value} onChange={e => setCond(i, { value: e.target.value })} className={inp}><option value="confirmed">confirmed</option><option value="pending">pending</option><option value="unsubscribed">unsubscribed</option></select>
    if (c.type === 'source') return <select value={c.value} onChange={e => setCond(i, { value: e.target.value })} className={inp}>{sources.map(s => <option key={s} value={s}>{s}</option>)}</select>
    if (c.type === 'did_metric') return <select value={c.value} onChange={e => setCond(i, { value: e.target.value })} className={inp}>{metrics.length === 0 ? <option value="">(no metrics yet)</option> : metrics.map(m => <option key={m} value={m}>{m}</option>)}</select>
    return <input value={c.value} onChange={e => setCond(i, { value: e.target.value })} placeholder="value" className={inp} />
  }

  async function doPreview() {
    setBusy(true); setPreview(null)
    const res = await fetch('/api/admin/segments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ op: 'preview', definition: { match, conditions } }) })
    const j = await res.json(); setBusy(false)
    if (res.ok) setPreview({ count: j.count, sample: j.sample }); else alert(j.error || 'Preview failed')
  }

  async function save() {
    if (!name.trim()) { alert('Name the segment'); return }
    setBusy(true)
    const res = await fetch('/api/admin/segments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, definition: { match, conditions } }) })
    setBusy(false)
    if (res.ok) { setName(''); setPreview(null); router.refresh() } else alert((await res.json().catch(() => ({}))).error || 'Save failed')
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
      <h2 className="font-semibold text-white">New segment</h2>
      <div className="flex items-center gap-2 text-sm">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Segment name" className={`${inp} w-56`} />
        <span className="text-gray-500">match</span>
        <select value={match} onChange={e => setMatch(e.target.value as 'all' | 'any')} className={inp}><option value="all">all (AND)</option><option value="any">any (OR)</option></select>
      </div>

      <div className="space-y-2">
        {conditions.map((c, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <select value={c.type} onChange={e => setCond(i, { type: e.target.value as ConditionType, value: '' })} className={inp}>
              {CONDITION_TYPES.map(t => <option key={t.type} value={t.type}>{t.label}</option>)}
            </select>
            {valueField(c, i)}
            {needsDays(c.type) && <input type="number" min={1} value={c.days ?? 30} onChange={e => setCond(i, { days: Number(e.target.value) })} className={`${inp} w-20`} title="days" />}
            <button onClick={() => setConditions(cs => cs.filter((_, j) => j !== i))} className="text-gray-600 hover:text-red-400 text-sm">✕</button>
          </div>
        ))}
        <button onClick={() => setConditions(cs => [...cs, { type: 'source', value: sources[0] ?? '', days: 30 }])} className="text-blue-400 hover:text-blue-300 text-sm">+ add condition</button>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
        <button onClick={doPreview} disabled={busy} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-gray-200 text-sm">Preview</button>
        <button onClick={save} disabled={busy} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg text-white text-sm">Save segment</button>
        {preview && <span className="text-sm text-gray-300">{preview.count} match{preview.count === 1 ? '' : 'es'}{preview.sample.length ? ` · ${preview.sample.slice(0, 3).join(', ')}…` : ''}</span>}
      </div>
    </div>
  )
}

export function DeleteSegmentButton({ id }: { id: string }) {
  const router = useRouter()
  async function del() {
    if (!confirm('Delete this segment?')) return
    const res = await fetch('/api/admin/segments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ op: 'delete', id }) })
    if (res.ok) router.refresh()
  }
  return <button onClick={del} className="text-gray-600 hover:text-red-400 text-xs">delete</button>
}
