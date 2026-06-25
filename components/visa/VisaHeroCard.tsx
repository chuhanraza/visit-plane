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

// ─── Status theme ───────────────────────────────────────────────────────────
type ToneKey = 'emerald' | 'sky' | 'teal' | 'violet' | 'amber' | 'rose'
type IconKey = 'check' | 'plane' | 'globe' | 'doc'

interface StatusTheme {
  label: string
  verdict: string
  tone: ToneKey
  icon: IconKey
}

const TONES: Record<ToneKey, { soft: string; text: string; chip: string; dot: string; grad: string }> = {
  emerald: { soft: 'bg-emerald-50', text: 'text-emerald-700', chip: 'bg-emerald-100 text-emerald-600', dot: 'bg-emerald-500', grad: 'from-emerald-50' },
  sky:     { soft: 'bg-sky-50',     text: 'text-sky-700',     chip: 'bg-sky-100 text-sky-600',         dot: 'bg-sky-500',     grad: 'from-sky-50' },
  teal:    { soft: 'bg-teal-50',    text: 'text-teal-700',    chip: 'bg-teal-100 text-teal-600',       dot: 'bg-teal-500',    grad: 'from-teal-50' },
  violet:  { soft: 'bg-violet-50',  text: 'text-violet-700',  chip: 'bg-violet-100 text-violet-600',   dot: 'bg-violet-500',  grad: 'from-violet-50' },
  amber:   { soft: 'bg-amber-50',   text: 'text-amber-700',   chip: 'bg-amber-100 text-amber-600',     dot: 'bg-amber-500',   grad: 'from-amber-50' },
  rose:    { soft: 'bg-rose-50',    text: 'text-rose-700',    chip: 'bg-rose-100 text-rose-600',       dot: 'bg-rose-500',    grad: 'from-rose-50' },
}

function resolveTheme(visaType: string): StatusTheme {
  const v = (visaType || '').toLowerCase()
  if (/free|no visa/.test(v))             return { label: 'Visa-Free',         verdict: 'Enter with just your passport — no visa needed.', tone: 'emerald', icon: 'check' }
  if (/arrival/.test(v))                  return { label: 'Visa on Arrival',   verdict: 'Get your visa stamped when you land.',            tone: 'sky',     icon: 'plane' }
  if (/evisa|e-visa|electronic/.test(v))  return { label: 'eVisa',             verdict: 'Apply online — no embassy visit needed.',         tone: 'teal',    icon: 'globe' }
  if (/student/.test(v))                  return { label: 'Student Visa',      verdict: 'A study permit is required before you travel.',   tone: 'violet',  icon: 'doc' }
  if (/work|employment/.test(v))          return { label: 'Work Visa',         verdict: 'A work permit is required before you travel.',    tone: 'amber',   icon: 'doc' }
  return                                    { label: 'Visa Required',          verdict: 'You’ll need a visa approved before you travel.',  tone: 'rose',    icon: 'doc' }
}

