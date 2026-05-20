import type { Metadata } from 'next'
import VisaFreeMapClient from './VisaFreeMapClient'

export const metadata: Metadata = {
  title: 'Visa-Free World Map 2026 | Passport Power Explorer | VisitPlane',
  description:
    'Interactive world map showing where your passport can take you. See visa-free, visa-on-arrival, and visa-required countries for 197 passports. Based on Henley Passport Index 2026.',
  keywords: [
    'visa free map 2026',
    'passport power map',
    'henley passport index 2026',
    'visa free countries',
    'interactive visa world map',
    'passport visa map',
    'travel without visa 2026',
    'visa on arrival countries',
    'passport strength map',
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
