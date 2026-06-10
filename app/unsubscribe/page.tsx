import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Unsubscribe — VisitPlane',
  robots: { index: false },
}

interface Props {
  searchParams: Promise<{ token?: string; status?: string }>
}

export default async function UnsubscribePage({ searchParams }: Props) {
  const { token, status } = await searchParams

  // Raw token — hand off to API route
  if (token && !status) {
    const { redirect } = await import('next/navigation')
    redirect(`/api/unsubscribe?token=${encodeURIComponent(token)}`)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10">
          {status === 'ok' ? (
            <>
              <div className="text-5xl mb-4">👋</div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-3">
                You&apos;ve been unsubscribed
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                You&apos;ll no longer receive visa update alerts from VisitPlane.
                You can resubscribe any time from the homepage.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-teal-600 transition"
                >
                  Back to home
                </Link>
                <Link
                  href="/#email-capture"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-200 transition"
                >
                  Resubscribe
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">🤔</div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-3">
                Invalid unsubscribe link
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                This link is invalid or you&apos;ve already been unsubscribed.
                If you&apos;re still receiving emails, contact{' '}
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
