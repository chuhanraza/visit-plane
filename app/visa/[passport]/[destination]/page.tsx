import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import DisclaimerBanner from '../../../components/DisclaimerBanner'
import VisaPageClient, { type VisaRecord } from './VisaPageClient'

// ─── Country lookup (by 2-letter code) ────────────────────────────────────────
const COUNTRY_MAP: Record<string, { name: string; flag: string }> = {
  us: { name: 'United States',  flag: '🇺🇸' },
  gb: { name: 'United Kingdom', flag: '🇬🇧' },
  pk: { name: 'Pakistan',       flag: '🇵🇰' },
  in: { name: 'India',          flag: '🇮🇳' },
  de: { name: 'Germany',        flag: '🇩🇪' },
  au: { name: 'Australia',      flag: '🇦🇺' },
  ca: { name: 'Canada',         flag: '🇨🇦' },
  fr: { name: 'France',         flag: '🇫🇷' },
  ae: { name: 'UAE',            flag: '🇦🇪' },
  sa: { name: 'Saudi Arabia',   flag: '🇸🇦' },
  tr: { name: 'Turkey',         flag: '🇹🇷' },
  jp: { name: 'Japan',          flag: '🇯🇵' },
  sg: { name: 'Singapore',      flag: '🇸🇬' },
  my: { name: 'Malaysia',       flag: '🇲🇾' },
  cn: { name: 'China',          flag: '🇨🇳' },
  br: { name: 'Brazil',         flag: '🇧🇷' },
  mx: { name: 'Mexico',         flag: '🇲🇽' },
  it: { name: 'Italy',          flag: '🇮🇹' },
  es: { name: 'Spain',          flag: '🇪🇸' },
  nl: { name: 'Netherlands',    flag: '🇳🇱' },
  ch: { name: 'Switzerland',    flag: '🇨🇭' },
  se: { name: 'Sweden',         flag: '🇸🇪' },
  no: { name: 'Norway',         flag: '🇳🇴' },
  kr: { name: 'South Korea',    flag: '🇰🇷' },
  th: { name: 'Thailand',       flag: '🇹🇭' },
  id: { name: 'Indonesia',      flag: '🇮🇩' },
  eg: { name: 'Egypt',          flag: '🇪🇬' },
  za: { name: 'South Africa',   flag: '🇿🇦' },
  ng: { name: 'Nigeria',        flag: '🇳🇬' },
  nz: { name: 'New Zealand',    flag: '🇳🇿' },
  pt: { name: 'Portugal',       flag: '🇵🇹' },
  gr: { name: 'Greece',         flag: '🇬🇷' },
}

// ─── Fallback: lookup flag by full country name (for slug = full name URLs) ────
const NAME_FLAG_MAP: Record<string, string> = {
  'united states': '🇺🇸', 'united kingdom': '🇬🇧', 'pakistan': '🇵🇰',
  'india': '🇮🇳', 'germany': '🇩🇪', 'australia': '🇦🇺', 'canada': '🇨🇦',
  'france': '🇫🇷', 'uae': '🇦🇪', 'united arab emirates': '🇦🇪',
  'saudi arabia': '🇸🇦', 'turkey': '🇹🇷', 'japan': '🇯🇵', 'singapore': '🇸🇬',
  'malaysia': '🇲🇾', 'china': '🇨🇳', 'brazil': '🇧🇷', 'mexico': '🇲🇽',
  'italy': '🇮🇹', 'spain': '🇪🇸', 'netherlands': '🇳🇱', 'switzerland': '🇨🇭',
  'sweden': '🇸🇪', 'norway': '🇳🇴', 'south korea': '🇰🇷', 'thailand': '🇹🇭',
  'indonesia': '🇮🇩', 'egypt': '🇪🇬', 'south africa': '🇿🇦', 'nigeria': '🇳🇬',
  'new zealand': '🇳🇿', 'portugal': '🇵🇹', 'greece': '🇬🇷',
  'bangladesh': '🇧🇩', 'sri lanka': '🇱🇰', 'nepal': '🇳🇵', 'iran': '🇮🇷',
  'iraq': '🇮🇶', 'jordan': '🇯🇴', 'lebanon': '🇱🇧', 'qatar': '🇶🇦',
  'kuwait': '🇰🇼', 'oman': '🇴🇲', 'bahrain': '🇧🇭', 'philippines': '🇵🇭',
  'vietnam': '🇻🇳', 'cambodia': '🇰🇭', 'myanmar': '🇲🇲', 'russia': '🇷🇺',
  'ukraine': '🇺🇦', 'poland': '🇵🇱', 'romania': '🇷🇴', 'belgium': '🇧🇪',
  'austria': '🇦🇹', 'denmark': '🇩🇰', 'finland': '🇫🇮', 'czechia': '🇨🇿',
  'hungary': '🇭🇺', 'argentina': '🇦🇷', 'colombia': '🇨🇴', 'chile': '🇨🇱',
  'peru': '🇵🇪', 'kenya': '🇰🇪', 'ghana': '🇬🇭', 'ethiopia': '🇪🇹',
  'tanzania': '🇹🇿', 'morocco': '🇲🇦', 'algeria': '🇩🇿', 'tunisia': '🇹🇳',
}

