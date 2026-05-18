'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserCountry } from '@/hooks/useUserCountry'

// ─── Supabase ─────────────────────────────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// ─── Visa-type bucketing (matches real DB labels) ────────────────────────────
function bucketVisa(raw: string): 'free' | 'arrival' | 'required' {
  const v = (raw || '').toLowerCase().trim()
  if (
    v.includes('visa free') || v.includes('visa-free') ||
    v.includes('no visa') || v === 'free' ||
    v.includes('evisa') || v.includes('e-visa') ||
    v.includes('electronic visa') || v.includes('tourist evisa') ||
    v.includes('eta') || v.includes('electronic travel')
  ) return 'free'
  if (v.includes('arrival') || v.includes('on arrival') || v.includes('voa'))
    return 'arrival'
  return 'required'
}

// ─── Passport rankings (Henley Index 2024 approximate) ───────────────────────
const RANKINGS: Record<string, number> = {
  'Japan': 1, 'Singapore': 2, 'France': 3, 'Germany': 3, 'Italy': 3,
  'Spain': 3, 'South Korea': 3, 'Finland': 4, 'Sweden': 4, 'Austria': 4,
  'Denmark': 4, 'Netherlands': 4, 'Ireland': 5, 'Portugal': 5,
  'United Kingdom': 5, 'Belgium': 5, 'Luxembourg': 5, 'Norway': 5,
  'Switzerland': 5, 'New Zealand': 5, 'Australia': 6, 'Greece': 6,
  'Czech Republic': 6, 'Malta': 6, 'Poland': 6, 'Canada': 7,
  'United States': 7, 'Hungary': 7, 'Lithuania': 7, 'Slovakia': 7,
  'Latvia': 7, 'Slovenia': 7, 'Iceland': 8, 'Estonia': 8,
  'Croatia': 9, 'Romania': 10, 'Bulgaria': 11, 'Malaysia': 12,
  'Taiwan': 13, 'Israel': 13, 'Cyprus': 14, 'UAE': 15,
  'Brunei': 16, 'Chile': 17, 'Argentina': 18, 'Hong Kong': 19,
  'Brazil': 20, 'Mauritius': 28, 'Seychelles': 30, 'Uruguay': 15,
  'Mexico': 25, 'Costa Rica': 30, 'Panama': 49, 'Paraguay': 42,
  'Serbia': 38, 'Montenegro': 46, 'Albania': 40, 'North Macedonia': 45,
  'Turkey': 52, 'Ukraine': 35, 'Moldova': 48, 'Russia': 51,
  'South Africa': 52, 'Qatar': 55, 'Bahrain': 58, 'Saudi Arabia': 60,
  'Kuwait': 60, 'Oman': 61, 'China': 64, 'Thailand': 67,
  'Indonesia': 70, 'Tunisia': 72, 'Morocco': 73, 'Philippines': 74,
  'Ghana': 76, 'Kenya': 80, 'India': 82, 'Jordan': 84,
  'Vietnam': 90, 'Nigeria': 93, 'Algeria': 95, 'Bangladesh': 99,
  'Egypt': 100, 'Pakistan': 101, 'Iran': 103, 'Iraq': 107,
  'Syria': 108, 'Afghanistan': 110, 'Nepal': 95, 'Sri Lanka': 100,
  'Lebanon': 100, 'Palestine': 104, 'Yemen': 105,
}

