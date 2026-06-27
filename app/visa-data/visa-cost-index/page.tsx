import type { Metadata } from 'next'
import Link from 'next/link'
import HBarChart from '@/components/data/HBarChart'
import VisaDataDisclaimer from '@/components/VisaDataDisclaimer'
import CostTable from './CostTable'
import { getAuthor } from '@/lib/data/authors'
import { breadcrumbList, faqPage, dataset, article } from '@/lib/seo/schema'
import {
  getCostIndex,
  getCostStats,
  RESEARCH_LAST_UPDATED,
} from '@/lib/data/researchData'

const URL = 'https://www.visitplane.com/visa-data/visa-cost-index'

export const metadata: Metadata = {
  title: 'Visa Cost Index 2026 — Tourist Visa Fees by Destination | VisitPlane',
  description:
    'A sortable index of typical tourist-visa fees across 180+ destinations, with regional medians and free-entry counts. Compiled from VisitPlane’s dataset — verify each fee at the official source.',
  alternates: { canonical: URL },
  openGraph: {
    title: 'Visa Cost Index 2026 — Tourist Visa Fees by Destination',
    description:
      'Sortable index of typical tourist-visa fees across destinations, with regional medians. Verify each fee at the official source.',
    url: URL,
    type: 'article',
  },
}

