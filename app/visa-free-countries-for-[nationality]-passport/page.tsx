import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

// ── Nationality → passport country name map ────────────────────────────────
const NATIONALITY_TO_COUNTRY: Record<string, string> = {
  'pakistani': 'Pakistan', 'indian': 'India', 'bangladeshi': 'Bangladesh',
  'nigerian': 'Nigeria', 'ghanaian': 'Ghana', 'kenyan': 'Kenya',
  'ethiopian': 'Ethiopia', 'tanzanian': 'Tanzania', 'south-african': 'South Africa',
  'egyptian': 'Egypt', 'moroccan': 'Morocco', 'algerian': 'Algeria',
  'tunisian': 'Tunisia', 'chinese': 'China', 'japanese': 'Japan',
  'south-korean': 'South Korea', 'indonesian': 'Indonesia', 'malaysian': 'Malaysia',
  'filipino': 'Philippines', 'vietnamese': 'Vietnam', 'thai': 'Thailand',
  'cambodian': 'Cambodia', 'myanmar': 'Myanmar', 'sri-lankan': 'Sri Lanka',
  'nepali': 'Nepal', 'iranian': 'Iran', 'iraqi': 'Iraq', 'jordanian': 'Jordan',
  'lebanese': 'Lebanon', 'qatari': 'Qatar', 'kuwaiti': 'Kuwait',
  'omani': 'Oman', 'bahraini': 'Bahrain', 'saudi': 'Saudi Arabia',
  'emirati': 'UAE', 'turkish': 'Turkey', 'russian': 'Russia',
  'ukrainian': 'Ukraine', 'polish': 'Poland', 'romanian': 'Romania',
  'hungarian': 'Hungary', 'czech': 'Czechia', 'german': 'Germany',
  'french': 'France', 'italian': 'Italy', 'spanish': 'Spain',
  'portuguese': 'Portugal', 'dutch': 'Netherlands', 'belgian': 'Belgium',
  'swiss': 'Switzerland', 'austrian': 'Austria', 'swedish': 'Sweden',
  'norwegian': 'Norway', 'danish': 'Denmark', 'finnish': 'Finland',
  'greek': 'Greece', 'british': 'United Kingdom', 'american': 'United States',
  'canadian': 'Canada', 'australian': 'Australia', 'new-zealand': 'New Zealand',
  'brazilian': 'Brazil', 'argentinian': 'Argentina', 'colombian': 'Colombia',
  'chilean': 'Chile', 'peruvian': 'Peru', 'mexican': 'Mexico',
  'singaporean': 'Singapore',
}

const VISA_FREE_TYPES = ['Visa Free', 'Visa on Arrival', 'eVisa', 'Electronic Travel Authorization']

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

