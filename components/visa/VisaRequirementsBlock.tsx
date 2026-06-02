'use client'
/**
 * VisaRequirementsBlock
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders the route-specific fee, document list, confidence badge, and
 * "Report incorrect info" modal from a visa_requirements DB record.
 *
 * Falls back gracefully when no DB record exists yet.
 */
import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type RequiredDocument = {
  name: string
  detail: string
  mandatory: boolean
  applies_when: string | null
}

export type OfficialSource = {
  type: 'mofa' | 'embassy' | 'evisa_portal' | 'iata' | 'other'
  label: string
  url: string
  verified_at: string
  is_authoritative: boolean
}

export type VisaRequirement = {
  id?: string
  passport_iso: string
  destination_iso: string
  purpose: string
  visa_category: 'visa_free' | 'visa_on_arrival' | 'evisa' | 'eta' | 'visa_required' | 'not_permitted' | 'conditional'
  max_stay_days: number | null
  multiple_entry: boolean | null
  validity_days: number | null
  fee_amount: number | null
  fee_currency: string | null
  fee_amount_usd: number | null
  fee_is_free: boolean
  fee_notes: string | null
  processing_min_hours: number | null
  processing_max_hours: number | null
  processing_label: string | null
  passport_validity_months: number | null
  required_documents: RequiredDocument[]
  eligibility_conditions: string[]
  warnings: string[]
  application_url: string | null
  official_sources: OfficialSource[]
  data_confidence: 'high' | 'medium' | 'low'
  data_confidence_reason: string | null
  verified_at: string | null
  next_review_due: string | null
}

type Props = {
  requirement: VisaRequirement | null
  passportName: string
  destinationName: string
  passportIso?: string
  destinationIso?: string
}

// ─── Fee display ──────────────────────────────────────────────────────────────

