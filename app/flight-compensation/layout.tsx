import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Flight Delay Compensation Checker 2026 | VisitPlane',
  description:
    'Check if your delayed, cancelled or overbooked flight qualifies for compensation under EU261, UK261 or US DOT rules. Free checker, no signup.',
  alternates: {
    canonical: 'https://www.visitplane.com/flight-compensation',
  },
}

export default function FlightCompensationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
