import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Visa Approval Probability Calculator 2026 | VisitPlane',
  description:
    'Find out your chances of getting a visa approved. Answer 5 questions and get your personalized visa success probability score instantly. Free.',
  openGraph: {
    title: 'Visa Approval Probability Calculator 2026 | VisitPlane',
    description:
      'Find out your chances of getting a visa approved. Answer 5 questions and get your personalized visa success probability score instantly. Free.',
    url: 'https://visitplane.com/visa-checker',
  },
}

export default function VisaCheckerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
