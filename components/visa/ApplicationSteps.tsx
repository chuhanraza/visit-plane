'use client'

import { useState } from 'react'
import type { VisaRecord } from '@/app/visa/[passport]/[destination]/VisaPageClient'
import { getCuratedDestinationFee } from '@/lib/data/destinationFees'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Step {
  num: number | string
  emoji: string
  title: string
  summary: string
  detail?: string
  link?: { href: string; label: string }
  status?: 'done' | 'active' | 'pending'
}

interface ApplicationStepsProps {
  visaRecord: VisaRecord | null
  passportName: string
  destinationName: string
}

// ─── Route-specific apply URL resolver ───────────────────────────────────────
function resolveApplyInfo(destinationName: string, record: VisaRecord): {
  url: string
  label: string
  altLabel?: string
  altUrl?: string
} {
  const dest = destinationName.toLowerCase()
  const stored = (record.apply_url ?? record.application_url ?? '').toString().trim()
  if (stored.startsWith('http')) return { url: stored, label: 'Apply at official portal' }

  if (dest.includes('uae') || dest.includes('united arab')) return {
    url: 'https://smartservices.icp.gov.ae',
    label: 'Apply at smartservices.icp.gov.ae',
    altLabel: 'Or via Emirates / Etihad Airlines website',
    altUrl: 'https://www.emirates.com',
  }
  if (dest.includes('turkey') || dest.includes('türkiye')) return {
    url: 'https://www.evisa.gov.tr/en/',
    label: 'Apply at evisa.gov.tr',
  }
  if (dest.includes('saudi')) return {
    url: 'https://visa.visitsaudi.com/',
    label: 'Apply at visa.visitsaudi.com',
  }
  if (dest.includes('malaysia')) return {
    url: 'https://malaysiavisa.imi.gov.my/',
    label: 'Apply at malaysiavisa.imi.gov.my',
  }
  if (dest.includes('thailand')) return {
    url: 'https://www.thaievisa.go.th/',
    label: 'Apply at thaievisa.go.th',
  }
  if (dest.includes('united kingdom') || dest.includes('uk')) return {
    url: 'https://www.gov.uk/browse/visas-immigration',
    label: 'Apply at gov.uk/visas-immigration',
  }
  return { url: '', label: 'Apply at official embassy portal' }
}

function resolveSteps(record: VisaRecord, passportName: string, destinationName: string): Step[] {
  const visaType = (record.visa_type ?? record.type ?? '').toString().toLowerCase()
  const isFree     = /free|no visa/i.test(visaType)
  const isArrival  = /arrival/i.test(visaType)
  // Mirror VisaHeroCard.resolveSmartFee exactly — read `pricing` field just as the
  // hero card does, then fall back to the SAME curated destination fee so the
  // hero, these steps and the destinations grid never show contradictory costs.
  const rawFee = (
    record.price ??
    record.fee ??
    record.cost ??
    (record as Record<string, unknown>).pricing as string ??
    ''
  ).toString().trim()
  const curatedFee = getCuratedDestinationFee(destinationName)
  const feeResolved: string | null = isFree
    ? 'Free'
    : rawFee && !/n\/a|contact|check/i.test(rawFee)
      ? (/^\$/.test(rawFee) ? rawFee : /^\d/.test(rawFee) ? `$${rawFee}` : rawFee)
      : (curatedFee && curatedFee !== '—' ? curatedFee : null)
  const feeDisplay = feeResolved ?? 'check official portal'
  const processing = (record.processing_time ?? '3–5 business days').toString()
  const applyInfo  = resolveApplyInfo(destinationName, record)

  if (isFree) {
    return [
      { num: '✅', emoji: '✅', title: `Check eligibility`, summary: `${passportName} passport holders can enter ${destinationName} visa-free`, status: 'done' },
      { num: 2, emoji: '🛂', title: 'Pack travel documents', summary: 'Bring your valid passport (6+ months), return ticket, and proof of accommodation', detail: 'No visa required — just ensure your passport has sufficient validity and you have your travel documents.' },
      { num: 3, emoji: '✈️', title: 'Board your flight', summary: 'Check in and fly directly — no pre-approval needed', detail: 'Your entry is automatic upon arrival. Immigration will stamp your passport.' },
      { num: 4, emoji: '🛂', title: 'Clear immigration on arrival', summary: 'Present your passport at the border, get your entry stamp', detail: 'You may be asked about your stay duration, accommodation, and return plans. Keep your documents accessible.' },
    ]
  }

  if (isArrival) {
    return [
      { num: '✅', emoji: '✅', title: 'Check eligibility', summary: `${passportName} passport holders qualify for visa on arrival`, status: 'done' },
      { num: 2, emoji: '📋', title: 'Prepare documents', summary: 'Gather passport, photo, return ticket, proof of funds', detail: 'Pack a small envelope with your airport documents for easy access at immigration.' },
      { num: 3, emoji: '✈️', title: 'Fly to your destination', summary: 'Book and board your flight — no pre-approval required' },
      { num: 4, emoji: '🏦', title: 'Pay visa fee on arrival', summary: feeResolved ? `Pay ${feeDisplay} in cash at the airport counter` : 'Pay the visa fee in cash at the airport counter (check official source for current amount)', detail: 'Most airports only accept USD or local currency. Bring exact change if possible.' },
      { num: 5, emoji: '🛂', title: 'Get your visa stamp', summary: 'Immigration officer reviews documents and stamps your passport', detail: 'The process typically takes 5–20 minutes depending on queue length.' },
    ]
  }

  return [
    {
      num: '✅',
      emoji: '✅',
      title: 'Check eligibility — you qualify',
      summary: `${passportName} passport holders can apply for this visa`,
      detail: `You are eligible to apply for a ${destinationName} visa. Proceed to gather your documents.`,
      status: 'done',
    },
    {
      num: 2,
      emoji: '📋',
      title: 'Gather your documents',
      summary: 'Collect all mandatory documents from the checklist above',
      detail: 'Scan all documents in high resolution (300 DPI+). Check that photos meet the exact size specifications (white background, 35×45mm or as specified).',
    },
    {
      num: 3,
      emoji: '🌐',
      title: 'Apply online',
      summary: applyInfo.label,
      detail: `Create an account and fill out the application form carefully. ${applyInfo.altLabel ?? ''} Double-check every field before submitting — errors can delay processing.`,
      link: { href: applyInfo.url, label: `Open application portal →` },
    },
    {
      num: 4,
      emoji: '💳',
      title: feeResolved ? `Pay ${feeDisplay} visa fee` : 'Pay visa fee',
      summary: feeResolved
        ? `Pay ${feeDisplay} by credit or debit card through the official portal`
        : 'Pay the required fee by credit or debit card through the official portal (see fee at portal)',
      detail: 'Only pay through the official government portal. Third-party services may charge extra fees. Save your payment receipt.',
    },
    {
      num: 5,
      emoji: '⏳',
      title: `Wait ${processing} for approval`,
      summary: 'Your application is being reviewed by immigration',
      detail: 'You will receive status updates by email. You can also check your application status on the portal. Apply at least 2 weeks before your travel date to be safe.',
    },
    {
      num: 6,
      emoji: '📧',
      title: 'Receive eVisa by email',
      summary: 'Download and save the approval email with your eVisa PDF',
      detail: 'Check your spam folder if you do not receive it within the stated processing time. Save the PDF to your phone and a cloud backup.',
    },
    {
      num: 7,
      emoji: '🛂',
      title: 'Present eVisa on arrival',
      summary: 'Print or show on phone at immigration — you\'re good to go',
      detail: 'Print a copy just in case. Have a digital copy on your phone as backup. Some airlines may also ask to see your visa before boarding.',
    },
  ]
}

