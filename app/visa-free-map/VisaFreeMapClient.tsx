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
import PassportRankCard from './components/PassportRankCard'
import TipsCard from './components/TipsCard'
import type { VisaMapResponse } from '@/app/api/visa-map/route'

const WorldMap = dynamic(() => import('./components/WorldMap'), { ssr: false })

const FLAG_MAP = Object.fromEntries(ALL_COUNTRIES.map(c => [c.name.toLowerCase(), c.flag]))
function getFlag(n: string) { return FLAG_MAP[n.toLowerCase()] ?? '🌍' }

// ── Henley Passport Index 2026 ────────────────────────────────────────────────
const PASSPORT_RANKINGS: Record<string, { rank: number; score: number }> = {
  'Singapore': { rank: 1, score: 192 },
  'United Arab Emirates': { rank: 2, score: 187 },
  'Japan': { rank: 2, score: 187 },
  'South Korea': { rank: 2, score: 187 },
  'France': { rank: 4, score: 185 },
  'Germany': { rank: 4, score: 185 },
  'Italy': { rank: 4, score: 185 },
  'Spain': { rank: 4, score: 185 },
  'Finland': { rank: 4, score: 185 },
  'Netherlands': { rank: 4, score: 185 },
  'Sweden': { rank: 4, score: 185 },
  'Austria': { rank: 6, score: 183 },
  'Denmark': { rank: 6, score: 183 },
  'Ireland': { rank: 6, score: 183 },
  'Luxembourg': { rank: 6, score: 183 },
  'United Kingdom': { rank: 6, score: 183 },
  'Australia': { rank: 7, score: 182 },
  'Canada': { rank: 7, score: 182 },
  'New Zealand': { rank: 7, score: 182 },
  'Switzerland': { rank: 7, score: 182 },
  'Portugal': { rank: 8, score: 181 },
  'Belgium': { rank: 9, score: 180 },
  'Norway': { rank: 9, score: 180 },
  'United States': { rank: 10, score: 179 },
  'Czech Republic': { rank: 10, score: 179 },
  'Malta': { rank: 10, score: 179 },
  'Poland': { rank: 10, score: 179 },
  'Greece': { rank: 11, score: 178 },
  'Hungary': { rank: 11, score: 178 },
  'Malaysia': { rank: 12, score: 178 },
  'Lithuania': { rank: 13, score: 176 },
  'Slovakia': { rank: 13, score: 176 },
  'Slovenia': { rank: 13, score: 176 },
  'Iceland': { rank: 14, score: 175 },
  'Latvia': { rank: 14, score: 175 },
  'Estonia': { rank: 15, score: 175 },
  'Croatia': { rank: 16, score: 174 },
  'Romania': { rank: 17, score: 173 },
  'Bulgaria': { rank: 18, score: 172 },
  'Cyprus': { rank: 18, score: 172 },
  'Mexico': { rank: 25, score: 159 },
  'Brazil': { rank: 20, score: 170 },
  'Argentina': { rank: 18, score: 172 },
  'Chile': { rank: 19, score: 171 },
  'Uruguay': { rank: 20, score: 170 },
  'UAE': { rank: 2, score: 187 },
  'Turkey': { rank: 50, score: 110 },
  'China': { rank: 60, score: 85 },
  'Saudi Arabia': { rank: 55, score: 92 },
  'Qatar': { rank: 45, score: 100 },
  'Kuwait': { rank: 58, score: 86 },
  'Bahrain': { rank: 50, score: 110 },
  'Oman': { rank: 60, score: 85 },
  'Israel': { rank: 22, score: 165 },
  'Taiwan': { rank: 32, score: 146 },
  'Hong Kong': { rank: 18, score: 170 },
  'Brunei': { rank: 22, score: 165 },
  'Russia': { rank: 51, score: 117 },
  'Ukraine': { rank: 35, score: 148 },
  'South Africa': { rank: 54, score: 104 },
  'Morocco': { rank: 73, score: 68 },
  'Algeria': { rank: 85, score: 54 },
  'Egypt': { rank: 90, score: 51 },
  'Tunisia': { rank: 72, score: 69 },
  'Ghana': { rank: 85, score: 64 },
  'Nigeria': { rank: 95, score: 45 },
  'Kenya': { rank: 88, score: 73 },
  'Ethiopia': { rank: 97, score: 42 },
  'Tanzania': { rank: 89, score: 52 },
  'Rwanda': { rank: 84, score: 64 },
  'Senegal': { rank: 87, score: 63 },
  'India': { rank: 75, score: 56 },
  'Pakistan': { rank: 102, score: 33 },
  'Bangladesh': { rank: 100, score: 41 },
  'Sri Lanka': { rank: 96, score: 44 },
  'Nepal': { rank: 95, score: 43 },
  'Indonesia': { rank: 65, score: 77 },
  'Philippines': { rank: 80, score: 66 },
  'Thailand': { rank: 67, score: 80 },
  'Vietnam': { rank: 90, score: 52 },
  'Myanmar': { rank: 98, score: 39 },
  'Afghanistan': { rank: 199, score: 23 },
  'Iraq': { rank: 105, score: 31 },
  'Syria': { rank: 108, score: 29 },
  'Yemen': { rank: 106, score: 30 },
  'Iran': { rank: 103, score: 42 },
}

