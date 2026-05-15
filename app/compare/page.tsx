'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'

// ─── SEO Metadata (set via useEffect) ─────────────────────────────────────────
// Title: "Visa Comparison Tool 2026 | VisitPlane"

// ─── Supabase ─────────────────────────────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// ─── Countries ────────────────────────────────────────────────────────────────
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

// ─── Types ────────────────────────────────────────────────────────────────────
type VisaRow = {
  country_name: string
  visa_type: string | null
  processing_time: string | null
  price: string | null
  fee: string | null
  cost: string | null
  validity: string | null
  stay_duration: string | null
  required_documents: string | string[] | null
  notes: string | null
}

type CompareResult = {
  country: string
  flag: string
  hasData: boolean
  visaType: string
  processingTime: string
  fee: string
  feeAmount: number
  validity: string
  documents: string[]
  difficulty: 'Easy' | 'Medium' | 'Hard'
  difficultyScore: number
  processingDays: number
}

type FetchState = 'idle' | 'loading' | 'success' | 'error'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDifficulty(visaType: string): { label: 'Easy' | 'Medium' | 'Hard'; score: number } {
  const v = (visaType || '').toLowerCase()
  if (v.includes('visa free') || v.includes('visa-free') || v.includes('no visa') || v === 'free') {
    return { label: 'Easy', score: 1 }
  }
  if (v.includes('evisa') || v.includes('e-visa') || v.includes('electronic') || v.includes('eta')) {
    return { label: 'Easy', score: 2 }
  }
  if (v.includes('arrival') || v.includes('voa')) {
    return { label: 'Medium', score: 3 }
  }
  return { label: 'Hard', score: 4 }
}

function parseProcessingDays(time: string): number {
  if (!time || time === 'Contact embassy' || time === '—') return 999
  const lower = time.toLowerCase()
  if (lower.includes('same day') || lower.includes('instant') || lower.includes('on arrival') || lower.includes('immediately')) return 0
  const daysMatch = lower.match(/(\d+)(?:-\d+)?\s*(?:business\s*)?days?/)
  if (daysMatch) return parseInt(daysMatch[1])
  const weeksMatch = lower.match(/(\d+)\s*weeks?/)
  if (weeksMatch) return parseInt(weeksMatch[1]) * 7
  const monthsMatch = lower.match(/(\d+)\s*months?/)
  if (monthsMatch) return parseInt(monthsMatch[1]) * 30
  return 999
}

function parseFeeAmount(fee: string): number {
  if (!fee || fee === 'Contact embassy' || fee === '—') return 999999
  const lower = fee.toLowerCase()
  if (lower.includes('free') || lower === '$0' || lower === '0' || lower.includes('no fee') || lower.includes('waived')) return 0
  const match = fee.match(/[\d,]+\.?\d*/)
  if (match) return parseFloat(match[0].replace(/,/g, ''))
  return 999999
}

