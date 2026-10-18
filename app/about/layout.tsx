import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About VisitPlane | Free Visa Requirements for 197 Countries',
  description:
    'VisitPlane is a free visa requirements tool covering 197 countries: instant, accurate visa information for travelers, with no signup required.',
  alternates: {
    canonical: 'https://www.visitplane.com/about',
  },
  openGraph: {
      images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'VisitPlane - free visa requirements' }],
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