// ─── Country flags ────────────────────────────────────────────────────────────
const FLAGS: Record<string, string> = {
  'Afghanistan': '🇦🇫', 'Albania': '🇦🇱', 'Algeria': '🇩🇿', 'Andorra': '🇦🇩',
  'Angola': '🇦🇴', 'Antigua and Barbuda': '🇦🇬', 'Argentina': '🇦🇷',
  'Armenia': '🇦🇲', 'Australia': '🇦🇺', 'Austria': '🇦🇹', 'Azerbaijan': '🇦🇿',
  'Bahamas': '🇧🇸', 'Bahrain': '🇧🇭', 'Bangladesh': '🇧🇩', 'Barbados': '🇧🇧',
  'Belarus': '🇧🇾', 'Belgium': '🇧🇪', 'Belize': '🇧🇿', 'Benin': '🇧🇯',
  'Bhutan': '🇧🇹', 'Bolivia': '🇧🇴', 'Bosnia and Herzegovina': '🇧🇦',
  'Botswana': '🇧🇼', 'Brazil': '🇧🇷', 'Brunei': '🇧🇳', 'Bulgaria': '🇧🇬',
  'Burkina Faso': '🇧🇫', 'Burundi': '🇧🇮', 'Cambodia': '🇰🇭',
  'Cameroon': '🇨🇲', 'Canada': '🇨🇦', 'Cape Verde': '🇨🇻',
  'Central African Republic': '🇨🇫', 'Chad': '🇹🇩', 'Chile': '🇨🇱',
  'China': '🇨🇳', 'Colombia': '🇨🇴', 'Comoros': '🇰🇲', 'Costa Rica': '🇨🇷',
  'Croatia': '🇭🇷', 'Cuba': '🇨🇺', 'Cyprus': '🇨🇾', 'Czech Republic': '🇨🇿',
  'Democratic Republic of the Congo': '🇨🇩', 'Denmark': '🇩🇰',
  'Djibouti': '🇩🇯', 'Dominica': '🇩🇲', 'Dominican Republic': '🇩🇴',
  'Ecuador': '🇪🇨', 'Egypt': '🇪🇬', 'El Salvador': '🇸🇻',
  'Equatorial Guinea': '🇬🇶', 'Eritrea': '🇪🇷', 'Estonia': '🇪🇪',
  'Ethiopia': '🇪🇹', 'Fiji': '🇫🇯', 'Finland': '🇫🇮', 'France': '🇫🇷',
  'Gabon': '🇬🇦', 'Gambia': '🇬🇲', 'Georgia': '🇬🇪', 'Germany': '🇩🇪',
  'Ghana': '🇬🇭', 'Greece': '🇬🇷', 'Grenada': '🇬🇩', 'Guatemala': '🇬🇹',
  'Guinea': '🇬🇳', 'Guinea-Bissau': '🇬🇼', 'Guyana': '🇬🇾', 'Haiti': '🇭🇹',
  'Honduras': '🇭🇳', 'Hong Kong': '🇭🇰', 'Hungary': '🇭🇺', 'Iceland': '🇮🇸',
  'India': '🇮🇳', 'Indonesia': '🇮🇩', 'Iran': '🇮🇷', 'Iraq': '🇮🇶',
  'Ireland': '🇮🇪', 'Israel': '🇮🇱', 'Italy': '🇮🇹', 'Ivory Coast': '🇨🇮',
  'Jamaica': '🇯🇲', 'Japan': '🇯🇵', 'Jordan': '🇯🇴', 'Kazakhstan': '🇰🇿',
  'Kenya': '🇰🇪', 'Kiribati': '🇰🇮', 'Kosovo': '🇽🇰', 'Kuwait': '🇰🇼',
  'Kyrgyzstan': '🇰🇬', 'Laos': '🇱🇦', 'Latvia': '🇱🇻', 'Lebanon': '🇱🇧',
  'Lesotho': '🇱🇸', 'Liberia': '🇱🇷', 'Libya': '🇱🇾', 'Liechtenstein': '🇱🇮',
  'Lithuania': '🇱🇹', 'Luxembourg': '🇱🇺', 'Madagascar': '🇲🇬',
  'Malawi': '🇲🇼', 'Malaysia': '🇲🇾', 'Maldives': '🇲🇻', 'Mali': '🇲🇱',
  'Malta': '🇲🇹', 'Marshall Islands': '🇲🇭', 'Mauritania': '🇲🇷',
  'Mauritius': '🇲🇺', 'Mexico': '🇲🇽', 'Micronesia': '🇫🇲',
  'Moldova': '🇲🇩', 'Monaco': '🇲🇨', 'Mongolia': '🇲🇳', 'Montenegro': '🇲🇪',
  'Morocco': '🇲🇦', 'Mozambique': '🇲🇿', 'Myanmar': '🇲🇲', 'Namibia': '🇳🇦',
  'Nauru': '🇳🇷', 'Nepal': '🇳🇵', 'Netherlands': '🇳🇱', 'New Zealand': '🇳🇿',
  'Nicaragua': '🇳🇮', 'Niger': '🇳🇪', 'Nigeria': '🇳🇬', 'North Korea': '🇰🇵',
  'North Macedonia': '🇲🇰', 'Norway': '🇳🇴', 'Oman': '🇴🇲', 'Pakistan': '🇵🇰',
  'Palau': '🇵🇼', 'Palestine': '🇵🇸', 'Panama': '🇵🇦',
  'Papua New Guinea': '🇵🇬', 'Paraguay': '🇵🇾', 'Peru': '🇵🇪',
  'Philippines': '🇵🇭', 'Poland': '🇵🇱', 'Portugal': '🇵🇹', 'Qatar': '🇶🇦',
  'Republic of the Congo': '🇨🇬', 'Romania': '🇷🇴', 'Russia': '🇷🇺',
  'Rwanda': '🇷🇼', 'Saint Kitts and Nevis': '🇰🇳', 'Saint Lucia': '🇱🇨',
  'Saint Vincent and the Grenadines': '🇻🇨', 'Samoa': '🇼🇸',
  'San Marino': '🇸🇲', 'Sao Tome and Principe': '🇸🇹', 'Saudi Arabia': '🇸🇦',
  'Senegal': '🇸🇳', 'Serbia': '🇷🇸', 'Seychelles': '🇸🇨',
  'Sierra Leone': '🇸🇱', 'Singapore': '🇸🇬', 'Slovakia': '🇸🇰',
  'Slovenia': '🇸🇮', 'Solomon Islands': '🇸🇧', 'Somalia': '🇸🇴',
  'South Africa': '🇿🇦', 'South Korea': '🇰🇷', 'South Sudan': '🇸🇸',
  'Spain': '🇪🇸', 'Sri Lanka': '🇱🇰', 'Sudan': '🇸🇩', 'Suriname': '🇸🇷',
  'Swaziland': '🇸🇿', 'Sweden': '🇸🇪', 'Switzerland': '🇨🇭', 'Syria': '🇸🇾',
  'Taiwan': '🇹🇼', 'Tajikistan': '🇹🇯', 'Tanzania': '🇹🇿',
  'Thailand': '🇹🇭', 'Timor-Leste': '🇹🇱', 'Togo': '🇹🇬', 'Tonga': '🇹🇴',
  'Trinidad and Tobago': '🇹🇹', 'Tunisia': '🇹🇳', 'Turkey': '🇹🇷',
  'Turkmenistan': '🇹🇲', 'Tuvalu': '🇹🇻', 'UAE': '🇦🇪', 'Uganda': '🇺🇬',
  'Ukraine': '🇺🇦', 'United Kingdom': '🇬🇧', 'United States': '🇺🇸',
  'Uruguay': '🇺🇾', 'Uzbekistan': '🇺🇿', 'Vanuatu': '🇻🇺',
  'Venezuela': '🇻🇪', 'Vietnam': '🇻🇳', 'Yemen': '🇾🇪', 'Zambia': '🇿🇲',
  'Zimbabwe': '🇿🇼',
}

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

