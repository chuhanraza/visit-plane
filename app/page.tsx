'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { motion, useInView, AnimatePresence, type Variants } from 'framer-motion'
import { useRef } from 'react'
import { useUserCountry } from '@/hooks/useUserCountry'
import { useTranslations } from 'next-intl'
import CountrySelect from '@/components/CountrySelect'
import InstallButton from '@/components/InstallButton'
import DestinationImage from '@/components/DestinationImage'
import VisaFreeSection from '@/components/home/VisaFreeSection'
import DifferenceSection from '@/components/home/DifferenceSection'
import VisaDataPromo from '@/components/home/VisaDataPromo'
import RotatingWord from '@/components/home/RotatingWord'
import { getAuthor } from '@/lib/data/authors'

// ─── Supabase ─────────────────────────────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

function nameToSlug(name: string) { return encodeURIComponent(name) }

const EDITOR = getAuthor()

// ─── Static data ──────────────────────────────────────────────────────────────
// Curated, hand-verified for a default (Pakistani) passport perspective — the
// default link target when geo is unknown. Photos resolved centrally via
// <DestinationImage> (verified map + branded fallback), so no fragile per-card URLs.
const POPULAR_DESTINATIONS = [
  { slug: 'UAE',            name: 'UAE',            flag: '🇦🇪', visa: 'eVisa',         tagline: 'City of Gold' },
  { slug: 'Turkey',         name: 'Turkey',         flag: '🇹🇷', visa: 'eVisa',         tagline: 'Where East Meets West' },
  { slug: 'Japan',          name: 'Japan',          flag: '🇯🇵', visa: 'Visa Required', tagline: 'Land of the Rising Sun' },
  { slug: 'United Kingdom', name: 'United Kingdom', flag: '🇬🇧', visa: 'Visa Required', tagline: 'Historic & Iconic' },
  { slug: 'Singapore',      name: 'Singapore',      flag: '🇸🇬', visa: 'Visa Required', tagline: 'The Lion City' },
  { slug: 'France',         name: 'France',         flag: '🇫🇷', visa: 'Visa Required', tagline: 'Art, Culture & Romance' },
]

