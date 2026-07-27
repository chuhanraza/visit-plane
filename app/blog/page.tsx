import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { blogPosts, getAllCategories, toSlug, type BlogPost } from '@/src/lib/posts'
import { getBlogCardImage, CATEGORY_COLORS } from '@/utils/blogPhotos'
import BlogBreadcrumb from '@/components/blog/BlogBreadcrumb'
import BlogEmailCapture from '@/components/blog/BlogEmailCapture'
import RouteSearchBar from '@/components/blog/RouteSearchBar'

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

// Static Server Component — no searchParams read here, so this page keeps its
// static/ISR cacheability. Category browsing routes to the existing static
// /blog/category/[category] pages instead of a client-side re-filter (which
// would otherwise mean shipping the full post list to the browser as JS).
// Keyword search routes to /search, the only dynamic page in this flow.
const GRID_COUNT = 24

function ArrowRight({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

function CategoryPill({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className="flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium shadow-sm transition"
      style={
        active
          ? { background: 'var(--vp-green)', color: '#fff' }
          : { background: '#fff', color: 'var(--vp-body)', border: '1px solid var(--vp-hairline)' }
      }
    >
      {children}
    </Link>
  )
}

function FeaturedCard({ post }: { post: BlogPost }) {
  const catColor = CATEGORY_COLORS[post.category] ?? { bg: '#0d9488', text: '#fff' }
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative mb-8 block overflow-hidden rounded-2xl shadow-lg"
      style={{ border: '1px solid var(--vp-hairline)' }}
    >
      <div className="relative aspect-[16/9] sm:aspect-[21/9]">
        <Image
          src={getBlogCardImage(post.slug)}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1152px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />
      </div>

      <div className="absolute left-4 top-4 z-10 flex gap-2 sm:left-6 sm:top-6">
        <span className="rounded-full px-3 py-1 text-xs font-bold text-white shadow" style={{ backgroundColor: catColor.bg }}>
          {post.category}
        </span>
        <span className="rounded-full px-3 py-1 text-xs font-bold text-white shadow" style={{ background: 'var(--vp-stamp)' }}>
          Latest
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-8">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-white/60">
          {post.coverEmoji} {post.passportCountry} → {post.destinationCountry}
        </p>
        <h2 className="text-xl font-extrabold leading-tight text-white drop-shadow sm:text-2xl lg:text-3xl line-clamp-2">
          {post.title}
        </h2>
        <p className="mt-2 hidden max-w-2xl text-sm leading-relaxed text-white/75 line-clamp-2 sm:block">
          {post.excerpt}
        </p>
        <div className="mt-4 flex items-center gap-3 text-xs text-white/60 sm:text-sm">
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            {post.readTime}
          </span>
        </div>
      </div>
    </Link>
  )
}

function IndexPostCard({ post }: { post: BlogPost }) {
  const catColor = CATEGORY_COLORS[post.category] ?? { bg: '#0d9488', text: '#fff' }
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{ border: '1px solid var(--vp-hairline)' }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={getBlogCardImage(post.slug)}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/45 to-transparent" />
        <span
          className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow"
          style={{ backgroundColor: catColor.bg }}
        >
          {post.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <p className="text-xs" style={{ color: 'var(--vp-muted)' }}>
          {post.coverEmoji} {post.passportCountry} → {post.destinationCountry}
        </p>
        <h2 className="text-base font-bold leading-snug transition line-clamp-2" style={{ color: 'var(--vp-ink)' }}>
          {post.title}
        </h2>
        <p className="flex-1 text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--vp-muted)' }}>
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between border-t pt-3 text-xs" style={{ borderColor: 'var(--vp-hairline)' }}>
          <span style={{ color: 'var(--vp-muted)' }}>{post.readTime}</span>
          <span className="font-semibold transition" style={{ color: 'var(--vp-green)' }}>
            Read guide →
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function BlogPage() {
  const sorted = [...blogPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const [featured, ...rest] = sorted
  const grid = rest.slice(0, GRID_COUNT)
  const categories = getAllCategories()

  return (
    <div className="min-h-screen bg-white antialiased" style={{ color: 'var(--vp-ink)' }}>

      {/* ── COMPACT UTILITY HEADER (~260px, not a full-screen hero) ────────── */}
      <header style={{ background: 'var(--vp-paper)', borderBottom: '1px solid var(--vp-hairline)' }}>
        <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
          <BlogBreadcrumb items={[{ name: 'Home', href: '/' }, { name: 'Blog' }]} />
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-6 pt-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <div className="max-w-xl">
              <h1 className="text-2xl font-extrabold sm:text-[2rem]" style={{ color: 'var(--vp-ink)', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                Visa Guides for Every Passport
              </h1>
              <p className="mt-2 text-sm leading-relaxed sm:text-base" style={{ color: 'var(--vp-body)' }}>
                Know exactly what documents, fees, and processing times to expect — for 197 countries, verified against official sources.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--vp-muted)' }}>
                <span>{blogPosts.length}+ Guides</span>
                <span aria-hidden="true">·</span>
                <span>197 Countries</span>
                <span aria-hidden="true">·</span>
                <span style={{ color: 'var(--vp-green)' }}>100% Free</span>
              </div>
            </div>

            <div className="w-full sm:w-80">
              <RouteSearchBar />
            </div>
          </div>

          {/* Category pills — horizontally scrollable on mobile, zero client JS */}
          <nav
            aria-label="Blog categories"
            className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <CategoryPill href="/blog" active>All Posts</CategoryPill>
            {categories.map((cat) => (
              <CategoryPill key={cat} href={`/blog/category/${toSlug(cat)}`} active={false}>
                {cat}
              </CategoryPill>
            ))}
          </nav>
        </div>
      </header>

      {/* ── ARTICLE GRID — straight into content ────────────────────────────── */}
      <main className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {featured && <FeaturedCard post={featured} />}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {grid.map((post) => (
              <IndexPostCard key={post.slug} post={post} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="mb-4 text-sm" style={{ color: 'var(--vp-muted)' }}>
              Browse the full archive by topic, or search for your exact route above.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => (
                <CategoryPill key={cat} href={`/blog/category/${toSlug(cat)}`} active={false}>
                  {cat} →
                </CategoryPill>
              ))}
            </div>
          </div>

          <div className="mt-16">
            <BlogEmailCapture capturedFrom="blog_index" variant="strip" />
          </div>
        </div>
      </main>

      {/* ── CTA SECTION ────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--vp-ink)' }}>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Ready to check your visa requirements?
            </h2>
            <p className="mt-3 text-sm text-white/65">
              Get instant, accurate visa information for 197 countries — completely free.
            </p>
            <Link
              href="/"
              className="mt-7 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-105"
              style={{ background: 'var(--vp-green)' }}
            >
              Check Visa Requirements
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
