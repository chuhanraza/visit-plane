import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Passport Scanner & Visa Photo Tool 2026 | VisitPlane',
  description:
    'Scan your passport MRZ instantly and generate perfect visa photos for USA, UK, Schengen, UAE and more. Free, private, instant results.',
  keywords: [
    'passport scanner',
    'MRZ reader',
    'visa photo generator',
    'passport OCR',
    'visa photo size',
    'passport MRZ scanner online',
    'free visa photo tool',
    'visa photo specifications',
  ],
  alternates: { canonical: '/passport-scanner' },
  openGraph: {
    title: 'Passport Scanner & Visa Photo Tool | VisitPlane',
    description:
      'Scan your passport MRZ instantly and generate perfect visa photos for USA, UK, Schengen, UAE and more. Free, private, instant.',
    url: 'https://www.visitplane.com/passport-scanner',
    siteName: 'VisitPlane',
    type: 'website',
  },
}

export default function PassportScannerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
