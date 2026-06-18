import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

// DB/param-dependent route — render on demand (avoids Next 16 empty-param prerender crash).
export const dynamic = 'force-dynamic'

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

const VISA_TYPE_BADGE: Record<string, { label: string; classes: string }> = {
  'visa free':            { label: 'Visa Free',        classes: 'bg-green-100 text-green-700 border-green-200' },
  'visa on arrival':      { label: 'Visa on Arrival',  classes: 'bg-blue-100 text-blue-700 border-blue-200' },
  'evisa':                { label: 'eVisa',             classes: 'bg-purple-100 text-purple-700 border-purple-200' },
  'e-visa':               { label: 'eVisa',             classes: 'bg-purple-100 text-purple-700 border-purple-200' },
  'electronic travel':    { label: 'eTA',               classes: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  'required':             { label: 'Visa Required',     classes: 'bg-red-100 text-red-700 border-red-200' },
  'not required':         { label: 'Visa Free',         classes: 'bg-green-100 text-green-700 border-green-200' },
}

function getVisaBadge(visaType: string | null) {
  if (!visaType) return { label: 'Check Requirements', classes: 'bg-gray-100 text-gray-600 border-gray-200' }
  const lower = visaType.toLowerCase()
  for (const [key, val] of Object.entries(VISA_TYPE_BADGE)) {
    if (lower.includes(key)) return val
  }
  return { label: visaType, classes: 'bg-gray-100 text-gray-600 border-gray-200' }
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

async function getAllRequirements(passportCountry: string) {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('destinations')
    .select('country_name, visa_type, processing_time, pricing')
    .ilike('passport_country', passportCountry)
    .order('country_name')
  return data ?? []
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ nationality: string }>
}): Promise<Metadata> {
  const { nationality } = await params
  const country = NATIONALITY_TO_COUNTRY[nationality.toLowerCase()]
  if (!country) return { title: 'Visa Requirements | VisitPlane' }

  const title       = `Visa Requirements for ${country} Citizens — All 197 Countries (2026)`
  const description = `Complete visa requirements matrix for ${country} citizens. Find out which countries require a visa, which are visa-free, and where you can get a visa on arrival or eVisa. Updated May 2026.`
  const canonical   = `https://www.visitplane.com/visa-requirements-for-${nationality}-citizens`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website' },
    twitter: { card: 'summary', title, description },
  }
}

