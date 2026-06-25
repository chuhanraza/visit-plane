'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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

// ─── Document data resolver (unchanged content) ─────────────────────────────────
function resolveDocumentGroups(record: VisaRecord, destinationName: string): DocumentGroup[] {
  const visaType = (record.visa_type ?? record.type ?? '').toString().toLowerCase()
  const isFree      = /free|no visa/i.test(visaType)
  const isArrival   = /arrival/i.test(visaType)
  const isWork      = /work|employment/i.test(visaType)
  const isStudent   = /student/i.test(visaType)

  const rawDocs = record.required_documents ?? (record as Record<string, unknown>).required_docs
  let dbDocs: string[] = []
  if (rawDocs) {
    try {
      const parsed = typeof rawDocs === 'string' ? JSON.parse(rawDocs) : rawDocs
      if (Array.isArray(parsed) && parsed.length > 0) dbDocs = parsed as string[]
    } catch { /* ignore */ }
  }

  const M = { color: 'text-red-700', dotColor: 'bg-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
  const C = { color: 'text-amber-700', dotColor: 'bg-amber-500', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' }
  const R = { color: 'text-blue-700', dotColor: 'bg-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' }

  if (isFree) {
    return [{
      tier: 'recommended', label: 'Recommended to carry', ...R,
      items: [
        { name: 'Valid passport', description: '6+ months validity beyond travel dates', why: 'Entry may be denied if passport expires within 6 months of your visit' },
        { name: 'Return ticket', description: 'Proof of onward/return journey', why: 'Border officers may ask to confirm you plan to leave' },
        { name: 'Proof of accommodation', description: 'Hotel booking or host invitation', why: 'Confirms your plans during the stay' },
      ],
    }]
  }

  if (isArrival) {
    return [
      { tier: 'mandatory', label: 'Mandatory — bring to the airport', ...M, items: [
        { name: 'Valid passport', description: '6+ months validity beyond travel dates', why: 'Required for all international travel' },
        { name: 'Return ticket', description: 'Confirmed return or onward flight booking', why: 'Officers verify you will leave the country' },
        { name: 'Sufficient funds', description: 'Cash or card proof (amount varies by country)', why: 'Shows you can support yourself during the stay' },
        { name: 'Passport photo', description: '1 copy, white background, recent', why: 'Used to process your visa-on-arrival stamp' },
      ]},
      { tier: 'recommended', label: 'Recommended', ...R, items: [
        { name: 'Hotel booking confirmation', description: 'Printout or digital copy', why: 'Speeds up immigration processing' },
        { name: 'Travel insurance', description: 'Covers medical emergencies abroad', why: 'Strongly advised for all international travel' },
      ]},
    ]
  }

  if (isWork) {
    return [
      { tier: 'mandatory', label: 'Mandatory — everyone needs', ...M, items: [
        { name: 'Valid passport', description: '6+ months validity beyond work permit duration', why: 'Base document for all applications' },
        { name: 'Employment contract / offer letter', description: 'Signed by employer, in English or local language', why: 'Proves legitimate employment purpose' },
        { name: 'Educational certificates', description: 'Degree / diploma relevant to the role', why: 'Verifies your qualifications match job requirements' },
        { name: 'Passport photos', description: '4 copies, white background, recent', why: 'Required for work permit processing' },
        { name: 'Sponsor letter from employer', description: 'On company letterhead', why: 'Confirms your employer is sponsoring your visa' },
      ]},
      { tier: 'conditional', label: 'Conditional — if applicable', ...C, items: [
        { name: 'Police clearance certificate', description: 'From your home country', why: 'Required for most long-term work permits', conditional: 'For permits longer than 90 days' },
        { name: 'Medical examination certificate', description: 'From an approved clinic', why: 'Required by certain countries', conditional: 'Required by some countries for long-term work permits' },
        { name: 'Bank statements', description: 'Last 3–6 months', why: 'Shows financial stability', conditional: "If employer doesn't provide a salary guarantee" },
      ]},
    ]
  }

  if (isStudent) {
    return [
      { tier: 'mandatory', label: 'Mandatory — everyone needs', ...M, items: [
        { name: 'Valid passport', description: '6+ months beyond course end date', why: 'Base document for all applications' },
        { name: 'University acceptance letter', description: 'Official letter from the institution', why: 'Proves enrollment at an approved institution' },
        { name: 'Academic transcripts', description: 'Previous education records', why: 'Verifies academic qualifications' },
        { name: 'Passport photos', description: 'Multiple copies, white background', why: 'Required for student visa processing' },
      ]},
      { tier: 'mandatory', label: 'Financial proof', ...M, items: [
        { name: 'Financial proof', description: 'Bank statements covering tuition + living costs', why: 'Must prove ability to fund your entire study period' },
        { name: 'Accommodation confirmation', description: 'University dorm or private rental agreement', why: 'Shows you have a place to stay' },
      ]},
      { tier: 'recommended', label: 'Recommended', ...R, items: [
        { name: 'English proficiency scores', description: 'IELTS, TOEFL or equivalent (if applicable)', why: 'Some institutions require proof of language ability' },
        { name: 'Medical insurance', description: 'Health coverage for duration of study', why: 'Required by most countries for student visas' },
      ]},
    ]
  }

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
    { tier: 'mandatory', label: 'Mandatory — everyone needs', ...M, items: mandatoryItems },
    { tier: 'conditional', label: 'Conditional — if applicable', ...C, items: conditionalItems },
    { tier: 'recommended', label: 'Recommended — improves your chances', ...R, items: recommendedItems },
  ]
}

// ─── Tier presentation ──────────────────────────────────────────────────────
const TIER = {
  mandatory:   { name: 'Mandatory',   sub: 'everyone needs',        dot: 'bg-rose-500',  text: 'text-rose-600',  chip: 'bg-rose-50 text-rose-700 ring-rose-200/70' },
  conditional: { name: 'Conditional', sub: 'if it applies to you',  dot: 'bg-amber-500', text: 'text-amber-600', chip: 'bg-amber-50 text-amber-700 ring-amber-200/70' },
  recommended: { name: 'Recommended', sub: 'improves your chances', dot: 'bg-sky-500',   text: 'text-sky-600',   chip: 'bg-sky-50 text-sky-700 ring-sky-200/70' },
} as const

// ─── Tooltip ────────────────────────────────────────────────────────────────
function Tooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-block align-middle">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 bg-white text-[10px] font-bold text-gray-400 transition hover:border-teal-400 hover:text-teal-600"
        aria-label="Why this matters"
      >?</button>
      {open && (
        <span className="absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-xl border border-gray-200 bg-white p-3 text-left text-xs leading-relaxed text-gray-600 shadow-xl">
          <span className="mb-1 block text-[11px] font-bold text-gray-800">Why this matters</span>
          {text}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-white" />
        </span>
      )}
    </span>
  )
}

