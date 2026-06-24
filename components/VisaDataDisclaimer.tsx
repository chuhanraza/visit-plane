import { getOfficialPortal } from '@/lib/data/officialPortals'

// ─────────────────────────────────────────────────────────────────────────────
// Site-wide YMYL honesty band — "guidance, not guarantee".
//
// Renders a calm, on-brand (teal) reminder that VisitPlane is a free preparation
// guide and that visa rules must be confirmed at the official source before
// travel. Optionally surfaces a prominent inline "Verify at the official source"
// link for the destination, and an honest conflicting-status flag when the
// route's underlying data is internally inconsistent.
//
// It states NO visa rule, status, fee, or duration — only framing + a link to
// where the traveller can read the authoritative rules themselves. Pure (no
// hooks), so it renders in both server and client component trees.
// ─────────────────────────────────────────────────────────────────────────────

interface VisaDataDisclaimerProps {
  /** When provided, shows a prominent inline link to verify at the official source. */
  destinationName?: string
  /** Home country, used to make the search-fallback hint specific. */
  homeCountry?: string
  /** Render-time, read-only flag: the route's own rows disagree about visa status. */
  conflicting?: boolean
  /** Visual density. `compact` for dense tool surfaces, `full` (default) elsewhere. */
  variant?: 'full' | 'compact'
  className?: string
}

export default function VisaDataDisclaimer({
  destinationName,
  homeCountry,
  conflicting = false,
  variant = 'full',
  className = '',
}: VisaDataDisclaimerProps) {
  const portal = destinationName ? getOfficialPortal(destinationName) : null
  const searchUrl = destinationName
    ? `https://www.google.com/search?q=${encodeURIComponent(
        `${destinationName} official visa${homeCountry ? ` from ${homeCountry}` : ''}`,
      )}`
    : null

  const compact = variant === 'compact'

  return (
    <div
      className={`rounded-2xl border border-teal-500/25 bg-teal-50/70 ${compact ? 'p-3.5 sm:p-4' : 'p-4 sm:p-5'} ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className={`${compact ? 'text-lg' : 'text-xl'} leading-none flex-shrink-0`} aria-hidden="true">
          ℹ️
        </span>
        <div className="min-w-0 flex-1">
          <p className={`${compact ? 'text-xs' : 'text-sm'} text-[#134e4a] leading-relaxed`}>
            <span className="font-bold">This is a free guide to help you prepare.</span>{' '}
            Visa rules change frequently and depend on your exact situation. Always confirm current
            requirements with the official source or the destination&apos;s embassy before booking travel.
          </p>

          {/* Prominent inline "verify at the official source" link */}
          {destinationName && (
            portal ? (
              <a
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-2.5 inline-flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'} font-bold text-teal-700 transition hover:text-teal-800 hover:underline`}
              >
                🏛️ Verify at the official source — {portal.label}
                <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <a
                href={searchUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-2.5 inline-flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'} font-bold text-teal-700 transition hover:text-teal-800 hover:underline`}
              >
                🏛️ Search &ldquo;{destinationName} official visa&rdquo; to verify
                <span aria-hidden="true">↗</span>
              </a>
            )
          )}

          {/* Conflicting-status flag — render-time, read-only. Asserts nothing. */}
          {conflicting && (
            <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-3">
              <p className={`${compact ? 'text-xs' : 'text-sm'} text-amber-900 leading-relaxed`}>
                <span className="font-bold">
                  ⚠️ Requirements for this route may have changed or vary by situation
                </span>{' '}
                — please confirm directly with the official source
                {destinationName ? ' above' : ''} before relying on this.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
