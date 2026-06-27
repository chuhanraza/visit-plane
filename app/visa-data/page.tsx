import type { Metadata } from 'next'
import Link from 'next/link'
import { breadcrumbList } from '@/lib/seo/schema'
import { getCostStats, getPassportPower, getDocStats, RESEARCH_LAST_UPDATED } from '@/lib/data/researchData'

const URL = 'https://www.visitplane.com/visa-data'

export const metadata: Metadata = {
  title: 'Visa Data & Research — Original Visa Datasets | VisitPlane',
  description:
    'VisitPlane’s original, citable visa research: the Visa Cost Index, Passport Power / visa-free access ranking, and a document-requirements index built from official sources. Free to use and cite.',
  alternates: { canonical: URL },
  openGraph: {
    title: 'Visa Data & Research — Original Visa Datasets',
    description:
      'Original, citable visa datasets: cost index, passport power, and document requirements — built from official sources.',
    url: URL,
    type: 'website',
  },
}

export default function VisaDataHubPage() {
  const cost = getCostStats()
  const passports = getPassportPower()
  const docs = getDocStats()

  const cards = [
    {
      href: '/visa-data/visa-cost-index',
      emoji: '📊',
      title: 'Visa Cost Index 2026',
      blurb: `Typical tourist-visa fees across ${cost.total} destinations, with regional medians and free-entry counts. Sortable + charted.`,
      stat: cost.median !== null ? `Median fee $${cost.median}` : 'Sortable fee table',
    },
    {
      href: '/visa-data/passport-power',
      emoji: '🛂',
      title: 'Passport Power 2026',
      blurb: `Visa-free + visa-on-arrival access for ${passports.length} passports, from the IATA-derived Passport Index. Ranked + sortable.`,
      stat: `${passports.length} passports ranked`,
    },
    {
      href: '/visa-data/document-requirements-index',
      emoji: '📋',
      title: 'Document Requirements Index',
      blurb: `Document counts for ${docs.routeCount} visa routes, transcribed and cited from official consulate / government sources.`,
      stat: `${docs.routeCount} cited routes`,
    },
  ]

  const schema = breadcrumbList([
    { name: 'Home', url: '/' },
    { name: 'Visa Data & Research', url: '/visa-data' },
  ])

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <nav className="border-b border-gray-100 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-2.5 text-xs text-gray-400 sm:px-6">
          <Link href="/" className="hover:text-teal-500">🏠 Home</Link>
          <span className="px-1.5 text-gray-300">/</span>
          <span className="font-semibold text-teal-600">Visa Data &amp; Research</span>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <header className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-600">
            📊 Original research · updated {RESEARCH_LAST_UPDATED}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Visa Data &amp; Research</h1>
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            Original, openly-citable visa datasets built from VisitPlane&apos;s own data and official
            sources. Each resource shows its methodology, sources and limitations, and is free for
            travellers, journalists and researchers to reference. We frame uncertain figures honestly —
            ranges and patterns, never a confident wrong number.
          </p>
        </header>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group flex flex-col rounded-3xl border border-gray-100 bg-white p-6 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-500/5"
            >
              <div className="text-3xl">{c.emoji}</div>
              <h2 className="mt-3 text-lg font-bold leading-snug group-hover:text-teal-600">{c.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500">{c.blurb}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-teal-600">
                {c.stat} <span aria-hidden="true">→</span>
              </div>
            </Link>
          ))}
        </div>

        <section className="mt-12 rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="text-lg font-bold">How we build this</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            VisitPlane is an independent, single-operator visa-information service for 197 countries, with a
            particular focus on emerging-market passports. Our research pages prefer verified, official-source
            data; where a figure comes from our curated dataset, we say so and tell you to confirm it at the
            official source. We do not publish a precise wrong number as fact. See our{' '}
            <Link href="/editorial-standards" className="font-semibold text-teal-700 hover:underline">editorial standards</Link>{' '}
            for how routes are verified.
          </p>
        </section>
      </div>
    </div>
  )
}
