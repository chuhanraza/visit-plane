import Link from 'next/link'
import Image from 'next/image'

const COLS = [
  {
    title: 'Explore',
    links: [
      { label: 'Destinations',      href: '/destinations'     },
      { label: 'Visa Requirements', href: '/visa-requirements' },
      { label: 'Travel Guides',     href: '/blog'             },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'FAQ',  href: '/faq'  },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About',            href: '/about'   },
      { label: 'Privacy Policy',   href: '/privacy' },
      { label: 'Terms of Service', href: '/terms'   },
      { label: 'Contact',          href: '/contact' },
    ],
  },
]

export default function SharedFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#111827] pb-8 pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">

          {/* ── Brand ── */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="mb-4 inline-flex items-center gap-2.5">
              <Image
                src="/logo-v2.png"
                alt="VisitPlane"
                width={32}
                height={32}
                className="rounded-xl"
              />
              <span className="text-lg font-bold">
                <span className="text-white">Visit</span>
                <span className="text-emerald-400">Plane</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-white/30">
              The world&apos;s visa requirements, decoded in seconds. Free, fast, and always updated.
            </p>
          </div>

          {/* ── Link columns ── */}
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/40">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/30 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} VisitPlane. All rights reserved.
          </p>
          <p className="text-xs text-white/15">
            Visa data is estimated. Always verify with official embassy sources.
          </p>
        </div>
      </div>
    </footer>
  )
}
