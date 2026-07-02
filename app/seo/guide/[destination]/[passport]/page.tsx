/**
 * Template 4 — Programmatic SEO: Evergreen Visa Guide
 * URL: /{destination}-visa-guide-for-{passport}
 * e.g. /uae-visa-guide-for-pakistanis
 *
 * The long-form evergreen guide — 1500–2500 words.
 * Targets "[country] visa for [nationality]" queries.
 * Count: ~5000 high-volume passport×destination combos
 *
 * ISR: revalidated every 7 days
 */
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  COUNTRIES, BY_NATIONALITY, BY_SLUG, OFFICIAL_VISA_PORTALS
} from '@/lib/seo/countries'
import type { VisaRequirement } from '@/components/visa/VisaRequirementsBlock'

// ISR: 24h edge cache per page. Empty generateStaticParams = nothing prerenders
// at build (build-time prerender crashed Next 16 on occasional null/dirty
// Supabase rows); pages generate on first request and are then served cached.
export const revalidate = 86400
export async function generateStaticParams() {
  return []
}

// Top routes list (reference only — previously build-time prerendered).
function topRoutesReference() {
  return [
    { destination: 'uae',           passport: 'pakistanis' },
    { destination: 'uae',           passport: 'indians' },
    { destination: 'uae',           passport: 'bangladeshis' },
    { destination: 'uae',           passport: 'nigerians' },
    { destination: 'uae',           passport: 'kenyans' },
    { destination: 'uae',           passport: 'ethiopians' },
    { destination: 'uae',           passport: 'south-africans' },
    { destination: 'uae',           passport: 'americans' },
    { destination: 'uae',           passport: 'british' },
    { destination: 'uae',           passport: 'germans' },
    { destination: 'uae',           passport: 'canadians' },
    { destination: 'saudi-arabia',  passport: 'pakistanis' },
    { destination: 'saudi-arabia',  passport: 'indians' },
    { destination: 'saudi-arabia',  passport: 'bangladeshis' },
    { destination: 'saudi-arabia',  passport: 'indonesians' },
    { destination: 'saudi-arabia',  passport: 'egyptians' },
    { destination: 'turkey',        passport: 'pakistanis' },
    { destination: 'turkey',        passport: 'indians' },
    { destination: 'turkey',        passport: 'nigerians' },
    { destination: 'thailand',      passport: 'pakistanis' },
    { destination: 'thailand',      passport: 'indians' },
    { destination: 'malaysia',      passport: 'pakistanis' },
    { destination: 'malaysia',      passport: 'bangladeshis' },
    { destination: 'united-kingdom',passport: 'pakistanis' },
    { destination: 'united-kingdom',passport: 'indians' },
    { destination: 'united-kingdom',passport: 'nigerians' },
    { destination: 'germany',       passport: 'pakistanis' },
    { destination: 'germany',       passport: 'indians' },
    { destination: 'germany',       passport: 'nigerians' },
    { destination: 'united-states', passport: 'pakistanis' },
    { destination: 'united-states', passport: 'indians' },
    { destination: 'canada',        passport: 'indians' },
    { destination: 'canada',        passport: 'pakistanis' },
    { destination: 'australia',     passport: 'indians' },
    { destination: 'australia',     passport: 'pakistanis' },
    { destination: 'singapore',     passport: 'indians' },
    { destination: 'japan',         passport: 'indians' },
    { destination: 'japan',         passport: 'filipinos' },
    { destination: 'japan',         passport: 'indonesians' },
    { destination: 'south-korea',   passport: 'filipinos' },
    { destination: 'maldives',      passport: 'indians' },
    { destination: 'maldives',      passport: 'pakistanis' },
    { destination: 'china',         passport: 'pakistanis' },
    { destination: 'oman',          passport: 'pakistanis' },
    { destination: 'qatar',         passport: 'pakistanis' },
    { destination: 'bahrain',       passport: 'pakistanis' },
    { destination: 'azerbaijan',    passport: 'pakistanis' },
    { destination: 'georgia',       passport: 'pakistanis' },
    { destination: 'nepal',         passport: 'pakistanis' },
    { destination: 'indonesia',     passport: 'pakistanis' },
  ]
}
void topRoutesReference

