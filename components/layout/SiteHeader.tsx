'use client'

/**
 * This is the canonical site header for VisitPlane — used on every surface.
 * Do not create alternative header or navbar components.
 *
 * Features:
 *   - Sticky with shadow-on-scroll (no layout shift — height fixed at 64px)
 *   - Desktop: Destinations | Tools ▼ (mega-menu) | Blog | 🌐 Lang | ⚡ Search | [Check My Visa →]
 *   - Mobile: Logo + ☰, slide-down menu with accordion Tools
 *   - Cmd+K / Ctrl+K opens CommandPalette (via CommandPaletteContext)
 *   - Smart CTA: scrolls if on /visa/X/Y, pre-sets passport from localStorage, else home
 *   - ARIA roles, keyboard navigation, visible focus rings throughout
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import LanguageSwitcher from '@/app/components/LanguageSwitcher'
import { useCommandPalette } from './CommandPaletteContext'

// ─── Tools data ───────────────────────────────────────────────────────────────

const TOOLS = [
  // Column left — Quick Tools
  { href: '/visa-free-map',       emoji: '🗺️', name: 'Visa-Free Map',       desc: 'See where you can travel',      col: 'left'  },
  { href: '/passport-strength',   emoji: '💪', name: 'Passport Strength',    desc: 'Your passport power score',     col: 'left'  },
  { href: '/wizard',              emoji: '🤖', name: 'AI Visa Wizard',       desc: 'AI-powered visa guide',         col: 'left'  },
  { href: '/compare',             emoji: '⚖️', name: 'Compare Visas',        desc: 'Side by side comparison',       col: 'left'  },
  { href: '/checklist',           emoji: '📋', name: 'Document Checklist',   desc: 'Never miss a document',         col: 'left'  },
  { href: '/processing-times',    emoji: '⏱️', name: 'Processing Times',     desc: 'How long will it take?',        col: 'left'  },
  { href: '/passport-scanner',    emoji: '🆔', name: 'Passport Scanner',     desc: 'Scan MRZ & get photos',         col: 'left'  },
  { href: '/visa-checker',        emoji: '📸', name: 'Visa Photo Generator', desc: 'Approval probability quiz',     col: 'left'  },
  // Column right — More Tools
  { href: '/cost-calculator',     emoji: '💰', name: 'Cost Calculator',      desc: 'Total visa cost estimate',      col: 'right' },
  { href: '/embassy-finder',      emoji: '🏛️', name: 'Embassy Finder',       desc: 'Addresses & contact info',      col: 'right' },
  { href: '/currency-converter',  emoji: '💱', name: 'Currency Converter',   desc: 'Real-time exchange rates',      col: 'right' },
  { href: '/travel-insurance',    emoji: '🛡️', name: 'Travel Insurance',     desc: 'Compare plans instantly',       col: 'right' },
  { href: '/visa-tracker',        emoji: '📊', name: 'Visa Tracker',         desc: 'Track your applications',       col: 'right' },
  { href: '/interview-prep',      emoji: '🎤', name: 'Interview Prep',       desc: 'Practice your answers',         col: 'right' },
  { href: '/itinerary-generator', emoji: '✈️', name: 'Itinerary Generator',  desc: 'Flight & hotel PDF',            col: 'right' },
  { href: '/visa-vault',          emoji: '🔐', name: 'Visa Vault',           desc: 'Save your travel profile',      col: 'right' },
]

const TOOL_PATHS = TOOLS.map((t) => t.href)

// ─── Smart CTA logic ──────────────────────────────────────────────────────────

function useSmartCta(pathname: string) {
  const router = useRouter()

  return useCallback(() => {
    // Already on a visa detail page → scroll to top
    if (pathname.startsWith('/visa/') || pathname.match(/^\/[a-z-]+-to-[a-z-]+-visa-requirements/)) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Has a saved passport in localStorage → go to destinations with it pre-set
    try {
      const saved = localStorage.getItem('selectedPassport')
      if (saved) {
        router.push(`/destinations?passport=${encodeURIComponent(saved)}`)
        return
      }
    } catch {
      // localStorage not available (SSR guard)
    }

    // Default → home, focus the passport field
    router.push('/#passport-selector')
  }, [pathname, router])
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SiteHeader() {
  const pathname  = usePathname()
  const locale    = useLocale()
  const { openPalette } = useCommandPalette()
  const handleCta = useSmartCta(pathname)

  const [toolsOpen,       setToolsOpen]       = useState(false)
  const [mobileOpen,      setMobileOpen]       = useState(false)
  const [mobileToolsOpen, setMobileToolsOpen]  = useState(false)
  const [scrolled,        setScrolled]         = useState(false)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Scroll shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Cmd+K also opens palette from the header
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openPalette()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [openPalette])

  // Active link helpers
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')
  const isToolsActive = TOOL_PATHS.some((p) => pathname === p)

  const linkCls = (href: string) =>
    `rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
      isActive(href) ? 'text-teal-400 underline underline-offset-4' : 'text-white/55'
    }`

  // Tools hover — 200 ms closing delay
  const handleToolsEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    setToolsOpen(true)
  }
  const handleToolsLeave = () => {
    hoverTimerRef.current = setTimeout(() => setToolsOpen(false), 200)
  }

  const leftTools  = TOOLS.filter((t) => t.col === 'left')
  const rightTools = TOOLS.filter((t) => t.col === 'right')

  return (
    <header
      role="banner"
      style={{ height: '64px' }}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-[#0f0c29]/95 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/30'
          : 'bg-[#0f0c29]'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* ── Logo ── */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-lg"
          aria-label="VisitPlane home"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-md group-hover:bg-emerald-500/30 transition" />
            <Image
              src="/logo-v2.png"
              alt=""
              width={36}
              height={36}
              priority
              className="relative rounded-xl"
            />
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-white">Visit</span>
            <span className="text-emerald-400">Plane</span>
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav
          role="navigation"
          aria-label="Main navigation"
          className="hidden items-center gap-1 md:flex"
        >
          <Link href="/destinations" className={linkCls('/destinations')}>
            Destinations
          </Link>

          {/* Tools mega-menu */}
          <div
            className="relative"
            onMouseEnter={handleToolsEnter}
            onMouseLeave={handleToolsLeave}
          >
            <button
              onClick={() => setToolsOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={toolsOpen}
              aria-controls="tools-menu"
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                isToolsActive || toolsOpen ? 'text-teal-400 bg-white/5' : 'text-white/55'
              }`}
            >
              Tools
              <svg
                className={`h-3.5 w-3.5 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Mega-menu dropdown */}
            {toolsOpen && (
              <div
                id="tools-menu"
                role="menu"
                className="absolute left-1/2 top-full z-50 mt-1 w-[560px] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#0f0c29] p-5 shadow-[0_25px_50px_rgba(0,0,0,0.5)]"
                onMouseEnter={handleToolsEnter}
                onMouseLeave={handleToolsLeave}
              >
                <div className="grid grid-cols-2 gap-2">
                  {/* Left column */}
                  <div>
                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-teal-400">
                      ⚡ Quick Tools
                    </p>
                    {leftTools.map((tool) => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        role="menuitem"
                        onClick={() => setToolsOpen(false)}
                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                      >
                        <span className="text-xl transition-transform group-hover:scale-110" aria-hidden="true">
                          {tool.emoji}
                        </span>
                        <div>
                          <p className="text-sm font-medium leading-tight text-white transition-colors group-hover:text-teal-300">
                            {tool.name}
                          </p>
                          <p className="mt-0.5 text-xs leading-tight text-gray-500">{tool.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Right column */}
                  <div>
                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-purple-400">
                      🔧 More Tools
                    </p>
                    {rightTools.map((tool) => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        role="menuitem"
                        onClick={() => setToolsOpen(false)}
                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                      >
                        <span className="text-xl transition-transform group-hover:scale-110" aria-hidden="true">
                          {tool.emoji}
                        </span>
                        <div>
                          <p className="text-sm font-medium leading-tight text-white transition-colors group-hover:text-teal-300">
                            {tool.name}
                          </p>
                          <p className="mt-0.5 text-xs leading-tight text-gray-500">{tool.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Mega-menu footer */}
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                  <p className="text-xs text-gray-400">🌍 Not sure which tool to use?</p>
                  <Link
                    href="/wizard"
                    role="menuitem"
                    onClick={() => setToolsOpen(false)}
                    className="rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-teal-600"
                  >
                    Try AI Wizard →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link href="/blog" className={linkCls('/blog')}>
            Blog
          </Link>
        </nav>

        {/* ── Right side ── */}
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <LanguageSwitcher currentLocale={locale} />

          {/* Search / Command palette trigger */}
          <button
            onClick={openPalette}
            aria-label="Open search (Cmd+K)"
            title="Search (⌘K)"
            className="hidden md:flex items-center justify-center rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
            </svg>
          </button>

          {/* Smart CTA — desktop only (md+). Mobile CTA lives inside the mobile menu. */}
          <button
            onClick={handleCta}
            className="hidden md:inline-flex items-center gap-2 rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition hover:bg-teal-600 hover:shadow-teal-500/40 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0c29]"
          >
            Check My Visa →
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            className="rounded-lg p-2 text-white/55 hover:bg-white/5 hover:text-white md:hidden transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <div
        id="mobile-menu"
        hidden={!mobileOpen}
        className="border-t border-white/5 bg-[#060C18]/98 backdrop-blur-xl md:hidden"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="mx-auto max-w-7xl space-y-1 px-4 py-4">

          <Link
            href="/destinations"
            onClick={() => setMobileOpen(false)}
            className={`block rounded-lg px-3 py-2.5 text-sm transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
              isActive('/destinations') ? 'text-teal-400' : 'text-white/60'
            }`}
          >
            🌍 Destinations
          </Link>

          <Link
            href="/blog"
            onClick={() => setMobileOpen(false)}
            className={`block rounded-lg px-3 py-2.5 text-sm transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
              isActive('/blog') ? 'text-teal-400' : 'text-white/60'
            }`}
          >
            📝 Blog
          </Link>

          {/* Mobile Tools accordion */}
          <div className="border-t border-white/10 pt-3">
            <button
              onClick={() => setMobileToolsOpen((v) => !v)}
              aria-expanded={mobileToolsOpen}
              className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-white hover:bg-white/5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              <span className="font-semibold">🛠️ All Tools ({TOOLS.length})</span>
              <svg
                className={`h-4 w-4 transition-transform ${mobileToolsOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {mobileToolsOpen && (
              <div className="mt-3 grid grid-cols-4 gap-2 px-2 pb-2">
                {TOOLS.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex flex-col items-center gap-1 rounded-xl bg-white/5 p-2 text-center transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                  >
                    <span className="text-2xl" aria-hidden="true">{tool.emoji}</span>
                    <span className="text-[10px] leading-tight text-gray-300">
                      {tool.name.split(' ')[0]}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Mobile search */}
          <button
            onClick={() => { setMobileOpen(false); openPalette() }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/60 hover:bg-white/5 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
            </svg>
            Search countries & tools
          </button>

          {/* Mobile CTA */}
          <div className="border-t border-white/5 pt-4">
            <button
              onClick={() => { setMobileOpen(false); handleCta() }}
              className="block w-full rounded-xl bg-teal-500 py-3 text-center text-sm font-semibold text-white transition hover:bg-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              Check My Visa →
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