async function getVisaFreeDestinations(passportCountry: string) {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('destinations')
    .select('country_name, visa_type, processing_time, pricing')
    .ilike('passport_country', passportCountry)
    .order('country_name')

  if (!data) return []

  return data.filter((row) =>
    VISA_FREE_TYPES.some((t) => row.visa_type?.toLowerCase().includes(t.toLowerCase()))
  )
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ nationality: string }>
}): Promise<Metadata> {
  const { nationality } = await params
  const country = NATIONALITY_TO_COUNTRY[nationality.toLowerCase()]
  if (!country) return { title: 'Visa Free Countries | VisitPlane' }

  const title       = `Visa Free Countries for ${country} Passport Holders in 2026`
  const description = `Complete list of visa-free, visa-on-arrival, and eVisa destinations for ${country} passport holders in 2026. Updated with official requirements and entry conditions.`
  const canonical   = `https://www.visitplane.com/visa-free-countries-for-${nationality}-passport`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website' },
    twitter: { card: 'summary', title, description },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function VisaFreeCountriesPage({
  params,
}: {
  params: Promise<{ nationality: string }>
}) {
  const { nationality } = await params
  const country = NATIONALITY_TO_COUNTRY[nationality.toLowerCase()]
  if (!country) notFound()

  const destinations = await getVisaFreeDestinations(country)

  const visaFree      = destinations.filter((d) => d.visa_type?.toLowerCase().includes('visa free'))
  const visaOnArrival = destinations.filter((d) => d.visa_type?.toLowerCase().includes('visa on arrival'))
  const eVisa         = destinations.filter((d) =>
    d.visa_type?.toLowerCase().includes('evisa') || d.visa_type?.toLowerCase().includes('e-visa') ||
    d.visa_type?.toLowerCase().includes('electronic')
  )

  // FAQ + BreadcrumbList schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How many countries can ${country} passport holders visit without a visa?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${country} passport holders can visit approximately ${visaFree.length} destinations visa-free, plus ${visaOnArrival.length} destinations with visa on arrival and ${eVisa.length} countries with an easy eVisa. The total hassle-free access count is ${visaFree.length + visaOnArrival.length + eVisa.length} destinations.`,
        },
      },
      {
        '@type': 'Question',
        name: `Which countries offer visa on arrival to ${country} passport holders?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: visaOnArrival.length > 0
            ? `Countries offering visa on arrival to ${country} passport holders include: ${visaOnArrival.slice(0, 10).map((d) => d.country_name).join(', ')}${visaOnArrival.length > 10 ? ` and ${visaOnArrival.length - 10} more` : ''}.`
            : `Please check the full list above for current visa on arrival options for ${country} passport holders.`,
        },
      },
      {
        '@type': 'Question',
        name: `Can ${country} passport holders get an eVisa easily?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. ${eVisa.length} countries offer eVisa access to ${country} passport holders, allowing you to apply online before travel without visiting an embassy. Popular eVisa destinations include ${eVisa.slice(0, 5).map((d) => d.country_name).join(', ')}.`,
        },
      },
    ],
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.visitplane.com' },
      { '@type': 'ListItem', position: 2, name: 'Passport Strength', item: 'https://www.visitplane.com/passport-strength' },
      { '@type': 'ListItem', position: 3, name: `${country} Passport`, item: `https://www.visitplane.com/visa-free-countries-for-${nationality}-passport` },
    ],
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2937] antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-1.5 py-2.5 text-xs text-gray-400 flex-wrap">
            <li><Link href="/" className="hover:text-[#14B8A6] transition-colors">Home</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link href="/passport-strength" className="hover:text-[#14B8A6] transition-colors">Passport Strength</Link></li>
            <li aria-hidden="true">›</li>
            <li className="font-medium text-[#1F2937]" aria-current="page">Visa-Free Countries for {country}</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0f172a] to-[#0d9488] py-16 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Visa-Free Countries for <span className="text-[#34d399]">{country} Passport</span> Holders
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
            {country} passport holders have access to{' '}
            <strong className="text-white">{visaFree.length + visaOnArrival.length + eVisa.length} destinations</strong>{' '}
            without a prior visa appointment — including {visaFree.length} fully visa-free countries.
            Updated May 2026.
          </p>
          {/* Stats bar */}
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { label: 'Visa Free', count: visaFree.length, color: 'bg-green-500' },
              { label: 'Visa on Arrival', count: visaOnArrival.length, color: 'bg-blue-500' },
              { label: 'eVisa', count: eVisa.length, color: 'bg-purple-500' },
            ].map(({ label, count, color }) => (
              <div key={label} className="rounded-2xl bg-white/10 backdrop-blur p-4">
                <div className={`w-3 h-3 rounded-full ${color} mx-auto mb-2`} />
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs text-white/70">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">

        {/* Unique opening paragraph */}
        <p className="text-gray-600 text-base leading-relaxed mb-10">
          Holding a <strong>{country} passport</strong> gives you hassle-free access to{' '}
          <strong>{visaFree.length + visaOnArrival.length + eVisa.length} countries</strong> around the world — either
          without any advance visa, via a quick visa on arrival, or through a simple online eVisa. Below you'll find
          the complete breakdown, with direct links to full requirements for each destination.
        </p>

        {/* Section: Visa Free */}
        {visaFree.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#1F2937] mb-1">✅ Visa-Free Destinations ({visaFree.length})</h2>
            <p className="text-sm text-gray-500 mb-5">{country} passport holders can enter these countries with no visa required.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {visaFree.map((d) => (
                <Link
                  key={d.country_name}
                  href={`/visa/${encodeURIComponent(country)}/${encodeURIComponent(d.country_name)}`}
                  className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-[#1F2937] hover:border-green-300 hover:bg-green-100 transition"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  {d.country_name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Section: Visa on Arrival */}
        {visaOnArrival.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#1F2937] mb-1">🛬 Visa on Arrival ({visaOnArrival.length})</h2>
            <p className="text-sm text-gray-500 mb-5">Get your visa at the airport or border — no appointment needed.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {visaOnArrival.map((d) => (
                <Link
                  key={d.country_name}
                  href={`/visa/${encodeURIComponent(country)}/${encodeURIComponent(d.country_name)}`}
                  className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-[#1F2937] hover:border-blue-300 hover:bg-blue-100 transition"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  {d.country_name}
                  {d.pricing && <span className="ml-auto text-xs text-gray-400">{d.pricing}</span>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Section: eVisa */}
        {eVisa.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#1F2937] mb-1">💻 eVisa Countries ({eVisa.length})</h2>
            <p className="text-sm text-gray-500 mb-5">Apply online before you travel — no embassy visit required.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {eVisa.map((d) => (
                <Link
                  key={d.country_name}
                  href={`/visa/${encodeURIComponent(country)}/${encodeURIComponent(d.country_name)}`}
                  className="flex items-center gap-3 rounded-xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm font-medium text-[#1F2937] hover:border-purple-300 hover:bg-purple-100 transition"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                  {d.country_name}
                  {d.processing_time && <span className="ml-auto text-xs text-gray-400">{d.processing_time}</span>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Internal links */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 mt-10">
          <h3 className="font-bold text-[#1F2937] mb-4">Related Guides for {country} Passport Holders</h3>
          <div className="flex flex-wrap gap-3">
            <Link href={`/visa-requirements-for-${nationality}-citizens`}
              className="rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm text-teal-700 hover:bg-teal-100 transition">
              All Visa Requirements →
            </Link>
            <Link href={`/cheapest-visa-from-${nationality}-passport`}
              className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700 hover:bg-amber-100 transition">
              Cheapest Visa Destinations →
            </Link>
            <Link href="/passport-strength"
              className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition">
              Passport Strength Ranking →
            </Link>
            <Link href="/compare"
              className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition">
              Compare Passports →
            </Link>
          </div>
        </div>

        {/* FAQ section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-[#1F2937] mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: `How many countries can ${country} passport holders visit without a visa?`,
                a: `${country} passport holders have access to ${visaFree.length + visaOnArrival.length + eVisa.length} destinations without a prior visa appointment — ${visaFree.length} fully visa-free, ${visaOnArrival.length} visa on arrival, and ${eVisa.length} with online eVisa.`,
              },
              {
                q: `Which is the easiest visa destination for ${country} passport holders?`,
                a: `Countries offering visa on arrival or eVisa are the easiest to visit. ${visaOnArrival.length > 0 ? `Top visa-on-arrival destinations for ${country} include ${visaOnArrival.slice(0, 3).map((d) => d.country_name).join(', ')}.` : ''}`,
              },
              {
                q: `Does ${country} passport strength ranking affect which countries I can visit?`,
                a: `Yes. Passport strength is determined by how many countries grant visa-free or visa-on-arrival access. ${country} passport holders currently have access to ${visaFree.length + visaOnArrival.length + eVisa.length} easy-access destinations. Check our Passport Strength Ranking for the global comparison.`,
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
