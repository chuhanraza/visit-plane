import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { clampDesc, clampTitle } from '@/lib/seo/clamp'
import { breadcrumbList, faqPage } from '@/lib/seo/schema'
import { DEST_BY_SLUG } from '@/lib/letters/destinations'
import {
  CONTENT_REVIEWED,
  DEST_TYPES,
  GUIDE_BY_SLUG,
  SITE,
  destDescription,
  destDocs,
  destPoints,
  destinationsWithPage,
  destFaqs,
  destIntro,
  destNotices,
  destPath,
  destTitle,
  needAnswer,
  relatedForDestination,
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
} from '../../_components/GuideParts'

export const revalidate = 86400
export const dynamicParams = false

export function generateStaticParams() {
  return DEST_TYPES.flatMap((t) =>
    destinationsWithPage(t).map((d) => ({
      type: Object.values(GUIDE_BY_SLUG).find((g) => g.type === t)!.slug,
      destination: d.slug,
    })),
  )
}

type Props = { params: Promise<{ type: string; destination: string }> }

function resolve(type: string, destination: string) {
  const g = GUIDE_BY_SLUG[type]
  const d = DEST_BY_SLUG[destination]
  if (!g || !d || !d.pages.includes(g.type)) return null
  return { g, d }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type, destination } = await params
  const r = resolve(type, destination)
  if (!r) return {}
  const { g, d } = r
  const url = `${SITE}${destPath(g.type, d)}`
  const title = clampTitle(destTitle(g.type, d))
  const description = clampDesc(destDescription(g.type, d))
  const og = `/api/og?template=2&category=${encodeURIComponent('Visa letters')}&title=${encodeURIComponent(destTitle(g.type, d))}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'article', images: [{ url: og, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description, images: [og] },
  }
}

export default async function LetterDestinationPage({ params }: Props) {
  const { type, destination } = await params
  const r = resolve(type, destination)
  if (!r) notFound()
  const { g, d } = r

  const url = `${SITE}${destPath(g.type, d)}`
  const sample = sampleLetter(g.type, d)
  const notices = destNotices(g.type, d)
  const faqs = destFaqs(g.type, d)
  const rel = relatedForDestination(g.type, d)

  const page = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#page`,
    url,
    name: destTitle(g.type, d),
    description: destDescription(g.type, d),
    inLanguage: 'en',
    dateModified: CONTENT_REVIEWED,
    isPartOf: { '@type': 'WebSite', name: 'VisitPlane', url: SITE },
    mainEntity: {
      '@type': 'WebApplication',
      name: 'VisitPlane support letter generator',
      url: `${SITE}/support-letter`,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  }

  return (
    <div className="bg-[#FAFAFA] text-gray-900">
      <JsonLd data={page} />
      <JsonLd data={breadcrumbList([
        { name: 'Home', url: '/' },
        { name: 'Support letter generator', url: '/support-letter' },
        { name: g.label, url: typePath(g.type) },
        { name: d.name.replace(/^the /, ''), url: destPath(g.type, d) },
      ])} />
      <JsonLd data={faqPage(faqs)} />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Crumbs trail={[
          { name: 'Home', href: '/' },
          { name: 'Support letter generator', href: '/support-letter' },
          { name: g.label, href: typePath(g.type) },
          { name: d.name.replace(/^the /, '') },
        ]} />

        <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {g.label} for {d.name}: sample and free generator
        </h1>
        <div className="mt-4 space-y-3 text-base leading-relaxed text-gray-700">
          {destIntro(g.type, d).map((t) => <p key={t}>{t}</p>)}
        </div>
        <p className="mt-3 text-xs text-gray-500">Reviewed {CONTENT_REVIEWED}. By the VisitPlane editorial team.</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <CtaButton href={toolHref(g.type, d)}>Write my {g.noun} for {d.name}</CtaButton>
          <a href="#sample" className="inline-flex min-h-[48px] items-center rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-800 hover:border-gray-400">See the sample</a>
        </div>

        <Section title={`Do you need a ${g.noun} for ${d.name}?`}>
          <p className="text-sm leading-relaxed text-gray-700">{needAnswer(g.type, d)}</p>
          {notices.length > 0 && (
            <div className="mt-5 space-y-3">
              {notices.map((n) => (
                <p key={n} className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-950">{n}</p>
              ))}
            </div>
          )}
          <p className="mt-5 text-sm text-gray-700">
            Official source:{' '}
            <a href={d.authority.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-800 underline underline-offset-2">{d.authority.name}</a>.
          </p>
        </Section>

        <Section title={`What is specific to ${d.name}`}>
          <Bullets items={destPoints(g.type, d)} />
          <p className="mt-4 text-sm text-gray-600">
            For the full list of what any {g.noun} should contain, see the <Link href={typePath(g.type)} className="font-medium text-emerald-800 underline underline-offset-2">complete {g.noun} guide</Link>.
          </p>
        </Section>

        <Section id="sample" title={`Sample ${g.noun} for ${d.name}`}>
          <p className="mb-5 text-sm text-gray-600">
            A worked example from the generator, set in {d.cities[0]} and {d.cities[1]}. The people, numbers and employer are invented.
          </p>
          <SampleLetter blocks={sample} caption={`Sample ${g.noun} for ${d.name}, built with the free generator. All details are fictional.`} />
          <div className="mt-6 text-center"><CtaButton href={toolHref(g.type, d)}>Make this letter with your details</CtaButton></div>
        </Section>

        <Section title="What to attach">
          <Bullets items={destDocs(g.type, d)} />
          <p className="mt-4 text-sm text-gray-600">
            Match the attachments to the list on the official checklist for {d.name}. Add nothing the letter does not mention, and mention nothing you cannot attach.
          </p>
        </Section>

        <Section title="Frequently asked questions">
          <FaqList faqs={faqs} />
        </Section>

        <div className="mt-12 grid gap-8 border-t border-gray-200 pt-8 sm:grid-cols-2">
          <LinkList title={`Other letters for ${d.name}`} links={rel.sameDestOtherTypes} />
          <LinkList title={`${g.label} for other destinations`} links={rel.sameTypeOthers} />
          <LinkList
            title="Guides"
            links={[
              { href: typePath(g.type), label: `${g.label}: full guide` },
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
