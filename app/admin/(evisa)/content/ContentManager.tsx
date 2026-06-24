'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ContentRow } from '@/lib/admin/content'

function Flag({ ok, label }: { ok: boolean | null; label: string }) {
  const cls = ok === null ? 'bg-gray-700/40 text-gray-500' : ok ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'
  return <span className={`text-[10px] px-1.5 py-0.5 rounded ${cls}`}>{label}</span>
}

export default function ContentManager({
  rows, filters, total, page, pageSize,
}: {
  rows: ContentRow[]
  filters: { q: string; filter: string }
  total: number
  page: number
  pageSize: number
}) {
  const router = useRouter()
  const [active, setActive] = useState<ContentRow | null>(null)
  const [regen, setRegen] = useState<'' | 'busy' | 'done'>('')
  const pages = Math.max(1, Math.ceil(total / pageSize))

  async function regenSitemap() {
    setRegen('busy')
    const res = await fetch('/api/admin/content/regenerate-sitemap', { method: 'POST' })
    setRegen(res.ok ? 'done' : '')
    if (!res.ok) alert('Sitemap regen failed')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <form method="get" className="flex flex-wrap items-center gap-2 text-sm">
          <input name="q" defaultValue={filters.q} placeholder="Search slug / title…" className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-gray-200 placeholder-gray-600 w-48" />
          <select name="filter" defaultValue={filters.filter} className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-gray-200">
            <option value="">All pages</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="flagged">Quality-flagged</option>
          </select>
          <button type="submit" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white">Filter</button>
        </form>
        <button onClick={regenSitemap} disabled={regen === 'busy'} className="ml-auto px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-gray-200 text-sm">
          {regen === 'busy' ? 'Regenerating…' : regen === 'done' ? 'Sitemap queued ✓' : 'Regenerate sitemap'}
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase">
            <tr>
              <th className="text-left font-medium px-4 py-3">Page</th>
              <th className="text-left font-medium px-4 py-3">Index</th>
              <th className="text-right font-medium px-4 py-3">Words</th>
              <th className="text-left font-medium px-4 py-3">Detected quality</th>
              <th className="text-right font-medium px-4 py-3">GSC</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">No content pages match.</td></tr>}
            {rows.map(r => (
              <tr key={r.id} className="hover:bg-gray-800/40 align-top">
                <td className="px-4 py-2.5">
                  <div className="text-white truncate max-w-xs">{r.title || r.url_slug}</div>
                  <a href={`/${r.url_slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">/{r.url_slug} ↗</a>
                  <div className="text-[10px] text-gray-600">updated {new Date(r.updated_at).toLocaleDateString()}</div>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${r.published ? 'bg-emerald-500/15 text-emerald-300' : 'bg-gray-600/30 text-gray-400'}`}>{r.published ? 'published' : 'draft'}</span>
                </td>
                <td className="px-4 py-2.5 text-right text-gray-300">{r.word_count ?? '—'}</td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    <Flag ok={r.quality_passed} label="gate" />
                    <Flag ok={r.quality_min_words_ok} label="words" />
                    <Flag ok={r.quality_links_ok} label="links" />
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{r.quality_sources_count ?? 0} src</span>
                    {r.quality_uniqueness != null && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{Math.round(Number(r.quality_uniqueness) * 100)}% uniq</span>}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right text-gray-400 whitespace-nowrap">{r.gsc_clicks ?? 0}c / {r.gsc_impressions ?? 0}i</td>
                <td className="px-4 py-2.5 text-right"><button onClick={() => setActive(r)} className="text-blue-400 hover:text-blue-300 text-xs">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{total} page{total === 1 ? '' : 's'}</span>
        {pages > 1 && (
          <div className="flex gap-2">
            {page > 1 && <a href={`?${new URLSearchParams({ ...filters, page: String(page - 1) })}`} className="px-3 py-1.5 bg-gray-800 rounded-lg text-gray-200">Prev</a>}
            <span className="px-2 py-1.5">Page {page} / {pages}</span>
            {page < pages && <a href={`?${new URLSearchParams({ ...filters, page: String(page + 1) })}`} className="px-3 py-1.5 bg-gray-800 rounded-lg text-gray-200">Next</a>}
          </div>
        )}
      </div>

      {active && <EditDrawer page={active} onClose={() => setActive(null)} onSaved={() => { setActive(null); router.refresh() }} />}
    </div>
  )
}

function EditDrawer({ page, onClose, onSaved }: { page: ContentRow; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(page.title ?? '')
  const [meta, setMeta] = useState(page.meta_description ?? '')
  const [h1, setH1] = useState(page.h1 ?? '')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  async function save() {
    setSaving(true); setErr('')
    const res = await fetch(`/api/admin/content/${page.id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim() || null, meta_description: meta.trim() || null, h1: h1.trim() || null }),
    })
    if (res.ok) onSaved()
    else { setErr((await res.json().catch(() => ({}))).error || 'Save failed'); setSaving(false) }
  }

  const inp = 'w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200'
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative w-full max-w-md bg-gray-950 border-l border-gray-800 h-full overflow-y-auto p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <h2 className="text-base font-bold text-white break-all">/{page.url_slug}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>
        <label className="block text-xs text-gray-400 space-y-1"><span>Title <span className="text-gray-600">({title.length})</span></span><input value={title} onChange={e => setTitle(e.target.value)} className={inp} /></label>
        <label className="block text-xs text-gray-400 space-y-1"><span>Meta description <span className="text-gray-600">({meta.length})</span></span><textarea value={meta} onChange={e => setMeta(e.target.value)} rows={3} className={inp} /></label>
        <label className="block text-xs text-gray-400 space-y-1"><span>H1</span><input value={h1} onChange={e => setH1(e.target.value)} className={inp} /></label>
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button onClick={save} disabled={saving} className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-white text-sm">{saving ? 'Saving…' : 'Save metadata'}</button>
        <p className="text-xs text-gray-600">Quality flags above are detected by the generation pipeline and are read-only here. Full pipeline controls live in the <a href="/admin/seo" className="text-blue-400 hover:underline">SEO dashboard</a>.</p>
      </div>
    </div>
  )
}