const CONTINENT_DESTINATIONS: Record<string, { name: string; flag: string; visa: string }[]> = {
  'Asia': [
    { name: 'Japan', flag: '🇯🇵', visa: 'Visa Required' },
    { name: 'South Korea', flag: '🇰🇷', visa: 'Visa Required' },
    { name: 'Thailand', flag: '🇹🇭', visa: 'eVisa' },
    { name: 'Vietnam', flag: '🇻🇳', visa: 'eVisa' },
    { name: 'Indonesia', flag: '🇮🇩', visa: 'eVisa' },
    { name: 'India', flag: '🇮🇳', visa: 'eVisa' },
    { name: 'Singapore', flag: '🇸🇬', visa: 'Visa Required' },
    { name: 'Malaysia', flag: '🇲🇾', visa: 'Visa Free' },
  ],
  'Europe': [
    { name: 'France', flag: '🇫🇷', visa: 'Visa Required' },
    { name: 'Germany', flag: '🇩🇪', visa: 'Visa Required' },
    { name: 'Italy', flag: '🇮🇹', visa: 'Visa Required' },
    { name: 'Spain', flag: '🇪🇸', visa: 'Visa Required' },
    { name: 'Netherlands', flag: '🇳🇱', visa: 'Visa Required' },
    { name: 'Turkey', flag: '🇹🇷', visa: 'eVisa' },
    { name: 'Portugal', flag: '🇵🇹', visa: 'Visa Required' },
    { name: 'Greece', flag: '🇬🇷', visa: 'Visa Required' },
  ],
  'Americas': [
    { name: 'United States', flag: '🇺🇸', visa: 'Visa Required' },
    { name: 'Canada', flag: '🇨🇦', visa: 'Visa Required' },
    { name: 'Brazil', flag: '🇧🇷', visa: 'Visa Required' },
    { name: 'Mexico', flag: '🇲🇽', visa: 'Visa Free' },
    { name: 'Argentina', flag: '🇦🇷', visa: 'Visa Free' },
    { name: 'Colombia', flag: '🇨🇴', visa: 'Visa Free' },
    { name: 'Peru', flag: '🇵🇪', visa: 'Visa Free' },
    { name: 'Chile', flag: '🇨🇱', visa: 'Visa Free' },
  ],
  'Middle East': [
    { name: 'UAE', flag: '🇦🇪', visa: 'eVisa' },
    { name: 'Saudi Arabia', flag: '🇸🇦', visa: 'Visa Required' },
    { name: 'Qatar', flag: '🇶🇦', visa: 'eVisa' },
    { name: 'Oman', flag: '🇴🇲', visa: 'eVisa' },
    { name: 'Jordan', flag: '🇯🇴', visa: 'Visa on Arrival' },
    { name: 'Bahrain', flag: '🇧🇭', visa: 'eVisa' },
    { name: 'Kuwait', flag: '🇰🇼', visa: 'Visa Required' },
    { name: 'Egypt', flag: '🇪🇬', visa: 'eVisa' },
  ],
  'Africa': [
    { name: 'Morocco', flag: '🇲🇦', visa: 'Visa Free' },
    { name: 'Kenya', flag: '🇰🇪', visa: 'eVisa' },
    { name: 'South Africa', flag: '🇿🇦', visa: 'Visa Free' },
    { name: 'Tanzania', flag: '🇹🇿', visa: 'eVisa' },
    { name: 'Ghana', flag: '🇬🇭', visa: 'Visa Required' },
    { name: 'Nigeria', flag: '🇳🇬', visa: 'Visa Required' },
    { name: 'Ethiopia', flag: '🇪🇹', visa: 'eVisa' },
    { name: 'Rwanda', flag: '🇷🇼', visa: 'Visa Free' },
  ],
  'Oceania': [
    { name: 'Australia', flag: '🇦🇺', visa: 'eVisa' },
    { name: 'New Zealand', flag: '🇳🇿', visa: 'eVisa' },
    { name: 'Fiji', flag: '🇫🇯', visa: 'Visa Free' },
    { name: 'Samoa', flag: '🇼🇸', visa: 'Visa Free' },
    { name: 'Tonga', flag: '🇹🇴', visa: 'Visa Free' },
    { name: 'Vanuatu', flag: '🇻🇺', visa: 'Visa Free' },
    { name: 'Papua New Guinea', flag: '🇵🇬', visa: 'Visa on Arrival' },
    { name: 'Palau', flag: '🇵🇼', visa: 'Visa Free' },
  ],
}

// Proven, in-depth guides — all indexed, canonical blog routes.
const PROVEN_ROUTES = [
  { emoji: '✈️', title: 'Flight Itinerary for a Visa', desc: 'How to get a verifiable flight reservation for your application — safely and cheaply.', href: '/blog/flight-itinerary-for-visa-complete-guide-2026', tag: 'Most read' },
  { emoji: '🇩🇪', title: 'Germany Job Seeker Visa', desc: 'Full requirements, eligibility and step-by-step process for the job-seeker route.', href: '/blog/germany-job-seeker-visa-complete-requirements', tag: 'Guide' },
  { emoji: '🇦🇪', title: 'Dubai Tourist Visa', desc: 'Complete tourist-visa guide: documents, costs, validity and how to apply.', href: '/blog/dubai-tourist-visa-complete-guide-indians', tag: 'Popular' },
  { emoji: '💰', title: 'Proof of Funds Explained', desc: 'How much money you need to show and how to document it for a visa application.', href: '/blog/proof-of-funds-visa-applications', tag: 'Essentials' },
  { emoji: '🎫', title: 'Dummy Ticket for Visa', desc: 'What a dummy ticket is, when it’s accepted, and how to get one without overpaying.', href: '/blog/dummy-ticket-for-visa-application', tag: 'Guide' },
  { emoji: '🛂', title: 'Flight Itinerary for Schengen', desc: 'Exactly what Schengen consulates expect for your onward/return travel proof.', href: '/blog/flight-itinerary-for-schengen-visa', tag: 'Schengen' },
]

