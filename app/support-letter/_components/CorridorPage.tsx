import Link from 'next/link'
import { breadcrumbList, faqPage } from '@/lib/seo/schema'
import { DEST_BY_SLUG } from '@/lib/letters/destinations'
import { liveCorridors, type Corridor } from '@/lib/letters/corridors'
import { CONTENT_REVIEWED, GUIDE_BY_TYPE, SITE, sampleLetter, typePath } from '@/lib/letters/seo'
import { toolDestinationName } from '@/lib/letters/destinations'
import { Bullets, Crumbs, CtaButton, Disclaimer, FaqList, JsonLd, LinkList, SampleLetter, Section } from './GuideParts'

const ORIGIN_NAME = { pakistan: 'Pakistan', india: 'India' } as const

export function corridorPath(c: Corridor): string {
  return `${typePath(c.type)}/${c.slug}`
}

export function corridorToolHref(c: Corridor): string {
  const q = new URLSearchParams({ type: c.type, origin: c.origin })
  if (c.variant) q.set('variant', c.variant)
  // The employer letter has no destination of its own to prefill; the other letters do.
  const dest = DEST_BY_SLUG[c.destSlug]
  if (dest && c.type !== 'noc') q.set('destination', toolDestinationName(dest))
  return `/support-letter?${q.toString()}`
}

/** Short label for breadcrumbs and related-link lists. */
function shortName(c: Corridor): string {
  return c.h1.replace(/\s*\(applying from [^)]+\)/i, '').replace(/:.*$/, '')
}

export function corridorJsonLd(c: Corridor) {
  const url = `${SITE}${corridorPath(c)}`
  return {
    page: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${url}#page`,
      url,
      name: c.title,
      description: c.description,
      inLanguage: 'en',
      dateModified: CONTENT_REVIEWED,
      isPartOf: { '@type': 'WebSite', name: 'VisitPlane', url: SITE },
    },
    crumbs: breadcrumbList([
      { name: 'Home', url: '/' },
      { name: 'Support letter generator', url: '/support-letter' },
      { name: GUIDE_BY_TYPE[c.type].label, url: typePath(c.type) },
      { name: shortName(c), url: corridorPath(c) },
    ]),
    faq: faqPage(c.faqs),
  }
}

export default function CorridorPage({ corridor: c }: { corridor: Corridor }) {
  const g = GUIDE_BY_TYPE[c.type]
  const dest = DEST_BY_SLUG[c.destSlug]
  const blocks = sampleLetter(c.type, dest, c.origin, c.sampleOverrides)
  const ld = corridorJsonLd(c)
  const others = liveCorridors().filter((x) => x.slug !== c.slug && c.related.includes(x.slug))
  const origin = ORIGIN_NAME[c.origin]

  return (
    <div className="bg-[#FAFAFA] text-gray-900">
      <JsonLd data={ld.page} />
      <JsonLd data={ld.crumbs} />
      <JsonLd data={ld.faq} />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Crumbs
          trail={[
            { name: 'Home', href: '/' },
            { name: 'Support letter generator', href: '/support-letter' },
            { name: g.label, href: typePath(c.type) },
            { name: shortName(c) },
          ]}
        />

        <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">{c.h1}</h1>
        <div className="mt-4 space-y-3 text-base leading-relaxed text-gray-700">
          {c.intro.map((t) => <p key={t}>{t}</p>)}
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Checklists read October 2026. Reviewed {CONTENT_REVIEWED}. By the VisitPlane editorial team.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <CtaButton href={corridorToolHref(c)}>Write my letter (applying from {origin})</CtaButton>
          <a href="#sample" className="inline-flex min-h-[48px] items-center rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-800 hover:border-gray-400">
            See the sample
          </a>
        </div>

        <Section title={c.checklistHeading}>
          <p className="mb-5 text-sm leading-relaxed text-gray-600">{c.checklistIntro}</p>
          <dl className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
            {c.checklist.map((row) => (
              <div key={row.label} className="px-5 py-4">
                <dt className="flex flex-wrap items-center gap-2 text-sm font-bold text-gray-900">
                  {row.label}
                  {row.suggestion && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">Our suggestion</span>
                  )}
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-gray-600">{row.text}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title={c.fit.heading}>
          <Bullets items={c.fit.items} />
        </Section>

        <Section id="sample" title={`Sample ${g.noun}`}>
          <p className="mb-5 text-sm text-gray-600">{c.sampleNote}</p>
          <SampleLetter blocks={blocks} caption={`Sample ${g.noun} from the free generator. All details are fictional.`} />
          <div className="mt-6 text-center">
            <CtaButton href={corridorToolHref(c)}>Make this letter with your details</CtaButton>
          </div>
        </Section>

        <Section title="Mistakes to avoid">
          <dl className="space-y-4">
            {c.mistakes.map((m) => (
              <div key={m.title}>
                <dt className="text-sm font-bold text-gray-900">{m.title}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-gray-600">{m.body}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="Frequently asked questions">
          <FaqList faqs={c.faqs} />
        </Section>

        <Section title="Sources we read">
          <p className="mb-3 text-sm text-gray-600">
            Every checklist row above comes from these published documents. They change, so open the current version for your consulate before you apply.
          </p>
          <ul className="space-y-1.5 text-sm">
            {c.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-emerald-800 underline underline-offset-2">{s.name}</a>
              </li>
            ))}
          </ul>
        </Section>

        <div className="mt-12 grid gap-8 border-t border-gray-200 pt-8 sm:grid-cols-2">
          <LinkList
            title="Related letters"
            links={others.map((x) => ({ href: corridorPath(x), label: shortName(x) }))}
          />
          <LinkList
            title="Guides"
            links={[
              { href: typePath(c.type), label: `${g.label}: full guide` },
              { href: '/support-letter', label: 'Support letter generator' },
              { href: '/embassy-finder', label: 'Embassy finder' },
            ]}
          />
        </div>

        <Disclaimer />
        <p className="mt-4 text-xs text-gray-500">
          <Link href="/editorial-standards" className="underline">How we write and check our guides</Link>
        </p>
      </main>
    </div>
  )
}
