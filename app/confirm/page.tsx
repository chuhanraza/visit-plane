import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Confirm Subscription — VisitPlane',
  robots: { index: false },
}

interface Props {
  searchParams: Promise<{ token?: string; status?: string }>
}

export default async function ConfirmPage({ searchParams }: Props) {
  const { token, status } = await searchParams

  // If we have a raw token (direct link click before server redirect), trigger the API
  if (token && !status) {
    // Server-side redirect to the API route which handles DB update then redirects back
    const { redirect } = await import('next/navigation')
    redirect(`/api/confirm?token=${encodeURIComponent(token)}`)
  }

  const isOk = status === 'ok' || status === 'already'

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10">
          {isOk ? (
            <>
              <div className="text-5xl mb-4">✅</div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-3">
                You&apos;re confirmed!
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                {status === 'already'
                  ? "You're already confirmed — you're all set."
                  : "Your subscription is active. We'll notify you as soon as visa rules change for your route."}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-teal-600 transition"
              >
                Continue exploring →
              </Link>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">❌</div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-3">
                Invalid link
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                This confirmation link is invalid or has already been used.
                If you need help, contact us at{' '}
                <a href="mailto:support@visitplane.com" className="text-teal-600 underline">
                  support@visitplane.com
                </a>
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-200 transition"
              >
                Back to home
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