// ─── Step card ────────────────────────────────────────────────────────────────
function StepCard({ step, expanded, onToggle }: { step: Step; expanded: boolean; onToggle: () => void }) {
  const isDone   = step.status === 'done'
  const hasDetail = !!step.detail || !!step.link

  return (
    <div className={[
      'rounded-xl border transition-all',
      isDone ? 'border-emerald-200 bg-emerald-50' : expanded ? 'border-[#14B8A6]/40 bg-[#14B8A6]/5' : 'border-[#E5E7EB] bg-[#F8FAFC]',
    ].join(' ')}>
      <button
        onClick={hasDetail ? onToggle : undefined}
        className={`flex w-full items-start gap-4 px-4 py-4 text-left ${hasDetail ? 'cursor-pointer' : 'cursor-default'}`}
        aria-expanded={expanded}
      >
        {/* Step number / emoji */}
        <div className={[
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm',
          isDone ? 'bg-emerald-500 text-white' : 'bg-[#14B8A6] text-white',
        ].join(' ')}>
          {isDone ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12 5 5L20 7" />
            </svg>
          ) : (
            step.num
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-[#1F2937] leading-snug">
              {step.emoji} {step.title}
            </span>
            {isDone && (
              <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 rounded-full px-2 py-0.5">DONE</span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{step.summary}</p>
        </div>

        {hasDetail && (
          <span className={`text-gray-400 text-sm transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}>▾</span>
        )}
      </button>

      {/* Expanded detail */}
      {hasDetail && expanded && (
        <div className="px-4 pb-4 pt-0 ml-13">
          <div className="ml-[52px] space-y-2">
            {step.detail && (
              <p className="text-sm text-gray-600 leading-relaxed">{step.detail}</p>
            )}
            {step.link && step.link.href && (
              <a
                href={step.link.href}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#14B8A6] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#0d9488]"
              >
                {step.link.label}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ApplicationSteps({
  visaRecord,
  passportName,
  destinationName,
}: ApplicationStepsProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  if (!visaRecord) return null

  const steps = resolveSteps(visaRecord, passportName, destinationName)
  const visaType = (visaRecord.visa_type ?? visaRecord.type ?? 'Tourist Visa').toString()

  return (
    <section id="how-to-apply" aria-labelledby="how-to-apply-heading" className="scroll-mt-20">
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <h2 id="how-to-apply-heading" className="text-xl font-bold text-[#1F2937]">
            How to Apply
          </h2>
          <span className="text-sm text-gray-500 font-medium">— {visaType}</span>
        </div>

        <div className="space-y-2.5">
          {steps.map((step, i) => (
            <StepCard
              key={i}
              step={step}
              expanded={expandedIndex === i}
              onToggle={() => setExpandedIndex(expandedIndex === i ? null : i)}
            />
          ))}
        </div>

        <p className="mt-5 text-xs text-gray-400 border-t border-gray-100 pt-4">
          ⚠️ Always apply well in advance of your travel date. Processing times may vary. Verify requirements at the official embassy before submitting.
        </p>
      </div>
    </section>
  )
}
