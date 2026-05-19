'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { type BlogPost, type BlogCategory } from '@/src/lib/posts'

const ALL_CATEGORIES: Array<BlogCategory | 'All Posts'> = [
  'All Posts',
  'Visa Guides',
  'Country Guides',
  'Interview Prep',
  'Document Help',
  'Travel Tips',
]

function SearchIcon() {
  return (
    <svg
      className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
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

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#10B981]/30 hover:shadow-lg"
    >
      {/* Cover */}
      <div className="flex h-36 items-center justify-center bg-gradient-to-br from-[#F0FDF4] to-[#ECFDF5] text-6xl">
        {post.coverEmoji}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Category + read time */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#F0FDF4] px-2.5 py-0.5 text-xs font-semibold text-[#10B981] ring-1 ring-inset ring-[#10B981]/20">
            {post.category}
          </span>
          <span className="text-xs text-gray-400">{post.readTime}</span>
        </div>

        {/* Title */}
        <h2 className="text-base font-semibold leading-snug text-[#1A1A1A] transition group-hover:text-[#10B981] line-clamp-2">
          {post.title}
        </h2>

        {/* Excerpt */}
        <p className="flex-1 text-sm leading-relaxed text-gray-500 line-clamp-2">
          {post.excerpt}
        </p>

        {/* Footer row */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <time className="text-xs text-gray-400" dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </time>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#10B981] transition group-hover:gap-2.5">
            Read Guide
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-20 text-center">
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

  const showResultsCount = searchQuery.trim().length > 0

  return (
    <div>
      {/* Search + Filter bar */}
      <div className="mb-10 space-y-4">
        {/* Search input */}
        <div className="relative mx-auto max-w-xl">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search visa guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
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
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                activeCategory === cat
                  ? 'bg-[#10B981] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        {showResultsCount && (
          <p className="text-center text-sm text-gray-500">
            <span className="font-semibold text-[#1A1A1A]">{filtered.length}</span>{' '}
            {filtered.length === 1 ? 'result' : 'results'} for &ldquo;{searchQuery}&rdquo;
          </p>
        )}
      </div>

      {/* Posts grid or empty state */}
      {filtered.length === 0 ? (
        <EmptyState query={searchQuery} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