export default function VisaCostIndexPage() {
  const author = getAuthor()
  const rows = getCostIndex()
  const stats = getCostStats(rows)

  const chartData = stats.byRegion.map((r) => ({
    label: r.region,
    value: r.median,
    display: `$${r.median}`,
  }))

  const faqs = [
    {
      q: 'Are these the exact fees I will pay?',
      a: 'Not necessarily. These are typical, destination-level tourist-visa fees from VisitPlane’s own dataset. The fee you actually pay depends on your nationality, the visa type, the number of entries, the processing tier you choose, and any service-centre charges. Always confirm the current fee on the destination’s official immigration or e-visa portal before you pay.',
    },
    {
      q: 'How is the median fee calculated?',
      a: 'We parse only unambiguous published fees (for example "$90", and "Free" counts as $0). Fees we cannot reduce to a single fixed number — like "Embassy quote", "varies", or per-day charges — are shown as-is in the table but excluded from the medians and the cheapest/most-expensive figures, so the aggregates are never distorted by a guessed number.',
    },
    {
      q: 'Why are some destinations free?',
      a: 'Many countries grant visa-free entry or a free visa-on-arrival to tourists for short stays, so the government charges no visa fee. You may still pay unrelated costs such as a tourist tax or an electronic travel authorisation in some cases — check the official source.',
    },
    {
      q: 'How current is this data?',
      a: `This index was last compiled on ${RESEARCH_LAST_UPDATED}. Visa fees change without notice, so treat it as a planning reference, not a guarantee, and verify the live fee at the official source before booking.`,
    },
  ]

  const schemas = [
    breadcrumbList([
      { name: 'Home', url: '/' },
      { name: 'Visa Data & Research', url: '/visa-data' },
      { name: 'Visa Cost Index 2026', url: '/visa-data/visa-cost-index' },
    ]),
    dataset({
      name: 'VisitPlane Visa Cost Index 2026',
      description:
        'Typical tourist-visa fees across 180+ destinations, with parsed numeric fees, regional medians and free-entry counts. Destination-level (not nationality-specific); verify at the official source.',
      url: URL,
      dateModified: RESEARCH_LAST_UPDATED,
      keywords: ['visa fees', 'tourist visa cost', 'visa cost comparison', 'visa price by country'],
      spatialCoverage: 'Worldwide',
      sources: [{ name: 'VisitPlane curated destination dataset', url: 'https://www.visitplane.com/destinations' }],
      license: 'https://www.visitplane.com/terms',
    }),
    article({
      headline: 'Visa Cost Index 2026 — Tourist Visa Fees by Destination',
      description: metadata.description as string,
      url: URL,
      datePublished: '2026-06-27',
      dateModified: RESEARCH_LAST_UPDATED,
      author: { name: author.name, url: author.url, jobTitle: author.role },
    }),
    faqPage(faqs),
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29]">
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      {/* Breadcrumb */}
      <nav className="border-b border-gray-100 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-2.5 text-xs text-gray-400 sm:px-6">
          <Link href="/" className="hover:text-teal-500">🏠 Home</Link>
          <span className="px-1.5 text-gray-300">/</span>
          <Link href="/visa-data" className="hover:text-teal-500">📊 Visa Data &amp; Research</Link>
          <span className="px-1.5 text-gray-300">/</span>
          <span className="font-semibold text-teal-600">Visa Cost Index</span>
        </div>
      </nav>

      <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <header>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-600">
            📊 Original data · last updated {RESEARCH_LAST_UPDATED}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Visa Cost Index 2026</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600">
            How much does a tourist visa cost around the world? This sortable index compiles the{' '}
            <strong>typical published tourist-visa fee</strong> for {stats.total} destinations from
            VisitPlane&apos;s dataset — so you can compare at a glance and spot where entry is free.
            Fees are <strong>destination-level, not nationality-specific</strong>; always confirm yours
            at the official source.
          </p>
        </header>

        {/* Key stats */}
        <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Destinations indexed', value: String(stats.total) },
            { label: 'Free entry (no visa fee)', value: String(stats.freeCount) },
            { label: 'Median visa fee', value: stats.median !== null ? `$${stats.median}` : '—' },
            {
              label: 'Most expensive',
              value: stats.max ? `$${stats.max.fee}` : '—',
              sub: stats.max?.name,
            },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="text-2xl font-extrabold text-teal-600">{s.value}</div>
              <div className="mt-1 text-xs font-medium text-gray-500">{s.label}</div>
              {s.sub ? <div className="text-[11px] text-gray-400">{s.sub}</div> : null}
            </div>
          ))}
        </section>

        {/* Chart: median by region */}
        <section className="mt-10">
          <h2 className="text-xl font-bold">Median tourist-visa fee by region</h2>
          <p className="mt-1.5 text-sm text-gray-500">
            Median of the unambiguous numeric fees in each region (free entries count as $0).
          </p>
          <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-5">
            <HBarChart data={chartData} unit="" />
          </div>
        </section>

        {/* Table */}
        <section className="mt-10">
          <h2 className="text-xl font-bold">Full sortable index</h2>
          <p className="mt-1.5 text-sm text-gray-500">
            Click any column header to sort. Search by destination or region.
          </p>
          <div className="mt-5">
            <CostTable rows={rows} />
          </div>
        </section>

        {/* Methodology */}
        <section className="mt-12 rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="text-xl font-bold">Methodology, sources &amp; limitations</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600">
            <p>
              <strong>What this is.</strong> A comparison of the typical tourist-visa fee published for
              each destination, drawn from VisitPlane&apos;s curated destination dataset. It is meant as a
              planning reference — a way to see relative cost and spot free-entry destinations.
            </p>
            <p>
              <strong>How fees were parsed.</strong> Only unambiguous published fees are treated as
              numbers (&quot;$90&quot; → 90; &quot;Free&quot; → 0). Values we cannot reduce to a single
              fixed number — &quot;Embassy quote&quot;, &quot;varies&quot;, or per-day charges like
              &quot;$200+/day&quot; — appear in the table as written but are <strong>excluded</strong>{' '}
              from the medians and the cheapest/most-expensive figures. We never substitute a guessed
              number for a real one.
            </p>
            <p>
              <strong>Important limitation.</strong> These are <strong>destination-level</strong> figures.
              The fee an individual pays depends on nationality, visa category, number of entries,
              processing tier and any visa-application-centre service charges. Treat every figure as
              &quot;typical, verify yours&quot; rather than a quote.
            </p>
            <p>
              <strong>Last compiled:</strong> {RESEARCH_LAST_UPDATED}. Visa fees change frequently and
              without notice.
            </p>
          </div>
          <div className="mt-5">
            <VisaDataDisclaimer />
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-10">
          <h2 className="text-xl font-bold">Frequently asked questions</h2>
          <div className="mt-4 space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-gray-100 bg-white p-5">
                <summary className="cursor-pointer list-none font-semibold text-gray-800">{f.q}</summary>
                <p className="mt-2.5 text-sm leading-relaxed text-gray-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Related / internal links */}
        <section className="mt-10 rounded-2xl border border-teal-500/20 bg-teal-500/[0.06] p-6">
          <h2 className="text-lg font-bold">Related research &amp; tools</h2>
          <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <li><Link href="/visa-data/passport-power" className="font-semibold text-teal-700 hover:underline">→ Passport Power / Visa-Free Access 2026</Link></li>
            <li><Link href="/visa-data/document-requirements-index" className="font-semibold text-teal-700 hover:underline">→ Visa Document Requirements Index</Link></li>
            <li><Link href="/cheapest-visas-from-pakistan-passport" className="font-semibold text-teal-700 hover:underline">→ Cheapest visas from a Pakistani passport</Link></li>
            <li><Link href="/destinations" className="font-semibold text-teal-700 hover:underline">→ Browse all destinations &amp; fees</Link></li>
          </ul>
        </section>

        <p className="mt-8 text-xs text-gray-400">
          Compiled by{' '}
          <Link href={author.url} className="font-medium text-gray-500 hover:underline">{author.name}</Link>,
          {' '}{author.role}, VisitPlane. Data is provided for general guidance and must be verified at the
          official source.
        </p>
      </article>
    </div>
  )
}