// Working tools only — stubs (embassy-finder, cost-calculator) deliberately excluded.
const TOOLS = [
  { icon: '🤖', title: 'AI Visa Wizard', desc: 'Personalised visa guidance for any passport + destination.', href: '/wizard', highlight: true },
  { icon: '🗺️', title: 'Visa-Free World Map', desc: 'See every country your passport unlocks on an interactive map.', href: '/visa-free-map', highlight: false },
  { icon: '💪', title: 'Passport Strength', desc: 'Score your passport out of 100 and see its global rank.', href: '/passport-strength', highlight: false },
  { icon: '⚖️', title: 'Compare Visas', desc: 'Compare requirements side-by-side across destinations.', href: '/compare', highlight: false },
  { icon: '📋', title: 'Document Checklist', desc: 'Know exactly which documents you need before applying.', href: '/checklist', highlight: false },
  { icon: '✅', title: 'Approval Checker', desc: 'Estimate your approval odds and spot weak points first.', href: '/visa-checker', highlight: false },
  { icon: '⏱️', title: 'Processing Times', desc: 'Check how long a visa takes for any country pair.', href: '/processing-times', highlight: false },
  { icon: '💱', title: 'Currency Converter', desc: 'Convert fees and budget in your home currency.', href: '/currency-converter', highlight: false },
]

const VISA_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  'Visa Free':       { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'eVisa':           { bg: 'bg-amber-500/15',   text: 'text-amber-400',   dot: 'bg-amber-400'   },
  'Visa Required':   { bg: 'bg-rose-500/15',    text: 'text-rose-400',    dot: 'bg-rose-400'    },
  'Visa on Arrival': { bg: 'bg-blue-500/15',    text: 'text-blue-400',    dot: 'bg-blue-400'    },
}

