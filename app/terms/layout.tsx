import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | VisitPlane',
  description:
    'The terms for using VisitPlane: what the service is, accuracy of visa information, affiliate links, the optional paid report, and limits of liability.',
  alternates: { canonical: 'https://www.visitplane.com/terms' },
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
