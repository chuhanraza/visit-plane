import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

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

// Parse price string to a number for sorting (returns Infinity if unparseable)
function parsePrice(pricing: string | null): number {
  if (!pricing) return Infinity
  const lower = pricing.toLowerCase()
  if (lower.includes('free') || lower === '0' || lower === '$0') return 0
  const match = pricing.match(/[\d.]+/)
  return match ? parseFloat(match[0]) : Infinity
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

async function getCheapestDestinations(passportCountry: string) {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('destinations')
    .select('country_name, visa_type, processing_time, pricing')
    .ilike('passport_country', passportCountry)
    .order('country_name')

  if (!data) return []

  return data
    .map((d) => ({ ...d, parsedPrice: parsePrice(d.pricing) }))
    .sort((a, b) => a.parsedPrice - b.parsedPrice)
    .slice(0, 30)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ nationality: string }>
}): Promise<Metadata> {
  const { nationality } = await params
  const country = NATIONALITY_TO_COUNTRY[nationality.toLowerCase()]
  if (!country) return { title: 'Cheapest Visa Destinations | VisitPlane' }

  const title       = `Cheapest Visa Destinations for ${country} Passport Holders (2026)`
  const description = `Top 30 cheapest countries to visit on a ${country} passport, sorted by visa fee. Includes free-entry destinations, cheap visa on arrival and affordable eVisa options. Updated May 2026.`
  const canonical   = `https://www.visitplane.com/cheapest-visa-from-${nationality}-passport`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website' },
    twitter: { card: 'summary', title, description },
  }
}

export default async function CheapestVisaPage({
  params,
}: {
  params: Promise<{ nationality: string }>
}) {
  const { nationality } = await params
  const country = NATIONALITY_TO_COUNTRY[nationality.toLowerCase()]
  if (!country) notFound()

  const destinations = await getCheapestDestinations(country)

  const free = destinations.filter((d) => d.parsedPrice === 0)
  const paid = destinations.filter((d) => d.parsedPrice > 0 && d.parsedPrice < Infinity)

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the cheapest country to visit on a ${country} passport?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: free.length > 0
            ? `The cheapest destinations for ${country} passport holders are those with no visa fee at all — including ${free.slice(0, 5).map((d) => d.country_name).join(', ')}. These countries either grant visa-free entry or offer a free visa on arrival.`
            : `The cheapest visa destination for ${country} passport holders is ${destinations[0]?.country_name} with a fee of approximately ${destinations[0]?.pricing}.`,
        },
      },
      {
        '@type': 'Question',
        name: `Can ${country} passport holders travel on a budget internationally?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. ${country} passport holders have access to ${free.length} free-entry destinations and ${paid.length} low-cost visa destinations. Southeast Asia, parts of Africa, and several Middle Eastern countries offer very affordable visa options.`,
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
      { '@type': 'ListItem', position: 3, name: `Cheapest Visa from ${country}`, item: `https://www.visitplane.com/cheapest-visa-from-${nationality}-passport` },
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
            <li className="font-medium text-[#1F2937]" aria-current="page">Cheapest Visa from {country}</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0f172a] to-[#0d9488] py-14 text-white text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Cheapest Visa Destinations for{' '}
            <span className="text-[#34d399]">{country} Passport</span>
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
            Top {destinations.length} destinations sorted by visa cost — from free entry to lowest fees.
            Budget-travel intelligence for {country} passport holders. Updated May 2026.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="rounded-full bg-white/10 backdrop-blur px-5 py-2 text-sm font-medium">
              🆓 Free Entry: <strong>{free.length}</strong>
            </div>
            <div className="rounded-full bg-white/10 backdrop-blur px-5 py-2 text-sm font-medium">
              💰 Paid Visa: <strong>{paid.length}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">

        <p className="text-gray-600 text-base leading-relaxed mb-10">
          Planning an international trip on a budget? Here are the <strong>cheapest countries to visit</strong> on
          a <strong>{country} passport</strong>, sorted from free entry to the lowest visa fees available.
          Click any destination for full requirements including documents, processing time, and embassy details.
        </p>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left font-semibold text-gray-500">#</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Country</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Visa Type</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Fee</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Processing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {destinations.map((d, i) => (
                <tr key={d.country_name} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/visa/${encodeURIComponent(country)}/${encodeURIComponent(d.country_name)}`}
                      className="font-medium text-[#1F2937] hover:text-[#14B8A6] transition"
                    >
                      {d.country_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{d.visa_type ?? '—'}</td>
                  <td className="px-4 py-3">
                    {d.parsedPrice === 0 ? (
                      <span className="font-semibold text-green-600">FREE</span>
                    ) : d.pricing ? (
                      <span className="font-semibold text-[#1F2937]">{d.pricing}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{d.processing_time ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Related links */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 mt-10">
          <h3 className="font-bold text-[#1F2937] mb-4">More Tools for {country} Travelers</h3>
          <div className="flex flex-wrap gap-3">
            <Link href={`/visa-free-countries-for-${nationality}-passport`}
              className="rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700 hover:bg-green-100 transition">
              All Visa-Free Countries →
            </Link>
            <Link href={`/visa-requirements-for-${nationality}-citizens`}
              className="rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm text-teal-700 hover:bg-teal-100 transition">
              Full Requirements Matrix →
            </Link>
            <Link href="/cost-calculator"
              className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition">
              Visa Cost Calculator →
            </Link>
            <Link href="/travel-insurance"
              className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition">
              Travel Insurance →
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-[#1F2937] mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: `What is the cheapest country to visit on a ${country} passport?`,
                a: free.length > 0
                  ? `Destinations with no visa fee include ${free.slice(0, 5).map((d) => d.country_name).join(', ')}. These grant free visa-free or free visa-on-arrival entry to ${country} passport holders.`
                  : `The cheapest destination is ${destinations[0]?.country_name} with a fee of ${destinations[0]?.pricing}.`,
              },
              {
                q: `How can I travel cheaply on a ${country} passport?`,
                a: `Focus on visa-free destinations (${free.length} available) or low-cost eVisa countries. Southeast Asia, parts of Africa, and the Caribbean often offer affordable or free entry for ${country} passport holders.`,
              },
              {
                q: `Do ${country} passport holders pay visa fees everywhere?`,
                a: `No. ${country} passport holders can enter ${free.length} destinations completely free. For other countries, visa fees vary — from a few dollars to over $100 for premium destinations like the USA or UK.`,
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