// ── Supabase ───────────────────────────────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// Resolve noun plural from passport slug (e.g. "pakistanis" → Pakistan)
function resolvePassportFromNounSlug(slug: string) {
  // Try as nationality first
  const byNat = BY_NATIONALITY[slug.toLowerCase()]
  if (byNat) return byNat

  // Try stripping common noun plurals: "pakistanis" → "pakistani"
  const depl = slug.replace(/s$/, '').replace(/-people$/, '')
  const byDep = BY_NATIONALITY[depl.toLowerCase()]
  if (byDep) return byDep

  // Try as country slug
  return BY_SLUG[slug.toLowerCase()]
}

async function fetchVisaRequirement(passportIso: string, destinationIso: string): Promise<VisaRequirement | null> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('visa_requirements')
    .select('*')
    .eq('passport_iso', passportIso)
    .eq('destination_iso', destinationIso)
    .eq('purpose', 'tourist')
    .single()
  return data as VisaRequirement | null
}

// Throws on a Supabase ERROR (transient — caller must not 404 on it); returns []
// only for a genuinely empty result.
async function fetchLegacy(passportName: string, destinationName: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .ilike('passport_country', passportName)
    .ilike('country_name', destinationName)
    .limit(5)
  if (error) throw new Error(`[seo/guide] destinations query failed: ${error.message}`)
  return data ?? []
}

async function fetchRelatedRoutes(passportIso: string, destinationSlug: string, count = 6) {
  const supabase = getSupabase()
  const passportCountry = COUNTRIES.find(c => c.iso3 === passportIso)
  if (!passportCountry) return []
  const { data } = await supabase
    .from('destinations')
    .select('country_name')
    .ilike('passport_country', passportCountry.name)
    .neq('country_name', destinationSlug)
    .limit(count)
  // Filter out null names — a null here crashed the build when downstream code
  // called dest.toLowerCase() during prerender.
  return (data ?? []).map(r => r.country_name as string).filter(Boolean)
}

async function fetchSeoContent(passportIso: string, destinationIso: string) {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('seo_page_content')
    .select('intro_paragraph, content_json, title, meta_description')
    .eq('template', 'template4')
    .eq('passport_iso', passportIso)
    .eq('destination_iso', destinationIso)
    .single()
  return data
}

function visaLabel(cat: string) {
  return ({
    visa_free: 'Visa Free', visa_on_arrival: 'Visa on Arrival',
    evisa: 'eVisa', eta: 'ETA', visa_required: 'Visa Required',
    not_permitted: 'Entry Not Permitted', conditional: 'Conditional',
  }[cat] ?? cat.replace(/_/g, ' '))
}

function feeStr(req: VisaRequirement | null, primary: Record<string, unknown> | null) {
  if (!req && !primary) return 'Check official source'
  if (req?.fee_is_free || req?.visa_category === 'visa_free') return 'Free'
  if (req?.fee_amount && req?.fee_currency) {
    return `${req.fee_currency} ${req.fee_amount}${req.fee_amount_usd ? ` (≈ USD ${req.fee_amount_usd})` : ''}`
  }
  const p = (primary?.pricing ?? primary?.fee ?? primary?.cost ?? '') as string
  return p || 'Check official source'
}

function procStr(req: VisaRequirement | null, primary: Record<string, unknown> | null) {
  if (req?.processing_label) return req.processing_label
  if (req?.processing_min_hours && req?.processing_max_hours) {
    const h = req.processing_max_hours
    if (h <= 24) return `${req.processing_min_hours}–${h} hours`
    return `${Math.ceil(req.processing_min_hours / 24)}–${Math.ceil(h / 24)} business days`
  }
  return (primary?.processing_time as string) || 'Varies'
}

