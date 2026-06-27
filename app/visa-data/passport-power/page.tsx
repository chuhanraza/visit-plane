import type { Metadata } from 'next'
import Link from 'next/link'
import HBarChart from '@/components/data/HBarChart'
import VisaDataDisclaimer from '@/components/VisaDataDisclaimer'
import PassportTable from './PassportTable'
import { getAuthor } from '@/lib/data/authors'
import { breadcrumbList, faqPage, dataset, article } from '@/lib/seo/schema'
import {
  getPassportPower,
  FOCUS_PASSPORTS,
  RESEARCH_LAST_UPDATED,
  PASSPORT_INDEX_SOURCE,
  type PassportRow,
} from '@/lib/data/researchData'

const URL = 'https://www.visitplane.com/visa-data/passport-power'

export const metadata: Metadata = {
  title: 'Passport Power 2026 — Visa-Free Access by Passport | VisitPlane',
  description:
    'How many destinations each passport can enter with no advance visa (visa-free + visa-on-arrival), from the IATA-derived Passport Index. Sortable ranking with a focus on emerging-market passports.',
  alternates: { canonical: URL },
  openGraph: {
    title: 'Passport Power 2026 — Visa-Free Access by Passport',
    description:
      'Visa-free + visa-on-arrival access by passport, from the IATA-derived Passport Index. Sortable ranking.',
    url: URL,
    type: 'article',
  },
}

export default function PassportPowerPage() {
  const author = getAuthor()
  const rows = getPassportPower()
  const top = rows[0]
  const focusRows = FOCUS_PASSPORTS
    .map((name) => rows.find((r) => r.name === name))
    .filter((r): r is PassportRow => Boolean(r))

  const chartData = focusRows
    .slice()
    .sort((a, b) => b.total - a.total)
    .map((r) => ({ label: r.name, value: r.total, flag: r.flag }))

  const faqs = [
    {
      q: 'What does "no-visa access" count?',
      a: 'It counts the distinct destinations a passport holder can enter without arranging a visa in advance — that is, visa-free entries plus visa-on-arrival. Destinations that require an e-visa, an electronic travel authorisation (ETA), or a traditional visa before travel are not counted here, because they need action before you fly.',
    },
    {
      q: 'Where does this data come from?',
      a: `The access counts are derived from the open, IATA-based Passport Index dataset (${PASSPORT_INDEX_SOURCE.url}), mapped onto VisitPlane's 197-country system and de-duplicated to distinct destinations. It was last compiled on ${RESEARCH_LAST_UPDATED}.`,
    },
    {
      q: 'Why might this differ from other "passport ranking" lists?',
      a: 'Different rankings count different things — some include e-visa and ETA destinations in their totals, some count territories separately, and snapshots are taken on different dates. We deliberately count only no-advance-visa access (visa-free + visa-on-arrival) and distinct destinations, which is a stricter, more travel-practical measure.',
    },
    {
      q: 'Can I rely on this for my trip?',
      a: 'Use it to understand relative passport strength, not as a guarantee for a specific border. Visa policy changes frequently and can depend on your circumstances. Always confirm the current rule for your exact route at the official source before booking.',
    },
  ]

  const schemas = [
    breadcrumbList([
      { name: 'Home', url: '/' },
      { name: 'Visa Data & Research', url: '/visa-data' },
      { name: 'Passport Power 2026', url: '/visa-data/passport-power' },
    ]),
    dataset({
      name: 'VisitPlane Passport Power Index 2026',
      description:
        'Visa-free and visa-on-arrival access counts for world passports (distinct destinations needing no advance visa), derived from the IATA-based Passport Index dataset.',
      url: URL,
      dateModified: RESEARCH_LAST_UPDATED,
      keywords: ['passport power', 'visa-free access', 'passport ranking', 'visa-on-arrival'],
      spatialCoverage: 'Worldwide',
      sources: [PASSPORT_INDEX_SOURCE],
      license: 'https://creativecommons.org/licenses/by-sa/4.0/',
    }),
    article({
      headline: 'Passport Power 2026 — Visa-Free Access by Passport',
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
          <span className="font-semibold text-teal-600">Passport Power</span>
        </div>
      </nav>

      <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <header>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-600">
            🛂 Original data · IATA-derived · {RESEARCH_LAST_UPDATED}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Passport Power 2026</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600">
            How far does each passport take you with <strong>no advance visa</strong>? This ranking counts
            the distinct destinations you can enter <strong>visa-free or with a visa on arrival</strong> —
            the access that actually lets you book and fly. {top ? <>The strongest passport in this snapshot reaches <strong>{top.total}</strong> destinations.</> : null} We pay special attention to
            emerging-market passports, where reliable visa information is hardest to find.
          </p>
        </header>

        {/* Focus passports chart */}
        <section className="mt-10">
          <h2 className="text-xl font-bold">Visa-free + visa-on-arrival access — passports we focus on</h2>
          <p className="mt-1.5 text-sm text-gray-500">Distinct destinations needing no advance visa.</p>
          <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-5">
            <HBarChart data={chartData} />
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Tip: click a passport in the table below to open its full visa-free destination list.
          </p>
        </section>

        {/* Full ranking */}
        <section className="mt-10">
          <h2 className="text-xl font-bold">Full sortable ranking ({rows.length} passports)</h2>
          <p className="mt-1.5 text-sm text-gray-500">Click any column to sort. Search for a passport.</p>
          <div className="mt-5">
            <PassportTable rows={rows} />
          </div>
        </section>

        {/* Methodology */}
        <section className="mt-12 rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="text-xl font-bold">Methodology, sources &amp; limitations</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600">
            <p>
              <strong>What this measures.</strong> For each passport we count the <strong>distinct
              destinations</strong> that require <strong>no advance visa</strong> — visa-free entries plus
              visa-on-arrival. e-Visa, ETA and visa-required destinations are deliberately excluded because
              they need action before you travel.
            </p>
            <p>
              <strong>Source.</strong> Access data is derived from the open, IATA-based{' '}
              <a href={PASSPORT_INDEX_SOURCE.url} target="_blank" rel="noopener noreferrer" className="font-medium text-teal-700 hover:underline">
                Passport Index dataset
              </a>, mapped onto VisitPlane&apos;s 197-country system and de-duplicated to distinct
              destinations (so the totals never exceed the number of countries).
            </p>
            <p>
              <strong>Why it can differ from other rankings.</strong> Some published rankings fold e-visa /
              ETA destinations into their totals or count territories separately. Our stricter
              no-advance-visa measure is more conservative by design.
            </p>
            <p><strong>Last compiled:</strong> {RESEARCH_LAST_UPDATED}.</p>
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
            <li><Link href="/visa-data/document-requirements-index" className="font-semibold text-teal-700 hover:underline">→ Visa Document Requirements Index</Link></li>
            <li><Link href="/passport-strength" className="font-semibold text-teal-700 hover:underline">→ Check your passport strength</Link></li>
            <li><Link href="/visa-free-map" className="font-semibold text-teal-700 hover:underline">→ Visa-free world map</Link></li>
          </ul>
        </section>

        <p className="mt-8 text-xs text-gray-400">
          Compiled by{' '}
          <Link href={author.url} className="font-medium text-gray-500 hover:underline">{author.name}</Link>,
          {' '}{author.role}, VisitPlane. A planning reference — confirm the current rule for your route at the
          official source before travel.
        </p>
      </article>
    </div>
  )
}
