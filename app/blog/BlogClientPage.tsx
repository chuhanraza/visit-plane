'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { type BlogPost, type BlogCategory, toSlug } from '@/src/lib/posts'
import { getBlogCardImage, getBlogHeroImage, CATEGORY_COLORS } from '@/utils/blogPhotos'
import BlogEmailCapture from '@/components/blog/BlogEmailCapture'

const ALL_CATEGORIES: Array<BlogCategory | 'All Posts'> = [
  'All Posts',
  'Visa Guides',
  'Country Guides',
  'Interview Prep',
  'Document Help',
  'Travel Tips',
]

const PAGE_SIZE = 20

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function SearchIcon() {
  return (
    <svg
      className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

// ── Featured "hero" card (first visible post) ───────────────────────────────
function FeaturedCard({ post }: { post: BlogPost }) {
  const imgUrl = getBlogHeroImage(post.slug)
  const catColor = CATEGORY_COLORS[post.category] ?? { bg: '#0d9488', text: '#fff' }

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative mb-10 block overflow-hidden rounded-3xl shadow-2xl"
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
        style={{ backgroundImage: `url(${imgUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/35 to-black/10" />

      <div className="absolute left-5 top-5 z-10">
        <span
          className="rounded-full px-3 py-1 text-xs font-bold text-white shadow-lg"
          style={{ backgroundColor: catColor.bg }}
        >
          {post.category}
        </span>
      </div>
      <div className="absolute right-5 top-5 z-10">
        <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-900 shadow-lg">
          ★ FEATURED
        </span>
      </div>

      <div className="relative z-10 px-6 pb-8 pt-56 sm:px-8 sm:pb-10 sm:pt-72">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/50">
          {post.coverEmoji} {post.passportCountry} → {post.destinationCountry}
        </p>

        <h2 className="text-2xl font-extrabold leading-tight text-white drop-shadow sm:text-3xl lg:text-4xl line-clamp-2">
          {post.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-white/75 line-clamp-2 sm:text-base">
          {post.excerpt}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-white/60 sm:text-sm">
            <span className="flex items-center gap-1">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
              {post.readTime}
            </span>
            <span>·</span>
            <span>{formatDate(post.date)}</span>
          </div>
          <span className="rounded-full bg-white/20 px-5 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors duration-200 group-hover:bg-white group-hover:text-[#0d9488]">
            Read Guide →
          </span>
        </div>
      </div>
    </Link>
  )
}

// ── Regular grid card ───────────────────────────────────────────────────────
function PostCard({ post }: { post: BlogPost }) {
  const imgUrl = getBlogCardImage(post.slug)
  const catColor = CATEGORY_COLORS[post.category] ?? { bg: '#0d9488', text: '#fff' }

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:ring-[#10B981]/30"
    >
      <div className="relative h-52 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.06]"
          style={{ backgroundImage: `url(${imgUrl})` }}
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute left-3 top-3">
          <span
            className="rounded-full px-2.5 py-1 text-xs font-bold text-white shadow"
            style={{ backgroundColor: catColor.bg }}
          >
            {post.category}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-xs text-gray-400">
          {post.coverEmoji} {post.passportCountry} → {post.destinationCountry}
        </p>

        <h2 className="text-base font-bold leading-snug text-[#1A1A1A] transition group-hover:text-[#10B981] line-clamp-2">
          {post.title}
        </h2>

        <p className="flex-1 text-sm leading-relaxed text-gray-500 line-clamp-3">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            {post.readTime}
            <span aria-hidden="true">·</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </div>
          <span className="text-xs font-semibold text-[#10B981] transition group-hover:text-[#059669]">
            Read Guide →
          </span>
        </div>
      </div>
    </Link>
  )
}

// ── Compact card for horizontal carousels ───────────────────────────────────
function CarouselCard({ post }: { post: BlogPost }) {
  const imgUrl = getBlogCardImage(post.slug)
  const catColor = CATEGORY_COLORS[post.category] ?? { bg: '#0d9488', text: '#fff' }
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex w-64 flex-shrink-0 flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-[#10B981]/30"
    >
      <div className="relative h-36 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${imgUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
        <span
          className="absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow"
          style={{ backgroundColor: catColor.bg }}
        >
          {post.category}
        </span>
        <p className="absolute bottom-2.5 left-2.5 right-2.5 text-sm font-bold leading-snug text-white line-clamp-2 drop-shadow">
          {post.title}
        </p>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xs text-gray-400">{post.readTime}</span>
        <span className="text-xs font-semibold text-[#10B981] group-hover:text-[#059669]">Read →</span>
      </div>
    </Link>
  )
}

function Carousel({ title, posts }: { title: string; posts: BlogPost[] }) {
  const scroller = useRef<HTMLDivElement>(null)
  if (posts.length === 0) return null
  const scrollBy = (dir: number) => {
    scroller.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }
  return (
    <section className="mt-14">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#1A1A1A]">{title}</h3>
        <div className="hidden gap-2 sm:flex">
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="grid h-8 w-8 place-items-center rounded-full bg-white text-gray-500 ring-1 ring-gray-200 transition hover:text-[#10B981]"
          >
            ‹
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="grid h-8 w-8 place-items-center rounded-full bg-white text-gray-500 ring-1 ring-gray-200 transition hover:text-[#10B981]"
          >
            ›
          </button>
        </div>
      </div>
      <div
        ref={scroller}
        className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {posts.map((post) => (
          <CarouselCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  )
}

// ── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white py-24 text-center">
      <span className="mb-4 text-5xl">🔍</span>
      <p className="text-base font-semibold text-gray-700">No results found</p>
      <p className="mt-2 text-sm text-gray-400">
        {query
          ? `No guides match "${query}". Try a different search term.`
          : 'No posts in this category yet. Check back soon!'}
      </p>
    </div>
  )
}

// ── Main export ─────────────────────────────────────────────────────────────
export default function BlogClientPage({ posts }: { posts: BlogPost[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Active category is derived from the ?category= slug in the URL.
  const categoryParam = searchParams.get('category')
  const activeCategory: BlogCategory | 'All Posts' = useMemo(() => {
    if (!categoryParam) return 'All Posts'
    const match = ALL_CATEGORIES.find(
      (c) => c !== 'All Posts' && toSlug(c) === categoryParam,
    )
    return (match as BlogCategory) ?? 'All Posts'
  }, [categoryParam])

  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const setCategory = useCallback(
    (cat: BlogCategory | 'All Posts') => {
      const params = new URLSearchParams(searchParams.toString())
      if (cat === 'All Posts') params.delete('category')
      else params.set('category', toSlug(cat))
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
      setVisibleCount(PAGE_SIZE) // reset pagination on filter change
    },
    [router, pathname, searchParams],
  )

  const onSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    setVisibleCount(PAGE_SIZE) // reset pagination on new search
  }, [])

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        activeCategory === 'All Posts' || post.category === activeCategory
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [posts, activeCategory, searchQuery])

  const [featured, ...rest] = filtered
  const visibleRest = rest.slice(0, visibleCount)
  const hasMore = rest.length > visibleCount

  // Curated rails — default, unfiltered view only. Exclude the featured post so
  // the rails surface different content than the hero + grid (no duplicate cards).
  const showCarousels = activeCategory === 'All Posts' && !searchQuery.trim()
  const featuredSlug = featured?.slug
  const pool = useMemo(() => posts.filter((p) => p.slug !== featuredSlug), [posts, featuredSlug])

  // Editor's Picks: interleave one post per category for variety (not just newest).
  const editorsPicks = useMemo(() => {
    const queues = new Map<string, BlogPost[]>()
    for (const p of pool) {
      const q = queues.get(p.category) ?? []
      q.push(p)
      queues.set(p.category, q)
    }
    const lists = [...queues.values()]
    const out: BlogPost[] = []
    let i = 0
    while (out.length < 8 && lists.some((l) => l.length > 0)) {
      const list = lists[i % lists.length]
      const next = list.shift()
      if (next) out.push(next)
      i++
    }
    return out
  }, [pool])

  const byDestination = useMemo(
    () => pool.filter((p) => p.category === 'Visa Guides' || p.category === 'Country Guides').slice(0, 8),
    [pool],
  )
  const tipsAndKnowledge = useMemo(
    () => pool.filter((p) => p.category === 'Travel Tips' || p.category === 'Document Help').slice(0, 8),
    [pool],
  )

  return (
    <div>
      {/* ── Search + Filter bar ───────────────────────────────────────────── */}
      <div className="mb-12 space-y-5">
        <div className="relative mx-auto max-w-xl">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search visa guides, countries, routes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm shadow-sm transition focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category pills — horizontally scrollable on mobile */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                activeCategory === cat
                  ? 'bg-[#10B981] text-white shadow-md'
                  : 'bg-white text-gray-500 ring-1 ring-gray-200 shadow-sm hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {searchQuery.trim() && (
          <p className="text-center text-sm text-gray-500">
            <span className="font-semibold text-[#1A1A1A]">{filtered.length}</span>{' '}
            {filtered.length === 1 ? 'result' : 'results'} for &ldquo;{searchQuery}&rdquo;
          </p>
        )}
      </div>

      {/* ── Posts ─────────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState query={searchQuery} />
      ) : (
        <>
          {featured && <FeaturedCard post={featured} />}

          {/* Curated rails — early discovery, distinct from the archive grid */}
          {showCarousels && (
            <>
              <Carousel title="⭐ Editor's Picks" posts={editorsPicks} />
              <Carousel title="✈️ Visa Guides by Destination" posts={byDestination} />
              <Carousel title="💡 Visa Tips & Insider Knowledge" posts={tipsAndKnowledge} />
            </>
          )}

          {/* Full archive */}
          {visibleRest.length > 0 && (
            <div className={showCarousels ? 'mt-16' : ''}>
              {showCarousels && (
                <h3 className="mb-5 text-lg font-bold text-[#1A1A1A]">📰 All Visa Guides</h3>
              )}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleRest.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </div>
          )}

          {hasMore && (
            <div className="mt-10 text-center">
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="inline-flex items-center gap-2 rounded-full bg-[#10B981] px-7 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#059669]"
              >
                Load more guides
                <span className="text-white/70">({rest.length - visibleCount} left)</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Email capture strip ───────────────────────────────────────────── */}
      <div className="mt-16">
        <BlogEmailCapture capturedFrom="blog_index" variant="strip" />
      </div>
    </div>
  )
}