function buildResult(country: string, row: VisaRow | null): CompareResult {
  if (!row) {
    return {
      country, flag: FLAGS[country] ?? '🌍', hasData: false,
      visaType: 'No Data', processingTime: '—', fee: '—',
      feeAmount: 999999, validity: '—', documents: [],
      difficulty: 'Hard', difficultyScore: 5, processingDays: 999,
    }
  }
  const visaType = row.visa_type || 'Visa Required'
  const processingTime = row.processing_time || 'Contact embassy'
  const fee = row.price ?? row.fee ?? row.cost ?? 'Contact embassy'
  const validity = row.validity ?? row.stay_duration ?? 'Varies'
  const { label: difficulty, score: difficultyScore } = getDifficulty(visaType)

  let documents: string[] = []
  if (row.required_documents) {
    try {
      const parsed = typeof row.required_documents === 'string'
        ? JSON.parse(row.required_documents)
        : row.required_documents
      if (Array.isArray(parsed) && parsed.length > 0) documents = parsed.slice(0, 5) as string[]
    } catch { /* ignore */ }
  }
  if (documents.length === 0) {
    documents = ['Valid Passport (6 months)', 'Passport-sized photos', 'Bank statements (3 months)', 'Flight itinerary', 'Hotel booking']
  }

  return {
    country, flag: FLAGS[country] ?? '🌍', hasData: true,
    visaType, processingTime, fee, feeAmount: parseFeeAmount(fee),
    validity, documents, difficulty, difficultyScore,
    processingDays: parseProcessingDays(processingTime),
  }
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function ChevronDown({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
function SpinnerIcon() {
  return (
    <svg className="h-5 w-5 animate-spin text-teal-400" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
function TrophyIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}
function CheckCircle() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
    </svg>
  )
}

// ─── Select Field ─────────────────────────────────────────────────────────────
function SelectField({
  id, label, value, onChange, placeholder, options, disabled, emoji = '🌍',
}: {
  id: string; label: string; value: string; onChange: (v: string) => void
  placeholder: string; options: string[]; disabled: boolean; emoji?: string
}) {
  return (
    <label htmlFor={id} className={`group relative block rounded-xl border p-3.5 transition-all cursor-pointer ${
      disabled
        ? 'border-white/5 opacity-40 cursor-not-allowed'
        : 'border-white/10 hover:border-teal-500/40 focus-within:border-teal-500/60 bg-white/5'
    }`}>
      <span className="block text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-1.5">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-lg leading-none shrink-0">{value ? (FLAGS[value] ?? emoji) : emoji}</span>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none bg-transparent pr-6 text-sm font-medium text-white outline-none disabled:cursor-not-allowed"
          style={{ colorScheme: 'dark' }}
        >
          <option value="" className="bg-[#0c0a1e] text-gray-400">{placeholder}</option>
          {options.map((name) => (
            <option key={name} value={name} className="bg-[#0c0a1e] text-white">{name}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 group-focus-within:text-teal-400 transition" />
      </div>
    </label>
  )
}

// ─── Difficulty Badge ──────────────────────────────────────────────────────────
function DifficultyBadge({ level, highlight }: { level: 'Easy' | 'Medium' | 'Hard'; highlight?: 'green' | 'red' | 'neutral' }) {
  const colors = {
    Easy: highlight === 'green' ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40' : 'bg-emerald-500/10 text-emerald-400',
    Medium: 'bg-amber-500/10 text-amber-400',
    Hard: highlight === 'red' ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40' : 'bg-rose-500/10 text-rose-400',
  }
  const icons = { Easy: '✅', Medium: '⚠️', Hard: '❌' }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${colors[level]}`}>
      <span>{icons[level]}</span> {level}
    </span>
  )
}

// ─── Cell Highlight Wrapper ───────────────────────────────────────────────────
function CellValue({ value, highlight }: { value: string; highlight?: 'green' | 'red' | 'neutral' }) {
  if (!highlight || highlight === 'neutral') {
    return <span className="text-sm font-semibold text-white">{value}</span>
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-bold ${
      highlight === 'green' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
    }`}>
      {highlight === 'green' && <span className="text-[10px]">🏆</span>}
      {value}
    </span>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ComparePage() {
  const [passport, setPassport] = useState('')
  const [availableDests, setAvailableDests] = useState<string[]>([])
  const [loadingDests, setLoadingDests] = useState(false)
  const [dest1, setDest1] = useState('')
  const [dest2, setDest2] = useState('')
  const [dest3, setDest3] = useState('')
  const [fetchState, setFetchState] = useState<FetchState>('idle')
  const [results, setResults] = useState<CompareResult[]>([])
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Page title
  useEffect(() => {
    document.title = 'Visa Comparison Tool 2026 | VisitPlane'
  }, [])

  // Scroll for navbar
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  // Load destinations from DB when passport changes
  useEffect(() => {
    if (!passport) {
      setAvailableDests([])
      setDest1(''); setDest2(''); setDest3('')
      return
    }
    setLoadingDests(true)
    setDest1(''); setDest2(''); setDest3('')
    getSupabase()
      .from('destinations')
      .select('country_name')
      .eq('passport_country', passport)
      .order('country_name')
      .then(({ data }) => {
        if (data) {
          const unique = [...new Set(data.map((r) => r.country_name))].sort()
          setAvailableDests(unique)
        }
        setLoadingDests(false)
      })
  }, [passport])

  const selectedDests = [dest1, dest2, dest3].filter(Boolean)
  const canCompare = passport && selectedDests.length >= 1

  const handleCompare = async () => {
    if (!canCompare) return
    setFetchState('loading')
    setResults([])

    try {
      const { data, error } = await getSupabase()
        .from('destinations')
        .select('country_name, visa_type, processing_time, price, fee, cost, validity, stay_duration, required_documents, notes')
        .eq('passport_country', passport)
        .in('country_name', selectedDests)

      if (error) throw error

      // Group by country_name — take first tourism-like record per country
      const byCountry: Record<string, VisaRow> = {}
      if (data) {
        data.forEach((row) => {
          if (!byCountry[row.country_name]) {
            byCountry[row.country_name] = row as VisaRow
          }
        })
      }

      const compareResults = selectedDests.map((country) =>
        buildResult(country, byCountry[country] ?? null)
      )

      setResults(compareResults)
      setFetchState('success')

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    } catch (err) {
      console.error(err)
      setFetchState('error')
    }
  }

  // ── Derived comparison values ──────────────────────────────────────────────
  const validResults = results.filter((r) => r.hasData)

  const minDiffScore = validResults.length > 0 ? Math.min(...validResults.map((r) => r.difficultyScore)) : 0
  const maxDiffScore = validResults.length > 0 ? Math.max(...validResults.map((r) => r.difficultyScore)) : 0
  const minFee = validResults.length > 0 ? Math.min(...validResults.map((r) => r.feeAmount)) : 0
  const maxFee = validResults.length > 0 ? Math.max(...validResults.map((r) => r.feeAmount)) : 0
  const minDays = validResults.length > 0 ? Math.min(...validResults.map((r) => r.processingDays)) : 0
  const maxDays = validResults.length > 0 ? Math.max(...validResults.map((r) => r.processingDays)) : 0

  function getHighlight(value: number, min: number, max: number, lowerIsBetter: boolean): 'green' | 'red' | 'neutral' {
    if (min === max) return 'neutral'
    if (lowerIsBetter) {
      if (value === min) return 'green'
      if (value === max) return 'red'
    } else {
      if (value === max) return 'green'
      if (value === min) return 'red'
    }
    return 'neutral'
  }

  // Winner
  const winner = validResults.length > 0
    ? validResults.reduce((best, curr) => {
        if (curr.difficultyScore < best.difficultyScore) return curr
        if (curr.difficultyScore === best.difficultyScore && curr.feeAmount < best.feeAmount) return curr
        if (curr.difficultyScore === best.difficultyScore && curr.feeAmount === best.feeAmount && curr.processingDays < best.processingDays) return curr
        return best
      })
    : null

  const winnerReason = winner
    ? winner.difficultyScore <= 2
      ? `Easiest visa process — ${winner.visaType}`
      : winner.feeAmount === minFee && minFee < 999999
      ? `Most affordable at ${winner.fee}`
      : winner.processingDays === minDays
      ? `Fastest processing (${winner.processingTime})`
      : `Best overall option`
    : ''

  const navLinks = [
    { label: 'Explore', href: '/destinations' },
    { label: 'Visa Requirements', href: '/destinations' },
    { label: 'Passport Strength', href: '/passport-strength' },
    { label: '⚖️ Compare Visas', href: '/compare' },
    { label: 'Guides', href: '/blog' },
  ]

  const destPlaceholder = !passport
    ? 'Select passport first'
    : loadingDests
    ? 'Loading…'
    : availableDests.length === 0
    ? 'No destinations found'
    : 'Select destination'

  // Table rows definition
  const TABLE_ROWS = [
    { id: 'visa',       icon: '🛂', label: 'Visa Type' },
    { id: 'processing', icon: '⏱️', label: 'Processing Time' },
    { id: 'fee',        icon: '💰', label: 'Visa Fee' },
    { id: 'validity',   icon: '📅', label: 'Validity Period' },
    { id: 'documents',  icon: '📋', label: 'Documents Required' },
    { id: 'difficulty', icon: '✅', label: 'Overall Difficulty' },
  ]

  return (
    <div className="min-h-screen bg-[#060C18] text-white antialiased overflow-x-hidden">

      {/* ──────────────────────── NAVBAR ──────────────────────────────── */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#060C18]/95 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/30'
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
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 hover:text-white ${
                  item.href === '/compare'
                    ? 'text-teal-400 font-semibold'
                    : 'text-white/55'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/destinations"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600 hover:-translate-y-px"
            >
              Check Visa <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-white/55 hover:bg-white/5 hover:text-white md:hidden transition"
            >
              {mobileOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-white/5 bg-[#060C18]/98 backdrop-blur-xl md:hidden overflow-hidden"
            >
              <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
                {navLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white transition"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ──────────────────────── SECTION 1: HERO ─────────────────────── */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Glow blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.14),transparent_60%)]" />
          <div className="absolute -left-40 top-40 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.07),transparent_70%)]" />
          <div className="absolute -right-40 top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.07),transparent_70%)]" />
        </div>
        {/* Grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.4) 1px,transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-400 backdrop-blur-sm">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
              ⚖️ Visa Comparison Tool
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-5xl font-extrabold leading-[1.06] tracking-tight sm:text-6xl lg:text-[4.5rem]"
          >
            <span className="text-white">Compare Visas</span>
            <br />
            <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Side by Side
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-5 max-w-lg text-base text-white/45 sm:text-lg"
          >
            Choose your passport and up to 3 destinations to instantly compare visa fees, processing times, and requirements side by side.
          </motion.p>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-white/30"
          >
            {['⚡ Instant results', '🌍 200+ countries', '💡 Smart recommendations', '🆓 Always free'].map((s) => (
              <span key={s} className="flex items-center gap-1">{s}</span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ──────────────────────── SECTION 2: SETUP ────────────────────── */}
      <section className="bg-[#0a0720] py-12 sm:py-16 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Card */}
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-2 shadow-2xl shadow-black/60 backdrop-blur-sm">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/8 via-transparent to-cyan-500/8 pointer-events-none" />
              <div className="relative rounded-xl bg-[#0d0b24] p-6">
                <div className="mb-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-teal-400 mb-1">Step 1</p>
                  <h2 className="text-lg font-extrabold text-white">Select Your Passport</h2>
                </div>

                {/* Passport selector */}
                <SelectField
                  id="passport"
                  label="My Passport Country"
                  value={passport}
                  onChange={setPassport}
                  placeholder="Choose your country…"
                  options={PASSPORT_COUNTRIES}
                  disabled={false}
                  emoji="🛂"
                />

                {/* Divider */}
                <div className="my-6 flex items-center gap-3">
                  <div className="flex-1 border-t border-white/5" />
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">Step 2 — Pick Destinations</p>
                  <div className="flex-1 border-t border-white/5" />
                </div>

                {/* 3 destination selectors */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <SelectField
                    id="dest1"
                    label="🏳️ Destination 1"
                    value={dest1}
                    onChange={setDest1}
                    placeholder={destPlaceholder}
                    options={availableDests.filter((d) => d !== dest2 && d !== dest3)}
                    disabled={!passport || loadingDests}
                  />
                  <SelectField
                    id="dest2"
                    label="🏳️ Destination 2"
                    value={dest2}
                    onChange={setDest2}
                    placeholder={destPlaceholder}
                    options={availableDests.filter((d) => d !== dest1 && d !== dest3)}
                    disabled={!passport || loadingDests}
                  />
                  <SelectField
                    id="dest3"
                    label="🏳️ Destination 3 (optional)"
                    value={dest3}
                    onChange={setDest3}
                    placeholder={destPlaceholder}
                    options={availableDests.filter((d) => d !== dest1 && d !== dest2)}
                    disabled={!passport || loadingDests}
                  />
                </div>

                {/* Popular quick picks */}
                {passport && availableDests.length > 0 && !dest1 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-white/25">Popular:</span>
                    {['UAE', 'Japan', 'United Kingdom', 'Turkey', 'Singapore', 'France']
                      .filter((c) => availableDests.includes(c))
                      .slice(0, 5)
                      .map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            if (!dest1) setDest1(c)
                            else if (!dest2) setDest2(c)
                            else if (!dest3) setDest3(c)
                          }}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/45 transition hover:border-teal-500/40 hover:text-white hover:bg-teal-500/10"
                        >
                          {FLAGS[c] ?? '🌍'} {c}
                        </button>
                      ))}
                  </div>
                )}

                {/* Compare button */}
                <button
                  onClick={handleCompare}
                  disabled={!canCompare || fetchState === 'loading'}
                  className="mt-5 group flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition-all hover:from-teal-600 hover:to-cyan-600 hover:shadow-teal-500/40 disabled:from-white/8 disabled:to-white/5 disabled:text-white/25 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {fetchState === 'loading' ? (
                    <><SpinnerIcon /> Comparing…</>
                  ) : (
                    <>⚖️ Compare Now <ArrowRight className="h-4 w-4 group-enabled:group-hover:translate-x-0.5 transition" /></>
                  )}
                </button>
                {!passport && (
                  <p className="mt-2 text-center text-xs text-white/25">Select your passport to get started</p>
                )}
                {passport && selectedDests.length === 0 && (
                  <p className="mt-2 text-center text-xs text-amber-400/70">Select at least 1 destination to compare</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──────────────────────── RESULTS ─────────────────────────────── */}
      <AnimatePresence mode="wait">
        {fetchState === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="py-16 text-center"
          >
            <div className="mx-auto max-w-md rounded-2xl border border-rose-500/20 bg-rose-500/5 px-8 py-10">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-bold text-white mb-2">Something went wrong</h3>
              <p className="text-sm text-white/40 mb-5">Could not fetch visa data. Please try again.</p>
              <button
                onClick={handleCompare}
                className="rounded-full bg-teal-500/15 border border-teal-500/30 px-5 py-2 text-sm font-semibold text-teal-400 hover:bg-teal-500/25 transition"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}

        {fetchState === 'success' && results.length > 0 && (
          <motion.div
            key="results"
            ref={resultsRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* ──── SECTION 3: COMPARISON TABLE ───── */}
            <section className="py-14 sm:py-20 border-t border-white/5">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mb-10 text-center"
                >
                  <p className="text-[11px] font-bold uppercase tracking-widest text-teal-400 mb-2">📊 Side-by-Side</p>
                  <h2 className="text-3xl font-extrabold text-white">Visa Comparison Results</h2>
                  <p className="mt-2 text-sm text-white/40">
                    Comparing {results.length} destination{results.length > 1 ? 's' : ''} for {FLAGS[passport] ?? '🌍'} {passport} passport holders
                  </p>
                </motion.div>

                {/* Table */}
                <div className="overflow-x-auto rounded-2xl border border-white/8">
                  <table className="w-full min-w-[500px]">
                    {/* Header row — destination columns */}
                    <thead>
                      <tr className="border-b border-white/8 bg-[#0d0b24]">
                        <th className="px-5 py-4 text-left w-44 shrink-0">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Criteria</span>
                        </th>
                        {results.map((r) => (
                          <th key={r.country} className="px-4 py-4 text-center">
                            <div className="flex flex-col items-center gap-1.5">
                              <span className="text-3xl">{r.flag}</span>
                              <span className="text-sm font-extrabold text-white leading-tight">{r.country}</span>
                              {!r.hasData && (
                                <span className="text-[9px] text-rose-400 font-semibold uppercase">No data</span>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-[#080618]">
                      {TABLE_ROWS.map((row, rowIdx) => (
                        <tr
                          key={row.id}
                          className={`border-b border-white/5 transition-colors hover:bg-white/[0.02] ${
                            rowIdx % 2 === 0 ? '' : 'bg-white/[0.015]'
                          }`}
                        >
                          {/* Row label */}
                          <td className="px-5 py-4 align-middle">
                            <div className="flex items-center gap-2.5">
                              <span className="text-lg leading-none">{row.icon}</span>
                              <span className="text-xs font-bold text-white/50 uppercase tracking-wide">{row.label}</span>
                            </div>
                          </td>

                          {/* Data cells */}
                          {results.map((r) => {
                            if (!r.hasData) {
                              return (
                                <td key={r.country} className="px-4 py-4 text-center align-middle">
                                  <span className="text-sm text-white/20">—</span>
                                </td>
                              )
                            }

                            if (row.id === 'visa') {
                              return (
                                <td key={r.country} className="px-4 py-4 text-center align-middle">
                                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                    r.difficultyScore <= 2
                                      ? 'bg-emerald-500/15 text-emerald-300'
                                      : r.difficultyScore === 3
                                      ? 'bg-amber-500/15 text-amber-300'
                                      : 'bg-rose-500/15 text-rose-300'
                                  }`}>
                                    {r.difficultyScore <= 2 ? '🟢' : r.difficultyScore === 3 ? '🟡' : '🔴'}
                                    {r.visaType}
                                  </span>
                                </td>
                              )
                            }

                            if (row.id === 'processing') {
                              const hl = getHighlight(r.processingDays, minDays, maxDays, true)
                              return (
                                <td key={r.country} className="px-4 py-4 text-center align-middle">
                                  <CellValue value={r.processingTime} highlight={validResults.length > 1 ? hl : 'neutral'} />
                                </td>
                              )
                            }

                            if (row.id === 'fee') {
                              const hl = getHighlight(r.feeAmount, minFee, maxFee, true)
                              return (
                                <td key={r.country} className="px-4 py-4 text-center align-middle">
                                  <CellValue value={r.fee} highlight={validResults.length > 1 ? hl : 'neutral'} />
                                </td>
                              )
                            }

                            if (row.id === 'validity') {
                              return (
                                <td key={r.country} className="px-4 py-4 text-center align-middle">
                                  <span className="text-sm font-semibold text-white/80">{r.validity}</span>
                                </td>
                              )
                            }

                            if (row.id === 'documents') {
                              return (
                                <td key={r.country} className="px-4 py-4 text-center align-middle">
                                  <div className="space-y-1 text-left">
                                    {r.documents.slice(0, 3).map((doc, i) => (
                                      <div key={i} className="flex items-start gap-1.5">
                                        <CheckCircle />
                                        <span className="text-[11px] text-white/55 leading-snug">{doc}</span>
                                      </div>
                                    ))}
                                    {r.documents.length > 3 && (
                                      <p className="text-[10px] text-white/30 pl-5">+{r.documents.length - 3} more</p>
                                    )}
                                  </div>
                                </td>
                              )
                            }

                            if (row.id === 'difficulty') {
                              const hl = getHighlight(r.difficultyScore, minDiffScore, maxDiffScore, true)
                              return (
                                <td key={r.country} className="px-4 py-4 text-center align-middle">
                                  <DifficultyBadge level={r.difficulty} highlight={validResults.length > 1 ? hl : undefined} />
                                </td>
                              )
                            }

                            return <td key={r.country} className="px-4 py-4" />
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Color key */}
                {validResults.length > 1 && (
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/30">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Best option</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-400" /> Worst option</span>
                    <span className="flex items-center gap-1.5">🏆 Highlighted cells = winner for that category</span>
                  </div>
                )}
              </div>
            </section>

            {/* ──── SECTION 4: WINNER CARD ───── */}
            {winner && validResults.length > 1 && (
              <section className="bg-[#0a0720] py-12 sm:py-16 border-t border-white/5">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl p-px"
                    style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.4), rgba(6,182,212,0.2) 50%, rgba(16,185,129,0.3))' }}
                  >
                    <div className="relative rounded-[23px] bg-[#0d0b24] p-8 sm:p-10">
                      {/* Glow */}
                      <div className="absolute inset-0 rounded-[23px] bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.1),transparent_60%)] pointer-events-none" />

                      <div className="relative flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-6">
                        {/* Trophy */}
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/30 text-white">
                          <TrophyIcon />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-widest text-teal-400 mb-1">🏆 Best Option For You</p>
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <span className="text-4xl">{winner.flag}</span>
                            <h3 className="text-3xl font-extrabold text-white">{winner.country}</h3>
                          </div>
                          <p className="text-sm text-white/55 mb-4">{winnerReason}</p>

                          {/* Quick stats */}
                          <div className="flex flex-wrap gap-3">
                            <div className="rounded-xl border border-teal-500/20 bg-teal-500/10 px-4 py-2.5 text-center">
                              <div className="text-lg font-extrabold text-teal-300">{winner.difficulty}</div>
                              <div className="text-[10px] uppercase tracking-wide text-teal-400/60 mt-0.5">Difficulty</div>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center">
                              <div className="text-lg font-extrabold text-white">{winner.fee}</div>
                              <div className="text-[10px] uppercase tracking-wide text-white/30 mt-0.5">Visa Fee</div>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center">
                              <div className="text-lg font-extrabold text-white">{winner.processingTime}</div>
                              <div className="text-[10px] uppercase tracking-wide text-white/30 mt-0.5">Processing</div>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center">
                              <div className="text-lg font-extrabold text-white">{winner.validity}</div>
                              <div className="text-[10px] uppercase tracking-wide text-white/30 mt-0.5">Validity</div>
                            </div>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="shrink-0">
                          <Link
                            href={`/visa/${encodeURIComponent(passport)}/${encodeURIComponent(winner.country)}`}
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition hover:from-teal-600 hover:to-cyan-600 hover:-translate-y-0.5"
                          >
                            Full Details <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </section>
            )}

            {/* ──── SECTION 5: CTA PER DESTINATION ───── */}
            <section className="py-12 sm:py-16 border-t border-white/5">
              <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/30 text-center mb-6">
                    📋 Full Requirements
                  </p>
                  <div className={`grid gap-4 ${results.length === 1 ? 'sm:grid-cols-1 max-w-xs mx-auto' : results.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
                    {results.map((r, i) => (
                      <motion.div
                        key={r.country}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 + i * 0.08, duration: 0.4 }}
                      >
                        <Link
                          href={`/visa/${encodeURIComponent(passport)}/${encodeURIComponent(r.country)}`}
                          className={`group flex flex-col items-center gap-3 rounded-2xl border p-6 text-center transition-all hover:-translate-y-1 hover:shadow-xl ${
                            winner && r.country === winner.country
                              ? 'border-teal-500/30 bg-teal-500/5 hover:border-teal-500/50 hover:shadow-teal-500/10'
                              : 'border-white/8 bg-[#0d0b24] hover:border-white/15'
                          }`}
                        >
                          <span className="text-4xl">{r.flag}</span>
                          <div>
                            <p className="font-extrabold text-white text-lg">{r.country}</p>
                            <p className="text-xs text-white/40 mt-1">{r.visaType}</p>
                          </div>
                          {winner && r.country === winner.country && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/15 border border-teal-500/30 px-3 py-1 text-[10px] font-bold text-teal-400 uppercase tracking-wide">
                              🏆 Recommended
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/40 group-hover:text-teal-400 transition mt-1">
                            Check full requirements <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition" />
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────────────── FINAL CTA ───────────────────────────── */}
      <section className={`py-16 sm:py-20 ${fetchState !== 'success' ? 'mt-8' : ''}`}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-700 p-10 text-center sm:p-14">
            <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/6" />
            <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/6" />
            <div className="absolute inset-0 opacity-[0.07]"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
            <div className="relative">
              <div className="mb-4 text-4xl">✈️</div>
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Ready to Plan Your Trip?</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-white/75">
                Get full visa requirements, document checklists, and processing details for any destination.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/destinations"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-teal-700 shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
                >
                  Check Visa Requirements <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/passport-strength"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/12 px-7 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  🛂 My Passport Strength
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────── FOOTER ──────────────────────────────── */}
      <footer className="border-t border-white/5 bg-[#040810] pb-8 pt-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo-v2.png" alt="VisitPlane" width={30} height={30} className="rounded-xl" />
              <span className="text-base font-bold">
                <span className="text-white">Visit</span><span className="text-emerald-400">Plane</span>
              </span>
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-5">
              <Link href="/" className="text-xs text-white/30 hover:text-white transition">Home</Link>
              <Link href="/destinations" className="text-xs text-white/30 hover:text-white transition">Destinations</Link>
              <Link href="/passport-strength" className="text-xs text-white/30 hover:text-white transition">Passport Strength</Link>
              <Link href="/compare" className="text-xs text-teal-400/70 hover:text-teal-400 transition">Compare Visas</Link>
              <Link href="/blog" className="text-xs text-white/30 hover:text-white transition">Blog</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-white/5 pt-6 flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-xs text-white/20">© {new Date().getFullYear()} VisitPlane. All rights reserved.</p>
            <p className="text-xs text-white/15">Visa data is estimated. Always verify with official embassy sources.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
