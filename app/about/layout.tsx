import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About VisitPlane | Free Visa Requirements',
  description:
    'VisitPlane provides free, accurate visa requirements for 197 countries. Built for travelers, by travelers.',
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
