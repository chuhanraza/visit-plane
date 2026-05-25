import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Visa Application Tracker | VisitPlane',
  description:
    'Track all your visa applications in one place. Monitor status from submission to approval.',
  alternates: {
    canonical: 'https://www.visitplane.com/visa-tracker',
  },
}

export default function VisaTrackerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
