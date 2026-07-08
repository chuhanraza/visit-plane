import type { Metadata } from 'next'
import { ALL_COUNTRIES } from '../data'
import DestinationCountryClient from './DestinationCountryClient'
import TripEssentials from '@/components/affiliate/TripEssentials'
import { COUNTRIES } from '@/lib/seo/countries'

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

// ISR: 24h edge cache per hub. Empty generateStaticParams = nothing prerenders
// at build (build-time prerender crashed Next 16 on occasional null/dirty
// Supabase rows); hubs generate on first request and are then served cached.
export const revalidate = 86400
export async function generateStaticParams() {
  return []
}

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

  // ISO-3 for click attribution (route_dest); COUNTRIES is keyed by name.
  const destIso = COUNTRIES.find((sc) => sc.name.toLowerCase() === name.toLowerCase())?.iso3

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
      {/* Decision point: reader is planning a trip to this country — flights and
          insurance are the next bookings. Skipped for Not Permitted destinations:
          a booking CTA there would contradict the page's own answer. */}
      {visa !== 'Not Permitted' && (
        <div className="bg-[#FAFAFA] px-4 sm:px-6 lg:px-8 pb-16">
          <div className="mx-auto max-w-7xl">
          <TripEssentials
            placement="destination_page"
            source={`/destinations/${decodeURIComponent(slug).toLowerCase()}`}
            destIso={destIso}
            heading={`Planning a trip to ${name}?`}
            subheading="Once your entry requirements are clear, these are the essentials travelers book next."
            show={['flights', 'insurance']}
          />
          </div>
        </div>
      )}
    </>
  )
}
