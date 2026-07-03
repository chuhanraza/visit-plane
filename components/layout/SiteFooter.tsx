/**
 * This is the canonical site footer for VisitPlane — used on every surface.
 * Do not create alternative footer components.
 *
 * Structure:
 *   Column 1 — Brand (logo, tagline, social links)
 *   Column 2 — Product (Destinations, Tools ×4, Blog)
 *   Column 3 — Trust (About, FAQ, Report data, Source methodology)
 *   Column 4 — Legal (Privacy, Terms, Contact)
 *   Bottom strip — copyright + data disclaimer
 */

import Link from 'next/link'
import Image from 'next/image'

const PRODUCT_LINKS = [
  { label: 'Destinations',      href: '/destinations'     },
  { label: 'Visa-Free Map',     href: '/visa-free-map'    },
  { label: 'Passport Strength', href: '/passport-strength'},
  { label: 'AI Visa Wizard',    href: '/wizard'           },
  { label: 'Compare Visas',     href: '/compare'          },
  { label: 'Visa Data & Research', href: '/visa-data'     },
  { label: 'Blog',              href: '/blog'             },
]

const TRUST_LINKS = [
  { label: 'About',                 href: '/about'                         },
  { label: 'Editorial Standards',   href: '/editorial-standards'           },
  { label: 'Our Editor',            href: '/authors/muhammad-hamad-ashraf' },
  { label: 'FAQ',                   href: '/faq'                           },
  { label: 'Report Incorrect Data', href: '/contact'                       },
]

const LEGAL_LINKS = [
  { label: 'Privacy Policy',   href: '/privacy' },
  { label: 'Terms of Service', href: '/terms'   },
  { label: 'Contact',          href: '/contact' },
]

const SOCIAL = [
  {
    label: 'X / Twitter',
    href: 'https://twitter.com/visitplane',
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/visitplane',
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
]

export default function SiteFooter() {
  return (
    <footer
      role="contentinfo"
      className="border-t border-white/5 bg-[#111827] pb-8 pt-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">

          {/* Column 1 — Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-lg"
              aria-label="VisitPlane home"
            >
              <Image
                src="/logo-v2.png"
                alt="VisitPlane logo"
                width={32}
                height={32}
                className="rounded-xl"
              />
              <span className="text-lg font-bold">
                <span className="text-white">Visit</span>
                <span className="text-emerald-400">Plane</span>
              </span>
            </Link>
            <p className="mb-5 max-w-xs text-sm leading-relaxed text-white/55">
              The world&apos;s visa requirements, decoded in seconds. Free, fast, and always updated.
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Product */}
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/50">
              Product
            </p>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-block py-1 text-sm text-white/60 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Trust */}
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/50">
              Trust
            </p>
            <ul className="space-y-2.5">
              {TRUST_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-block py-1 text-sm text-white/60 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Legal */}
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/50">
              Legal
            </p>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-block py-1 text-sm text-white/60 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommended partners strip */}
        <div className="mt-10 border-t border-white/5 pt-8">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/50">
            Recommended Partners
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href="/go/safetywing?placement=homepage"
              rel="nofollow sponsored"
              className="inline-block py-1.5 text-sm text-white/60 transition hover:text-white"
            >
              SafetyWing Insurance
            </a>
            <span className="text-white/10">·</span>
            <a
              href="/go/airalo?placement=homepage"
              rel="nofollow sponsored"
              className="inline-block py-1.5 text-sm text-white/60 transition hover:text-white"
            >
              Airalo eSIM
            </a>
            <span className="text-white/10">·</span>
            <a
              href="/go/wayaway?placement=homepage"
              rel="nofollow sponsored"
              className="inline-block py-1.5 text-sm text-white/60 transition hover:text-white"
            >
              WayAway Flights
            </a>
            <span className="text-white/10 hidden sm:inline">·</span>
            <span className="text-[11px] text-white/55 w-full sm:w-auto">
              Partner links — VisitPlane may earn a commission. Never affects your price.
            </span>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-white/5 pt-6 sm:flex-row">
          <p className="text-xs text-white/55">
            © {new Date().getFullYear()} VisitPlane · All rights reserved.
          </p>
          <p className="text-xs text-white/55 text-center sm:text-right">
            Visa data is sourced from official embassies. Always verify before traveling.
          </p>
        </div>
      </div>
    </footer>
  )
}