// ─── Types ────────────────────────────────────────────────────────────────────
type ResultData = {
  passport: string
  free: number
  arrival: number
  required: number
  total: number
  score: number
  rank: number | null
  topDestinations: { name: string; flag: string; visaType: string }[]
}

type FetchState = 'idle' | 'loading' | 'success' | 'empty' | 'error'

// ─── Animated counter ─────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1400, active = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active || target === 0) { setVal(0); return }
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(target * ease))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration, active])
  return val
}

// ─── SVG icons ────────────────────────────────────────────────────────────────
function ChevronDown() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
function ArrowRight({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  )
}
function MenuIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  )
}
function XIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
function CopyIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 5 5L20 7" />
    </svg>
  )
}
function TwitterIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}
function WhatsAppIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.004 2.003a9.997 9.997 0 0 0-8.591 15.09L2 22l5.068-1.332A9.997 9.997 0 1 0 12.004 2.003zm0 18.18a8.16 8.16 0 0 1-4.162-1.14l-.298-.178-3.091.811.825-3.016-.194-.31a8.18 8.18 0 1 1 6.92 3.833z"/>
    </svg>
  )
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, active }: { score: number; active: boolean }) {
  const displayed = useCountUp(score, 1600, active)
  const SIZE = 240
  const STROKE = 14
  const R = (SIZE - STROKE * 2) / 2
  const CIRC = 2 * Math.PI * R
  const offset = active ? CIRC - (displayed / 100) * CIRC : CIRC

  const color =
    score >= 60 ? '#10b981' :
    score >= 30 ? '#f59e0b' :
    '#ef4444'

  const trackColor =
    score >= 60 ? '#052e16' :
    score >= 30 ? '#2d1606' :
    '#2d0707'

  const label =
    score >= 60 ? 'Strong' :
    score >= 30 ? 'Average' :
    'Weak'

  return (
    <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      {/* Glow */}
      <div className="absolute inset-8 rounded-full blur-3xl opacity-25" style={{ background: color }} />
      {/* Rings */}
      <svg width={SIZE} height={SIZE} className="absolute -rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={trackColor} strokeWidth={STROKE} />
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.04s linear' }}
        />
      </svg>
      {/* Center */}
      <div className="relative z-10 text-center">
        <div className="text-6xl font-black tabular-nums leading-none" style={{ color }}>
          {displayed}
        </div>
        <div className="text-sm font-bold text-white/30 mt-1">/ 100</div>
        <div className="mt-2 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest"
          style={{ background: `${color}20`, color }}>
          {label}
        </div>
      </div>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  count, label, sublabel, color, bg, icon, active, delay,
}: {
  count: number; label: string; sublabel: string
  color: string; bg: string; icon: string; active: boolean; delay: number
}) {
  const displayed = useCountUp(count, 1200, active)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl border p-6 text-center"
      style={{ borderColor: `${color}20`, background: bg }}
    >
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% -20%, ${color}, transparent 70%)` }} />
      <div className="relative">
        <div className="text-3xl mb-3">{icon}</div>
        <div className="text-4xl font-black tabular-nums" style={{ color }}>
          {displayed}
        </div>
        <div className="mt-1 text-sm font-bold text-white">{label}</div>
        <div className="mt-0.5 text-xs text-white/35">{sublabel}</div>
      </div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PassportStrengthPage() {
  const [passport, setPassport] = useState('')
  const [fetchState, setFetchState] = useState<FetchState>('idle')
  const [result, setResult] = useState<ResultData | null>(null)
  const [copied, setCopied] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [geoBadgeDismissed, setGeoBadgeDismissed] = useState(false)

  const { countryName, loading: geoLoading } = useUserCountry()

  // Auto-set passport from IP geo (only if user hasn't already chosen)
  useEffect(() => {
    if (countryName && !geoLoading && !passport) {
      setPassport(countryName)
    }
  }, [countryName, geoLoading, passport])

  const loading = fetchState === 'loading'

  // Set page title
  useEffect(() => {
    document.title = 'Passport Strength Checker 2026 | VisitPlane'
  }, [])

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const fetchPassportData = useCallback(async (country: string) => {
    setFetchState('loading')
    setResult(null)

    try {
      // Use ilike (case-insensitive) so we match regardless of how the DB stores casing
      const { data, error } = await getSupabase()
        .from('destinations')
        .select('country_name, visa_type')
        .ilike('passport_country', country)

      if (error) {
        console.error('Supabase error:', error)
        setFetchState('error')
        return
      }

      if (!data || data.length === 0) {
        setFetchState('empty')
        return
      }

      let free = 0, arrival = 0, required = 0
      const freeRows: { name: string; flag: string; visaType: string }[] = []
      const arrivalRows: { name: string; flag: string; visaType: string }[] = []

      data.forEach(row => {
        const bucket = bucketVisa(row.visa_type ?? '')
        if (bucket === 'free') {
          free++
          freeRows.push({
            name: row.country_name,
            flag: FLAGS[row.country_name] ?? '🏳️',
            visaType: row.visa_type ?? '',
          })
        } else if (bucket === 'arrival') {
          arrival++
          arrivalRows.push({
            name: row.country_name,
            flag: FLAGS[row.country_name] ?? '🏳️',
            visaType: row.visa_type ?? '',
          })
        } else {
          required++
        }
      })

      const total = data.length
      const score = Math.round((free / total) * 100)

      // Top 6: prefer visa-free, fall back to on-arrival if fewer than 6
      const topDestinations = [
        ...freeRows.slice(0, 6),
        ...arrivalRows.slice(0, Math.max(0, 6 - freeRows.length)),
      ].slice(0, 6)

      setResult({
        passport: country,
        free,
        arrival,
        required,
        total,
        score,
        rank: RANKINGS[country] ?? null,
        topDestinations,
      })
      setFetchState('success')
    } catch (err) {
      console.error('Unexpected error:', err)
      setFetchState('error')
    }
  }, [])

  useEffect(() => {
    if (passport) fetchPassportData(passport)
  }, [passport, fetchPassportData])

  const flag = passport ? (FLAGS[passport] ?? '🌍') : '🌍'

  const shareText = result
    ? `My ${result.passport} ${flag} passport scores ${result.score}/100 and can access ${result.free} countries visa-free! 🛂✈️\nCheck yours → visitplane.com/passport-strength`
    : ''

  const handleCopy = async () => {
    if (!shareText) return
    await navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const navLinks = [
    { label: 'Explore', href: '/destinations' },
    { label: 'Visa Requirements', href: '/destinations' },
    { label: 'Passport Strength', href: '/passport-strength' },
    { label: '⚖️ Compare Visas', href: '/compare' },
    { label: 'Guides', href: '/blog' },
  ]

  return (
    <div className="min-h-screen bg-[#060C18] text-white antialiased overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#060C18]/95 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/30' : 'bg-transparent'
      }`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2.5 shrink-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-md group-hover:bg-emerald-500/30 transition" />
              <Image src="/logo-v2.png" alt="VisitPlane" width={36} height={36} className="relative rounded-xl" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-white">Visit</span><span className="text-emerald-400">Plane</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map(item => (
              <Link key={item.label} href={item.href}
                className={`rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 hover:text-white ${
                  item.href === '/passport-strength' ? 'text-emerald-400 font-semibold' : 'text-white/55'
                }`}>
                {item.label}
              </Link>
            ))}
            <div className="relative group">
              <button className="rounded-lg px-3 py-2 text-sm text-white/55 hover:bg-white/5 hover:text-white transition flex items-center gap-1">Tools <span className="text-[10px]">▾</span></button>
              <div className="absolute top-full left-0 mt-1 w-56 rounded-xl border border-white/10 bg-[#0C1526] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-1">
                <Link href="/passport-strength" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition">💪 Passport Strength</Link>
                <Link href="/compare" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition">⚖️ Compare Visas</Link>
                <Link href="/checklist" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition">📋 Checklist</Link>
                <Link href="/processing-times" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition">⏱️ Processing Times</Link>
                <Link href="/travel-insurance" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition">🛡️ Travel Insurance</Link>
                <Link href="/embassy-finder" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition">🏛️ Embassy Finder</Link>
                <Link href="/cost-calculator" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition">💰 Cost Calculator</Link>
                <Link href="/currency-converter" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition">💱 Currency Converter</Link>
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/destinations"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600 hover:-translate-y-px">
              Check Visa <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-white/55 hover:bg-white/5 hover:text-white md:hidden transition">
              {mobileOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-white/5 bg-[#060C18]/98 backdrop-blur-xl md:hidden overflow-hidden"
            >
              <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
                {navLinks.map(item => (
                  <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white transition">
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-16 pb-24 sm:pt-24 sm:pb-32">
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[700px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),transparent_60%)]" />
          <div className="absolute -left-40 top-40 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.07),transparent_70%)]" />
          <div className="absolute -right-40 top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.07),transparent_70%)]" />
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.4) 1px,transparent 1px)',
            backgroundSize: '64px 64px',
          }} />

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400 backdrop-blur-sm">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              🛂 Passport Power Index
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}
            className="text-5xl font-extrabold leading-[1.06] tracking-tight sm:text-6xl lg:text-[4.5rem]">
            <span className="text-white">How Powerful Is</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Your Passport?
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-5 max-w-lg text-base text-white/45 sm:text-lg">
            Discover your passport&apos;s global access score instantly. See how many countries
            you can visit visa-free — powered by real data.
          </motion.p>

          {/* Selector card */}
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.22 }}
            className="mx-auto mt-10 max-w-lg">
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-2 shadow-2xl shadow-black/50 backdrop-blur-sm">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/8 via-transparent to-cyan-500/8 pointer-events-none" />
              <div className="relative rounded-xl bg-[#0C1526] px-5 py-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                    Select Your Passport Country
                  </label>
                  {passport && !geoBadgeDismissed && !geoLoading && (
                    <span className="text-[10px] text-teal-400 flex items-center gap-1">
                      📍 Auto-detected
                      <button onClick={() => setGeoBadgeDismissed(true)} className="text-white/30 hover:text-white/60 ml-1">✕</button>
                    </span>
                  )}
                </div>
                <div className="relative flex items-center gap-3">
                  <span className="text-2xl select-none shrink-0">{flag}</span>
                  <select
                    value={passport}
                    onChange={e => { setPassport(e.target.value); setGeoBadgeDismissed(true) }}
                    className="w-full appearance-none bg-transparent text-base font-medium text-white outline-none pr-8 cursor-pointer"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="" className="bg-[#0C1526] text-gray-400">
                      {geoLoading ? '🌍 Detecting your location…' : 'Choose your country…'}
                    </option>
                    {PASSPORT_COUNTRIES.map(c => (
                      <option key={c} value={c} className="bg-[#0C1526] text-white">{FLAGS[c] ?? '🏳️'} {c}</option>
                    ))}
                  </select>
                  <ChevronDown />
                </div>
              </div>
            </div>

            {/* Quick picks */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-white/25">Quick pick:</span>
              {[
                ['Pakistan', '🇵🇰'], ['India', '🇮🇳'], ['United States', '🇺🇸'],
                ['United Kingdom', '🇬🇧'], ['Japan', '🇯🇵'], ['UAE', '🇦🇪'],
              ].map(([c, f]) => (
                <button key={c} onClick={() => setPassport(c)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    passport === c
                      ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-400'
                      : 'border-white/10 bg-white/5 text-white/50 hover:border-emerald-500/40 hover:text-white hover:bg-white/8'
                  }`}>
                  {f} {c}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── RESULTS ── */}
      <AnimatePresence mode="wait">

        {/* Loading */}
        {fetchState === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="py-20 text-center">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-8 py-5">
              <svg className="h-5 w-5 animate-spin text-emerald-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm font-semibold text-emerald-400">Calculating passport strength…</span>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {fetchState === 'empty' && (
          <motion.div key="empty" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="py-20 text-center">
            <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-10">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-white mb-2">No data found for {passport}</h3>
              <p className="text-sm text-white/40">
                We don&apos;t have passport data for this country yet. Try another passport or{' '}
                <Link href="/destinations" className="text-emerald-400 hover:underline">check visa requirements directly</Link>.
              </p>
            </div>
          </motion.div>
        )}

        {/* Error state */}
        {fetchState === 'error' && (
          <motion.div key="error" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="py-20 text-center">
            <div className="mx-auto max-w-md rounded-2xl border border-rose-500/20 bg-rose-500/[0.05] px-8 py-10">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-bold text-white mb-2">Something went wrong</h3>
              <p className="text-sm text-white/40 mb-5">
                Could not fetch passport data. Please try again in a moment.
              </p>
              <button
                onClick={() => passport && fetchPassportData(passport)}
                className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-5 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/25 transition">
                Retry
              </button>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {fetchState === 'success' && result && (
          <motion.div key={result.passport} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>

            {/* ── Section 2: Score + Stats ── */}
            <section className="bg-[#0A1120] py-16 sm:py-20">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

                {/* Top label */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                  className="mb-10 flex items-center justify-center gap-3">
                  <span className="text-4xl">{FLAGS[result.passport] ?? '🌍'}</span>
                  <div className="text-center">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">Passport Power</p>
                    <h2 className="text-3xl font-extrabold text-white">{result.passport}</h2>
                  </div>
                </motion.div>

                <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-center lg:gap-16">
                  {/* Score ring */}
                  <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex flex-col items-center gap-5">
                    <ScoreRing score={result.score} active />
                    {result.rank && (
                      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5">
                        <span className="text-lg">🏅</span>
                        <span className="text-sm text-white/50">Global Passport Rank</span>
                        <span className="text-sm font-extrabold text-white">#{result.rank}</span>
                      </div>
                    )}
                    <p className="text-xs text-white/30 text-center max-w-[200px]">
                      Based on {result.total} destinations in our database
                    </p>
                  </motion.div>

                  {/* Stat cards */}
                  <div className="w-full max-w-xl">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <StatCard
                        count={result.free}
                        label="Visa Free"
                        sublabel="countries accessible"
                        color="#10b981" bg="rgba(16,185,129,0.07)"
                        icon="🟢" active delay={0.15}
                      />
                      <StatCard
                        count={result.arrival}
                        label="Visa on Arrival"
                        sublabel="countries accessible"
                        color="#f59e0b" bg="rgba(245,158,11,0.07)"
                        icon="🟡" active delay={0.25}
                      />
                      <StatCard
                        count={result.required}
                        label="Visa Required"
                        sublabel="countries restricted"
                        color="#ef4444" bg="rgba(239,68,68,0.07)"
                        icon="🔴" active delay={0.35}
                      />
                    </div>

                    {/* Progress bar breakdown */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}
                      className="mt-5 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-3">Access Breakdown</p>
                      <div className="flex h-3 w-full overflow-hidden rounded-full gap-0.5">
                        {result.free > 0 && (
                          <div className="rounded-l-full bg-emerald-500 transition-all duration-1000"
                            style={{ width: `${(result.free / result.total) * 100}%` }} />
                        )}
                        {result.arrival > 0 && (
                          <div className="bg-amber-500 transition-all duration-1000"
                            style={{ width: `${(result.arrival / result.total) * 100}%` }} />
                        )}
                        {result.required > 0 && (
                          <div className="rounded-r-full bg-rose-500 transition-all duration-1000"
                            style={{ width: `${(result.required / result.total) * 100}%` }} />
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-[11px]">
                        <span className="flex items-center gap-1.5 text-white/50">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />{((result.free / result.total) * 100).toFixed(0)}% free
                        </span>
                        <span className="flex items-center gap-1.5 text-white/50">
                          <span className="h-2 w-2 rounded-full bg-amber-500" />{((result.arrival / result.total) * 100).toFixed(0)}% on arrival
                        </span>
                        <span className="flex items-center gap-1.5 text-white/50">
                          <span className="h-2 w-2 rounded-full bg-rose-500" />{((result.required / result.total) * 100).toFixed(0)}% visa required
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Section 3: Top Destinations ── */}
            {result.topDestinations.length > 0 && (
              <section className="py-16 sm:py-20">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
                    className="mb-8">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 mb-1">✈️ Best Access</p>
                    <h2 className="text-2xl font-extrabold text-white">Easiest Countries to Visit</h2>
                    <p className="mt-1 text-sm text-white/40">
                      Countries {result.passport} passport holders can access without a visa or with an easy eVisa
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {result.topDestinations.map((dest, i) => (
                      <motion.div key={dest.name}
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 + i * 0.06, duration: 0.4 }}>
                        <Link
                          href={`/visa/${encodeURIComponent(result.passport)}/${encodeURIComponent(dest.name)}`}
                          className="group flex flex-col items-center gap-3 rounded-2xl border border-white/8 bg-[#0C1526] p-5 text-center transition-all hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5"
                        >
                          <span className="text-4xl">{dest.flag}</span>
                          <div>
                            <div className="text-sm font-bold text-white leading-tight">{dest.name}</div>
                            <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              {bucketVisa(dest.visaType) === 'free' && !dest.visaType.toLowerCase().includes('arrival')
                                ? (dest.visaType.toLowerCase().includes('evisa') || dest.visaType.toLowerCase().includes('electronic') ? 'eVisa' : 'Visa Free')
                                : 'On Arrival'}
                            </div>
                          </div>
                          <span className="text-[10px] text-white/30 group-hover:text-emerald-400 transition flex items-center gap-0.5">
                            Details <ArrowRight className="h-3 w-3" />
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ── Section 4: Share ── */}
            <section className="bg-[#0A1120] py-16 sm:py-20">
              <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
                  className="relative overflow-hidden rounded-3xl p-px"
                  style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(6,182,212,0.15) 50%, rgba(139,92,246,0.2))' }}>
                  <div className="relative rounded-[23px] bg-[#0C1526] p-8 sm:p-10 text-center">
                    <div className="absolute inset-0 rounded-[23px] bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.07),transparent_60%)] pointer-events-none" />
                    <div className="relative">
                      <div className="text-3xl mb-4">✈️</div>
                      <h3 className="text-2xl font-extrabold text-white mb-2">Share Your Passport Score</h3>
                      <p className="text-sm text-white/40 mb-6">Let the world know how powerful your passport is!</p>

                      {/* Preview */}
                      <div className="mb-6 rounded-xl border border-white/8 bg-black/30 px-5 py-4 text-left">
                        <p className="text-sm leading-relaxed text-white/65 font-mono whitespace-pre-line">
                          {`My ${result.passport} ${FLAGS[result.passport] ?? '🌍'} passport scores ${result.score}/100\nand can access ${result.free} countries visa-free! 🛂✈️\nCheck yours → visitplane.com/passport-strength`}
                        </p>
                      </div>

                      {/* Share buttons */}
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button onClick={handleCopy}
                          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
                            copied
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                              : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                          }`}>
                          {copied ? <CheckIcon /> : <CopyIcon />}
                          {copied ? 'Copied!' : 'Copy to Clipboard'}
                        </button>

                        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/12">
                          <TwitterIcon /> Share on X
                        </a>

                        <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-full border border-[#25d366]/25 bg-[#25d366]/10 px-5 py-2.5 text-sm font-bold text-[#25d366] transition hover:bg-[#25d366]/18">
                          <WhatsAppIcon /> WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Section 5: CTA ── */}
      <section className={`py-16 sm:py-20 ${result ? '' : 'bg-[#0A1120]'}`}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-10 text-center sm:p-14">
            <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/6" />
            <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/6" />
            <div className="absolute inset-0 opacity-[0.07]"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
            <div className="relative">
              <div className="mb-4 text-4xl">🔍</div>
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Now Check Visa Requirements
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-white/75">
                Know your passport score? Check detailed visa requirements, processing times, and documents needed for any destination.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/destinations"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-emerald-700 shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl">
                  Check Requirements <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/blog"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/12 px-7 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20">
                  Read Travel Guides
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                {([['Passport Strength','/passport-strength'],['Visa Comparison','/compare'],['Document Checklist','/checklist'],['Currency Converter','/currency-converter'],['Embassy Finder','/embassy-finder']] as [string,string][]).map(([l,h]) => (
                  <li key={l}><Link href={h} className="text-sm text-white/30 hover:text-white transition">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Company</h4>
              <ul className="space-y-2.5">
                {([['About','/about'],['FAQ','/faq'],['Contact','/contact'],['Privacy','/privacy'],['Terms','/terms']] as [string,string][]).map(([l,h]) => (
                  <li key={l}><Link href={h} className="text-sm text-white/30 hover:text-white transition">{l}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-white/5 pt-8 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-white/20">© {new Date().getFullYear()} VisitPlane. All rights reserved.</p>
            <p className="text-xs text-white/15">Scores are estimates. Always verify with official embassy sources.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
