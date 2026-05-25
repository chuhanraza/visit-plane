import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Visa Comparison Tool 2026 | VisitPlane',
  description:
    'Compare visa requirements side by side for multiple destinations. Processing times, fees, and documents needed.',
  alternates: {
    canonical: 'https://www.visitplane.com/compare',
  },
}

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
