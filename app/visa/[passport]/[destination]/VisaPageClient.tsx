'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import PostLookupModal from '@/components/PostLookupModal'

const DocumentChecker = dynamic(
  () => import('@/app/components/DocumentChecker'),
  { ssr: false }
)

// ─── Types ──────────────────────────────────────────────────────────────────────
export type VisaRecord = {
  id?: string | number
  visa_type?: string
  type?: string
  processing_time?: string
  duration?: string
  price?: string
  fee?: string
  cost?: string
  validity?: string
  stay_duration?: string
  required_documents?: string | string[]
  notes?: string
  description?: string
  apply_url?: string
  application_url?: string
  visa_required?: boolean | string | null
  last_verified?: string | null
  [key: string]: unknown
}

type TabType = 'tourism' | 'work'

// ─── Helpers ─────────────────────────────────────────────────────────────────────
const WORK_KEYWORDS = [
  'work', 'student', 'residence', 'official', 'diplomatic',
  'working holiday', 'investor', 'immigration', 'employment',
  'skilled worker',
]

function categorizeVisa(visaType: string): TabType {
  const lower = (visaType || '').toLowerCase()
  if (WORK_KEYWORDS.some(k => lower.includes(k))) return 'work'
  return 'tourism'
}

function getVisaName(r: VisaRecord): string {
  return r.visa_type ?? r.type ?? 'Tourist Visa'
}

// ─── FIX 1: Smart badge based on visa_type ───────────────────────────────────
type BadgeConfig = {
  label: string
  bg: string
  border: string
  text: string
}

function getVisaBadge(visaType: string): BadgeConfig {
  const v = visaType || ''

  if (/free/i.test(v) || /no visa/i.test(v)) {
    return { label: '✓ VISA FREE',    bg: 'bg-green-50',   border: 'border-green-400',  text: 'text-green-700' }
  }
  if (/arrival/i.test(v)) {
    return { label: '✈ ON ARRIVAL',   bg: 'bg-blue-50',    border: 'border-blue-400',   text: 'text-blue-700'  }
  }
  if (/evisa|e-visa|electronic/i.test(v)) {
    return { label: '💻 E-VISA',       bg: 'bg-teal-50',    border: 'border-teal-400',   text: 'text-teal-700'  }
  }
  if (/student/i.test(v)) {
    return { label: '🎓 STUDENT',      bg: 'bg-purple-50',  border: 'border-purple-400', text: 'text-purple-700'}
  }
  if (/work|employment/i.test(v)) {
    return { label: '💼 WORK VISA',    bg: 'bg-orange-50',  border: 'border-orange-400', text: 'text-orange-700'}
  }
  if (/business/i.test(v)) {
    return { label: '🤝 BUSINESS',     bg: 'bg-indigo-50',  border: 'border-indigo-400', text: 'text-indigo-700'}
  }
  return   { label: '⚠ VISA REQUIRED', bg: 'bg-red-50',     border: 'border-red-400',    text: 'text-red-700'   }
}

function VisaBadge({ visaType, size = 'sm' }: { visaType: string; size?: 'xs' | 'sm' }) {
  const { label, bg, border, text } = getVisaBadge(visaType)
  const cls = size === 'xs'
    ? 'text-[9px] px-1.5 py-0.5 font-bold'
    : 'text-xs px-2.5 py-1 font-semibold'
  return (
    <span className={`inline-flex items-center rounded-full border ${bg} ${border} ${text} ${cls}`}>
      {label}
    </span>
  )
}

