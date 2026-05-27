'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const sections = [
  {
    title: '1. Who We Are',
    body: `VisitPlane is a free, independent visa information tool. We are not a travel agency, visa processing service, or government authority. We provide informational content to help travelers understand visa requirements — we do not process applications, handle payments, or store personal travel documents of any kind.`,
  },
  {
    title: '2. What We Collect',
    body: `We collect very little. We do not require an account, so we never collect your name, email, or passport details just for you to use the site. The only personal data we may receive is: (1) information you voluntarily submit through our contact form — your name, email, and message; and (2) standard analytics data collected automatically by our analytics provider (see section 4), such as pages visited, browser type, and general geographic region. We do not collect or store your passport country or destination searches beyond the current session.`,
  },
  {
    title: '3. Contact Form Data',
    body: `When you submit our contact form, your name, email address, and message are sent to us via Formspree (our form handling provider) and delivered to our inbox. We use this information solely to respond to your inquiry. We do not add you to any mailing list, share your contact details with third parties, or retain your message longer than necessary to address your question.`,
  },
  {
    title: '4. Analytics',
    body: `We use Google Analytics (via Google Tag Manager) to understand how people use the site — which pages are visited, how long people stay, and where traffic comes from. This data is aggregated and anonymous; we cannot identify individual visitors from it. Google Analytics uses cookies to collect this data. You can opt out of Google Analytics tracking by installing the Google Analytics Opt-out Browser Add-on at tools.google.com/dlpage/gaoptout.`,
  },
  {
    title: '5. Cookies',
    body: `We use cookies for two purposes only: analytics (as described above) and basic site functionality (such as remembering your preferred language). We do not use cookies for advertising or to track you across other websites. If you disable cookies in your browser, the site will still work — you may just need to re-select your language preference on each visit.`,
  },
  {
    title: '6. Third-Party Services',
    body: `We use Supabase as our database provider to store and serve visa requirement data. We use Vercel to host the application. We use Formspree to handle contact form submissions. Each of these providers has its own privacy policy. We have chosen providers with strong data privacy practices, but we encourage you to review their policies if you have specific concerns.`,
  },
  {
    title: '7. No Advertising',
    body: `We do not run advertising on VisitPlane. We do not sell your data to advertisers. We do not allow third-party advertising networks to place cookies or tracking pixels on this site. Our goal is to provide useful information, not to monetize your attention.`,
  },
  {
    title: '8. Data Security',
    body: `We implement appropriate technical measures to protect the limited data we do collect. Contact form submissions are transmitted over HTTPS and delivered directly to our inbox. We do not store payment information because we never charge for anything. No method of internet transmission is 100% secure, but we take reasonable precautions.`,
  },
  {
    title: '9. Your Rights',
    body: `If you have submitted a contact form and want us to delete the associated data, email us at privacy@visitplane.com and we will do so. Depending on your location, you may have additional rights under GDPR, CCPA, or other applicable privacy laws. We will respond to verified requests within 30 days.`,
  },
  {
    title: '10. Changes to This Policy',
    body: `We may update this Privacy Policy as the site evolves. If we make material changes, we will update the "Last updated" date at the top of this page. Continued use of VisitPlane after changes are posted constitutes acceptance of the updated policy. We will never introduce advertising or data selling practices without clearly disclosing them.`,
  },
  {
    title: '11. Contact',
    body: `Questions about this policy? Email privacy@visitplane.com or use our Contact page. We aim to respond within 48 hours.`,
  },
]

export default function PrivacyPage() {
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
              🔒 Legal
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl text-[#0f0c29]"
          >
            Privacy Policy
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
            The short version: we collect almost nothing. No account required, no personal data stored beyond what you send us via the contact form, and no advertising.
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
              Questions about this policy?{' '}
              <Link href="/contact" className="font-semibold text-teal-400 hover:text-teal-300 transition">Contact us</Link>
              {' '}or email{' '}
              <a href="mailto:privacy@visitplane.com" className="font-semibold text-teal-400 hover:text-teal-300 transition">privacy@visitplane.com</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
