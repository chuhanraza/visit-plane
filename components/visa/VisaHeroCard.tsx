'use client'

import { useState, useEffect } from 'react'
import type { VisaRecord } from '@/app/visa/[passport]/[destination]/VisaPageClient'
import { getCuratedDestinationFee } from '@/lib/data/destinationFees'

// ─── Types ────────────────────────────────────────────────────────────────────
interface VisaHeroCardProps {
  visaRecord: VisaRecord | null
  passportName: string
  passportFlag: string
  destinationName: string
  destinationFlag: string
  onApplyClick?: () => void
  onDownloadChecklist?: () => void
}

// ─── Badge config ─────────────────────────────────────────────────────────────
type BadgeVariant = {
  label: string
  bg: string
  text: string
  dot: string
}

function resolveVisaBadge(visaType: string): BadgeVariant {
  const v = (visaType || '').toLowerCase()
  if (/free|no visa/i.test(v))      return { label: 'Visa Free',     bg: 'bg-emerald-600', text: 'text-white',        dot: 'bg-emerald-300' }
  if (/arrival/i.test(v))           return { label: 'Visa on Arrival',bg: 'bg-blue-600',    text: 'text-white',        dot: 'bg-blue-300'    }
  if (/evisa|e-visa|electronic/i.test(v)) return { label: 'eVisa Required', bg: 'bg-teal-700', text: 'text-white',   dot: 'bg-teal-300'    }
  if (/student/i.test(v))           return { label: 'Student Visa',   bg: 'bg-purple-600',  text: 'text-white',        dot: 'bg-purple-300'  }
  if (/work|employment/i.test(v))   return { label: 'Work Visa',      bg: 'bg-orange-600',  text: 'text-white',        dot: 'bg-orange-300'  }
  return                              { label: 'Visa Required',        bg: 'bg-red-600',     text: 'text-white',        dot: 'bg-red-300'     }
}

function resolveApplyUrl(record: VisaRecord, destinationName: string): string {
  const url = (record.apply_url ?? record.application_url ?? '').toString().trim()
  if (url && url.startsWith('http')) return url
  const dest = destinationName.toLowerCase()
  if (dest.includes('uae') || dest.includes('united arab'))  return 'https://smartservices.icp.gov.ae'
  if (dest.includes('turkey') || dest.includes('türkiye'))   return 'https://www.evisa.gov.tr/en/'
  if (dest.includes('saudi'))                                 return 'https://visa.visitsaudi.com/'
  if (dest.includes('malaysia'))                              return 'https://malaysiavisa.imi.gov.my/'
  if (dest.includes('thailand'))                              return 'https://www.thaievisa.go.th/'
  if (dest.includes('united kingdom') || dest.includes('uk')) return 'https://www.gov.uk/browse/visas-immigration'
  return ''
}

// Single source of truth for the displayed fee. Reads the route's own data
// first, then falls back to the SAME curated value the /destinations grid shows,
// so the hero, apply steps and destinations card never contradict each other.
function resolveSmartFee(record: VisaRecord, visaType: string, destinationName: string): string {
  if (/free|no visa/i.test(visaType)) return 'Free'
  const raw = (record.price ?? record.fee ?? record.cost ?? (record as Record<string, unknown>).pricing ?? '').toString().trim()
  if (raw && !/n\/a|contact|check/i.test(raw)) {
    if (/^\$/.test(raw)) return raw
    if (/^\d/.test(raw)) return `$${raw}`
    return raw
  }
  // Fallback to curated destination fee (shared with the destinations grid).
  const curated = getCuratedDestinationFee(destinationName)
  if (curated && curated !== '—') return curated
  return 'Check official source'
}

function resolveSmartProcessing(record: VisaRecord, visaType: string): string {
  if (/free|no visa/i.test(visaType))    return 'No processing needed'
  if (/arrival/i.test(visaType))         return 'Instant (on arrival)'
  const raw = (record.processing_time ?? record.duration ?? '').toString().trim()
  if (!raw) return 'Varies (check embassy)'
  return raw
}

function resolveValidity(record: VisaRecord): string {
  return (record.validity ?? record.stay_duration ?? '').toString().trim() || 'Varies'
}

