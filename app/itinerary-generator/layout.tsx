import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Flight Itinerary Generator for Visa 2026 | VisitPlane',
  description:
    'Generate professional flight and hotel itineraries for visa applications. Embassy-accepted format. Free, instant PDF download. Works for Schengen, UK, USA, Canada and more.',
  alternates: {
    canonical: 'https://www.visitplane.com/itinerary-generator',
  },
  openGraph: {
    title: 'Free Flight Itinerary Generator for Visa | VisitPlane',
    description:
      'Generate professional flight and hotel itineraries for visa applications instantly. Embassy-accepted format. Free & instant PDF.',
  },
}

export default function ItineraryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
