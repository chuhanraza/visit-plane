import type { Metadata } from 'next'
import InterviewPrepClient from './InterviewPrepClient'

export const metadata: Metadata = {
  title: 'Visa Interview Questions & Answers 2026 | VisitPlane',
  description:
    'Prepare for your visa interview with real questions and expert answers for USA, UK, Canada, Australia and Germany. Free interview prep guide.',
  keywords: [
    'visa interview questions',
    'visa interview preparation',
    'usa visa interview',
    'uk visa interview',
    'canada visa interview',
    'australia visa interview',
    'germany visa interview',
    'schengen visa interview',
    'b1 b2 visa questions',
    'visa interview tips 2026',
  ],
  openGraph: {
    title: 'Visa Interview Questions & Answers 2026 | VisitPlane',
    description:
      'Prepare for your visa interview with real questions and expert answers for USA, UK, Canada, Australia and Germany.',
    url: 'https://visitplane.com/interview-prep',
    siteName: 'VisitPlane',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'VisitPlane Interview Prep' }],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visa Interview Questions & Answers 2026 | VisitPlane',
    description: 'Real interview Q&A for USA, UK, Canada, Australia and Germany visas.',
    images: ['/og-image.png'],
    site: '@visitplane',
  },
  alternates: { canonical: '/interview-prep' },
}

export default function InterviewPrepPage() {
  return <InterviewPrepClient />
}