// ── Metadata ───────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ destination: string; passport: string }>
}): Promise<Metadata> {
  const { destination: destinationSlug, passport: passportNounSlug } = await params

  const destinationCountry = BY_SLUG[destinationSlug.toLowerCase()]
  const passportCountry    = resolvePassportFromNounSlug(passportNounSlug)

  if (!destinationCountry || !passportCountry) return { title: 'Visa Guide | VisitPlane' }

  const year = new Date().getFullYear()
  const title = `${destinationCountry.name} Visa Guide for ${passportCountry.nounPlural} (${year}) — Complete Handbook`
  const description = `Everything ${passportCountry.nounPlural} need to know about getting a ${destinationCountry.name} visa in ${year}: types, fees, documents, application walkthrough, real timelines, and what to do if rejected.`
  // Lowercased: lookups are case-insensitive, so an uppercase URL variant would
  // otherwise self-canonicalise as a duplicate.
  const canonical = `https://www.visitplane.com/${destinationSlug.toLowerCase()}-visa-guide-for-${passportNounSlug.toLowerCase()}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title, description, url: canonical, type: 'article',
      images: [`https://www.visitplane.com/api/og?passport=${passportCountry.nationality}&destination=${destinationSlug}&template=4`],
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function Template4Page({
  params,
}: {
  params: Promise<{ destination: string; passport: string }>
}) {
  const { destination: destinationSlug, passport: passportNounSlug } = await params

  const destinationCountry = BY_SLUG[destinationSlug.toLowerCase()]
  const passportCountry    = resolvePassportFromNounSlug(passportNounSlug)

  if (!destinationCountry || !passportCountry) notFound()

  const destName     = destinationCountry.name
  const destFlag     = destinationCountry.flag
  const passName     = passportCountry.name
  const passFlag     = passportCountry.flag
  const passNational = passportCountry.nounPlural // "Pakistani citizens"
  const year         = new Date().getFullYear()
  const updatedMonth = new Date().toLocaleString('en', { month: 'long', year: 'numeric' })

  let req: Awaited<ReturnType<typeof fetchVisaRequirement>> = null
  let legacy: Awaited<ReturnType<typeof fetchLegacy>> = []
  let related: Awaited<ReturnType<typeof fetchRelatedRoutes>> = []
  let seoContent: Awaited<ReturnType<typeof fetchSeoContent>> = null
  let fetchFailed = false
  try {
    ;[req, legacy, related, seoContent] = await Promise.all([
      fetchVisaRequirement(passportCountry.iso3, destinationCountry.iso3),
      fetchLegacy(passName, destName),
      fetchRelatedRoutes(passportCountry.iso3, destName, 6),
      fetchSeoContent(passportCountry.iso3, destinationCountry.iso3),
    ])
  } catch (err) {
    console.error('[Template4Page] data fetch error for', passName, '→', destName, err)
    fetchFailed = true
  }

  const primary = legacy[0] ?? null
  // Transient fetch failure → 5xx (retried by Google), never a 404 (deindexed).
  if (fetchFailed && !req && !primary) throw new Error('Visa data temporarily unavailable')
  if (!req && !primary) notFound()

  const cat        = req?.visa_category ?? (primary?.visa_type?.toLowerCase().includes('free') ? 'visa_free' : primary?.visa_type?.toLowerCase().includes('arrival') ? 'visa_on_arrival' : 'visa_required') as string
  const vLabel     = req ? visaLabel(req.visa_category) : (primary?.visa_type as string ?? 'Visa Required')
  const fee        = feeStr(req, primary)
  const proc       = procStr(req, primary)
  const maxStay    = req?.max_stay_days ? `${req.max_stay_days} days` : 'Per visa stamp'
  const appUrl     = req?.application_url ?? OFFICIAL_VISA_PORTALS[destinationCountry.iso3]?.url
  const portalName = OFFICIAL_VISA_PORTALS[destinationCountry.iso3]?.name ?? `${destName} Official Portal`
  const documents  = req?.required_documents ?? []

  // Content from Gemini pipeline if available
  const aiContent = seoContent?.content_json as Record<string, unknown> | null

  // TL;DR — 30-second summary
  const tldr = (() => {
    const lines: string[] = []
    lines.push(`${passNational} need: **${vLabel}**`)
    if (cat !== 'visa_free' && cat !== 'visa_on_arrival') lines.push(`Apply: ${cat === 'evisa' ? 'Online at official portal' : 'At embassy or VAC'}`)
    lines.push(`Fee: **${fee}**`)
    lines.push(`Processing: **${proc}**`)
    lines.push(`Max stay: **${maxStay}**`)
    if (req?.multiple_entry === true) lines.push(`Multiple entry: **Yes**`)
    if (appUrl && cat !== 'visa_free') lines.push(`Apply at: ${appUrl}`)
    return lines
  })()

  // Visa types section
  const visaTypes = (() => {
    if (cat === 'visa_free') return [
      { type: 'Visa Free Entry', desc: `${passNational} can enter ${destName} without a visa. Present your passport at immigration.`, fee: 'Free', stay: maxStay },
    ]
    if (cat === 'visa_on_arrival') return [
      { type: 'Tourist Visa on Arrival', desc: `Obtain at the airport immigration counter after landing.`, fee, stay: maxStay },
    ]
    return [
      { type: `Tourist ${vLabel}`, desc: `For leisure travel, visiting friends and family, tourism.`, fee, stay: maxStay },
      { type: 'Business Visa', desc: `For meetings, conferences, and short-term business activities.`, fee: 'Higher than tourist', stay: 'Typically 30–90 days' },
      { type: 'Transit Visa', desc: `For layovers requiring immigration clearance.`, fee: 'Lower fee', stay: 'Up to 96 hours typically' },
    ]
  })()

  // Documents
  const baseDocuments = documents.length > 0 ? documents : [
    { name: 'Valid Passport', detail: `Minimum 6 months validity beyond your stay. At least 2 blank pages for ${destName} stamps.`, mandatory: true },
    { name: 'Visa Application Form', detail: `Download from the official ${destName} embassy website. Complete in block capitals.`, mandatory: true },
    { name: '2 Passport Photos', detail: 'White background, taken in the last 6 months. 3.5 × 4.5 cm standard.', mandatory: true },
    { name: 'Return / Onward Flight Ticket', detail: 'Confirmed booking showing you will leave ${destName} before visa expiry.', mandatory: true },
    { name: 'Proof of Accommodation', detail: 'Hotel confirmation for entire stay, or host invitation letter.', mandatory: true },
    { name: 'Bank Statement (3–6 months)', detail: 'Shows sufficient funds — minimum ~$50–100/day depending on ${destName} cost of living.', mandatory: true },
    { name: 'Travel Insurance', detail: 'Medical + repatriation coverage. Minimum USD 30,000 recommended.', mandatory: cat === 'visa_required' },
    { name: 'Employment Letter / NOC', detail: 'Confirms employment, salary, and leave approval for trip dates.', mandatory: false },
    { name: 'Income Tax Returns', detail: 'Last 2–3 years ITRs demonstrating financial stability.', mandatory: false },
  ]

  // Application steps
  const steps = (() => {
    if (cat === 'visa_free') return [
      { n: 1, title: 'Book your trip',            detail: 'No visa required. Book flights and hotel directly.' },
      { n: 2, title: 'Prepare entry documents',   detail: `Carry: passport, return ticket, hotel booking, proof of funds. Immigration officers may ask for these.` },
      { n: 3, title: 'Complete arrival form',     detail: `Fill in the arrival/departure card on the plane or at the airport.` },
      { n: 4, title: 'Clear immigration',         detail: `Present passport and documents. You\'ll be authorized for ${maxStay}.` },
    ]
    if (cat === 'visa_on_arrival') return [
      { n: 1, title: 'Prepare documents',         detail: `Bring: passport (6+ months validity), return ticket, hotel booking, ${fee !== 'Check official source' ? `${fee} in cash` : 'visa fee in cash'}, and any required photos.` },
      { n: 2, title: 'Land in ${destName}',       detail: 'Follow signs to "Visa on Arrival" counter. This is separate from the main immigration queue.' },
      { n: 3, title: 'Fill in application',       detail: 'Complete the arrival form. Write exactly as it appears in your passport.' },
      { n: 4, title: 'Pay the fee',               detail: `Pay ${fee}. Some airports accept card; bring cash to be safe.` },
      { n: 5, title: 'Receive your visa',         detail: `Your passport will be stamped. Check the authorized stay dates immediately.` },
    ]
    if (cat === 'evisa') return [
      { n: 1, title: 'Visit the official portal', detail: `Go to ${appUrl ?? `the official ${destName} eVisa portal`}. Create an account with a valid email.` },
      { n: 2, title: 'Fill in the application',  detail: 'Enter your personal information exactly as it appears in your passport. Any mismatch causes rejection.' },
      { n: 3, title: 'Upload documents',         detail: `Upload clear scans of: passport photo page, recent passport photo (white background), and any other required files.` },
      { n: 4, title: 'Pay the visa fee',         detail: `Pay ${fee} via credit/debit card. Keep your payment reference number.` },
      { n: 5, title: 'Wait for approval',        detail: `Processing takes ${proc}. You\'ll receive an email. Check spam. If delayed, use the portal\'s application status checker.` },
      { n: 6, title: 'Print your eVisa',         detail: 'Print the approval email or save it on your phone. Present it at immigration on arrival.' },
    ]
    return [
      { n: 1, title: 'Determine visa type',      detail: 'Choose tourist, business, or transit based on your purpose. Wrong visa type is grounds for rejection.' },
      { n: 2, title: 'Gather all documents',     detail: 'Prepare originals AND notarized copies. See the document checklist above.' },
      { n: 3, title: 'Book an appointment',      detail: `Book at the ${destName} embassy/consulate or a Visa Application Centre (VFS Global / BLS International) in ${passName}.` },
      { n: 4, title: 'Attend in person',         detail: 'Dress professionally. Bring all documents in order. Officers may interview you about your travel purpose.' },
      { n: 5, title: 'Submit and pay',           detail: `Pay the visa fee (${fee}). Keep your receipt and tracking number.` },
      { n: 6, title: 'Wait for decision',        detail: `Processing takes ${proc}. Do NOT book non-refundable flights/hotels until your visa is approved.` },
      { n: 7, title: 'Collect your passport',    detail: 'Check all details: name spelling, visa category, dates, and number of permitted entries.' },
    ]
  })()

  // Cost breakdown
  const costItems = [
    { item: 'Visa application fee', cost: fee },
    { item: 'VAC service charge (if applicable)', cost: 'USD 15–50' },
    { item: 'Biometric fee (if applicable)', cost: 'USD 10–20' },
    { item: 'Travel insurance', cost: 'USD 20–60' },
    { item: 'Document notarization', cost: 'Varies by country' },
    { item: 'Courier delivery (optional)', cost: 'USD 10–30' },
  ]

  // JSON-LD
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.visitplane.com' },
      { '@type': 'ListItem', position: 2, name: destName, item: `https://www.visitplane.com/destinations/${destinationSlug}` },
      { '@type': 'ListItem', position: 3, name: `${passName} Visa Guide`, item: `https://www.visitplane.com/${destinationSlug}-visa-guide-for-${passportNounSlug}` },
    ],
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${destName} Visa Guide for ${passNational} (${year})`,
    description: `Complete ${year} visa guide for ${passNational} visiting ${destName}`,
    dateModified: new Date().toISOString(),
    author: { '@type': 'Organization', name: 'VisitPlane', url: 'https://www.visitplane.com' },
    publisher: { '@type': 'Organization', name: 'VisitPlane', url: 'https://www.visitplane.com' },
  }

  const faqItems = [
    { q: `Do ${passNational} need a visa for ${destName}?`, a: cat === 'visa_free' ? `No. ${passNational} can enter ${destName} without a visa for up to ${maxStay}.` : `Yes. ${passNational} require a ${vLabel} to enter ${destName}. Apply ${cat === 'evisa' ? 'online at the official portal' : 'at the embassy or VAC'}.` },
    { q: `How long can ${passNational} stay in ${destName}?`, a: `${passNational} can stay in ${destName} for up to ${maxStay} per visit. Overstays incur fines and can result in entry bans.` },
    { q: `What is the ${destName} visa fee for ${passNational}?`, a: `The visa fee is ${fee}. ${req?.fee_notes ?? 'Additional service charges from VACs may apply.'}` },
    { q: `How long does ${destName} visa processing take for ${passNational}?`, a: `Processing typically takes ${proc}. Apply at least 2–4 weeks before your travel date to avoid issues.` },
    { q: `What documents do ${passNational} need for a ${destName} visa?`, a: `Essential documents: valid passport (6+ months), completed form, 2 passport photos, return ticket, accommodation proof, bank statement, and travel insurance.` },
    { q: `Can ${passNational} get a ${destName} visa on arrival?`, a: cat === 'visa_on_arrival' ? `Yes. ${passNational} can get a ${destName} visa on arrival at the airport. Fee: ${fee}.` : cat === 'visa_free' ? `${passNational} don't need any visa for ${destName}.` : `No. ${passNational} must apply for a ${vLabel} before traveling to ${destName}.` },
    { q: `What happens if a ${destName} visa application is rejected for ${passNational}?`, a: `If rejected, you'll receive a refusal notice. You can: (1) appeal if grounds exist, (2) reapply with stronger supporting documents, or (3) apply with help from a licensed immigration consultant. Don't book travel until you have an approved visa.` },
    { q: `Where do ${passNational} apply for a ${destName} visa?`, a: cat === 'evisa' ? `Apply online at ${appUrl ?? 'the official eVisa portal'}. No embassy visit needed.` : cat === 'visa_on_arrival' ? `${passNational} apply at the ${destName} immigration counter on arrival.` : `Apply at the ${destName} embassy in ${passName}, or at an authorised VAC (VFS Global or BLS International).` },
    { q: `Is travel insurance required for ${passNational} visiting ${destName}?`, a: cat === 'visa_required' ? `Travel insurance is strongly recommended and may be required for visa application. Minimum coverage: medical emergencies + repatriation.` : `Not strictly required but strongly recommended for any international travel.` },
    { q: `What are the common mistakes ${passNational} make when applying for a ${destName} visa?`, a: 'Common mistakes: incorrect application form, submitting old bank statements, using unclear passport photo scans, not disclosing prior rejections, applying too late before travel, and not double-checking passport validity dates.' },
  ]

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(({ q, a }) => ({
      '@type': 'Question', name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2937] antialiased">

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-100 print:hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-1.5 py-2.5 text-xs text-gray-400 flex-wrap">
            <li><Link href="/" className="hover:text-[#14B8A6]">Home</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link href="/destinations" className="hover:text-[#14B8A6]">Destinations</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link href={`/destinations/${destinationSlug}`} className="hover:text-[#14B8A6]">{destFlag} {destName}</Link></li>
            <li aria-hidden="true">›</li>
            <li className="font-medium text-[#1F2937]" aria-current="page">{passFlag} {passName} Visa Guide</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <header className="bg-gradient-to-br from-[#0f172a] via-[#1b2a4a] to-[#0d9488]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14 sm:py-18">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-white/90">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Updated {updatedMonth}
            </span>
            <span className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-white/80">
              {req ? '✓ Embassy-Verified' : '📋 Community Verified'}
            </span>
            <span className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-white/80">
              📖 Complete Guide
            </span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-5xl sm:text-6xl">{destFlag}</span>
            <span className="text-3xl text-white/30">+</span>
            <span className="text-5xl sm:text-6xl">{passFlag}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {destName} Visa Guide for
            <span className="block text-[#34d399]">{passNational} ({year})</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/75 max-w-2xl">
            Everything you need to know — from visa type and fees to the exact documents, real timelines, common mistakes, and what to do if your application is rejected.
          </p>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
            {[
              { label: 'Visa Type',  value: vLabel },
              { label: 'Fee',        value: fee },
              { label: 'Processing', value: proc },
              { label: 'Max Stay',   value: maxStay },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-white/10 border border-white/15 p-3 sm:p-4">
                <div className="text-[10px] uppercase tracking-widest text-white/50 mb-1">{label}</div>
                <div className="text-sm font-bold text-white">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Disclaimer */}
      <div className="bg-amber-50 border-b border-amber-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-2.5">
          <p className="text-xs text-amber-700">
            <strong>Disclaimer:</strong> Visa information changes frequently. Verify all requirements at the official {destName} embassy or immigration authority before travel.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-12">

          <div className="space-y-14">

            {/* TL;DR */}
            <section>
              <div className="rounded-2xl border border-teal-100 bg-teal-50 p-6">
                <h2 className="text-lg font-bold text-teal-800 mb-3">⚡ What You Need to Know in 30 Seconds</h2>
                <ul className="space-y-2">
                  {tldr.map((line, i) => (
                    <li key={i} className="text-sm text-teal-700 flex items-start gap-2">
                      <span className="text-teal-500 mt-0.5 shrink-0">✓</span>
                      <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Visa types */}
            <section>
              <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Visa Types Available for {passNational}</h2>
              <div className="space-y-3">
                {visaTypes.map((vt, i) => (
                  <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-bold text-[#1F2937]">{vt.type}</h3>
                      <span className="text-sm font-semibold text-teal-700 bg-teal-50 rounded-full px-3 py-1 shrink-0">{vt.fee}</span>
                    </div>
                    <p className="text-sm text-gray-500">{vt.desc}</p>
                    <p className="text-xs text-gray-400 mt-1">Maximum stay: {vt.stay}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Step-by-step walkthrough */}
            <section>
              <h2 className="text-2xl font-bold text-[#1F2937] mb-2">
                Step-by-Step Application Walkthrough
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Many travelers don't realize that the order you prepare documents matters — some must be arranged before others (e.g., book accommodation before getting bank statement).
              </p>
              <ol className="space-y-5">
                {steps.map(({ n, title, detail }) => (
                  <li key={n} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0d9488] text-sm font-bold text-white shadow">
                      {n}
                    </div>
                    <div className="pt-1.5">
                      <p className="font-bold text-[#1F2937]">{title}</p>
                      <p className="text-sm text-gray-500 mt-1 leading-relaxed">{detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Document checklist */}
            <section>
              <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Documents in Detail</h2>
              <p className="text-sm text-gray-500 mb-5">
                Each document below has a purpose — understanding why it's needed helps you prepare it correctly.
              </p>
              <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 grid grid-cols-[1fr_auto] text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <span>Document</span>
                  <span>Required</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {baseDocuments.map((doc, i) => (
                    <div key={i} className="px-5 py-4 grid grid-cols-[1fr_auto] gap-4 items-start">
                      <div>
                        <p className="text-sm font-semibold text-[#1F2937]">{doc.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{doc.detail}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${doc.mandatory ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {doc.mandatory ? 'Required' : 'Recommended'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Cost breakdown */}
            <section>
              <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Cost Breakdown</h2>
              <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Item</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {costItems.map(({ item, cost }) => (
                      <tr key={item}>
                        <td className="px-5 py-3.5 text-gray-600">{item}</td>
                        <td className="px-5 py-3.5 text-right font-semibold text-[#1F2937]">{cost}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-teal-50 border-t border-teal-100">
                      <td className="px-5 py-3.5 font-bold text-teal-800">Estimated Total</td>
                      <td className="px-5 py-3.5 text-right font-bold text-teal-700">
                        {fee === 'Free' ? 'Free (just insurance ~$30)' : `${fee} + service fees`}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-2">* Exchange rates fluctuate. Check actual rates at time of application.</p>
            </section>

            {/* Real timeline expectations */}
            <section>
              <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Real Timeline Expectations</h2>
              <div className="space-y-3">
                {[
                  { label: '8 weeks before travel',  action: 'Check passport validity. Start gathering employment/income documents.' },
                  { label: '6 weeks before',         action: 'Book accommodation (need confirmation for application). Check bank balance requirements.' },
                  { label: '4 weeks before',         action: cat === 'evisa' ? 'Submit eVisa application online.' : 'Book embassy/VAC appointment. Prepare complete document package.' },
                  { label: `${proc} after submission`, action: 'Expected decision. Check application status online if no response.' },
                  { label: 'Approval received',      action: 'Book non-refundable flights and make final travel arrangements.' },
                  { label: '1 week before travel',   action: 'Print all documents. Check entry requirements haven\'t changed.' },
                  { label: 'Day of travel',          action: `Carry all documents in hand luggage. Arrive airport early.` },
                ].map(({ label, action }, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-[#14B8A6] shrink-0 mt-1" />
                      {i < 6 && <div className="w-px flex-1 bg-teal-100 my-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">{label}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Common mistakes */}
            <section>
              <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Common Mistakes to Avoid</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { title: 'Booking before visa approval',      desc: 'Never book non-refundable flights until your visa is in hand. Rejection doesn\'t get you a refund.' },
                  { title: 'Not disclosing prior rejections',   desc: 'Failing to declare a previous visa rejection is misrepresentation — a worse outcome than the original rejection.' },
                  { title: 'Old or blurry document scans',      desc: 'Bank statements must be current (within 90 days). Scans must be clear — officers reject blurry uploads.' },
                  { title: 'Applying at peak season too late',  desc: 'Eid, summer, Christmas — processing times double. Apply 8 weeks out, not 2.' },
                  { title: 'Wrong visa category',               desc: 'Applying for tourist when you\'re doing business activities. Match your actual purpose.' },
                  { title: 'Insufficient funds shown',          desc: `${destName} officers calculate based on daily spend. Too little = instant rejection.` },
                ].map(({ title, desc }) => (
                  <div key={title} className="rounded-xl border border-red-100 bg-red-50 p-4">
                    <p className="text-sm font-bold text-red-800 mb-1">✕ {title}</p>
                    <p className="text-xs text-red-700 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* What to do if rejected */}
            <section>
              <h2 className="text-2xl font-bold text-[#1F2937] mb-4">What to Do if Your Application is Rejected</h2>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  A rejection is not necessarily permanent. Many travelers don't realize that a well-prepared reapplication — addressing the specific reason for refusal — succeeds on the second attempt.
                </p>
                {[
                  { step: '1', title: 'Read the rejection notice carefully', desc: 'The refusal letter states the reason. Understand it exactly before doing anything else.' },
                  { step: '2', title: 'Do not immediately reapply', desc: 'Reapplying with the same documents will result in the same outcome. Address the specific reason first.' },
                  { step: '3', title: 'Strengthen your application', desc: 'If it was financial: strengthen bank balance. If it was employment: get a stronger NOC. If it was incomplete docs: gather everything.' },
                  { step: '4', title: 'Consider an immigration consultant', desc: 'For complex cases (prior overstays, multiple rejections), a licensed immigration consultant can identify issues you may miss.' },
                  { step: '5', title: 'Reapply with a cover letter', desc: 'Acknowledge the previous rejection, explain what changed, and demonstrate you\'re a genuine visitor who will leave before visa expiry.' },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center shrink-0 text-xs font-bold text-teal-700">{step}</div>
                    <div>
                      <p className="text-sm font-semibold text-[#1F2937]">{title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Official sources */}
            {(req?.official_sources?.length ?? 0) > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Official Sources</h2>
                <div className="space-y-2">
                  {req!.official_sources.map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer nofollow"
                      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-teal-200 hover:bg-teal-50 transition-colors group">
                      <span className="text-gray-400 group-hover:text-teal-500">🔗</span>
                      <div>
                        <span className="text-sm font-medium text-[#1F2937] group-hover:text-teal-700">{s.label}</span>
                        {s.is_authoritative && <span className="ml-2 rounded-full bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 font-semibold">Official</span>}
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Author note */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0 text-teal-600 font-bold">VP</div>
                <div>
                  <p className="text-sm font-semibold text-[#1F2937]">VisitPlane Editorial Team</p>
                  <p className="text-xs text-gray-400">Updated {updatedMonth} · Verified against official embassy sources</p>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    This guide is compiled from official {destName} immigration sources, embassy data, and community-verified traveler reports. We update it every 7 days. If you spot an error, use the correction link below — we act on all reports within 24 hours.
                  </p>
                  <Link href="/contact" className="text-xs text-teal-600 hover:underline mt-1 inline-block">Report an error →</Link>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="text-2xl font-bold text-[#1F2937] mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {faqItems.map(({ q, a }, i) => (
                  <details key={i} className="group rounded-xl border border-gray-200 bg-white">
                    <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-medium text-[#1F2937] text-sm gap-4">
                      <span>{q}</span>
                      <span className="text-gray-400 group-open:rotate-180 transition-transform shrink-0">▾</span>
                    </summary>
                    <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">{a}</p>
                  </details>
                ))}
              </div>
            </section>

          </div>

          {/* Sidebar */}
          <aside className="mt-10 lg:mt-0 space-y-6">

            {/* Apply card */}
            {appUrl && cat !== 'visa_free' && (
              <div className="rounded-2xl bg-gradient-to-br from-[#14B8A6] to-[#0d9488] p-5 text-white">
                <p className="text-xs uppercase tracking-wider text-white/70 mb-1">Official Application</p>
                <p className="font-bold text-lg mb-3">{portalName}</p>
                <a href={appUrl} target="_blank" rel="noopener noreferrer nofollow"
                  className="flex items-center justify-center gap-2 rounded-xl bg-white text-teal-700 font-bold px-4 py-2.5 text-sm hover:bg-teal-50 transition-colors w-full">
                  Apply Now →
                </a>
                <p className="text-xs text-white/60 text-center mt-2">Opens official portal</p>
              </div>
            )}

            {/* Quick links */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="font-bold text-[#1F2937] text-sm mb-3">Related Pages</h3>
              <div className="space-y-1.5">
                {[
                  { href: `/visa-requirements-for-${passportCountry.nationality}-citizens-to-${destinationSlug}`, label: '📋 Full Requirements' },
                  { href: `/${passportCountry.nationality}-to-${destinationSlug}-visa-requirements`, label: '🔍 Quick Visa Check' },
                  { href: `/visa-free-countries-for-${passportCountry.nationality}-passport`, label: `🌍 Visa-Free Countries` },
                  { href: `/cheapest-visa-from-${passportCountry.nationality}-passport`, label: '💰 Cheapest Visas' },
                  { href: '/checklist', label: '✅ Document Checklist' },
                  { href: '/embassy-finder', label: '🏛️ Embassy Finder' },
                  { href: '/interview-prep', label: '🎤 Interview Prep' },
                  { href: '/travel-insurance', label: '🛡️ Travel Insurance' },
                ].map(({ href, label }) => (
                  <Link key={href} href={href} className="block text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg px-3 py-2 transition-colors">
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* More destinations from same passport */}
            {related.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="font-bold text-[#1F2937] text-sm mb-3">{passFlag} More {passName} guides</h3>
                <div className="space-y-1.5">
                  {related.map(dest => {
                    const dCountry = COUNTRIES.find(c => c.name.toLowerCase() === dest.toLowerCase())
                    const dSlug    = dCountry?.slug ?? dest.toLowerCase().replace(/\s+/g, '-')
                    return (
                      <Link key={dest} href={`/${dSlug}-visa-guide-for-${passportNounSlug}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg px-2 py-1.5 transition-colors">
                        <span>{dCountry?.flag ?? '🌍'}</span>
                        <span>{dest} Guide</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

          </aside>
        </div>
      </div>

    </div>
  )
}
