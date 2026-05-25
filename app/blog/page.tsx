import Link from 'next/link'
import Image from 'next/image'
import { blogPosts } from '@/src/lib/posts'
import type { Metadata } from 'next'
import BlogClientPage from './BlogClientPage'

export const metadata: Metadata = {
  title: 'Visa Blog — Expert Guides for Every Route | VisitPlane',
  description:
    'Expert visa guides for Pakistani and Indian travelers. Schengen, Dubai, UK, Canada, Australia, Germany, Japan, USA, and more. Updated 2026.',
  alternates: {
    canonical: 'https://www.visitplane.com/blog',
  },
  openGraph: {
    title: 'Visa Guides & Travel Tips — VisitPlane',
    description:
      'Expert visa guides for every passport and destination. Schengen, Dubai, UK, Canada, Australia, Germany, Japan, USA, and more.',
    type: 'website',
    url: 'https://www.visitplane.com/blog',
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

      {/* ── STICKY HEADER ──────────────────────────────────────────────────── */}{/* ── IMMERSIVE HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: '62vh' }}>
        {/* Deep indigo → teal gradient */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 45%, #0d9488 100%)' }}
        />

        {/* Subtle dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Floating glow blobs */}
        <div
          className="absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #0d9488, transparent)' }}
        />
        <div
          className="absolute -right-32 bottom-0 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #302b63, transparent)' }}
        />

        {/* Fade bottom into white */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent" />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">

          {/* Badge */}
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
            <span>✈️</span>
            <span>Visa Knowledge Hub · Updated 2026</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Travel Visa{' '}
            <span style={{ color: '#2dd4bf' }}>Guides</span>
          </h1>

          {/* Subtext */}
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/70">
            Expert guides for every route. Real information, beautifully presented.
          </p>

          {/* Stats row */}
          <div className="mt-12 flex justify-center gap-10 sm:gap-16">
            {[
              { number: `${blogPosts.length}+`, label: 'Visa Guides' },
              { number: '197', label: 'Countries Covered' },
              { number: '100%', label: 'Free Forever' },
            ].map(({ number, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold text-white sm:text-4xl">{number}</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-white/50">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POSTS: search + filter + featured + grid ───────────────────────── */}
      <main className="bg-[#FAFAFA]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <BlogClientPage posts={sorted} />
        </div>
      </main>

      {/* ── CTA SECTION ────────────────────────────────────────────────────── */}
      <section
        style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #0d9488 100%)' }}
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-4xl">🛂</p>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Ready to check your visa requirements?
            </h2>
            <p className="mt-3 text-sm text-white/70">
              Get instant, accurate visa information for 197 countries — completely free.
            </p>
            <Link
              href="/"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-[#0d9488] shadow-lg transition hover:scale-105 hover:shadow-xl"
            >
              Check Visa Requirements
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section></div>
  )
}
