/**
 * Template B — Long-form visa requirements page
 * URL: /{passport}-to-{destination}-visa-requirements
 * e.g. /pakistan-to-uae-visa-requirements
 *
 * Separate from /visa/[passport]/[destination] — this is the long-form SEO page
 * optimised for "pakistan to uae visa requirements" style queries.
 *
 * Data priority:
 *   1. visa_requirements table (verified, route-specific)
 *   2. destinations table (legacy, for page existence check + SEO hero)
 */
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import VisaRequirementsBlock, { type VisaRequirement } from '@/components/visa/VisaRequirementsBlock'
import TripEssentials from '@/components/affiliate/TripEssentials'

// DB/param-dependent route — render on demand. Prevents Next 16 from trying to
// prerender an empty-param shell (which crashed the build on `params.toLowerCase`).
export const dynamic = 'force-dynamic'

// ── Slug → country name resolution ───────────────────────────────────────────
// Converts "pakistan" → "Pakistan", "united-kingdom" → "United Kingdom"
function slugToCountry(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// Canonical country names for known slugs (handles special cases)
const SLUG_OVERRIDES: Record<string, string> = {
  'uae': 'UAE',
  'usa': 'United States',
  'uk': 'United Kingdom',
  'south-korea': 'South Korea',
  'south-africa': 'South Africa',
  'new-zealand': 'New Zealand',
  'saudi-arabia': 'Saudi Arabia',
  'sri-lanka': 'Sri Lanka',
}

function resolveCountry(slug: string): string {
  return SLUG_OVERRIDES[slug.toLowerCase()] ?? slugToCountry(slug)
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

async function fetchVisaData(passportCountry: string, destinationCountry: string) {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('destinations')
    .select('*')
    .ilike('passport_country', passportCountry)
    .ilike('country_name', destinationCountry)
    .limit(5)
  return data ?? []
}

// ISO slug → ISO 3166-1 alpha-3 mapping for the top routes
const SLUG_TO_ISO3: Record<string, string> = {
  'pakistan': 'PAK', 'uae': 'ARE', 'united-arab-emirates': 'ARE',
  'saudi-arabia': 'SAU', 'turkey': 'TUR', 'thailand': 'THA',
  'malaysia': 'MYS', 'united-kingdom': 'GBR', 'uk': 'GBR',
  'germany': 'DEU', 'united-states': 'USA', 'usa': 'USA',
  'china': 'CHN', 'singapore': 'SGP', 'indonesia': 'IDN',
  'sri-lanka': 'LKA', 'maldives': 'MDV', 'qatar': 'QAT',
  'oman': 'OMN', 'azerbaijan': 'AZE', 'georgia': 'GEO',
  'japan': 'JPN', 'south-korea': 'KOR', 'nepal': 'NPL',
}

async function fetchVerifiedRequirement(
  passportSlug: string,
  destinationSlug: string,
): Promise<VisaRequirement | null> {
  const passportIso    = SLUG_TO_ISO3[passportSlug.toLowerCase()]
  const destinationIso = SLUG_TO_ISO3[destinationSlug.toLowerCase()]
  if (!passportIso || !destinationIso) return null

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('visa_requirements')
    .select('*')
    .eq('passport_iso', passportIso)
    .eq('destination_iso', destinationIso)
    .eq('purpose', 'tourist')
    .single()

  if (error || !data) return null
  return data as VisaRequirement
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ passport: string; destination: string }>
}): Promise<Metadata> {
  const { passport: passportSlug, destination: destinationSlug } = await params
  const passportName    = resolveCountry(passportSlug)
  const destinationName = resolveCountry(destinationSlug)

  const title       = `${passportName} to ${destinationName} Visa Requirements 2026 — Complete Guide`
  const description = `Everything a ${passportName} passport holder needs to know before visiting ${destinationName}: visa type, fee, processing time, required documents, and how to apply. Updated May 2026.`
  const canonical   = `https://www.visitplane.com/${passportSlug}-to-${destinationSlug}-visa-requirements`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'article' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function LongFormVisaPage({
  params,
}: {
  params: Promise<{ passport: string; destination: string }>
}) {
  const { passport: passportSlug, destination: destinationSlug } = await params
  const passportName    = resolveCountry(passportSlug)
  const destinationName = resolveCountry(destinationSlug)

  // Fetch both: verified (new) and legacy (for page existence + hero data)
  const [visaData, verifiedReq] = await Promise.all([
    fetchVisaData(passportName, destinationName),
    fetchVerifiedRequirement(passportSlug, destinationSlug),
  ])

  if (visaData.length === 0) notFound()

  const primary = visaData[0]

  // Use verified data for structured FAQ schema when available
  const feeText   = verifiedReq?.fee_is_free
    ? 'Free'
    : verifiedReq?.fee_amount && verifiedReq?.fee_currency
      ? `${verifiedReq.fee_currency} ${verifiedReq.fee_amount} (≈ USD ${verifiedReq.fee_amount_usd ?? '?'})`
      : primary.pricing ?? 'Pending verification'

  const processingText = verifiedReq?.processing_label ?? primary.processing_time ?? 'Varies'

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Does a ${passportName} passport holder need a visa to visit ${destinationName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: verifiedReq
            ? `${passportName} passport holders need a ${verifiedReq.visa_category.replace(/_/g, ' ')} to enter ${destinationName}. Processing time is ${processingText}. Fee: ${feeText}.`
            : primary.visa_type
            ? `${passportName} passport holders require a ${primary.visa_type} to enter ${destinationName}. ${primary.processing_time ? `Processing time is approximately ${primary.processing_time}.` : ''} ${primary.pricing ? `The visa fee is ${primary.pricing}.` : ''}`
            : `Visa requirements apply. Please verify with the official ${destinationName} embassy before traveling.`,
        },
      },
      {
        '@type': 'Question',
        name: `How long does a ${passportName} to ${destinationName} visa take?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The processing time is typically ${processingText}. Apply well in advance of your planned travel date.`,
        },
      },
      {
        '@type': 'Question',
        name: `What documents do ${passportName} citizens need for a ${destinationName} visa?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: verifiedReq?.required_documents?.length
            ? `For ${passportName} to ${destinationName} (${verifiedReq.visa_category.replace(/_/g, ' ')}): ${verifiedReq.required_documents.filter(d => d.mandatory).map(d => d.name).join(', ')}.`
            : `Standard documents typically include: valid passport, completed application form, recent passport photos, return ticket, accommodation proof, bank statements, travel insurance, and proof of employment. Always verify with the official embassy.`,
        },
      },
      {
        '@type': 'Question',
        name: `How much does a ${destinationName} visa cost for ${passportName} citizens?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: verifiedReq?.fee_is_free
            ? `Entry to ${destinationName} is free for ${passportName} passport holders (no visa fee).`
            : verifiedReq?.fee_amount
            ? `The ${destinationName} visa fee for ${passportName} passport holders is ${feeText}. ${verifiedReq.fee_notes ?? ''}`
            : `Visa fees vary. Contact the official ${destinationName} embassy or consulate for the current fee schedule.`,
        },
      },
      {
        '@type': 'Question',
        name: `Can I get a ${destinationName} visa on arrival as a ${passportName} citizen?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: verifiedReq?.visa_category === 'visa_on_arrival'
            ? `Yes, ${passportName} citizens can obtain a ${destinationName} visa on arrival. Fee: ${feeText}. Bring sufficient cash and passport photos.`
            : verifiedReq?.visa_category === 'evisa'
            ? `${passportName} passport holders must apply online for a ${destinationName} eVisa before travel. Apply at: ${verifiedReq.application_url ?? 'the official government portal'}.`
            : verifiedReq?.visa_category === 'visa_free'
            ? `${passportName} passport holders can enter ${destinationName} without a visa.`
            : `${passportName} passport holders typically cannot get a ${destinationName} visa on arrival and must apply in advance.`,
        },
      },
    ],
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.visitplane.com' },
      { '@type': 'ListItem', position: 2, name: 'Destinations', item: 'https://www.visitplane.com/destinations' },
      { '@type': 'ListItem', position: 3, name: destinationName, item: `https://www.visitplane.com/destinations/${encodeURIComponent(destinationSlug)}` },
      { '@type': 'ListItem', position: 4, name: `${passportName} Visa Guide`, item: `https://www.visitplane.com/${passportSlug}-to-${destinationSlug}-visa-requirements` },
    ],
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2937] antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-1.5 py-2.5 text-xs text-gray-400 flex-wrap">
            <li><Link href="/" className="hover:text-[#14B8A6] transition-colors">Home</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link href="/destinations" className="hover:text-[#14B8A6] transition-colors">Destinations</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link href={`/destinations/${destinationSlug}`} className="hover:text-[#14B8A6] transition-colors">{destinationName}</Link></li>
            <li aria-hidden="true">›</li>
            <li className="font-medium text-[#1F2937]" aria-current="page">{passportName} Visa Guide</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0f172a] to-[#0d9488] py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-5">
            <span className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-white/80">
              Updated May 2026
            </span>
            <span className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-white/80">
              Embassy-Verified Data
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl leading-tight">
            {passportName} to {destinationName}
            <span className="block text-[#34d399]">Visa Requirements 2026</span>
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-2xl">
            Complete guide for {passportName} passport holders planning to visit {destinationName}:
            visa type, fees, processing time, documents checklist, and how to apply.
          </p>

          {/* Quick stats — prefer verified data, fall back to legacy */}
          {primary && (
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-xl">
              {[
                {
                  label: 'Visa Type',
                  value: verifiedReq
                    ? verifiedReq.visa_category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                    : (primary.visa_type ?? 'Check embassy'),
                },
                {
                  label: 'Processing',
                  value: verifiedReq?.processing_label ?? primary.processing_time ?? 'Varies',
                },
                {
                  label: 'Fee',
                  value: verifiedReq?.fee_is_free
                    ? 'Free'
                    : verifiedReq?.fee_amount && verifiedReq?.fee_currency
                      ? `${verifiedReq.fee_currency} ${verifiedReq.fee_amount}`
                      : (primary.pricing ?? 'Pending verification'),
                },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-white/10 backdrop-blur p-4">
                  <div className="text-xs text-white/60 uppercase tracking-wider mb-1">{label}</div>
                  <div className="text-sm font-bold text-white">{value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">

        {/* Unique opening paragraph — varies by visa type */}
        <p className="text-gray-600 text-base leading-relaxed mb-10">
          {(verifiedReq?.visa_category ?? primary.visa_type?.toLowerCase()) === 'visa_free' || primary.visa_type?.toLowerCase().includes('free')
            ? `Great news for ${passportName} passport holders: ${destinationName} grants visa-free entry, meaning you can travel directly without applying for a visa in advance. This guide covers what you still need to know — including entry requirements, maximum stay duration, and documents to carry.`
            : (verifiedReq?.visa_category ?? '') === 'evisa'
            ? `${passportName} passport holders apply for a ${destinationName} eVisa online — no embassy appointment needed. The process is fully digital. Below you'll find the verified fee, documents, processing time, and the direct link to the official application portal.`
            : (verifiedReq?.visa_category ?? primary.visa_type?.toLowerCase())?.includes('arrival')
            ? `${passportName} passport holders can enter ${destinationName} with a visa on arrival, making the process straightforward — no prior embassy appointment needed. Below you'll find the complete guide covering fees, documents to carry, and important tips for a smooth arrival.`
            : `Visiting ${destinationName} as a ${passportName} passport holder requires a visa obtained before travel. This comprehensive guide walks you through every step of the application — from eligibility to approval — so you can travel with confidence.`}
        </p>

        {/* ── Verified requirements block (replaces generic fee + doc table) ── */}
        <div className="mb-12">
          <VisaRequirementsBlock
            requirement={verifiedReq}
            passportName={passportName}
            destinationName={destinationName}
            passportIso={SLUG_TO_ISO3[passportSlug.toLowerCase()] ?? ''}
            destinationIso={SLUG_TO_ISO3[destinationSlug.toLowerCase()] ?? ''}
          />
        </div>

        {/* How to apply */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#1F2937] mb-6">How to Apply</h2>
          <ol className="space-y-4">
            {[
              { step: 1, title: 'Check requirements', desc: `Verify that your ${passportName} passport is valid for at least 6 months beyond your travel dates and that you meet all eligibility criteria for the ${destinationName} visa.` },
              { step: 2, title: 'Gather documents', desc: 'Collect all required documents listed above. Ensure your bank statements show sufficient funds and your photos meet specification.' },
              { step: 3, title: 'Complete the application form', desc: `Download or access the ${destinationName} visa application form from the official embassy website. Fill it accurately — errors cause delays.` },
              { step: 4, title: 'Submit your application', desc: primary.visa_type?.toLowerCase().includes('evisa') ? `Apply online at the official ${destinationName} eVisa portal. Upload all required documents and pay the fee online.` : `Book an appointment at the ${destinationName} embassy or an authorised visa application centre (e.g., VFS Global) and attend in person with your documents.` },
              { step: 5, title: 'Track and collect', desc: `Monitor your application status. ${primary.processing_time ? `Processing typically takes ${primary.processing_time}.` : 'Processing times vary.'} Collect your visa or download the approval before travel.` },
            ].map(({ step, title, desc }) => (
              <li key={step} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#14B8A6] text-sm font-bold text-white">
                  {step}
                </div>
                <div>
                  <p className="font-semibold text-[#1F2937]">{title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Trip essentials — relevant, disclosed affiliate offers */}
        <TripEssentials
          placement="route_page"
          source={`/seo/route/${passportSlug}/${destinationSlug}`}
          destIso={(SLUG_TO_ISO3[destinationSlug.toLowerCase()] ?? '').toLowerCase()}
          passportIso={(SLUG_TO_ISO3[passportSlug.toLowerCase()] ?? '').toLowerCase()}
          subheading={`Most ${passportName} travelers to ${destinationName} sort these next — insurance may be required, and an eSIM keeps you connected on arrival.`}
        />

        {/* Internal links */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 mb-12">
          <h3 className="font-bold text-[#1F2937] mb-4">Related Guides</h3>
          <div className="flex flex-wrap gap-3">
            <Link href={`/visa/${encodeURIComponent(passportName)}/${encodeURIComponent(destinationName)}`}
              className="rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm text-teal-700 hover:bg-teal-100 transition">
              Quick Visa Check Tool →
            </Link>
            <Link href={`/visa-free-countries-for-${passportSlug}-passport`}
              className="rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700 hover:bg-green-100 transition">
              Visa-Free Countries for {passportName} →
            </Link>
            <Link href="/checklist"
              className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition">
              Document Checklist Generator →
            </Link>
            <Link href="/travel-insurance"
              className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition">
              Travel Insurance →
            </Link>
            <Link href="/embassy-finder"
              className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition">
              Embassy Finder →
            </Link>
          </div>
        </div>

        {/* FAQ section */}
        <div>
          <h2 className="text-2xl font-bold text-[#1F2937] mb-6">
            Frequently Asked Questions — {passportName} to {destinationName}
          </h2>
          <div className="space-y-4">
            {[
              {
                q: `Does a ${passportName} passport holder need a visa to visit ${destinationName}?`,
                a: primary.visa_type
                  ? `${passportName} passport holders require a ${primary.visa_type} to enter ${destinationName}.${primary.processing_time ? ` Processing time is approximately ${primary.processing_time}.` : ''}${primary.pricing ? ` Visa fee: ${primary.pricing}.` : ''}`
                  : `Visa requirements apply — verify with the official ${destinationName} embassy.`,
              },
              {
                q: `How long does it take to get a ${destinationName} visa from ${passportName}?`,
                a: primary.processing_time
                  ? `Typical processing time is ${primary.processing_time}. Apply at least 4–6 weeks before your travel date to avoid last-minute issues.`
                  : `Processing times vary by season and application volume. Check with the embassy for current timelines.`,
              },
              {
                q: `What documents do ${passportName} citizens need for a ${destinationName} visa?`,
                a: `Key documents include: valid passport, completed application form, 2 passport photos, return flight ticket, accommodation proof, bank statements, travel insurance, and proof of employment/income.`,
              },
              {
                q: `How much does a ${destinationName} visa cost for ${passportName} citizens?`,
                a: primary.pricing
                  ? `The visa fee is ${primary.pricing}. Additional service fees may apply at visa application centres.`
                  : `Contact the official ${destinationName} embassy for the current fee schedule.`,
              },
              {
                q: `Where do ${passportName} citizens apply for a ${destinationName} visa?`,
                a: primary.visa_type?.toLowerCase().includes('evisa')
                  ? `${passportName} citizens apply for the ${destinationName} eVisa online through the official government portal. No embassy visit required.`
                  : `${passportName} citizens apply at the ${destinationName} embassy or an authorised Visa Application Centre (VFS Global / BLS International). Use our Embassy Finder tool for the nearest location.`,
              },
            ].map(({ q, a }) => (
              <details key={q} className="rounded-xl border border-gray-200 bg-white">
                <summary className="cursor-pointer px-5 py-4 font-medium text-[#1F2937] text-sm">{q}</summary>
                <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
