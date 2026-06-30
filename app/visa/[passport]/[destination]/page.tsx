import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasConflictingStatus } from '@/lib/visa/detectConflict'
import VisaPageClient, { type VisaRecord } from './VisaPageClient'

// Force dynamic rendering — always fetch fresh data from Supabase
export const dynamic = 'force-dynamic'

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
  return COUNTRY_MAP[slug]?.flag ?? NAME_FLAG_MAP[name.toLowerCase()] ?? '🌍'
}

// ─── Supabase ──────────────────────────────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

async function fetchOtherPassports(destinationName: string, excludePassport: string): Promise<string[]> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('destinations')
    .select('passport_country')
    .ilike('country_name', destinationName)
    .neq('passport_country', excludePassport)
    .limit(25) // fetch extra to account for duplicates across visa types
  // Deduplicate — the destinations table has multiple rows per country (one per visa type)
  const seen = new Set<string>()
  const unique: string[] = []
  for (const r of (data ?? [])) {
    const name = (r.passport_country ?? '').trim()
    const key = name.toLowerCase()
    if (name && !seen.has(key)) { seen.add(key); unique.push(name) }
    if (unique.length >= 5) break
  }
  return unique
}

async function fetchRelatedDestinations(passportName: string, excludeDestination: string): Promise<string[]> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('destinations')
    .select('country_name')
    .ilike('passport_country', passportName)
    .neq('country_name', excludeDestination)
    .limit(25) // fetch extra to account for duplicates across visa types
  // Deduplicate — the destinations table has multiple rows per country (one per visa type)
  const seen = new Set<string>()
  const unique: string[] = []
  for (const r of (data ?? [])) {
    const name = (r.country_name ?? '').trim()
    const key = name.toLowerCase()
    if (name && !seen.has(key)) { seen.add(key); unique.push(name) }
    if (unique.length >= 5) break
  }
  return unique
}

async function fetchAllVisaTypes(passportName: string, destinationName: string): Promise<VisaRecord[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .ilike('passport_country', passportName)
    .ilike('country_name', destinationName)
    .order('id', { ascending: true })
    .limit(20)
  if (error) { console.error('Supabase error:', error); return [] }
  return (data ?? []) as VisaRecord[]
}