export default async function VisaRequirementsForNationalityPage({
  params,
}: {
  params: Promise<{ nationality: string }>
}) {
  const { nationality } = await params
  const country = NATIONALITY_TO_COUNTRY[nationality.toLowerCase()]
  if (!country) notFound()

  let destinations: Awaited<ReturnType<typeof getAllRequirements>> = []
  try {
    destinations = await getAllRequirements(country)
  } catch (err) {
    console.error('[VisaRequirementsForNationalityPage] data fetch error for', nationality, err)
  }

  const grouped: Record<string, typeof destinations> = {}
  for (const d of destinations) {
    const badge = getVisaBadge(d.visa_type)
    if (!grouped[badge.label]) grouped[badge.label] = []
    grouped[badge.label].push(d)
  }

  // Sort categories by priority
  const categoryOrder = ['Visa Free', 'Visa on Arrival', 'eVisa', 'eTA', 'Visa Required', 'Check Requirements']
  const sortedCategories = categoryOrder.filter((c) => grouped[c]?.length > 0)

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Do ${country} citizens need a visa to travel internationally?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `It depends on the destination. ${country} citizens can visit ${grouped['Visa Free']?.length ?? 0} countries visa-free, ${grouped['Visa on Arrival']?.length ?? 0} with a visa on arrival, and ${grouped['eVisa']?.length ?? 0} countries with an eVisa. A visa is required for ${grouped['Visa Required']?.length ?? 0} destinations.`,
        },
      },
      {
        '@type': 'Question',
        name: `Which countries require a visa for ${country} citizens?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${country} citizens need a pre-approved visa to enter ${grouped['Visa Required']?.length ?? 0} countries. These include popular destinations like the USA, UK, Canada, and Schengen countries (depending on passport). Always check the most recent requirements before booking.`,
        },
      },
    ],
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.visitplane.com' },
      { '@type': 'ListItem', position: 2, name: 'Visa Requirements', item: 'https://www.visitplane.com/visa-requirements' },
      { '@type': 'ListItem', position: 3, name: `${country} Citizens`, item: `https://www.visitplane.com/visa-requirements-for-${nationality}-citizens` },
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
            <li><Link href="/visa-requirements" className="hover:text-[#14B8A6] transition-colors">Visa Requirements</Link></li>
            <li aria-hidden="true">›</li>
            <li className="font-medium text-[#1F2937]" aria-current="page">{country} Citizens</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0f172a] to-[#0d9488] py-14 text-white text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Visa Requirements for{' '}
            <span className="text-[#34d399]">{country} Citizens</span>
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
            Complete requirements matrix for all {destinations.length} destinations. Updated May 2026.
          </p>
          {/* Summary badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {sortedCategories.map((cat) => (
              <div key={cat} className="rounded-full bg-white/10 backdrop-blur px-5 py-2 text-sm font-medium">
                {cat}: <strong>{grouped[cat].length}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">

        <p className="text-gray-600 text-base leading-relaxed mb-10">
          This page lists visa requirements for all countries accessible to <strong>{country} citizens</strong>.
          Click any destination to see the full requirements — including fees, processing time, required documents,
          and embassy contact information. Data is sourced from official embassies and updated regularly.
        </p>

        {sortedCategories.map((category) => (
          <section key={category} className="mb-12">
            <h2 className="text-2xl font-bold text-[#1F2937] mb-1">
              {category} ({grouped[category].length} countries)
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              {category === 'Visa Free' && `No visa needed. ${country} citizens can enter freely.`}
              {category === 'Visa on Arrival' && 'Get your visa when you land — bring cash and passport photos.'}
              {category === 'eVisa' && 'Apply online before travel — no embassy visit required.'}
              {category === 'Visa Required' && `${country} citizens must apply for a visa in advance.`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {grouped[category].map((d) => {
                const badge = getVisaBadge(d.visa_type)
                return (
                  <Link
                    key={d.country_name}
                    href={`/visa/${encodeURIComponent(country)}/${encodeURIComponent(d.country_name)}`}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm hover:border-[#14B8A6]/40 hover:shadow-sm transition"
                  >
                    <span className="font-medium text-[#1F2937]">{d.country_name}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${badge.classes}`}>
                      {badge.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>
        ))}

        {/* Related links */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 mt-10">
          <h3 className="font-bold text-[#1F2937] mb-4">More for {country} Passport Holders</h3>
          <div className="flex flex-wrap gap-3">
            <Link href={`/visa-free-countries-for-${nationality}-passport`}
              className="rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700 hover:bg-green-100 transition">
              Visa-Free Countries →
            </Link>
            <Link href={`/cheapest-visa-from-${nationality}-passport`}
              className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700 hover:bg-amber-100 transition">
              Cheapest Visa Destinations →
            </Link>
            <Link href="/checklist"
              className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition">
              Visa Document Checklist →
            </Link>
            <Link href="/embassy-finder"
              className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition">
              Embassy Finder →
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-[#1F2937] mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: `Do ${country} citizens need a visa to travel internationally?`,
                a: `It depends on the destination. ${country} citizens can visit ${grouped['Visa Free']?.length ?? 0} countries visa-free, ${grouped['Visa on Arrival']?.length ?? 0} with a visa on arrival, and ${(grouped['eVisa']?.length ?? 0) + (grouped['eTA']?.length ?? 0)} countries with an eVisa or eTA.`,
              },
              {
                q: `How do I apply for a visa as a ${country} citizen?`,
                a: `The application process depends on the destination. For visa-required countries, you typically apply at the embassy or consulate. For eVisa destinations, you apply online. Use VisitPlane to find the exact requirements for any specific country.`,
              },
              {
                q: `Which is the easiest country for ${country} citizens to visit?`,
                a: `Visa-free and visa-on-arrival destinations are the easiest to visit. ${country} citizens have ${grouped['Visa Free']?.length ?? 0} visa-free options and ${grouped['Visa on Arrival']?.length ?? 0} visa-on-arrival destinations available.`,
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
