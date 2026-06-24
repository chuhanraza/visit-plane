'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import type { OfficialSource } from '@/data/officialSources'
import VisaHeroCard from '@/components/visa/VisaHeroCard'
import DocumentChecklist from '@/components/visa/DocumentChecklist'
import ApplicationSteps from '@/components/visa/ApplicationSteps'
import TravelReadinessGrid from '@/components/visa/TravelReadinessGrid'
import SourcesAndTrust from '@/components/visa/SourcesAndTrust'
import RelatedRoutesAndFAQ from '@/components/visa/RelatedRoutesAndFAQ'
import PostLookupModal from '@/components/PostLookupModal'
import VisaDataDisclaimer from '@/components/VisaDataDisclaimer'

const DocumentChecker = dynamic(
  () => import('@/app/components/DocumentChecker'),
  { ssr: false },
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
  official_sources?: OfficialSource[]
  source_status?: 'verified' | 'pending_verification' | 'unverified'
  [key: string]: unknown
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getVisaName(r: VisaRecord): string {
  return (r.visa_type ?? r.type ?? 'Tourist Visa').toString()
}

const WORK_KEYWORDS = [
  'work', 'student', 'residence', 'official', 'diplomatic',
  'working holiday', 'investor', 'immigration', 'employment', 'skilled worker',
]

function isWorkVisa(name: string): boolean {
  const lower = name.toLowerCase()
  return WORK_KEYWORDS.some(k => lower.includes(k))
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface Props {
  allVisaData: VisaRecord[]
  passportName: string
  destinationName: string
  passportSlug: string
  destinationSlug: string
  passportFlag: string
  destinationFlag: string
  relatedDestinations?: string[]
  otherPassports?: string[]
  conflictingStatus?: boolean
}

// ─── Sticky CTA bar (mobile, appears after hero scroll) ────────────────────
function StickyMobileCTA({
  show,
  visaRecord,
  destinationName,
  destinationFlag,
  onClick,
}: {
  show: boolean
  visaRecord: VisaRecord | null
  destinationName: string
  destinationFlag: string
  onClick: () => void
}) {
  const visaType = visaRecord ? getVisaName(visaRecord) : 'Visa'
  const fee = visaRecord
    ? ((visaRecord.price ?? visaRecord.fee ?? visaRecord.cost ?? '') as string).toString().trim()
    : ''
  const feeDisplay = fee && !/n\/a|contact|check/i.test(fee)
    ? (/^\$/.test(fee) ? fee : `$${fee}`)
    : ''

  return (
    <div
      className={[
        'fixed bottom-0 left-0 right-0 z-50 p-3 transition-all duration-300 print:hidden sm:hidden',
        show ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none',
      ].join(' ')}
    >
      <div className="rounded-2xl bg-[#134e4a] px-4 py-3 flex items-center justify-between shadow-2xl gap-3">
        <div>
          <p className="text-xs font-bold text-white leading-tight">{destinationFlag} {visaType}</p>
          {feeDisplay && <p className="text-[11px] text-teal-300 mt-0.5">{feeDisplay} · 3–5 business days</p>}
        </div>
        <button
          onClick={onClick}
          className="flex-shrink-0 rounded-xl bg-[#14B8A6] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0d9488] active:scale-95"
        >
          Get My Visa →
        </button>
      </div>
    </div>
  )
}

// ─── Main client component ───────────────────────────────────────────────────
export default function VisaPageClient({
  allVisaData,
  passportName,
  destinationName,
  passportSlug,
  destinationSlug,
  passportFlag,
  destinationFlag,
  relatedDestinations = [],
  otherPassports = [],
  conflictingStatus = false,
}: Props) {
  const [showChecker, setShowChecker] = useState(false)
  const [stickyVisible, setStickyVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  // Show sticky CTA after user scrolls past hero section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0.1 },
    )
    const el = heroRef.current
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Select primary visa record (prefer tourism over work)
  const primaryVisa = useMemo(() => {
    if (allVisaData.length === 0) return null
    const tourismFirst = allVisaData.find(r => !isWorkVisa(getVisaName(r)))
    return tourismFirst ?? allVisaData[0]
  }, [allVisaData])

  // Handle download checklist — trigger print dialog
  const handleDownloadChecklist = useCallback(() => {
    window.print()
  }, [])

  // Handle "Get My Visa" — open apply URL or scroll to how-to-apply
  const handleApply = useCallback(() => {
    const url = ((primaryVisa?.apply_url ?? primaryVisa?.application_url ?? '') as string).toString()
    if (url && url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      document.getElementById('how-to-apply')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [primaryVisa])

  // ── No data state ──────────────────────────────────────────────────────────
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
        <a
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#14B8A6] px-7 py-3 text-sm font-semibold text-white shadow transition hover:bg-[#0d9488]"
        >
          ← Try a different search
        </a>
      </div>
    )
  }

  return (
    <div className="bg-[#F8FAFC] pb-24 sm:pb-12">

      {/* ── Section 1: ANSWER (above fold) ──────────────────────────────────── */}
      <div ref={heroRef}>
        <VisaHeroCard
          visaRecord={primaryVisa}
          passportName={passportName}
          passportFlag={passportFlag}
          destinationName={destinationName}
          destinationFlag={destinationFlag}
          onApplyClick={handleApply}
          onDownloadChecklist={handleDownloadChecklist}
        />
      </div>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-6 mt-6">

        {/* ── YMYL honesty band — guidance not guarantee + official source + flag ─ */}
        <VisaDataDisclaimer
          destinationName={destinationName}
          homeCountry={passportName}
          conflicting={conflictingStatus}
        />

        {/* ── Section 2: REQUIREMENTS ───────────────────────────────────────── */}
        <DocumentChecklist
          visaRecord={primaryVisa}
          passportName={passportName}
          destinationName={destinationName}
          onOpenAIChecker={() => setShowChecker(true)}
        />

        {/* ── Section 3: HOW TO APPLY ───────────────────────────────────────── */}
        <ApplicationSteps
          visaRecord={primaryVisa}
          passportName={passportName}
          destinationName={destinationName}
        />

        {/* ── Section 4: TRAVEL READINESS (monetization) ───────────────────── */}
        <TravelReadinessGrid
          passportName={passportName}
          destinationName={destinationName}
          destinationFlag={destinationFlag}
        />

        {/* ── Section 5: SOURCES & TRUST ───────────────────────────────────── */}
        <SourcesAndTrust
          passportName={passportName}
          destinationName={destinationName}
        />

        {/* ── Section 6: RELATED ROUTES & FAQ ──────────────────────────────── */}
        <RelatedRoutesAndFAQ
          passportName={passportName}
          passportSlug={passportSlug}
          destinationName={destinationName}
          destinationSlug={destinationSlug}
          relatedDestinations={relatedDestinations}
          otherPassports={otherPassports}
        />

      </div>

      {/* ── Sticky mobile CTA ─────────────────────────────────────────────── */}
      <StickyMobileCTA
        show={stickyVisible}
        visaRecord={primaryVisa}
        destinationName={destinationName}
        destinationFlag={destinationFlag}
        onClick={handleApply}
      />

      {/* ── Post-lookup modal ─────────────────────────────────────────────── */}
      <PostLookupModal passport={passportName} destination={destinationName} />

      {/* ── AI Document Checker ───────────────────────────────────────────── */}
      {showChecker && (
        <DocumentChecker
          country={destinationName.toLowerCase()}
          countryLabel={destinationName}
          visaType={primaryVisa ? getVisaName(primaryVisa) : undefined}
          onClose={() => setShowChecker(false)}
        />
      )}
    </div>
  )
}
