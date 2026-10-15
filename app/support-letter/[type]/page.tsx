import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { clampDesc, clampTitle } from '@/lib/seo/clamp'
import { breadcrumbList, faqPage } from '@/lib/seo/schema'
import {
  CONTENT_REVIEWED,
  DEST_TYPES,
  GUIDE_BY_SLUG,
  SITE,
  TYPE_GUIDES,
  destPath,
  destinationsWithPage,
  sampleLetter,
  toolHref,
  typePath,
} from '@/lib/letters/seo'
import {
  Bullets,
  Crumbs,
  CtaButton,
  Disclaimer,
  FaqList,
  JsonLd,
  LinkList,
  SampleLetter,
  Section,
} from '../_components/GuideParts'
import { corridorPath } from '../_components/CorridorPage'
import { liveCorridors } from '@/lib/letters/corridors'

export const revalidate = 86400
// OpenNext on Cloudflare runs with a no-op incremental cache (see open-next.config.ts), so
// dynamicParams=false would 404 every route. Render on demand and validate params in the page.
export const dynamicParams = true

export function generateStaticParams() {
  return TYPE_GUIDES.map((g) => ({ type: g.slug }))
}

type Props = { params: Promise<{ type: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params
  const g = GUIDE_BY_SLUG[type]
  if (!g) return {}
  const url = `${SITE}${typePath(g.type)}`
  const title = clampTitle(g.title)
  const description = clampDesc(g.description)
  const og = `/api/og?template=2&category=${encodeURIComponent('Visa letters')}&footer=${encodeURIComponent('Free visa letter generator')}&title=${encodeURIComponent(g.h1)}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'article', images: [{ url: og, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description, images: [og] },
  }
}

export default async function LetterTypePage({ params }: Props) {
  const { type } = await params
  const g = GUIDE_BY_SLUG[type]
  if (!g) notFound()

  const url = `${SITE}${typePath(g.type)}`
  const withDest = DEST_TYPES.includes(g.type)
  const sample = sampleLetter(g.type)
  const others = TYPE_GUIDES.filter((x) => x.type !== g.type)
  const corridors = liveCorridors().filter((c) => c.type === g.type)

  const page = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#page`,
    url,
    name: g.title,
    description: g.description,
    inLanguage: 'en',
    dateModified: CONTENT_REVIEWED,
    isPartOf: { '@type': 'WebSite', name: 'VisitPlane', url: SITE },
  }

  return (
    <div className="bg-[#FAFAFA] text-gray-900">
      <JsonLd data={page} />
      <JsonLd data={breadcrumbList([
        { name: 'Home', url: '/' },
        { name: 'Support letter generator', url: '/support-letter' },
        { name: g.label, url: typePath(g.type) },
      ])} />
      <JsonLd data={faqPage(g.faqs.map((f) => ({ q: f.q, a: f.a })))} />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Crumbs trail={[{ name: 'Home', href: '/' }, { name: 'Support letter generator', href: '/support-letter' }, { name: g.label }]} />

        <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">{g.h1}</h1>
        <div className="mt-4 space-y-3 text-base leading-relaxed text-gray-700">
          {g.intro.map((t) => <p key={t}>{t}</p>)}
        </div>
        <p className="mt-3 text-xs text-gray-500">Reviewed {CONTENT_REVIEWED}. By the VisitPlane editorial team. See our <Link href="/editorial-standards" className="underline">editorial standards</Link>.</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <CtaButton href={toolHref(g.type)}>Write my {g.noun} (free)</CtaButton>
          <a href="#sample" className="inline-flex min-h-[48px] items-center rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-800 hover:border-gray-400">See the sample</a>
        </div>

        <Section title={`When you need a ${g.noun}`}>
          <Bullets items={g.need} />
          <h3 className="mt-6 text-sm font-bold text-gray-900">When you can skip it</h3>
          <div className="mt-2"><Bullets items={g.notNeed} /></div>
        </Section>

        <Section title="What goes in the letter">
          <Bullets items={g.include} />
        </Section>

        <Section id="sample" title={`Sample ${g.noun}`}>
          <p className="mb-5 text-sm text-gray-600">
            A worked example from the generator. The people, numbers and employer are invented. Use it for structure, then write your own facts.
          </p>
          <SampleLetter blocks={sample} caption={`Sample ${g.noun} built with the free generator. All details are fictional.`} />
          <div className="mt-6 text-center"><CtaButton href={toolHref(g.type)}>Make this letter with your details</CtaButton></div>
        </Section>

        <Section title="Mistakes that weaken the letter">
          <div className="space-y-4">
            {g.mistakes.map((m) => (
              <div key={m.title} className="rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="text-sm font-bold text-gray-900">{m.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{m.body}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="How to write it, step by step">
          <ol className="list-decimal space-y-2.5 pl-5 text-sm leading-relaxed text-gray-700">
            {g.steps.map((s) => <li key={s}>{s}</li>)}
          </ol>
        </Section>

        <Section title="For applicants from Pakistan">
          <Bullets items={g.pakistan} />
        </Section>

        {withDest && (
          <Section title={`${g.label} by destination`}>
            <p className="mb-4 text-sm text-gray-600">Rules and expectations differ by country. Pick your destination for a tailored sample and the official source.</p>
            <ul className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {destinationsWithPage(g.type).map((d) => (
                <li key={d.slug}>
                  <Link href={destPath(g.type, d)} className="text-emerald-800 underline-offset-2 hover:underline">{g.label} for {d.name}</Link>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {corridors.length > 0 && (
          <Section title={`${g.label} by situation and country`}>
            <p className="mb-4 text-sm text-gray-600">Built from the published checklists for applicants in Pakistan and India.</p>
            <ul className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {corridors.map((c) => (
                <li key={c.slug}>
                  <Link href={corridorPath(c)} className="text-emerald-800 underline-offset-2 hover:underline">{c.h1.replace(/\s*\(applying from [^)]+\)/i, '')}</Link>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section title="Frequently asked questions">
          <FaqList faqs={g.faqs} />
        </Section>

        <div className="mt-12 grid gap-8 border-t border-gray-200 pt-8 sm:grid-cols-2">
          <LinkList
            title="Other letters"
            links={others.map((o) => ({ href: typePath(o.type), label: o.label }))}
          />
          <LinkList
            title="More on VisitPlane"
            links={[
              { href: '/support-letter', label: 'Support letter generator' },
              { href: '/checklist', label: 'Visa document checklist' },
              { href: '/embassy-finder', label: 'Embassy finder' },
              { href: '/processing-times', label: 'Visa processing times' },
            ]}
          />
        </div>

        <Disclaimer />
      </main>
    </div>
  )
}
