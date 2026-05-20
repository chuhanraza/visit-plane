'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { motion, useInView, AnimatePresence, type Variants } from 'framer-motion'
import { useUserCountry } from '@/hooks/useUserCountry'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/app/components/LanguageSwitcher'
import CountrySelect from '@/components/CountrySelect'

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

const STATS = [
  { value: '197', label: 'Countries Covered', icon: '🌍' },
  { value: '99.2%', label: 'Accuracy Rate', icon: '✅' },
  { value: '10,000+', label: 'Travelers Helped', icon: '✈️' },
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
    desc: "197 countries covered. Whether you're heading to Tokyo or Timbuktu, we've got you.",
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
    name: 'Verified User',
    role: 'Pakistan',
    rating: 5,
    text: 'Finally a visa website that actually tells me what I need without making me sign up first.',
  },
  {
    name: 'Verified User',
    role: 'India',
    rating: 5,
    text: 'The document checklist saved me from a rejected application. Every item was accurate.',
  },
  {
    name: 'Verified User',
    role: 'Nigeria',
    rating: 5,
    text: 'Checked UAE visa requirements in 10 seconds. No other site was this fast or clear.',
  },
]

const VISA_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  'Visa Free':       { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'eVisa':           { bg: 'bg-amber-500/15',   text: 'text-amber-400',   dot: 'bg-amber-400'   },
  'Visa Required':   { bg: 'bg-rose-500/15',    text: 'text-rose-400',    dot: 'bg-rose-400'    },
  'Visa on Arrival': { bg: 'bg-blue-500/15',    text: 'text-blue-400',    dot: 'bg-blue-400'    },
}

// ─── Smart popular pills by passport country ──────────────────────────────────
const POPULAR_PILLS: Record<string, { label: string; dest: string }[]> = {
  'Pakistan': [
    { label: '🇸🇦 Saudi Arabia', dest: 'Saudi Arabia' },
    { label: '🇦🇪 UAE',          dest: 'UAE' },
    { label: '🇹🇷 Turkey',       dest: 'Turkey' },
    { label: '🇬🇧 UK',           dest: 'United Kingdom' },
    { label: '🇺🇸 USA',          dest: 'United States' },
  ],
  'India': [
    { label: '🇦🇪 UAE',          dest: 'UAE' },
    { label: '🇺🇸 USA',          dest: 'United States' },
    { label: '🇨🇦 Canada',       dest: 'Canada' },
    { label: '🇬🇧 UK',           dest: 'United Kingdom' },
    { label: '🇦🇺 Australia',    dest: 'Australia' },
  ],
  'Nigeria': [
    { label: '🇬🇧 UK',           dest: 'United Kingdom' },
    { label: '🇺🇸 USA',          dest: 'United States' },
    { label: '🇨🇦 Canada',       dest: 'Canada' },
    { label: '🇿🇦 South Africa', dest: 'South Africa' },
    { label: '🇦🇪 UAE',          dest: 'UAE' },
  ],
  'United States': [
    { label: '🇬🇧 UK',           dest: 'United Kingdom' },
    { label: '🇨🇦 Canada',       dest: 'Canada' },
    { label: '🇲🇽 Mexico',       dest: 'Mexico' },
    { label: '🇫🇷 France',       dest: 'France' },
    { label: '🇯🇵 Japan',        dest: 'Japan' },
  ],
}
const DEFAULT_PILLS = [
  { label: '🇺🇸 USA',    dest: 'United States' },
  { label: '🇬🇧 UK',     dest: 'United Kingdom' },
  { label: '🇦🇪 UAE',    dest: 'UAE' },
  { label: '🇨🇦 Canada', dest: 'Canada' },
  { label: '🇯🇵 Japan',  dest: 'Japan' },
]

