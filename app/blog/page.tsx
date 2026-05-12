import Link from 'next/link'
import Image from 'next/image'
import { blogPosts } from '@/src/lib/posts'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Visa Blog — VisitPlane',
  description:
    'Expert visa guides for Pakistani and Indian travelers. Schengen, Dubai, UK, Canada, Australia, Germany, Japan, USA, and more.',
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
            <Link href="/destinations" className="text-sm text-gray-500 transition hover:text-[#1A1A1A]">Destinations</Link>
            <Link href="/how-it-works" className="text-sm text-gray-500 transition hover:text-[#1A1A1A]">How it Works</Link>
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
            <p className="text-xs font-medium uppercase tracking-wider text-[#10B981]">Visa Knowledge Base</p>
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

      {/* Posts grid */}
      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#10B981]/30 hover:shadow-md"
            >
              {/* Cover */}
              <div className="flex h-36 items-center justify-center bg-gradient-to-br from-[#F0FDF4] to-[#ECFDF5] text-6xl">
                {post.coverEmoji}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-[#F0FDF4] px-2.5 py-0.5 text-xs font-medium text-[#10B981] ring-1 ring-inset ring-[#10B981]/20">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400">{post.readTime}</span>
                </div>

                <h2 className="text-base font-semibold leading-snug text-[#1A1A1A] transition group-hover:text-[#10B981]">
                  {post.title}
                </h2>

                <p className="flex-1 text-sm leading-relaxed text-gray-500 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <time className="text-xs text-gray-400" dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <ArrowRight className="h-4 w-4 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-[#10B981]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
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
