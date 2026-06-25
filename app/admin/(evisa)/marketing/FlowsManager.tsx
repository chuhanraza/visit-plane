'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Step { delay_minutes: number; subject: string; body: string }
interface Flow { id: string; name: string; active: boolean; steps: { delay_minutes: number; subject: string; body: string }[]; stats: { active: number; completed: number } }

const inp = 'bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-sm text-gray-200'

export default function FlowsManager({ flows, broadcastsEnabled }: { flows: Flow[]; broadcastsEnabled: boolean }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [steps, setSteps] = useState<Step[]>([{ delay_minutes: 0, subject: '', body: '' }])
  const [busy, setBusy] = useState(false)
  const [adding, setAdding] = useState(false)

  function setStep(i: number, patch: Partial<Step>) { setSteps(s => s.map((x, j) => (j === i ? { ...x, ...patch } : x))) }

  async function create() {
    if (!name.trim() || steps.some(s => !s.subject.trim() || !s.body.trim())) { alert('Name + every step needs a subject and body'); return }
    setBusy(true)
    const res = await fetch('/api/admin/flows', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, steps }) })
    setBusy(false)
    if (res.ok) { setName(''); setSteps([{ delay_minutes: 0, subject: '', body: '' }]); setAdding(false); router.refresh() }
    else alert((await res.json().catch(() => ({}))).error || 'Failed')
  }

  async function act(op: string, extra: Record<string, unknown> = {}) {
    const res = await fetch('/api/admin/flows', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ op, ...extra }) })
    const j = await res.json().catch(() => ({}))
    if (res.ok) { if (op === 'run') alert(j.enabled ? `Worker ran — enrolled ${j.enrolled}, sent ${j.sent}, completed ${j.completed}` : 'Broadcasts are OFF — enable email_broadcasts_enabled in Settings to send.'); router.refresh() }
    else alert(j.error || 'Failed')
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white">Automated flows <span className="text-gray-500 text-sm font-normal">({flows.length})</span></h2>
        <div className="flex gap-2">
          <button onClick={() => act('run')} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-200 text-sm">Run worker now</button>
          <button onClick={() => setAdding(v => !v)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white text-sm">{adding ? 'Close' : '+ New flow'}</button>
        </div>
      </div>

      {!broadcastsEnabled && <p className="text-xs text-amber-300/80">Flows only send when <code>email_broadcasts_enabled</code> is ON (Settings). Until then, enrollment/sends are held.</p>}

      {adding && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Flow name (e.g. Welcome series)" className={`${inp} w-64`} />
          <p className="text-xs text-gray-500">Trigger: a lead confirms double opt-in → these emails send in order, each after its delay.</p>
          {steps.map((s, i) => (
            <div key={i} className="border border-gray-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Step {i + 1} · send after</span>
                <input type="number" min={0} value={s.delay_minutes} onChange={e => setStep(i, { delay_minutes: Number(e.target.value) })} className={`${inp} w-24`} />
                <span>minutes</span>
                {steps.length > 1 && <button onClick={() => setSteps(st => st.filter((_, j) => j !== i))} className="ml-auto text-gray-600 hover:text-red-400">remove</button>}
              </div>
              <input value={s.subject} onChange={e => setStep(i, { subject: e.target.value })} placeholder="Subject" className={`${inp} w-full`} />
              <textarea value={s.body} onChange={e => setStep(i, { body: e.target.value })} placeholder="<p>Body HTML…</p>" rows={3} className={`${inp} w-full font-mono`} />
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={() => setSteps(s => [...s, { delay_minutes: 1440, subject: '', body: '' }])} className="text-blue-400 hover:text-blue-300 text-sm">+ add step</button>
            <button onClick={create} disabled={busy} className="ml-auto px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg text-white text-sm">Create flow (inactive)</button>
          </div>
        </div>
      )}

      {flows.length === 0 ? (
        <p className="text-gray-500 text-sm">No flows yet.</p>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl divide-y divide-gray-800">
          {flows.map(f => (
            <div key={f.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-white text-sm">{f.name} <span className="text-gray-500">· {f.steps.length} step{f.steps.length === 1 ? '' : 's'} · {f.stats.active} active / {f.stats.completed} done</span></div>
                <div className="text-xs text-gray-600">on lead confirm → {f.steps.map(s => `+${s.delay_minutes}m: ${s.subject || '(no subject)'}`).join(' → ')}</div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => act('toggle', { id: f.id, active: !f.active })} className={`text-xs px-2 py-0.5 rounded-full ${f.active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-gray-700 text-gray-400'}`}>{f.active ? 'active' : 'inactive'}</button>
                <button onClick={() => act('delete', { id: f.id })} className="text-gray-600 hover:text-red-400 text-xs">delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
