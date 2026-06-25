'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { LeadRow, OptInStatus } from '@/lib/admin/leads'

interface TimelineItem { ts: string; kind: string; title: string; stored: boolean }

function statusOf(r: LeadRow): OptInStatus {
  if (r.unsubscribed_at) return 'unsubscribed'
  if (r.confirmed_at) return 'confirmed'
  return 'pending'
}

const STATUS_BADGE: Record<OptInStatus, string> = {
  confirmed: 'bg-emerald-500/15 text-emerald-300',
  pending: 'bg-amber-500/15 text-amber-300',
  unsubscribed: 'bg-gray-600/30 text-gray-400',
}

function fmt(ts: string | null) {
  return ts ? new Date(ts).toLocaleString() : '—'
}

export default function LeadsTable({
  rows, sources, filters, total, page, pageSize, savedViews,
}: {
  rows: LeadRow[]
  sources: { source: string; count: number }[]
  filters: { q: string; source: string; status: string }
  total: number
  page: number
  pageSize: number
  savedViews: { id: string; name: string; config: { q?: string; source?: string; status?: string } }[]
}) {
  const router = useRouter()
  const [active, setActive] = useState<LeadRow | null>(null)
  const [sel, setSel] = useState<Set<number>>(new Set())
  const [tag, setTag] = useState('')
  const [busy, setBusy] = useState(false)
  const pages = Math.max(1, Math.ceil(total / pageSize))

  const exportHref = `/api/admin/leads/export?${new URLSearchParams({
    ...(filters.q ? { q: filters.q } : {}),
    ...(filters.source ? { source: filters.source } : {}),
    ...(filters.status ? { status: filters.status } : {}),
  })}`

  const allOnPage = rows.length > 0 && rows.every(r => sel.has(r.id))
  function toggleAll() { setSel(allOnPage ? new Set() : new Set(rows.map(r => r.id))) }
  function toggle(id: number) { setSel(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n }) }

  async function bulk(action: 'add_tag' | 'remove_tag' | 'export') {
    const ids = [...sel]
    if (ids.length === 0) return
    if ((action === 'add_tag' || action === 'remove_tag') && !tag.trim()) { alert('Enter a tag'); return }
    setBusy(true)
    const res = await fetch('/api/admin/leads/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids, action, tag: tag.trim() || undefined }) })
    setBusy(false)
    if (action === 'export') {
      const blob = await res.blob(); const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'leads-selected.csv'; a.click(); URL.revokeObjectURL(url)
      return
    }
    if (res.ok) { setSel(new Set()); setTag(''); router.refresh() } else alert((await res.json().catch(() => ({}))).error || 'Bulk action failed')
  }

  async function saveView() {
    const name = window.prompt('Name this view:'); if (!name) return
    const res = await fetch('/api/admin/leads/views', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, config: { q: filters.q || undefined, source: filters.source || undefined, status: filters.status || undefined } }) })
    if (res.ok) router.refresh(); else alert((await res.json().catch(() => ({}))).error || 'Save failed')
  }
  async function delView(id: string) {
    if (!confirm('Delete this view?')) return
    const res = await fetch('/api/admin/leads/views', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ op: 'delete', id }) })
    if (res.ok) router.refresh()
  }
  const viewHref = (c: { q?: string; source?: string; status?: string }) => `/admin/leads?${new URLSearchParams({ tab: 'leads', ...(c.q ? { q: c.q } : {}), ...(c.source ? { source: c.source } : {}), ...(c.status ? { status: c.status } : {}) })}`

  return (
    <div className="space-y-4">
      {/* Filters */}
      <form method="get" className="flex flex-wrap items-center gap-2 text-sm">
        <input type="hidden" name="tab" value="leads" />
        <input
          name="q" defaultValue={filters.q} placeholder="Search email…"
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-gray-200 placeholder-gray-600 w-48"
        />
        <select name="source" defaultValue={filters.source} className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-gray-200">
          <option value="">All sources</option>
          {sources.map(s => <option key={s.source} value={s.source}>{s.source} ({s.count})</option>)}
        </select>
        <select name="status" defaultValue={filters.status} className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-gray-200">
          <option value="">Any status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
        <button type="submit" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white">Filter</button>
        <button type="button" onClick={saveView} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-200">☆ Save view</button>
        <a href={exportHref} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-200 ml-auto">Export CSV</a>
      </form>

      {/* Saved views */}
      {savedViews.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-sm">
          <span className="text-gray-500 text-xs uppercase">Views:</span>
          {savedViews.map(v => (
            <span key={v.id} className="inline-flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-lg pl-2.5 pr-1.5 py-1">
              <a href={viewHref(v.config)} className="text-gray-300 hover:text-white">{v.name}</a>
              <button onClick={() => delView(v.id)} className="text-gray-600 hover:text-red-400 text-xs">✕</button>
            </span>
          ))}
        </div>
      )}

      {/* Bulk action bar */}
      {sel.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 bg-blue-950/30 border border-blue-900 rounded-xl px-3 py-2 text-sm">
          <span className="text-blue-200">{sel.size} selected</span>
          <input value={tag} onChange={e => setTag(e.target.value)} placeholder="tag" className="bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1 text-gray-200 w-32" />
          <button disabled={busy} onClick={() => bulk('add_tag')} className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-200">Add tag</button>
          <button disabled={busy} onClick={() => bulk('remove_tag')} className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-200">Remove tag</button>
          <button disabled={busy} onClick={() => bulk('export')} className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-200">Export selected</button>
          <button onClick={() => setSel(new Set())} className="ml-auto text-gray-500 hover:text-white">Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase">
            <tr>
              <th className="px-3 py-3 w-8"><input type="checkbox" checked={allOnPage} onChange={toggleAll} aria-label="Select all" /></th>
              <th className="text-left font-medium px-4 py-3">Email</th>
              <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Source</th>
              <th className="text-left font-medium px-4 py-3 hidden lg:table-cell">Interest</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Captured</th>
              <th className="text-left font-medium px-4 py-3 hidden xl:table-cell">Tags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {rows.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-500">No leads match these filters.</td></tr>}
            {rows.map(r => {
              const st = statusOf(r)
              return (
                <tr key={r.id} className={`hover:bg-gray-800/40 ${sel.has(r.id) ? 'bg-blue-950/20' : ''}`}>
                  <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={sel.has(r.id)} onChange={() => toggle(r.id)} aria-label={`Select ${r.email}`} />
                  </td>
                  <td className="px-4 py-2.5 text-white cursor-pointer" onClick={() => setActive(r)}>{r.email}</td>
                  <td className="px-4 py-2.5 text-gray-400 hidden md:table-cell cursor-pointer" onClick={() => setActive(r)}>{r.captured_from || '—'}</td>
                  <td className="px-4 py-2.5 text-gray-400 hidden lg:table-cell cursor-pointer" onClick={() => setActive(r)}>{[r.route_passport, r.route_destination].filter(Boolean).join(' → ') || '—'}</td>
                  <td className="px-4 py-2.5 cursor-pointer" onClick={() => setActive(r)}><span className={`text-[11px] px-2 py-0.5 rounded-full ${STATUS_BADGE[st]}`}>{st}</span></td>
                  <td className="px-4 py-2.5 text-gray-500 hidden sm:table-cell whitespace-nowrap cursor-pointer" onClick={() => setActive(r)}>{fmt(r.captured_at)}</td>
                  <td className="px-4 py-2.5 hidden xl:table-cell cursor-pointer" onClick={() => setActive(r)}>
                    {r.admin_tags?.length ? r.admin_tags.map(t => <span key={t} className="inline-block text-[10px] bg-gray-800 text-gray-300 rounded px-1.5 py-0.5 mr-1">{t}</span>) : <span className="text-gray-600">—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{total} lead{total === 1 ? '' : 's'}</span>
        {pages > 1 && (
          <div className="flex gap-2">
            {page > 1 && <a href={`?${new URLSearchParams({ ...filters, tab: 'leads', page: String(page - 1) })}`} className="px-3 py-1.5 bg-gray-800 rounded-lg text-gray-200">Prev</a>}
            <span className="px-2 py-1.5">Page {page} / {pages}</span>
            {page < pages && <a href={`?${new URLSearchParams({ ...filters, tab: 'leads', page: String(page + 1) })}`} className="px-3 py-1.5 bg-gray-800 rounded-lg text-gray-200">Next</a>}
          </div>
        )}
      </div>

      {active && <LeadDrawer lead={active} onClose={() => setActive(null)} onSaved={() => { setActive(null); router.refresh() }} />}
    </div>
  )
}

function LeadDrawer({ lead, onClose, onSaved }: { lead: LeadRow; onClose: () => void; onSaved: () => void }) {
  const [tags, setTags] = useState((lead.admin_tags ?? []).join(', '))
  const [note, setNote] = useState(lead.admin_note ?? '')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [timeline, setTimeline] = useState<TimelineItem[] | null>(null)
  const st = statusOf(lead)

  useEffect(() => {
    let alive = true
    fetch(`/api/admin/leads/${lead.id}/timeline`).then(r => r.json()).then(j => { if (alive) setTimeline(j.timeline ?? []) }).catch(() => { if (alive) setTimeline([]) })
    return () => { alive = false }
  }, [lead.id])

  async function save() {
    setSaving(true); setErr('')
    const res = await fetch(`/api/admin/leads/${lead.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        admin_tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        admin_note: note.trim() ? note.trim() : null,
      }),
    })
    if (res.ok) onSaved()
    else { const j = await res.json().catch(() => ({})); setErr(j.error || 'Save failed'); setSaving(false) }
  }

  async function eraseGdpr() {
    if (!confirm(`GDPR-erase ${lead.email}? This deletes their marketing data and anonymizes the email on orders. Cannot be undone.`)) return
    const res = await fetch(`/api/admin/leads/${lead.id}/gdpr`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirm: true }),
    })
    if (res.ok) { const j = await res.json(); alert(`Erased: ${j.subscribersDeleted} lead, ${j.eventsDeleted} events; ${j.ordersAnonymized + j.conversionsAnonymized} records anonymized.`); onSaved() }
    else alert((await res.json().catch(() => ({}))).error || 'Erase failed')
  }

  const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
    <div className="flex justify-between gap-4 py-1.5 border-b border-gray-800/60 text-sm">
      <span className="text-gray-500">{k}</span>
      <span className="text-gray-200 text-right break-all">{v || '—'}</span>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative w-full max-w-md bg-gray-950 border-l border-gray-800 h-full overflow-y-auto p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-white break-all">{lead.email}</h2>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${STATUS_BADGE[st]}`}>{st}</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-1">Record</h3>
          <Row k="Source" v={lead.captured_from} />
          <Row k="Lead magnet" v={lead.lead_magnet} />
          <Row k="Passport" v={lead.route_passport} />
          <Row k="Destination" v={lead.route_destination} />
          <Row k="Captured" v={fmt(lead.captured_at)} />
          <Row k="Consent" v={fmt(lead.consent_at)} />
          <Row k="Confirmed" v={fmt(lead.confirmed_at)} />
          <Row k="Unsubscribed" v={fmt(lead.unsubscribed_at)} />
          <Row k="IP" v={lead.ip_address} />
          <Row k="User agent" v={lead.user_agent ? <span className="text-xs">{lead.user_agent}</span> : null} />
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-1">Activity timeline</h3>
          {timeline === null ? (
            <p className="text-gray-600 text-sm py-2">Loading…</p>
          ) : timeline.length === 0 ? (
            <p className="text-gray-600 text-sm py-2">No activity recorded.</p>
          ) : (
            <ul className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {timeline.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${t.stored ? 'bg-blue-400' : 'bg-gray-600'}`} />
                  <span className="text-gray-300 leading-snug">{t.title}</span>
                  <span className="text-gray-600 text-[11px] ml-auto whitespace-nowrap">{new Date(t.ts).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-wide text-gray-500">Operator tags & note</h3>
          <input
            value={tags} onChange={e => setTags(e.target.value)} placeholder="comma,separated,tags"
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200"
          />
          <textarea
            value={note} onChange={e => setNote(e.target.value)} placeholder="Private note…" rows={4}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200"
          />
          {err && <p className="text-red-400 text-sm">{err}</p>}
          <button onClick={save} disabled={saving} className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-white text-sm">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        <div className="pt-2 border-t border-gray-800 space-y-2">
          <h3 className="text-xs uppercase tracking-wide text-gray-500">GDPR</h3>
          <div className="flex gap-2">
            <a href={`/api/admin/leads/${lead.id}/gdpr`} className="flex-1 text-center px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-200 text-sm">Export data</a>
            <button onClick={eraseGdpr} className="flex-1 px-3 py-1.5 bg-red-900/40 hover:bg-red-900/60 border border-red-800 rounded-lg text-red-300 text-sm">Erase (GDPR)</button>
          </div>
          <p className="text-[11px] text-gray-600">Erase deletes the marketing footprint and anonymizes the email on financial records (retained for legal obligation). Audited by hash.</p>
        </div>
      </div>
    </div>
  )
}