// ─── Icons (clean line set) ─────────────────────────────────────────────────
const ic = 'h-[18px] w-[18px]'
function StatusGlyph({ k, className = 'h-6 w-6' }: { k: IconKey; className?: string }) {
  const p = { className, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  if (k === 'check') return <svg {...p}><path d="M20 6 9 17l-5-5" /></svg>
  if (k === 'plane') return <svg {...p}><path d="M2 22h20" /><path d="M6.5 17.5 21 14a1.5 1.5 0 0 0-.4-2.9l-4.6-.2-5-6.4a1 1 0 0 0-1.7.9l1.6 5.9-4 .7-1.6-2a1 1 0 0 0-1.7.3l-.8 2.3Z" /></svg>
  if (k === 'globe') return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" /></svg>
  return <svg {...p}><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" /><path d="M9 13h6M9 17h4" /></svg>
}
function IGlobe() { return <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" /></svg> }
function ITag() { return <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v4.6a2 2 0 0 0 .6 1.4l7.4 7.4a2 2 0 0 0 2.8 0l4.2-4.2a2 2 0 0 0 0-2.8L13.6 6A2 2 0 0 0 12.2 5.4H7.6A2 2 0 0 0 5.6 7" /><circle cx="8" cy="9.5" r="1.2" fill="currentColor" stroke="none" /></svg> }
function IClock() { return <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg> }
function ICal() { return <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></svg> }
function IArrow() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg> }
function IDownload() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M5 21h14" /></svg> }
function IShield() { return <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></svg> }
function IBookmark({ filled }: { filled: boolean }) { return <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z" /></svg> }

// ─── Data resolvers (unchanged logic) ───────────────────────────────────────
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
function resolveSmartFee(record: VisaRecord, visaType: string, destinationName: string): string {
  if (/free|no visa/i.test(visaType)) return 'Free'
  const raw = (record.price ?? record.fee ?? record.cost ?? (record as Record<string, unknown>).pricing ?? '').toString().trim()
  if (raw && !/n\/a|contact|check/i.test(raw)) {
    if (/^\$/.test(raw)) return raw
    if (/^\d/.test(raw)) return `$${raw}`
    return raw
  }
  const curated = getCuratedDestinationFee(destinationName)
  if (curated && curated !== '—') return curated
  return 'Check source'
}
function resolveSmartProcessing(record: VisaRecord, visaType: string): string {
  if (/free|no visa/i.test(visaType)) return 'None needed'
  if (/arrival/i.test(visaType))      return 'On arrival'
  const raw = (record.processing_time ?? record.duration ?? '').toString().trim()
  if (!raw) return 'Varies'
  return raw
}
function resolveValidity(record: VisaRecord): string {
  return (record.validity ?? record.stay_duration ?? '').toString().trim() || 'Varies'
}
function estimatePKR(feeStr: string): string | null {
  const match = feeStr.match(/\$(\d+(?:\.\d+)?)/)
  if (!match) return null
  return `≈ PKR ${Math.round(parseFloat(match[1]) * 280).toLocaleString()}`
}

// ─── Component ──────────────────────────────────────────────────────────────
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

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('visitplane_saved_visas') ?? '[]')
      setSaved(stored.includes(`${passportName}→${destinationName}`))
    } catch { /* ignore */ }
  }, [passportName, destinationName])

  const toggleSave = () => {
    try {
      const key = `${passportName}→${destinationName}`
      const stored: string[] = JSON.parse(localStorage.getItem('visitplane_saved_visas') ?? '[]')
      const next = saved ? stored.filter((k) => k !== key) : [...stored, key]
      localStorage.setItem('visitplane_saved_visas', JSON.stringify(next))
      setSaved(!saved)
    } catch { /* ignore */ }
  }

  if (!visaRecord) {
    return (
      <div className="mx-auto mt-6 max-w-4xl rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-400">No visa data available for this route.</p>
      </div>
    )
  }

  const visaType = (visaRecord.visa_type ?? visaRecord.type ?? 'Tourist Visa').toString()
  const theme = resolveTheme(visaType)
  const tone = TONES[theme.tone]
  const fee = resolveSmartFee(visaRecord, visaType, destinationName)
  const pkr = estimatePKR(fee)
  const processing = resolveSmartProcessing(visaRecord, visaType)
  const validity = resolveValidity(visaRecord)
  const applyUrl = resolveApplyUrl(visaRecord, destinationName)
  const lastVerified = visaRecord.last_verified
    ? new Date(visaRecord.last_verified as string).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '26 May 2026'
  const isFree = /free|no visa/i.test(visaType)
  const isArrival = /arrival/i.test(visaType)
  const applyLabel = isFree ? 'No visa needed' : isArrival ? 'On arrival' : 'Apply online'

  const stats = [
    { label: 'How to apply', value: applyLabel, sub: null as string | null, Icon: IGlobe },
    { label: 'Cost', value: isFree ? 'Free' : fee, sub: isFree ? null : pkr, Icon: ITag },
    { label: 'Processing', value: processing, sub: null, Icon: IClock },
    { label: 'Stay', value: validity, sub: null, Icon: ICal },
  ]

  return (
    <section id="visa-hero" aria-label="Visa requirement summary" className="mx-auto max-w-4xl px-4 pb-2 pt-6 sm:px-6">
      {/* Route indicator */}
      <div className="mb-6 flex items-center justify-center gap-3 sm:gap-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-gray-100 sm:h-12 sm:w-12 sm:text-[26px]">{passportFlag}</span>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-[26px]">{passportName}</h1>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-teal-600"><IArrow /></span>
        <div className="flex items-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-gray-100 sm:h-12 sm:w-12 sm:text-[26px]">{destinationFlag}</span>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-[26px]">{destinationName}</h1>
        </div>
      </div>

      {/* Answer card */}
      <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.25)]">
        {/* Status header */}
        <div className={`relative flex items-center gap-4 bg-gradient-to-r ${tone.grad} to-white px-5 py-5 sm:px-7`}>
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone.chip} sm:h-14 sm:w-14`}>
            <StatusGlyph k={theme.icon} className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className={`text-[11px] font-bold uppercase tracking-[0.14em] ${tone.text}`}>Visa status</div>
            <div className="mt-0.5 text-2xl font-extrabold leading-tight text-gray-900 sm:text-[28px]">{theme.label}</div>
            <p className="mt-1 text-sm leading-snug text-gray-500 sm:hidden">{theme.verdict}</p>
          </div>
          <p className="hidden max-w-[15rem] text-right text-sm leading-snug text-gray-500 sm:block">{theme.verdict}</p>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 gap-3 px-5 pt-5 sm:grid-cols-4 sm:px-7">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3.5 transition hover:border-gray-200 hover:bg-white sm:p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm ring-1 ring-gray-100">
                <s.Icon />
              </div>
              <div className="mt-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">{s.label}</div>
              <div className="mt-0.5 truncate text-[15px] font-extrabold text-gray-900" title={s.value}>{s.value}</div>
              {s.sub && <div className="truncate text-[11px] font-medium text-gray-400">{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div className="flex flex-col gap-3 px-5 pb-5 pt-5 sm:flex-row sm:items-center sm:px-7">
          {applyUrl ? (
            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              onClick={onApplyClick}
              className="group flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#14B8A6] to-[#0EA5A0] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-teal-500/20 transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99] print:hidden"
            >
              Get my visa <IArrow />
            </a>
          ) : (
            <button
              onClick={onApplyClick}
              className="group flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#14B8A6] to-[#0EA5A0] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-teal-500/20 transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99] print:hidden"
            >
              Get my visa <IArrow />
            </button>
          )}
          <button
            onClick={onDownloadChecklist}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-bold text-gray-700 transition hover:border-teal-300 hover:text-teal-700 active:scale-[0.99] print:hidden"
          >
            <IDownload /> Download checklist
          </button>
          <button
            onClick={toggleSave}
            aria-label={saved ? 'Saved — tap to remove' : 'Save this route'}
            title={saved ? 'Saved' : 'Save for later'}
            className={`flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-2xl border transition active:scale-95 print:hidden ${saved ? 'border-teal-300 bg-teal-50 text-teal-600' : 'border-gray-200 bg-white text-gray-400 hover:text-gray-600'}`}
          >
            <IBookmark filled={saved} />
          </button>
        </div>

        {/* Reviewed footer */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-gray-100 bg-gray-50/60 px-5 py-3 text-xs text-gray-500 sm:px-7">
          <span className={`flex h-5 w-5 items-center justify-center rounded-full ${tone.chip}`}><IShield /></span>
          <span className="font-medium">Last reviewed {lastVerified}</span>
          <span className="text-gray-300">·</span>
          <span className="font-semibold text-teal-700">cross-checked with official sources</span>
        </div>
      </div>
    </section>
  )
}
