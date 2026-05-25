import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About VisitPlane | Free Visa Requirements for 197 Countries',
  description:
    'VisitPlane is a free visa requirements platform covering 197 countries. VisitPlane was built for travelers who need instant, accurate visa information with no signup required.',
  alternates: {
    canonical: 'https://www.visitplane.com/about',
  },
  openGraph: {
    title: 'About VisitPlane | Free Visa Requirements for 197 Countries',
    description:
      'VisitPlane is a free visa requirements platform covering 197 countries. Built for travelers, by travelers.',
    url: 'https://www.visitplane.com/about',
    siteName: 'VisitPlane',
    type: 'website',
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
