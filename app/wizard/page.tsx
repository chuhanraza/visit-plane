import type { Metadata } from 'next'
import WizardClient from './WizardClient'

export const metadata: Metadata = {
  title: 'AI Visa Wizard 2026 | Get Personalized Visa Guidance | VisitPlane',
  description:
    'Answer 5 questions and get your complete personalized visa guide powered by AI. Free for all 197 countries.',
  keywords: [
    'ai visa wizard',
    'personalized visa guide',
    'visa requirements ai',
    'claude ai visa',
    'visa checker free',
    'visa guidance 2026',
  ],
  openGraph: {
    title: 'AI Visa Wizard 2026 | Get Personalized Visa Guidance | VisitPlane',
    description:
      'Answer 5 questions and get your complete personalized visa guide powered by AI. Free for all 197 countries.',
    url: 'https://www.visitplane.com/wizard',
    siteName: 'VisitPlane',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'VisitPlane AI Visa Wizard' }],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Visa Wizard 2026 | Get Personalized Visa Guidance | VisitPlane',
    description:
      'Answer 5 questions and get your complete personalized visa guide powered by AI. Free for all 197 countries.',
    images: ['/og-image.png'],
    site: '@visitplane',
  },
  alternates: { canonical: '/wizard' },
}

export default function WizardPage() {
  return <WizardClient />
}
