'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import LanguageSwitcher from '@/app/components/LanguageSwitcher'

const TOOLS = [
  { label: '🤖 AI Visa Wizard',       href: '/wizard'             },
  { label: '🎯 Visa Checker',          href: '/visa-checker'       },
  { label: '🗺️ Visa-Free Map',         href: '/visa-free-map'      },
  { label: '💪 Passport Strength',     href: '/passport-strength'  },
  { label: '⚖️ Compare Visas',         href: '/compare'            },
  { label: '📋 Document Checklist',    href: '/checklist'          },
  { label: '⏱️ Processing Times',      href: '/processing-times'   },
  { label: '🛡️ Travel Insurance',      href: '/travel-insurance'   },
  { label: '🏛️ Embassy Finder',        href: '/embassy-finder'     },
  { label: '💰 Cost Calculator',       href: '/cost-calculator'    },
  { label: '💱 Currency Converter',    href: '/currency-converter' },
  { label: '📊 Visa Tracker',          href: '/visa-tracker'       },
  { label: '🎤 Interview Prep',        href: '/interview-prep'     },
]

const TOOL_PATHS = TOOLS.map((t) => t.href)

export default function SharedNavbar() {
  const pathname = usePathname()
  const locale = useLocale()
  const [toolsOpen, setToolsOpen]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled]     = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')
  const isToolsActive = TOOL_PATHS.some((p) => pathname === p)

  const linkClass = (href: string) =>
    `rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 hover:text-white ${
      isActive(href) ? 'text-teal-400 underline underline-offset-4' : 'text-white/55'
    }`

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
          <Link href="/destinations" className={`rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 hover:text-white text-white/55`}>
            Visa Requirements
          </Link>

          {/* Tools dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setToolsOpen(true)}
            onMouseLeave={() => setToolsOpen(false)}
          >
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 hover:text-white ${
                isToolsActive ? 'text-teal-400 underline underline-offset-4' : 'text-white/55'
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

            {toolsOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl border border-white/10 bg-[#0f0c29]/98 backdrop-blur-xl shadow-2xl shadow-black/40 py-1.5 overflow-hidden">
                {TOOLS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setToolsOpen(false)}
                    className={`block px-4 py-2 text-sm hover:bg-white/5 hover:text-white transition ${
                      pathname === item.href ? 'text-teal-400 font-semibold' : 'text-white/60'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
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
        <div className="border-t border-white/5 bg-[#060C18]/98 backdrop-blur-xl md:hidden overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
            <Link
              href="/destinations"
              onClick={() => setMobileOpen(false)}
              className={`block rounded-lg px-3 py-2.5 text-sm transition hover:bg-white/5 hover:text-white ${
                isActive('/destinations') ? 'text-teal-400' : 'text-white/60'
              }`}
            >
              Explore
            </Link>
            <Link
              href="/destinations"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              Visa Requirements
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileOpen(false)}
              className={`block rounded-lg px-3 py-2.5 text-sm transition hover:bg-white/5 hover:text-white ${
                isActive('/blog') ? 'text-teal-400' : 'text-white/60'
              }`}
            >
              Blog
            </Link>

            <div className="pt-2 pb-0.5 px-3 text-xs font-semibold uppercase tracking-widest text-white/30">
              Tools
            </div>
            {TOOLS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm transition hover:bg-white/5 hover:text-white ${
                  pathname === item.href ? 'text-teal-400' : 'text-white/60'
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-white/5">
              <Link
                href="/destinations"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600"
              >
                Check Visa →
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
