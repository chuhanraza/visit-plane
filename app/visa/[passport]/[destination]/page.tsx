import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import DisclaimerBanner from '../../../components/DisclaimerBanner'
import VisaPageClient, { type VisaRecord } from './VisaPageClient'
import { blogPosts } from '@/src/lib/posts'

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

// ─── Fetch nearby passports for the same destination ──────────────────────────
async function fetchOtherPassports(destinationName: string, excludePassport: string): Promise<string[]> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('destinations')
    .select('passport_country')
    .ilike('country_name', destinationName)
    .neq('passport_country', excludePassport)
    .limit(5)
  return (data ?? []).map((r) => r.passport_country)
}

// ─── Fetch other destinations from the same passport ──────────────────────────
async function fetchRelatedDestinations(passportName: string, excludeDestination: string): Promise<string[]> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('destinations')
    .select('country_name')
    .ilike('passport_country', passportName)
    .neq('country_name', excludeDestination)
    .limit(6)
  return (data ?? []).map((r) => r.country_name)
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

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ passport: string; destination: string }>
}): Promise<Metadata> {
  const { passport: passportSlug, destination: destinationSlug } = await params
  const passportName    = decodeURIComponent(passportSlug)
  const destinationName = decodeURIComponent(destinationSlug)

  const title       = `${passportName} to ${destinationName} Visa Requirements 2026`
  const description = `Complete ${passportName} passport visa requirements for ${destinationName} — visa type, processing time, fees, required documents and embassy info. Updated May 2026.`
  const canonical   = `https://www.visitplane.com/visa/${encodeURIComponent(passportSlug)}/${encodeURIComponent(destinationSlug)}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
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

  const [allVisaData, relatedDestinations, otherPassports] = await Promise.all([
    fetchAllVisaTypes(passportName, destinationName),
    fetchRelatedDestinations(passportName, destinationName),
    fetchOtherPassports(destinationName, passportName),
  ])

  const passportFlag    = resolveFlag(passportSlug,    passportName)
  const destinationFlag = resolveFlag(destinationSlug, destinationName)

  // Auto-match blog posts by passport or destination keyword
  const relatedBlogs = blogPosts
    .filter((p) =>
      p.passportCountry.toLowerCase() === passportName.toLowerCase() ||
      p.destinationCountry.toLowerCase() === destinationName.toLowerCase() ||
      p.title.toLowerCase().includes(destinationName.toLowerCase()) ||
      p.title.toLowerCase().includes(passportName.toLowerCase())
    )
    .slice(0, 3)

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
      {
        '@type': 'Question',
        name: `How long does it take to get a visa from ${passportName} to ${destinationName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: primaryVisa?.processing_time
            ? `The typical processing time for a ${passportName} passport holder applying for a ${destinationName} visa is ${primaryVisa.processing_time}. Processing times may vary — always apply well in advance of your travel date.`
            : `Processing times vary. Check the official embassy of ${destinationName} for the most up-to-date timeline.`,
        },
      },
      {
        '@type': 'Question',
        name: `How much does a ${destinationName} visa cost for ${passportName} passport holders?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: primaryVisa?.pricing
            ? `The visa fee for ${passportName} passport holders visiting ${destinationName} is approximately ${primaryVisa.pricing}. Additional service charges may apply depending on the application method.`
            : `Visa fees vary. Please check the official embassy or consulate of ${destinationName} for the current fee schedule.`,
        },
      },
    ],
  }

  // BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.visitplane.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Destinations',
        item: 'https://www.visitplane.com/destinations',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: destinationName,
        item: `https://www.visitplane.com/destinations/${encodeURIComponent(destinationSlug)}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: `${passportName} Visa Requirements`,
        item: `https://www.visitplane.com/visa/${encodeURIComponent(passportSlug)}/${encodeURIComponent(destinationSlug)}`,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2937] antialiased">

      {/* JSON-LD: FAQPage schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* JSON-LD: BreadcrumbList schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Visual breadcrumb nav */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-1.5 py-2.5 text-xs text-gray-400 flex-wrap">
            <li>
              <Link href="/" className="hover:text-[#14B8A6] transition-colors">Home</Link>
            </li>
            <li aria-hidden="true">›</li>
            <li>
              <Link href="/destinations" className="hover:text-[#14B8A6] transition-colors">Destinations</Link>
            </li>
            <li aria-hidden="true">›</li>
            <li>
              <Link href={`/destinations/${encodeURIComponent(destinationSlug)}`} className="hover:text-[#14B8A6] transition-colors">
                {destinationName}
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li className="font-medium text-[#1F2937]" aria-current="page">
              {passportName} Visa
            </li>
          </ol>
        </div>
      </nav>

      <DisclaimerBanner />

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

      {/* ── Internal Linking Section ─────────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-[#F8FAFC]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid gap-10 lg:grid-cols-3">

            {/* Block 1: Related destinations from same passport */}
            {relatedDestinations.length > 0 && (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">
                  More Destinations from {passportName}
                </h2>
                <ul className="space-y-2">
                  {relatedDestinations.map((dest) => (
                    <li key={dest}>
                      <Link
                        href={`/visa/${encodeURIComponent(passportName)}/${encodeURIComponent(dest)}`}
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[#1F2937] hover:bg-white hover:shadow-sm transition"
                      >
                        <span className="text-[#14B8A6]">→</span>
                        {passportName} to {dest} Visa
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/visa-requirements-for-${passportName.toLowerCase().replace(/\s+/g, '-')}-citizens`}
                  className="mt-4 inline-block text-xs font-semibold text-[#14B8A6] hover:underline"
                >
                  View all {passportName} visa requirements →
                </Link>
              </div>
            )}

            {/* Block 2: Other passports for this destination */}
            {otherPassports.length > 0 && (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">
                  Other Passports Visiting {destinationName}
                </h2>
                <ul className="space-y-2">
                  {otherPassports.map((passport) => (
                    <li key={passport}>
                      <Link
                        href={`/visa/${encodeURIComponent(passport)}/${encodeURIComponent(destinationName)}`}
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[#1F2937] hover:bg-white hover:shadow-sm transition"
                      >
                        <span className="text-[#14B8A6]">→</span>
                        {passport} to {destinationName} Visa
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/${destinationName.toLowerCase().replace(/\s+/g, '-')}-visa-requirements`}
                  className="mt-4 inline-block text-xs font-semibold text-[#14B8A6] hover:underline"
                >
                  All passports visiting {destinationName} →
                </Link>
              </div>
            )}

            {/* Block 3: Related blog posts */}
            {relatedBlogs.length > 0 && (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">
                  Related Visa Guides
                </h2>
                <ul className="space-y-3">
                  {relatedBlogs.map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="group flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-white hover:shadow-sm transition"
                      >
                        <span className="text-2xl leading-none mt-0.5">{post.coverEmoji}</span>
                        <div>
                          <p className="text-sm font-medium text-[#1F2937] group-hover:text-[#14B8A6] transition leading-snug">
                            {post.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{post.readTime}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/blog"
                  className="mt-4 inline-block text-xs font-semibold text-[#14B8A6] hover:underline"
                >
                  All visa guides →
                </Link>
              </div>
            )}

          </div>
        </div>
      </section>

    </div>
  )
}
