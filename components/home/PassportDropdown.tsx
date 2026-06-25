'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { PASSPORT_LIST, getPassportFlag } from '@/components/PassportSwitcher'

// ─────────────────────────────────────────────────────────────────────────────
// Inline, anchored passport dropdown (not a modal). Opens directly beneath the
// trigger, with a search box + scrollable country list. Closes on select,
// outside-click, or Escape. Keyboard accessible (type to filter, ↑/↓ to move,
// Enter to choose).
// ─────────────────────────────────────────────────────────────────────────────
export default function PassportDropdown({
  current,
  onSelect,
  geoLoading = false,
}: {
  current: string
  onSelect: (name: string) => void
  geoLoading?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(
    () =>
      query
        ? PASSPORT_LIST.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
        : PASSPORT_LIST,
    [query],
  )

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setActive(0)
  }, [])

  const choose = useCallback(
    (name: string) => {
      onSelect(name)
      close()
    },
    [onSelect, close],
  )

  // Focus the search box when opening.
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Close on outside-click / Escape.
  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  // Keep the active option in view.
  useEffect(() => {
    if (!open) return
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); const p = filtered[active]; if (p) choose(p.name) }
  }

  const flag = current ? getPassportFlag(current) : '🌍'

  return (
    <div ref={wrapRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="group inline-flex items-center gap-2.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-900 shadow-sm transition hover:border-emerald-500/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        <span className="text-lg leading-none">{flag}</span>
        <span>{current || (geoLoading ? 'Detecting…' : 'Choose passport')}</span>
        <svg
          className={`h-3.5 w-3.5 text-gray-400 transition-transform group-hover:text-emerald-500 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select passport"
          className="absolute left-1/2 top-full z-50 mt-2 w-72 max-w-[88vw] -translate-x-1/2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-900/10"
        >
          <div className="border-b border-gray-100 p-2.5">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">🔍</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActive(0) }}
                onKeyDown={onInputKeyDown}
                placeholder="Search country…"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-emerald-500/60 focus:bg-white"
              />
            </div>
          </div>

          <div ref={listRef} className="max-h-64 overflow-y-auto p-1.5">
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">No results for &ldquo;{query}&rdquo;</p>
            ) : (
              filtered.map((p, i) => {
                const selected = p.name === current
                return (
                  <button
                    key={p.name}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    data-idx={i}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(p.name)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                      selected
                        ? 'bg-emerald-500/10 font-semibold text-emerald-600'
                        : i === active
                          ? 'bg-emerald-50 text-gray-900'
                          : 'text-gray-800'
                    }`}
                  >
                    <span className="text-lg leading-none">{p.flag}</span>
                    <span className="flex-1">{p.name}</span>
                    {selected && <span className="text-xs text-emerald-500">✓</span>}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
