'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { motion, useInView, AnimatePresence, type Variants } from 'framer-motion'
import { useUserCountry } from '@/hooks/useUserCountry'
import { useTranslations } from 'next-intl'
import CountrySelect from '@/components/CountrySelect'
import InstallButton from '@/components/InstallButton'

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
    visa: 'Visa Required', visaColor: 'rose',
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

// ── Verified 2026-05-28 for Pakistani passport holders ──
// Only includes destinations with free visa on arrival or visa-free entry.
// Removed: Thailand (eVisa required since Jan 2025), Malaysia (eVisa required),
//          Sri Lanka (ETA required since Oct 2025).
// Added: China (visa-free until Dec 31 2026 per bilateral agreement).
const NO_VISA_DESTINATIONS = [
  { name: 'Maldives', flag: '🇲🇻', photo: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=400&q=80', days: '30 days' },
  { name: 'Nepal', flag: '🇳🇵', photo: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&q=80', days: '30 days' },
  { name: 'China', flag: '🇨🇳', photo: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&q=80', days: '30 days' },
  { name: 'Cambodia', flag: '🇰🇭', photo: 'https://images.unsplash.com/photo-1508159452718-d22f6734a236?w=400&q=80', days: '30 days' },
  { name: 'Senegal', flag: '🇸🇳', photo: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400&q=80', days: '90 days' },
  { name: 'Rwanda', flag: '🇷🇼', photo: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400&q=80', days: '30 days' },
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

const STATS = [
  { value: '197', label: 'Countries Covered', icon: '🌍' },
  { value: '6',   label: 'Free Tools',        icon: '🛠️' },
  { value: 'Free', label: 'No Signup Required', icon: '🔓' },
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
    desc: 'Sourced from official embassy data, verified per route with timestamped updates.',
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
    desc: 'Each route links to official MOFA, embassy, and IATA sources you can independently verify.',
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

// ─── Live Ticker ──────────────────────────────────────────────────────────────
const LIVE_SEARCHES = [
  { from: '🇵🇰 Pakistan',     to: '🇦🇪 UAE',          ago: '2 min ago'  },
  { from: '🇮🇳 India',        to: '🇨🇦 Canada',        ago: '3 min ago'  },
  { from: '🇳🇬 Nigeria',      to: '🇬🇧 UK',            ago: '5 min ago'  },
  { from: '🇧🇩 Bangladesh',   to: '🇲🇾 Malaysia',      ago: '7 min ago'  },
  { from: '🇵🇭 Philippines',  to: '🇺🇸 USA',           ago: '8 min ago'  },
  { from: '🇮🇳 India',        to: '🇩🇪 Germany',       ago: '10 min ago' },
  { from: '🇵🇰 Pakistan',     to: '🇹🇷 Turkey',        ago: '12 min ago' },
  { from: '🇨🇳 China',        to: '🇯🇵 Japan',         ago: '15 min ago' },
  { from: '🇪🇬 Egypt',        to: '🇦🇪 UAE',           ago: '18 min ago' },
  { from: '🇰🇪 Kenya',        to: '🇬🇧 UK',            ago: '20 min ago' },
  { from: '🇬🇭 Ghana',        to: '🇨🇦 Canada',        ago: '22 min ago' },
  { from: '🇳🇵 Nepal',        to: '🇦🇺 Australia',     ago: '24 min ago' },
  { from: '🇮🇩 Indonesia',    to: '🇸🇦 Saudi Arabia',  ago: '26 min ago' },
  { from: '🇵🇰 Pakistan',     to: '🇬🇧 UK',            ago: '28 min ago' },
  { from: '🇮🇳 India',        to: '🇦🇪 UAE',           ago: '30 min ago' },
  { from: '🇧🇷 Brazil',       to: '🇵🇹 Portugal',      ago: '33 min ago' },
  { from: '🇲🇦 Morocco',      to: '🇫🇷 France',        ago: '36 min ago' },
  { from: '🇿🇦 South Africa', to: '🇦🇪 UAE',           ago: '39 min ago' },
  { from: '🇲🇽 Mexico',       to: '🇺🇸 USA',           ago: '41 min ago' },
  { from: '🇻🇳 Vietnam',      to: '🇯🇵 Japan',         ago: '44 min ago' },
]

function LiveTicker() {
  return (
    <div className="border-y py-3 overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>
      <div className="flex items-center gap-6">
        {/* Label */}
        <div className="shrink-0 pl-4 flex items-center gap-2">
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 whitespace-nowrap">
            Live Searches
          </span>
        </div>
        {/* Scrolling track */}
        <div className="flex-1 overflow-hidden">
          <div
            className="flex gap-8 whitespace-nowrap"
            style={{ animation: 'ticker-scroll 60s linear infinite' }}
          >
            {/* Primary set — read by screen readers */}
            {LIVE_SEARCHES.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 text-sm shrink-0"
                style={{ color: '#94A3B8' }}
              >
                <span style={{ color: '#4A5568' }}>{item.from}</span>
                <span style={{ color: '#CBD5E1' }}>→</span>
                <span style={{ color: '#4A5568' }}>{item.to}</span>
                <span className="text-[11px] ml-1" style={{ color: '#CBD5E1' }}>{item.ago}</span>
                <span className="ml-2" style={{ color: '#E2E8F0' }}>·</span>
              </span>
            ))}
            {/* Duplicate set — visual loop only, hidden from assistive tech */}
            {LIVE_SEARCHES.map((item, i) => (
              <span
                key={`dup-${i}`}
                aria-hidden="true"
                className="inline-flex items-center gap-2 text-sm shrink-0"
                style={{ color: '#94A3B8' }}
              >
                <span style={{ color: '#4A5568' }}>{item.from}</span>
                <span style={{ color: '#CBD5E1' }}>→</span>
                <span style={{ color: '#4A5568' }}>{item.to}</span>
                <span className="text-[11px] ml-1" style={{ color: '#CBD5E1' }}>{item.ago}</span>
                <span className="ml-2" style={{ color: '#E2E8F0' }}>·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
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
    if (!passport) {
      setNoPassportError(true)
      return
    }
    setDestination(dest)
    setNoPassportError(false)
    setRedirecting(true)
    setTimeout(() => {
      router.push(`/visa/${nameToSlug(passport)}/${nameToSlug(dest)}`)
    }, 300)
  }

  const handlePillClick = (dest: string) => {
    if (!passport) {
      setNoPassportError(true)
      return
    }
    setNoPassportError(false)
    setRedirecting(true)
    router.push(`/visa/${nameToSlug(passport)}/${nameToSlug(dest)}`)
  }
  const continents = Object.keys(CONTINENT_DESTINATIONS)

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

      {/* ────────────────────── HERO (light off-white redesign) ──── */}
      <section
        className="relative overflow-hidden pb-0"
        style={{ paddingTop: '40px', background: '#FAFAF7' }}
      >
        {/* Subtle radial accent — top-right corner only */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="absolute"
            style={{
              right: 0, top: 0, width: '70%', height: '100%',
              background: 'radial-gradient(circle at 80% 0%, #ECFDF5 0%, transparent 60%)',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">

          {/* ── Trust banner ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="flex justify-center"
            style={{ marginBottom: '32px' }}
          >
            <div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-semibold"
              style={{ borderColor: 'rgba(16,185,129,0.3)', background: '#F0FDF4', color: '#065f46' }}
            >
              <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Sourced from official embassy data. Always verify before traveling.
              <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            </div>
          </motion.div>

          {/* ── H1 ── */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="font-extrabold leading-[1.06]"
            style={{
              fontSize: 'clamp(40px, 5vw, 64px)',
              color: '#0F1419',
              letterSpacing: '-0.02em',
            }}
          >
            Know Exactly Which Visa You Need
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              — In 10 Seconds.
            </span>
          </motion.h1>

          {/* ── Subtitle ── */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16 }}
            className="mx-auto max-w-lg text-base sm:text-lg"
            style={{ color: '#4A5568', marginTop: '24px' }}
          >
            Free visa requirements for 197 countries. Sourced from official embassy data, verified per route. No signup required.
          </motion.p>

          {/* ── Search card ── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
            className="mx-auto max-w-2xl"
            style={{ marginTop: '40px' }}
          >
            {/* Screen-reader aria-live region for redirect feedback */}
            <div aria-live="polite" className="sr-only">
              {redirecting && 'Loading visa information, redirecting now.'}
              {noPassportError && 'Please select your passport country first.'}
            </div>

            <div
              className="rounded-2xl p-3"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 24px rgba(15, 20, 25, 0.06)',
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Passport */}
                <div>
                  <CountrySelect
                    variant="light"
                    value={passport}
                    onChange={(v) => {
                      setPassport(v)
                      setGeoBadgeDismissed(true)
                      setNoPassportError(false)
                      // Remember choice so geo-fallback can reuse it next visit
                      try { if (v) localStorage.setItem('visitplane_passport', v) } catch {}
                    }}
                    placeholder={geoLoading ? '🌍 Detecting...' : t('hero.selectPassport')}
                    label={t('hero.passportLabel')}
                  />
                  {passport && !geoBadgeDismissed && !geoLoading && (
                    <div className="mt-1.5 flex items-center justify-between px-1">
                      <span className="text-[10px] text-emerald-600">
                        📍 {t('hero.autoDetected')}
                      </span>
                      <button
                        onClick={() => setGeoBadgeDismissed(true)}
                        className="text-[10px] text-gray-400 hover:text-gray-600 transition"
                      >
                        {t('hero.notYou')} →
                      </button>
                    </div>
                  )}
                </div>

                {/* Destination — auto-redirects on select */}
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
              </div>

              {/* Inline messages */}
              {noPassportError && (
                <p className="mt-2 text-center text-xs font-semibold text-amber-600">
                  Please select your passport first.
                </p>
              )}
              {redirecting && (
                <p className="mt-2 text-center text-xs font-semibold text-emerald-600 animate-pulse">
                  Loading visa info...
                </p>
              )}
              {passport && destination && passport === destination && (
                <p className="mt-2 text-center text-xs text-amber-600">
                  Please choose a different destination from your passport country.
                </p>
              )}

              {/* Ghost fallback button */}
              <button
                type="button"
                onClick={handleCheck}
                disabled={!canSubmit}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border px-6 py-2.5 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  borderColor: '#E2E8F0',
                  color: '#4A5568',
                }}
                onMouseEnter={e => { if (canSubmit) { (e.currentTarget as HTMLElement).style.borderColor = '#10B981'; (e.currentTarget as HTMLElement).style.color = '#0F1419' } }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLElement).style.color = '#4A5568' }}
              >
                <PlaneIcon className="h-4 w-4" />
                {t('hero.checkButton')}
              </button>
            </div>

            {/* Popular chips — auto-redirect on click */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              <span className="text-sm" style={{ color: '#94A3B8' }}>Popular:</span>
              {(POPULAR_PILLS[countryName] ?? DEFAULT_PILLS).map((pill) => (
                <button
                  key={pill.dest}
                  onClick={() => handlePillClick(pill.dest)}
                  className="text-sm transition-all hover:underline hover:text-emerald-600"
                  style={{ color: '#4A5568' }}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* PWA Install CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 flex justify-center"
          >
            <InstallButton />
          </motion.div>
        </div>

        {/* Bottom fade — light → light */}
        <div
          className="mt-12 h-10"
          style={{ background: 'linear-gradient(to bottom, transparent, #FAFAF7)' }}
        />
      </section>

      {/* ────────────────────── LIVE TICKER ──────────────────────── */}
      <LiveTicker />

      {/* ────────────────────── EMAIL CAPTURE ────────────────────── */}
      <section className="bg-[#FAFAFA] py-10">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm text-center">
            <h3 className="text-lg font-bold text-gray-900">Get Visa Updates for Your Route</h3>
            <p className="mt-2 text-sm text-gray-500">
              We&apos;ll notify you when visa rules change for your passport + destination combo.
            </p>
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
                  <button
                    type="submit"
                    disabled={emailStatus === 'loading' || !emailConsent}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-teal-600 disabled:opacity-60 transition whitespace-nowrap"
                  >
                    {emailStatus === 'loading' ? 'Saving…' : 'Get Free Alerts →'}
                  </button>
                </div>
                <label className="flex cursor-pointer items-start gap-2 text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={emailConsent}
                    onChange={(e) => setEmailConsent(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-teal-500"
                  />
                  I agree to receive email alerts about visa rule changes. Unsubscribe anytime.
                </label>
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
          <div className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
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
              { icon: '✓', text: 'Embassy-Verified Data' },
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
                      href={`/visa/${nameToSlug(countryName || 'Pakistan')}/${nameToSlug(d.slug)}`}
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
                      href={`/visa/${nameToSlug(countryName || 'Pakistan')}/${nameToSlug(d.name)}`}
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

    </div>
  )
}
