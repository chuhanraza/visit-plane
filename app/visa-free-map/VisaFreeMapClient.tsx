'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import CountrySelect from '@/components/CountrySelect'
import { useUserCountry } from '@/hooks/useUserCountry'
import { ALL_COUNTRIES } from '@/components/CountrySelect'
import dynamic from 'next/dynamic'
import StatsCards from './components/StatsCards'
import CountryLists from './components/CountryLists'
import ShareCard from './components/ShareCard'
import type { VisaMapResponse } from '@/app/api/visa-map/route'

// Load WorldMap only client-side (uses D3/browser APIs)
const WorldMap = dynamic(() => import('./components/WorldMap'), { ssr: false })

const FLAG_MAP = Object.fromEntries(ALL_COUNTRIES.map(c => [c.name.toLowerCase(), c.flag]))
const EXTRA_FLAGS: Record<string, string> = { 'uae': '🇦🇪' }
function getFlag(n: string) { return FLAG_MAP[n.toLowerCase()] ?? EXTRA_FLAGS[n.toLowerCase()] ?? '🌍' }

const NAV_TOOLS = [
  ['🤖 Visa Wizard', '/wizard'], ['🎯 Visa Checker', '/visa-checker'],
  ['💪 Passport Strength', '/passport-strength'], ['🗺️ Visa-Free Map', '/visa-free-map'],
  ['⚖️ Compare Visas', '/compare'], ['📋 Checklist', '/checklist'],
  ['⏱️ Processing Times', '/processing-times'], ['🏛️ Embassy Finder', '/embassy-finder'],
  ['💰 Cost Calculator', '/cost-calculator'], ['💱 Currency Converter', '/currency-converter'],
]

