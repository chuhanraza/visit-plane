'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'

// ── Reading Progress Bar ───────────────────────────────────────────────────────
export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0)
    }
    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress()
    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  return (
    <div className="fixed left-0 right-0 top-0 z-[60] h-1 bg-gray-200/60">
      <div
        className="h-full bg-[#10B981] transition-[width] duration-100 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

// ── Table of Contents ─────────────────────────────────────────────────────────
interface Heading {
  id: string
  text: string
  level: number
}

function extractHeadings(contentHtml: string): Heading[] {
  if (typeof window === 'undefined') return []
  const parser = new DOMParser()
  const doc = parser.parseFromString(contentHtml, 'text/html')
  const els = doc.querySelectorAll('h2, h3')
  return Array.from(els).map((el, i) => ({
    id: `heading-${i}`,
    text: el.textContent?.trim() ?? '',
    level: parseInt(el.tagName[1], 10),
  }))
}

export function TableOfContents({ contentHtml }: { contentHtml: string }) {
  const headings = useMemo(() => extractHeadings(contentHtml), [contentHtml])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 3) return null

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const offset = 80 // account for sticky header
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <nav
      aria-label="Table of contents"
      className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Contents
      </p>
      <ul className="space-y-1">
        {headings.map((h) => (
          <li key={h.id}>
            <button
              onClick={() => handleClick(h.id)}
              className={`w-full text-left text-sm transition-colors duration-150 ${
                h.level === 3 ? 'pl-4' : ''
              } ${
                activeId === h.id
                  ? 'font-semibold text-[#10B981]'
                  : 'text-gray-500 hover:text-[#1A1A1A]'
              }`}
            >
              <span
                className={`mr-2 inline-block h-1 w-1 rounded-full align-middle ${
                  activeId === h.id ? 'bg-[#10B981]' : 'bg-gray-300'
                }`}
              />
              {h.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// ── Social Share Buttons ───────────────────────────────────────────────────────
export function SocialShare({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false)

  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}/blog/${slug}`
      : `https://visitplane.com/blog/${slug}`

  const waText = encodeURIComponent(
    `Check this visa guide: ${title} — ${url}`
  )
  const tweetText = encodeURIComponent(`${title} ${url}`)

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [url])

  return (
    <>
      {/* Desktop: fixed vertical strip on left */}
      <div className="fixed left-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-3 xl:flex">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Share
        </p>
        {/* WhatsApp */}
        <a
          href={`https://wa.me/?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on WhatsApp"
          className="grid h-10 w-10 place-items-center rounded-full bg-[#25D366] text-white shadow-sm transition hover:scale-110 hover:shadow-md"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </a>
        {/* Twitter / X */}
        <a
          href={`https://twitter.com/intent/tweet?text=${tweetText}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on X / Twitter"
          className="grid h-10 w-10 place-items-center rounded-full bg-[#1A1A1A] text-white shadow-sm transition hover:scale-110 hover:shadow-md"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.733-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
        {/* Copy link */}
        <button
          onClick={copyLink}
          title="Copy link"
          className={`grid h-10 w-10 place-items-center rounded-full shadow-sm transition hover:scale-110 hover:shadow-md ${
            copied
              ? 'bg-[#10B981] text-white'
              : 'bg-white text-gray-500 ring-1 ring-gray-200 hover:text-[#1A1A1A]'
          }`}
        >
          {copied ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile: inline horizontal bar above footer */}
      <div className="mt-8 flex items-center justify-center gap-3 xl:hidden">
        <span className="text-xs font-semibold text-gray-400">Share:</span>
        <a
          href={`https://wa.me/?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="grid h-9 w-9 place-items-center rounded-full bg-[#25D366] text-white shadow-sm"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${tweetText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="grid h-9 w-9 place-items-center rounded-full bg-[#1A1A1A] text-white shadow-sm"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.733-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
        <button
          onClick={copyLink}
          className={`grid h-9 w-9 place-items-center rounded-full shadow-sm ring-1 transition ${
            copied ? 'bg-[#10B981] text-white ring-[#10B981]' : 'bg-white text-gray-500 ring-gray-200'
          }`}
        >
          {copied ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          )}
        </button>
      </div>
    </>
  )
}