function resolveFlag(slug: string, name: string): string {
  return (
    COUNTRY_MAP[slug]?.flag ??
    NAME_FLAG_MAP[name.toLowerCase()] ??
    '🌍'
  )
}

// ─── Supabase ──────────────────────────────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

async function fetchAllVisaTypes(
  passportName: string,
  destinationName: string,
): Promise<VisaRecord[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .ilike('passport_country', passportName)
    .ilike('country_name', destinationName)
    .limit(20)

  if (error) {
    console.error('Supabase error:', error)
    return []
  }
  return (data ?? []) as VisaRecord[]
}

// ─── Inline icons (server-only, used in navbar / footer) ──────────────────────
function NavArrow() {
  return (
    <svg className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default async function VisaResultPage({
  params,
}: {
  params: Promise<{ passport: string; destination: string }>
}) {
  const { passport: passportSlug, destination: destinationSlug } = await params

  const passportName    = decodeURIComponent(passportSlug)
  const destinationName = decodeURIComponent(destinationSlug)

  const allVisaData = await fetchAllVisaTypes(passportName, destinationName)

  const passportFlag    = resolveFlag(passportSlug,    passportName)
  const destinationFlag = resolveFlag(destinationSlug, destinationName)

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2937] antialiased">

      <DisclaimerBanner />

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo — DO NOT CHANGE logo-v2.png */}
          <Link href="/" className="group flex items-center gap-2.5">
            <Image
              src="/logo-v2.png"
              alt="VisitPlane"
              width={36}
              height={36}
              className="rounded-xl"
            />
            <span className="text-lg font-semibold tracking-tight">
              <span className="text-[#1F2937]">Visit</span>
              <span className="text-[#14B8A6]">Plane</span>
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/destinations" className="text-sm text-gray-500 transition hover:text-[#1F2937]">
              Explore
            </Link>
            <Link href="/visa-requirements" className="text-sm text-gray-500 transition hover:text-[#1F2937]">
              Visa Requirements
            </Link>
            <Link href="/blog" className="text-sm text-gray-500 transition hover:text-[#1F2937]">
              Blog
            </Link>
          </nav>

          {/* CTA */}
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full bg-[#14B8A6] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#0d9488]"
          >
            Check Visa
            <NavArrow />
          </Link>
        </div>
      </header>

      {/* ── Client component (hero + tabs + sidebar + cards) ────────────────── */}
      <VisaPageClient
        allVisaData={allVisaData}
        passportName={passportName}
        destinationName={destinationName}
        passportSlug={passportSlug}
        destinationSlug={destinationSlug}
        passportFlag={passportFlag}
        destinationFlag={destinationFlag}
      />

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-gray-400 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Image src="/logo-v2.png" alt="VisitPlane" width={20} height={20} className="rounded" />
            <span>
              <span className="text-gray-600">Visit</span>
              <span className="text-[#14B8A6]">Plane</span>
              <span className="ml-2">© {new Date().getFullYear()}</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="transition hover:text-gray-600">Privacy</Link>
            <Link href="/terms"   className="transition hover:text-gray-600">Terms</Link>
            <Link href="/contact" className="transition hover:text-gray-600">Contact</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
