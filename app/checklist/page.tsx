'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserCountry } from '@/hooks/useUserCountry'
import CountrySelect from '@/components/CountrySelect'
import ToolBreadcrumb from '@/components/ToolBreadcrumb'

// ─── Supabase ──────────────────────────────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// ─── Types ─────────────────────────────────────────────────────────────────────
type VisaRecord = {
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
  required_docs?: string | string[]
  notes?: string
  description?: string
  apply_url?: string
  application_url?: string
  [key: string]: unknown
}

type VisaTypeKey = 'Tourist' | 'Business' | 'Student' | 'Work'

// ─── Constants ─────────────────────────────────────────────────────────────────
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

const VISA_TYPES: VisaTypeKey[] = ['Tourist', 'Business', 'Student', 'Work']

const VISA_TYPE_ICONS: Record<VisaTypeKey, string> = {
  Tourist: '🏖️',
  Business: '💼',
  Student: '🎓',
  Work: '🔧',
}

// ─── Fallback documents per visa type ──────────────────────────────────────────
const FALLBACK_DOCS: Record<VisaTypeKey, string[]> = {
  Tourist: [
    'Valid Passport (minimum 6 months validity beyond travel dates)',
    'Passport-sized Photos (2 copies, white background)',
    'Visa Application Form (completed and signed)',
    'Bank Statements (last 3 months showing sufficient funds)',
    'Round-trip Flight Itinerary',
    'Hotel Booking Confirmation for entire stay',
    'Travel Insurance (minimum $30,000 coverage)',
    'Employment Letter / Proof of Employment',
    'No-Objection Certificate (NOC) from employer',
    'Income Tax Returns (last 2 years)',
  ],
  Business: [
    'Valid Passport (minimum 6 months validity)',
    'Passport-sized Photos (2 copies, white background)',
    'Visa Application Form (completed and signed)',
    'Business Invitation Letter from host company',
    'Company Registration Documents',
    'Chamber of Commerce Certificate',
    'Bank Statements (last 6 months)',
    'Round-trip Flight Itinerary',
    'Hotel Booking Confirmation',
    'Travel Insurance',
    'Proof of Business Ownership or Employment Letter',
    'Income Tax Returns (last 2 years)',
  ],
  Student: [
    'Valid Passport (minimum 6 months validity)',
    'Passport-sized Photos (2–4 copies)',
    'University / School Acceptance Letter',
    'Completed Visa Application Form',
    'Proof of Financial Support (bank statements or scholarship letter)',
    'Academic Transcripts and Certificates',
    'Language Proficiency Test Results (IELTS / TOEFL)',
    'Medical Certificate and Vaccination Records',
    'Police Clearance Certificate',
    'Travel Insurance',
    'Proof of Accommodation in destination country',
  ],
  Work: [
    'Valid Passport (minimum 6 months validity)',
    'Passport-sized Photos (2 copies)',
    'Signed Employment Contract / Job Offer Letter',
    'Work Permit (issued by destination country)',
    'Educational Certificates and Degree',
    'Professional Experience Certificate',
    'Medical Certificate / Health Clearance',
    'Police Clearance Certificate',
    'Bank Statements (last 3 months)',
    'Travel Insurance',
    'Completed Visa Application Form',
  ],
}

const FALLBACK_PROCESSING: Record<VisaTypeKey, string> = {
  Tourist:  '5–15 business days',
  Business: '7–21 business days',
  Student:  '2–8 weeks',
  Work:     '4–12 weeks',
}

const FALLBACK_FEE: Record<VisaTypeKey, string> = {
  Tourist:  '$50 – $200 USD',
  Business: '$100 – $300 USD',
  Student:  '$150 – $350 USD',
  Work:     '$200 – $500 USD',
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function parseDocuments(record: VisaRecord | null, fallback: string[]): string[] {
  if (!record) return fallback
  const raw = record.required_documents ?? record.required_docs
  if (!raw) return fallback
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(String).filter(Boolean)
    }
  } catch { /* fall through */ }
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.split(/[,\n;]+/).map(s => s.trim()).filter(Boolean)
  }
  return fallback
}

function getProcessingTime(record: VisaRecord | null, fallback: string): string {
  return record?.processing_time ?? record?.duration ?? fallback
}

