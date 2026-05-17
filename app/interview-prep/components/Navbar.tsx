'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { TOOLS } from '../data'

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false)
  const [toolsOpen,  setToolsOpen]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0f0c29]/95 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/30' : 'bg-[#0f0c29]'}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5 shrink-0">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-md group-hover:bg-emerald-500/30 transition" />
            <Image src="/logo-v2.png" alt="VisitPlane" width={36} height={36} className="relative rounded-xl" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-white">Visit</span><span className="text-emerald-400">Plane</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/destinations" className="rounded-lg px-3 py-2 text-sm text-white/55 hover:bg-white/5 hover:text-white transition">Explore</Link>
          <Link href="/destinations" className="rounded-lg px-3 py-2 text-sm text-white/55 hover:bg-white/5 hover:text-white transition">Visa Requirements</Link>
          <div className="relative" onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
            <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-white/55 hover:bg-white/5 hover:text-white transition">
              Tools
              <svg className={`h-3.5 w-3.5 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {toolsOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl border border-white/10 bg-[#0f0c29]/98 backdrop-blur-xl shadow-2xl py-1.5">
                {TOOLS.map(t => (
                  <Link key={t.href} href={t.href} onClick={() => setToolsOpen(false)}
                    className={`block px-4 py-2 text-sm hover:bg-white/5 hover:text-white transition ${t.href === '/interview-prep' ? 'text-teal-400 font-semibold' : 'text-white/60'}`}>
                    {t.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/blog" className="rounded-lg px-3 py-2 text-sm text-white/55 hover:bg-white/5 hover:text-white transition">Blog</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/destinations" className="hidden sm:inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 hover:-translate-y-px transition">
            Check Visa <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden rounded-lg p-2 text-white/55 hover:bg-white/5 hover:text-white transition">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" /> : <><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></>}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/5 bg-[#060C18]/98 backdrop-blur-xl md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
            {[{ label: 'Explore', href: '/destinations' }, { label: 'Blog', href: '/blog' }].map(item => (
              <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white transition">{item.label}</Link>
            ))}
            <div className="pt-1 px-3 text-xs font-semibold uppercase tracking-widest text-white/30">Tools</div>
            {TOOLS.map(t => (
              <Link key={t.href} href={t.href} onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm hover:bg-white/5 hover:text-white transition ${t.href === '/interview-prep' ? 'text-teal-400' : 'text-white/60'}`}>
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
