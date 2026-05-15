'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

function ArrowRight({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  )
}
function MenuIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  )
}
function XIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

const NAV_LINKS = [
  { label: 'Explore',           href: '/destinations' },
  { label: 'Visa Requirements', href: '/destinations' },
  { label: 'Passport Strength', href: '/passport-strength' },
  { label: '⚖️ Compare Visas',  href: '/compare' },
  { label: '📋 Checklist',      href: '/checklist' },
  { label: 'Guides',            href: '/blog' },
]

export default function PrivacyPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const sections = [
    {
      title: '1. Information We Collect',
      body: `We collect information you provide directly to us, such as when you use our visa checker tool. This may include your passport country and destination country selections. We also automatically collect certain information when you visit VisitPlane, including your IP address, browser type, operating system, referring URLs, device information, and pages viewed. We use cookies and similar tracking technologies to track activity on our service and hold certain information.`,
    },
    {
      title: '2. How We Use Your Information',
      body: `We use the information we collect to provide, maintain, and improve our services; to understand how users interact with VisitPlane; to detect, prevent, and address technical issues; to send you updates and promotional communications (only if you have opted in); and to comply with legal obligations. We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties without your consent, except as described in this policy.`,
    },
    {
      title: '3. Cookies & Tracking',
      body: `VisitPlane uses cookies to enhance your experience. Cookies are small data files stored on your device. We use session cookies (temporary, deleted when you close your browser) and persistent cookies (remain until deleted or expire). We also use Google Analytics to understand site traffic and usage patterns. You can control cookies through your browser settings. Note that disabling cookies may affect certain functionality of the site.`,
    },
    {
      title: '4. Third-Party Services',
      body: `We use Supabase as our database provider. Supabase processes query data to return visa requirement information. We use Vercel to host our application. We use Google Analytics (via Google Tag Manager) for usage analytics. We use Google AdSense for advertising (we do not allow advertisers to pay to influence our editorial content). Each third-party service has its own privacy policy governing their use of your data.`,
    },
    {
      title: '5. Data Security',
      body: `We implement appropriate technical and organizational measures to protect the information we collect and store. However, no method of transmission over the internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security.`,
    },
    {
      title: '6. Data Retention',
      body: `We retain the information we collect for as long as necessary to fulfill the purposes described in this Privacy Policy, unless a longer retention period is required by law. Usage data collected through analytics is typically retained for 26 months, after which it is automatically deleted.`,
    },
    {
      title: '7. Children\'s Privacy',
      body: `VisitPlane is not directed to children under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can take appropriate action.`,
    },
    {
      title: '8. Your Rights',
      body: `Depending on your location, you may have certain rights regarding your personal information, including the right to access, correct, or delete your personal data; the right to restrict or object to certain processing; and the right to data portability. To exercise these rights, please contact us at privacy@visitplane.com. We will respond to your request within 30 days.`,
    },
    {
      title: '9. Changes to This Policy',
      body: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.`,
    },
    {
      title: '10. Contact Us',
      body: `If you have any questions about this Privacy Policy or our privacy practices, please contact us at: privacy@visitplane.com. You can also reach us through our Contact page at visitplane.com/contact. We are committed to resolving any privacy concerns you may have.`,
    },
  ]

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white antialiased overflow-x-hidden">
      {/* NAVBAR */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0f0c29]/95 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/30' : 'bg-transparent'
      }`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2.5 shrink-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-teal-500/20 blur-md group-hover:bg-teal-500/30 transition" />
              <Image src="/logo-v2.png" alt="VisitPlane" width={36} height={36} className="relative rounded-xl" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-white">Visit</span><span className="text-teal-400">Plane</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(item => (
              <Link key={item.label} href={item.href} className="rounded-lg px-3 py-2 text-sm text-white/55 transition hover:bg-white/5 hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/destinations" className="hidden sm:inline-flex items-center gap-2 rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition hover:bg-teal-600 hover:-translate-y-px">
              Check Visa <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-lg p-2 text-white/55 hover:bg-white/5 hover:text-white md:hidden transition">
              {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
              className="border-t border-white/5 bg-[#060C18]/98 backdrop-blur-xl md:hidden overflow-hidden">
              <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
                {NAV_LINKS.map(item => (
                  <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white transition">
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO */}
      <section className="relative pt-16 pb-12 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.1),transparent_60%)]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-400">
              🔒 Legal
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
            Privacy Policy
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-4 text-sm text-white/45">
            Last updated: May 16, 2026 · Effective immediately
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.22 }}
            className="mt-4 max-w-xl mx-auto text-sm leading-relaxed text-white/45">
            VisitPlane (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights regarding your data.
          </motion.p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-4">
          {sections.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.5 }}
              className="rounded-2xl border border-white/8 bg-[#13103a] p-6">
              <h2 className="mb-3 text-base font-bold text-teal-400">{s.title}</h2>
              <p className="text-sm leading-relaxed text-white/55">{s.body}</p>
            </motion.div>
          ))}

          <div className="rounded-2xl border border-teal-500/20 bg-teal-500/8 p-6 text-center">
            <p className="text-sm text-white/60">
              Questions about this policy?{' '}
              <Link href="/contact" className="font-semibold text-teal-400 hover:text-teal-300 transition">Contact us</Link>
              {' '}or email{' '}
              <a href="mailto:privacy@visitplane.com" className="font-semibold text-teal-400 hover:text-teal-300 transition">privacy@visitplane.com</a>
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#0a0820] pb-8 pt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo-v2.png" alt="VisitPlane" width={28} height={28} className="rounded-xl" />
              <span className="text-base font-bold"><span className="text-white">Visit</span><span className="text-teal-400">Plane</span></span>
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-5">
              {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact'], ['About', '/about'], ['FAQ', '/faq']].map(([l, h]) => (
                <Link key={l} href={h} className="text-sm text-white/30 hover:text-white transition">{l}</Link>
              ))}
            </div>
            <p className="text-xs text-white/20">© {new Date().getFullYear()} VisitPlane</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
