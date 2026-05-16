'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { motion, useInView, AnimatePresence, type Variants } from 'framer-motion'
import DisclaimerBanner from './components/DisclaimerBanner'

// ─── Supabase ─────────────────────────────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// ─── Passport countries ───────────────────────────────────────────────────────
const PASSPORT_COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda',
  'Argentina','Armenia','Australia','Austria','Azerbaijan','Bahamas','Bahrain',
  'Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia',
  'Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso',
  'Burundi','Cambodia','Cameroon','Canada','Cape Verde','Central African Republic',
  'Chad','Chile','China','Colombia','Comoros','Costa Rica','Croatia','Cuba',
  'Cyprus','Czech Republic','Democratic Republic of the Congo','Denmark','Djibouti',
  'Dominica','Dominican Republic','Ecuador','Egypt','El Salvador',
  'Equatorial Guinea','Eritrea','Estonia','Ethiopia','Fiji','Finland','France',
  'Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada','Guatemala',
  'Guinea','Guinea-Bissau','Guyana','Haiti','Honduras','Hong Kong','Hungary',
  'Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy',
  'Ivory Coast','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati',
  'Kosovo','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia',
  'Libya','Liechtenstein','Lithuania','Luxembourg','Madagascar','Malawi',
  'Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania','Mauritius',
  'Mexico','Micronesia','Moldova','Monaco','Mongolia','Montenegro','Morocco',
  'Mozambique','Myanmar','Namibia','Nauru','Nepal','Netherlands','New Zealand',
  'Nicaragua','Niger','Nigeria','North Korea','North Macedonia','Norway','Oman',
  'Pakistan','Palau','Palestine','Panama','Papua New Guinea','Paraguay','Peru',
  'Philippines','Poland','Portugal','Qatar','Republic of the Congo','Romania',
  'Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia',
  'Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe',
  'Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore',
  'Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Korea',
  'South Sudan','Spain','Sri Lanka','Sudan','Suriname','Swaziland','Sweden',
  'Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand','Timor-Leste',
  'Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu',
  'UAE','Uganda','Ukraine','United Kingdom','United States','Uruguay','Uzbekistan',
  'Vanuatu','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
].sort()

function nameToSlug(name: string) { return encodeURIComponent(name) }

// ─── Static data ──────────────────────────────────────────────────────────────
const POPULAR_DESTINATIONS = [
  {
    slug: 'UAE', name: 'UAE', flag: '🇦🇪',
    visa: 'eVisa', visaColor: 'amber',
    photo: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
    tagline: 'City of Gold',
  },
  {
    slug: 'Turkey', name: 'Turkey', flag: '🇹🇷',
    visa: 'eVisa', visaColor: 'amber',
    photo: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=600&q=80',
    tagline: 'Where East Meets West',
  },
  {
    slug: 'Japan', name: 'Japan', flag: '🇯🇵',
    visa: 'Visa Required', visaColor: 'rose',
    photo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80',
    tagline: 'Land of the Rising Sun',
  },
  {
    slug: 'United Kingdom', name: 'United Kingdom', flag: '🇬🇧',
    visa: 'Visa Required', visaColor: 'rose',
    photo: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=600&q=80',
    tagline: 'Historic & Iconic',
  },
  {
    slug: 'Singapore', name: 'Singapore', flag: '🇸🇬',
    visa: 'Visa Free', visaColor: 'emerald',
    photo: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80',
    tagline: 'The Lion City',
  },
  {
    slug: 'France', name: 'France', flag: '🇫🇷',
    visa: 'Visa Required', visaColor: 'rose',
    photo: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80',
    tagline: 'Art, Culture & Romance',
  },
]

