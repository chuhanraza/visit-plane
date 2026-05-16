import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Visa Processing Time Tracker | VisitPlane',
  description: 'Check visa processing times worldwide',
}

export default function ProcessingTimesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
