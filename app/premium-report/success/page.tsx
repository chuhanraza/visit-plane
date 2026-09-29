import { Suspense } from 'react'
import type { Metadata } from 'next'
import PaymentStatus from '../PaymentStatus'

export const metadata: Metadata = { title: 'Premium Visa Report — Payment Status | VisitPlane', robots: { index: false, follow: false } }

export default function Page() {
  return <Suspense fallback={null}><PaymentStatus landedOn="success" /></Suspense>
}
