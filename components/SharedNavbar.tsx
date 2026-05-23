'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import LanguageSwitcher from '@/app/components/LanguageSwitcher'

const TOOLS = [
  // Left column — Quick Tools
  {
    href: '/visa-free-map',
    emoji: '🗺️',
    name: 'Visa-Free Map',
    desc: 'See where you can travel',
    column: 'left',
  },
  {
    href: '/passport-strength',
    emoji: '💪',
    name: 'Passport Strength',
    desc: 'Your passport power score',
    column: 'left',
  },
  {
    href: '/visa-checker',
    emoji: '🎯',
    name: 'Visa Checker',
    desc: 'Approval probability quiz',
    column: 'left',
  },
  {
    href: '/itinerary-generator',
    emoji: '✈️',
    name: 'Itinerary Generator',
    desc: 'Flight & hotel PDF',
    column: 'left',
  },
  {
    href: '/currency-converter',
    emoji: '💱',
    name: 'Currency Converter',
    desc: 'Real-time exchange rates',
    column: 'left',
  },
  {
    href: '/embassy-finder',
    emoji: '🏛️',
    name: 'Embassy Finder',
    desc: 'Addresses & contact info',
    column: 'left',
  },
  // Right column — More Tools
  {
    href: '/compare',
    emoji: '⚖️',
    name: 'Compare Visas',
    desc: 'Side by side comparison',
    column: 'right',
  },
  {
    href: '/checklist',
    emoji: '📋',
    name: 'Document Checklist',
    desc: 'Never miss a document',
    column: 'right',
  },
  {
    href: '/processing-times',
    emoji: '⏱️',
    name: 'Processing Times',
    desc: 'How long will it take?',
    column: 'right',
  },
  {
    href: '/cost-calculator',
    emoji: '💰',
    name: 'Cost Calculator',
    desc: 'Total visa cost estimate',
    column: 'right',
  },
  {
    href: '/travel-insurance',
    emoji: '🛡️',
    name: 'Travel Insurance',
    desc: 'Compare plans instantly',
    column: 'right',
  },
  {
    href: '/visa-tracker',
    emoji: '📊',
    name: 'Visa Tracker',
    desc: 'Track your applications',
    column: 'right',
  },
  {
    href: '/interview-prep',
    emoji: '🎤',
    name: 'Interview Prep',
    desc: 'Practice your answers',
    column: 'right',
  },
  {
    href: '/passport-scanner',
    emoji: '📷',
    name: 'Passport Scanner',
    desc: 'Scan MRZ & get photos',
    column: 'right',
  },
  {
    href: '/visa-vault',
    emoji: '🔐',
    name: 'Visa Vault',
    desc: 'Save your travel profile',
    column: 'right',
  },
  {
    href: '/wizard',
    emoji: '🤖',
    name: 'AI Visa Wizard',
    desc: 'AI-powered visa guide',
    column: 'right',
  },
]

const TOOL_PATHS = TOOLS.map((t) => t.href)