function getVisaFee(record: VisaRecord | null, fallback: string): string {
  return record?.price ?? record?.fee ?? record?.cost ?? fallback
}

function getVisaTypeName(record: VisaRecord | null): string {
  return record?.visa_type ?? record?.type ?? ''
}

function matchesVisaType(record: VisaRecord, typeKey: VisaTypeKey): boolean {
  const name = (record.visa_type ?? record.type ?? '').toLowerCase()
  switch (typeKey) {
    case 'Tourist':  return name.includes('tour') || name.includes('visit') || name.includes('holiday') || name.includes('leisure')
    case 'Business': return name.includes('business') || name.includes('commercial')
    case 'Student':  return name.includes('student') || name.includes('study') || name.includes('education')
    case 'Work':     return name.includes('work') || name.includes('employment') || name.includes('labour') || name.includes('labor')
    default: return false
  }
}

const FLAG_MAP: Record<string, string> = {
  'Afghanistan': '🇦🇫','Albania': '🇦🇱','Algeria': '🇩🇿','Andorra': '🇦🇩','Angola': '🇦🇴',
  'Antigua and Barbuda': '🇦🇬','Argentina': '🇦🇷','Armenia': '🇦🇲','Australia': '🇦🇺',
  'Austria': '🇦🇹','Azerbaijan': '🇦🇿','Bahamas': '🇧🇸','Bahrain': '🇧🇭','Bangladesh': '🇧🇩',
  'Barbados': '🇧🇧','Belarus': '🇧🇾','Belgium': '🇧🇪','Belize': '🇧🇿','Benin': '🇧🇯',
  'Bhutan': '🇧🇹','Bolivia': '🇧🇴','Bosnia and Herzegovina': '🇧🇦','Botswana': '🇧🇼',
  'Brazil': '🇧🇷','Brunei': '🇧🇳','Bulgaria': '🇧🇬','Burkina Faso': '🇧🇫','Burundi': '🇧🇮',
  'Cambodia': '🇰🇭','Cameroon': '🇨🇲','Canada': '🇨🇦','Cape Verde': '🇨🇻','Chad': '🇹🇩',
  'Chile': '🇨🇱','China': '🇨🇳','Colombia': '🇨🇴','Comoros': '🇰🇲','Costa Rica': '🇨🇷',
  'Croatia': '🇭🇷','Cuba': '🇨🇺','Cyprus': '🇨🇾','Czech Republic': '🇨🇿','Denmark': '🇩🇰',
  'Djibouti': '🇩🇯','Dominica': '🇩🇲','Dominican Republic': '🇩🇴','Ecuador': '🇪🇨',
  'Egypt': '🇪🇬','El Salvador': '🇸🇻','Equatorial Guinea': '🇬🇶','Eritrea': '🇪🇷',
  'Estonia': '🇪🇪','Ethiopia': '🇪🇹','Fiji': '🇫🇯','Finland': '🇫🇮','France': '🇫🇷',
  'Gabon': '🇬🇦','Gambia': '🇬🇲','Georgia': '🇬🇪','Germany': '🇩🇪','Ghana': '🇬🇭',
  'Greece': '🇬🇷','Grenada': '🇬🇩','Guatemala': '🇬🇹','Guinea': '🇬🇳','Guyana': '🇬🇾',
  'Haiti': '🇭🇹','Honduras': '🇭🇳','Hong Kong': '🇭🇰','Hungary': '🇭🇺','Iceland': '🇮🇸',
  'India': '🇮🇳','Indonesia': '🇮🇩','Iran': '🇮🇷','Iraq': '🇮🇶','Ireland': '🇮🇪',
  'Israel': '🇮🇱','Italy': '🇮🇹','Ivory Coast': '🇨🇮','Jamaica': '🇯🇲','Japan': '🇯🇵',
  'Jordan': '🇯🇴','Kazakhstan': '🇰🇿','Kenya': '🇰🇪','Kuwait': '🇰🇼','Kyrgyzstan': '🇰🇬',
  'Laos': '🇱🇦','Latvia': '🇱🇻','Lebanon': '🇱🇧','Lesotho': '🇱🇸','Liberia': '🇱🇷',
  'Libya': '🇱🇾','Lithuania': '🇱🇹','Luxembourg': '🇱🇺','Madagascar': '🇲🇬','Malawi': '🇲🇼',
  'Malaysia': '🇲🇾','Maldives': '🇲🇻','Mali': '🇲🇱','Malta': '🇲🇹','Mauritania': '🇲🇷',
  'Mauritius': '🇲🇺','Mexico': '🇲🇽','Moldova': '🇲🇩','Monaco': '🇲🇨','Mongolia': '🇲🇳',
  'Montenegro': '🇲🇪','Morocco': '🇲🇦','Mozambique': '🇲🇿','Myanmar': '🇲🇲','Namibia': '🇳🇦',
  'Nepal': '🇳🇵','Netherlands': '🇳🇱','New Zealand': '🇳🇿','Nicaragua': '🇳🇮','Niger': '🇳🇪',
  'Nigeria': '🇳🇬','North Macedonia': '🇲🇰','Norway': '🇳🇴','Oman': '🇴🇲','Pakistan': '🇵🇰',
  'Palestine': '🇵🇸','Panama': '🇵🇦','Papua New Guinea': '🇵🇬','Paraguay': '🇵🇾','Peru': '🇵🇪',
  'Philippines': '🇵🇭','Poland': '🇵🇱','Portugal': '🇵🇹','Qatar': '🇶🇦','Romania': '🇷🇴',
  'Russia': '🇷🇺','Rwanda': '🇷🇼','Saudi Arabia': '🇸🇦','Senegal': '🇸🇳','Serbia': '🇷🇸',
  'Seychelles': '🇸🇨','Sierra Leone': '🇸🇱','Singapore': '🇸🇬','Slovakia': '🇸🇰',
  'Slovenia': '🇸🇮','Somalia': '🇸🇴','South Africa': '🇿🇦','South Korea': '🇰🇷',
  'South Sudan': '🇸🇸','Spain': '🇪🇸','Sri Lanka': '🇱🇰','Sudan': '🇸🇩','Suriname': '🇸🇷',
  'Sweden': '🇸🇪','Switzerland': '🇨🇭','Syria': '🇸🇾','Taiwan': '🇹🇼','Tajikistan': '🇹🇯',
  'Tanzania': '🇹🇿','Thailand': '🇹🇭','Togo': '🇹🇬','Tonga': '🇹🇴',
  'Trinidad and Tobago': '🇹🇹','Tunisia': '🇹🇳','Turkey': '🇹🇷','Turkmenistan': '🇹🇲',
  'UAE': '🇦🇪','Uganda': '🇺🇬','Ukraine': '🇺🇦','United Kingdom': '🇬🇧',
  'United States': '🇺🇸','Uruguay': '🇺🇾','Uzbekistan': '🇺🇿','Vanuatu': '🇻🇺',
  'Venezuela': '🇻🇪','Vietnam': '🇻🇳','Yemen': '🇾🇪','Zambia': '🇿🇲','Zimbabwe': '🇿🇼',
}

