'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Hit { type: string; label: string; sublabel: string; href: string }

const NAV: Hit[] = [
  { type: 'go', label: 'Dashboard', sublabel: 'overview', href: '/admin' },
  { type: 'go', label: 'Analytics', sublabel: 'reports & funnel', href: '/admin/analytics' },
  { type: 'go', label: 'Leads / CRM', sublabel: 'email leads', href: '/admin/leads' },
  { type: 'go', label: 'Revenue', sublabel: 'manual ledger', href: '/admin/revenue' },
  { type: 'go', label: 'Affiliates', sublabel: 'partners & conversions', href: '/admin/affiliate-mgmt' },
  { type: 'go', label: 'Content', sublabel: 'SEO pages', href: '/admin/content' },
  { type: 'go', label: 'Email', sublabel: 'campaigns', href: '/admin/email' },
  { type: 'go', label: 'e-Visa orders', sublabel: 'fulfilment', href: '/admin/orders' },
  { type: 'go', label: 'Audit log', sublabel: 'activity', href: '/admin/audit' },
  { type: 'go', label: 'Settings', sublabel: 'admins, flags, keys', href: '/admin/settings' },
]

const TYPE_BADGE: Record<string, string> = {
  go: 'bg-gray-700 text-gray-300', lead: 'bg-emerald-500/20 text-emerald-300',
  manual_order: 'bg-blue-500/20 text-blue-300', evisa_order: 'bg-blue-500/20 text-blue-300',
  content: 'bg-purple-500/20 text-purple-300', partner: 'bg-amber-500/20 text-amber-300',
}

export default function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<Hit[]>([])
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(o => !o) }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => { if (open) { setQ(''); setHits([]); setSel(0); setTimeout(() => inputRef.current?.focus(), 30) } }, [open])

  useEffect(() => {
    if (!open) return
    const term = q.trim()
    if (term.length < 2) { setHits([]); return }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(term)}`)
        const j = await res.json()
        setHits(j.hits ?? []); setSel(0)
      } catch { setHits([]) }
    }, 180)
    return () => clearTimeout(t)
  }, [q, open])

  const filteredNav = q.trim()
    ? NAV.filter(n => (n.label + n.sublabel).toLowerCase().includes(q.toLowerCase()))
    : NAV
  const results = q.trim().length >= 2 ? [...filteredNav, ...hits] : NAV

  const go = useCallback((h: Hit) => { setOpen(false); router.push(h.href) }, [router])

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(results.length - 1, s + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(0, s - 1)) }
    else if (e.key === 'Enter' && results[sel]) { e.preventDefault(); go(results[sel]) }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative w-full max-w-xl bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <input
          ref={inputRef} value={q} onChange={e => setQ(e.target.value)} onKeyDown={onKeyDown}
          placeholder="Search leads, orders, content… or jump to a page"
          className="w-full bg-transparent text-white px-4 py-3.5 outline-none border-b border-gray-800 placeholder-gray-600"
        />
        <ul className="max-h-80 overflow-y-auto py-1">
          {results.length === 0 && <li className="px-4 py-6 text-center text-gray-500 text-sm">No matches.</li>}
          {results.map((h, i) => (
            <li key={`${h.type}-${h.href}-${i}`}>
              <button
                onMouseEnter={() => setSel(i)} onClick={() => go(h)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${i === sel ? 'bg-gray-800' : ''}`}>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${TYPE_BADGE[h.type] ?? 'bg-gray-700 text-gray-300'}`}>{h.type === 'go' ? 'go' : h.type.replace('_', ' ')}</span>
                <span className="text-gray-100 text-sm truncate">{h.label}</span>
                <span className="text-gray-600 text-xs truncate ml-auto">{h.sublabel}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="px-4 py-2 border-t border-gray-800 text-[11px] text-gray-600 flex gap-3">
          <span>↑↓ navigate</span><span>↵ open</span><span>esc close</span><span className="ml-auto">⌘K</span>
        </div>
      </div>
    </div>
  )
}