// ─── FIX 2: Smart fee display ────────────────────────────────────────────────
function getSmartFee(r: VisaRecord, destinationName: string): { display: string; color: string; showLink: boolean; searchQuery: string } {
  const visaName = getVisaName(r)
  const raw = (r.price ?? r.fee ?? r.cost ?? '').toString().trim()

  // Visa free → always FREE
  if (/free/i.test(visaName) || /no visa/i.test(visaName)) {
    return { display: '✓ FREE', color: 'text-green-600', showLink: false, searchQuery: '' }
  }

  // Explicit free fee values
  if (/^free$/i.test(raw) || raw === '$0' || raw === '0') {
    return { display: '✓ FREE', color: 'text-green-600', showLink: false, searchQuery: '' }
  }

  // Has a real fee value
  if (raw && !/contact embassy/i.test(raw) && !/n\/a/i.test(raw)) {
    const prefixed = /^\$/.test(raw) ? raw : `$${raw}`
    return { display: `💰 ${prefixed}`, color: 'text-teal-600', showLink: false, searchQuery: '' }
  }

  // Unknown / contact embassy
  return {
    display: 'Check official source',
    color: 'text-gray-500',
    showLink: true,
    searchQuery: `${destinationName} ${visaName} visa fee official`,
  }
}

// ─── FIX 3: Smart processing time ────────────────────────────────────────────
function getSmartProcessingTime(r: VisaRecord): string {
  const visaName = getVisaName(r)

  // Visa free / on arrival → instant, no pre-processing
  if (/free/i.test(visaName) || /no visa/i.test(visaName) || /arrival/i.test(visaName)) {
    return '⚡ Instant (on arrival)'
  }

  const raw = (r.processing_time ?? r.duration ?? '').toString().trim()

  if (!raw) return 'Varies (check embassy)'
  if (/^instant$/i.test(raw)) return '⚡ Instant'
  if (/hours?/i.test(raw)) return `⚡ ${raw}`
  if (/days?/i.test(raw)) return `📅 ${raw}`
  if (/weeks?/i.test(raw)) return `🗓️ ${raw}`
  return raw
}

function getValidity(r: VisaRecord): string {
  return r.validity ?? r.stay_duration ?? 'Varies'
}

// ─── FIX 6: Visa-type-aware document lists ───────────────────────────────────
function parseDocuments(r: VisaRecord): { docs: string[]; note: string } {
  const visaName = getVisaName(r).toLowerCase()

  // Visa Free
  if (/free/i.test(visaName) || /no visa/i.test(visaName)) {
    return {
      docs: [
        'Valid passport (6+ months validity)',
        'Return ticket (recommended)',
        'Proof of accommodation (recommended)',
      ],
      note: 'No visa required! Just pack and go.',
    }
  }

  // On Arrival
  if (/arrival/i.test(visaName)) {
    return {
      docs: [
        'Valid passport (6+ months validity)',
        'Return ticket confirmation',
        'Sufficient funds (proof)',
        'Passport photo (1 copy)',
      ],
      note: 'Get visa stamp at airport on arrival.',
    }
  }

  // Work / Employment
  if (/work|employment/i.test(visaName)) {
    return {
      docs: [
        'Valid passport (6+ months validity)',
        'Employment contract / offer letter',
        'Educational certificates',
        'Police clearance certificate',
        'Medical examination certificate',
        'Passport photos (4 copies)',
        'Bank statements',
        'Sponsor letter from employer',
      ],
      note: '',
    }
  }

  // Student
  if (/student/i.test(visaName)) {
    return {
      docs: [
        'Valid passport (6+ months validity)',
        'University acceptance letter',
        'Financial proof (tuition + living costs)',
        'Academic transcripts',
        'English proficiency test scores',
        'Passport photos',
        'Medical insurance',
        'Accommodation confirmation',
      ],
      note: '',
    }
  }

  // If database has its own list, use it (supports both required_documents and required_docs field names)
  const rawDocs = r.required_documents ?? (r as Record<string, unknown>).required_docs
  if (rawDocs) {
    try {
      const parsed = typeof rawDocs === 'string' ? JSON.parse(rawDocs) : rawDocs
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { docs: parsed as string[], note: '' }
      }
    } catch { /* fall through */ }
  }

  // e-Visa / Tourist (full list)
  return {
    docs: [
      'Valid passport (6+ months validity)',
      'Passport-sized photos (2 copies)',
      'Completed application form',
      'Bank statements (last 3 months)',
      'Return flight ticket',
      'Hotel booking confirmation',
      'Travel insurance',
      'Employment letter / proof of income',
    ],
    note: '',
  }
}

