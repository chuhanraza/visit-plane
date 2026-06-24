'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { VisaRecord } from '@/app/visa/[passport]/[destination]/VisaPageClient'

// ─── Types ────────────────────────────────────────────────────────────────────
interface DocumentItem {
  name: string
  description: string
  why?: string
  conditional?: string
}

interface DocumentGroup {
  tier: 'mandatory' | 'conditional' | 'recommended'
  label: string
  color: string
  dotColor: string
  bgColor: string
  borderColor: string
  items: DocumentItem[]
}

interface DocumentChecklistProps {
  visaRecord: VisaRecord | null
  passportName: string
  destinationName: string
  onOpenAIChecker?: () => void
}

// ─── Document data resolver ───────────────────────────────────────────────────
function resolveDocumentGroups(record: VisaRecord, destinationName: string): DocumentGroup[] {
  const visaType = (record.visa_type ?? record.type ?? '').toString().toLowerCase()
  const isFree      = /free|no visa/i.test(visaType)
  const isArrival   = /arrival/i.test(visaType)
  const isWork      = /work|employment/i.test(visaType)
  const isStudent   = /student/i.test(visaType)

  // Try to use DB documents first
  const rawDocs = record.required_documents ?? (record as Record<string, unknown>).required_docs
  let dbDocs: string[] = []
  if (rawDocs) {
    try {
      const parsed = typeof rawDocs === 'string' ? JSON.parse(rawDocs) : rawDocs
      if (Array.isArray(parsed) && parsed.length > 0) dbDocs = parsed as string[]
    } catch { /* ignore */ }
  }

  if (isFree) {
    return [{
      tier: 'recommended',
      label: 'Recommended to carry',
      color: 'text-blue-700',
      dotColor: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      items: [
        { name: 'Valid passport', description: '6+ months validity beyond travel dates', why: 'Entry may be denied if passport expires within 6 months of your visit' },
        { name: 'Return ticket', description: 'Proof of onward/return journey', why: 'Border officers may ask to confirm you plan to leave' },
        { name: 'Proof of accommodation', description: 'Hotel booking or host invitation', why: 'Confirms your plans during the stay' },
      ],
    }]
  }

  if (isArrival) {
    return [
      {
        tier: 'mandatory',
        label: 'Mandatory — bring to the airport',
        color: 'text-red-700',
        dotColor: 'bg-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        items: [
          { name: 'Valid passport', description: '6+ months validity beyond travel dates', why: 'Required for all international travel' },
          { name: 'Return ticket', description: 'Confirmed return or onward flight booking', why: 'Officers verify you will leave the country' },
          { name: 'Sufficient funds', description: 'Cash or card proof (amount varies by country)', why: 'Shows you can support yourself during the stay' },
          { name: 'Passport photo', description: '1 copy, white background, recent', why: 'Used to process your visa-on-arrival stamp' },
        ],
      },
      {
        tier: 'recommended',
        label: 'Recommended',
        color: 'text-blue-700',
        dotColor: 'bg-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        items: [
          { name: 'Hotel booking confirmation', description: 'Printout or digital copy', why: 'Speeds up immigration processing' },
          { name: 'Travel insurance', description: 'Covers medical emergencies abroad', why: 'Strongly advised for all international travel' },
        ],
      },
    ]
  }

  if (isWork) {
    return [
      {
        tier: 'mandatory',
        label: 'Mandatory — everyone needs',
        color: 'text-red-700',
        dotColor: 'bg-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        items: [
          { name: 'Valid passport', description: '6+ months validity beyond work permit duration', why: 'Base document for all applications' },
          { name: 'Employment contract / offer letter', description: 'Signed by employer, in English or local language', why: 'Proves legitimate employment purpose' },
          { name: 'Educational certificates', description: 'Degree / diploma relevant to the role', why: 'Verifies your qualifications match job requirements' },
          { name: 'Passport photos', description: '4 copies, white background, recent', why: 'Required for work permit processing' },
          { name: 'Sponsor letter from employer', description: 'On company letterhead', why: 'Confirms your employer is sponsoring your visa' },
        ],
      },
      {
        tier: 'conditional',
        label: 'Conditional — if applicable',
        color: 'text-amber-700',
        dotColor: 'bg-amber-500',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        items: [
          { name: 'Police clearance certificate', description: 'From your home country', why: 'Required for most long-term work permits', conditional: 'For permits longer than 90 days' },
          { name: 'Medical examination certificate', description: 'From an approved clinic', why: 'Required by certain countries', conditional: 'Required by some countries for long-term work permits' },
          { name: 'Bank statements', description: 'Last 3–6 months', why: 'Shows financial stability', conditional: "If employer doesn't provide a salary guarantee" },
        ],
      },
    ]
  }

  if (isStudent) {
    return [
      {
        tier: 'mandatory',
        label: 'Mandatory — everyone needs',
        color: 'text-red-700',
        dotColor: 'bg-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        items: [
          { name: 'Valid passport', description: '6+ months beyond course end date', why: 'Base document for all applications' },
          { name: 'University acceptance letter', description: 'Official letter from the institution', why: 'Proves enrollment at an approved institution' },
          { name: 'Academic transcripts', description: 'Previous education records', why: 'Verifies academic qualifications' },
          { name: 'Passport photos', description: 'Multiple copies, white background', why: 'Required for student visa processing' },
        ],
      },
      {
        tier: 'mandatory',
        label: 'Financial proof',
        color: 'text-red-700',
        dotColor: 'bg-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        items: [
          { name: 'Financial proof', description: 'Bank statements covering tuition + living costs', why: 'Must prove ability to fund your entire study period' },
          { name: 'Accommodation confirmation', description: 'University dorm or private rental agreement', why: 'Shows you have a place to stay' },
        ],
      },
      {
        tier: 'recommended',
        label: 'Recommended',
        color: 'text-blue-700',
        dotColor: 'bg-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        items: [
          { name: 'English proficiency scores', description: 'IELTS, TOEFL or equivalent (if applicable)', why: 'Some institutions require proof of language ability' },
          { name: 'Medical insurance', description: 'Health coverage for duration of study', why: 'Required by most countries for student visas' },
        ],
      },
    ]
  }

  // eVisa / Tourist — use DB docs if present, otherwise COUNTRY-NEUTRAL defaults.
  // (These fallbacks must never name a specific country's portal or rules, or that
  // content bleeds across destinations. The exact official portal/fee live in the
  // "Official Source" link and "How to Apply" section, which are per-destination.)
  const mandatoryItems: DocumentItem[] = dbDocs.length > 0
    ? dbDocs.slice(0, 4).map(d => ({ name: d, description: '', why: '' }))
    : [
        { name: 'Valid passport', description: '6+ months validity beyond travel dates', why: 'Most countries require at least 6 months of passport validity on arrival' },
        { name: 'Completed visa application', description: 'Submitted via the official government portal (see Official Source below)', why: 'Your application must be approved before you travel' },
        { name: 'Passport-sized photo', description: 'White background, recent (taken within 6 months)', why: 'Submitted with your application as part of identity verification' },
        { name: 'Confirmed return ticket', description: 'Round-trip or onward flight booking', why: 'Immigration officers commonly verify you have a plan to depart' },
      ]

  const conditionalItems: DocumentItem[] = [
    { name: 'Invitation / sponsor letter', description: 'On company or host letterhead', why: 'Required if your visit purpose includes business or visiting a host', conditional: 'If travelling for business or visiting someone' },
    { name: 'Bank statements (last 3 months)', description: 'Showing sufficient funds for your stay', why: 'Demonstrates financial capability to cover expenses', conditional: 'If self-employed or freelance' },
    { name: 'Employment letter', description: 'From your employer confirming your job and salary', why: 'Strengthens your application', conditional: 'If employed' },
  ]

  const recommendedItems: DocumentItem[] = [
    { name: 'Hotel booking confirmation', description: 'Printout or digital copy of reservation', why: 'Speeds up immigration and strengthens your application' },
    { name: 'Travel insurance', description: 'Medical coverage for the duration of stay', why: 'Strongly advised — healthcare costs abroad can be very high' },
    { name: 'Proof of sufficient funds', description: 'Bank card or statement covering your stay', why: 'Officers may ask how you will support yourself during the visit' },
  ]

  return [
    {
      tier: 'mandatory',
      label: 'Mandatory — everyone needs',
      color: 'text-red-700',
      dotColor: 'bg-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      items: mandatoryItems,
    },
    {
      tier: 'conditional',
      label: 'Conditional — if applicable',
      color: 'text-amber-700',
      dotColor: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      items: conditionalItems,
    },
    {
      tier: 'recommended',
      label: 'Recommended — improves your chances',
      color: 'text-blue-700',
      dotColor: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      items: recommendedItems,
    },
  ]
}