// Smart default destination by passport country
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
  const t = useTranslations()

  // Read locale from cookie for LanguageSwitcher
  const [currentLocale, setCurrentLocale] = useState('en')
  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]*)/)
    if (match) setCurrentLocale(match[1])
  }, [])

  const [passport, setPassport]         = useState('')
  const [destination, setDestination]   = useState('')
  const [destinations, setDestinations] = useState<string[]>([])
  const [loadingDests, setLoadingDests] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [activeContinent, setActiveContinent] = useState('Asia')
  const [scrolled, setScrolled] = useState(false)
  const [geoBadgeDismissed, setGeoBadgeDismissed] = useState(false)
  const [geoApplied, setGeoApplied] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const { countryName, countryCode, loading: geoLoading } = useUserCountry()

  // Auto-set passport country from IP geo
  useEffect(() => {
    if (countryName && !geoLoading && !geoApplied) {
      setPassport(countryName)
      // Also pre-select smart destination
      const smartDest = SMART_DESTINATION[countryName]
      if (smartDest) setDestination(smartDest)
      setGeoApplied(true)
    }
  }, [countryName, geoLoading, geoApplied])

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput || !emailInput.includes('@')) return
    setEmailStatus('loading')
    try {
      const { error } = await getSupabase()
        .from('waitlist')
        .insert([{ email: emailInput.trim().toLowerCase() }])
      if (error && error.code !== '23505') throw error // 23505 = duplicate
      setEmailStatus('success')
      setEmailInput('')
    } catch {
      setEmailStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white antialiased overflow-x-hidden">
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
              {t('nav.explore')}
            </Link>
            <Link href="/destinations" className="rounded-lg px-3 py-2 text-sm text-white/55 transition hover:bg-white/5 hover:text-white">
              {t('nav.visaRequirements')}
            </Link>

            {/* Tools dropdown */}
            <div className="relative" onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
              <button
                onClick={() => setToolsOpen(!toolsOpen)}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-white/55 transition hover:bg-white/5 hover:text-white"
              >
                {t('nav.tools')}
                <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {toolsOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-xl border border-white/10 bg-[#0f0c29]/98 backdrop-blur-xl shadow-2xl shadow-black/40 py-1.5 overflow-hidden">
                  {[
                    { label: '🤖 Visa Wizard',           href: '/wizard' },
                    { label: '🎯 Visa Checker',         href: '/visa-checker' },
                    { label: '🗺️ Visa-Free Map',        href: '/visa-free-map' },
                    { label: '⚖️ Compare Visas',       href: '/compare' },
                    { label: '📋 Checklist',            href: '/checklist' },
                    { label: '⏱️ Processing Times',     href: '/processing-times' },
                    { label: '🛡️ Travel Insurance',     href: '/travel-insurance' },
                    { label: '💱 Currency Converter',   href: '/currency-converter' },
                    { label: '🏛️ Embassy Finder',       href: '/embassy-finder' },
                    { label: '💰 Cost Calculator',      href: '/cost-calculator' },
                    { label: '💪 Passport Strength',    href: '/passport-strength' },
                    { label: '📊 Visa Tracker',         href: '/visa-tracker' },
                    { label: '🎤 Interview Prep',        href: '/interview-prep' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setToolsOpen(false)}
                      className={`block px-4 py-2 text-sm hover:bg-white/5 hover:text-white transition ${item.href === '/wizard' ? 'text-teal-400 font-semibold' : 'text-white/60'}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/blog" className="rounded-lg px-3 py-2 text-sm text-white/55 transition hover:bg-white/5 hover:text-white">
              {t('nav.blog')}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher currentLocale={currentLocale} />
            <Link
              href="/destinations"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600 hover:shadow-emerald-500/40 hover:-translate-y-px"
            >
              {t('nav.checkVisa')} <ArrowRight className="h-3.5 w-3.5" />
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
                  { label: t('nav.explore'),           href: '/destinations' },
                  { label: t('nav.visaRequirements'),  href: '/destinations' },
                  { label: t('nav.blog'),              href: '/blog' },
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
                  { label: '🤖 Visa Wizard',           href: '/wizard' },
                  { label: '🎯 Visa Checker',         href: '/visa-checker' },
                  { label: '🗺️ Visa-Free Map',        href: '/visa-free-map' },
                  { label: '⚖️ Compare Visas',       href: '/compare' },
                  { label: '📋 Checklist',            href: '/checklist' },
                  { label: '⏱️ Processing Times',     href: '/processing-times' },
                  { label: '🛡️ Travel Insurance',     href: '/travel-insurance' },
                  { label: '💱 Currency Converter',   href: '/currency-converter' },
                  { label: '🏛️ Embassy Finder',       href: '/embassy-finder' },
                  { label: '💰 Cost Calculator',      href: '/cost-calculator' },
                  { label: '💪 Passport Strength',    href: '/passport-strength' },
                  { label: '📊 Visa Tracker',         href: '/visa-tracker' },
                  { label: '🎤 Interview Prep',        href: '/interview-prep' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block rounded-lg px-3 py-2.5 text-sm hover:bg-white/5 hover:text-white transition ${item.href === '/wizard' ? 'text-teal-400 font-semibold' : 'text-white/60'}`}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/destinations"
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('hero.checkButton')}
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
              Backed by official embassy sources, updated daily
              <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="text-5xl font-extrabold leading-[1.06] tracking-tight sm:text-6xl lg:text-[5rem]"
          >
            <span className="text-white">Know Exactly Which Visa You Need</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              — In 10 Seconds.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16 }}
            className="mx-auto mt-6 max-w-lg text-base text-white/45 sm:text-lg"
          >
            Free visa requirements for 197 countries. Updated daily from official embassy sources. No signup required.
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
                  <div>
                    <CountrySelect
                      value={passport}
                      onChange={(v) => { setPassport(v); setGeoBadgeDismissed(true) }}
                      placeholder={geoLoading ? `🌍 ${t('common.loading')}` : t('hero.selectPassport')}
                      label={t('hero.passportLabel')}
                    />
                    {passport && !geoBadgeDismissed && !geoLoading && (
                      <div className="mt-1.5 flex items-center justify-between px-1">
                        <span className="text-[10px] text-teal-400">
                          📍 {t('hero.autoDetected')}
                        </span>
                        <button
                          onClick={() => setGeoBadgeDismissed(true)}
                          className="text-[10px] text-white/30 hover:text-white/60 transition"
                        >
                          {t('hero.notYou')} →
                        </button>
                      </div>
                    )}
                  </div>
                  <CountrySelect
                    value={destination}
                    onChange={setDestination}
                    placeholder={
                      !passport               ? t('hero.selectDestination') :
                      loadingDests            ? 'Loading…'                  :
                      destinations.length === 0 ? 'No destinations'         :
                                                'Select destination'
                    }
                    label={t('hero.destinationLabel')}
                    options={destinations.length > 0 ? destinations : undefined}
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
                  {t('hero.checkButton')}
                </button>
                {passport && destination && passport === destination && (
                  <p className="mt-2 text-center text-xs text-amber-400">
                    Please choose a different destination from your passport country.
                  </p>
                )}
              </div>
            </div>

            {/* Smart popular pills — dynamic by detected passport country */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-white/25">{t('hero.popularLabel')}</span>
              {(POPULAR_PILLS[countryName] ?? DEFAULT_PILLS).map((pill) => (
                <button
                  key={pill.dest}
                  onClick={() => setDestination(pill.dest)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/45 transition hover:border-emerald-500/40 hover:text-white hover:bg-emerald-500/10"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="mt-20 h-24 bg-gradient-to-b from-transparent to-[#FAFAFA]" />
      </section>

      {/* ────────────────────── EMAIL CAPTURE ────────────────────── */}
      <section className="bg-[#FAFAFA] py-10">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm text-center">
            <h3 className="text-lg font-bold text-gray-900">Get Visa Updates for Your Route</h3>
            <p className="mt-2 text-sm text-gray-500">
              We&apos;ll notify you when visa rules change for your passport + destination combo.
            </p>
            {emailStatus === 'success' ? (
              <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700">
                ✓ You&apos;re on the list! We&apos;ll alert you when visa rules change.
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-teal-400 focus:bg-white transition placeholder-gray-400"
                />
                <button
                  type="submit"
                  disabled={emailStatus === 'loading'}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-teal-600 disabled:opacity-60 transition whitespace-nowrap"
                >
                  {emailStatus === 'loading' ? 'Saving…' : 'Get Free Alerts →'}
                </button>
              </form>
            )}
            {emailStatus === 'error' && (
              <p className="mt-2 text-xs text-rose-500">Something went wrong. Please try again.</p>
            )}
            <p className="mt-3 text-xs text-gray-400">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      {/* ────────────────────── STATS BAR ────────────────────────── */}
      <section className="border-y border-gray-200 bg-[#FAFAFA]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-gray-200 sm:grid-cols-4">
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
                <div className="text-2xl font-extrabold text-gray-900 sm:text-3xl">{s.value}</div>
                <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────── TRUST BAR ────────────────────────── */}
      <section className="border-b border-gray-200 bg-[#FAFAFA] py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {[
              { icon: '✓', text: 'Free Forever' },
              { icon: '✓', text: '197 Countries Covered' },
              { icon: '✓', text: 'Updated Daily' },
              { icon: '✓', text: 'No Registration Required' },
              { icon: '✓', text: 'Official Embassy Sources' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-600">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────── POPULAR DESTINATIONS ─────────────── */}
      <section className="bg-[#FAFAFA] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-500">🔥 Trending Now</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Popular Destinations</h2>
                <p className="mt-2 max-w-md text-sm text-gray-500">
                  Countries travelers check the most this week. Tap any card for a full visa breakdown.
                </p>
              </div>
              <Link href="/destinations" className="group inline-flex items-center gap-1.5 text-sm text-gray-400 transition hover:text-emerald-500">
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
                      className="group relative block overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10"
                    >
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={d.photo}
                          alt={d.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <span className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm ${vs.bg} ${vs.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${vs.dot}`} />
                          {d.visa}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{d.flag}</span>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{d.name}</h3>
                            <p className="text-xs text-gray-400">{d.tagline}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-300 transition group-hover:text-emerald-500 group-hover:translate-x-0.5" />
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
      <section className="bg-gray-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="mb-12 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-600">
                <span>✈️</span> Visa-Free Travel
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">No Visa Required</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-gray-500">
                These stunning destinations welcome you with zero visa hassle. Just book your flight and go.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {NO_VISA_DESTINATIONS.map((d, i) => (
                <motion.div key={d.name} variants={fadeUp} transition={{ delay: i * 0.07 }}>
                  <Link
                    href={`/visa/${nameToSlug('Pakistan')}/${nameToSlug(d.name)}`}
                    className="group relative block overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-lg"
                  >
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={d.photo}
                        alt={d.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                    <div className="p-3 text-center">
                      <div className="text-xl">{d.flag}</div>
                      <div className="mt-1 text-xs font-bold text-gray-900">{d.name}</div>
                      <div className="mt-0.5 text-[10px] font-semibold text-emerald-600">{d.days} free</div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ────────────────────── ALL DESTINATIONS ─────────────────── */}
      <section className="bg-[#FAFAFA] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="mb-10 text-center">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-emerald-500">🌏 Explore</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">All Destinations</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-gray-500">
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
                      : 'border border-gray-200 bg-white text-gray-500 hover:border-emerald-500/40 hover:text-gray-900'
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
                      className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 transition-all hover:border-emerald-500/40 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-md"
                    >
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
              <Link
                href="/destinations"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-500 transition hover:border-emerald-500/40 hover:text-gray-900 hover:bg-emerald-500/5"
              >
                Browse all 197 destinations <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ────────────────────── FEATURES ──────────────────────────── */}
      <section className="bg-gray-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="mb-14 text-center">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-emerald-500">⚡ Why VisitPlane</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Everything You Need to Travel Smarter
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-gray-500">
                Built by travelers, for travelers. VisitPlane gives you the tools to navigate global visa requirements with confidence.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  transition={{ delay: i * 0.08 }}
                  className={`group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-emerald-500/30`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-30`} />
                  <div className="relative">
                    <div className="mb-4 text-3xl">{f.icon}</div>
                    <h3 className="mb-2 text-base font-bold text-gray-900">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ────────────────────── POPULAR TOOLS ────────────────────── */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="mb-12 text-center">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-emerald-500">🛠️ Popular Tools</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Explore Our Travel Tools
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-gray-500">
                Everything you need to plan visa-smart travel — all in one place.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: '🗺️', title: 'Visa-Free World Map', desc: 'See every country your passport unlocks on a beautiful interactive world map.', href: '/visa-free-map', highlight: true },
                { icon: '💪', title: 'Passport Strength', desc: 'Score your passport out of 100 and see how it ranks globally.', href: '/passport-strength', highlight: false },
                { icon: '🤖', title: 'AI Visa Wizard', desc: 'Get personalised visa guidance powered by AI for any passport + destination.', href: '/wizard', highlight: false },
                { icon: '⚖️', title: 'Compare Visas', desc: 'Compare visa requirements side-by-side for multiple destinations.', href: '/compare', highlight: false },
                { icon: '📋', title: 'Document Checklist', desc: 'Know exactly which documents you need before your visa application.', href: '/checklist', highlight: false },
                { icon: '⏱️', title: 'Processing Times', desc: 'Check how long visa processing takes for any country pair.', href: '/processing-times', highlight: false },
              ].map((tool, i) => (
                <motion.div key={tool.title} variants={fadeUp} transition={{ delay: i * 0.07 }}>
                  <Link href={tool.href}
                    className={`group flex items-start gap-4 rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:shadow-xl ${
                      tool.highlight
                        ? 'border-teal-500/30 bg-gradient-to-br from-teal-50 to-emerald-50 hover:border-teal-500/50'
                        : 'border-gray-200 bg-white hover:border-emerald-500/30'
                    }`}>
                    <span className="text-3xl flex-shrink-0">{tool.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">{tool.title}</h3>
                        {tool.highlight && <span className="rounded-full bg-teal-500/15 px-2 py-0.5 text-[10px] font-bold text-teal-600">NEW</span>}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">{tool.desc}</p>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 group-hover:gap-2 transition-all">
                        Try it <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ────────────────────── TESTIMONIALS ──────────────────────── */}
      <section className="bg-[#FAFAFA] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="mb-12 text-center">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-emerald-500">💬 Stories</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">What Travelers Say</h2>
              <p className="mt-3 text-sm text-gray-500">Real experiences from real travelers around the world.</p>
            </motion.div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} className="h-4 w-4 text-amber-400" />
                    ))}
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-gray-600">&ldquo;{t.text}&rdquo;</p>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="text-sm font-bold text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ────────────────────── CTA ───────────────────────────────── */}
      <section className="bg-[#FAFAFA] py-20 sm:py-24">
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
                  Check your visa requirements in seconds. 197 countries. Always free. No sign-up needed.
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
            </div>

            {/* Link cols */}
            {[
              {
                title: 'Explore',
                links: [
                  { label: 'Destinations',     href: '/destinations' },
                  { label: 'Visa Requirements', href: '/visa-requirements' },
                  { label: 'Travel Guides',     href: '/blog' },
                ],
              },
              {
                title: 'Resources',
                links: [
                  { label: 'Blog',               href: '/blog' },
                  { label: 'Visa Calculator',    href: '/cost-calculator' },
                  { label: 'Embassy Finder',     href: '/embassy-finder' },
                  { label: 'Travel Insurance',   href: '/travel-insurance' },
                  { label: 'FAQ',                href: '/faq' },
                ],
              },
              {
                title: 'Company',
                links: [
                  { label: 'About',          href: '/about' },
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                  { label: 'Contact',        href: '/contact' },
                  { label: 'Advertise',      href: '/contact' },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/40">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-white/30 transition hover:text-white">
                        {link.label}
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
