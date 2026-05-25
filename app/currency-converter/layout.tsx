import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Travel Currency Converter 2026 | VisitPlane',
  description:
    'Convert currencies instantly with real-time exchange rates. Free travel currency converter for 200+ currencies.',
  alternates: {
    canonical: 'https://www.visitplane.com/currency-converter',
  },
}

export default function CurrencyConverterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
