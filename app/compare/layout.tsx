import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Visa Comparison Tool 2026 | VisitPlane',
  description:
    'Compare visa requirements side by side for multiple destinations. Processing times, fees, and documents needed.',
}

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
