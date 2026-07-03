'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useUserCountry } from '@/hooks/useUserCountry'
import { getPassportFlag } from '@/components/PassportSwitcher'
import VisaDataDisclaimer from '@/components/VisaDataDisclaimer'
import { ALL_COUNTRIES, type Country, type VisaCategory } from './data'

export type { Country, VisaCategory }
export { ALL_COUNTRIES }

const PassportSwitcher = dynamic(() => import('@/components/PassportSwitcher'), { ssr: false })

// ─── Constants ─────────────────────────────────────────────────────────────

const VISA_CATEGORIES: VisaCategory[] = [
  'Visa Free', 'eVisa', 'Visa on Arrival', 'Visa Required', 'Not Permitted',
]

const REGIONS = ['All', 'Asia', 'Europe', 'Americas', 'Middle East', 'Africa', 'Oceania']

const POPULAR_SUGGESTIONS = ['Thailand', 'UAE', 'France']

const BADGE: Record<VisaCategory, { bg: string; text: string; border: string; dot: string }> = {
  'Visa Free':       { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  'eVisa':           { bg: 'bg-amber-500/15',   text: 'text-amber-400',   border: 'border-amber-500/30',   dot: 'bg-amber-400'   },
  'Visa on Arrival': { bg: 'bg-blue-500/15',    text: 'text-blue-400',    border: 'border-blue-500/30',    dot: 'bg-blue-400'    },
  'Visa Required':   { bg: 'bg-rose-500/15',    text: 'text-rose-400',    border: 'border-rose-500/30',    dot: 'bg-rose-400'    },
  'Not Permitted':   { bg: 'bg-gray-500/15',    text: 'text-gray-400',    border: 'border-gray-500/30',    dot: 'bg-gray-500'    },
}

const EASE_ORDER: Record<VisaCategory, number> = {
  'Visa Free': 0, 'eVisa': 1, 'Visa on Arrival': 2, 'Visa Required': 3, 'Not Permitted': 4,
}

// Highlight query match in a string
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-emerald-400/25 text-emerald-300 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

// ─── Main component ────────────────────────────────────────────────────────

export default function DestinationsClient() {
  const { countryName } = useUserCountry()

  const [passport, setPassport]           = useState('United States')
  const [showSwitcher, setShowSwitcher]   = useState(false)
  const [rawSearch, setRawSearch]         = useState('')
  const [search, setSearch]               = useState('')
  const [visaFilters, setVisaFilters]     = useState<VisaCategory[]>([])
  const [region, setRegion]               = useState('All')
  const [sort, setSort]                   = useState<'az' | 'za' | 'cheapest' | 'easiest' | 'popular'>('popular')
  const [passportReady, setPassportReady] = useState(false)

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Hydrate passport from localStorage / geo ──────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem('visitplane_passport')
      if (stored) { setPassport(stored); setPassportReady(true); return }
    } catch { /* ignore */ }
    setPassportReady(false)
  }, [])

  useEffect(() => {
    if (passportReady) return
    if (countryName) { setPassport(countryName); setPassportReady(true) }
  }, [countryName, passportReady])

  // ── Debounced search ──────────────────────────────────────────────────
  const handleSearchInput = useCallback((val: string) => {
    setRawSearch(val)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setSearch(val), 150)
  }, [])

  // ── Toggle visa filter chip ───────────────────────────────────────────
  const toggleVisa = useCallback((cat: VisaCategory) => {
    setVisaFilters((prev) =>
      prev.includes(cat) ? prev.filter((v) => v !== cat) : [...prev, cat]
    )
  }, [])

  // ── Filtered + sorted list ────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    let list = ALL_COUNTRIES.filter((c) => {
      if (q) {
        const inName = c.name.toLowerCase().includes(q)
        const inAlt  = c.alt.some((a) => a.toLowerCase().includes(q))
        if (!inName && !inAlt) return false
      }
      if (visaFilters.length && !visaFilters.includes(c.visa)) return false
      if (region !== 'All' && c.region !== region) return false
      return true
    })

    switch (sort) {
      case 'az':       list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break
      case 'za':       list = [...list].sort((a, b) => b.name.localeCompare(a.name)); break
      case 'cheapest': list = [...list].sort((a, b) => {
        const fa = a.fee_usd === 'Free' ? 0 : a.fee_usd === '—' || a.fee_usd.includes('Embassy') ? 9999 : parseInt(a.fee_usd.replace(/\D/g, '')) || 0
        const fb = b.fee_usd === 'Free' ? 0 : b.fee_usd === '—' || b.fee_usd.includes('Embassy') ? 9999 : parseInt(b.fee_usd.replace(/\D/g, '')) || 0
        return fa - fb
      }); break
      case 'easiest':  list = [...list].sort((a, b) => EASE_ORDER[a.visa] - EASE_ORDER[b.visa]); break
      case 'popular':  list = [...list].sort((a, b) => a.popular - b.popular); break
    }
    return list
  }, [search, visaFilters, region, sort])

  // ── Count badges for visa chips ───────────────────────────────────────
  const visaCounts = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = ALL_COUNTRIES.filter((c) => {
      if (q) {
        const inName = c.name.toLowerCase().includes(q)
        const inAlt  = c.alt.some((a) => a.toLowerCase().includes(q))
        if (!inName && !inAlt) return false
      }
      if (region !== 'All' && c.region !== region) return false
      return true
    })
    return VISA_CATEGORIES.reduce<Record<VisaCategory, number>>((acc, cat) => {
      acc[cat] = base.filter((c) => c.visa === cat).length
      return acc
    }, {} as Record<VisaCategory, number>)
  }, [search, region])

  const passportFlag = getPassportFlag(passport)

  return (
    <>
      {/* ── Passport switcher modal ────────────────────────────────────── */}
      {showSwitcher && (
        <PassportSwitcher
          current={passport}
          onSelect={setPassport}
          onClose={() => setShowSwitcher(false)}
        />
      )}

      <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased">

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-20 pb-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-[480px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.10),transparent_65%)]" />
          </div>
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400">
              🌍 {ALL_COUNTRIES.length} Countries
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-[#0f0c29]">All </span>
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Destinations
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base text-gray-500">
              Visa requirements for {ALL_COUNTRIES.length} countries — fees, stay limits, and how to apply.
            </p>

            {/* Passport pill */}
            <div className="mt-5 flex items-center justify-center gap-2">
              <span className="text-sm text-gray-500">Your passport:</span>
              <button
                onClick={() => setShowSwitcher(true)}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-[#0f0c29] shadow-sm hover:border-emerald-500/40 hover:shadow-emerald-500/10 transition-all"
                aria-label="Change passport country"
              >
                <span>{passportFlag}</span>
                <span>{passport}</span>
                <span className="text-xs text-emerald-500 font-normal">[Change]</span>
              </button>
            </div>
          </div>
        </section>

        {/* ── Guidance-not-guarantee band ─────────────────────────────── */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-2">
          <VisaDataDisclaimer variant="compact" />
        </div>

        {/* ── Sticky filter bar ───────────────────────────────────────── */}
        <div className="sticky top-16 z-30 border-b border-gray-200/70 bg-[#FAFAFA]/95 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 space-y-3">

            {/* Search */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</span>
              <input
                type="search"
                value={rawSearch}
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder="Search countries… (try &quot;Dubai&quot; or &quot;UAE&quot;)"
                aria-label="Search countries"
                className="w-full rounded-xl border border-gray-200 bg-white pl-11 pr-10 py-2.5 text-sm text-[#0f0c29] placeholder-gray-400 outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/15 transition"
              />
              {rawSearch && (
                <button
                  onClick={() => { setRawSearch(''); setSearch('') }}
                  className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-gray-400 hover:text-gray-600 transition text-lg leading-none"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            {/* Visa filter chips */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* All chip */}
              <button
                onClick={() => setVisaFilters([])}
                className={`rounded-full px-4 py-2 sm:px-3.5 sm:py-1 text-xs font-semibold transition-all border ${
                  visaFilters.length === 0
                    ? 'bg-[#0f0c29] text-white border-[#0f0c29] shadow'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                All <span className="opacity-60 font-normal ml-0.5">({ALL_COUNTRIES.length})</span>
              </button>
              {VISA_CATEGORIES.map((cat) => {
                const active = visaFilters.includes(cat)
                const b = BADGE[cat]
                return (
                  <button
                    key={cat}
                    onClick={() => toggleVisa(cat)}
                    className={`rounded-full px-4 py-2 sm:px-3.5 sm:py-1 text-xs font-semibold border transition-all ${
                      active
                        ? `${b.bg} ${b.text} ${b.border}`
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {cat}{' '}
                    <span className="opacity-60 font-normal ml-0.5">({visaCounts[cat]})</span>
                  </button>
                )
              })}
            </div>

            {/* Region + Sort row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Region dropdown */}
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                aria-label="Filter by region"
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 sm:py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-emerald-500/60 cursor-pointer"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r === 'All' ? 'All Regions' : r}</option>
                ))}
              </select>

              {/* Sort dropdown */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                aria-label="Sort destinations"
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 sm:py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-emerald-500/60 cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
                <option value="cheapest">Cheapest First</option>
                <option value="easiest">Easiest First</option>
              </select>

              {/* Result count */}
              <span className="ml-auto text-xs text-gray-400 shrink-0">
                {filtered.length === ALL_COUNTRIES.length
                  ? `${ALL_COUNTRIES.length} countries`
                  : `${filtered.length} of ${ALL_COUNTRIES.length}`}
              </span>
            </div>
          </div>
        </div>

        {/* ── Grid ────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-24">
          {filtered.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center py-24 text-center">
              <span className="text-5xl mb-4">🔭</span>
              <p className="text-lg font-semibold text-[#0f0c29]">
                No countries match &ldquo;{search}&rdquo;
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Try a different search or{' '}
                <button
                  onClick={() => { setRawSearch(''); setSearch(''); setVisaFilters([]); setRegion('All') }}
                  className="text-emerald-500 underline underline-offset-2 hover:text-emerald-600"
                >
                  clear all filters
                </button>
              </p>
              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Popular Destinations</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {POPULAR_SUGGESTIONS.map((name) => {
                    const c = ALL_COUNTRIES.find((x) => x.name === name)!
                    return (
                      <Link
                        key={name}
                        href={`/visa/${encodeURIComponent(passport)}/${encodeURIComponent(name)}`}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium hover:border-emerald-500/40 hover:shadow transition"
                      >
                        <span>{c.flag}</span>
                        <span>{name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              role="list"
              aria-label="Destination countries"
            >
              {filtered.map((country) => {
                const badge = BADGE[country.visa]
                const href = `/visa/${encodeURIComponent(passport)}/${encodeURIComponent(country.name)}`
                return (
                  <Link
                    key={country.name}
                    href={href}
                    prefetch={country.popular <= 10}
                    role="listitem"
                    className="group relative flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    aria-label={`${country.name} — ${country.visa}`}
                  >
                    {/* Flag + name */}
                    <div className="flex items-start gap-3">
                      <span className="text-3xl leading-none" role="img" aria-label={country.name}>{country.flag}</span>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="truncate text-sm font-bold text-[#0f0c29] leading-tight">
                          <Highlight text={country.name} query={search} />
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{country.region}</div>
                      </div>
                    </div>

                    {/* Visa badge */}
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${badge.bg} ${badge.text} ${badge.border}`}>
                        {country.visa}
                      </span>
                    </div>

                    {/* Stay + fee */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span title="Max stay">✈ {country.max_stay}</span>
                      <span title="Approx. fee" className="font-medium">
                        {country.fee_usd === 'Free'
                          ? <span className="text-emerald-500 font-bold">Free</span>
                          : country.fee_usd === '—'
                          ? <span className="text-gray-300">—</span>
                          : country.fee_usd}
                      </span>
                    </div>

                    {/* Hover CTA */}
                    <div className="absolute bottom-3 right-4 text-[11px] font-semibold text-gray-300 group-hover:text-emerald-500 transition-colors">
                      View details →
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
