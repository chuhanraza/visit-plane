'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
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
type VisaResult = {
  visa_type: string | null
  processing_time: string | null
  price: string | null
  fee: string | null
  cost: string | null
  duration: string | null
  notes: string | null
  apply_url: string | null
  application_url: string | null
  [key: string]: unknown
}

type FetchState = 'idle' | 'loading' | 'success' | 'none' | 'error'

const VISA_TYPES = ['Tourist', 'Business', 'Student', 'Work']

function matchesVisaType(raw: string | null, typeKey: string): boolean {
  const v = (raw || '').toLowerCase()
  switch (typeKey) {
    case 'Tourist':  return v.includes('tour') || v.includes('visit') || v.includes('holiday') || v.includes('leisure')
    case 'Business': return v.includes('business') || v.includes('commercial')
    case 'Student':  return v.includes('student') || v.includes('study') || v.includes('education')
    case 'Work':     return v.includes('work') || v.includes('employment') || v.includes('labour') || v.includes('labor')
    default: return false
  }
}

function getProcessingTime(row: VisaResult): string {
  return row.processing_time ?? row.duration ?? ''
}

function getVisaFee(row: VisaResult): string {
  return row.price ?? row.fee ?? row.cost ?? ''
}

function getApplyUrl(row: VisaResult): string {
  return row.apply_url ?? row.application_url ?? ''
}

