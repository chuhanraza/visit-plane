import type { Metadata } from 'next'
import { ALL_COUNTRIES } from '../data'
import DestinationCountryClient from './DestinationCountryClient'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findCountry(slug: string) {
  const decoded = decodeURIComponent(slug)
  // Match by name (case-insensitive) or alt terms
  return (
    ALL_COUNTRIES.find((c) => c.name.toLowerCase() === decoded.toLowerCase()) ??
    ALL_COUNTRIES.find((c) =>
      c.alt.some((a) => a.toLowerCase() === decoded.toLowerCase())
    )
  )
}

// ─── Static params (all 197 countries) ────────────────────────────────────────

export async function generateStaticParams() {
  return ALL_COUNTRIES.map((c) => ({ country: c.name }))
}

export const revalidate = 86400 // ISR: re-render at most once per day

// ─── SEO metadata ─────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ country: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country: slug } = await params
  const c = findCountry(slug)
  const name = c?.name ?? decodeURIComponent(slug)

  const title       = `${name} Visa Requirements by Passport — All Nationalities | VisitPlane`
  const description = `${name} visa requirements for every nationality. Check whether your passport is visa-free, needs an eVisa, visa on arrival, or a full visa for ${name}. Updated 2026.`
  const canonical   = `https://www.visitplane.com/destinations/${encodeURIComponent(slug)}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

// ─── JSON-LD ItemList schema ──────────────────────────────────────────────────

function CountryJsonLd({ slug, name }: { slug: string; name: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${name} Visa Requirements by Passport`,
    description: `Visa requirements for all nationalities visiting ${name}`,
    url: `https://www.visitplane.com/destinations/${encodeURIComponent(slug)}`,
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function DestinationCountryPage({ params }: Props) {
  const { country: slug } = await params
  const c = findCountry(slug)

  // If country not found in static data, use fallback values
  const name   = c?.name   ?? decodeURIComponent(slug)
  const flag   = c?.flag   ?? '🌍'
  const region = c?.region ?? 'World'
  const visa   = c?.visa   ?? 'Visa Required'
  const stay   = c?.max_stay ?? '—'
  const fee    = c?.fee_usd  ?? '—'

  return (
    <>
      <CountryJsonLd slug={slug} name={name} />
      <DestinationCountryClient
        countryName={name}
        countryFlag={flag}
        countryRegion={region}
        visa={visa}
        maxStay={stay}
        feeUsd={fee}
      />
    </>
  )
}
