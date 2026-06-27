'use client'

import { useMemo, useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Lightweight, dependency-free sortable table for the data-research pages.
// The full dataset is rendered server-side (in the page) and passed in as rows,
// so crawlers see every row in the initial HTML; this component only adds
// client-side column sorting + optional filtering on top. No chart/table libs.
// ─────────────────────────────────────────────────────────────────────────────

export interface Column<T> {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
  /** Custom cell renderer. Defaults to String(row[key]). */
  render?: (row: T) => React.ReactNode
  /** Value used for sorting (number or string). Defaults to row[key]. */
  sortValue?: (row: T) => number | string
  /** Hide this column below the sm breakpoint. */
  hideOnMobile?: boolean
}

interface SortableTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  initialSortKey?: string
  initialSortDir?: 'asc' | 'desc'
  /** Optional case-insensitive text filter over these row keys. */
  filterKeys?: (keyof T)[]
  filterPlaceholder?: string
  /** Caption for accessibility / SEO context. */
  caption?: string
}

export default function SortableTable<T>({
  columns,
  rows,
  initialSortKey,
  initialSortDir = 'desc',
  filterKeys,
  filterPlaceholder = 'Filter…',
  caption,
}: SortableTableProps<T>) {
  // Interfaces without an index signature aren't assignable to Record<string,
  // unknown>, so we keep T unconstrained and read dynamic keys through this cast.
  const at = (r: T, k: string): unknown => (r as Record<string, unknown>)[k]
  const [sortKey, setSortKey] = useState<string | undefined>(initialSortKey)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(initialSortDir)
  const [query, setQuery] = useState('')

  const colByKey = useMemo(() => Object.fromEntries(columns.map((c) => [c.key, c])), [columns])

  const filtered = useMemo(() => {
    if (!filterKeys?.length || !query.trim()) return rows
    const q = query.trim().toLowerCase()
    return rows.filter((r) => filterKeys.some((k) => String(at(r, k as string) ?? '').toLowerCase().includes(q)))
  }, [rows, filterKeys, query])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const col = colByKey[sortKey]
    const val = (r: T): number | string =>
      col?.sortValue ? col.sortValue(r) : (at(r, sortKey) as number | string)
    return [...filtered].sort((a, b) => {
      const av = val(a)
      const bv = val(b)
      let cmp: number
      if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv
      else cmp = String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir, colByKey])

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  return (
    <div>
      {filterKeys?.length ? (
        <div className="mb-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={filterPlaceholder}
            className="w-full max-w-xs rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-700 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            aria-label={filterPlaceholder}
          />
          <span className="ml-3 text-xs text-gray-400">{sorted.length} rows</span>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        <table className="w-full border-collapse text-sm">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              {columns.map((c) => {
                const active = sortKey === c.key
                return (
                  <th
                    key={c.key}
                    scope="col"
                    className={`px-3.5 py-3 font-semibold text-gray-600 ${
                      c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'
                    } ${c.hideOnMobile ? 'hidden sm:table-cell' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      className={`inline-flex items-center gap-1 transition hover:text-teal-600 ${
                        active ? 'text-teal-600' : ''
                      }`}
                      aria-label={`Sort by ${c.label}`}
                    >
                      {c.label}
                      <span className="text-[10px] leading-none text-gray-400">
                        {active ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0 transition hover:bg-teal-50/40">
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`px-3.5 py-2.5 text-gray-700 ${
                      c.align === 'right' ? 'text-right tabular-nums' : c.align === 'center' ? 'text-center' : 'text-left'
                    } ${c.hideOnMobile ? 'hidden sm:table-cell' : ''}`}
                  >
                    {c.render ? c.render(row) : String(at(row, c.key) ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
