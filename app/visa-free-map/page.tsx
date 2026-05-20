import type { Metadata } from 'next'
import VisaFreeMapClient from './VisaFreeMapClient'

export const metadata: Metadata = {
  title: 'Visa-Free World Map 2026 | See Where You Can Travel | VisitPlane',
  description:
    'Interactive world map showing visa-free countries for your passport. See instantly where you can travel without a visa in 2026.',
  keywords: [
    'visa free map',
    'visa free countries',
    'passport visa map',
    'interactive visa map',
    'travel without visa 2026',
    'visa on arrival map',
    'passport power map',
  ],
  metadataBase: new URL('https://visitplane.com'),
  alternates: { canonical: '/visa-free-map' },
  openGraph: {
    title: 'Visa-Free World Map 2026 | VisitPlane',
    description:
      'See every country you can visit visa-free on a beautiful interactive world map. Select your passport and explore instantly.',
    url: 'https://visitplane.com/visa-free-map',
    siteName: 'VisitPlane',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visa-Free World Map 2026 | VisitPlane',
    description:
      'Interactive world map showing where your passport gets you visa-free. Explore 190+ countries instantly.',
    site: '@visitplane',
  },
}

export default function VisaFreeMapPage() {
  return <VisaFreeMapClient />
}
