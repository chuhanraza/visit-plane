import Link from 'next/link'
import Image from 'next/image'
import { blogPosts } from '@/src/lib/posts'
import type { Metadata } from 'next'
import BlogClientPage from './BlogClientPage'

export const metadata: Metadata = {
  title: 'Visa Blog — Expert Guides for Every Route | VisitPlane',
  description:
    'Expert visa guides for Pakistani and Indian travelers. Schengen, Dubai, UK, Canada, Australia, Germany, Japan, USA, and more. Updated 2026.',
  openGraph: {
    title: 'Visa Guides & Travel Tips — VisitPlane',
    description:
      'Expert visa guides for every passport and destination. Schengen, Dubai, UK, Canada, Australia, Germany, Japan, USA, and more.',
    type: 'website',
    url: 'https://visitplane.com/blog',
  },
}

function ArrowRight({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

export default function BlogPage() {
  const sorted = [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] antialiased">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <Image src="/logo-v2.png" alt="VisitPlane" width={36} height={36} className="rounded-xl" />
            <span className="text-lg font-semibold tracking-tight">
              <span className="text-[#1A1A1A]">Visit</span>
              <span className="text-[#10B981]">Plane</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/destinations" className="text-sm text-gray-500 transition hover:text-[#1A1A1A]">Explore</Link>
            <Link href="/visa-requirements" className="text-sm text-gray-500 transition hover:text-[#1A1A1A]">Visa Requirements</Link>
            <Link href="/blog" className="text-sm font-medium text-[#10B981]">Blog</Link>
          </nav>

          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full bg-[#10B981] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#059669]"
          >
            Check Visa
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-gray-100 bg-gradient-to-b from-[#F0FDF4] to-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#10B981]">Visa Knowledge Base</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#1A1A1A] sm:text-5xl">
              Visa Guides &amp; Travel Tips
            </h1>
            <p className="mt-4 text-base text-gray-500">
              Expert guides to help you navigate visa requirements, documentation, and processes
              for destinations around the world.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive posts section: search + filter + grid */}
      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <BlogClientPage posts={sorted} />
      </main>

      {/* CTA */}
      <section className="border-t border-gray-100 bg-[#F0FDF4]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-[#1A1A1A]">
              Ready to check your visa requirements?
            </h2>
            <p className="mt-3 text-sm text-gray-500">
              Get instant, accurate visa information for 197 countries — completely free.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#10B981] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#059669]"
            >
              Check Visa Requirements
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-gray-400 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Image src="/logo-v2.png" alt="VisitPlane" width={20} height={20} className="rounded" />
            <span>
              <span className="text-gray-600">Visit</span>
              <span className="text-[#10B981]">Plane</span>
              <span className="ml-2">© {new Date().getFullYear()}</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="transition hover:text-gray-600">Privacy</Link>
            <Link href="/terms" className="transition hover:text-gray-600">Terms</Link>
            <Link href="/contact" className="transition hover:text-gray-600">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
