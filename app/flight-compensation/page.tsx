'use client'

import { useEffect, useMemo, useState } from 'react'
import CountrySelect from '@/components/CountrySelect'
import ToolBreadcrumb from '@/components/ToolBreadcrumb'
import AffiliateDisclosure from '@/components/affiliate/AffiliateDisclosure'
import { affiliateTrackingUrl } from '@/src/lib/affiliates'
import { faqPage } from '@/lib/seo/schema'
import {
  evaluateFlightCompensation,
  buildComplaintTemplate,
  DISTANCE_LABEL,
  type CarrierRegion,
  type DistanceBand,
  type DisruptionType,
  type ExtraordinaryAnswer,
  type EligibilityResult,
} from '@/src/lib/flightCompensation'
import { estimateDistanceBand, detectCarrierRegion } from '@/src/lib/flightAutoDetect'

// ─── Small shared UI bits (mirrors the button-toggle pattern used on
// /cost-calculator and /travel-insurance — no new design system introduced) ────
function ToggleGroup({
  options,
  value,
  onChange,
  columns,
}: {
  options: { value: string; label: string; hint?: string }[]
  value: string
  onChange: (v: string) => void
  columns: 1 | 2 | 3
}) {
  const gridClass = columns === 3 ? 'grid-cols-1 sm:grid-cols-3' : columns === 2 ? 'grid-cols-2' : 'grid-cols-1'
  return (
    <div className={`grid gap-2 ${gridClass}`}>
      {options.map((opt) => (
        <button
          type="button"
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={
            value === opt.value
              ? 'rounded-xl border border-sky-500 bg-sky-500/10 px-3 py-2.5 text-left text-xs font-semibold text-sky-600 transition'
              : 'rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-xs font-semibold text-gray-500 transition hover:border-sky-300'
          }
        >
          <div>{opt.label}</div>
          {opt.hint && <div className="mt-0.5 text-[10px] font-normal text-gray-400">{opt.hint}</div>}
        </button>
      ))}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-sky-500">{children}</label>
}

const textInput =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#0f0c29] outline-none focus:border-sky-500/50 transition'

// ─── Results card ──────────────────────────────────────────────────────────────
function RegimeCard({ result }: { result: EligibilityResult }) {
  let badgeClasses = 'border-gray-200 bg-gray-50 text-gray-400'
  let badgeText = 'Not applicable'
  let cardBorder = 'border-gray-100'

  if (result.inScope) {
    if (result.eligible === 'yes') {
      badgeClasses = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600'
      badgeText = '✅ Likely Eligible'
      cardBorder = 'border-emerald-200'
    } else if (result.eligible === 'maybe') {
      badgeClasses = 'border-amber-500/30 bg-amber-500/10 text-amber-600'
      badgeText = '❓ Possibly Eligible'
      cardBorder = 'border-amber-200'
    } else {
      badgeClasses = 'border-rose-500/30 bg-rose-500/10 text-rose-600'
      badgeText = '❌ Not Eligible'
      cardBorder = 'border-rose-100'
    }
  }

  return (
    <div className={`rounded-2xl border ${cardBorder} bg-white p-5`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-[#0f0c29]">{result.regimeName}</h3>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${badgeClasses}`}>{badgeText}</span>
      </div>
      {result.amountBand && <p className="mb-2 text-2xl font-extrabold text-[#0f0c29]">{result.amountBand}</p>}
      <p className="mb-2 text-sm font-semibold text-gray-600">{result.headline}</p>
      <ul className="mb-2 space-y-1.5">
        {result.reasoning.map((r) => (
          <li key={r} className="flex items-start gap-2 text-xs text-gray-500">
            <span className="mt-0.5 text-gray-300">•</span>
            <span>{r}</span>
          </li>
        ))}
      </ul>
      {result.caveats.length > 0 && (
        <div className="mt-3 space-y-1 rounded-lg bg-gray-50 p-3">
          {result.caveats.map((c) => (
            <p key={c} className="text-[11px] leading-relaxed text-gray-400">⚠️ {c}</p>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── FAQ content — must match what's actually said on this page (no invented
// answers), same rule as lib/seo/schema.ts faqPage() enforces by convention ────
const FAQS = [
  {
    q: 'How much compensation can I get for a delayed flight under EU261?',
    a: 'If your flight departed the EU/EEA (any airline) or landed in the EU/EEA on an EU/EEA airline, arrived 3+ hours late, and the delay was not due to extraordinary circumstances, you may be owed €250 (short-haul, up to 1,500 km), €400 (medium-haul, 1,500–3,500 km), or €600 (long-haul, over 3,500 km) under Regulation (EC) 261/2004, Article 7.',
  },
  {
    q: 'Does the United States have a law like EU261 for delays?',
    a: 'No. The US has no federal law requiring airlines to pay cash compensation for a delayed or cancelled flight, regardless of the cause. You do have a right to a refund if the airline cancels or significantly changes your flight and you decline the rebooking. A separate federal formula (14 CFR 250.5) only covers involuntary denied boarding (overbooking bumps).',
  },
  {
    q: 'What if the airline says the delay was an "extraordinary circumstance"?',
    a: 'Genuinely extraordinary circumstances (severe weather, air traffic control restrictions, security risks, strikes by airport or ATC staff) exempt the airline from paying EU261/UK261 compensation. However, technical or mechanical faults and routine crew issues are generally NOT considered extraordinary under EU case law (Wallentin-Hermann v. Alitalia) — airlines sometimes cite them incorrectly to avoid paying.',
  },
  {
    q: 'What is UK261 and how is it different from EU261?',
    a: 'UK261 is the UK\'s retained version of EU Regulation 261/2004, enforced by the Civil Aviation Authority (CAA) after Brexit. The structure is identical, but amounts are in pounds: £220, £350, and £520 for the same short/medium/long-haul distance bands, and the scope covers UK-departing flights (any airline) or UK-arriving flights on a UK or EU/EEA airline.',
  },
  {
    q: 'Does this tool file my claim for me?',
    a: 'No. This is an information tool only. It never submits anything to any airline or authority automatically. If you want to file yourself, use the free DIY guide and template letter on this page. If you would rather have someone handle it, you can hand off to a licensed claims partner.',
  },
]

// ─── Complaint-letter copy widget ──────────────────────────────────────────────
function ComplaintTemplateBox({ template }: { template: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(template)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      // Clipboard API unavailable/blocked — the text is still visible & selectable below.
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-sky-500">Template Complaint Letter</p>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full bg-sky-500 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-sky-600"
        >
          {copied ? 'Copied ✓' : 'Copy text'}
        </button>
      </div>
      <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-xs leading-relaxed text-gray-600">
        {template}
      </pre>
      <p className="mt-3 text-[11px] text-gray-400">
        This is a starting-point draft only — edit it with your real details before sending it yourself to the airline. VisitPlane does not send this on your behalf.
      </p>
    </div>
  )
}

export default function FlightCompensationPage() {
  const [departureCountry, setDepartureCountry] = useState('')
  const [arrivalCountry, setArrivalCountry] = useState('')
  const [airlineName, setAirlineName] = useState('')
  const [flightDate, setFlightDate] = useState('')
  const [passengerName, setPassengerName] = useState('')
  const [carrierRegion, setCarrierRegion] = useState<CarrierRegion | ''>('')
  const [distanceBand, setDistanceBand] = useState<DistanceBand | ''>('')
  const [disruption, setDisruption] = useState<DisruptionType | ''>('')
  const [delayHours, setDelayHours] = useState('')
  const [cancellationNoticeDays, setCancellationNoticeDays] = useState('')
  const [extraordinaryCircumstances, setExtraordinaryCircumstances] = useState<ExtraordinaryAnswer | ''>('')
  const [deniedBoardingVoluntary, setDeniedBoardingVoluntary] = useState<'yes' | 'no' | ''>('')
  const [submitted, setSubmitted] = useState(false)

  // Both of these start as "not yet touched by hand" — the effects below keep
  // auto-filling from the countries/airline name until the user overrides the
  // toggle themselves, at which point we stop guessing and respect their pick.
  const [distanceBandTouched, setDistanceBandTouched] = useState(false)
  const [carrierRegionTouched, setCarrierRegionTouched] = useState(false)
  const [distanceEstimateKm, setDistanceEstimateKm] = useState<number | null>(null)
  const [carrierRegionAutoDetected, setCarrierRegionAutoDetected] = useState(false)

  useEffect(() => {
    if (distanceBandTouched) return
    const estimate = estimateDistanceBand(departureCountry, arrivalCountry)
    if (estimate) {
      setDistanceBand(estimate.band)
      setDistanceEstimateKm(estimate.km)
    } else {
      setDistanceEstimateKm(null)
    }
  }, [departureCountry, arrivalCountry, distanceBandTouched])

  useEffect(() => {
    if (carrierRegionTouched) return
    const detected = detectCarrierRegion(airlineName)
    if (detected) {
      setCarrierRegion(detected)
      setCarrierRegionAutoDetected(true)
    } else {
      setCarrierRegionAutoDetected(false)
    }
  }, [airlineName, carrierRegionTouched])

  const disruptionFieldsComplete =
    disruption === 'delay'
      ? delayHours !== '' && extraordinaryCircumstances !== ''
      : disruption === 'cancelled'
      ? cancellationNoticeDays !== '' && extraordinaryCircumstances !== ''
      : disruption === 'denied_boarding'
      ? deniedBoardingVoluntary !== '' && (deniedBoardingVoluntary === 'yes' || delayHours !== '')
      : false

  const canSubmit = Boolean(
    departureCountry && arrivalCountry && carrierRegion && distanceBand && disruption && disruptionFieldsComplete
  )

  const results = useMemo(() => {
    if (!submitted || !carrierRegion || !distanceBand || !disruption) return null
    return evaluateFlightCompensation({
      departureCountry,
      arrivalCountry,
      carrierRegion,
      distanceBand,
      disruption,
      delayHours: delayHours === '' ? null : Number(delayHours),
      cancellationNoticeDays: cancellationNoticeDays === '' ? null : Number(cancellationNoticeDays),
      extraordinaryCircumstances: extraordinaryCircumstances === '' ? 'unsure' : extraordinaryCircumstances,
      deniedBoardingVoluntary: deniedBoardingVoluntary === '' ? null : deniedBoardingVoluntary === 'yes',
    })
  }, [
    submitted,
    departureCountry,
    arrivalCountry,
    carrierRegion,
    distanceBand,
    disruption,
    delayHours,
    cancellationNoticeDays,
    extraordinaryCircumstances,
    deniedBoardingVoluntary,
  ])

  const anyEligible = results
    ? [results.eu261, results.uk261, results.usDot].some((r) => r.eligible === 'yes' || r.eligible === 'maybe')
    : false

  const airhelpHref = affiliateTrackingUrl('airhelp', {
    placement: 'flight_delay_page',
    source: '/flight-compensation',
  })

  const complaintTemplate = useMemo(
    () =>
      buildComplaintTemplate({
        airlineName,
        departureCountry: departureCountry || '[Departure country]',
        arrivalCountry: arrivalCountry || '[Arrival country]',
        flightDate,
        disruption: disruption || 'delay',
        delayHours: delayHours === '' ? null : Number(delayHours),
        passengerName,
      }),
    [airlineName, departureCountry, arrivalCountry, flightDate, disruption, delayHours, passengerName]
  )

  const faqSchema = faqPage(FAQS)

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ToolBreadcrumb toolName="Flight Compensation" toolEmoji="✈️" />

      {/* HERO */}
      <section className="relative overflow-hidden pt-20 pb-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.12),transparent_60%)]" />
        </div>
        <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-500/25 bg-sky-500/10 px-4 py-1.5 text-xs font-bold text-sky-500">
            ✈️ Flight Delay Rights Checker
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span className="text-[#0f0c29]">Are You Owed </span>
            <span className="bg-gradient-to-r from-sky-500 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Flight Compensation?
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm text-gray-500">
            Answer a few questions about what happened and we&apos;ll tell you — in plain language — whether EU261, UK261,
            or US DOT rules likely apply, based only on what you enter. No flight tracking, no live data, no auto-filing.
          </p>
        </div>
      </section>

      {/* FORM */}
      <section className="pb-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Departure Country</FieldLabel>
                <CountrySelect value={departureCountry} onChange={setDepartureCountry} placeholder="Select country" />
              </div>
              <div>
                <FieldLabel>Arrival Country</FieldLabel>
                <CountrySelect value={arrivalCountry} onChange={setArrivalCountry} placeholder="Select country" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Airline (optional)</FieldLabel>
                <input
                  type="text"
                  value={airlineName}
                  onChange={(e) => setAirlineName(e.target.value)}
                  placeholder="e.g. Lufthansa"
                  className={textInput}
                />
              </div>
              <div>
                <FieldLabel>Flight Date (optional)</FieldLabel>
                <input
                  type="date"
                  value={flightDate}
                  onChange={(e) => setFlightDate(e.target.value)}
                  className={textInput}
                  style={{ colorScheme: 'light' }}
                />
              </div>
            </div>

            <div>
              <FieldLabel>Which region is your airline based in?</FieldLabel>
              <ToggleGroup
                columns={3}
                value={carrierRegion}
                onChange={(v) => {
                  setCarrierRegion(v as CarrierRegion)
                  setCarrierRegionTouched(true)
                  setCarrierRegionAutoDetected(false)
                }}
                options={[
                  { value: 'eu_eea', label: 'EU / EEA', hint: 'e.g. Lufthansa, Air France, KLM' },
                  { value: 'uk', label: 'UK', hint: 'e.g. British Airways, easyJet' },
                  { value: 'other', label: 'Elsewhere', hint: 'e.g. US, Gulf, Asian carrier' },
                ]}
              />
              {carrierRegionAutoDetected && carrierRegion && (
                <p className="mt-1.5 text-[11px] text-emerald-600">
                  Detected from &quot;{airlineName}&quot; — tap a different option above if that&apos;s wrong.
                </p>
              )}
            </div>

            <div>
              <FieldLabel>Approximate flight distance</FieldLabel>
              <ToggleGroup
                columns={3}
                value={distanceBand}
                onChange={(v) => {
                  setDistanceBand(v as DistanceBand)
                  setDistanceBandTouched(true)
                }}
                options={[
                  { value: 'short', label: 'Short-haul', hint: DISTANCE_LABEL.short },
                  { value: 'medium', label: 'Medium-haul', hint: DISTANCE_LABEL.medium },
                  { value: 'long', label: 'Long-haul', hint: DISTANCE_LABEL.long },
                ]}
              />
              {!distanceBandTouched && distanceEstimateKm !== null && distanceBand ? (
                <p className="mt-1.5 text-[11px] text-emerald-600">
                  Estimated ~{distanceEstimateKm.toLocaleString()} km from your two countries — tap a different option above if that&apos;s wrong.
                </p>
              ) : (
                <p className="mt-1.5 text-[11px] text-gray-400">
                  Not sure? Rough guide: Paris–Rome ≈ 1,100 km (short), London–Dubai ≈ 5,500 km (long), New York–London ≈ 5,570 km (long).
                </p>
              )}
            </div>

            <div>
              <FieldLabel>What happened?</FieldLabel>
              <ToggleGroup
                columns={3}
                value={disruption}
                onChange={(v) => {
                  setDisruption(v as DisruptionType)
                  setExtraordinaryCircumstances('')
                  setDeniedBoardingVoluntary('')
                }}
                options={[
                  { value: 'delay', label: 'Delayed', hint: 'Landed late' },
                  { value: 'cancelled', label: 'Cancelled', hint: "Flight didn't operate" },
                  { value: 'denied_boarding', label: 'Denied boarding', hint: 'Bumped / overbooked' },
                ]}
              />
            </div>

            {disruption === 'delay' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>Hours late arriving at final destination</FieldLabel>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={delayHours}
                    onChange={(e) => setDelayHours(e.target.value)}
                    placeholder="e.g. 4"
                    className={textInput}
                  />
                </div>
                <div>
                  <FieldLabel>Reason given by the airline</FieldLabel>
                  <ToggleGroup
                    columns={1}
                    value={extraordinaryCircumstances}
                    onChange={(v) => setExtraordinaryCircumstances(v as ExtraordinaryAnswer)}
                    options={[
                      { value: 'no', label: 'Airline-side issue', hint: 'e.g. crew, technical fault, scheduling' },
                      { value: 'yes', label: 'Outside their control', hint: 'e.g. weather, ATC, security, strike' },
                      { value: 'unsure', label: 'Not sure / not told' },
                    ]}
                  />
                </div>
              </div>
            )}

            {disruption === 'cancelled' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>Days notice before scheduled departure</FieldLabel>
                  <input
                    type="number"
                    min="0"
                    value={cancellationNoticeDays}
                    onChange={(e) => setCancellationNoticeDays(e.target.value)}
                    placeholder="e.g. 2"
                    className={textInput}
                  />
                </div>
                <div>
                  <FieldLabel>Reason given by the airline</FieldLabel>
                  <ToggleGroup
                    columns={1}
                    value={extraordinaryCircumstances}
                    onChange={(v) => setExtraordinaryCircumstances(v as ExtraordinaryAnswer)}
                    options={[
                      { value: 'no', label: 'Airline-side issue', hint: 'e.g. crew, technical fault, scheduling' },
                      { value: 'yes', label: 'Outside their control', hint: 'e.g. weather, ATC, security, strike' },
                      { value: 'unsure', label: 'Not sure / not told' },
                    ]}
                  />
                </div>
              </div>
            )}

            {disruption === 'denied_boarding' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>Voluntary or involuntary?</FieldLabel>
                  <ToggleGroup
                    columns={2}
                    value={deniedBoardingVoluntary}
                    onChange={(v) => setDeniedBoardingVoluntary(v as 'yes' | 'no')}
                    options={[
                      { value: 'no', label: 'Involuntary', hint: 'I was bumped against my will' },
                      { value: 'yes', label: 'Voluntary', hint: 'I agreed to give up my seat' },
                    ]}
                  />
                </div>
                {deniedBoardingVoluntary === 'no' && (
                  <div>
                    <FieldLabel>Hours late reaching final destination</FieldLabel>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={delayHours}
                      onChange={(e) => setDelayHours(e.target.value)}
                      placeholder="e.g. 3"
                      className={textInput}
                    />
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => setSubmitted(true)}
              className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition hover:from-sky-600 hover:to-teal-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Check My Rights →
            </button>
          </div>
        </div>
      </section>

      {/* RESULTS */}
      {results && (
        <section className="pb-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 className="mb-4 text-center text-lg font-bold text-[#0f0c29]">Based on what you entered</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <RegimeCard result={results.eu261} />
              <RegimeCard result={results.uk261} />
              <RegimeCard result={results.usDot} />
            </div>

            {anyEligible && (
              <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-6 text-center">
                <p className="mb-4 text-sm font-semibold text-gray-600">
                  Looks like you may have a claim. You can handle it yourself for free, or hand it off to a claims service.
                </p>
                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a
                    href={airhelpHref}
                    target="_blank"
                    rel="nofollow sponsored noopener"
                    className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-600"
                  >
                    Get Help Filing My Claim →
                  </a>
                  <a
                    href="#diy-guide"
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-600 transition hover:border-sky-300"
                  >
                    Do It Myself — Free Guide
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* HOW THIS WORKS / SOURCES — permanently visible */}
      <section className="border-t border-gray-100 bg-white/60 py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-4 text-lg font-bold text-[#0f0c29]">How This Works / Our Sources</h2>
          <div className="space-y-3 text-sm leading-relaxed text-gray-500">
            <p>
              This tool only uses what you type into the form above. It does not connect to any flight-tracking service,
              airline system, or paid flight-data API, and it never submits anything to an airline, regulator, or third
              party on your behalf. Every result is a plain-language read of the public regulation text below, applied to
              your answers — it is not legal advice and not a guarantee of any outcome.
            </p>
            <p className="font-semibold text-gray-600">Official sources used for the thresholds and amounts shown:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                EU Regulation (EC) No 261/2004 (the current legal text) —{' '}
                <a
                  href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex:32004R0261"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-500 hover:underline"
                >
                  eur-lex.europa.eu
                </a>
              </li>
              <li>
                UK Civil Aviation Authority — flight delay &amp; cancellation rights —{' '}
                <a
                  href="https://www.caa.co.uk/air-passengers/travel-problems-and-rights/flight-delays-and-cancellations/delays/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-500 hover:underline"
                >
                  caa.co.uk
                </a>
              </li>
              <li>
                US Department of Transportation — fly-rights &amp; denied boarding rules (14 CFR Part 250) —{' '}
                <a
                  href="https://www.transportation.gov/airconsumer/fly-rights"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-500 hover:underline"
                >
                  transportation.gov/airconsumer/fly-rights
                </a>{' '}
                and{' '}
                <a
                  href="https://www.ecfr.gov/current/title-14/chapter-II/subchapter-A/part-250/section-250.5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-500 hover:underline"
                >
                  ecfr.gov (14 CFR 250.5)
                </a>
              </li>
            </ul>
            <p className="text-xs text-gray-400">
              Note: on 15 June 2026, EU institutions reached a provisional political deal to reform Regulation 261/2004.
              As of this writing it has not been formally adopted or published in the Official Journal, so the current
              3-hour delay threshold and €250/€400/€600 tiers modeled above remain the law in force. Always confirm the
              current rule against the source link above before relying on it.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ (matches the JSON-LD above) */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-4 text-lg font-bold text-[#0f0c29]">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-2xl border border-gray-100 bg-white p-5">
                <p className="mb-1.5 text-sm font-bold text-[#0f0c29]">{f.q}</p>
                <p className="text-sm leading-relaxed text-gray-500">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIY GUIDE */}
      <section id="diy-guide" className="border-t border-gray-100 bg-white/60 py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-2 text-lg font-bold text-[#0f0c29]">Do-It-Yourself Complaint Guide</h2>
          <p className="mb-5 text-sm text-gray-500">
            Filing yourself costs nothing but a bit of time. Here&apos;s the real process and the official channels to use.
          </p>

          <ol className="mb-6 space-y-3">
            {[
              'Contact the airline\'s customer relations department directly, in writing (email, not just a phone call), citing the regulation that applies to your flight.',
              'Give the airline a reasonable window to respond (EU/UK guidance suggests around 8 weeks) before escalating.',
              'If the airline refuses or ignores you, escalate to the official enforcement body for your route — see the links below.',
              'Keep copies of your boarding pass, booking confirmation, and any written communication from the airline about the delay/cancellation reason.',
            ].map((step, i) => (
              <li key={step} className="flex gap-3 text-sm text-gray-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-xs font-bold text-sky-600">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            <a
              href="https://transport.ec.europa.eu/transport-themes/passenger-rights/national-enforcement-bodies-neb_en"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-gray-200 bg-white p-4 text-sm font-semibold text-gray-600 hover:border-sky-300"
            >
              🇪🇺 EU National Enforcement Bodies directory →
            </a>
            <a
              href="https://europa.eu/youreurope/citizens/travel/passenger-rights/air/index_en.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-gray-200 bg-white p-4 text-sm font-semibold text-gray-600 hover:border-sky-300"
            >
              🇪🇺 Your Europe — air passenger rights →
            </a>
            <a
              href="https://www.caa.co.uk/passengers-and-public/resolving-travel-problems/how-the-caa-can-help/how-to-make-a-complaint/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-gray-200 bg-white p-4 text-sm font-semibold text-gray-600 hover:border-sky-300"
            >
              🇬🇧 UK CAA — how to make a complaint →
            </a>
            <a
              href="https://www.transportation.gov/airconsumer/file-consumer-complaint"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-gray-200 bg-white p-4 text-sm font-semibold text-gray-600 hover:border-sky-300"
            >
              🇺🇸 US DOT — file a consumer complaint →
            </a>
          </div>

          <ComplaintTemplateBox template={complaintTemplate} />
        </div>
      </section>

      <AffiliateDisclosure />
    </div>
  )
}
