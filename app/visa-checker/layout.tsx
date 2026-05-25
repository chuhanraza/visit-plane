import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Visa Approval Probability Quiz 2026 | VisitPlane',
  description:
    'Find out your chances of getting a visa. Answer 5 questions and get your personalized visa success probability score.',
  alternates: {
    canonical: 'https://www.visitplane.com/visa-checker',
  },
  openGraph: {
    title: 'Visa Approval Probability Quiz 2026 | VisitPlane',
    description:
      'Find out your chances of getting a visa. Answer 5 questions and get your personalized visa success probability score.',
    url: 'https://www.visitplane.com/visa-checker',
  },
}

export default function VisaCheckerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
