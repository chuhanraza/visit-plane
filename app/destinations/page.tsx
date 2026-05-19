'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const POPULAR_COUNTRIES = [
  { name: 'UAE',            flag: '🇦🇪', region: 'Middle East', visa: 'eVisa' },
  { name: 'Turkey',         flag: '🇹🇷', region: 'Europe / Asia', visa: 'eVisa' },
  { name: 'Japan',          flag: '🇯🇵', region: 'Asia', visa: 'Visa Required' },
  { name: 'United Kingdom', flag: '🇬🇧', region: 'Europe', visa: 'Visa Required' },
  { name: 'Singapore',      flag: '🇸🇬', region: 'Asia', visa: 'Visa Free' },
  { name: 'France',         flag: '🇫🇷', region: 'Europe', visa: 'Visa Required' },
  { name: 'United States',  flag: '🇺🇸', region: 'Americas', visa: 'Visa Required' },
  { name: 'Canada',         flag: '🇨🇦', region: 'Americas', visa: 'Visa Required' },
  { name: 'Australia',      flag: '🇦🇺', region: 'Oceania', visa: 'eVisa' },
  { name: 'Saudi Arabia',   flag: '🇸🇦', region: 'Middle East', visa: 'eVisa' },
  { name: 'Thailand',       flag: '🇹🇭', region: 'Asia', visa: 'Visa Free' },
  { name: 'Malaysia',       flag: '🇲🇾', region: 'Asia', visa: 'Visa Free' },
  { name: 'Germany',        flag: '🇩🇪', region: 'Europe', visa: 'Visa Required' },
  { name: 'South Korea',    flag: '🇰🇷', region: 'Asia', visa: 'Visa Required' },
  { name: 'Qatar',          flag: '🇶🇦', region: 'Middle East', visa: 'Visa Free' },
  { name: 'Indonesia',      flag: '🇮🇩', region: 'Asia', visa: 'Visa Free' },
  { name: 'Egypt',          flag: '🇪🇬', region: 'Africa', visa: 'eVisa' },
  { name: 'Morocco',        flag: '🇲🇦', region: 'Africa', visa: 'Visa Free' },
  { name: 'Kenya',          flag: '🇰🇪', region: 'Africa', visa: 'eVisa' },
  { name: 'New Zealand',    flag: '🇳🇿', region: 'Oceania', visa: 'eVisa' },
  { name: 'Vietnam',        flag: '🇻🇳', region: 'Asia', visa: 'eVisa' },
  { name: 'India',          flag: '🇮🇳', region: 'Asia', visa: 'eVisa' },
  { name: 'Brazil',         flag: '🇧🇷', region: 'Americas', visa: 'Visa Required' },
  { name: 'Mexico',         flag: '🇲🇽', region: 'Americas', visa: 'Visa Free' },
]

const VISA_BADGE: Record<string, { bg: string; text: string }> = {
  'Visa Free':     { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'eVisa':         { bg: 'bg-amber-100',   text: 'text-amber-700' },
  'Visa Required': { bg: 'bg-rose-100',    text: 'text-rose-700' },
}

export default function DestinationsPage() {
  const [search, setSearch] = useState('')

  const filtered = POPULAR_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.region.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white antialiased">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#0f0c29]/95 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/30">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo-v2.png" alt="VisitPlane" width={36} height={36} className="rounded-xl" />
            <span className="text-lg font-bold">
              <span className="text-white">Visit</span>
              <span className="text-emerald-400">Plane</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/destinations" className="rounded-lg px-3 py-2 text-sm text-emerald-400 font-semibold">Explore</Link>
            <Link href="/visa-requirements" className="rounded-lg px-3 py-2 text-sm text-white/55 hover:text-white transition">Visa Requirements</Link>
            <Link href="/blog" className="rounded-lg px-3 py-2 text-sm text-white/55 hover:text-white transition">Blog</Link>
          </nav>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition"
          >
            Check Visa →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),transparent_60%)]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400">
            🌍 197 Countries
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-white">Explore </span>
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              197+ Destinations
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-white/50">
            Select any country to instantly check visa requirements, fees, processing times, and document checklists.
          </p>

          {/* Search */}
          <div className="mx-auto mt-8 max-w-lg">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search countries or regions…"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="py-20 text-center text-white/40">No countries found for &quot;{search}&quot;</div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {filtered.map((country) => {
                const badge = VISA_BADGE[country.visa] ?? VISA_BADGE['Visa Required']
                return (
                  <Link
                    key={country.name}
                    href={`/visa/United%20States/${encodeURIComponent(country.name)}`}
                    className="group flex flex-col items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-center transition hover:border-emerald-500/40 hover:bg-white/[0.07] hover:-translate-y-0.5"
                  >
                    <span className="text-4xl">{country.flag}</span>
                    <div className="text-sm font-semibold text-white leading-tight">{country.name}</div>
                    <div className="text-[10px] text-white/35">{country.region}</div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badge.bg} ${badge.text}`}>
                      {country.visa}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 hover:-translate-y-px transition"
            >
              Check Visa Requirements for Your Passport →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