// Soft-404 guard fetch. Same query as fetchAllVisaTypes, but it tells the caller
// whether the query SUCCEEDED so we can distinguish "this pair genuinely has no
// record" (→ real 404) from "Supabase errored" (transient — keep the page at 200
// so an outage never mass-404s the whole /visa index). The `destinations` table is
// the canonical source of truth for which visa pairs exist — the sitemap builds
// /visa/{passport}/{destination} URLs straight from these same rows. `ilike` is an
// exact, case-insensitive match on the already-decoded names, so encoded multi-word
// countries ("United Kingdom", "Sao Tome and Principe") validate correctly and no
// real pair is ever falsely rejected.
async function fetchVisaTypesResult(
  passportName: string,
  destinationName: string,
): Promise<{ ok: boolean; rows: VisaRecord[] }> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .ilike('passport_country', passportName)
    .ilike('country_name', destinationName)
    .order('id', { ascending: true })
    .limit(20)
  if (error) {
    console.error('[fetchVisaTypesResult] Supabase error:', error)
    return { ok: false, rows: [] } // transient — caller must NOT 404 on this
  }
  return { ok: true, rows: (data ?? []) as VisaRecord[] }
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

  // Fetch primary record to build dynamic description
  let data: Awaited<ReturnType<typeof fetchAllVisaTypes>> = []
  try {
    data = await fetchAllVisaTypes(passportName, destinationName)
  } catch (err) {
    console.error('[generateMetadata] fetchAllVisaTypes error:', err)
  }
  const primary = data[0]
  const visaType   = primary?.visa_type ?? primary?.type ?? 'visa'
  const fee        = (primary?.price ?? primary?.fee ?? primary?.cost ?? '').toString().trim()
  const feeText    = fee && !/n\/a|contact/i.test(fee) ? ` · Fee: ${/^\$/.test(fee) ? fee : `$${fee}`}` : ''
  const processing = (primary?.processing_time ?? '').toString().trim()
  const procText   = processing ? ` · Processing: ${processing}` : ''

  const title       = `${destinationName} Visa Requirements for ${passportName} Passport Holders (2026) | VisitPlane`
  const description = `${passportName} passport holders visiting ${destinationName}: ${visaType}${feeText}${procText}. Complete document checklist, step-by-step application guide, and official sources. Updated June 2026.`
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

  // ── Soft-404 guard ───────────────────────────────────────────────────────────
  // Validate the pair against the canonical source of truth (the `destinations`
  // table — the same rows the sitemap builds these URLs from) BEFORE rendering.
  // If the query succeeded but found no record (typo'd / malformed / non-existent
  // country pair like /visa/Nowhere/Nowhereland), return a genuine HTTP 404 via
  // notFound() instead of a templated 200 "Coming Soon" page that Google reads as a
  // soft 404. A Supabase ERROR is treated as transient and is NOT 404'd, so an
  // outage can never mass-404 the tens of thousands of valid /visa pages.
  //
  // The fetch is wrapped in try/catch, but notFound() is called AFTER it (outside
  // the catch) — notFound() signals the 404 boundary by throwing, so it must never
  // be swallowed by this error handler.
  let visaResult: { ok: boolean; rows: VisaRecord[] } = { ok: false, rows: [] }
  try {
    visaResult = await fetchVisaTypesResult(passportName, destinationName)
  } catch (err) {
    console.error('[VisaResultPage] visa fetch error for', passportName, '→', destinationName, err)
    // Transient fetch failure: treat as not-ok so we render gracefully at HTTP 200.
    visaResult = { ok: false, rows: [] }
  }
  if (visaResult.ok && visaResult.rows.length === 0) {
    notFound() // real 404 — invalid pair / no visa record exists for this route
  }
  const allVisaData: VisaRecord[] = visaResult.rows

  // Secondary, best-effort fetches — never block the page or affect the status code.
  let relatedDestinations: string[] = []
  let otherPassports: string[] = []
  try {
    ;[relatedDestinations, otherPassports] = await Promise.all([
      fetchRelatedDestinations(passportName, destinationName),
      fetchOtherPassports(destinationName, passportName),
    ])
  } catch (err) {
    console.error('[VisaResultPage] related-data fetch error for', passportName, '→', destinationName, err)
    // relatedDestinations / otherPassports stay as empty arrays.
  }

  const passportFlag    = resolveFlag(passportSlug,    passportName)
  const destinationFlag = resolveFlag(destinationSlug, destinationName)
  const primaryVisa     = allVisaData[0]

  // Render-time, read-only check: do this route's own rows disagree about the
  // visa status? (Sprint 16 flagged ~5,319 such routes.) Used only to surface an
  // honest "confirm with the official source" note — never changes any value.
  const conflictingStatus = hasConflictingStatus(allVisaData)

  // ── JSON-LD schemas ──────────────────────────────────────────────────────────

  // BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',         item: 'https://www.visitplane.com' },
      { '@type': 'ListItem', position: 2, name: 'Destinations', item: 'https://www.visitplane.com/destinations' },
      { '@type': 'ListItem', position: 3, name: destinationName, item: `https://www.visitplane.com/destinations/${encodeURIComponent(destinationSlug)}` },
      { '@type': 'ListItem', position: 4, name: `${passportName} Visa Requirements`, item: `https://www.visitplane.com/visa/${encodeURIComponent(passportSlug)}/${encodeURIComponent(destinationSlug)}` },
    ],
  }

  // HowTo schema
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to Apply for a ${destinationName} Visa as a ${passportName} Passport Holder`,
    description: `Step-by-step guide for ${passportName} citizens to obtain a ${destinationName} visa`,
    totalTime: primaryVisa?.processing_time ? `P${primaryVisa.processing_time.match(/\d+/)?.[0] ?? 7}D` : 'P7D',
    estimatedCost: primaryVisa?.price ?? primaryVisa?.fee ?? primaryVisa?.cost
      ? {
          '@type': 'MonetaryAmount',
          currency: 'USD',
          value: (primaryVisa.price ?? primaryVisa.fee ?? primaryVisa.cost ?? '').toString().replace(/[^0-9.]/g, ''),
        }
      : undefined,
    step: [
      { '@type': 'HowToStep', name: 'Check eligibility', text: `Confirm you hold a ${passportName} passport and meet the entry requirements for ${destinationName}.` },
      { '@type': 'HowToStep', name: 'Gather documents',  text: 'Collect all required documents including valid passport, photos, application form, bank statements, and supporting documents.' },
      { '@type': 'HowToStep', name: 'Submit application', text: `Apply online through the official ${destinationName} eVisa portal or immigration authority website.` },
      { '@type': 'HowToStep', name: 'Pay visa fee',       text: `Pay the visa application fee using a credit or debit card through the official portal.` },
      { '@type': 'HowToStep', name: 'Receive approval',   text: 'Wait for your visa approval email. Processing typically takes 3–5 business days.' },
      { '@type': 'HowToStep', name: 'Travel',             text: `Present your approved visa (printed or digital) at immigration on arrival in ${destinationName}.` },
    ],
  }

  // FAQPage schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Do ${passportName} passport holders need a visa for ${destinationName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: primaryVisa
            ? `${passportName} passport holders require: ${primaryVisa.visa_type ?? primaryVisa.type ?? 'a visa'}. Processing time: ${primaryVisa.processing_time ?? 'varies'}. Fee: ${primaryVisa.price ?? primaryVisa.fee ?? primaryVisa.cost ?? 'see official source'}.`
            : `Please check the official immigration authority of ${destinationName} for the latest visa requirements.`,
        },
      },
      {
        '@type': 'Question',
        name: `What documents do ${passportName} citizens need for ${destinationName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${passportName} passport holders typically need: valid passport (6+ months), completed visa application form, passport-sized photos, bank statements, return flight ticket, and hotel booking confirmation. Additional documents may be required based on your visa type.`,
        },
      },
      {
        '@type': 'Question',
        name: `How long does a ${destinationName} visa take for ${passportName} citizens?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: primaryVisa?.processing_time
            ? `The typical processing time for ${passportName} citizens applying for a ${destinationName} visa is ${primaryVisa.processing_time}. Apply at least 2–3 weeks before your travel date to be safe.`
            : `Processing times vary. Check the official immigration authority of ${destinationName} for current timelines.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the ${destinationName} visa fee for ${passportName} passport holders?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: (primaryVisa?.price ?? primaryVisa?.fee ?? primaryVisa?.cost)
            ? `The visa fee for ${passportName} citizens visiting ${destinationName} is approximately ${primaryVisa.price ?? primaryVisa.fee ?? primaryVisa.cost}. Additional service fees may apply.`
            : `Visa fees vary. Check the official embassy or immigration authority of ${destinationName} for the current fee schedule.`,
        },
      },
      {
        '@type': 'Question',
        name: `Can I extend my ${destinationName} visa?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Visa extension policies vary by type and destination. Contact the ${destinationName} immigration authority before your visa expires to understand extension options. Apply for extensions well in advance to avoid overstay penalties.`,
        },
      },
    ],
  }

  const canonical = `https://www.visitplane.com/visa/${encodeURIComponent(passportSlug)}/${encodeURIComponent(destinationSlug)}`

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2937] antialiased">

      {/* JSON-LD schemas */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Visual breadcrumb */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-100 print:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-1.5 py-2.5 text-xs text-gray-400 flex-wrap">
            <li><a href="/" className="hover:text-[#14B8A6] transition-colors">Home</a></li>
            <li aria-hidden="true">›</li>
            <li><a href="/destinations" className="hover:text-[#14B8A6] transition-colors">Destinations</a></li>
            <li aria-hidden="true">›</li>
            <li>
              <a href={`/destinations/${encodeURIComponent(destinationSlug)}`} className="hover:text-[#14B8A6] transition-colors">
                {destinationName}
              </a>
            </li>
            <li aria-hidden="true">›</li>
            <li className="font-medium text-[#1F2937]" aria-current="page">{passportName} Visa</li>
          </ol>
        </div>
      </nav>

      {/* Client component — all 6 sections */}
      <VisaPageClient
        allVisaData={allVisaData}
        passportName={passportName}
        destinationName={destinationName}
        passportSlug={passportSlug}
        destinationSlug={destinationSlug}
        passportFlag={passportFlag}
        destinationFlag={destinationFlag}
        relatedDestinations={relatedDestinations}
        otherPassports={otherPassports}
        conflictingStatus={conflictingStatus}
      />

    </div>
  )
}
