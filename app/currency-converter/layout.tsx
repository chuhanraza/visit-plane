import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Currency Converter 2026 | Real-Time Rates | VisitPlane',
  description:
    'Convert currencies instantly with real-time exchange rates. Free travel currency converter for 200+ currencies worldwide.',
}

export default function CurrencyConverterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