function FeeDisplay({ req }: { req: VisaRequirement }) {
  if (req.fee_is_free || req.visa_category === 'visa_free') {
    return (
      <span className="font-semibold text-green-600">
        Free
      </span>
    )
  }

  if (req.fee_amount && req.fee_currency) {
    const localAmount = `${req.fee_currency} ${req.fee_amount.toLocaleString()}`
    const usdEquiv    = req.fee_amount_usd
      ? ` ≈ USD ${req.fee_amount_usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      : ''
    return (
      <span className="font-semibold text-[#1F2937]">
        {localAmount}{usdEquiv}
      </span>
    )
  }

  return (
    <span className="text-amber-600 font-medium">
      Pending verification — check embassy site
    </span>
  )
}

// ─── Confidence badge ─────────────────────────────────────────────────────────

function ConfidenceBadge({ req }: { req: VisaRequirement }) {
  const verifiedAt    = req.verified_at ? new Date(req.verified_at) : null
  const nextReviewDue = req.next_review_due ? new Date(req.next_review_due) : null
  const now           = new Date()
  const isOverdue     = nextReviewDue && nextReviewDue < now

  if (!verifiedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700">
        <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
        Verification in progress
      </span>
    )
  }

  if (isOverdue || req.data_confidence === 'low') {
    const dateStr = verifiedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-medium text-red-700"
        title={req.data_confidence_reason ?? undefined}
      >
        <span className="h-2 w-2 rounded-full bg-red-500" />
        Last verified {dateStr} — please confirm with embassy
      </span>
    )
  }

  const dateStr = verifiedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-medium text-green-700"
      title={req.data_confidence_reason ?? undefined}
    >
      <span className="h-2 w-2 rounded-full bg-green-500" />
      Verified {dateStr}
    </span>
  )
}

// ─── Report-incorrect-info modal ──────────────────────────────────────────────

const WRONG_OPTIONS = [
  'Visa fee is incorrect',
  'Visa type / category is wrong',
  'Stay duration is wrong',
  'Required documents list is wrong',
  'Processing time is wrong',
  'Application URL is broken or incorrect',
  'Eligibility condition is wrong',
  'Other',
]

function ReportModal({
  onClose,
  passportIso,
  destinationIso,
  visaReqId,
}: {
  onClose: () => void
  passportIso: string
  destinationIso: string
  visaReqId?: string
}) {
  const [whatIsWrong, setWhatIsWrong]       = useState('')
  const [correctedValue, setCorrectedValue] = useState('')
  const [sourceUrl, setSourceUrl]           = useState('')
  const [submitting, setSubmitting]         = useState(false)
  const [submitted, setSubmitted]           = useState(false)
  const [error, setError]                   = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!whatIsWrong) { setError('Please select what is wrong.'); return }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/visa/report-correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visa_req_id:     visaReqId ?? null,
          passport_iso:    passportIso,
          destination_iso: destinationIso,
          what_is_wrong:   whatIsWrong,
          corrected_value: correctedValue || null,
          source_url:      sourceUrl || null,
        }),
      })
      if (!res.ok) throw new Error('Submission failed')
      setSubmitted(true)
    } catch (e) {
      setError('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none"
          aria-label="Close"
        >
          ✕
        </button>

        <h3 className="text-lg font-bold text-[#1F2937] mb-1">Report incorrect info</h3>
        <p className="text-sm text-gray-500 mb-5">
          Help us keep data accurate. Reports are reviewed within 24 hours.
        </p>

        {submitted ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-3">✅</div>
            <p className="font-semibold text-[#1F2937]">Thank you!</p>
            <p className="text-sm text-gray-500 mt-1">Your correction has been submitted for review.</p>
            <button
              onClick={onClose}
              className="mt-4 rounded-full bg-[#14B8A6] px-6 py-2 text-sm font-semibold text-white hover:bg-teal-600 transition"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What&apos;s wrong? <span className="text-red-500">*</span>
              </label>
              <select
                value={whatIsWrong}
                onChange={e => setWhatIsWrong(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select an issue…</option>
                {WRONG_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Corrected value <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={correctedValue}
                onChange={e => setCorrectedValue(e.target.value)}
                rows={3}
                placeholder="e.g. The fee is AED 350, not AED 300"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source URL <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={e => setSourceUrl(e.target.value)}
                placeholder="https://official-source.gov/..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#14B8A6] px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-600 transition disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit report'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Document checklist ───────────────────────────────────────────────────────

function DocumentList({ documents }: { documents: RequiredDocument[] }) {
  const mandatory    = documents.filter(d => d.mandatory)
  const conditional  = documents.filter(d => !d.mandatory)

  return (
    <ul className="space-y-3">
      {mandatory.map((doc) => (
        <li key={doc.name} className="flex items-start gap-3">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-teal-500 bg-teal-50 text-teal-600 text-xs font-bold">
            ✓
          </span>
          <div>
            <span className="font-semibold text-[#1F2937] text-sm">{doc.name}</span>
            {doc.detail && (
              <p className="text-xs text-gray-500 mt-0.5">{doc.detail}</p>
            )}
          </div>
        </li>
      ))}

      {conditional.map((doc) => (
        <li key={doc.name} className="flex items-start gap-3">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-dashed border-gray-400 bg-gray-50 text-gray-400 text-xs">
            ○
          </span>
          <div>
            <span className="italic text-gray-600 text-sm">{doc.name}</span>
            {doc.applies_when && (
              <p className="text-xs text-amber-600 mt-0.5">ℹ️ {doc.applies_when}</p>
            )}
            {doc.detail && (
              <p className="text-xs text-gray-500 mt-0.5">{doc.detail}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function VisaRequirementsBlock({
  requirement: req,
  passportName,
  destinationName,
  passportIso = '',
  destinationIso = '',
}: Props) {
  const [showReport, setShowReport] = useState(false)

  // ── No verified data yet ──────────────────────────────────────────────────
  if (!req) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        <p className="font-semibold mb-1">⚠️ Route not yet verified</p>
        <p>
          We haven&apos;t verified the specific requirements for {passportName} → {destinationName} yet.
          Please check the official embassy or{' '}
          <a
            href="https://www.iatatravelcentre.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            IATA Travel Centre
          </a>{' '}
          for current requirements.
        </p>
      </div>
    )
  }

  // ── Low-confidence warning banner ─────────────────────────────────────────
  const showLowConfidenceBanner =
    req.data_confidence === 'low' ||
    (req.next_review_due && new Date(req.next_review_due) < new Date())

  return (
    <div className="space-y-8">

      {/* Confidence badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <ConfidenceBadge req={req} />
        {req.official_sources?.length > 0 && (
          <span className="text-xs text-gray-400">
            {req.official_sources.length} official source{req.official_sources.length > 1 ? 's' : ''} cited
          </span>
        )}
      </div>

      {/* Low-confidence warning */}
      {showLowConfidenceBanner && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong>⚠️ Data confidence is low.</strong> This information may be outdated or unverified.
          Always confirm with the official {destinationName} embassy or{' '}
          <a href="https://www.iatatravelcentre.com" target="_blank" rel="noopener noreferrer" className="underline">
            IATA Travel Centre
          </a>{' '}
          before travelling.
        </div>
      )}

      {/* At-a-glance table */}
      <section>
        <h2 className="text-2xl font-bold text-[#1F2937] mb-6">Visa Requirements at a Glance</h2>
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-50">

              <tr>
                <td className="px-5 py-3.5 font-medium text-gray-500 w-44 bg-gray-50">Visa Type</td>
                <td className="px-5 py-3.5 font-semibold text-[#1F2937]">
                  {req.visa_category === 'visa_free'      && 'Visa Free'}
                  {req.visa_category === 'visa_on_arrival' && 'Visa on Arrival'}
                  {req.visa_category === 'evisa'           && 'eVisa (Online)'}
                  {req.visa_category === 'eta'             && 'ETA (Electronic Travel Authorisation)'}
                  {req.visa_category === 'visa_required'   && 'Visa Required (Embassy)'}
                  {req.visa_category === 'not_permitted'   && '🚫 Entry Not Permitted'}
                  {req.visa_category === 'conditional'     && 'Conditional Entry'}
                </td>
              </tr>

              <tr>
                <td className="px-5 py-3.5 font-medium text-gray-500 bg-gray-50">Visa Fee</td>
                <td className="px-5 py-3.5">
                  💰 <FeeDisplay req={req} />
                  {req.fee_notes && (
                    <p className="text-xs text-gray-400 mt-1">{req.fee_notes}</p>
                  )}
                </td>
              </tr>

              <tr>
                <td className="px-5 py-3.5 font-medium text-gray-500 bg-gray-50">Max Stay</td>
                <td className="px-5 py-3.5 font-semibold text-[#1F2937]">
                  {req.max_stay_days ? `${req.max_stay_days} days` : 'Verify with embassy'}
                </td>
              </tr>

              <tr>
                <td className="px-5 py-3.5 font-medium text-gray-500 bg-gray-50">Processing Time</td>
                <td className="px-5 py-3.5 font-semibold text-[#1F2937]">
                  {req.processing_label ?? 'Varies'}
                </td>
              </tr>

              {req.validity_days && (
                <tr>
                  <td className="px-5 py-3.5 font-medium text-gray-500 bg-gray-50">Visa Validity</td>
                  <td className="px-5 py-3.5 font-semibold text-[#1F2937]">
                    {req.validity_days} days from issue
                  </td>
                </tr>
              )}

              {req.multiple_entry !== null && (
                <tr>
                  <td className="px-5 py-3.5 font-medium text-gray-500 bg-gray-50">Multiple Entry</td>
                  <td className="px-5 py-3.5 font-semibold text-[#1F2937]">
                    {req.multiple_entry ? 'Yes' : 'No (single entry)'}
                  </td>
                </tr>
              )}

              {req.passport_validity_months && (
                <tr>
                  <td className="px-5 py-3.5 font-medium text-gray-500 bg-gray-50">Passport Validity</td>
                  <td className="px-5 py-3.5 font-semibold text-[#1F2937]">
                    {req.passport_validity_months} months beyond intended stay
                  </td>
                </tr>
              )}

              {req.application_url && (
                <tr>
                  <td className="px-5 py-3.5 font-medium text-gray-500 bg-gray-50">Apply At</td>
                  <td className="px-5 py-3.5">
                    <a
                      href={req.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 font-semibold hover:underline text-sm"
                    >
                      Official Portal ↗
                    </a>
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </section>

      {/* Eligibility conditions */}
      {req.eligibility_conditions?.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-[#1F2937] mb-3">Eligibility Conditions</h3>
          <ul className="space-y-2">
            {req.eligibility_conditions.map((condition, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-0.5 text-blue-500 shrink-0">ⓘ</span>
                {condition}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Warnings */}
      {req.warnings?.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-[#1F2937] mb-3">Important Warnings</h3>
          <div className="space-y-2">
            {req.warnings.map((warning, i) => (
              <div key={i} className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                ⚠️ {warning}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Required Documents */}
      <section>
        <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Required Documents</h2>
        <p className="text-gray-500 text-sm mb-5">
          Documents for{' '}
          <strong>{passportName}</strong> citizens applying for a{' '}
          <strong>{destinationName}</strong> {req.visa_category === 'evisa' ? 'eVisa' : 'visa'}.
          {' '}Solid checkboxes = mandatory. Dashed circles = conditional.
        </p>
        {req.required_documents?.length > 0 ? (
          <DocumentList documents={req.required_documents} />
        ) : (
          <p className="text-sm text-gray-400 italic">Document list pending verification.</p>
        )}
      </section>

      {/* Official Sources */}
      {req.official_sources?.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Official Sources
          </h3>
          <ul className="space-y-2">
            {req.official_sources.map((src, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className={`shrink-0 px-1.5 py-0.5 rounded text-xs font-medium ${
                  src.is_authoritative
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {src.type === 'mofa'         && 'MoFA'}
                  {src.type === 'evisa_portal' && 'eVisa'}
                  {src.type === 'embassy'      && 'Embassy'}
                  {src.type === 'iata'         && 'IATA'}
                  {src.type === 'other'        && 'Source'}
                </span>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:underline truncate"
                >
                  {src.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Report incorrect info */}
      <div className="border-t border-gray-100 pt-6">
        <button
          onClick={() => setShowReport(true)}
          className="text-sm text-gray-400 hover:text-gray-600 underline transition"
        >
          Report incorrect info
        </button>
      </div>

      {showReport && (
        <ReportModal
          onClose={() => setShowReport(false)}
          passportIso={passportIso || req.passport_iso}
          destinationIso={destinationIso || req.destination_iso}
          visaReqId={req.id}
        />
      )}

    </div>
  )
}