function getRankInfo(passport: string) {
  const direct = PASSPORT_RANKINGS[passport]
  if (direct) return direct
  // Fallback
  return { rank: 90, score: 50 }
}

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
  const rankInfo = passport ? getRankInfo(passport) : { rank: 99, score: 0 }

  return (
    <div className="min-h-screen text-[#0f0c29] antialiased overflow-x-hidden" style={{ background: '#060C18' }}>

      {/* ── NAVBAR ── */}{/* ── HERO ── */}
      <section className="bg-[#FAFAFA] pt-14 pb-16 sm:pt-20 sm:pb-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          {/* Spinning globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-5"
          >
            <span className="text-6xl select-none" style={{ display: 'inline-block', animation: 'spin-globe 8s linear infinite' }}>🌍</span>
          </motion.div>

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.06 }}
            className="flex justify-center mb-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-600">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" /> 🗺️ Visa-Free World Explorer
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-6xl">
            Discover Your{' '}
            <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">Passport Power</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.17 }}
            className="mx-auto mt-4 max-w-lg text-base text-gray-500 sm:text-lg">
            See exactly where your passport takes you — visa-free, on arrival, or requires a visa. 197 countries mapped.
          </motion.p>

          {/* Trust pills */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.22 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {[
              ['🏆', 'Henley Index 2026 Data'],
              ['🌍', '197 Countries'],
              ['⚡', 'Instant Results'],
            ].map(([icon, label]) => (
              <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-600 shadow-sm">
                {icon} {label}
              </span>
            ))}
          </motion.div>

          {/* Hero Card */}
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.28 }}
            className="mx-auto mt-8 max-w-lg rounded-3xl bg-white shadow-2xl shadow-gray-300/60 border border-gray-100 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Select your passport country</p>
            <CountrySelect
              value={passport}
              onChange={setPassport}
              placeholder={geoLoading ? '🌍 Detecting location…' : 'Choose your passport country…'}
              variant="light"
            />
            <button
              onClick={() => passport && fetchData(passport)}
              disabled={!passport || loading}
              className="mt-4 w-full rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-500/30 hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? '🔄 Loading map…' : `Show My World Map ${passport ? flag : '→'}`}
            </button>

            {/* Mini stats pills */}
            <AnimatePresence>
              {data && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  {[
                    ['🟢', `${data.stats.free_count} Visa-Free`, 'text-emerald-600 bg-emerald-50 border-emerald-200'],
                    ['🟡', `${data.stats.arrival_count} On Arrival`, 'text-amber-600 bg-amber-50 border-amber-200'],
                    ['🔴', `${data.stats.required_count} Required`, 'text-rose-600 bg-rose-50 border-rose-200'],
                  ].map(([emoji, label, cls]) => (
                    <span key={label} className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${cls}`}>
                      {emoji} {label}
                    </span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            {error && <p className="mt-4 text-sm text-rose-500">{error}</p>}
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ── appears after selection */}
      <AnimatePresence>
        {data && (
          <section className="bg-white py-12 sm:py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-1">📊 Your Passport Power</p>
                <h2 className="text-2xl font-extrabold text-[#0f0c29]">{flag} {passport} — At a Glance</h2>
              </div>
              <StatsCards
                free={data.stats.free_count}
                arrival={data.stats.arrival_count}
                required={data.stats.required_count}
                total={data.stats.total}
                rank={rankInfo.rank}
              />
            </div>
          </section>
        )}
      </AnimatePresence>

      {/* ── INTERACTIVE WORLD MAP ── */}
      <section className="bg-[#060C18] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {passport && !loading && data ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="mb-6 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-1">🌍 Interactive Map</p>
                <h2 className="text-2xl font-extrabold text-[#0f0c29]">{flag} {passport} Passport — World Access</h2>
                <p className="text-sm text-gray-400 mt-1">Click any country for full visa details</p>
              </div>
              <WorldMap
                visaFree={visaFreeSet} onArrival={onArrivalSet} required={requiredSet}
                passport={passport} onCountryClick={handleCountryClick}
              />
              {/* Map Legend */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-gray-500">
                {[['#10B981', '🟢 Visa Free'], ['#F59E0B', '🟡 On Arrival'], ['#EF4444', '🔴 Visa Required'], ['#D1D5DB', '⚪ No Data']].map(([color, label]) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : !passport ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="text-7xl mb-5 opacity-20">🗺️</div>
              <p className="text-white/25 text-lg font-semibold">Select a passport above to see your world map</p>
            </div>
          ) : (
            <div className="flex items-center justify-center py-32">
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white/5 px-8 py-5">
                <svg className="h-5 w-5 animate-spin text-teal-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm font-semibold text-teal-400">Loading visa data…</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── PASSPORT POWER RANKING CARD ── */}
      {data && passport && (
        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-1">🏆 Henley Index 2026</p>
              <h2 className="text-2xl font-extrabold text-[#0f0c29]">Passport Power Ranking</h2>
            </div>
            <PassportRankCard
              passport={passport}
              rankInfo={rankInfo}
              freeCount={data.stats.free_count}
              total={data.stats.total}
            />
          </div>
        </section>
      )}

      {/* ── TOP DESTINATIONS LIST ── */}
      {data && (
        <section className="bg-[#060C18] py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-1">✈️ Destination Guide</p>
              <h2 className="text-2xl font-extrabold text-[#0f0c29]">{passport} Travel Destinations</h2>
            </div>
            <CountryLists
              passport={passport}
              visaFree={data.visa_free}
              onArrival={data.on_arrival}
              required={data.required}
            />
            {/* Link to passport strength */}
            <div className="mt-8 text-center">
              <Link href="/passport-strength"
                className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-5 py-2.5 text-sm font-semibold text-teal-400 hover:bg-teal-500/20 transition">
                💪 Check Full Passport Strength Score →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── VIRAL SHARE CARD ── */}
      {data && (
        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1">📤 Share Your Power</p>
              <h2 className="text-2xl font-extrabold text-[#0f0c29]">Flex Your Passport</h2>
            </div>
            <ShareCard
              passport={passport}
              free={data.stats.free_count}
              arrival={data.stats.arrival_count}
              required={data.stats.required_count}
              total={data.stats.total}
              coverage={data.stats.coverage_percent}
              rank={rankInfo.rank}
            />
          </div>
        </section>
      )}

      {/* ── TIPS TO IMPROVE ── */}
      {data && passport && (
        <section className="bg-[#060C18] py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <TipsCard passport={passport} rank={rankInfo.rank} />
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}{/* Spinning globe CSS keyframes */}
      <style>{`
        @keyframes spin-globe {
          0%   { transform: rotate(0deg) scale(1); }
          25%  { transform: rotate(10deg) scale(1.05); }
          50%  { transform: rotate(0deg) scale(1); }
          75%  { transform: rotate(-10deg) scale(1.05); }
          100% { transform: rotate(0deg) scale(1); }
        }
      `}</style>
    </div>
  )
}