export default function VisaFreeMapClient() {
  const router = useRouter()
  const [passport, setPassport] = useState('')
  const [data, setData] = useState<VisaMapResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const { countryName, loading: geoLoading } = useUserCountry()

  useEffect(() => {
    if (countryName && !geoLoading && !passport) setPassport(countryName)
  }, [countryName, geoLoading, passport])

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const fetchData = useCallback(async (country: string) => {
    setLoading(true); setError(''); setData(null)
    try {
      const res = await fetch(`/api/visa-map?passport=${encodeURIComponent(country)}`)
      if (!res.ok) { setError('No data found for this passport.'); setLoading(false); return }
      const json: VisaMapResponse = await res.json()
      setData(json)
    } catch { setError('Something went wrong. Please try again.') }
    setLoading(false)
  }, [])

  useEffect(() => { if (passport) fetchData(passport) }, [passport, fetchData])

  const visaFreeSet = new Set(data?.visa_free.map(c => c.name) ?? [])
  const onArrivalSet = new Set(data?.on_arrival.map(c => c.name) ?? [])
  const requiredSet = new Set(data?.required.map(c => c.name) ?? [])

  const handleCountryClick = (dbName: string) => {
    if (passport) router.push(`/visa/${encodeURIComponent(passport)}/${encodeURIComponent(dbName)}`)
  }

  const flag = passport ? getFlag(passport) : '🌍'

  return (
    <div className="min-h-screen text-white antialiased overflow-x-hidden" style={{ background: '#060C18' }}>
      {/* ── NAVBAR ── */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#060C18]/95 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/30' : 'bg-[#060C18]/80 backdrop-blur-sm'}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2.5 shrink-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-md group-hover:bg-emerald-500/30 transition" />
              <Image src="/logo-v2.png" alt="VisitPlane" width={36} height={36} className="relative rounded-xl" />
            </div>
            <span className="text-lg font-bold tracking-tight"><span className="text-white">Visit</span><span className="text-emerald-400">Plane</span></span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {[['Destinations', '/destinations'], ['Passport Strength', '/passport-strength'], ['Blog', '/blog']].map(([l, h]) => (
              <Link key={l} href={h} className="rounded-lg px-3 py-2 text-sm text-white/55 hover:bg-white/5 hover:text-white transition">{l}</Link>
            ))}
            <div className="relative group" onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
              <button className="rounded-lg px-3 py-2 text-sm text-teal-400 font-semibold hover:bg-white/5 transition flex items-center gap-1">Tools ▾</button>
              {toolsOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 rounded-xl border border-white/10 bg-[#0C1526] shadow-xl z-50 py-1">
                  {NAV_TOOLS.map(([l, h]) => (
                    <Link key={l} href={h} className={`flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition ${h === '/visa-free-map' ? 'text-teal-400 font-semibold' : 'text-white/60 hover:text-white'}`}>{l}</Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/destinations" className="hidden sm:inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition">
              Check Visa →
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg p-2 text-white/55 hover:bg-white/5 hover:text-white md:hidden transition">
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/5 bg-[#060C18]/98 md:hidden overflow-hidden">
              <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
                {NAV_TOOLS.map(([l, h]) => (
                  <Link key={l} href={h} onClick={() => setMobileOpen(false)}
                    className={`block rounded-lg px-3 py-2.5 text-sm transition ${h === '/visa-free-map' ? 'text-teal-400 font-semibold' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>{l}</Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── HERO ── (milky white bg as per spec) */}
      <section className="bg-[#FAFAFA] pt-14 pb-16 sm:pt-20 sm:pb-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex justify-center mb-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-600">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" /> 🗺️ Visa-Free Explorer
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}
            className="text-5xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-6xl">
            Where Can You <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">Travel?</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-4 max-w-lg text-base text-gray-500 sm:text-lg">
            Select your passport and instantly see every country you can visit visa-free, on arrival, or with a visa — on a beautiful world map.
          </motion.p>
          {/* Hero Card */}
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.22 }}
            className="mx-auto mt-8 max-w-lg rounded-3xl bg-white shadow-2xl shadow-gray-300/60 border border-gray-100 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-3">🛂 Select Your Passport</p>
            <CountrySelect value={passport} onChange={setPassport}
              placeholder={geoLoading ? '🌍 Detecting location…' : 'Choose your passport country…'} variant="light" />
            <button onClick={() => passport && fetchData(passport)} disabled={!passport || loading}
              className="mt-4 w-full rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-500/30 hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {loading ? '🔄 Loading map…' : `Explore My Passport ${passport ? flag : '→'}`}
            </button>
          </motion.div>
          {/* Mini Stats */}
          <AnimatePresence>
            {data && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {[
                  ['🟢', `Visa-Free: ${data.stats.free_count}`, 'text-emerald-600 bg-emerald-50 border-emerald-200'],
                  ['🟡', `On Arrival: ${data.stats.arrival_count}`, 'text-amber-600 bg-amber-50 border-amber-200'],
                  ['🔴', `Visa Required: ${data.stats.required_count}`, 'text-rose-600 bg-rose-50 border-rose-200'],
                ].map(([emoji, label, cls]) => (
                  <span key={label} className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold ${cls}`}>
                    {emoji} {label}
                  </span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          {error && <p className="mt-4 text-sm text-rose-500">{error}</p>}
        </div>
      </section>

      {/* ── MAP SECTION ── */}
      <section className="bg-[#060C18] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {passport && !loading && data ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="mb-6 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-1">🌍 Interactive Map</p>
                <h2 className="text-2xl font-extrabold text-white">{flag} {passport} Passport — World Access</h2>
                <p className="text-sm text-white/40 mt-1">Click any country for full visa details</p>
              </div>
              <WorldMap visaFree={visaFreeSet} onArrival={onArrivalSet} required={requiredSet}
                passport={passport} onCountryClick={handleCountryClick} />
            </motion.div>
          ) : !passport ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-6xl mb-4 opacity-30">🗺️</div>
              <p className="text-white/30 text-lg font-semibold">Select a passport above to see the world map</p>
            </div>
          ) : (
            <div className="flex items-center justify-center py-24">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-8 py-5">
                <svg className="h-5 w-5 animate-spin text-teal-400" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                <span className="text-sm font-semibold text-teal-400">Loading visa data…</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── STATS DASHBOARD ── */}
      {data && (
        <section className="bg-[#0A1120] py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-1">📊 Passport Power</p>
              <h2 className="text-2xl font-extrabold text-white">Stats Dashboard</h2>
            </div>
            <StatsCards free={data.stats.free_count} arrival={data.stats.arrival_count}
              required={data.stats.required_count} total={data.stats.total} />
          </div>
        </section>
      )}

      {/* ── COUNTRY LISTS ── */}
      {data && (
        <section className="bg-[#060C18] py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-1">✈️ Destination Guide</p>
              <h2 className="text-2xl font-extrabold text-white">{passport} Travel Destinations</h2>
            </div>
            <CountryLists passport={passport} visaFree={data.visa_free} onArrival={data.on_arrival} required={data.required} />
          </div>
        </section>
      )}

      {/* ── SHARE CARD ── */}
      {data && (
        <section className="bg-[#0A1120] py-12 sm:py-16">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-1">📤 Share</p>
              <h2 className="text-2xl font-extrabold text-white">Share Your Passport Power</h2>
            </div>
            <ShareCard passport={passport} free={data.stats.free_count}
              total={data.stats.total} coverage={data.stats.coverage_percent} />
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 bg-[#040810] pb-8 pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            <div className="col-span-2">
              <Link href="/" className="mb-4 inline-flex items-center gap-2.5">
                <Image src="/logo-v2.png" alt="VisitPlane" width={32} height={32} className="rounded-xl" />
                <span className="text-lg font-bold"><span className="text-white">Visit</span><span className="text-emerald-400">Plane</span></span>
              </Link>
              <p className="max-w-xs text-sm leading-relaxed text-white/30">The world&apos;s visa requirements, decoded in seconds. Free, fast, and always updated.</p>
            </div>
            <div>
              <h4 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Tools</h4>
              <ul className="space-y-2.5">
                {[['💪 Passport Strength', '/passport-strength'], ['🗺️ Visa-Free Map', '/visa-free-map'], ['⚖️ Compare Visas', '/compare'], ['📋 Checklist', '/checklist'], ['💰 Cost Calculator', '/cost-calculator']].map(([l, h]) => (
                  <li key={l}><Link href={h} className="text-sm text-white/30 hover:text-white transition">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Company</h4>
              <ul className="space-y-2.5">
                {[['About', '/about'], ['FAQ', '/faq'], ['Contact', '/contact'], ['Privacy', '/privacy'], ['Terms', '/terms']].map(([l, h]) => (
                  <li key={l}><Link href={h} className="text-sm text-white/30 hover:text-white transition">{l}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-white/5 pt-8 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-white/20">© {new Date().getFullYear()} VisitPlane. All rights reserved.</p>
            <p className="text-xs text-white/15">Visa data is for guidance only. Always verify with official embassy sources.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