// Light pill (for the white card body) + a clean, honest label per visa status.
const VISA_PILL: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  'Visa Free':       { label: 'Visa-free',        bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'eVisa':           { label: 'e-Visa',           bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  'Visa Required':   { label: 'Visa required',    bg: 'bg-rose-50',    text: 'text-rose-700',    dot: 'bg-rose-500'    },
  'Visa on Arrival': { label: 'Visa on arrival',  bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500'    },
}

// ─── Smart popular pills by passport country ──────────────────────────────────
const POPULAR_PILLS: Record<string, { label: string; dest: string }[]> = {
  'Pakistan': [
    { label: '🇸🇦 Saudi Arabia', dest: 'Saudi Arabia' },
    { label: '🇦🇪 UAE',          dest: 'UAE' },
    { label: '🇹🇷 Turkey',       dest: 'Turkey' },
    { label: '🇬🇧 UK',           dest: 'United Kingdom' },
    { label: '🇺🇸 USA',          dest: 'United States' },
    { label: '🇨🇦 Canada',       dest: 'Canada' },
  ],
  'India': [
    { label: '🇦🇪 UAE',          dest: 'UAE' },
    { label: '🇺🇸 USA',          dest: 'United States' },
    { label: '🇨🇦 Canada',       dest: 'Canada' },
    { label: '🇬🇧 UK',           dest: 'United Kingdom' },
    { label: '🇦🇺 Australia',    dest: 'Australia' },
    { label: '🇩🇪 Germany',      dest: 'Germany' },
  ],
  'Nigeria': [
    { label: '🇬🇧 UK',           dest: 'United Kingdom' },
    { label: '🇺🇸 USA',          dest: 'United States' },
    { label: '🇨🇦 Canada',       dest: 'Canada' },
    { label: '🇦🇪 UAE',          dest: 'UAE' },
    { label: '🇿🇦 South Africa', dest: 'South Africa' },
    { label: '🇩🇪 Germany',      dest: 'Germany' },
  ],
  'Bangladesh': [
    { label: '🇸🇦 Saudi Arabia', dest: 'Saudi Arabia' },
    { label: '🇦🇪 UAE',          dest: 'UAE' },
    { label: '🇲🇾 Malaysia',     dest: 'Malaysia' },
    { label: '🇬🇧 UK',           dest: 'United Kingdom' },
    { label: '🇺🇸 USA',          dest: 'United States' },
    { label: '🇰🇷 South Korea',  dest: 'South Korea' },
  ],
  'United States': [
    { label: '🇬🇧 UK',           dest: 'United Kingdom' },
    { label: '🇨🇦 Canada',       dest: 'Canada' },
    { label: '🇲🇽 Mexico',       dest: 'Mexico' },
    { label: '🇫🇷 France',       dest: 'France' },
    { label: '🇯🇵 Japan',        dest: 'Japan' },
    { label: '🇮🇹 Italy',        dest: 'Italy' },
  ],
  'United Kingdom': [
    { label: '🇫🇷 France',       dest: 'France' },
    { label: '🇪🇸 Spain',        dest: 'Spain' },
    { label: '🇮🇹 Italy',        dest: 'Italy' },
    { label: '🇺🇸 USA',          dest: 'United States' },
    { label: '🇦🇺 Australia',    dest: 'Australia' },
    { label: '🇯🇵 Japan',        dest: 'Japan' },
  ],
}
const DEFAULT_PILLS = [
  { label: '🇺🇸 USA',    dest: 'United States' },
  { label: '🇬🇧 UK',     dest: 'United Kingdom' },
  { label: '🇦🇪 UAE',    dest: 'UAE' },
  { label: '🇨🇦 Canada', dest: 'Canada' },
  { label: '🇯🇵 Japan',  dest: 'Japan' },
  { label: '🇦🇺 Australia', dest: 'Australia' },
]

const SMART_DESTINATION: Record<string, string> = {
  'Pakistan':    'Saudi Arabia',
  'India':       'UAE',
  'Nigeria':     'United Kingdom',
  'Bangladesh':  'Malaysia',
  'Philippines': 'South Korea',
  'China':       'Japan',
  'Mexico':      'United States',
}

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className={className}>
      {children}
    </motion.div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function ArrowRight({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  )
}
function ShieldCheck({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" />
    </svg>
  )
}
function PlaneIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z" />
    </svg>
  )
}
function CheckIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
function CrossIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter()
  const t = useTranslations()

  const [passport, setPassport]         = useState('')
  const [destination, setDestination]   = useState('')
  const [destinations, setDestinations] = useState<string[]>([])
  const [loadingDests, setLoadingDests] = useState(false)
  const [activeContinent, setActiveContinent] = useState('Asia')
  const [geoBadgeDismissed, setGeoBadgeDismissed] = useState(false)
  const [geoApplied, setGeoApplied] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [emailConsent, setEmailConsent] = useState(false)

  const { countryName, loading: geoLoading } = useUserCountry()

  // Auto-set passport country from IP geo (hook has a 2s timeout, so this resolves fast).
  useEffect(() => {
    if (countryName && !geoLoading && !geoApplied) {
      setPassport(countryName)
      const smartDest = SMART_DESTINATION[countryName]
      if (smartDest) setDestination(smartDest)
      setGeoApplied(true)
    }
  }, [countryName, geoLoading, geoApplied])

  useEffect(() => {
    if (!passport) { setDestinations([]); setDestination(''); return }
    setLoadingDests(true)
    setDestination('')
    getSupabase()
      .from('destinations')
      .select('country_name')
      .eq('passport_country', passport)
      .order('country_name')
      .then(({ data }) => {
        if (data) {
          const unique = [...new Set(data.map((r) => r.country_name))].sort()
          setDestinations(unique)
        }
        setLoadingDests(false)
      })
  }, [passport])

  const [redirecting, setRedirecting] = useState(false)
  const [noPassportError, setNoPassportError] = useState(false)

  const canSubmit = passport && destination && passport !== destination
  const handleCheck = () => {
    if (!canSubmit) return
    router.push(`/visa/${nameToSlug(passport)}/${nameToSlug(destination)}`)
  }

  const handleDestinationChange = (dest: string) => {
    if (!dest) return
    if (!passport) { setNoPassportError(true); return }
    setDestination(dest)
    setNoPassportError(false)
    setRedirecting(true)
    setTimeout(() => {
      router.push(`/visa/${nameToSlug(passport)}/${nameToSlug(dest)}`)
    }, 300)
  }

  const handlePillClick = (dest: string) => {
    if (!passport) { setNoPassportError(true); return }
    setNoPassportError(false)
    setRedirecting(true)
    router.push(`/visa/${nameToSlug(passport)}/${nameToSlug(dest)}`)
  }
  const continents = Object.keys(CONTINENT_DESTINATIONS)
  const linkPassport = countryName || 'Pakistan'

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput || !emailInput.includes('@') || !emailConsent) return
    setEmailStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.trim().toLowerCase(),
          passport: passport || null,
          destination: destination || null,
          captured_from: 'hero',
          consent: emailConsent,
        }),
      })
      if (!res.ok) throw new Error('non-ok')
      setEmailStatus('success')
      setEmailInput('')
    } catch {
      setEmailStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0F1419] antialiased overflow-x-hidden">

      {/* ────────────────────── 1. HERO ──────────────────────────── */}
      {/* No overflow-hidden on the section itself — it would clip the open country
          dropdown. The decorative background below is clipped by its own
          overflow-hidden wrapper, so it stays contained regardless. */}
      <section className="relative pb-0" style={{ paddingTop: '24px', background: '#FFFFFF' }}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {/* iVisa-style soft green glow weighted to the right */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 95% at 100% 35%, #CFF5DD 0%, #E8FBF0 30%, transparent 62%)' }} />
          {/* faint cool tint in the lower-left */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(80% 75% at 0% 100%, #E7F3FB 0%, transparent 55%)' }} />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          {/* Small, smart trust badge — top-right, not centered */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex justify-end" style={{ marginBottom: '16px' }}>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <CheckIcon className="h-3 w-3 text-emerald-500" />
              Official-source verified
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.08 }} className="font-extrabold leading-[1.06]" style={{ fontSize: 'clamp(40px, 5vw, 64px)', color: '#0F1419', letterSpacing: '-0.02em' }}>
            The{' '}
            <RotatingWord />{' '}
            way
            <br />
            to check your travel visa
          </motion.h1>

          {/* Search card */}
          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.24 }} className="mx-auto max-w-3xl" style={{ marginTop: '28px' }}>
            <div aria-live="polite" className="sr-only">
              {redirecting && 'Loading visa information, redirecting now.'}
              {noPassportError && 'Please select your passport country first.'}
            </div>

            <div className="rounded-2xl p-3" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 4px 24px rgba(15, 20, 25, 0.06)' }}>
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <CountrySelect
                  variant="light"
                  value={passport}
                  onChange={(v) => {
                    setPassport(v)
                    setGeoBadgeDismissed(true)
                    setNoPassportError(false)
                    try { if (v) localStorage.setItem('visitplane_passport', v) } catch {}
                  }}
                  placeholder={geoLoading ? '🌍 Detecting...' : t('hero.selectPassport')}
                  label={t('hero.passportLabel')}
                />

                <CountrySelect
                  variant="light"
                  value={destination}
                  onChange={handleDestinationChange}
                  placeholder={
                    !passport               ? t('hero.selectDestination') :
                    loadingDests            ? 'Loading…'                  :
                    destinations.length === 0 ? 'No destinations'         :
                                              'Traveling to...'
                  }
                  label={t('hero.destinationLabel')}
                  options={destinations.length > 0 ? destinations : undefined}
                  disabled={!passport || loadingDests}
                />

                <button
                  type="button"
                  onClick={handleCheck}
                  disabled={!canSubmit}
                  className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#16C95C] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#12B350] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <PlaneIcon className="h-4 w-4" />
                  {t('hero.checkButton')}
                </button>
              </div>

              {noPassportError && (
                <p className="mt-2 text-center text-xs font-semibold text-amber-600">Please select your passport first.</p>
              )}
              {redirecting && (
                <p className="mt-2 text-center text-xs font-semibold text-emerald-600 animate-pulse">Loading visa info...</p>
              )}
              {passport && destination && passport === destination && (
                <p className="mt-2 text-center text-xs text-amber-600">Please choose a different destination from your passport country.</p>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex justify-center empty:hidden [&:has(>*)]:mt-4">
            <InstallButton />
          </motion.div>

        </div>

        <div className="mt-3 h-3" style={{ background: 'linear-gradient(to bottom, transparent, #FFFFFF)' }} />
      </section>

      {/* ────────────────────── 2. THE DIFFERENCE (problem → solution) ───────────── */}
      <DifferenceSection />

      {/* ── Visa Data & Research promo (fills former dead whitespace) ───────────── */}
      <VisaDataPromo />

      {/* ────────────────────── 3. POPULAR DESTINATIONS ──────────── */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-500">🔥 Trending now</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Popular Destinations</h2>
                <p className="mt-2 max-w-md text-sm text-gray-500">Countries travelers check the most. Tap any card for a full visa breakdown.</p>
              </div>
              <Link href="/destinations" className="group inline-flex items-center gap-1.5 text-sm text-gray-400 transition hover:text-emerald-500">
                View all <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {POPULAR_DESTINATIONS.map((d, i) => {
                const pill = VISA_PILL[d.visa] ?? VISA_PILL['Visa Required']
                return (
                  <motion.div key={d.slug} variants={fadeUp} transition={{ delay: i * 0.06 }}>
                    <Link
                      href={`/visa/${nameToSlug(linkPassport)}/${nameToSlug(d.slug)}`}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10"
                    >
                      {/* Image with flag + country name overlay */}
                      <div className="relative h-44 overflow-hidden">
                        <DestinationImage name={d.name} flag={d.flag} className="transition duration-500 group-hover:scale-105" />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2">
                          <span className="text-2xl drop-shadow-md">{d.flag}</span>
                          <span className="text-lg font-extrabold tracking-tight text-white drop-shadow-md">{d.name}</span>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="flex flex-1 flex-col gap-3 p-5">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${pill.bg} ${pill.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${pill.dot}`} />
                            {pill.label}
                          </span>
                          <span className="truncate text-xs text-gray-400">{d.tagline}</span>
                        </div>

                        {/* Honest trust line — VisitPlane is free info, never a paid/guaranteed service */}
                        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-[13px] font-semibold text-emerald-700">
                          <ShieldCheck className="h-4 w-4 shrink-0" />
                          Free official-source checklist
                        </div>

                        {/* CTA — opens the full visa breakdown (no payment, no application) */}
                        <span className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-4 py-3 text-sm font-semibold text-white transition group-hover:bg-emerald-600">
                          View requirements
                          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ────────────────────── 5. NO VISA REQUIRED ──────────────── */}
      {/* Self-contained: IP-default passport + manual switcher + accuracy-guarded
          reliable visa-free list + auto/manual cinematic carousel. */}
      <VisaFreeSection />

      {/* ────────────────────── 6. PROVEN ROUTES / GUIDES ────────── */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="mb-12 text-center">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-emerald-500">📚 In-depth guides</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Popular Visa Guides</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-gray-500">Detailed, official-source-checked walkthroughs for the questions travelers ask most.</p>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PROVEN_ROUTES.map((r, i) => (
                <motion.div key={r.href} variants={fadeUp} transition={{ delay: i * 0.06 }}>
                  <Link href={r.href} className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-xl">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-2xl">{r.emoji}</span>
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600">{r.tag}</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">{r.title}</h3>
                    <p className="mt-1.5 flex-1 text-xs leading-relaxed text-gray-500">{r.desc}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 group-hover:gap-2 transition-all">
                      Read guide <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
            <motion.div variants={fadeUp} className="mt-8 text-center">
              <Link href="/blog" className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-500 transition hover:border-emerald-500/40 hover:text-gray-900 hover:bg-emerald-500/5">
                Browse all guides <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ────────────────────── 7. FREE TOOLS ────────────────────── */}
      <section className="bg-gray-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="mb-12 text-center">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-emerald-500">🛠️ Free tools</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Everything you need to plan</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-gray-500">Free, no-signup tools to research, compare and prepare your application.</p>
            </motion.div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {TOOLS.map((tool, i) => (
                <motion.div key={tool.title} variants={fadeUp} transition={{ delay: i * 0.06 }}>
                  <Link href={tool.href} className={`group flex h-full flex-col rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:shadow-xl ${tool.highlight ? 'border-teal-500/30 bg-gradient-to-br from-teal-50 to-emerald-50 hover:border-teal-500/50' : 'border-gray-200 bg-white hover:border-emerald-500/30'}`}>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-3xl">{tool.icon}</span>
                      {tool.highlight && <span className="rounded-full bg-teal-500/15 px-2 py-0.5 text-[10px] font-bold text-teal-600">AI</span>}
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">{tool.title}</h3>
                    <p className="mt-1 flex-1 text-xs leading-relaxed text-gray-500">{tool.desc}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 group-hover:gap-2 transition-all">
                      Open <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ────────────────────── 8. TRUST / WHY VISITPLANE ────────── */}
      <section className="bg-white py-20 sm:py-24 border-y border-gray-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="mb-12 text-center">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-emerald-500">Why VisitPlane</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Information you can actually trust</h2>
            </motion.div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: '🌍', title: '197 countries covered', desc: 'Every passport and destination in one free place.' },
                { icon: '🏛️', title: 'Official-source verified', desc: 'Checked against government immigration sites, embassy pages and the IATA Travel Centre.' },
                { icon: '🔓', title: '100% free, no signup', desc: 'No paywalls, no account, no spam. Just the information you came for.' },
                { icon: '📝', title: 'A real, named editor', desc: 'Edited and kept current by an accountable person — not an anonymous content farm.' },
              ].map((f, i) => (
                <motion.div key={f.title} variants={fadeUp} transition={{ delay: i * 0.08 }} className="rounded-2xl border border-gray-200 bg-white p-6">
                  <div className="mb-3 text-3xl">{f.icon}</div>
                  <h3 className="mb-1.5 text-sm font-bold text-gray-900">{f.title}</h3>
                  <p className="text-xs leading-relaxed text-gray-500">{f.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Editor card */}
            <motion.div variants={fadeUp} className="mt-8 flex flex-col items-center gap-5 rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-7 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xl font-black text-white">
                {EDITOR.initials}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="text-sm font-bold text-gray-900">{EDITOR.name}</div>
                <div className="text-xs font-semibold text-emerald-600">{EDITOR.role}</div>
                <p className="mt-2 text-xs leading-relaxed text-gray-500">{EDITOR.bio}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <Link href={`/authors/${EDITOR.slug}`} className="inline-flex items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:border-emerald-500/40 hover:text-emerald-600">
                  Meet the editor <ArrowRight className="h-3 w-3" />
                </Link>
                <Link href="/editorial-standards" className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-gray-500 transition hover:text-emerald-600">
                  Editorial standards →
                </Link>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ────────────────────── 9. EMAIL CAPTURE ─────────────────── */}
      <section className="bg-[#FAFAFA] py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm text-center">
            <h3 className="text-lg font-bold text-gray-900">Get a free visa-document checklist</h3>
            <p className="mt-2 text-sm text-gray-500">Join our list and we&apos;ll send the essential document checklist, plus alerts when visa rules change for your route.</p>
            {emailStatus === 'success' ? (
              <div className="mt-5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-4 text-center">
                <p className="text-sm font-bold text-emerald-700">✓ Check your email to confirm</p>
                <p className="mt-1 text-xs text-emerald-600">We sent a confirmation link. Click it to activate your alerts.</p>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="mt-5 flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-teal-400 focus:bg-white transition placeholder-gray-400"
                  />
                  <button type="submit" disabled={emailStatus === 'loading' || !emailConsent} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-teal-600 disabled:opacity-60 transition whitespace-nowrap">
                    {emailStatus === 'loading' ? 'Saving…' : 'Get the checklist →'}
                  </button>
                </div>
                <label className="flex cursor-pointer items-start gap-2 text-xs text-gray-500">
                  <input type="checkbox" checked={emailConsent} onChange={(e) => setEmailConsent(e.target.checked)} className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-teal-500" />
                  I agree to receive the checklist and email alerts about visa rule changes. Unsubscribe anytime.
                </label>
              </form>
            )}
            {emailStatus === 'error' && <p className="mt-2 text-xs text-rose-500">Something went wrong. Please try again.</p>}
            <p className="mt-3 text-xs text-gray-400">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      {/* ────────────────────── ALL DESTINATIONS (SEO) ───────────── */}
      <section className="bg-white py-20 sm:py-24 border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="mb-10 text-center">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-emerald-500">🌏 Explore</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">All Destinations</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-gray-500">Browse by continent. Click any country for full visa details.</p>
            </motion.div>

            <motion.div variants={fadeUp} className="mb-8 flex flex-wrap justify-center gap-2">
              {continents.map((c) => (
                <button key={c} onClick={() => setActiveContinent(c)} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${activeContinent === c ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'border border-gray-200 bg-white text-gray-500 hover:border-emerald-500/40 hover:text-gray-900'}`}>
                  {c}
                </button>
              ))}
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div key={activeContinent} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.28 }} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {CONTINENT_DESTINATIONS[activeContinent].map((d) => {
                  const vs = VISA_COLORS[d.visa] ?? VISA_COLORS['Visa Required']
                  return (
                    <Link key={d.name} href={`/visa/${nameToSlug(linkPassport)}/${nameToSlug(d.name)}`} className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 transition-all hover:border-emerald-500/40 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-md">
                      <span className="shrink-0 text-2xl">{d.flag}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-gray-900">{d.name}</div>
                        <div className={`mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold ${vs.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${vs.dot}`} />
                          {d.visa}
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-300 transition group-hover:text-emerald-500" />
                    </Link>
                  )
                })}
              </motion.div>
            </AnimatePresence>

            <motion.div variants={fadeUp} className="mt-8 text-center">
              <Link href="/destinations" className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-500 transition hover:border-emerald-500/40 hover:text-gray-900 hover:bg-emerald-500/5">
                Browse all 197 destinations <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ────────────────────── FINAL CTA ────────────────────────── */}
      <section className="bg-[#FAFAFA] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-10 text-center sm:p-16">
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/6" />
              <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-white/6" />
              <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
              <div className="relative">
                <div className="mb-4 text-4xl">✈️</div>
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Check your visa requirements now</h2>
                <p className="mx-auto mt-4 max-w-md text-sm text-white/70">197 countries. Official-source verified. Always free, no sign-up needed.</p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link href="/destinations" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-emerald-700 shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl">
                    Check Visa Requirements <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/blog" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/12 px-7 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20">
                    Read Travel Guides
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

    </div>
  )
}
