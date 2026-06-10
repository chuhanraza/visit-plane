import type { Metadata } from 'next'
import DestinationsClient from './DestinationsClient'
import { ALL_COUNTRIES } from './data'

// ─── SEO metadata ──────────────────────────────────────────────────────────

interface Props {
  searchParams: Promise<{ passport?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { passport = 'United States' } = await searchParams
  const title = `All Visa Requirements for ${passport} Passport Holders | VisitPlane`
  const description = `Browse visa requirements for all ${ALL_COUNTRIES.length} countries with a ${passport} passport. See visa types, max stay, and fees — updated 2026.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://visitplane.com/destinations`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: 'https://visitplane.com/destinations',
    },
  }
}

// ─── JSON-LD ItemList schema ───────────────────────────────────────────────

function DestinationsJsonLd({ passport }: { passport: string }) {
  const items = ALL_COUNTRIES.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    url: `https://visitplane.com/visa/${encodeURIComponent(passport)}/${encodeURIComponent(c.name)}`,
    description: `${c.visa} — ${c.max_stay} — ${c.fee_usd}`,
  }))

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `All Visa Requirements for ${passport} Passport Holders`,
    description: `Visa requirements for ${ALL_COUNTRIES.length} countries for ${passport} passport holders`,
    numberOfItems: ALL_COUNTRIES.length,
    itemListElement: items,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default async function DestinationsPage({ searchParams }: Props) {
  const { passport = 'United States' } = await searchParams

  return (
    <>
      <DestinationsJsonLd passport={passport} />
      <DestinationsClient />
    </>
  )
}
