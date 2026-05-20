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

  // Build JSON-LD schema
  const primaryVisa = allVisaData[0]
  const answerText = primaryVisa
    ? `${primaryVisa.visa_type ?? 'Visa information available'}. Processing time: ${primaryVisa.processing_time ?? 'varies'}. Fee: ${primaryVisa.pricing ?? 'see official embassy'}.`
    : `Visa requirements vary. Please check the official embassy of ${destinationName} for the latest information.`

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Do I need a visa to travel from ${passportName} to ${destinationName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answerText,
        },
      },
      {
        '@type': 'Question',
        name: `What documents do I need for a ${passportName} passport holder to visit ${destinationName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${passportName} passport holders traveling to ${destinationName} should check visa requirements including ${answerText} Always verify with the official embassy or consulate before traveling.`,
        },
      },
    ],
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2937] antialiased">

      {/* JSON-LD Schema for Google rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <DisclaimerBanner />{/* ── Client component (hero + tabs + sidebar + cards) ────────────────── */}
      <VisaPageClient
        allVisaData={allVisaData}
        passportName={passportName}
        destinationName={destinationName}
        passportSlug={passportSlug}
        destinationSlug={destinationSlug}
        passportFlag={passportFlag}
        destinationFlag={destinationFlag}
      /></div>
  )
}
