import type { Metadata } from 'next'
import InterviewPrepClient from './InterviewPrepClient'

export const metadata: Metadata = {
  title: 'Visa Interview Questions & Answers 2026 | VisitPlane',
  description:
    'Prepare for your visa interview with real questions and expert answers for the US, UK, Canada, Australia, Germany, UAE and Japan. Free interview prep guide.',
  keywords: [
    'visa interview questions',
    'visa interview preparation',
    'usa visa interview',
    'uk visa interview',
    'canada visa interview',
    'australia visa interview',
    'germany visa interview',
    'uae visa interview',
    'japan visa interview',
    'schengen visa interview',
    'b1 b2 visa questions',
    'visa interview tips 2026',
  ],
  openGraph: {
    title: 'Visa Interview Questions & Answers 2026 | VisitPlane',
    description:
      'Prepare for your visa interview with real questions and expert answers for the US, UK, Canada, Australia, Germany, UAE and Japan.',
    url: 'https://www.visitplane.com/interview-prep',
    siteName: 'VisitPlane',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'VisitPlane Interview Prep' }],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visa Interview Questions & Answers 2026 | VisitPlane',
    description: 'Real interview Q&A for US, UK, Canada, Australia, Germany, UAE and Japan visas.',
    images: ['/og-image.png'],
    site: '@visitplane',
  },
  alternates: { canonical: '/interview-prep' },
}

// ISR: regenerate the landing at most once per hour so production HTML never
// drifts from the committed source the way it did pre-sprint.
export const revalidate = 3600

export default function InterviewPrepPage() {
  return <InterviewPrepClient />
}
