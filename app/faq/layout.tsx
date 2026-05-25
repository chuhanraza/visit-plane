import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | VisitPlane',
  description:
    'Common questions about visa requirements, processing times, documents, and how VisitPlane works.',
  alternates: {
    canonical: 'https://www.visitplane.com/faq',
  },
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
