import { getOfficialPortal } from '@/lib/data/officialPortals'

// ─────────────────────────────────────────────────────────────────────────────
// Prominent, honestly-framed "Verify at the official source" block.
// Shows a real government link when we have a confident one for the destination,
// otherwise a safe search-it-yourself fallback. Never asserts visa rules.
// ─────────────────────────────────────────────────────────────────────────────

interface OfficialSourceLinkProps {
  destinationName: string
  /** Optional home country, used to make the fallback search hint specific. */
  homeCountry?: string
  className?: string
}

export default function OfficialSourceLink({ destinationName, homeCountry, className = '' }: OfficialSourceLinkProps) {
  const portal = getOfficialPortal(destinationName)
  const searchQuery = encodeURIComponent(`${destinationName} official visa${homeCountry ? ` from ${homeCountry}` : ''}`)
  const searchUrl = `https://www.google.com/search?q=${searchQuery}`

  return (
    <div className={`rounded-2xl border border-teal-500/20 bg-teal-50/60 p-5 sm:p-6 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none flex-shrink-0">🏛️</span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-[#0f172a]">Verify at the official source</h3>

          {portal ? (
            <>
              <p className="mt-1 text-sm text-gray-600">
                Confirm the latest {destinationName} entry rules directly with the government before you travel.
              </p>
              <a
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700"
              >
                {portal.label}
                <span aria-hidden="true">↗</span>
              </a>
              <p className="mt-2 break-all text-[11px] text-gray-400">{portal.url}</p>
            </>
          ) : (
            <>
              <p className="mt-1 text-sm text-gray-600">
                We don&apos;t yet have a verified official link for {destinationName}. Look up the country&apos;s
                official immigration or foreign-ministry website, or contact its nearest embassy or consulate.
              </p>
              <a
                href={searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-teal-600/40 bg-white px-4 py-2.5 text-sm font-bold text-teal-700 transition hover:bg-teal-50"
              >
                Search &ldquo;{destinationName} official visa&rdquo;
                <span aria-hidden="true">↗</span>
              </a>
            </>
          )}

          <p className="mt-3 text-xs text-gray-500">
            Always confirm current requirements at the official source before you travel — visa rules change frequently.
          </p>
        </div>
      </div>
    </div>
  )
}
