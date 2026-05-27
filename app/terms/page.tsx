'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using VisitPlane ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of these Terms, please do not use the Service. We may update these Terms at any time; continued use of the Service after changes are posted constitutes acceptance of the revised Terms.`,
  },
  {
    title: '2. What VisitPlane Is',
    body: `VisitPlane is a free, independent informational platform for checking visa requirements, entry conditions, and travel document guidance. We aggregate publicly available information from official government and embassy sources. We are not a travel agency, visa processing service, embassy, consulate, or government authority. We do not submit visa applications, collect passport data, or provide legally binding travel advice.`,
  },
  {
    title: '3. Accuracy of Information',
    body: `We work hard to keep our information accurate and up to date. However, visa requirements, entry conditions, and travel restrictions change frequently — sometimes without advance notice. VisitPlane makes no warranties about the completeness, accuracy, or reliability of the information provided. You should always verify current requirements with the official embassy or consulate of your destination country before making travel plans or submitting any visa application. Do not make non-refundable bookings based solely on information from this site.`,
  },
  {
    title: '4. Disclaimer of Liability',
    body: `VisitPlane is provided "as is" without any warranties, expressed or implied. To the fullest extent permitted by law, we are not liable for any direct, indirect, incidental, or consequential damages arising from your use of — or inability to use — the Service. This includes, without limitation, visa denials, missed flights, travel disruptions, or financial losses arising from reliance on information on this site.`,
  },
  {
    title: '5. No Account Required',
    body: `You do not need to create an account to use VisitPlane. We do not require registration, collect login credentials, or maintain user profiles. Your visa searches are not stored or linked to any identity. If you contact us via the contact form, we receive your name and email solely for the purpose of responding to you.`,
  },
  {
    title: '6. Intellectual Property',
    body: `The site design, code, and original written content on VisitPlane are owned by us and protected by applicable copyright law. Visa requirement data is sourced from publicly available government sources; we claim no ownership over that underlying information. You may not reproduce, redistribute, or commercially exploit the site's design or original content without our written permission. Personal, non-commercial use for informational purposes is permitted.`,
  },
  {
    title: '7. Acceptable Use',
    body: `You agree to use VisitPlane only for lawful purposes. You must not attempt to scrape or systematically download our database at scale, interfere with the site's operation, introduce malicious code, or use the site in any way that violates applicable law. We reserve the right to block access for users who abuse the Service.`,
  },
  {
    title: '8. Third-Party Links',
    body: `Our Service contains links to official government websites, embassy portals, and other external resources. These links are provided for convenience only. VisitPlane has no control over third-party content and accepts no responsibility for it. Accessing third-party sites is at your own risk.`,
  },
  {
    title: '9. Privacy',
    body: `Your use of VisitPlane is also governed by our Privacy Policy, available at visitplane.com/privacy. The short version: we collect almost no personal data. We do not require an account, we do not sell your data, and we do not run advertising. Please review our Privacy Policy for full details.`,
  },
  {
    title: '10. No Advertising',
    body: `VisitPlane does not display advertising and does not allow third-party advertisers to place content, cookies, or tracking technologies on this site. We do not receive payment from any entity in exchange for influencing the visa information we provide. Our information is not sponsored.`,
  },
  {
    title: '11. Modifications to the Service',
    body: `We reserve the right to modify, suspend, or discontinue any part of the Service at any time without notice. We are not liable to you or any third party for any modification, suspension, or discontinuation of the Service.`,
  },
  {
    title: '12. Governing Law',
    body: `These Terms are governed by applicable law. If any provision is found to be invalid or unenforceable, the remaining provisions remain in full force. These Terms constitute the entire agreement between you and VisitPlane regarding your use of the Service.`,
  },
  {
    title: '13. Contact',
    body: `Questions about these Terms? Email legal@visitplane.com or use our Contact page. We aim to respond within 48 hours.`,
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased overflow-x-hidden">
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
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl text-[#0f0c29]"
          >
            Terms of Service
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-4 text-sm text-gray-400"
          >
            Last updated: May 27, 2026 · Effective immediately
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.22 }}
            className="mt-4 max-w-xl mx-auto text-sm leading-relaxed text-gray-500"
          >
            Please read these Terms before using VisitPlane. By using the service, you agree to them.
          </motion.p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-4">
          {sections.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04, duration: 0.5 }}
              className="rounded-2xl border border-gray-100 bg-white p-6"
            >
              <h2 className="mb-3 text-base font-bold text-teal-400">{s.title}</h2>
              <p className="text-sm leading-relaxed text-gray-500">{s.body}</p>
            </motion.div>
          ))}

          <div className="rounded-2xl border border-teal-500/20 bg-teal-500/[0.08] p-6 text-center">
            <p className="text-sm text-gray-500">
              Questions about these terms?{' '}
              <Link href="/contact" className="font-semibold text-teal-400 hover:text-teal-300 transition">Contact us</Link>
              {' '}or email{' '}
              <a href="mailto:legal@visitplane.com" className="font-semibold text-teal-400 hover:text-teal-300 transition">legal@visitplane.com</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
