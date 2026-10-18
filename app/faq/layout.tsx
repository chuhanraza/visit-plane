import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | VisitPlane',
  description:
    'Answers to common visa questions: requirements, processing times, documents and how VisitPlane works. Free visa information for 197 countries.',
  alternates: {
    canonical: 'https://www.visitplane.com/faq',
  },
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
