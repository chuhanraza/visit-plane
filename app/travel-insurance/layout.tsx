import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Travel Insurance for Visa Applications — Coverage Guide | VisitPlane',
  description:
    'Understand the travel medical insurance many visas require (e.g. Schengen €30,000 cover), what to look for, and how to compare policies before you apply.',
  alternates: { canonical: 'https://www.visitplane.com/travel-insurance' },
  openGraph: {
    title: 'Travel Insurance for Visa Applications — Coverage Guide',
    description:
      'What travel medical insurance visas require and how to compare cover before you apply.',
    url: 'https://www.visitplane.com/travel-insurance',
    type: 'website',
  },
}

export default function TravelInsuranceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
