/**
 * Template 3 — Programmatic SEO
 * URL: /cheapest-visas-from-{nationality}-passport
 * e.g. /cheapest-visas-from-pakistani-passport
 *
 * ISR: revalidated every 7 days
 * Count: 197 pages
 */
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BY_NATIONALITY, BY_SLUG, COUNTRIES } from '@/lib/seo/countries'
import TripEssentials from '@/components/affiliate/TripEssentials'

// ISR: 24h edge cache per page. Empty generateStaticParams = nothing prerenders
// at build (build-time prerender crashed Next 16 on occasional null/dirty
// Supabase rows); pages generate on first request and are then served cached.
export const revalidate = 86400
export async function generateStaticParams() {
  return []
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

type DestRow = {
  country_name: string
  visa_type: string
  processing_time: string | null
  pricing: string | null
}

function parsePrice(pricing: string | null): number {
  if (!pricing) return Infinity
  const lower = pricing.toLowerCase()
  if (/free|no visa|visa.free/i.test(lower) || lower === '0') return 0
  const m = pricing.match(/[\d.]+/)
  return m ? parseFloat(m[0]) : Infinity
}

async function getCheapestDestinations(passportCountry: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('destinations')
    .select('country_name, visa_type, processing_time, pricing')
    .ilike('passport_country', passportCountry)
    .order('country_name')
  // Throw on a Supabase ERROR so the caller can 5xx instead of 404ing the page
  // ("no rows" and "outage" must stay distinguishable).
  if (error) throw new Error(`[seo/cheapest] destinations query failed: ${error.message}`)
  if (!data) return []
  return (data as DestRow[])
    // Drop rows with a missing country_name — a null here crashed the build
    // when downstream code called d.country_name.toLowerCase() during prerender.
    .filter(d => !!d.country_name)
    .map(d => ({ ...d, parsedPrice: parsePrice(d.pricing) }))
    .sort((a, b) => a.parsedPrice - b.parsedPrice)
}

async function getSeoIntro(passportIso: string): Promise<string | null> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('seo_page_content')
    .select('intro_paragraph')
    .eq('template', 'template3')
    .eq('passport_iso', passportIso)
    .single()
  return data?.intro_paragraph ?? null
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: { params: Promise<{ nationality: string }> }): Promise<Metadata> {
  const { nationality } = await params
  const country = BY_NATIONALITY[nationality.toLowerCase()] ?? BY_SLUG[nationality.toLowerCase()]
  if (!country) return { title: 'Cheapest Visa Destinations | VisitPlane' }

  const year = new Date().getFullYear()
  const title = `Cheapest Visa Destinations for ${country.name} Passport Holders (${year})`
  const description = `Top 30 cheapest countries to visit on a ${country.name} passport, sorted by visa fee. Includes free-entry destinations, cheap visa on arrival, and affordable eVisa options. Updated ${new Date().toLocaleString('en', { month: 'long', year: 'numeric' })}.`
  const canonical = `https://www.visitplane.com/cheapest-visas-from-${nationality.toLowerCase()}-passport`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title, description, url: canonical, type: 'website',
      images: [`https://www.visitplane.com/api/og?passport=${nationality}&template=3`],
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function CheapestVisasPage({
  params,
}: { params: Promise<{ nationality: string }> }) {
  const { nationality } = await params
  const country = BY_NATIONALITY[nationality.toLowerCase()] ?? BY_SLUG[nationality.toLowerCase()]
  if (!country) notFound()

  const year    = new Date().getFullYear()
  const updated = new Date().toLocaleString('en', { month: 'long', year: 'numeric' })

  let allDests: Awaited<ReturnType<typeof getCheapestDestinations>> = []
  let seoIntro: string | null = null
  let fetchFailed = false
  try {
    ;[allDests, seoIntro] = await Promise.all([
      getCheapestDestinations(country.name),
      getSeoIntro(country.iso3),
    ])
  } catch (err) {
    console.error('[CheapestVisasPage] data fetch error for', nationality, err)
    fetchFailed = true
  }

  // Transient fetch failure → 5xx (retried by Google), never a 404 (deindexed).
  if (fetchFailed && allDests.length === 0) throw new Error('Visa data temporarily unavailable')
  if (allDests.length === 0) notFound()

  const top30   = allDests.slice(0, 30)
  const freeOnes = top30.filter(d => d.parsedPrice === 0)
  const paidOnes = top30.filter(d => d.parsedPrice > 0 && d.parsedPrice !== Infinity)
  const cheapestPaid = paidOnes[0]

  const intro = seoIntro ?? `Traveling on a ${country.name} passport doesn't have to be expensive. ${freeOnes.length > 0 ? `You can enter ${freeOnes.length} countries completely free — no visa fee at all.` : ''} ${cheapestPaid ? `The cheapest paid visa starts at just ${cheapestPaid.pricing} for ${cheapestPaid.country_name}.` : ''} This page ranks every accessible destination by visa cost, so you can maximize your travel budget. All prices are the official government fee — not third-party service charges.`

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.visitplane.com' },
      { '@type': 'ListItem', position: 2, name: 'Destinations', item: 'https://www.visitplane.com/destinations' },
      { '@type': 'ListItem', position: 3, name: `Cheapest Visas for ${country.name}`, item: `https://www.visitplane.com/cheapest-visas-from-${nationality.toLowerCase()}-passport` },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the cheapest country to visit on a ${country.name} passport?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: freeOnes.length > 0
            ? `${country.name} passport holders can visit ${freeOnes.length} countries completely free (no visa fee), including ${freeOnes.slice(0, 3).map(d => d.country_name).join(', ')}.`
            : cheapestPaid
            ? `The cheapest visa for ${country.name} passport holders is for ${cheapestPaid.country_name} at ${cheapestPaid.pricing}.`
            : `Check the full list above for current cheapest destinations.`,
        },
      },
      {
        '@type': 'Question',
        name: `Which countries offer free entry for ${country.name} passport holders?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: freeOnes.length > 0
            ? `${country.name} passport holders can enter these countries without any visa fee: ${freeOnes.map(d => d.country_name).join(', ')}.`
            : `Check the full list for no-fee destinations.`,
        },
      },
    ],
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2937] antialiased">

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-1.5 py-2.5 text-xs text-gray-400 flex-wrap">
            <li><Link href="/" className="hover:text-[#14B8A6]">Home</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link href="/destinations" className="hover:text-[#14B8A6]">Destinations</Link></li>
            <li aria-hidden="true">›</li>
            <li className="font-medium text-[#1F2937]">Cheapest Visas — {country.flag} {country.name}</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <header className="bg-gradient-to-br from-[#0f172a] via-[#1c2e1c] to-[#047857]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-white/90">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Updated {updated}
            </span>
            <span className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-white/80">
              💰 Budget Travel
            </span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{country.flag}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Cheapest Visa Destinations for
            <span className="block text-[#6ee7b7]">{country.name} in {year}</span>
          </h1>
          <p className="mt-3 text-white/70 max-w-xl">
            Sorted by official government visa fee — lowest first. {freeOnes.length > 0 && `${freeOnes.length} free destinations included.`}
          </p>

          {/* Summary stats */}
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { label: 'Free Entry',    value: `${freeOnes.length} countries`, color: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' },
              { label: 'Under $25',     value: `${paidOnes.filter(d => d.parsedPrice < 25).length} countries`, color: 'bg-green-500/20 text-green-200 border-green-500/30' },
              { label: 'Under $50',     value: `${paidOnes.filter(d => d.parsedPrice < 50).length} countries`, color: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`rounded-xl border px-4 py-2 ${color}`}>
                <p className="text-xs opacity-80">{label}</p>
                <p className="font-bold text-sm">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">

        {/* Intro */}
        <p className="text-gray-600 leading-relaxed mb-8 max-w-3xl">{intro}</p>

        {/* Main sorted table */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#1F2937] mb-4">
            Top {top30.length} Cheapest Destinations — Sorted by Visa Fee
          </h2>
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto] text-xs font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100 px-4 py-3 gap-3">
              <span>#</span>
              <span>Country</span>
              <span className="text-right">Visa Type</span>
              <span className="text-right pr-4">Fee</span>
              <span className="text-right">Details</span>
            </div>
            <div className="divide-y divide-gray-100">
              {top30.map((d, i) => {
                const dCountry  = COUNTRIES.find(c => c.name.toLowerCase() === d.country_name.toLowerCase())
                const dSlug     = dCountry?.slug ?? d.country_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                const isFree    = d.parsedPrice === 0
                const isUnder25 = d.parsedPrice > 0 && d.parsedPrice < 25
                const priceDisplay = isFree ? 'FREE' : d.pricing ?? '—'

                return (
                  <div key={d.country_name} className={`grid grid-cols-[auto_1fr_auto_auto_auto] items-center px-4 py-3 gap-3 hover:bg-gray-50 transition-colors ${i === 0 ? 'bg-emerald-50/50' : ''}`}>
                    <span className={`text-xs font-bold w-6 text-center rounded-full ${isFree ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {i + 1}
                    </span>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{dCountry?.flag ?? '🌍'}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1F2937] truncate">{d.country_name}</p>
                        {d.processing_time && (
                          <p className="text-[11px] text-gray-400 truncate">{d.processing_time}</p>
                        )}
                      </div>
                    </div>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                      isFree ? 'bg-emerald-100 text-emerald-700' :
                      /arrival/i.test(d.visa_type ?? '') ? 'bg-blue-100 text-blue-700' :
                      /evisa/i.test(d.visa_type ?? '') ? 'bg-teal-100 text-teal-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {d.visa_type?.replace(/electronic travel authorization/i, 'ETA') ?? '—'}
                    </span>
                    <span className={`text-sm font-bold text-right pr-4 shrink-0 ${isFree ? 'text-emerald-600' : isUnder25 ? 'text-green-600' : 'text-[#1F2937]'}`}>
                      {priceDisplay}
                    </span>
                    <Link
                      href={`/visa-requirements-for-${nationality}-citizens-to-${dSlug}`}
                      className="text-xs text-teal-600 hover:text-teal-800 font-medium shrink-0"
                    >
                      →
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            * Official government fee only. Third-party service charges not included. Fees change — verify before applying.
          </p>
        </section>

        {/* Budget tips */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#1F2937] mb-4">Budget Travel Tips for {country.name} Passport Holders</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: 'Stack free destinations',
                desc: `If you have ${freeOnes.length} free destinations, chain them — travel overland between them and pay zero in visa fees. Southeast Asia and parts of Africa offer excellent free-entry routes.`,
                emoji: '🔗',
              },
              {
                title: 'Time your eVisa applications',
                desc: 'eVisa processing is often faster than you think — but always apply 2 weeks early. A rushed application during peak season (Eid, summer, Christmas) can cost you..',
                emoji: '⏱️',
              },
              {
                title: 'Avoid VAC service charges',
                desc: 'Apply directly at the official embassy portal whenever possible. Visa Application Centres (VFS, BLS) add USD 15–50 in service fees on top of the government fee.',
                emoji: '💡',
              },
              {
                title: 'Low visa fee ≠ cheap trip',
                desc: 'Factor in flights, accommodation, and daily costs. A $20 visa to an expensive city can cost more than a $50 visa to a budget-friendly destination.',
                emoji: '🧮',
                link: '/cost-calculator',
              },
            ].map(({ title, desc, emoji, link }) => (
              <div key={title} className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="text-2xl mb-2">{emoji}</div>
                <h3 className="font-bold text-[#1F2937] mb-1 text-sm">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                {link && <Link href={link} className="text-xs text-teal-600 hover:underline mt-2 inline-block">Use cost calculator →</Link>}
              </div>
            ))}
          </div>
        </section>

        {/* Trip essentials — relevant, disclosed affiliate offers */}
        <TripEssentials
          placement="cheapest_page"
          source={`/seo/cheapest/${nationality}`}
          passportIso={country.iso3?.toLowerCase()}
          subheading={`Travelers on a ${country.name} passport book these next — insurance is required for Schengen, and an eSIM saves on roaming.`}
        />

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#1F2937] mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              {
                q: `What is the cheapest country for ${country.name} passport holders to visit?`,
                a: freeOnes.length > 0
                  ? `The cheapest destinations for ${country.name} passport holders are the ${freeOnes.length} countries with free entry: ${freeOnes.slice(0, 5).map(d => d.country_name).join(', ')} and more. No visa fee at all.`
                  : cheapestPaid
                  ? `The cheapest visa for ${country.name} passport holders is ${cheapestPaid.pricing} for ${cheapestPaid.country_name}.`
                  : 'See the ranked list above for current cheapest options.',
              },
              {
                q: `How can ${country.name} passport holders travel on a budget?`,
                a: `Focus on visa-free and visa-on-arrival destinations to eliminate upfront visa costs. Combine low-fee visas with budget destinations in Southeast Asia, Eastern Europe, and parts of Africa for maximum travel value.`,
              },
              {
                q: `Are visa fees the only cost to budget for?`,
                a: `No. Total visa-related costs include: government fee, VAC service charge (USD 15–50), travel insurance (required for many visas), possible biometric fee, and notarization costs. Always budget 2–3× the listed visa fee for total costs.`,
              },
              {
                q: `Do visa fees change?`,
                a: `Yes. Governments revise fees periodically. Always verify the current fee at the official embassy or eVisa portal before submitting your application. Fees shown here are sourced from official channels but may lag by days to weeks.`,
              },
            ].map(({ q, a }) => (
              <details key={q} className="group rounded-xl border border-gray-200 bg-white">
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-medium text-[#1F2937] text-sm gap-4">
                  <span>{q}</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform shrink-0">▾</span>
                </summary>
                <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Internal links */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="font-bold text-[#1F2937] mb-3">Related Pages</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { href: `/visa-free-countries-for-${nationality}-passport`, label: '🌍 All Visa-Free Countries' },
              { href: `/visa-requirements-for-${nationality}-citizens-to-uae`, label: '🇦🇪 UAE Visa' },
              { href: `/visa-requirements-for-${nationality}-citizens-to-turkey`, label: '🇹🇷 Turkey Visa' },
              { href: `/visa-requirements-for-${nationality}-citizens-to-thailand`, label: '🇹🇭 Thailand Visa' },
              { href: '/cost-calculator', label: '🧮 Cost Calculator' },
              { href: '/checklist', label: '✅ Document Checklist' },
              { href: '/travel-insurance', label: '🛡️ Travel Insurance' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="rounded-full border border-gray-200 bg-gray-50 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 px-4 py-2 text-xs font-medium text-gray-600 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
