import type { Metadata } from 'next'
import Link from 'next/link'
import CheckoutForm from './CheckoutForm'

export const metadata: Metadata = {
  title: 'Premium Visa Report — Rs 2,000 | VisitPlane',
  description: 'A one-time Rs 2,000 report for your exact passport and destination: full requirement breakdown plus a downloadable PDF document checklist.',
  alternates: { canonical: 'https://www.visitplane.com/premium-report' },
  openGraph: {
    title: 'Premium Visa Report — Rs 2,000 | VisitPlane',
    description: 'One report for your exact passport and destination, with a downloadable PDF document checklist.',
    url: 'https://www.visitplane.com/premium-report',
    type: 'website',
  },
}

const PRODUCT_LD = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Premium Visa Report',
  description: 'A one-time report for your exact passport and destination: full requirement breakdown plus a downloadable PDF document checklist.',
  brand: { '@type': 'Brand', name: 'VisitPlane' },
  offers: {
    '@type': 'Offer',
    price: '2000',
    priceCurrency: 'PKR',
    availability: 'https://schema.org/InStock',
    url: 'https://www.visitplane.com/premium-report',
  },
}

const INCLUDES = [
  ['Visa type & decision', 'Whether you need a visa, visa on arrival, eVisa or nothing — for your passport and destination.'],
  ['Processing time, fee & stay limits', 'Typical processing window, estimated fee, maximum stay and how early to apply.'],
  ['Deeper requirement breakdown', 'Documents grouped as mandatory, conditional and recommended, with process notes for your nationality where we hold an official source sheet.'],
  ['Downloadable PDF checklist', 'A printable document checklist you can tick off before your appointment.'],
  ['Official source link', 'A direct link to the government or consulate page to confirm final requirements.'],
]

export default function PremiumReportPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PRODUCT_LD) }} />
      <h1 className="text-3xl font-bold text-gray-900">Premium Visa Report</h1>
      <p className="mt-2 text-gray-600">One report for your exact passport → destination pair, built from VisitPlane&apos;s visa data.</p>
      <p className="mt-4 text-4xl font-extrabold text-blue-700">Rs 2,000 <span className="text-base font-medium text-gray-500">one-time · PKR</span></p>

      <h2 className="mt-8 text-xl font-semibold text-gray-900">What&apos;s included</h2>
      <ul className="mt-3 space-y-3">
        {INCLUDES.map(([t, d]) => (
          <li key={t} className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="font-semibold text-gray-900">✓ {t}</p>
            <p className="mt-1 text-sm text-gray-600">{d}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 mb-3 text-xl font-semibold text-gray-900">Get your report</h2>
      <CheckoutForm />

      <p className="mt-6 text-xs text-gray-500">
        Guidance only — not legal or immigration advice, and no visa is guaranteed. Your report unlocks only after RapidGateway confirms your payment.
        Need help? <a className="underline" href="/contact">Contact us</a>.
      </p>
      <p className="mt-3 text-xs text-gray-500">
        Sold by VisitPlane, operated from Pakistan by Muhammad Hamad Ashraf. Support: hello@visitplane.com. Prices in PKR.{' '}
        <Link className="underline" href="/refund-policy">Refund Policy</Link> · <Link className="underline" href="/terms">Terms</Link> · <Link className="underline" href="/privacy">Privacy</Link>
      </p>
    </main>
  )
}
