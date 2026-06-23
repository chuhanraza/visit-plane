import type { Metadata } from 'next'
import Link from 'next/link'
import { getAuthor } from '@/lib/data/authors'

const author = getAuthor()
const CANONICAL = 'https://www.visitplane.com/editorial-standards'

export const metadata: Metadata = {
  title: 'Editorial Standards & How We Verify Visa Information',
  description:
    'How VisitPlane researches, verifies, and updates visa information — the official sources we use, how AI is used (never as the source of truth), and how to report incorrect data.',
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'Editorial Standards & How We Verify — VisitPlane',
    description:
      'The sources, review process, and honest limitations behind every visa guide on VisitPlane.',
    type: 'article',
    url: CANONICAL,
  },
}

const SOURCES = [
  {
    title: 'Official government immigration sites',
    desc: 'The primary source for any visa requirement is the destination country’s own immigration or foreign-ministry website — the authority that actually sets and enforces the rule.',
  },
  {
    title: 'Embassy & consulate pages',
    desc: 'Embassy and consulate pages for the specific passport–destination pair are used to confirm application procedures, fees, required documents, and appointment processes.',
  },
  {
    title: 'IATA Travel Centre',
    desc: 'The IATA Travel Centre — the same database airlines use at check-in to decide whether to board a passenger — is used to cross-check visa and transit requirements.',
  },
]

export default function EditorialStandardsPage() {
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Editorial Standards & How We Verify Visa Information',
    url: CANONICAL,
    description:
      'How VisitPlane researches, verifies, and updates visa information, and how AI is used.',
    publisher: {
      '@type': 'Organization',
      name: 'VisitPlane',
      url: 'https://www.visitplane.com',
      logo: { '@type': 'ImageObject', url: 'https://www.visitplane.com/logo-v2.png' },
    },
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f1419] antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      <section className="mx-auto max-w-3xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-600">
            🛡️ Editorial Standards
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            How we verify visa information
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-gray-500">
            VisitPlane publishes Your-Money-or-Your-Life (YMYL) travel information. A wrong visa
            answer can cost someone a flight, a refusal, or a trip. This page explains exactly how
            our guidance is researched, verified, and kept current — and where its limits are.
          </p>
        </div>

        {/* Sources */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">The sources we verify against</h2>
          <div className="space-y-5">
            {SOURCES.map((s) => (
              <div key={s.title} className="flex items-start gap-3">
                <span className="mt-1 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-[#10B981]/10 text-xs text-[#10B981]">
                  ✓
                </span>
                <div>
                  <p className="text-sm font-bold text-[#0f1419]">{s.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review cadence */}
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">How often we review</h2>
          <p className="text-sm leading-relaxed text-gray-500 mb-4">
            Visa rules change constantly and without a fixed schedule. Rather than claim a
            misleading “reviewed monthly” promise, we update guidance as changes are confirmed
            against the official sources above. High-traffic routes are checked more frequently, and
            every guide carries a visible “Last updated” date so you can see exactly how current it
            is.
          </p>
          <p className="text-sm leading-relaxed text-gray-500">
            Content is written and reviewed by{' '}
            <Link href={`/authors/${author.slug}`} className="font-semibold text-[#10B981] hover:underline">
              {author.name}
            </Link>
            , {author.role} of VisitPlane, who is personally accountable for what the site publishes.
          </p>
        </div>

        {/* How AI is used */}
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">How we use AI — and how we don’t</h2>
          <p className="text-sm leading-relaxed text-gray-500 mb-4">
            We use AI tooling to draft, structure, and translate content, and to flag possible
            discrepancies across our 197-country dataset for a human to review. AI is a research and
            drafting assistant — <strong className="text-[#0f1419]">never the source of truth</strong>.
          </p>
          <p className="text-sm leading-relaxed text-gray-500">
            No visa requirement is published on the strength of an AI answer alone. The authoritative
            value always comes from the official government, embassy, or IATA source, confirmed by a
            human before publication.
          </p>
        </div>

        {/* Honest disclaimer */}
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-8">
          <h2 className="mb-3 text-xl font-bold text-amber-900">Always confirm with the official embassy</h2>
          <p className="text-sm leading-relaxed text-amber-900/80">
            Even with careful verification, visa rules can change overnight and individual
            circumstances vary. VisitPlane is an information resource, not a visa agency or legal
            advisor. Before you book or travel, always confirm the final requirements with the
            official embassy or consulate of your destination country. Treat our guidance as a
            well-researched starting point — not the last word.
          </p>
        </div>

        {/* Report incorrect data */}
        <div className="mt-6 rounded-2xl border border-[#10B981]/20 bg-[#F0FDF9] p-8">
          <h2 className="mb-3 text-xl font-bold">Found something wrong? Tell us.</h2>
          <p className="text-sm leading-relaxed text-gray-600 mb-5">
            Accuracy is a shared effort. If you spot an error, an outdated fee, or a changed rule,
            please report it — corrections are prioritised and help every traveler who comes after
            you.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-[#10B981] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#059669]"
          >
            Report incorrect data →
          </Link>
        </div>
      </section>
    </div>
  )
}