// ─── Tooltip component ────────────────────────────────────────────────────────
function Tooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-block align-middle ml-1">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-[10px] font-bold text-gray-500 hover:border-[#14B8A6] hover:text-[#14B8A6] transition"
        aria-label="Why this matters"
      >
        ?
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 w-52 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-2.5 text-xs text-gray-600 shadow-lg leading-relaxed">
          <div className="mb-1 font-semibold text-gray-800 text-[11px]">Why this matters</div>
          {text}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-white" />
        </div>
      )}
    </span>
  )
}

// ─── AI Checker CTA with hover animation ─────────────────────────────────────
function AICheckerCTA({ onOpen }: { onOpen?: () => void }) {
  const [hovered, setHovered] = useState(false)
  const DOCS = ['🛂', '🖼️', '🏦', '🛡️', '✈️']
  return (
    <div className="relative mt-6 print:hidden">
      {/* Glow */}
      <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#14B8A6] to-[#6366F1] blur-sm transition-opacity duration-300 ${hovered ? 'opacity-70' : 'opacity-40 animate-pulse'}`} />
      <button
        onClick={onOpen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative w-full rounded-2xl bg-gradient-to-r from-[#14B8A6] to-[#6366F1] px-6 py-4 text-sm font-bold text-white shadow-lg transition-all hover:from-[#0d9488] hover:to-[#4F46E5] hover:shadow-xl active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🤖</span>
          <div className="text-left flex-1">
            <div className="font-bold">Check My Documents with AI · FREE</div>
            <AnimatePresence mode="wait">
              {hovered ? (
                <motion.div
                  key="hover"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1 mt-0.5"
                >
                  {DOCS.map((d, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.5, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.06, type: 'spring', stiffness: 400 }}
                      className="text-sm"
                    >
                      {d}
                    </motion.span>
                  ))}
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="text-xs opacity-80 ml-1"
                  >
                    → analyzing…
                  </motion.span>
                </motion.div>
              ) : (
                <motion.p
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs opacity-80 font-normal mt-0.5"
                >
                  Upload your docs — instant AI feedback before you submit
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold tracking-wide">FREE</span>
        </div>
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DocumentChecklist({
  visaRecord,
  passportName: _passportName,
  destinationName,
  onOpenAIChecker,
}: DocumentChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  if (!visaRecord) return null

  const groups = resolveDocumentGroups(visaRecord, destinationName)
  const visaType = (visaRecord.visa_type ?? visaRecord.type ?? '').toString()
  const isFree = /free|no visa/i.test(visaType)

  const toggleCheck = (key: string) => {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <section id="requirements" aria-labelledby="requirements-heading" className="scroll-mt-20">
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <h2 id="requirements-heading" className="text-xl font-bold text-[#1F2937]">
            Documents Needed
          </h2>
          {isFree && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
              ✓ No visa — just pack and go!
            </span>
          )}
        </div>

        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.tier}>
              {/* Group header */}
              <div className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${group.bgColor} ${group.borderColor} ${group.color}`}>
                <span className={`h-2 w-2 rounded-full flex-shrink-0 ${group.dotColor}`} />
                {group.label}
              </div>

              {/* Items */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {group.items.map((item, idx) => {
                  const key = `${group.tier}-${idx}`
                  const isChecked = checked[key]
                  return (
                    <button
                      key={key}
                      onClick={() => toggleCheck(key)}
                      className={[
                        'flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all w-full',
                        isChecked
                          ? 'border-[#14B8A6]/40 bg-[#14B8A6]/5'
                          : 'border-[#E5E7EB] bg-[#F8FAFC] hover:border-[#14B8A6]/30 hover:bg-[#14B8A6]/5',
                      ].join(' ')}
                    >
                      {/* Checkbox */}
                      <span className={[
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
                        isChecked
                          ? 'border-[#14B8A6] bg-[#14B8A6]'
                          : 'border-gray-300 bg-white',
                      ].join(' ')}>
                        {isChecked && (
                          <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m5 12 5 5L20 7" />
                          </svg>
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center flex-wrap gap-1">
                          <span className={`text-sm font-semibold leading-snug ${isChecked ? 'line-through text-gray-400' : 'text-[#1F2937]'}`}>
                            {item.name}
                          </span>
                          {item.why && <Tooltip text={item.why} />}
                        </div>
                        {item.description && (
                          <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{item.description}</p>
                        )}
                        {item.conditional && (
                          <p className="mt-1 text-[11px] font-medium text-amber-600 italic">↳ {item.conditional}</p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* AI Document Checker CTA */}
        {!isFree && <AICheckerCTA onOpen={onOpenAIChecker} />}
      </div>
    </section>
  )
}