export default function ProcessingTimesPage() {
  const [passport, setPassport] = useState('')
  const [dest, setDest] = useState('')
  const [vtype, setVtype] = useState('Tourist')
  const [fetchState, setFetchState] = useState<FetchState>('idle')
  const [result, setResult] = useState<VisaResult | null>(null)
  const [destinations, setDestinations] = useState<string[]>([])
  const [loadingDests, setLoadingDests] = useState(false)
  const [geoBadgeDismissed, setGeoBadgeDismissed] = useState(false)

  const { countryName, loading: geoLoading } = useUserCountry()

  // Auto-detect passport
  useEffect(() => {
    if (countryName && !geoLoading && !passport) {
      setPassport(countryName)
      setGeoBadgeDismissed(false)
    }
  }, [countryName, geoLoading, passport])

  // Load destinations from Supabase when passport changes
  useEffect(() => {
    if (!passport) { setDestinations([]); setDest(''); return }
    setLoadingDests(true)
    setDest('')
    setFetchState('idle')
    setResult(null)
    getSupabase()
      .from('destinations')
      .select('country_name')
      .ilike('passport_country', passport)
      .order('country_name')
      .then(({ data }) => {
        if (data) {
          const unique = [...new Set(data.map((r) => r.country_name))].sort() as string[]
          setDestinations(unique)
        }
        setLoadingDests(false)
      })
  }, [passport])

  async function handleCheck() {
    if (!passport || !dest) return
    setFetchState('loading')
    setResult(null)

    try {
      const { data, error } = await getSupabase()
        .from('destinations')
        .select('visa_type, processing_time, price, fee, cost, duration, notes, apply_url, application_url')
        .ilike('passport_country', passport)
        .ilike('country_name', dest)
        .limit(20)

      if (error) throw error

      const rows: VisaResult[] = (data ?? []) as VisaResult[]

      if (rows.length === 0) {
        setFetchState('none')
        return
      }

      // Try to match selected visa type first; fall back to first record
      const matched = rows.find(r => matchesVisaType(r.visa_type, vtype)) ?? rows[0]
      setResult(matched)
      setFetchState('success')
    } catch {
      setFetchState('error')
    }
  }

  const input = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#0f0c29] outline-none focus:border-teal-500/50 transition'

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased">
      <ToolBreadcrumb toolName="Processing Times" toolEmoji="⏱️" />

      {/* HERO */}
      <section className="relative overflow-hidden pt-20 pb-12 text-center px-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.12),transparent_65%)]" />
        <div className="relative mx-auto max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-400">
            ⏱️ Processing Time Tracker
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.5rem]">
            <span className="text-[#0f0c29]">How Long Will Your</span><br />
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Visa Take?</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-gray-500">
            Processing time estimates sourced from official embassy and immigration authority data.
          </p>
        </div>
      </section>

      {/* INPUTS */}
      <section className="mx-auto max-w-2xl px-4 pb-20">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-100">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-teal-400">
                Passport Country
              </label>
              <CountrySelect
                value={passport}
                onChange={(v) => { setPassport(v); setGeoBadgeDismissed(true) }}
                placeholder={geoLoading ? '🌍 Detecting your location…' : 'Select country'}
              />
              {passport && !geoBadgeDismissed && !geoLoading && (
                <p className="mt-1 text-[10px] text-teal-400 flex items-center gap-1">
                  📍 Auto-detected
                  <button onClick={() => setGeoBadgeDismissed(true)} className="ml-1 text-gray-400 hover:text-gray-500">✕</button>
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-teal-400">
                Destination
              </label>
              <CountrySelect
                value={dest}
                onChange={setDest}
                placeholder={
                  !passport       ? 'Select passport first' :
                  loadingDests    ? 'Loading…' :
                  destinations.length === 0 ? 'No destinations found' :
                  'Select destination'
                }
                options={destinations.length > 0 ? destinations : undefined}
                disabled={!passport || loadingDests}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-teal-400">
                Visa Type
              </label>
              <select
                value={vtype}
                onChange={e => setVtype(e.target.value)}
                className={input}
                style={{ colorScheme: 'light' }}
              >
                {VISA_TYPES.map(t => (
                  <option key={t} value={t} className="bg-white">{t}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleCheck}
            disabled={!passport || !dest || fetchState === 'loading'}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition hover:from-teal-600 hover:to-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {fetchState === 'loading' ? '⏳ Checking…' : '⏱️ Check Processing Times'}
          </button>
        </div>

        {/* RESULTS */}
        {fetchState === 'loading' && (
          <div className="mt-6 flex items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white p-8">
            <svg className="h-5 w-5 animate-spin text-teal-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-teal-400 font-semibold">Fetching processing data…</span>
          </div>
        )}

        {fetchState === 'error' && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
            <p className="text-sm text-rose-600 font-semibold">Could not load data. Please try again.</p>
          </div>
        )}

        {fetchState === 'none' && (
          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-400">
            <p className="font-semibold text-gray-600 mb-1">No specific data found for this route.</p>
            <p>Processing times typically range from <strong>5–30 business days</strong> depending on your embassy and visa type.</p>
            <p className="mt-2">
              <Link href={`/visa/${encodeURIComponent(passport)}/${encodeURIComponent(dest)}`} className="text-teal-500 hover:underline font-semibold">
                View full visa requirements →
              </Link>
            </p>
          </div>
        )}

        {fetchState === 'success' && result && (
          <div className="mt-6 space-y-4">
            {/* Header */}
            <div className="rounded-2xl border border-teal-500/20 bg-teal-500/[0.06] px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-0.5">Route</p>
              <p className="text-lg font-extrabold text-[#0f0c29]">{passport} → {dest}</p>
              {result.visa_type && (
                <p className="text-xs text-gray-500 mt-0.5">Visa type: <span className="font-semibold text-[#0f0c29]">{result.visa_type}</span></p>
              )}
            </div>

            {/* Processing time cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
                <div className="text-xs font-bold uppercase tracking-widest text-blue-500">📅 Processing Time</div>
                <div className="mt-3 text-2xl font-extrabold text-[#0f0c29]">
                  {getProcessingTime(result) || 'Contact embassy'}
                </div>
                <div className="mt-1 text-xs text-gray-400">Standard timeline (may vary)</div>
              </div>
              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
                <div className="text-xs font-bold uppercase tracking-widest text-teal-500">💰 Estimated Fee</div>
                <div className="mt-3 text-2xl font-extrabold text-[#0f0c29]">
                  {getVisaFee(result) || 'Contact embassy'}
                </div>
                <div className="mt-1 text-xs text-gray-400">May vary by consulate</div>
              </div>
            </div>

            {/* Notes */}
            {result.notes && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">📝 Additional Notes</p>
                <p className="text-sm text-gray-600 leading-relaxed">{result.notes}</p>
              </div>
            )}

            {/* Apply URL */}
            {getApplyUrl(result) && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Official Application Portal</p>
                  <p className="text-sm text-gray-500">Apply directly via the official government portal</p>
                </div>
                <a
                  href={getApplyUrl(result)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold text-white hover:bg-teal-600 transition"
                >
                  Apply Now →
                </a>
              </div>
            )}

            {/* Source citation */}
            <div className="rounded-2xl border border-gray-100 bg-white/80 px-5 py-4">
              <p className="text-xs text-gray-400 leading-relaxed">
                <span className="font-semibold text-gray-500">📌 Source:</span>{' '}
                Data sourced from official embassy, consulate, and national immigration authority records.
                Processing times are estimates and may vary. Always verify current requirements on the
                official {dest} government or embassy website before applying.{' '}
                <Link
                  href={`/visa/${encodeURIComponent(passport)}/${encodeURIComponent(dest)}`}
                  className="text-teal-500 hover:underline font-semibold"
                >
                  View full requirements →
                </Link>
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
