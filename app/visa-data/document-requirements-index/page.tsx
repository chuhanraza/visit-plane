import type { Metadata } from 'next'
import Link from 'next/link'
import HBarChart from '@/components/data/HBarChart'
import VisaDataDisclaimer from '@/components/VisaDataDisclaimer'
import DocTable from './DocTable'
import { getAuthor } from '@/lib/data/authors'
import { breadcrumbList, faqPage, dataset, article } from '@/lib/seo/schema'
import {
  getDocRequirementsIndex,
  getDocStats,
  RESEARCH_LAST_UPDATED,
} from '@/lib/data/researchData'

const URL = 'https://www.visitplane.com/visa-data/document-requirements-index'

export const metadata: Metadata = {
  title: 'Visa Document Requirements Index — Curated from Official Sources | VisitPlane',
  description:
    'How many documents each visa route actually requires, transcribed from official consulate, VAC and government requirement sheets. Sortable, fully cited, with a link to every route’s official source.',
  alternates: { canonical: URL },
  openGraph: {
    title: 'Visa Document Requirements Index — Curated from Official Sources',
    description:
      'Document counts per visa route, transcribed from official requirement sheets and fully cited.',
    url: URL,
    type: 'article',
  },
}

export default function DocRequirementsIndexPage() {
  const author = getAuthor()
  const rows = getDocRequirementsIndex()
  const stats = getDocStats(rows)

  const chartData = rows.slice(0, 10).map((r) => ({
    label: `${r.passport}→${r.destination}`,
    value: r.total,
    flag: r.destFlag,
  }))

  const faqs = [
    {
      q: 'How is the document count calculated?',
      a: 'For each curated route we count the individual documents listed in the official requirement sheet, grouped into mandatory, conditional (depends on your situation) and recommended. The "total items" column is the sum; "mandatory" is the core set everyone on that route needs.',
    },
    {
      q: 'Where do these requirements come from?',
      a: 'Each route is transcribed from that destination’s official source for the applicant’s nationality — a consulate or visa-application-centre requirement sheet, an e-visa portal, or a government immigration page. Every row links to the exact source and shows the month it was verified. We never invent a requirement.',
    },
    {
      q: 'Why are only some routes listed?',
      a: `This index only contains routes we have transcribed and cited from an official document — currently ${stats.routeCount} routes across ${stats.passportCount} passports. Routes that are not yet curated are intentionally excluded rather than filled with guesses; on the main site those still show an honest "general guide — confirm at the official source" checklist.`,
    },
    {
      q: 'Will the official list match exactly when I apply?',
      a: 'Requirements change and consulates can ask for extra documents case by case. Use this index to prepare and compare, then confirm the live list on the linked official source before you submit. A document checklist is YMYL information — getting it wrong can mean a refused application.',
    },
  ]

  const schemas = [
    breadcrumbList([
      { name: 'Home', url: '/' },
      { name: 'Visa Data & Research', url: '/visa-data' },
      { name: 'Visa Document Requirements Index', url: '/visa-data/document-requirements-index' },
    ]),
    dataset({
      name: 'VisitPlane Visa Document Requirements Index',
      description:
        `Document counts (mandatory / conditional / recommended) for ${stats.routeCount} visa routes, each transcribed from the destination’s official requirement source for the applicant’s nationality, with citation and verification date.`,
      url: URL,
      dateModified: RESEARCH_LAST_UPDATED,
      keywords: ['visa documents', 'visa requirements', 'visa checklist', 'documents required for visa'],
      spatialCoverage: 'Worldwide',
      sources: [{ name: 'Official consulate / VAC / government requirement sources (cited per route)', url: 'https://www.visitplane.com/editorial-standards' }],
      license: 'https://www.visitplane.com/terms',
    }),
    article({
      headline: 'Visa Document Requirements Index — Curated from Official Sources',
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

      <nav className="border-b border-gray-100 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-2.5 text-xs text-gray-400 sm:px-6">
          <Link href="/" className="hover:text-teal-500">🏠 Home</Link>
          <span className="px-1.5 text-gray-300">/</span>
          <Link href="/visa-data" className="hover:text-teal-500">📊 Visa Data &amp; Research</Link>
          <span className="px-1.5 text-gray-300">/</span>
          <span className="font-semibold text-teal-600">Document Requirements Index</span>
        </div>
      </nav>

      <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <header>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-600">
            📋 Original data · official-source-cited · {RESEARCH_LAST_UPDATED}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Visa Document Requirements Index</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600">
            How much paperwork does a visa really take? We transcribed the{' '}
            <strong>official document requirements</strong> for {stats.routeCount} passport-to-destination
            routes — straight from consulate, visa-application-centre and government sources — and counted
            them. Every row is <strong>cited and dated</strong>, and links to the route&apos;s official
            source and to VisitPlane&apos;s full checklist.
          </p>
        </header>

        {/* Stats */}
        <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Routes curated', value: String(stats.routeCount) },
            { label: 'Passports covered', value: String(stats.passportCount) },
            { label: 'Destinations covered', value: String(stats.destinationCount) },
            { label: 'Avg. mandatory docs', value: String(stats.avgMandatory) },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="text-2xl font-extrabold text-teal-600">{s.value}</div>
              <div className="mt-1 text-xs font-medium text-gray-500">{s.label}</div>
            </div>
          ))}
        </section>

        {/* Chart */}
        <section className="mt-10">
          <h2 className="text-xl font-bold">Most document-heavy routes (total items)</h2>
          <p className="mt-1.5 text-sm text-gray-500">Top 10 curated routes by total documents requested.</p>
          <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-5">
            <HBarChart data={chartData} />
          </div>
        </section>

        {/* Table */}
        <section className="mt-10">
          <h2 className="text-xl font-bold">Full sortable index</h2>
          <p className="mt-1.5 text-sm text-gray-500">
            Click a route to open its full checklist, or the source link to read the official requirements.
          </p>
          <div className="mt-5">
            <DocTable rows={rows} />
          </div>
        </section>

        {/* Methodology */}
        <section className="mt-12 rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="text-xl font-bold">Methodology, sources &amp; limitations</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600">
            <p>
              <strong>What this is.</strong> A count of the documents each curated visa route requires,
              built from VisitPlane&apos;s official-source-cited requirements library. Each route was
              transcribed from the destination&apos;s official requirement source <em>for that
              nationality</em> — a consulate or VAC requirement sheet, an e-visa portal, or a government
              immigration page.
            </p>
            <p>
              <strong>How items are counted.</strong> Documents are grouped into <strong>mandatory</strong>{' '}
              (everyone on the route), <strong>conditional</strong> (depends on your situation — employed,
              sponsored, business, etc.) and <strong>recommended</strong>. &quot;Total items&quot; sums all
              three. Conditional items inflate the total for routes with many situational branches, which is
              why we surface mandatory separately.
            </p>
            <p>
              <strong>Coverage &amp; honesty.</strong> Only routes we have actually transcribed and cited
              appear here ({stats.routeCount} routes, {stats.passportCount} passports). We intentionally do
              not pad the index with un-sourced routes. Each row carries its own source link and the month it
              was last verified.
            </p>
            <p>
              <strong>Limitation.</strong> Official lists change and consulates can request extra documents
              case by case. Confirm the live requirements at the linked official source before you apply.
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

        <section className="mt-10 rounded-2xl border border-teal-500/20 bg-teal-500/[0.06] p-6">
          <h2 className="text-lg font-bold">Related research &amp; tools</h2>
          <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <li><Link href="/visa-data/visa-cost-index" className="font-semibold text-teal-700 hover:underline">→ Visa Cost Index 2026</Link></li>
            <li><Link href="/visa-data/passport-power" className="font-semibold text-teal-700 hover:underline">→ Passport Power / Visa-Free Access 2026</Link></li>
            <li><Link href="/checklist" className="font-semibold text-teal-700 hover:underline">→ Build a document checklist</Link></li>
            <li><Link href="/editorial-standards" className="font-semibold text-teal-700 hover:underline">→ How VisitPlane verifies data</Link></li>
          </ul>
        </section>

        <p className="mt-8 text-xs text-gray-400">
          Compiled by{' '}
          <Link href={author.url} className="font-medium text-gray-500 hover:underline">{author.name}</Link>,
          {' '}{author.role}, VisitPlane. Each route is cited to its official source; confirm the live list
          before you apply.
        </p>
      </article>
    </div>
  )
}