const NO_VISA_DESTINATIONS = [
  { name: 'Maldives', flag: '🇲🇻', photo: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=400&q=80', days: '30 days' },
  { name: 'Thailand', flag: '🇹🇭', photo: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80', days: '30 days' },
  { name: 'Malaysia', flag: '🇲🇾', photo: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&q=80', days: '30 days' },
  { name: 'Nepal', flag: '🇳🇵', photo: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&q=80', days: '90 days' },
  { name: 'Sri Lanka', flag: '🇱🇰', photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', days: '30 days' },
  { name: 'Cambodia', flag: '🇰🇭', photo: 'https://images.unsplash.com/photo-1508159452718-d22f6734a236?w=400&q=80', days: '30 days' },
]

const CONTINENT_DESTINATIONS: Record<string, { name: string; flag: string; visa: string }[]> = {
  'Asia': [
    { name: 'Japan', flag: '🇯🇵', visa: 'Visa Required' },
    { name: 'South Korea', flag: '🇰🇷', visa: 'Visa Required' },
    { name: 'Thailand', flag: '🇹🇭', visa: 'Visa Free' },
    { name: 'Vietnam', flag: '🇻🇳', visa: 'eVisa' },
    { name: 'Indonesia', flag: '🇮🇩', visa: 'Visa Free' },
    { name: 'India', flag: '🇮🇳', visa: 'eVisa' },
    { name: 'Singapore', flag: '🇸🇬', visa: 'Visa Free' },
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
    { name: 'Saudi Arabia', flag: '🇸🇦', visa: 'eVisa' },
    { name: 'Qatar', flag: '🇶🇦', visa: 'Visa Free' },
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

const MEDIA_LOGOS = [
  'TechCrunch', 'Forbes', 'Bloomberg', 'WIRED', 'Reuters',
  'The Guardian', 'BBC Travel', 'CNN Travel', 'Lonely Planet',
]

const STATS = [
  { value: '200+', label: 'Destinations', icon: '🌍' },
  { value: '99.2%', label: 'Accuracy Rate', icon: '✅' },
  { value: '100K+', label: 'Travelers Helped', icon: '✈️' },
  { value: '24/7', label: 'Support', icon: '🛟' },
]

const FEATURES = [
  {
    icon: '⚡',
    title: 'Instant Visa Check',
    desc: 'Get real-time visa requirements in seconds. No waiting, no confusion — just clear answers.',
    gradient: 'from-yellow-500/20 to-orange-500/20',
    border: 'border-yellow-500/20',
  },
  {
    icon: '📋',
    title: 'Document Checklist',
    desc: 'Know exactly what to pack. We list every document you need for a smooth visa application.',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/20',
  },
  {
    icon: '🌐',
    title: 'Global Coverage',
    desc: "Over 200 countries covered. Whether you're heading to Tokyo or Timbuktu, we've got you.",
    gradient: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/20',
  },
  {
    icon: '🔄',
    title: 'Always Updated',
    desc: 'Visa rules change. Our database is refreshed daily to ensure you have the latest info.',
    gradient: 'from-purple-500/20 to-violet-500/20',
    border: 'border-purple-500/20',
  },
  {
    icon: '🎁',
    title: 'Free Forever',
    desc: 'No paywalls. No subscriptions. Just free, accurate visa data for every traveler.',
    gradient: 'from-pink-500/20 to-rose-500/20',
    border: 'border-pink-500/20',
  },
  {
    icon: '🛡️',
    title: 'Trusted Data',
    desc: 'Sourced from official embassies and consulates worldwide. Verified and cross-checked.',
    gradient: 'from-indigo-500/20 to-blue-500/20',
    border: 'border-indigo-500/20',
  },
]

const TESTIMONIALS = [
  {
    name: 'Sarah Al-Rashidi',
    role: 'Frequent Traveler · UAE',
    avatar: 'SA',
    rating: 5,
    text: 'VisitPlane saved my Dubai trip. I had no idea I needed an eVisa before flying. Got the requirements in seconds and applied same day. Game changer!',
  },
  {
    name: 'Ravi Patel',
    role: 'Digital Nomad · India',
    avatar: 'RP',
    rating: 5,
    text: 'I travel every month for work. VisitPlane is the first thing I open when planning a trip. The visa info is always spot-on and super detailed.',
  },
  {
    name: 'Amara Okonkwo',
    role: 'Travel Blogger · Nigeria',
    avatar: 'AO',
    rating: 5,
    text: 'As an African passport holder, visa info can be a nightmare to find. VisitPlane changed that completely. Clear, accurate, and always free.',
  },
]

const VISA_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  'Visa Free':       { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'eVisa':           { bg: 'bg-amber-500/15',   text: 'text-amber-400',   dot: 'bg-amber-400'   },
  'Visa Required':   { bg: 'bg-rose-500/15',    text: 'text-rose-400',    dot: 'bg-rose-400'    },
  'Visa on Arrival': { bg: 'bg-blue-500/15',    text: 'text-blue-400',    dot: 'bg-blue-400'    },
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

// ─── Animated section wrapper ─────────────────────────────────────────────────
function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
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
function ChevronDown({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
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
function MenuIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  )
}
function XIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
function StarIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

// ─── Select field ─────────────────────────────────────────────────────────────
function SelectField({
  id, label, value, onChange, placeholder, options, disabled,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void
  placeholder: string; options: string[]; disabled: boolean
}) {
  return (
    <label
      htmlFor={id}
      className={`group relative block rounded-xl border p-3.5 transition-all ${
        disabled
          ? 'border-white/5 opacity-50 cursor-not-allowed'
          : 'border-white/10 hover:border-emerald-500/40 focus-within:border-emerald-500/60 bg-white/5'
      }`}
    >
      <span className="block text-[10px] font-semibold uppercase tracking-widest text-emerald-400">{label}</span>
      <div className="mt-1.5 flex items-center gap-2">
        <span className="text-lg leading-none">🌍</span>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none bg-transparent pr-6 text-sm font-medium text-white outline-none disabled:cursor-not-allowed"
          style={{ colorScheme: 'dark' }}
        >
          <option value="" className="bg-[#16122f] text-gray-400">{placeholder}</option>
          {options.map((name) => (
            <option key={name} value={name} className="bg-[#16122f] text-white">{name}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 transition group-focus-within:text-emerald-400" />
      </div>
    </label>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter()
  const [passport, setPassport]         = useState('')
  const [destination, setDestination]   = useState('')
  const [destinations, setDestinations] = useState<string[]>([])
  const [loadingDests, setLoadingDests] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [activeContinent, setActiveContinent] = useState('Asia')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

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

  const canSubmit = passport && destination && passport !== destination
  const handleCheck = () => {
    if (!canSubmit) return
    router.push(`/visa/${nameToSlug(passport)}/${nameToSlug(destination)}`)
  }
  const continents = Object.keys(CONTINENT_DESTINATIONS)

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white antialiased overflow-x-hidden">
      <DisclaimerBanner />

      {/* ────────────────────── NAVBAR ────────────────────────────── */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0f0c29]/95 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/30'
          : 'bg-transparent'
      }`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2.5 shrink-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-md group-hover:bg-emerald-500/30 transition" />
              <Image src="/logo-v2.png" alt="VisitPlane" width={36} height={36} className="relative rounded-xl" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-white">Visit</span>
              <span className="text-emerald-400">Plane</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/destinations" className="rounded-lg px-3 py-2 text-sm text-white/55 transition hover:bg-white/5 hover:text-white">
              Explore
            </Link>
            <Link href="/destinations" className="rounded-lg px-3 py-2 text-sm text-white/55 transition hover:bg-white/5 hover:text-white">
              Visa Requirements
            </Link>

            {/* Tools dropdown */}
            <div className="relative" onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
              <button
                onClick={() => setToolsOpen(!toolsOpen)}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-white/55 transition hover:bg-white/5 hover:text-white"
              >
                Tools
                <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {toolsOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-xl border border-white/10 bg-[#0f0c29]/98 backdrop-blur-xl shadow-2xl shadow-black/40 py-1.5 overflow-hidden">
                  {[
                    { label: '⚖️ Compare Visas',    href: '/compare' },
                    { label: '📋 Checklist',         href: '/checklist' },
                    { label: '⏱️ Processing Times',  href: '/processing-times' },
                    { label: '🛡️ Travel Insurance',  href: '/travel-insurance' },
                    { label: '🏛️ Embassy Finder',    href: '/embassy-finder' },
                    { label: '💰 Cost Calculator',   href: '/cost-calculator' },
                    { label: '💪 Passport Strength', href: '/passport-strength' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setToolsOpen(false)}
                      className="block px-4 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white transition"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/blog" className="rounded-lg px-3 py-2 text-sm text-white/55 transition hover:bg-white/5 hover:text-white">
              Blog
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/destinations"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600 hover:shadow-emerald-500/40 hover:-translate-y-px"
            >
              Check Visa <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-white/55 hover:bg-white/5 hover:text-white md:hidden transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-white/5 bg-[#060C18]/98 backdrop-blur-xl md:hidden overflow-hidden"
            >
              <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
                {[
                  { label: 'Explore',              href: '/destinations' },
                  { label: 'Visa Requirements',    href: '/destinations' },
                  { label: 'Blog',                 href: '/blog' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white transition"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-1 pb-0.5 px-3 text-xs font-semibold uppercase tracking-widest text-white/30">Tools</div>
                {[
                  { label: '⚖️ Compare Visas',    href: '/compare' },
                  { label: '📋 Checklist',         href: '/checklist' },
                  { label: '⏱️ Processing Times',  href: '/processing-times' },
                  { label: '🛡️ Travel Insurance',  href: '/travel-insurance' },
                  { label: '🏛️ Embassy Finder',    href: '/embassy-finder' },
                  { label: '💰 Cost Calculator',   href: '/cost-calculator' },
                  { label: '💪 Passport Strength', href: '/passport-strength' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white transition"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/destinations"
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Check Visa Requirements
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ────────────────────── HERO ──────────────────────────────── */}
      <section className="relative overflow-hidden pt-16 sm:pt-20 lg:pt-28 pb-0">
        {/* Glow blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[700px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.13),transparent_60%)]" />
          <div className="absolute -left-48 top-48 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.07),transparent_70%)]" />
          <div className="absolute -right-48 top-32 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.07),transparent_70%)]" />
        </div>
        {/* Grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400 backdrop-blur-sm">
              <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Trusted by 100,000+ travelers worldwide
              <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="text-5xl font-extrabold leading-[1.06] tracking-tight sm:text-6xl lg:text-[5rem]"
          >
            <span className="text-white">Your Passport.</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              The Whole World.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16 }}
            className="mx-auto mt-6 max-w-lg text-base text-white/45 sm:text-lg"
          >
            Instant visa requirements for 200+ countries. Know exactly what you need
            before you pack — free, fast, always updated.
          </motion.p>

          {/* Search card */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
            className="mx-auto mt-10 max-w-2xl"
          >
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-2 backdrop-blur-sm shadow-2xl shadow-black/50">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/8 via-transparent to-cyan-500/8 pointer-events-none" />
              <div className="relative rounded-xl bg-[#16122f] p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <SelectField
                    id="passport"
                    label="My Passport"
                    value={passport}
                    onChange={setPassport}
                    placeholder="Select your country"
                    options={PASSPORT_COUNTRIES}
                    disabled={false}
                  />
                  <SelectField
                    id="destination"
                    label="Traveling To"
                    value={destination}
                    onChange={setDestination}
                    placeholder={
                      !passport        ? 'Select passport first'  :
                      loadingDests     ? 'Loading…'              :
                      destinations.length === 0 ? 'No destinations' :
                                         'Select destination'
                    }
                    options={destinations}
                    disabled={!passport || loadingDests}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCheck}
                  disabled={!canSubmit}
                  className="group mt-3 flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 hover:from-emerald-600 hover:to-teal-600 disabled:from-white/8 disabled:to-white/5 disabled:text-white/25 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  <PlaneIcon className="h-4 w-4 group-enabled:group-hover:translate-x-0.5 transition" />
                  Check Visa Requirements
                </button>
                {passport && destination && passport === destination && (
                  <p className="mt-2 text-center text-xs text-amber-400">
                    Please choose a different destination from your passport country.
                  </p>
                )}
              </div>
            </div>

            {/* Quick picks */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-white/25">Popular:</span>
              {['UAE', 'Japan', 'UK', 'Canada', 'Schengen'].map((c) => (
                <button
                  key={c}
                  onClick={() => setDestination(c === 'UK' ? 'United Kingdom' : c === 'Schengen' ? 'France' : c)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/45 transition hover:border-emerald-500/40 hover:text-white hover:bg-emerald-500/10"
                >
                  {c}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="mt-20 h-24 bg-gradient-to-b from-transparent to-[#0f0c29]" />
      </section>

      {/* ────────────────────── STATS BAR ────────────────────────── */}
      <section className="border-y border-white/5 bg-[#13103a]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-white/5 sm:grid-cols-4">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex flex-col items-center justify-center px-4 py-5 text-center"
              >
                <div className="mb-1 text-2xl">{s.icon}</div>
                <div className="text-2xl font-extrabold text-white sm:text-3xl">{s.value}</div>
                <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/35">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────── MEDIA TICKER ─────────────────────── */}
      <section className="border-b border-white/5 bg-[#0f0c29] py-7 overflow-hidden">
        <div className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
          As featured in
        </div>
        <div className="relative">
          <div
            className="flex gap-14 whitespace-nowrap"
            style={{ animation: 'ticker 24s linear infinite' }}
          >
            {[...MEDIA_LOGOS, ...MEDIA_LOGOS, ...MEDIA_LOGOS].map((logo, i) => (
              <span
                key={i}
                className="shrink-0 text-sm font-bold uppercase tracking-widest text-white/18 hover:text-white/45 transition cursor-default"
              >
                {logo}
              </span>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0f0c29] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0f0c29] to-transparent" />
        </div>
      </section>

      {/* ────────────────────── POPULAR DESTINATIONS ─────────────── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">🔥 Trending Now</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Popular Destinations</h2>
                <p className="mt-2 max-w-md text-sm text-white/38">
                  Countries travelers check the most this week. Tap any card for a full visa breakdown.
                </p>
              </div>
              <Link href="/destinations" className="group inline-flex items-center gap-1.5 text-sm text-white/38 transition hover:text-emerald-400">
                View all <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {POPULAR_DESTINATIONS.map((d, i) => {
                const vs = VISA_COLORS[d.visa] ?? VISA_COLORS['Visa Required']
                return (
                  <motion.div key={d.slug} variants={fadeUp} transition={{ delay: i * 0.06 }}>
                    <Link
                      href={`/visa/${nameToSlug('United States')}/${nameToSlug(d.slug)}`}
                      className="group relative block overflow-hidden rounded-2xl border border-white/8 bg-[#16122f] transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/5"
                    >
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={d.photo}
                          alt={d.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0C1526] via-[#0C1526]/30 to-transparent" />
                        <span className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm ${vs.bg} ${vs.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${vs.dot}`} />
                          {d.visa}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{d.flag}</span>
                          <div className="flex-1">
                            <h3 className="font-bold text-white">{d.name}</h3>
                            <p className="text-xs text-white/35">{d.tagline}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-white/18 transition group-hover:text-emerald-400 group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ────────────────────── NO VISA REQUIRED ─────────────────── */}
      <section className="bg-[#13103a] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="mb-12 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400">
                <span>✈️</span> Visa-Free Travel
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">No Visa Required</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-white/38">
                These stunning destinations welcome you with zero visa hassle. Just book your flight and go.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {NO_VISA_DESTINATIONS.map((d, i) => (
                <motion.div key={d.name} variants={fadeUp} transition={{ delay: i * 0.07 }}>
                  <Link
                    href={`/visa/${nameToSlug('Pakistan')}/${nameToSlug(d.name)}`}
                    className="group relative block overflow-hidden rounded-2xl border border-white/8 bg-[#16122f] transition-all hover:-translate-y-1 hover:border-emerald-500/30"
                  >
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={d.photo}
                        alt={d.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0C1526] to-transparent" />
                    </div>
                    <div className="p-3 text-center">
                      <div className="text-xl">{d.flag}</div>
                      <div className="mt-1 text-xs font-bold text-white">{d.name}</div>
                      <div className="mt-0.5 text-[10px] font-semibold text-emerald-400">{d.days} free</div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ────────────────────── ALL DESTINATIONS ─────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="mb-10 text-center">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-emerald-400">🌏 Explore</p>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">All Destinations</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-white/38">
                Browse by continent. Click any country for full visa details.
              </p>
            </motion.div>

            {/* Continent tabs */}
            <motion.div variants={fadeUp} className="mb-8 flex flex-wrap justify-center gap-2">
              {continents.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveContinent(c)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                    activeContinent === c
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'border border-white/10 bg-white/5 text-white/45 hover:border-emerald-500/30 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeContinent}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28 }}
                className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
              >
                {CONTINENT_DESTINATIONS[activeContinent].map((d) => {
                  const vs = VISA_COLORS[d.visa] ?? VISA_COLORS['Visa Required']
                  return (
                    <Link
                      key={d.name}
                      href={`/visa/${nameToSlug('United States')}/${nameToSlug(d.name)}`}
                      className="group flex items-center gap-3 rounded-xl border border-white/8 bg-[#16122f] p-3.5 transition-all hover:border-emerald-500/28 hover:bg-[#0F1E35] hover:-translate-y-0.5"
                    >
                      <span className="shrink-0 text-2xl">{d.flag}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-white">{d.name}</div>
                        <div className={`mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold ${vs.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${vs.dot}`} />
                          {d.visa}
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-white/15 transition group-hover:text-emerald-400" />
                    </Link>
                  )
                })}
              </motion.div>
            </AnimatePresence>

            <motion.div variants={fadeUp} className="mt-8 text-center">
              <Link
                href="/destinations"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white/50 transition hover:border-emerald-500/40 hover:text-white hover:bg-emerald-500/10"
              >
                Browse all 200+ destinations <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ────────────────────── FEATURES ──────────────────────────── */}
      <section className="bg-[#13103a] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="mb-14 text-center">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-emerald-400">⚡ Why VisitPlane</p>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Everything You Need to Travel Smarter
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-white/38">
                Built by travelers, for travelers. VisitPlane gives you the tools to navigate global visa requirements with confidence.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  transition={{ delay: i * 0.08 }}
                  className={`group relative overflow-hidden rounded-2xl border ${f.border} p-6 transition-all hover:-translate-y-1 hover:shadow-xl`}
                  style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient}`} />
                  <div className="absolute inset-0 bg-[#16122f]/85" />
                  <div className="relative">
                    <div className="mb-4 text-3xl">{f.icon}</div>
                    <h3 className="mb-2 text-base font-bold text-white">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-white/48">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ────────────────────── TESTIMONIALS ──────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="mb-12 text-center">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-emerald-400">💬 Stories</p>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">What Travelers Say</h2>
              <p className="mt-3 text-sm text-white/38">Real experiences from real travelers around the world.</p>
            </motion.div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={t.name}
                  variants={fadeUp}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-[#16122f] p-6"
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} className="h-4 w-4 text-amber-400" />
                    ))}
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-white/55">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-xs font-bold text-white">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{t.name}</div>
                      <div className="text-xs text-white/32">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ────────────────────── CTA ───────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div
              variants={fadeUp}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-10 text-center sm:p-16"
            >
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/6" />
              <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-white/6" />
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                  backgroundSize: '56px 56px',
                }}
              />
              <div className="relative">
                <div className="mb-4 text-4xl">✈️</div>
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Ready to Explore the World?</h2>
                <p className="mx-auto mt-4 max-w-md text-sm text-white/70">
                  Check your visa requirements in seconds. 200+ countries. Always free. No sign-up needed.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/destinations"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-emerald-700 shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
                  >
                    Check Visa Requirements <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/12 px-7 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    Read Travel Guides
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ────────────────────── FOOTER ────────────────────────────── */}
      <footer className="border-t border-white/5 bg-[#0a0820] pb-8 pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
            {/* Brand col */}
            <div className="col-span-2 lg:col-span-2">
              <Link href="/" className="mb-4 inline-flex items-center gap-2.5">
                <Image src="/logo-v2.png" alt="VisitPlane" width={32} height={32} className="rounded-xl" />
                <span className="text-lg font-bold">
                  <span className="text-white">Visit</span>
                  <span className="text-emerald-400">Plane</span>
                </span>
              </Link>
              <p className="max-w-xs text-sm leading-relaxed text-white/30">
                The world&apos;s visa requirements, decoded in seconds. Free, fast, and always updated.
              </p>
              {/* App badges */}
              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <div className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 transition hover:bg-white/8">
                  <span className="text-xl">🍎</span>
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-white/35 leading-none">Download on the</div>
                    <div className="text-xs font-bold leading-tight text-white">App Store</div>
                  </div>
                </div>
                <div className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 transition hover:bg-white/8">
                  <span className="text-xl">▶️</span>
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-white/35 leading-none">Get it on</div>
                    <div className="text-xs font-bold leading-tight text-white">Google Play</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Link cols */}
            {[
              {
                title: 'Explore',
                links: ['Destinations', 'Visa Types', 'Travel Guides', 'Country Maps', 'Flight Deals'],
              },
              {
                title: 'Resources',
                links: ['Blog', 'Visa Calculator', 'Embassy Finder', 'Travel Insurance', 'FAQ'],
              },
              {
                title: 'Company',
                links: ['About', 'Privacy Policy', 'Terms of Service', 'Contact', 'Advertise'],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/40">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link
                        href={
                          link === 'Blog' ? '/blog' :
                          link === 'Privacy Policy' ? '/privacy' :
                          link === 'Terms of Service' ? '/terms' :
                          link === 'Contact' ? '/contact' :
                          link === 'Destinations' ? '/destinations' : '#'
                        }
                        className="text-sm text-white/30 transition hover:text-white"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-8 sm:flex-row">
            <p className="text-xs text-white/20">© {new Date().getFullYear()} VisitPlane. All rights reserved.</p>
            <p className="text-xs text-white/15">Visa data is estimated. Always verify with official embassy sources.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
