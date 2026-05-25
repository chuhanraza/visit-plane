import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Visa Processing Times 2026 | VisitPlane',
  description:
    'Check how long your visa will take. Real processing time estimates for standard and express applications worldwide.',
  alternates: {
    canonical: 'https://www.visitplane.com/processing-times',
  },
}

export default function ProcessingTimesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
