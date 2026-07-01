import type { Metadata } from 'next'
import DestinationsClient from './DestinationsClient'
import { ALL_COUNTRIES } from './data'

// ─── SEO metadata ──────────────────────────────────────────────────────────

interface Props {
  searchParams: Promise<{ passport?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { passport } = await searchParams
  // The bare /destinations URL is passport-neutral — don't bake a default
  // nationality into the indexed title. ?passport= variants canonicalise to the
  // clean URL, so only the neutral title ever represents this page in SERPs.
  const title = passport
    ? `All Visa Requirements for ${passport} Passport Holders (2026)`
    : `Visa Requirements by Country — All ${ALL_COUNTRIES.length} Destinations (2026)`
  const description = passport
    ? `Browse visa requirements for all ${ALL_COUNTRIES.length} countries with a ${passport} passport. See visa types, max stay, and fees — updated 2026.`
    : `Browse visa requirements for all ${ALL_COUNTRIES.length} countries by passport. See visa types, max stay, and fees — updated 2026.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://www.visitplane.com/destinations`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: 'https://www.visitplane.com/destinations',
    },
  }
}

// ─── JSON-LD ItemList schema ───────────────────────────────────────────────

function DestinationsJsonLd({ passport }: { passport: string }) {
  const items = ALL_COUNTRIES.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    url: `https://www.visitplane.com/visa/${encodeURIComponent(passport)}/${encodeURIComponent(c.name)}`,
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
