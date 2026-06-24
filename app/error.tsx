'use client'

// Route-level error boundary. Renders INSIDE the root layout (SiteHeader/SiteFooter
// already present), so this is just the branded error body. Catches render/runtime
// errors on a route and offers a graceful recovery instead of a raw 500.
import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surface the error for diagnostics; no PII is logged.
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#FAFAFA] px-4 py-20 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-[#FEF2F2] text-5xl shadow-sm">
        ⚠️
      </div>
      <p className="text-sm font-bold uppercase tracking-widest text-rose-500">Something went wrong</p>
      <h1 className="mt-2 text-3xl font-extrabold text-[#1F2937] sm:text-4xl">
        We hit an unexpected error
      </h1>
      <p className="mx-auto mt-3 max-w-md text-base text-gray-500">
        This is on us, not you. You can try again, or head back home and continue
        checking your visa requirements.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full bg-[#14B8A6] px-7 py-3 text-sm font-semibold text-white shadow transition hover:bg-[#0d9488]"
        >
          ↻ Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-7 py-3 text-sm font-semibold text-[#1F2937] shadow-sm transition hover:border-teal-300"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
