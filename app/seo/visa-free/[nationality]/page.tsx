/**
 * Template 2 — Programmatic SEO
 * URL: /visa-free-countries-for-{nationality}-passport
 * e.g. /visa-free-countries-for-pakistani-passport
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

async function getDestinations(passportCountry: string): Promise<DestRow[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('destinations')
    .select('country_name, visa_type, processing_time, pricing')
    .ilike('passport_country', passportCountry)
    .order('country_name')
  // Throw on a Supabase ERROR so the caller can 5xx instead of 404ing the page
  // ("no rows" and "outage" must stay distinguishable).
  if (error) throw new Error(`[seo/visa-free] destinations query failed: ${error.message}`)
  // Drop rows with a missing country_name — a null here crashed the build when
  // downstream code called d.country_name.toLowerCase() during prerender.
  return ((data ?? []) as DestRow[]).filter(d => !!d.country_name)
}

async function getSeoIntro(nationality: string): Promise<string | null> {
  const supabase = getSupabase()
  const passportCountry = BY_NATIONALITY[nationality]
  if (!passportCountry) return null
  const { data } = await supabase
    .from('seo_page_content')
    .select('intro_paragraph')
    .eq('template', 'template2')
    .eq('passport_iso', passportCountry.iso3)
    .single()
  return data?.intro_paragraph ?? null
}

function classify(rows: DestRow[]) {
  const free: DestRow[] = []
  const voa: DestRow[]  = []
  const evisa: DestRow[] = []
  const required: DestRow[] = []

  for (const r of rows) {
    const t = (r.visa_type ?? '').toLowerCase()
    if (/free|no visa/i.test(t))           free.push(r)
    else if (/arrival/i.test(t))            voa.push(r)
    else if (/evisa|e-visa|electronic/i.test(t)) evisa.push(r)
    else                                    required.push(r)
  }
  return { free, voa, evisa, required }
}

// ── Passport strength data (Henley-like, approximate) ─────────────────────────
const PASSPORT_STRENGTH: Record<string, { rank: number; freeCount: number; neighbors: string[] }> = {
  PAK: { rank: 103, freeCount: 32,  neighbors: ['IND', 'BGD', 'LKA', 'NPL'] },
  IND: { rank: 82,  freeCount: 58,  neighbors: ['PAK', 'BGD', 'LKA', 'NPL'] },
  BGD: { rank: 101, freeCount: 41,  neighbors: ['IND', 'PAK', 'LKA', 'NPL'] },
  NGA: { rank: 95,  freeCount: 46,  neighbors: ['GHA', 'KEN', 'ETH', 'EGY'] },
  IDN: { rank: 70,  freeCount: 72,  neighbors: ['MYS', 'THA', 'PHL', 'SGP'] },
  PHL: { rank: 78,  freeCount: 66,  neighbors: ['IDN', 'MYS', 'THA', 'SGP'] },
  EGY: { rank: 96,  freeCount: 51,  neighbors: ['MAR', 'TUN', 'JOR', 'LBN'] },
  TUR: { rank: 53,  freeCount: 110, neighbors: ['IRN', 'IRQ', 'GEO', 'AZE'] },
  GBR: { rank: 4,   freeCount: 190, neighbors: ['DEU', 'FRA', 'IRL', 'NLD'] },
  USA: { rank: 9,   freeCount: 186, neighbors: ['CAN', 'GBR', 'AUS', 'DEU'] },
  DEU: { rank: 2,   freeCount: 193, neighbors: ['FRA', 'GBR', 'NLD', 'AUT'] },
  CAN: { rank: 7,   freeCount: 188, neighbors: ['USA', 'GBR', 'AUS', 'DEU'] },
  AUS: { rank: 8,   freeCount: 187, neighbors: ['NZL', 'GBR', 'CAN', 'USA'] },
  JPN: { rank: 1,   freeCount: 194, neighbors: ['KOR', 'SGP', 'CHN', 'MYS'] },
  KOR: { rank: 3,   freeCount: 192, neighbors: ['JPN', 'SGP', 'CHN', 'MYS'] },
  SGP: { rank: 1,   freeCount: 195, neighbors: ['MYS', 'THA', 'IDN', 'PHL'] },
  SAU: { rank: 71,  freeCount: 71,  neighbors: ['ARE', 'QAT', 'KWT', 'BHR'] },
  ARE: { rank: 15,  freeCount: 178, neighbors: ['SAU', 'QAT', 'KWT', 'BHR'] },
  CHN: { rank: 62,  freeCount: 79,  neighbors: ['JPN', 'KOR', 'THA', 'SGP'] },
  BRA: { rank: 18,  freeCount: 171, neighbors: ['ARG', 'COL', 'CHL', 'PER'] },
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: { params: Promise<{ nationality: string }> }): Promise<Metadata> {
  const { nationality } = await params
  const country = BY_NATIONALITY[nationality.toLowerCase()] ?? BY_SLUG[nationality.toLowerCase()]
  if (!country) return { title: 'Visa-Free Countries | VisitPlane' }

  const year = new Date().getFullYear()
  const title = `Visa-Free Countries for ${country.name} Passport Holders (${year})`
  const description = `Complete ${year} list: all countries ${country.name} passport holders can visit visa-free, visa on arrival, and with eVisa. Sortable by region, fee, and entry type. Updated ${new Date().toLocaleString('en', { month: 'long', year: 'numeric' })}.`
  // Resolved nationality = the form the sitemap emits; the lookup also accepts
  // country-name slugs, which would otherwise self-canonicalise as duplicates.
  const canonical = `https://www.visitplane.com/visa-free-countries-for-${country.nationality}-passport`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title, description, url: canonical, type: 'website',
      images: [`https://www.visitplane.com/api/og?passport=${nationality}&template=2`],
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function VisaFreeCountriesPage({
  params,
}: { params: Promise<{ nationality: string }> }) {
  const { nationality } = await params
  const country = BY_NATIONALITY[nationality.toLowerCase()] ?? BY_SLUG[nationality.toLowerCase()]
  if (!country) notFound()

  const year       = new Date().getFullYear()
  const updated    = new Date().toLocaleString('en', { month: 'long', year: 'numeric' })
  const strength   = PASSPORT_STRENGTH[country.iso3]

  let allDests: Awaited<ReturnType<typeof getDestinations>> = []
  let seoIntro: string | null = null
  let fetchFailed = false
  try {
    ;[allDests, seoIntro] = await Promise.all([
      getDestinations(country.name),
      getSeoIntro(nationality),
    ])
  } catch (err) {
    console.error('[VisaFreeCountriesPage] data fetch error for', nationality, err)
    fetchFailed = true
  }

  // Transient fetch failure → 5xx (retried by Google), never a 404 (deindexed).
  if (fetchFailed && allDests.length === 0) throw new Error('Visa data temporarily unavailable')
  if (allDests.length === 0) notFound()

  const { free, voa, evisa, required } = classify(allDests)
  const totalEasy = free.length + voa.length + evisa.length
  const freeCount = strength?.freeCount ?? free.length

  // Related passports for comparison
  const neighborPassports = (strength?.neighbors ?? [])
    .map(iso3 => COUNTRIES.find(c => c.iso3 === iso3))
    .filter(Boolean) as typeof COUNTRIES

  // JSON-LD
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.visitplane.com' },
      { '@type': 'ListItem', position: 2, name: 'Passport Strength', item: 'https://www.visitplane.com/passport-strength' },
      { '@type': 'ListItem', position: 3, name: `${country.name} Visa-Free`, item: `https://www.visitplane.com/visa-free-countries-for-${nationality.toLowerCase()}-passport` },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How many countries can ${country.name} passport holders visit visa-free?`,
        acceptedAnswer: { '@type': 'Answer', text: `${country.name} passport holders can access approximately ${freeCount} destinations without a pre-arranged visa, including ${free.length} fully visa-free destinations, ${voa.length} countries offering visa on arrival, and ${evisa.length} countries with eVisa options.` },
      },
      {
        '@type': 'Question',
        name: `What is the Henley Passport Index ranking for ${country.name}?`,
        acceptedAnswer: { '@type': 'Answer', text: strength ? `The ${country.name} passport ranks #${strength.rank} on the Henley Passport Index (${year}), providing access to ${strength.freeCount} destinations without a pre-arranged visa.` : `Check the Henley Passport Index website for the current ${country.name} passport ranking.` },
      },
      {
        '@type': 'Question',
        name: `Which are the best visa-free destinations for ${country.name} passport holders?`,
        acceptedAnswer: { '@type': 'Answer', text: `Popular visa-free or easy-access destinations for ${country.name} passport holders include: ${free.slice(0, 5).map(d => d.country_name).join(', ')}, and more. Check the full list above for entry conditions.` },
      },
    ],
  }

  const intro = seoIntro ?? `The ${country.name} passport gives you access to ${freeCount} destinations worldwide without needing to arrange a visa in advance — that's ${free.length} fully visa-free destinations, ${voa.length} countries offering visa on arrival, and ${evisa.length} countries with eVisa options. ${strength ? `On the Henley Passport Index ${year}, ${country.name} ranks #${strength.rank} globally.` : ''} This page lists every country you can visit, organized by entry type, so you can plan your next trip without visa hassle.`

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
            <li><Link href="/passport-strength" className="hover:text-[#14B8A6]">Passport Strength</Link></li>
            <li aria-hidden="true">›</li>
            <li className="font-medium text-[#1F2937]" aria-current="page">{country.flag} {country.name} Visa-Free</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <header className="bg-gradient-to-br from-[#0f172a] via-[#1a3050] to-[#0d9488]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-white/90">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Updated {updated}
            </span>
            {strength && (
              <span className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-white/80">
                Henley Rank #{strength.rank}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mb-5">
            <span className="text-5xl sm:text-6xl">{country.flag}</span>
            <div>
              <p className="text-white/60 text-sm uppercase tracking-wider">Passport</p>
              <p className="text-2xl font-bold text-white">{country.name}</p>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Visa-Free Countries for
            <span className="block text-[#34d399]">{country.name} Passport Holders ({year})</span>
          </h1>

          {/* Stats bar */}
          <div className="mt-8 flex flex-wrap gap-4">
            {[
              { label: 'Visa Free',      count: free.length,     color: 'bg-emerald-500' },
              { label: 'Visa on Arrival', count: voa.length,     color: 'bg-blue-500'    },
              { label: 'eVisa',          count: evisa.length,    color: 'bg-teal-500'    },
              { label: 'Visa Required',  count: required.length, color: 'bg-red-500'     },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/15 px-4 py-2.5">
                <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
                <span className="text-white/70 text-xs">{label}</span>
                <span className="text-white font-bold text-lg ml-1">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">

        {/* Intro */}
        <p className="text-gray-600 leading-relaxed mb-8 max-w-3xl">{intro}</p>

        {/* Visa-Free */}
        {free.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <h2 className="text-xl font-bold text-[#1F2937]">
                Visa-Free Destinations ({free.length})
              </h2>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 rounded-full px-2.5 py-1">No visa needed</span>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto] text-xs font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100 px-5 py-3">
                <span>Country</span>
                <span className="text-right pr-8">Processing</span>
                <span className="text-right">Visa Guide</span>
              </div>
              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {free.map(d => {
                  const dCountry = COUNTRIES.find(c => c.name.toLowerCase() === d.country_name.toLowerCase())
                  const dSlug    = dCountry?.slug ?? d.country_name.toLowerCase().replace(/\s+/g, '-')
                  return (
                    <div key={d.country_name} className="grid grid-cols-[1fr_auto_auto] items-center px-5 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{dCountry?.flag ?? '🌍'}</span>
                        <span className="text-sm font-medium text-[#1F2937]">{d.country_name}</span>
                      </div>
                      <span className="text-xs text-gray-400 text-right pr-8">{d.processing_time ?? 'Instant'}</span>
                      <Link href={`/visa-requirements-for-${nationality}-citizens-to-${dSlug}`}
                        className="text-xs text-teal-600 hover:text-teal-800 font-medium whitespace-nowrap">
                        Details →
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Visa on Arrival */}
        {voa.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-3 w-3 rounded-full bg-blue-500" />
              <h2 className="text-xl font-bold text-[#1F2937]">
                Visa on Arrival ({voa.length})
              </h2>
              <span className="text-xs text-blue-600 font-semibold bg-blue-50 rounded-full px-2.5 py-1">Apply on landing</span>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto_auto] text-xs font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100 px-5 py-3">
                <span>Country</span>
                <span className="text-right pr-4">Fee</span>
                <span className="text-right pr-8">Processing</span>
                <span className="text-right">Details</span>
              </div>
              <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                {voa.map(d => {
                  const dCountry = COUNTRIES.find(c => c.name.toLowerCase() === d.country_name.toLowerCase())
                  const dSlug    = dCountry?.slug ?? d.country_name.toLowerCase().replace(/\s+/g, '-')
                  return (
                    <div key={d.country_name} className="grid grid-cols-[1fr_auto_auto_auto] items-center px-5 py-3 hover:bg-gray-50">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{dCountry?.flag ?? '🌍'}</span>
                        <span className="text-sm font-medium text-[#1F2937]">{d.country_name}</span>
                      </div>
                      <span className="text-xs text-gray-600 font-semibold text-right pr-4">{d.pricing ?? '—'}</span>
                      <span className="text-xs text-gray-400 text-right pr-8">{d.processing_time ?? 'On arrival'}</span>
                      <Link href={`/visa-requirements-for-${nationality}-citizens-to-${dSlug}`}
                        className="text-xs text-teal-600 hover:text-teal-800 font-medium">
                        →
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* eVisa */}
        {evisa.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-3 w-3 rounded-full bg-teal-500" />
              <h2 className="text-xl font-bold text-[#1F2937]">
                eVisa Available ({evisa.length})
              </h2>
              <span className="text-xs text-teal-600 font-semibold bg-teal-50 rounded-full px-2.5 py-1">Apply online</span>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto_auto] text-xs font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100 px-5 py-3">
                <span>Country</span>
                <span className="text-right pr-4">Fee</span>
                <span className="text-right pr-8">Processing</span>
                <span className="text-right">Guide</span>
              </div>
              <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                {evisa.map(d => {
                  const dCountry = COUNTRIES.find(c => c.name.toLowerCase() === d.country_name.toLowerCase())
                  const dSlug    = dCountry?.slug ?? d.country_name.toLowerCase().replace(/\s+/g, '-')
                  return (
                    <div key={d.country_name} className="grid grid-cols-[1fr_auto_auto_auto] items-center px-5 py-3 hover:bg-gray-50">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{dCountry?.flag ?? '🌍'}</span>
                        <span className="text-sm font-medium text-[#1F2937]">{d.country_name}</span>
                      </div>
                      <span className="text-xs text-gray-600 font-semibold text-right pr-4">{d.pricing ?? '—'}</span>
                      <span className="text-xs text-gray-400 text-right pr-8">{d.processing_time ?? 'Varies'}</span>
                      <Link href={`/${dSlug}-visa-guide-for-${nationality}s`}
                        className="text-xs text-teal-600 hover:text-teal-800 font-medium">
                        →
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Decision point: the reader has just seen where they can go without a
            visa — the only remaining steps are flights and insurance. */}
        <TripEssentials
          placement="visa_free_page"
          source={`/seo/visa-free/${nationality.toLowerCase()}`}
          passportIso={country.iso3}
          heading="Ready to use that visa-free access?"
          subheading={`With no visa paperwork standing in the way, flights and travel insurance are the only things left to book.`}
          show={['flights', 'insurance']}
        />

        {/* Passport comparison */}
        {neighborPassports.length > 0 && strength && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-[#1F2937] mb-4">
              How {country.name} Compares to Neighboring Passports
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Current passport */}
              <div className="rounded-2xl border-2 border-teal-300 bg-teal-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{country.flag}</span>
                  <span className="font-bold text-teal-800 text-sm">{country.name}</span>
                </div>
                <p className="text-xs text-teal-600">Rank #{strength.rank}</p>
                <p className="text-xl font-bold text-teal-700 mt-1">{strength.freeCount}</p>
                <p className="text-xs text-teal-600">visa-free destinations</p>
              </div>
              {/* Neighbors */}
              {neighborPassports.slice(0, 3).map(nb => {
                const nbStr = PASSPORT_STRENGTH[nb.iso3]
                return (
                  <Link key={nb.iso3} href={`/visa-free-countries-for-${nb.nationality}-passport`}
                    className="rounded-2xl border border-gray-200 bg-white p-4 hover:border-teal-200 hover:bg-teal-50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{nb.flag}</span>
                      <span className="font-semibold text-[#1F2937] text-sm">{nb.name}</span>
                    </div>
                    {nbStr ? (
                      <>
                        <p className="text-xs text-gray-400">Rank #{nbStr.rank}</p>
                        <p className="text-xl font-bold text-[#1F2937] mt-1">{nbStr.freeCount}</p>
                        <p className="text-xs text-gray-400">visa-free</p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-400">See full comparison →</p>
                    )}
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Travel ideas */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#1F2937] mb-4">
            Travel Ideas Using Your Visa-Free Access
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                title: 'Weekend Escape',
                desc: free.length > 0 ? `Quick visa-free trip to ${free[0]?.country_name ?? 'a nearby destination'} — no visa paperwork needed.` : `Explore your visa-on-arrival options for a spontaneous trip.`,
                emoji: '✈️',
              },
              {
                title: 'Budget Trip',
                desc: 'Combine cheap visa destinations with low-cost-of-living countries for maximum travel on a tight budget.',
                emoji: '💰',
                link: `/cheapest-visas-from-${nationality}-passport`,
              },
              {
                title: 'Multi-Country Route',
                desc: `Chain multiple visa-free destinations into a single trip — many ${country.name} passport holders can do 3+ countries back-to-back without any visa.`,
                emoji: '🗺️',
              },
            ].map(({ title, desc, emoji, link }) => (
              <div key={title} className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="text-2xl mb-2">{emoji}</div>
                <h3 className="font-bold text-[#1F2937] mb-1">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                {link && (
                  <Link href={link} className="text-xs text-teal-600 hover:underline mt-2 inline-block">
                    See cheapest options →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#1F2937] mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              {
                q: `How many countries can ${country.name} passport holders visit visa-free?`,
                a: `${country.name} passport holders can access ${free.length} fully visa-free destinations, ${voa.length} countries with visa on arrival, and ${evisa.length} countries with eVisa options — ${totalEasy} destinations in total with easy access.`,
              },
              {
                q: `What is the ${country.name} passport ranking?`,
                a: strength
                  ? `The ${country.name} passport ranks #${strength.rank} on the Henley Passport Index (${year}), with access to ${strength.freeCount} destinations without a pre-arranged visa.`
                  : `Check the Henley Passport Index for the current ${country.name} ranking.`,
              },
              {
                q: `Which are the best visa-free countries for ${country.name} passport holders?`,
                a: `Popular easy-access destinations include: ${free.slice(0, 5).map(d => d.country_name).join(', ')}. Check each country's entry requirements as conditions can vary.`,
              },
              {
                q: `Do ${country.name} passport holders need a visa for Europe?`,
                a: `This depends on which European country. ${country.name} passport holders should check individual Schengen zone requirements. Some European countries may offer visa-free or eVisa access.`,
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
          <h3 className="font-bold text-[#1F2937] mb-4">Explore More</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { href: `/cheapest-visas-from-${nationality}-passport`, label: '💰 Cheapest Visas' },
              { href: `/visa-requirements-for-${nationality}-citizens-to-uae`, label: '🇦🇪 UAE Visa' },
              { href: `/visa-requirements-for-${nationality}-citizens-to-turkey`, label: '🇹🇷 Turkey Visa' },
              { href: `/visa-requirements-for-${nationality}-citizens-to-thailand`, label: '🇹🇭 Thailand Visa' },
              { href: '/passport-strength', label: '💪 Passport Strength' },
              { href: '/compare', label: '⚖️ Compare Passports' },
              { href: '/visa-free-map', label: '🗺️ Interactive Map' },
              { href: '/checklist', label: '✅ Document Checklist' },
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
