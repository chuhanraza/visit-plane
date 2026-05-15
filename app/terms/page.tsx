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

export default function TermsPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const sections = [
    {
      title: '1. Acceptance of Terms',
      body: `By accessing or using VisitPlane ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these Terms, you may not access the Service. These Terms apply to all visitors, users, and others who access or use the Service. We reserve the right to update these Terms at any time, and your continued use of the Service constitutes acceptance of any changes.`,
    },
    {
      title: '2. Description of Service',
      body: `VisitPlane provides an informational platform for checking visa requirements, passport strength rankings, and travel document checklists. Our service aggregates publicly available information and data from various sources to help travelers understand entry requirements. We are not a travel agency, visa agency, government authority, or embassy. We do not process visa applications or provide official legal travel advice.`,
    },
    {
      title: '3. Accuracy of Information',
      body: `While we strive to provide accurate and up-to-date information, visa requirements, entry conditions, and travel restrictions change frequently. VisitPlane makes no warranties, expressed or implied, about the completeness, accuracy, reliability, suitability, or availability of the information provided. You should always verify current requirements with official government sources, embassies, or consulates before making travel plans or submitting visa applications.`,
    },
    {
      title: '4. Disclaimer of Liability',
      body: `VisitPlane shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages resulting from your use of, or inability to use, our Service. This includes damages for errors, omissions, interruptions, defects, delays, computer viruses, loss of data, unauthorized access, or other losses. We are not responsible for any visa denials, travel disruptions, or financial losses arising from reliance on information provided by our Service.`,
    },
    {
      title: '5. Intellectual Property',
      body: `The Service and its original content, features, and functionality are owned by VisitPlane and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not reproduce, distribute, modify, create derivative works of, publicly display, or commercially exploit any content from our Service without our explicit written permission. Personal, non-commercial use of our content for informational purposes is permitted.`,
    },
    {
      title: '6. User Conduct',
      body: `You agree to use VisitPlane only for lawful purposes. You must not use the Service in any way that violates applicable local, national, or international law or regulation; transmit unsolicited promotional material or spam; attempt to gain unauthorized access to our systems; or engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service. We reserve the right to terminate access for users who violate these conduct standards.`,
    },
    {
      title: '7. Third-Party Links',
      body: `Our Service may contain links to third-party websites, including government immigration portals, embassy websites, and travel resources. These links are provided for your convenience only. VisitPlane has no control over the content of those sites and accepts no responsibility for them or for any loss or damage that may arise from your use of them. Accessing third-party sites is done entirely at your own risk.`,
    },
    {
      title: '8. Privacy Policy',
      body: `Your use of VisitPlane is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy at visitplane.com/privacy to understand our practices. By using the Service, you consent to the collection and use of information as described in our Privacy Policy. If you do not agree with our privacy practices, please do not use our Service.`,
    },
    {
      title: '9. Advertising',
      body: `VisitPlane may display advertisements served by Google AdSense and other advertising partners. We do not allow advertisers to influence our editorial content or visa requirement information. Advertisements are clearly distinguished from editorial content. We are not responsible for the content of advertisements or the products/services advertised. Clicking on advertisements is at your own discretion and risk.`,
    },
    {
      title: '10. Modifications to Service',
      body: `VisitPlane reserves the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Service. We may also impose limits on certain features or restrict access to parts or all of the Service without notice or liability.`,
    },
    {
      title: '11. Governing Law',
      body: `These Terms shall be governed by and construed in accordance with applicable law, without regard to conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in the applicable jurisdiction. If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.`,
    },
    {
      title: '12. Contact Information',
      body: `If you have any questions about these Terms of Service, please contact us at: legal@visitplane.com. You can also reach us through our Contact page at visitplane.com/contact. We aim to respond to all inquiries within 5 business days. For urgent matters relating to misuse of the Service, please mark your message as urgent in the subject line.`,
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
              📄 Legal
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
            Terms of Service
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-4 text-sm text-white/45">
            Last updated: May 16, 2026 · Effective immediately
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.22 }}
            className="mt-4 max-w-xl mx-auto text-sm leading-relaxed text-white/45">
            Please read these Terms of Service carefully before using VisitPlane. By using our service, you agree to be bound by these terms.
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
              Questions about these terms?{' '}
              <Link href="/contact" className="font-semibold text-teal-400 hover:text-teal-300 transition">Contact us</Link>
              {' '}or email{' '}
              <a href="mailto:legal@visitplane.com" className="font-semibold text-teal-400 hover:text-teal-300 transition">legal@visitplane.com</a>
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
