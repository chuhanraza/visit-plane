import Link from 'next/link'
import type { Metadata } from 'next'
import { searchPosts, blogPosts } from '@/src/lib/posts'
import BlogBreadcrumb from '@/components/blog/BlogBreadcrumb'
import PostGrid from '@/components/blog/PostGrid'
import RouteSearchBar from '@/components/blog/RouteSearchBar'

// Query-driven results page — inherently per-request, and noindexed like any
// internal site search (avoids thin/duplicate-content indexation) while still
// being fully crawlable/linkable for users.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}): Promise<Metadata> {
  const { q } = await searchParams
  const query = (q ?? '').trim()
  return {
    title: query ? `“${query}” — Search VisitPlane Visa Guides` : 'Search Visa Guides — VisitPlane',
    description: `Search ${blogPosts.length}+ VisitPlane visa guides by country, route, or topic.`,
    robots: { index: false, follow: true },
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = (q ?? '').trim()
  const results = query ? searchPosts(query) : []

  return (
    <div className="min-h-screen bg-white antialiased" style={{ color: 'var(--vp-ink)' }}>
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <BlogBreadcrumb items={[{ name: 'Home', href: '/' }, { name: 'Blog', href: '/blog' }, { name: 'Search' }]} />
      </div>

      <header className="mx-auto max-w-7xl px-4 pb-2 pt-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ color: 'var(--vp-ink)' }}>
          Search visa guides
        </h1>
        <div className="mt-5 max-w-xl">
          <RouteSearchBar defaultValue={query} />
        </div>
        {query && (
          <p className="mt-4 text-sm" style={{ color: 'var(--vp-muted)' }}>
            <span className="font-semibold" style={{ color: 'var(--vp-ink)' }}>{results.length}</span>{' '}
            {results.length === 1 ? 'result' : 'results'} for &ldquo;{query}&rdquo;
          </p>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {!query ? (
          <p className="py-16 text-center text-sm" style={{ color: 'var(--vp-muted)' }}>
            Try a country, route, or topic — e.g. &ldquo;Schengen&rdquo;, &ldquo;Dubai tourist visa&rdquo;, or &ldquo;proof of funds&rdquo;.
          </p>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl py-20 text-center" style={{ border: '1px dashed var(--vp-hairline)' }}>
            <p className="text-base font-semibold" style={{ color: 'var(--vp-ink)' }}>No guides match &ldquo;{query}&rdquo;</p>
            <p className="mt-2 text-sm" style={{ color: 'var(--vp-muted)' }}>Try a different country, route, or shorter keyword.</p>
            <Link
              href="/blog"
              className="mt-6 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: 'var(--vp-green)' }}
            >
              Browse all guides →
            </Link>
          </div>
        ) : (
          <PostGrid posts={results} />
        )}
      </main>
    </div>
  )
}
