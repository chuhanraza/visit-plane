import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore 197 Visa Destinations | VisitPlane',
  description:
    'Browse visa requirements for 197 countries. Filter by continent, search by name, check requirements instantly.',
  alternates: {
    canonical: 'https://www.visitplane.com/destinations',
  },
}

export default function DestinationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