function getFlag(country: string): string {
  return FLAG_MAP[country] ?? '🌍'
}

// ─── SVG Icons ─────────────────────────────────────────────────────────────────
function ArrowRight({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
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
function PrinterIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
    </svg>
  )
}
function DownloadIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}
function ClipboardIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    </svg>
  )
}
function CheckCircleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
    </svg>
  )
}
function SpinnerIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ChecklistPage() {
  // ── Navbar state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [geoBadgeDismissed, setGeoBadgeDismissed] = useState(false)

  const { countryName, loading: geoLoading } = useUserCountry()

  // ── Form state
  const [passport, setPassport]           = useState('')
  const [destination, setDestination]     = useState('')
  const [visaType, setVisaType]           = useState<VisaTypeKey>('Tourist')
  const [destinations, setDestinations]   = useState<string[]>([])
  const [loadingDests, setLoadingDests]   = useState(false)

  // ── Checklist state
  const [loading, setLoading]             = useState(false)
  const [showChecklist, setShowChecklist] = useState(false)
  const [documents, setDocuments]         = useState<string[]>([])
  const [checked, setChecked]             = useState<Record<string, boolean>>({})
  const [processingTime, setProcessingTime] = useState('')
  const [visaFee, setVisaFee]             = useState('')
  const [dbVisaName, setDbVisaName]       = useState('')
  const [copied, setCopied]               = useState(false)

  // ── Auto-detect country from IP
  useEffect(() => {
    if (countryName && !geoLoading && !passport) {
      setPassport(countryName)
    }
  }, [countryName, geoLoading, passport])

  // ── Scroll handler

  // ── Load destinations when passport changes
  useEffect(() => {
    if (!passport) { setDestinations([]); setDestination(''); return }
    setLoadingDests(true)
    setDestination('')
    getSupabase()
      .from('destinations')
      .select('country_name')
      .ilike('passport_country', passport)
      .order('country_name')
      .then(({ data }) => {
        if (data) {
          const unique = [...new Set(data.map((r) => r.country_name))].sort()
          setDestinations(unique)
        }
        setLoadingDests(false)
      })
  }, [passport])

  // ── Generate checklist
  const handleGenerate = useCallback(async () => {
    if (!passport || !destination) return
    setLoading(true)
    setShowChecklist(false)

    const fallbackDocs  = FALLBACK_DOCS[visaType]
    const fallbackTime  = FALLBACK_PROCESSING[visaType]
    const fallbackFee   = FALLBACK_FEE[visaType]

    try {
      const { data } = await getSupabase()
        .from('destinations')
        .select('*')
        .ilike('passport_country', passport)
        .ilike('country_name', destination)
        .limit(20)

      const records: VisaRecord[] = data ?? []

      // Try to match selected visa type; fall back to first record
      const matched = records.find(r => matchesVisaType(r, visaType)) ?? records[0] ?? null

      const docs = parseDocuments(matched, fallbackDocs)
      const time = getProcessingTime(matched, fallbackTime)
      const fee  = getVisaFee(matched, fallbackFee)
      const name = getVisaTypeName(matched)

      setDocuments(docs)
      setProcessingTime(time)
      setVisaFee(fee)
      setDbVisaName(name)
      // Reset checkboxes
      setChecked({})
    } catch {
      setDocuments(fallbackDocs)
      setProcessingTime(fallbackTime)
      setVisaFee(fallbackFee)
      setDbVisaName('')
    }

    setLoading(false)
    setShowChecklist(true)
    setTimeout(() => {
      document.getElementById('checklist-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, [passport, destination, visaType])

  // ── Progress
  const checkedCount = Object.values(checked).filter(Boolean).length
  const totalCount   = documents.length
  const allDone      = totalCount > 0 && checkedCount === totalCount
  const progressPct  = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0

  function toggleDoc(doc: string) {
    setChecked(prev => ({ ...prev, [doc]: !prev[doc] }))
  }

  // ── Copy to clipboard
  async function handleCopy() {
    const text = [
      `📋 ${passport} → ${destination} ${visaType} Visa Checklist`,
      `Generated by VisitPlane.com`,
      '',
      ...documents.map((d, i) => `${checked[d] ? '✅' : '☐'} ${i + 1}. ${d}`),
      '',
      `Processing Time: ${processingTime}`,
      `Estimated Fee: ${visaFee}`,
      '',
      '⚠️ Always verify requirements with the official embassy before applying.',
    ].join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  // ── WhatsApp share
  function handleWhatsApp() {
    const text = encodeURIComponent(
      `📋 ${passport} → ${destination} ${visaType} Visa Checklist\n\nGenerated via VisitPlane.com/checklist\n\nDocuments needed:\n` +
      documents.slice(0, 5).map((d, i) => `${i + 1}. ${d}`).join('\n') +
      `\n...and ${documents.length - 5} more.\n\nCheck the full list: https://visitplane.com/checklist`
    )
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
  }

  // ── Print
  function handlePrint() {
    window.print()
  }

  const canGenerate = !!passport && !!destination

  return (
    <>
      {/* ── Print styles ─────────────────────────────────────────────────── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #ffffff !important; color: #111827 !important; }
          .print-card {
            background: #ffffff !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 8px !important;
            padding: 16px !important;
            page-break-inside: avoid;
          }
          .print-doc-item {
            border-bottom: 1px solid #f3f4f6 !important;
            padding: 10px 0 !important;
          }
          .print-header {
            margin-bottom: 24px;
            border-bottom: 2px solid #0d9488 !important;
            padding-bottom: 16px !important;
          }
        }
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
      `}</style>

      <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased overflow-x-hidden">
        <ToolBreadcrumb toolName="Document Checklist" toolEmoji="📋" />
        {/* ── SECTION 1: HERO ──────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-16 sm:pt-20 lg:pt-24 pb-12">
          {/* Glow blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.12),transparent_60%)]" />
            <div className="absolute -left-40 top-40 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.07),transparent_70%)]" />
            <div className="absolute -right-40 top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.07),transparent_70%)]" />
          </div>
          {/* Grid overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />

          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-400 backdrop-blur-sm">
                <span>📋</span> Document Checklist Generator
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            >
              <span className="text-[#0f0c29]">Never Miss a</span>
              <br />
              <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Document Again
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16 }}
              className="mx-auto mt-5 max-w-lg text-base text-gray-500 sm:text-lg"
            >
              Get your personalized visa document checklist instantly.
              Print or save as PDF — always free.
            </motion.p>
          </div>
        </section>

        {/* ── SECTION 2: SELECTOR ──────────────────────────────────────────── */}
        <section className="relative pb-16 no-print">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.2 }}
              className="relative rounded-2xl border border-gray-200 bg-white p-2 backdrop-blur-sm shadow-2xl shadow-gray-300"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/8 via-transparent to-cyan-500/8 pointer-events-none" />
              <div className="relative rounded-xl bg-white p-5 space-y-4">
                {/* Dropdowns */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <CountrySelect
                      value={passport}
                      onChange={(v) => { setPassport(v); setGeoBadgeDismissed(true) }}
                      placeholder={geoLoading ? '🌍 Detecting your location…' : 'Select your country'}
                      label="My Passport"
                    />
                    {passport && !geoBadgeDismissed && !geoLoading && (
                      <p className="mt-1 text-[10px] text-teal-400 flex items-center gap-1 px-1">
                        📍 Auto-detected from your location
                        <button onClick={() => setGeoBadgeDismissed(true)} className="ml-1 text-gray-400 hover:text-gray-500">✕</button>
                      </p>
                    )}
                  </div>
                  <CountrySelect
                    value={destination}
                    onChange={setDestination}
                    placeholder={
                      !passport                 ? 'Select passport first' :
                      loadingDests              ? 'Loading…'              :
                      destinations.length === 0 ? 'No destinations found' :
                                                  'Select destination'
                    }
                    label="Traveling To"
                    options={destinations.length > 0 ? destinations : undefined}
                    disabled={!passport || loadingDests}
                  />
                </div>

                {/* Visa type selector */}
                <div>
                  <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-teal-400">
                    Visa Type
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {VISA_TYPES.map((t) => (
                      <button
                        key={t}
                        onClick={() => setVisaType(t)}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 px-2 text-xs font-semibold transition-all ${
                          visaType === t
                            ? 'border-teal-500/60 bg-teal-500/15 text-teal-300 shadow-sm shadow-teal-500/20'
                            : 'border-gray-100 bg-white/5 text-gray-400 hover:border-gray-200 hover:text-gray-600'
                        }`}
                      >
                        <span className="text-xl">{VISA_TYPE_ICONS[t]}</span>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate button */}
                <button
                  onClick={handleGenerate}
                  disabled={!canGenerate || loading}
                  className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-500/30 transition-all hover:shadow-teal-500/50 hover:from-teal-600 hover:to-cyan-600 disabled:from-white/8 disabled:to-white/5 disabled:text-white/25 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <SpinnerIcon className="h-4 w-4 text-gray-500" />
                      Generating Checklist…
                    </>
                  ) : (
                    <>
                      <span>📋</span>
                      Generate Checklist
                    </>
                  )}
                </button>

                {passport && destination && passport === destination && (
                  <p className="text-center text-xs text-amber-400">
                    Please choose a destination different from your passport country.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── SECTION 3: CHECKLIST RESULTS ─────────────────────────────────── */}
        <AnimatePresence>
          {showChecklist && (
            <motion.section
              id="checklist-results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="pb-16"
            >
              <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">

                {/* A) HEADER CARD */}
                <div className="print-card rounded-2xl border border-gray-200 bg-white p-6">
                  <div className="print-header flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-2xl">{getFlag(passport)}</span>
                        <span className="text-gray-400 font-bold">→</span>
                        <span className="text-2xl">{getFlag(destination)}</span>
                        <h2 className="ml-1 text-lg font-extrabold text-[#0f0c29]">
                          {passport} → {destination} Visa Checklist
                        </h2>
                      </div>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-bold text-teal-400">
                          {VISA_TYPE_ICONS[visaType]} {visaType} Visa
                        </span>
                        {dbVisaName && dbVisaName.toLowerCase() !== visaType.toLowerCase() && (
                          <span className="text-xs text-gray-400">({dbVisaName})</span>
                        )}
                      </div>
                    </div>
                    <div className="no-print flex items-center gap-2 shrink-0">
                      <button
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-[#0f0c29]"
                      >
                        <PrinterIcon className="h-3.5 w-3.5" /> Print
                      </button>
                      <button
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 rounded-lg border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-xs font-semibold text-teal-400 transition hover:bg-teal-500/20"
                      >
                        <DownloadIcon className="h-3.5 w-3.5" /> PDF
                      </button>
                    </div>
                  </div>
                </div>

                {/* B) REQUIRED DOCUMENTS LIST */}
                <div className="print-card rounded-2xl border border-gray-200 bg-white overflow-hidden">
                  <div className="border-b border-gray-100 px-6 py-4">
                    <h3 className="text-sm font-bold text-[#0f0c29]">Required Documents</h3>
                    <p className="mt-0.5 text-xs text-gray-400">Tick each document as you prepare it</p>
                  </div>
                  <ul className="divide-y divide-white/5">
                    {documents.map((doc, i) => (
                      <li
                        key={doc}
                        className={`print-doc-item flex items-start gap-4 px-6 py-4 transition-all cursor-pointer group ${
                          checked[doc] ? 'bg-teal-500/5' : 'hover:bg-white/3'
                        }`}
                        onClick={() => toggleDoc(doc)}
                      >
                        {/* Custom checkbox */}
                        <div className={`no-print mt-0.5 flex-shrink-0 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          checked[doc]
                            ? 'border-teal-500 bg-teal-500 shadow-sm shadow-teal-500/40'
                            : 'border-gray-200 group-hover:border-teal-500/50'
                        }`}>
                          {checked[doc] && (
                            <svg className="h-3 w-3 text-[#0f0c29]" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        {/* Print-only number */}
                        <span className="hidden print:block text-xs font-bold text-gray-400 mt-0.5 w-5 flex-shrink-0">
                          {i + 1}.
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium leading-snug transition-all ${
                            checked[doc] ? 'text-gray-400 line-through' : 'text-[#0f0c29]'
                          }`}>
                            {doc}
                          </p>
                        </div>
                        {checked[doc] && (
                          <CheckCircleIcon className="no-print flex-shrink-0 h-4 w-4 text-teal-400 mt-0.5" />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* D) PROGRESS TRACKER */}
                <div className="no-print print-card rounded-2xl border border-gray-200 bg-white p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-[#0f0c29]">
                        {allDone
                          ? "You're ready to apply! 🎉"
                          : `${checkedCount} of ${totalCount} documents ready`}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {allDone
                          ? 'All documents prepared — double-check and apply!'
                          : `${totalCount - checkedCount} document${totalCount - checkedCount !== 1 ? 's' : ''} still needed`}
                      </p>
                    </div>
                    <span className={`text-2xl font-extrabold tabular-nums ${
                      allDone ? 'text-teal-400' : 'text-gray-500'
                    }`}>
                      {progressPct}%
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2.5 w-full rounded-full bg-white/8 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  {allDone && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-4 flex items-center gap-3 rounded-xl border border-teal-500/25 bg-teal-500/10 px-4 py-3"
                    >
                      <span className="text-2xl">🎉</span>
                      <div>
                        <p className="text-sm font-bold text-teal-400">All set! Time to apply.</p>
                        <p className="text-xs text-gray-400">Verify all documents with the official embassy before submitting.</p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* C) IMPORTANT NOTES */}
                <div className="print-card rounded-2xl border border-amber-500/15 bg-amber-500/5 p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-amber-400">
                    <span>⚠️</span> Important Notes
                  </h3>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-gray-100 bg-white/5 p-4">
                      <dt className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Processing Time</dt>
                      <dd className="text-sm font-semibold text-[#0f0c29]">{processingTime}</dd>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white/5 p-4">
                      <dt className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Estimated Fee</dt>
                      <dd className="text-sm font-semibold text-[#0f0c29]">{visaFee}</dd>
                    </div>
                    <div className="sm:col-span-2 rounded-xl border border-gray-100 bg-white/5 p-4">
                      <dt className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Embassy Contact</dt>
                      <dd className="text-sm text-gray-500">
                        Contact the {destination} embassy or consulate in {passport} for official appointment and document submission.
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3">
                    <span className="text-amber-400 mt-0.5 shrink-0">⚠️</span>
                    <p className="text-xs leading-relaxed text-amber-300/80">
                      <strong className="text-amber-400">Always verify</strong> requirements with the official embassy or consulate website before applying. Visa requirements can change without notice.
                    </p>
                  </div>
                </div>

                {/* SECTION 4: SHARE & SAVE */}
                <div className="no-print print-card rounded-2xl border border-gray-200 bg-white p-6">
                  <h3 className="mb-4 text-sm font-bold text-[#0f0c29]">Share & Save</h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <button
                      onClick={handleCopy}
                      className={`flex flex-col items-center gap-2 rounded-xl border py-4 px-3 text-xs font-semibold transition-all ${
                        copied
                          ? 'border-teal-500/50 bg-teal-500/15 text-teal-400'
                          : 'border-gray-200 bg-white/5 text-gray-500 hover:border-teal-500/30 hover:text-[#0f0c29] hover:bg-teal-500/8'
                      }`}
                    >
                      <ClipboardIcon className="h-5 w-5" />
                      {copied ? 'Copied!' : 'Copy List'}
                    </button>
                    <button
                      onClick={handleWhatsApp}
                      className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white/5 py-4 px-3 text-xs font-semibold text-gray-500 transition-all hover:border-green-500/30 hover:text-green-400 hover:bg-green-500/8"
                    >
                      <span className="text-xl">💬</span>
                      WhatsApp
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white/5 py-4 px-3 text-xs font-semibold text-gray-500 transition-all hover:border-white/30 hover:text-[#0f0c29] hover:bg-white/8"
                    >
                      <PrinterIcon className="h-5 w-5" />
                      Print
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white/5 py-4 px-3 text-xs font-semibold text-gray-500 transition-all hover:border-teal-500/30 hover:text-teal-400 hover:bg-teal-500/8"
                    >
                      <DownloadIcon className="h-5 w-5" />
                      Save PDF
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── SECTION 5: CTA ───────────────────────────────────────────────── */}
        <section className={`no-print py-20 sm:py-24 ${showChecklist ? 'border-t border-gray-100' : ''}`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
              <Link
                href="/destinations"
                className="group flex items-center justify-between gap-3 rounded-2xl border border-teal-500/20 bg-teal-500/8 p-5 transition-all hover:bg-teal-500/15 hover:border-teal-500/40 hover:-translate-y-0.5"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-1">Full Requirements</p>
                  <p className="text-sm font-semibold text-[#0f0c29]">Check full visa requirements</p>
                  <p className="mt-0.5 text-xs text-gray-400">Processing times, fees, links & more</p>
                </div>
                <ArrowRight className="h-5 w-5 text-teal-400 shrink-0 group-hover:translate-x-0.5 transition" />
              </Link>
              <Link
                href="/compare"
                className="group flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white/5 p-5 transition-all hover:bg-white/8 hover:border-gray-200 hover:-translate-y-0.5"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Compare</p>
                  <p className="text-sm font-semibold text-[#0f0c29]">Compare with other destinations</p>
                  <p className="mt-0.5 text-xs text-gray-400">Side-by-side visa comparison tool</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 shrink-0 group-hover:text-[#0f0c29] group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
          </div>
        </section>{/* ── PRINT HEADER (only visible when printing) ─────────────────────── */}
        <div className="hidden print:block fixed top-0 left-0 right-0 p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">Visit<span className="text-teal-600">Plane</span></span>
            <span className="text-gray-400">·</span>
            <span className="text-sm text-gray-500">visitplane.com/checklist</span>
          </div>
        </div>

      </div>
    </>
  )
}
