'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { type BlogPost, type BlogCategory } from '@/src/lib/posts'
import { getBlogCardImage, CATEGORY_COLORS } from '@/utils/blogPhotos'

const ALL_CATEGORIES: Array<BlogCategory | 'All Posts'> = [
  'All Posts',
  'Visa Guides',
  'Country Guides',
  'Interview Prep',
  'Document Help',
  'Travel Tips',
]

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
  const imgUrl = getBlogCardImage(post.slug)
  const catColor = CATEGORY_COLORS[post.category] ?? { bg: '#0d9488', text: '#fff' }

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative mb-10 block overflow-hidden rounded-3xl shadow-2xl"
    >
      {/* Background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
        style={{ backgroundImage: `url(${imgUrl})` }}
      />
      {/* Dark gradient — heavier at the bottom where text sits */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/35 to-black/10" />

      {/* Category badge (top-left) */}
      <div className="absolute left-5 top-5 z-10">
        <span
          className="rounded-full px-3 py-1 text-xs font-bold text-white shadow-lg"
          style={{ backgroundColor: catColor.bg }}
        >
          {post.category}
        </span>
      </div>
      {/* FEATURED badge (top-right) */}
      <div className="absolute right-5 top-5 z-10">
        <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-900 shadow-lg">
          ★ FEATURED
        </span>
      </div>

      {/* Content — sits at the bottom */}
      <div className="relative z-10 px-6 pb-8 pt-56 sm:px-8 sm:pb-10 sm:pt-72">
        {/* Route indicator */}
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
      {/* Photo section */}
      <div className="relative h-52 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.06]"
          style={{ backgroundImage: `url(${imgUrl})` }}
        />
        {/* Subtle bottom gradient on photo */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
        {/* Category badge */}
        <div className="absolute left-3 top-3">
          <span
            className="rounded-full px-2.5 py-1 text-xs font-bold text-white shadow"
            style={{ backgroundColor: catColor.bg }}
          >
            {post.category}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Route */}
        <p className="text-xs text-gray-400">
          {post.coverEmoji} {post.passportCountry} → {post.destinationCountry}
        </p>

        {/* Title */}
        <h2 className="text-base font-bold leading-snug text-[#1A1A1A] transition group-hover:text-[#10B981] line-clamp-2">
          {post.title}
        </h2>

        {/* Excerpt */}
        <p className="flex-1 text-sm leading-relaxed text-gray-500 line-clamp-3">
          {post.excerpt}
        </p>

        {/* Footer row */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            {post.readTime}
          </div>
          <span className="text-xs font-semibold text-[#10B981] transition group-hover:text-[#059669]">
            Read Guide →
          </span>
        </div>
      </div>
    </Link>
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
  const [activeCategory, setActiveCategory] = useState<BlogCategory | 'All Posts'>('All Posts')
  const [searchQuery, setSearchQuery] = useState('')

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

  return (
    <div>
      {/* ── Search + Filter bar ───────────────────────────────────────────── */}
      <div className="mb-12 space-y-5">
        {/* Search */}
        <div className="relative mx-auto max-w-xl">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search visa guides, countries, routes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm shadow-sm transition focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeCategory === cat
                  ? 'bg-[#10B981] text-white shadow-md'
                  : 'bg-white text-gray-500 ring-1 ring-gray-200 shadow-sm hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
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
          {/* Featured (first result — large immersive card) */}
          {featured && <FeaturedCard post={featured} />}

          {/* Remaining posts in 3-column grid */}
          {rest.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