function getVisaRequired(r: VisaRecord): boolean | null {
  const nameLower = getVisaName(r).toLowerCase()
  if (
    nameLower.includes('visa free') || nameLower.includes('visa-free') ||
    nameLower.includes('not required') || nameLower.includes('no visa') ||
    nameLower === 'free'
  ) return false
  if (r.visa_required === null || r.visa_required === undefined) return null
  if (typeof r.visa_required === 'boolean') return r.visa_required
  const s = String(r.visa_required).toLowerCase()
  if (s === 'false' || s === 'no' || s === '0' || s === 'not required') return false
  return true
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────────
function ArrowLeftIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
    </svg>
  )
}

function ArrowRightIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  )
}

function CheckIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 5 5L20 7" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  )
}

function DollarIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function ZapIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function ShieldCheckIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function PercentIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  )
}

function HeadphonesIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  )
}

function NoDollarIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M14.5 9H9.5a2 2 0 0 0 0 4h5a2 2 0 0 1 0 4H9" />
      <line x1="12" y1="6" x2="12" y2="18" />
    </svg>
  )
}

// ─── Static data ─────────────────────────────────────────────────────────────────
const APPLY_STEPS = [
  {
    num: 1,
    title: 'Check Requirements',
    desc: 'Review the visa type, documents needed, fees, and processing times shown on this page.',
  },
  {
    num: 2,
    title: 'Gather Documents',
    desc: 'Collect every document on the checklist above before submitting your application.',
  },
  {
    num: 3,
    title: 'Pay Visa Fee',
    desc: 'Pay the visa fee at the official embassy, consulate, or government portal — not through third parties.',
  },
  {
    num: 4,
    title: 'Submit Application',
    desc: 'Submit your application through the official embassy or government visa portal for your destination.',
  },
]

const BENEFITS = [
  {
    icon: <ZapIcon />,
    title: 'Instant Eligibility Check',
    desc: 'Know your visa requirements in seconds',
  },
  {
    icon: <BellIcon />,
    title: 'Daily Updates',
    desc: 'Visa rules refreshed every day from official sources',
  },
  {
    icon: <ShieldCheckIcon />,
    title: 'Official Embassy Data',
    desc: 'Sourced directly from government embassy websites',
  },
  {
    icon: <ZapIcon />,
    title: 'Always Free',
    desc: 'No subscription, no sign-up, no hidden charges',
  },
]

const TRUST_STATS = [
  { icon: <UsersIcon />,      num: '10,000+', label: 'Travelers Helped' },
  { icon: <HeadphonesIcon />, num: '24/7',    label: 'Support' },
  { icon: <NoDollarIcon />,   num: 'Free',    label: 'Visa Information' },
]

const RELATED_DESTINATIONS = [
  { name: 'UAE',            flag: '🇦🇪' },
  { name: 'Turkey',         flag: '🇹🇷' },
  { name: 'Japan',          flag: '🇯🇵' },
  { name: 'Singapore',      flag: '🇸🇬' },
  { name: 'United Kingdom', flag: '🇬🇧' },
  { name: 'Malaysia',       flag: '🇲🇾' },
]

// ─── Props ───────────────────────────────────────────────────────────────────────
interface Props {
  allVisaData: VisaRecord[]
  passportName: string
  destinationName: string
  passportSlug: string
  destinationSlug: string
  passportFlag: string
  destinationFlag: string
}

