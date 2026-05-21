import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Visa Cost Calculator 2026 | VisitPlane',
  description:
    'Calculate your total visa cost before applying. Embassy fees, service fees, and total breakdown.',
}

export default function CostCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
