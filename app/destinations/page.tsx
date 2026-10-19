import type { Metadata } from 'next'
import DestinationsClient from './DestinationsClient'
import { ALL_COUNTRIES } from './data'

// ─── SEO metadata ──────────────────────────────────────────────────────────

// This page must stay static. It used to read `searchParams` (for an optional
// ?passport= value), which made Next render it on every request with
// `cache-control: private, no-store`: a ~390 KB page rebuilt on the Worker for every visit
// and every crawler hit. The passport is a client-side preference (localStorage / geo),
// and ?passport= variants always canonicalised to the clean URL anyway.
const DEFAULT_PASSPORT = 'United States'

export async function generateMetadata(): Promise<Metadata> {
  const title = `Visa Requirements by Country — All ${ALL_COUNTRIES.length} Destinations (2026)`
  const description = `Browse visa requirements for all ${ALL_COUNTRIES.length} countries by passport: visa types, maximum stay and fees, updated for 2026. Free, no signup.`

  return {
    title,
    description,
    openGraph: {
      images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'VisitPlane - free visa requirements' }],
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

export default function DestinationsPage() {
  return (
    <>
      <DestinationsJsonLd passport={DEFAULT_PASSPORT} />
      <DestinationsClient />
    </>
  )
}