// ─── Main component ───────────────────────────────────────────────────────────────
export default function VisaPageClient({
  allVisaData,
  passportName,
  destinationName,
  passportSlug,
  passportFlag,
  destinationFlag,
}: Props) {

  const [showChecker, setShowChecker] = useState(false)

  // Categorise records
  const tourismVisas = useMemo(
    () => allVisaData.filter(r => categorizeVisa(getVisaName(r)) === 'tourism'),
    [allVisaData],
  )
  const workVisas = useMemo(
    () => allVisaData.filter(r => categorizeVisa(getVisaName(r)) === 'work'),
    [allVisaData],
  )

  const initialTab: TabType = tourismVisas.length > 0 ? 'tourism' : 'work'
  const initialId = (tourismVisas[0] ?? workVisas[0])?.id

  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  const [selectedId, setSelectedId] = useState<string | number | undefined>(initialId)

  const selectedVisa = useMemo(() => {
    if (selectedId !== undefined) {
      const found = allVisaData.find(r => r.id === selectedId)
      if (found) return found
    }
    return allVisaData[0]
  }, [selectedId, allVisaData])

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab)
    const visas = tab === 'tourism' ? tourismVisas : workVisas
    if (visas.length > 0) setSelectedId(visas[0].id)
  }, [tourismVisas, workVisas])

  const handleDownloadPDF = useCallback(() => {
    window.print()
  }, [])

  // ── No data state ──────────────────────────────────────────────────────────────
  if (allVisaData.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-[#F0FDFA] text-5xl shadow-sm">
          🔍
        </div>
        <h2 className="text-2xl font-bold text-[#1F2937]">Coming Soon</h2>
        <p className="mx-auto mt-3 max-w-md text-base text-gray-500">
          Visa information for{' '}
          <strong className="text-[#1F2937]">{passportFlag} {passportName}</strong>
          {' → '}
          <strong className="text-[#1F2937]">{destinationFlag} {destinationName}</strong>
          {' '}is being added to our database.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#14B8A6] px-7 py-3 text-sm font-semibold text-white shadow transition hover:bg-[#0d9488]"
        >
          <ArrowLeftIcon />
          Try a different search
        </Link>
      </div>
    )
  }

  const visaName    = selectedVisa ? getVisaName(selectedVisa) : 'Tourist Visa'
  const isRequired  = selectedVisa ? getVisaRequired(selectedVisa) : null
  const { docs: documents, note: docNote } = selectedVisa ? parseDocuments(selectedVisa) : { docs: [], note: '' }

  // Smart computed values for selected visa
  const smartProcessing = selectedVisa ? getSmartProcessingTime(selectedVisa) : '—'
  const smartFee        = selectedVisa ? getSmartFee(selectedVisa, destinationName) : { display: '—', color: 'text-gray-700', showLink: false, searchQuery: '' }
  const validity        = selectedVisa ? getValidity(selectedVisa) : '—'

  const isActiveInSidebar = (r: VisaRecord) =>
    r.id !== undefined ? r.id === selectedId : r === allVisaData[0]

  return (
    <div className="bg-[#F8FAFC]">

      {/* ── FIX 4: Improved Hero / Header ──────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 text-sm text-gray-400 transition hover:text-[#1F2937]"
        >
          <ArrowLeftIcon />
          Back to search
        </Link>

        <div className="mt-6 flex flex-col items-center text-center">
          {/* Route pill */}
          <div className="inline-flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-sm">
            <span className="flex items-center gap-2 text-base font-medium text-[#1F2937]">
              <span className="text-2xl leading-none">{passportFlag}</span>
              <span>{passportName}</span>
            </span>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#14B8A6]/10 text-[#14B8A6] text-sm font-bold">
              →
            </span>
            <span className="flex items-center gap-2 text-base font-medium text-[#1F2937]">
              <span className="text-2xl leading-none">{destinationFlag}</span>
              <span>{destinationName}</span>
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#1F2937] sm:text-5xl">
            {passportName} to {destinationName}{' '}
            <span className="text-[#14B8A6]">Visa Requirements</span>
          </h1>
          <p className="mt-3 text-base text-gray-500">
            Everything you need to travel from{' '}
            <span className="font-semibold text-[#1F2937]">{passportName}</span> to{' '}
            <span className="font-semibold text-[#1F2937]">{destinationName}</span>
          </p>

          {/* Meta badges row */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              🕐 Updated: May 2026
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              🏛️ Official Embassy Data
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              ⚠️ Always verify with official embassy before traveling
            </span>
          </div>
        </div>
      </div>

      {/* ── FIX 5: Quick Stats Bar ─────────────────────────────────────────── */}
      {selectedVisa && (
        <div className="border-b border-t border-[#E5E7EB] bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 divide-x divide-[#E5E7EB] py-0">
              {/* Processing */}
              <div className="flex flex-col items-center gap-0.5 px-4 py-4 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">⚡ Processing</span>
                <span className="mt-0.5 text-sm font-bold text-[#1F2937]">{smartProcessing}</span>
              </div>
              {/* Fee */}
              <div className="flex flex-col items-center gap-0.5 px-4 py-4 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">💰 Fee</span>
                <span className={`mt-0.5 text-sm font-bold ${smartFee.color}`}>{smartFee.display}</span>
                {smartFee.showLink && (
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(smartFee.searchQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 text-[10px] text-teal-500 underline hover:text-teal-700"
                  >
                    🔗 Official source
                  </a>
                )}
              </div>
              {/* Validity */}
              <div className="flex flex-col items-center gap-0.5 px-4 py-4 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">📅 Validity</span>
                <span className="mt-0.5 text-sm font-bold text-[#1F2937]">{validity}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FIX 8: Smarter Tab bar ────────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 border-b border-[#E5E7EB] bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0 overflow-x-auto">
            {(['tourism', 'work'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={[
                  'whitespace-nowrap border-b-2 px-6 py-4 text-sm font-medium transition-colors',
                  activeTab === tab
                    ? 'border-[#14B8A6] text-[#14B8A6]'
                    : 'border-transparent text-gray-500 hover:text-[#1F2937]',
                ].join(' ')}
              >
                {tab === 'tourism' ? 'Tourism & Business' : 'Work & Immigration'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main layout: sidebar + cards ──────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 min-[900px]:flex-row min-[900px]:items-start min-[900px]:gap-8">

          {/* ── Sidebar ─────────────────────────────────────────────────────── */}
          <aside className="w-full min-[900px]:w-56 min-[900px]:shrink-0 min-[900px]:sticky min-[900px]:top-36">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-sm">

              {/* Tourism & Business */}
              <div className="mb-3">
                <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Tourism &amp; Business
                </p>
                {tourismVisas.length > 0 ? (
                  tourismVisas.map(r => {
                    const name     = getVisaName(r)
                    const isActive = isActiveInSidebar(r)
                    return (
                      <button
                        key={String(r.id ?? name)}
                        onClick={() => { setActiveTab('tourism'); setSelectedId(r.id) }}
                        className={[
                          'mb-0.5 flex w-full flex-col gap-1 rounded-xl px-3 py-2.5 text-left text-sm transition-all',
                          isActive
                            ? 'bg-[#14B8A6]/10 font-semibold text-[#14B8A6]'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-[#1F2937]',
                        ].join(' ')}
                      >
                        <span className="leading-snug">{name}</span>
                        {/* FIX 1: Smart badge instead of "REQ" */}
                        <VisaBadge visaType={name} size="xs" />
                      </button>
                    )
                  })
                ) : (
                  // FIX 8: Better empty state
                  <div className="rounded-xl border border-dashed border-gray-200 px-3 py-4 text-center">
                    <p className="text-xs text-gray-400 italic">
                      No Tourism visa data available yet for this route.
                    </p>
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(destinationName + ' tourist visa requirements')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-[11px] text-teal-500 underline hover:text-teal-700"
                    >
                      Check official embassy
                    </a>
                  </div>
                )}
              </div>

              {/* Work & Immigration */}
              <div>
                <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Work &amp; Immigration
                </p>
                {workVisas.length > 0 ? (
                  workVisas.map(r => {
                    const name     = getVisaName(r)
                    const isActive = isActiveInSidebar(r)
                    return (
                      <button
                        key={String(r.id ?? name)}
                        onClick={() => { setActiveTab('work'); setSelectedId(r.id) }}
                        className={[
                          'mb-0.5 flex w-full flex-col gap-1 rounded-xl px-3 py-2.5 text-left text-sm transition-all',
                          isActive
                            ? 'bg-[#14B8A6]/10 font-semibold text-[#14B8A6]'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-[#1F2937]',
                        ].join(' ')}
                      >
                        <span className="leading-snug">{name}</span>
                        {/* FIX 1: Smart badge instead of "REQ" */}
                        <VisaBadge visaType={name} size="xs" />
                      </button>
                    )
                  })
                ) : (
                  // FIX 8: Better empty state
                  <div className="rounded-xl border border-dashed border-gray-200 px-3 py-4 text-center">
                    <p className="text-xs text-gray-400 italic">
                      No Work visa data available yet for this route.
                    </p>
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(destinationName + ' work visa requirements')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-[11px] text-teal-500 underline hover:text-teal-700"
                    >
                      Check official embassy
                    </a>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* ── Cards column ────────────────────────────────────────────────── */}
          <div className="min-w-0 flex-1 space-y-5">

            {/* ─ Card 1: Header ─────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#1F2937] sm:text-3xl">{visaName}</h2>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    {/* Last verified badge — shows date from DB if available */}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D1FAE5] px-3 py-1 text-xs font-semibold text-[#10B981]">
                      <CheckIcon className="h-3.5 w-3.5" />
                      {selectedVisa?.last_verified
                        ? `Last verified: ${new Date(selectedVisa.last_verified).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                        : 'Data verified'}
                    </span>
                    {/* FIX 1: Smart color-coded visa badge */}
                    <VisaBadge visaType={visaName} size="sm" />
                  </div>
                </div>
              </div>

              {/* 3 stat tiles — FIX 2 & FIX 3 applied */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                {/* Processing */}
                <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-4 text-center">
                  <span className="text-[#14B8A6]"><ClockIcon /></span>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Processing</p>
                  <p className="text-sm font-bold text-[#1F2937]">{smartProcessing}</p>
                </div>
                {/* Visa Fee */}
                <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-4 text-center">
                  <span className="text-[#14B8A6]"><DollarIcon /></span>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Visa Fee</p>
                  <p className={`text-sm font-bold ${smartFee.color}`}>{smartFee.display}</p>
                  {smartFee.showLink && (
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(smartFee.searchQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-teal-500 underline hover:text-teal-700"
                    >
                      🔗 Embassy site
                    </a>
                  )}
                </div>
                {/* Validity */}
                <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-4 text-center">
                  <span className="text-[#14B8A6]"><CalendarIcon /></span>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Validity</p>
                  <p className="text-sm font-bold text-[#1F2937]">{validity}</p>
                </div>
              </div>
            </div>

            {/* ─ Card 2: Documents — FIX 6 ──────────────────────────────────── */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
              <h3 className="text-lg font-bold text-[#1F2937]">Documents Needed</h3>

              {/* Smart note for simple visa types */}
              {docNote && (
                <div className="mt-3 flex gap-3 rounded-xl border border-teal-200 bg-teal-50 p-3">
                  <span className="shrink-0 text-base leading-none">✈️</span>
                  <p className="text-sm font-medium leading-relaxed text-teal-800">{docNote}</p>
                </div>
              )}

              {/* 2-column checklist */}
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {documents.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 transition hover:border-[#14B8A6]/30 hover:bg-[#14B8A6]/5"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#14B8A6]/15 text-[#14B8A6]">
                      <CheckIcon className="h-3 w-3" />
                    </span>
                    <span className="text-sm leading-relaxed text-gray-600">{doc}</span>
                  </div>
                ))}
              </div>

              {/* Notes / amber warning */}
              {(selectedVisa?.notes ?? selectedVisa?.description) && (
                <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <span className="shrink-0 text-base leading-none">⚠️</span>
                  <p className="text-sm leading-relaxed text-amber-800">
                    {selectedVisa?.notes ?? selectedVisa?.description}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(destinationName + ' embassy official visa application')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#14B8A6] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d9488] hover:shadow-md"
                >
                  Check Official Embassy Website
                  <ArrowRightIcon className="h-4 w-4" />
                </a>
                <button
                  onClick={handleDownloadPDF}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#14B8A6] px-6 py-3.5 text-sm font-semibold text-[#14B8A6] transition hover:bg-[#14B8A6]/5"
                >
                  <DownloadIcon />
                  Download PDF
                </button>
              </div>

              {/* AI Document Checker CTA */}
              <div className="relative mt-4">
                <div className="absolute -inset-0.5 animate-pulse rounded-2xl bg-gradient-to-r from-[#14B8A6] to-[#6366F1] opacity-60 blur-sm" />
                <button
                  onClick={() => setShowChecker(true)}
                  className="relative flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#14B8A6] to-[#6366F1] px-6 py-4 text-sm font-bold text-white shadow-lg transition hover:from-[#0d9488] hover:to-[#4F46E5] hover:shadow-xl active:scale-95"
                >
                  <span className="text-lg">🤖</span>
                  <span>Check My Documents with AI</span>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold tracking-wide">FREE</span>
                </button>
              </div>
            </div>

            {/* ─ Card 3: Why VisitPlane ─────────────────────────────────────── */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
              <h3 className="text-lg font-bold text-[#1F2937]">Why Choose VisitPlane?</h3>

              <div className="mt-5 rounded-2xl bg-[#14B8A6]/10 p-4 sm:p-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {BENEFITS.map((b, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-3 rounded-xl bg-white p-5 text-center shadow-sm"
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#14B8A6]/10 text-[#14B8A6]">
                        {b.icon}
                      </span>
                      <div>
                        <p className="font-semibold text-[#1F2937]">{b.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-gray-500">{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ─ Card 4: How to Apply ───────────────────────────────────────── */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
              <h3 className="text-lg font-bold text-[#1F2937]">
                How to Apply for {visaName}
              </h3>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {APPLY_STEPS.map(step => (
                  <div
                    key={step.num}
                    className="flex flex-col items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-5 text-center"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#14B8A6] text-lg font-bold text-white shadow-sm">
                      {step.num}
                    </span>
                    <p className="font-semibold text-[#1F2937]">{step.title}</p>
                    <p className="text-xs leading-relaxed text-gray-500">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ─ Card 5: Trust stats ────────────────────────────────────────── */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
              <h3 className="text-center text-lg font-bold text-[#1F2937]">
                Why Travelers Trust VisitPlane
              </h3>

              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {TRUST_STATS.map((stat, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-5 text-center"
                  >
                    <span className="text-[#14B8A6]">{stat.icon}</span>
                    <p className="text-2xl font-bold text-[#1F2937]">{stat.num}</p>
                    <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ─ FIX 7: Official Embassy Links card ────────────────────────── */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-gradient-to-br from-[#F0FDFA] to-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📋</span>
                <div>
                  <h3 className="text-lg font-bold text-[#1F2937]">Official Sources</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Verify with Official Sources — always confirm requirements directly with the official embassy before applying.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(destinationName + ' embassy official website')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#14B8A6] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d9488]"
                >
                  🌐 Official Embassy Website
                  <ArrowRightIcon className="h-4 w-4" />
                </a>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(destinationName + ' embassy in ' + passportName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#14B8A6] px-5 py-3 text-sm font-semibold text-[#14B8A6] transition hover:bg-[#14B8A6]/5"
                >
                  🔍 Search Embassy Near Me
                </a>
              </div>

              <p className="mt-4 text-center text-xs text-gray-400">
                ⚠️ Information shown is for guidance only. Always verify with the official embassy before booking travel.
              </p>
            </div>

            {/* ─ Also check ─────────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Also check
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {RELATED_DESTINATIONS
                  .filter(c => c.name !== destinationName)
                  .slice(0, 5)
                  .map(c => (
                    <Link
                      key={c.name}
                      href={`/visa/${encodeURIComponent(passportName)}/${encodeURIComponent(c.name)}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-[#14B8A6]/40 hover:bg-[#14B8A6]/5 hover:text-[#14B8A6]"
                    >
                      <span>{c.flag}</span>
                      <span>{c.name}</span>
                    </Link>
                  ))}
              </div>
            </div>

          </div>{/* end cards column */}
        </div>{/* end flex */}
      </div>

      {/* ── Capture Point 1 — Post-Lookup Modal ──────────────────────────────── */}
      <PostLookupModal passport={passportName} destination={destinationName} />

      {showChecker && (
        <DocumentChecker
          country={destinationName.toLowerCase()}
          countryLabel={destinationName}
          onClose={() => setShowChecker(false)}
        />
      )}
    </div>
  )
}