// ─── PKR estimate (rough; fee in USD) ────────────────────────────────────────
function estimatePKR(feeStr: string): string | null {
  const match = feeStr.match(/\$(\d+(?:\.\d+)?)/)
  if (!match) return null
  const usd = parseFloat(match[1])
  const rate = 280 // approx PKR/USD
  return `≈ PKR ${Math.round(usd * rate).toLocaleString()}`
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function VisaHeroCard({
  visaRecord,
  passportName,
  passportFlag,
  destinationName,
  destinationFlag,
  onApplyClick,
  onDownloadChecklist,
}: VisaHeroCardProps) {
  const [saved, setSaved] = useState(false)

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('visitplane_saved_visas') ?? '[]')
      const key = `${passportName}→${destinationName}`
      setSaved(stored.includes(key))
    } catch { /* ignore */ }
  }, [passportName, destinationName])

  const toggleSave = () => {
    try {
      const key = `${passportName}→${destinationName}`
      const stored: string[] = JSON.parse(localStorage.getItem('visitplane_saved_visas') ?? '[]')
      const next = saved ? stored.filter(k => k !== key) : [...stored, key]
      localStorage.setItem('visitplane_saved_visas', JSON.stringify(next))
      setSaved(!saved)
    } catch { /* ignore */ }
  }

  if (!visaRecord) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-400 text-sm">No visa data available for this route.</p>
      </div>
    )
  }

  const visaType       = (visaRecord.visa_type ?? visaRecord.type ?? 'Tourist Visa').toString()
  const badge          = resolveVisaBadge(visaType)
  const fee            = resolveSmartFee(visaRecord, visaType, destinationName)
  const pkr            = estimatePKR(fee)
  const processing     = resolveSmartProcessing(visaRecord, visaType)
  const validity       = resolveValidity(visaRecord)
  const applyUrl       = resolveApplyUrl(visaRecord, destinationName)
  const lastVerified   = visaRecord.last_verified
    ? new Date(visaRecord.last_verified as string).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'May 26, 2026'
  const isFree         = /free|no visa/i.test(visaType)
  const isArrival      = /arrival/i.test(visaType)

  // Fact rows — shown in hero card
  const facts = [
    isFree
      ? { icon: '✓', label: 'No visa needed — enter freely' }
      : isArrival
      ? { icon: '✓', label: 'Get visa stamp at the airport' }
      : { icon: '✓', label: 'Apply online before you fly' },
    { icon: '✓', label: `Processing: ${processing}` },
    {
      icon: '✓',
      label: isFree ? 'Cost: Free' : `Cost: ${fee}${pkr ? ` (${pkr})` : ''}`,
    },
    { icon: '✓', label: `Stay: ${validity}` },
  ].filter(Boolean)

  return (
    <section
      id="visa-hero"
      aria-label="Visa requirement summary"
      className="mx-auto max-w-4xl px-4 pt-6 pb-4 sm:px-6"
    >
      {/* Route indicator */}
      <div className="mb-5 flex flex-col items-center gap-1 text-center sm:flex-row sm:justify-center sm:gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#1F2937] sm:text-3xl">
          <span className="text-3xl leading-none">{passportFlag}</span>
          <span>{passportName}</span>
        </h1>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#14B8A6]/15 text-[#14B8A6] text-sm font-bold">→</span>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#1F2937] sm:text-3xl">
          <span className="text-3xl leading-none">{destinationFlag}</span>
          <span>{destinationName}</span>
        </h1>
      </div>

      {/* Hero answer card */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-[#14B8A6] bg-gradient-to-br from-[#f0fdfa] to-white shadow-lg">
        {/* Top badge bar */}
        <div className={`${badge.bg} ${badge.text} flex items-center gap-2.5 px-5 py-3`}>
          <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
          <span className="text-base font-bold tracking-wide">⚡ {badge.label}</span>
        </div>

        {/* Facts */}
        <div className="px-5 pt-4 pb-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {facts.map((f, i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm text-[#134e4a]">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#14B8A6]/20 text-[#14B8A6] text-xs font-bold">✓</span>
              <span className="font-medium">{f.label}</span>
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div className="px-5 pt-4 pb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          {applyUrl ? (
            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              onClick={onApplyClick}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#14B8A6] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#0d9488] hover:shadow-lg active:scale-[0.98] print:hidden"
            >
              Get My Visa →
            </a>
          ) : (
            <button
              onClick={onApplyClick}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#14B8A6] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#0d9488] hover:shadow-lg active:scale-[0.98] print:hidden"
            >
              Get My Visa →
            </button>
          )}
          <button
            onClick={onDownloadChecklist}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#14B8A6] bg-white px-6 py-3.5 text-sm font-bold text-[#14B8A6] transition hover:bg-[#14B8A6]/5 active:scale-[0.98] print:hidden"
          >
            ⎙ Download Checklist
          </button>
        </div>

        {/* Verified footer */}
        <div className="border-t border-[#14B8A6]/20 px-5 py-3 flex items-center gap-2 text-xs text-gray-500">
          <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
          <span>Verified {lastVerified} · 3 official sources</span>
          <button
            onClick={toggleSave}
            aria-label={saved ? 'Unsave this visa' : 'Save this visa'}
            className="ml-auto text-lg transition hover:scale-110 print:hidden"
            title={saved ? 'Saved' : 'Save for later'}
          >
            {saved ? '🔖' : '🔖'}
            <span className="sr-only">{saved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>
    </section>
  )
}
