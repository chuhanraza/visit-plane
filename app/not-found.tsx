import Link from 'next/link'
import type { Metadata } from 'next'

// Renders INSIDE the root layout, so SiteHeader/SiteFooter are already present —
// this file only supplies the branded 404 body. Returning a proper not-found
// boundary makes unmatched routes resolve as HTTP 404 (not a 500), protecting
// crawl health and first-impression trust.
export const metadata: Metadata = {
  title: 'Page Not Found (404) | VisitPlane',
  robots: { index: false, follow: true },
}

const LINKS = [
  { href: '/',             emoji: '🏠', label: 'Home',            desc: 'Check visa requirements for any route' },
  { href: '/destinations', emoji: '🌍', label: 'Destinations',   desc: 'Browse all 197 countries' },
  { href: '/visa-checker', emoji: '🧰', label: 'Visa Tools',     desc: 'Checker, wizard, passport strength & more' },
  { href: '/blog',         emoji: '📰', label: 'Travel Guides',  desc: 'In-depth, official-source-checked guides' },
]

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#FAFAFA] px-4 py-20 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-[#F0FDFA] text-5xl shadow-sm">
        🧭
      </div>
      <p className="text-sm font-bold uppercase tracking-widest text-teal-600">404 — Page not found</p>
      <h1 className="mt-2 text-3xl font-extrabold text-[#1F2937] sm:text-4xl">
        This page took a wrong turn
      </h1>
      <p className="mx-auto mt-3 max-w-md text-base text-gray-500">
        The page you’re looking for doesn’t exist or may have moved. Here are some
        good places to pick things back up:
      </p>

      <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
        {LINKS.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
          >
            <span className="text-2xl leading-none">{l.emoji}</span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-[#1F2937]">{l.label}</span>
              <span className="block text-xs text-gray-500">{l.desc}</span>
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#14B8A6] px-7 py-3 text-sm font-semibold text-white shadow transition hover:bg-[#0d9488]"
      >
        ← Back to VisitPlane home
      </Link>
    </div>
  )
}
