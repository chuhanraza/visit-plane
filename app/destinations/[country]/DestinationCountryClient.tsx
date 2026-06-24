'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { PASSPORT_LIST } from '@/components/PassportSwitcher'
import OfficialSourceLink from '@/components/visa/OfficialSourceLink'

// ─── Types ─────────────────────────────────────────────────────────────────────

type VisaCategory = 'Visa Free' | 'eVisa' | 'Visa on Arrival' | 'Visa Required' | 'Not Permitted'

const BADGE: Record<VisaCategory, { bg: string; text: string; border: string; dot: string }> = {
  'Visa Free':       { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  'eVisa':           { bg: 'bg-amber-500/15',   text: 'text-amber-400',   border: 'border-amber-500/30',   dot: 'bg-amber-400'   },
  'Visa on Arrival': { bg: 'bg-blue-500/15',    text: 'text-blue-400',    border: 'border-blue-500/30',    dot: 'bg-blue-400'    },
  'Visa Required':   { bg: 'bg-rose-500/15',    text: 'text-rose-400',    border: 'border-rose-500/30',    dot: 'bg-rose-400'    },
  'Not Permitted':   { bg: 'bg-gray-500/15',    text: 'text-gray-400',    border: 'border-gray-500/30',    dot: 'bg-gray-500'    },
}

interface Props {
  countryName: string
  countryFlag: string
  countryRegion: string
  visa: string
  maxStay: string
  feeUsd: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DestinationCountryClient({
  countryName,
  countryFlag,
  countryRegion,
  visa,
  maxStay,
  feeUsd,
}: Props) {
  const [search, setSearch]         = useState('')
  const [rawSearch, setRawSearch]   = useState('')
  const [myPassport, setMyPassport] = useState('Pakistan')
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Hydrate passport from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('visitplane_passport')
      if (stored) setMyPassport(stored)
    } catch { /* ignore */ }
  }, [])

  const handleSearch = useCallback((val: string) => {
    setRawSearch(val)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setSearch(val), 150)
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return PASSPORT_LIST
    return PASSPORT_LIST.filter((p) => p.name.toLowerCase().includes(q))
  }, [search])

  const myPassportEntry = PASSPORT_LIST.find((p) => p.name === myPassport) ?? PASSPORT_LIST[0]
  const visaBadge = BADGE[(visa as VisaCategory)] ?? BADGE['Visa Required']

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased">

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-1.5 py-2.5 text-xs text-gray-400 flex-wrap">
            <li><Link href="/" className="hover:text-teal-500 transition-colors">Home</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link href="/destinations" className="hover:text-teal-500 transition-colors">Destinations</Link></li>
            <li aria-hidden="true">›</li>
            <li className="text-gray-600 font-medium">{countryName}</li>
          </ol>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-14 pb-10 bg-gradient-to-b from-[#0f0c29] to-[#1a1740]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),transparent_65%)]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-7xl mb-4" role="img" aria-label={countryName}>{countryFlag}</div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {countryName} Visa Requirements
          </h1>
          <p className="mt-3 text-white/50 text-sm">{countryRegion}</p>

          {/* General stats row */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3">
            <div className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold ${visaBadge.bg} ${visaBadge.text} ${visaBadge.border}`}>
              <span className={`h-2 w-2 rounded-full ${visaBadge.dot}`} />
              {visa}
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3.5 py-1.5 text-sm text-white/70">
              ✈ {maxStay}
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3.5 py-1.5 text-sm text-white/70">
              💳 {feeUsd === 'Free' ? 'Free entry' : feeUsd === '—' ? 'Fee varies' : `From ${feeUsd}`}
            </div>
          </div>

          <p className="mt-4 text-xs text-white/30">
            Data shown for most common passport. Select your passport below for exact requirements.
          </p>
        </div>
      </section>

      {/* ── My passport CTA ─────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-sm text-gray-500 mb-3">Check exact requirements for your passport:</p>
          <Link
            href={`/visa/${encodeURIComponent(myPassport)}/${encodeURIComponent(countryName)}`}
            className="inline-flex items-center gap-2.5 rounded-full bg-teal-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition hover:bg-teal-600 hover:-translate-y-px"
          >
            <span className="text-xl">{myPassportEntry.flag}</span>
            <span>{myPassport} → {countryName} Visa</span>
            <span className="text-teal-100">→</span>
          </Link>
          <p className="mt-2 text-xs text-gray-400">
            Not {myPassport}?{' '}
            <button
              onClick={() => {
                const input = document.getElementById('passport-search-input')
                input?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                ;(input as HTMLInputElement | null)?.focus()
              }}
              className="text-teal-500 hover:text-teal-600 underline underline-offset-2"
            >
              Select your country below
            </button>
          </p>
        </div>
      </section>

      {/* ── Official source ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8">
        <OfficialSourceLink destinationName={countryName} />
      </section>

      {/* ── Passport grid ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 pb-24">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#0f0c29]">All Passport Countries</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Select your passport to see exact {countryName} visa requirements
            </p>
          </div>
          <div className="relative sm:ml-auto sm:w-72">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</span>
            <input
              id="passport-search-input"
              type="search"
              value={rawSearch}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search your country…"
              aria-label="Search passport country"
              className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm text-[#0f0c29] placeholder-gray-400 outline-none focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/15 transition"
            />
            {rawSearch && (
              <button
                onClick={() => { setRawSearch(''); setSearch('') }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
                aria-label="Clear search"
              >×</button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg font-semibold text-gray-700">No passports match &ldquo;{search}&rdquo;</p>
            <button
              onClick={() => { setRawSearch(''); setSearch('') }}
              className="mt-3 text-sm text-teal-500 underline underline-offset-2"
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-xs text-gray-400">
              {filtered.length === PASSPORT_LIST.length
                ? `${PASSPORT_LIST.length} countries`
                : `${filtered.length} of ${PASSPORT_LIST.length}`}
            </p>
            <div
              className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              role="list"
              aria-label="Passport countries"
            >
              {filtered.map((p) => (
                <Link
                  key={p.name}
                  href={`/visa/${encodeURIComponent(p.name)}/${encodeURIComponent(countryName)}`}
                  role="listitem"
                  onClick={() => {
                    try { localStorage.setItem('visitplane_passport', p.name) } catch { /* ignore */ }
                  }}
                  className="group flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-3.5 py-3 text-sm font-medium text-[#0f0c29] transition-all hover:-translate-y-0.5 hover:border-teal-500/30 hover:shadow-md hover:shadow-teal-500/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  aria-label={`${p.name} passport — ${countryName} visa requirements`}
                >
                  <span className="text-2xl leading-none shrink-0" role="img" aria-hidden="true">{p.flag}</span>
                  <span className="truncate text-xs leading-snug">{p.name}</span>
                  <span className="ml-auto text-gray-300 group-hover:text-teal-500 transition-colors text-xs shrink-0">→</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
