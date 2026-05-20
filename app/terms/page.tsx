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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased overflow-x-hidden">{/* HERO */}
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
            className="text-4xl font-extrabold tracking-tight sm:text-5xl text-[#0f0c29]">
            Terms of Service
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-4 text-sm text-gray-500">
            Last updated: May 16, 2026 · Effective immediately
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.22 }}
            className="mt-4 max-w-xl mx-auto text-sm leading-relaxed text-gray-500">
            Please read these Terms of Service carefully before using VisitPlane. By using our service, you agree to be bound by these terms.
          </motion.p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-4">
          {sections.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.5 }}
              className="rounded-2xl border border-gray-100 bg-white p-6">
              <h2 className="mb-3 text-base font-bold text-teal-400">{s.title}</h2>
              <p className="text-sm leading-relaxed text-gray-500">{s.body}</p>
            </motion.div>
          ))}

          <div className="rounded-2xl border border-teal-500/20 bg-teal-500/8 p-6 text-center">
            <p className="text-sm text-gray-500">
              Questions about these terms?{' '}
              <Link href="/contact" className="font-semibold text-teal-400 hover:text-teal-300 transition">Contact us</Link>
              {' '}or email{' '}
              <a href="mailto:legal@visitplane.com" className="font-semibold text-teal-400 hover:text-teal-300 transition">legal@visitplane.com</a>
            </p>
          </div>
        </div>
      </section></div>
  )
}
