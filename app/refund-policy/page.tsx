import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Refund Policy | VisitPlane',
  description: 'Refund and cancellation terms for the VisitPlane Premium Visa Report (Rs 2,000, one-time, PKR): when you can get a refund and how to ask.',
  alternates: { canonical: 'https://www.visitplane.com/refund-policy' },
}

const sections: [string, string][] = [
  ['What this covers', 'This policy applies to the Premium Visa Report, a one-time Rs 2,000 (PKR) digital report for one passport and destination pair. All other VisitPlane content is free.'],
  ['When you get a refund', 'We refund the full amount if: (1) you were charged but the report did not unlock or could not be delivered and we cannot fix it within 3 working days; (2) you were charged more than once for the same order; or (3) the report was generated for a different passport or destination than the one you selected at checkout and we cannot correct it.'],
  ['When we cannot refund', 'Because the report is a digital product delivered immediately after payment, we cannot refund because you changed your mind, changed your travel plans, or were refused a visa. The report is guidance, not a guarantee of any visa or entry decision, and visa rules can change after delivery.'],
  ['How to ask', 'Email hello@visitplane.com or use the Contact page within 7 days of payment. Include the email address you used at checkout and your order reference if you have it. We reply within 2 working days.'],
  ['How refunds are paid', 'Approved refunds go back to the original payment method through our payment provider, RapidGateway. Timing depends on your bank or wallet, usually 5 to 10 working days after approval.'],
  ['Cancellation', 'An order can be cancelled before payment is completed. Once payment is confirmed and the report has unlocked, it cannot be cancelled except under the refund conditions above.'],
]

export default function RefundPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Refund Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: October 8, 2026</p>
      <div className="mt-6 space-y-4">
        {sections.map(([t, b]) => (
          <section key={t} className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-gray-900">{t}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{b}</p>
          </section>
        ))}
      </div>
      <p className="mt-6 text-sm text-gray-600">
        See also our <Link className="underline" href="/terms">Terms of Service</Link>, <Link className="underline" href="/privacy">Privacy Policy</Link> and the <Link className="underline" href="/premium-report">Premium Visa Report</Link> page.
      </p>
    </main>
  )
}
