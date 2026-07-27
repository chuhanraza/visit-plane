'use client'

import { useState } from 'react'

/**
 * Isolated client boundary so the rest of the blog index / search page stays
 * a Server Component. Submits as a native GET form to /search — works even
 * before hydration finishes; the clear button is the only real client state.
 */
export default function RouteSearchBar({
  defaultValue = '',
  placeholder = 'Search visa guides, countries, routes…',
}: {
  defaultValue?: string
  placeholder?: string
}) {
  const [value, setValue] = useState(defaultValue)

  return (
    <form
      action="/search"
      method="GET"
      role="search"
      aria-label="Search visa guides"
      className="relative w-full"
    >
      <svg
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
        style={{ color: 'var(--vp-muted)' }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search visa guides"
        className="h-12 w-full rounded-full bg-white pl-11 pr-11 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vp-green)]"
        style={{ border: '1px solid var(--vp-hairline)' }}
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue('')}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-lg leading-none transition hover:bg-black/5"
          style={{ color: 'var(--vp-muted)' }}
        >
          ×
        </button>
      )}
      <button type="submit" className="sr-only">
        Search
      </button>
    </form>
  )
}
