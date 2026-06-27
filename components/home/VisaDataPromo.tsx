import Link from 'next/link'

// ─────────────────────────────────────────────────────────────────────────────
// Homepage promo band for the /visa-data research hub. Fills what used to be
// dead inter-section whitespace with real, indexable internal links to the three
// original data resources — surfacing them from the most-linked page (good for
// discovery + crawl) without adding heavy client JS.
// ─────────────────────────────────────────────────────────────────────────────

const CARDS = [
  {
    href: '/visa-data/visa-cost-index',
    emoji: '📊',
    title: 'Visa Cost Index',
    blurb: 'Tourist-visa fees across 195 destinations — sortable.',
  },
  {
    href: '/visa-data/passport-power',
    emoji: '🛂',
    title: 'Passport Power',
    blurb: 'Visa-free access ranked for 194 passports.',
  },
  {
    href: '/visa-data/document-requirements-index',
    emoji: '📋',
    title: 'Document Requirements',
    blurb: '55 routes, transcribed from official sources.',
  },
]

export default function VisaDataPromo() {
  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-teal-500/15 bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/50 p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Intro */}
            <div className="max-w-md">
              <p className="text-[11px] font-bold uppercase tracking-widest text-teal-600">
                📊 Original research
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                Visa Data &amp; Research
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Free, citable datasets built from our own data and official sources — visa fees,
                passport power and document requirements.
              </p>
              <Link
                href="/visa-data"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 transition hover:gap-2.5 hover:text-teal-800"
              >
                Explore all research <span aria-hidden="true">→</span>
              </Link>
            </div>

            {/* Cards */}
            <div className="grid gap-3 sm:grid-cols-3 lg:max-w-2xl lg:flex-1">
              {CARDS.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="group flex flex-col rounded-2xl border border-gray-100 bg-white/80 p-4 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md hover:shadow-teal-500/5"
                >
                  <span className="text-xl">{c.emoji}</span>
                  <span className="mt-2 text-sm font-bold text-gray-900 group-hover:text-teal-700">
                    {c.title}
                  </span>
                  <span className="mt-1 text-xs leading-snug text-gray-500">{c.blurb}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
