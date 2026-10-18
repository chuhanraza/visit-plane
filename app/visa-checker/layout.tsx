import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Visa Approval Probability Quiz 2026 | VisitPlane',
  description:
    'Answer 5 quick questions to see your estimated chance of visa approval and what could weaken your application. Free, no signup, instant score.',
  alternates: {
    canonical: 'https://www.visitplane.com/visa-checker',
  },
  openGraph: {
      images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'VisitPlane - free visa requirements' }],
    title: 'Visa Approval Probability Quiz 2026 | VisitPlane',
    description:
      'Find out your chances of getting a visa. Answer 5 questions and get your personalized visa success probability score.',
    url: 'https://www.visitplane.com/visa-checker',
  },
}

export default function VisaCheckerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
