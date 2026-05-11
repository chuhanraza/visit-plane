import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'

// ─── Country map ───────────────────────────────────────────────────────────────
const COUNTRY_MAP: Record<string, { name: string; flag: string }> = {
  us: { name: 'United States', flag: '🇺🇸' },
  gb: { name: 'United Kingdom', flag: '🇬🇧' },
  pk: { name: 'Pakistan', flag: '🇵🇰' },
  in: { name: 'India', flag: '🇮🇳' },
  de: { name: 'Germany', flag: '🇩🇪' },
  au: { name: 'Australia', flag: '🇦🇺' },
  ca: { name: 'Canada', flag: '🇨🇦' },
  fr: { name: 'France', flag: '🇫🇷' },
  ae: { name: 'UAE', flag: '🇦🇪' },
  sa: { name: 'Saudi Arabia', flag: '🇸🇦' },
  tr: { name: 'Turkey', flag: '🇹🇷' },
  jp: { name: 'Japan', flag: '🇯🇵' },
  sg: { name: 'Singapore', flag: '🇸🇬' },
  my: { name: 'Malaysia', flag: '🇲🇾' },
  cn: { name: 'China', flag: '🇨🇳' },
  br: { name: 'Brazil', flag: '🇧🇷' },
  mx: { name: 'Mexico', flag: '🇲🇽' },
  it: { name: 'Italy', flag: '🇮🇹' },
  es: { name: 'Spain', flag: '🇪🇸' },
  nl: { name: 'Netherlands', flag: '🇳🇱' },
  ch: { name: 'Switzerland', flag: '🇨🇭' },
  se: { name: 'Sweden', flag: '🇸🇪' },
  no: { name: 'Norway', flag: '🇳🇴' },
  kr: { name: 'South Korea', flag: '🇰🇷' },
  th: { name: 'Thailand', flag: '🇹🇭' },
  id: { name: 'Indonesia', flag: '🇮🇩' },
  eg: { name: 'Egypt', flag: '🇪🇬' },
  za: { name: 'South Africa', flag: '🇿🇦' },
  ng: { name: 'Nigeria', flag: '🇳🇬' },
  nz: { name: 'New Zealand', flag: '🇳🇿' },
  pt: { name: 'Portugal', flag: '🇵🇹' },
  gr: { name: 'Greece', flag: '🇬🇷' },
}

// ─── Supabase helpers ──────────────────────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

async function fetchVisaData(passportCode: string, destinationCode: string) {
  const supabase = getSupabase()

  const passportInfo    = COUNTRY_MAP[passportCode]
  const destinationInfo = COUNTRY_MAP[destinationCode]

  if (!passportInfo || !destinationInfo) return null

  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .or(
      `country_name.ilike.${destinationInfo.name},country_name.ilike.${destinationCode}`,
    )
    .or(
      `passport_country.ilike.${passportInfo.name},passport_country.ilike.${passportCode}`,
    )
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Supabase error:', error)
    return null
  }

  return data
}

// ─── Icons ─────────────────────────────────────────────────────────────────────
function ArrowRight({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  )
}

function ArrowLeft({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
    </svg>
  )
}

function CheckIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 5 5L20 7" />
    </svg>
  )
}

function ClockIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  )
}

function TagIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H2v10l10 10 10-10L12 2Z" />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function PassportIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <circle cx="12" cy="11" r="3" />
      <path d="M7 19h10" />
      <path d="M7 7h2" />
    </svg>
  )
}

function MailIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 7 10-7" />
    </svg>
  )
}

function AlertIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4" /><path d="M12 17h.01" />
    </svg>
  )
}

// ─── Default documents ─────────────────────────────────────────────────────────
const DEFAULT_DOCUMENTS = [
  'Valid Passport (6 months validity)',
  'Passport-sized photos (white background)',
  'Bank statements (last 3 months)',
  'Flight itinerary',
  'Hotel booking confirmation',
]