function IconCheck({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
}

// ─── AI Checker CTA ─────────────────────────────────────────────────────────
function AICheckerCTA({ onOpen }: { onOpen?: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group relative mt-6 flex w-full items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-[#14B8A6] to-[#6366F1] px-5 py-4 text-left text-white shadow-lg shadow-indigo-500/15 transition hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.99] print:hidden sm:px-6"
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" aria-hidden="true" />
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /><circle cx="12" cy="12" r="3.2" /></svg>
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="block text-sm font-bold sm:text-[15px]">Check my documents with AI</span>
        <span className="mt-0.5 block text-xs text-white/85">Upload your docs — instant feedback before you submit</span>
      </span>
      <span className="relative shrink-0 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wide">FREE</span>
    </button>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function DocumentChecklist({
  visaRecord,
  destinationName,
  onOpenAIChecker,
}: DocumentChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  if (!visaRecord) return null

  const groups = resolveDocumentGroups(visaRecord, destinationName)
  const visaType = (visaRecord.visa_type ?? visaRecord.type ?? '').toString()
  const isFree = /free|no visa/i.test(visaType)

  const allKeys: string[] = []
  groups.forEach((g, gi) => g.items.forEach((_, idx) => allKeys.push(`${gi}-${idx}`)))
  const total = allKeys.length
  const done = allKeys.filter((k) => checked[k]).length
  const pct = total ? Math.round((done / total) * 100) : 0
  const allDone = done === total && total > 0

  const toggleCheck = (key: string) => setChecked((p) => ({ ...p, [key]: !p[key] }))

  return (
    <section id="requirements" aria-labelledby="requirements-heading" className="scroll-mt-20">
      <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.18)]">
        {/* Header + progress */}
        <div className="border-b border-gray-100 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="requirements-heading" className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">Documents needed</h2>
              <p className="mt-1 text-sm text-gray-500">Tick each off as you gather it — your progress is saved on this page.</p>
            </div>
            {isFree ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <IconCheck className="h-3.5 w-3.5" /> No visa — just pack and go
              </span>
            ) : (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${allDone ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                {allDone ? <><IconCheck className="h-3.5 w-3.5" /> All gathered</> : `${done} of ${total} gathered`}
              </span>
            )}
          </div>
          {!isFree && (
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <motion.div
                className={`h-full rounded-full ${allDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#14B8A6] to-[#0EA5A0]'}`}
                initial={false}
                animate={{ width: `${pct}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 26 }}
              />
            </div>
          )}
        </div>

        {/* Groups */}
        <div className="space-y-8 p-6 sm:p-8">
          {groups.map((group, gi) => {
            const t = TIER[group.tier]
            return (
              <div key={`${group.tier}-${gi}`}>
                {/* Group label */}
                <div className="mb-3.5 flex items-center gap-2.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${t.dot}`} />
                  <span className={`text-sm font-extrabold ${t.text}`}>{t.name}</span>
                  <span className="text-sm font-medium text-gray-400">· {t.sub}</span>
                  <span className="ml-auto text-xs font-semibold text-gray-400">{group.items.length}</span>
                </div>

                {/* Items */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {group.items.map((item, idx) => {
                    const key = `${gi}-${idx}`
                    const isChecked = checked[key]
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleCheck(key)}
                        aria-pressed={isChecked}
                        className={[
                          'group/item flex items-start gap-3 rounded-2xl border p-4 text-left transition-all',
                          isChecked
                            ? 'border-emerald-300 bg-emerald-50/70'
                            : 'border-gray-200 bg-white hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md hover:shadow-teal-500/5',
                        ].join(' ')}
                      >
                        {/* Checkbox */}
                        <span className={[
                          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all',
                          isChecked ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-300 bg-white text-transparent group-hover/item:border-teal-400',
                        ].join(' ')}>
                          <motion.span initial={false} animate={{ scale: isChecked ? 1 : 0, opacity: isChecked ? 1 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 22 }}>
                            <IconCheck />
                          </motion.span>
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-1.5">
                            <span className={`text-[15px] font-bold leading-snug ${isChecked ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{item.name}</span>
                            {item.why && <Tooltip text={item.why} />}
                          </span>
                          {item.description && (
                            <span className="mt-0.5 block text-[13px] leading-relaxed text-gray-500">{item.description}</span>
                          )}
                          {item.conditional && (
                            <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200/70">
                              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                              {item.conditional}
                            </span>
                          )}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* AI Document Checker */}
          {!isFree && <AICheckerCTA onOpen={onOpenAIChecker} />}
        </div>
      </div>
    </section>
  )
}