export default function SharedNavbar() {
  const pathname = usePathname()
  const locale = useLocale()
  const [toolsOpen, setToolsOpen]           = useState(false)
  const [mobileOpen, setMobileOpen]         = useState(false)
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false)
  const [scrolled, setScrolled]             = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  const isToolsActive = TOOL_PATHS.some((p) => pathname === p)

  const linkClass = (href: string) =>
    `rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 hover:text-white ${
      isActive(href) ? 'text-teal-400 underline underline-offset-4' : 'text-white/55'
    }`

  // Sticky hover handlers — 200 ms delay before closing
  const handleToolsEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setToolsOpen(true)
  }
  const handleToolsLeave = () => {
    timeoutRef.current = setTimeout(() => setToolsOpen(false), 200)
  }

  const leftTools  = TOOLS.filter((t) => t.column === 'left')
  const rightTools = TOOLS.filter((t) => t.column === 'right')

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0f0c29]/95 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/30'
          : 'bg-[#0f0c29]'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* ── Logo ── */}
        <Link href="/" className="group flex items-center gap-2.5 shrink-0">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-md group-hover:bg-emerald-500/30 transition" />
            <Image
              src="/logo-v2.png"
              alt="VisitPlane"
              width={36}
              height={36}
              className="relative rounded-xl"
            />
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-white">Visit</span>
            <span className="text-emerald-400">Plane</span>
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/destinations" className={linkClass('/destinations')}>
            Explore
          </Link>
          <Link
            href="/"
            className={`rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 hover:text-white ${
              isActive('/') && pathname === '/'
                ? 'text-teal-400 underline underline-offset-4'
                : 'text-white/55'
            }`}
          >
            Visa Requirements
          </Link>

          {/* ── Tools Mega Menu ── */}
          <div
            className="relative"
            onMouseEnter={handleToolsEnter}
            onMouseLeave={handleToolsLeave}
          >
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 hover:text-white ${
                isToolsActive || toolsOpen
                  ? 'text-teal-400 bg-white/5'
                  : 'text-white/55'
              }`}
            >
              Tools
              <svg
                className={`h-3.5 w-3.5 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Mega Menu */}
            {toolsOpen && (
              <div
                className="absolute left-1/2 top-full z-50 mt-1 w-[540px] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#0f0c29] p-5 shadow-[0_25px_50px_rgba(0,0,0,0.5)]"
                onMouseEnter={handleToolsEnter}
                onMouseLeave={handleToolsLeave}
              >
                {/* Two-column grid */}
                <div className="grid grid-cols-2 gap-2">

                  {/* Left column — Quick Tools */}
                  <div>
                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-teal-400">
                      ⚡ Quick Tools
                    </p>
                    {leftTools.map((tool) => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        onClick={() => setToolsOpen(false)}
                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/8"
                      >
                        <span className="text-xl transition-transform group-hover:scale-110">
                          {tool.emoji}
                        </span>
                        <div>
                          <p className="text-sm font-medium leading-tight text-white transition-colors group-hover:text-teal-300">
                            {tool.name}
                          </p>
                          <p className="mt-0.5 text-xs leading-tight text-gray-500">
                            {tool.desc}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Right column — More Tools */}
                  <div>
                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-purple-400">
                      🔧 More Tools
                    </p>
                    {rightTools.map((tool) => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        onClick={() => setToolsOpen(false)}
                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/8"
                      >
                        <span className="text-xl transition-transform group-hover:scale-110">
                          {tool.emoji}
                        </span>
                        <div>
                          <p className="text-sm font-medium leading-tight text-white transition-colors group-hover:text-teal-300">
                            {tool.name}
                          </p>
                          <p className="mt-0.5 text-xs leading-tight text-gray-500">
                            {tool.desc}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                  <p className="text-xs text-gray-400">
                    🌍 Not sure which tool to use?
                  </p>
                  <Link
                    href="/wizard"
                    onClick={() => setToolsOpen(false)}
                    className="rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-teal-600"
                  >
                    Try AI Wizard →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link href="/blog" className={linkClass('/blog')}>
            Blog
          </Link>
        </nav>

        {/* ── Right side ── */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher currentLocale={locale} />
          <Link
            href="/destinations"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition hover:bg-teal-600 hover:shadow-teal-500/40 hover:-translate-y-px"
          >
            Check Visa →
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-white/55 hover:bg-white/5 hover:text-white md:hidden transition"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="border-t border-white/5 bg-[#060C18]/98 backdrop-blur-xl md:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-4">

            <Link
              href="/destinations"
              onClick={() => setMobileOpen(false)}
              className={`block rounded-lg px-3 py-2.5 text-sm transition hover:bg-white/5 hover:text-white ${
                isActive('/destinations') ? 'text-teal-400' : 'text-white/60'
              }`}
            >
              🌍 Explore Destinations
            </Link>
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={`block rounded-lg px-3 py-2.5 text-sm transition hover:bg-white/5 hover:text-white ${
                pathname === '/' ? 'text-teal-400' : 'text-white/60'
              }`}
            >
              🛂 Visa Requirements
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileOpen(false)}
              className={`block rounded-lg px-3 py-2.5 text-sm transition hover:bg-white/5 hover:text-white ${
                isActive('/blog') ? 'text-teal-400' : 'text-white/60'
              }`}
            >
              📝 Blog
            </Link>

            {/* Mobile Tools Accordion */}
            <div className="border-t border-white/10 pt-3">
              <button
                onClick={() => setMobileToolsOpen(!mobileToolsOpen)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-white hover:bg-white/5 transition"
              >
                <span className="font-semibold">🛠️ All Tools ({TOOLS.length})</span>
                <svg
                  className={`h-4 w-4 transition-transform ${mobileToolsOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Mobile Tools 4-column Grid */}
              {mobileToolsOpen && (
                <div className="mt-3 grid grid-cols-4 gap-2 px-2 pb-2">
                  {TOOLS.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex flex-col items-center gap-1 rounded-xl bg-white/5 p-2 text-center transition-colors hover:bg-white/10"
                    >
                      <span className="text-2xl">{tool.emoji}</span>
                      <span className="text-[10px] leading-tight text-gray-300">
                        {tool.name.split(' ')[0]}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile CTA */}
            <div className="border-t border-white/5 pt-4">
              <Link
                href="/destinations"
                onClick={() => setMobileOpen(false)}
                className="block w-full rounded-xl bg-teal-500 py-3 text-center text-sm font-semibold text-white transition hover:bg-teal-600"
              >
                Check Visa Requirements →
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