// ─── Page ──────────────────────────────────────────────────────────────────────
export default async function VisaResultPage({
  params,
}: {
  params: Promise<{ passport: string; destination: string }>
}) {
  const { passport: passportCode, destination: destinationCode } = await params

  const passportInfo    = COUNTRY_MAP[passportCode]
  const destinationInfo = COUNTRY_MAP[destinationCode]

  const visaData = passportInfo && destinationInfo
    ? await fetchVisaData(passportCode, destinationCode)
    : null

  // Parse documents if stored as JSON string or array
  let documents: string[] = DEFAULT_DOCUMENTS
  if (visaData?.required_documents) {
    try {
      const parsed = typeof visaData.required_documents === 'string'
        ? JSON.parse(visaData.required_documents)
        : visaData.required_documents
      if (Array.isArray(parsed) && parsed.length > 0) documents = parsed
    } catch {
      // keep defaults
    }
  }

  const passportLabel    = passportInfo?.name    ?? passportCode.toUpperCase()
  const passportFlag     = passportInfo?.flag     ?? '🌐'
  const destinationLabel = destinationInfo?.name  ?? destinationCode.toUpperCase()
  const destinationFlag  = destinationInfo?.flag  ?? '🌐'

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] antialiased selection:bg-[#10B981]/20 selection:text-[#1A1A1A]">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <Image src="/logo-v2.png" alt="VisitPlane" width={36} height={36} className="rounded-xl" />
            <span className="text-lg font-semibold tracking-tight">
              <span className="text-[#1A1A1A]">Visit</span>
              <span className="text-[#10B981]">Plane</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/destinations" className="text-sm text-gray-500 transition hover:text-[#1A1A1A]">Destinations</Link>
            <Link href="/how-it-works" className="text-sm text-gray-500 transition hover:text-[#1A1A1A]">How it Works</Link>
            <Link href="/blog" className="text-sm text-gray-500 transition hover:text-[#1A1A1A]">Blog</Link>
          </nav>

          <Link
            href="/get-started"
            className="group inline-flex items-center gap-2 rounded-full bg-[#10B981] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#059669]"
          >
            Get Started
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>

      {/* ── Hero section ── */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:px-8">

          {/* Back link */}
          <Link
            href="/"
            className="group mb-8 inline-flex items-center gap-1.5 text-sm text-gray-400 transition hover:text-[#1A1A1A]"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
            Back to search
          </Link>

          {/* Route badge */}
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-sm">
              <span className="flex items-center gap-2 text-base font-medium text-[#1A1A1A]">
                <span className="text-2xl leading-none">{passportFlag}</span>
                <span>{passportLabel}</span>
              </span>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#10B981]/10 text-[#10B981]">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="flex items-center gap-2 text-base font-medium text-[#1A1A1A]">
                <span className="text-2xl leading-none">{destinationFlag}</span>
                <span>{destinationLabel}</span>
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[#1A1A1A] sm:text-5xl">
              Visa{' '}
              <span className="bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#14B8A6] bg-clip-text text-transparent">
                Requirements
              </span>
            </h1>
            <p className="mt-3 text-base text-gray-500">
              Everything you need to know to travel from{' '}
              <span className="text-[#1A1A1A] font-medium">{passportLabel}</span> to{' '}
              <span className="text-[#1A1A1A] font-medium">{destinationLabel}</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <main className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">

        {visaData ? (
          /* ── Results card ── */
          <div className="mt-2">
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-md">

              {/* Top accent stripe */}
              <div className="h-1 w-full bg-gradient-to-r from-[#10B981]/0 via-[#10B981] to-[#10B981]/0" />

              <div className="p-6 sm:p-8">

                {/* Visa type header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-[#10B981]">
                      Visa Type
                    </p>
                    <h2 className="mt-1.5 text-2xl font-semibold text-[#1A1A1A] sm:text-3xl">
                      {visaData.visa_type ?? visaData.type ?? 'Tourist Visa'}
                    </h2>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                    ✓ Data verified
                  </span>
                </div>

                {/* Stats row */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {/* Processing time */}
                  <div className="flex flex-col gap-1.5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <span className="text-[#10B981]">
                      <ClockIcon className="h-5 w-5" />
                    </span>
                    <p className="text-[11px] uppercase tracking-wider text-gray-400">Processing</p>
                    <p className="text-base font-semibold text-[#1A1A1A]">
                      {visaData.processing_time ?? visaData.duration ?? '5–7 business days'}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="flex flex-col gap-1.5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <span className="text-[#10B981]">
                      <TagIcon className="h-5 w-5" />
                    </span>
                    <p className="text-[11px] uppercase tracking-wider text-gray-400">Visa Fee</p>
                    <p className="text-base font-semibold text-[#1A1A1A]">
                      {visaData.price ?? visaData.fee ?? visaData.cost ?? 'Contact embassy'}
                    </p>
                  </div>

                  {/* Validity */}
                  <div className="col-span-2 flex flex-col gap-1.5 rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:col-span-1">
                    <span className="text-[#10B981]">
                      <PassportIcon className="h-5 w-5" />
                    </span>
                    <p className="text-[11px] uppercase tracking-wider text-gray-400">Validity</p>
                    <p className="text-base font-semibold text-[#1A1A1A]">
                      {visaData.validity ?? visaData.stay_duration ?? 'Up to 30 days'}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="my-6 h-px w-full bg-gray-100" />

                {/* Documents checklist */}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Required Documents
                  </p>

                  <ul className="mt-4 space-y-2.5">
                    {documents.map((doc, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 transition hover:border-[#10B981]/20 hover:bg-[#10B981]/5"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#10B981]/10 text-[#10B981]">
                          <CheckIcon className="h-3 w-3" />
                        </span>
                        <span className="text-sm text-gray-600">{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Notes */}
                {(visaData.notes ?? visaData.description) && (
                  <>
                    <div className="my-6 h-px w-full bg-gray-100" />
                    <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <span className="mt-0.5 shrink-0 text-amber-500">
                        <AlertIcon className="h-4 w-4" />
                      </span>
                      <p className="text-sm leading-relaxed text-amber-800">
                        {visaData.notes ?? visaData.description}
                      </p>
                    </div>
                  </>
                )}

                {/* Divider */}
                <div className="my-6 h-px w-full bg-gray-100" />

                {/* Apply CTA */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-500">
                    Ready to start your application?
                  </p>
                  <a
                    href={visaData.apply_url ?? visaData.application_url ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-[#10B981] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_6px_24px_-6px_rgba(16,185,129,0.5)] transition hover:bg-[#059669] hover:shadow-[0_8px_28px_-6px_rgba(16,185,129,0.6)]"
                  >
                    Apply Now
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── No results state ── */
          <div className="mt-2">
            <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-md sm:p-12">

              {/* Empty illustration */}
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 text-4xl">
                🔍
              </div>

              <h2 className="text-xl font-semibold text-[#1A1A1A] sm:text-2xl">
                No data found for this combination
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-500">
                We don&apos;t have visa information for{' '}
                <span className="font-medium text-[#1A1A1A]">
                  {passportFlag} {passportLabel}
                </span>{' '}
                →{' '}
                <span className="font-medium text-[#1A1A1A]">
                  {destinationFlag} {destinationLabel}
                </span>{' '}
                yet. Join our waitlist and we&apos;ll notify you the moment it&apos;s available.
              </p>

              {/* Waitlist form */}
              <form
                action="/api/waitlist"
                method="POST"
                className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:flex-row"
              >
                <input type="hidden" name="passport" value={passportLabel} />
                <input type="hidden" name="destination" value={destinationLabel} />
                <div className="flex flex-1 items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-[#10B981]/60">
                  <MailIcon className="h-4 w-4 shrink-0 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Enter your email"
                    className="flex-1 bg-transparent text-sm text-[#1A1A1A] placeholder-gray-400 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#10B981] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#059669]"
                >
                  Notify Me
                </button>
              </form>

              <Link
                href="/"
                className="group mt-6 inline-flex items-center gap-1.5 text-sm text-gray-400 transition hover:text-[#1A1A1A]"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
                Try a different search
              </Link>
            </div>
          </div>
        )}

        {/* ── Also check section ── */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Also check
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {['ae', 'tr', 'jp', 'sg', 'gb', 'my']
              .filter((c) => c !== destinationCode)
              .slice(0, 5)
              .map((code) => {
                const c = COUNTRY_MAP[code]
                if (!c) return null
                return (
                  <Link
                    key={code}
                    href={`/visa/${passportCode}/${code}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-[#10B981]/30 hover:bg-[#10B981]/5 hover:text-[#10B981]"
                  >
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                  </Link>
                )
              })}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-gray-400 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Image src="/logo-v2.png" alt="VisitPlane" width={20} height={20} className="rounded" />
            <span>
              <span className="text-gray-600">Visit</span>
              <span className="text-[#10B981]">Plane</span>
              <span className="ml-2">© {new Date().getFullYear()}</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="transition hover:text-gray-600">Privacy</Link>
            <Link href="/terms" className="transition hover:text-gray-600">Terms</Link>
            <Link href="/contact" className="transition hover:text-gray-600">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
