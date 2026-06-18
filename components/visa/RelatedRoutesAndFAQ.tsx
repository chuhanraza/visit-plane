'use client'

import { useState } from 'react'
import Link from 'next/link'
import { blogPosts } from '@/src/lib/posts'
import { getDemonym } from '@/lib/data/demonyms'

// ─── Dedupe a list of country names by normalized slug (case/whitespace safe) ──
// The destinations table has multiple rows per country (one per visa type), so
// raw arrays can contain case/whitespace variants of the same name. Dedupe on a
// normalized key BEFORE render and keep the first-seen display form.
function dedupeBySlug(names: string[]): string[] {
  const seen = new Map<string, string>()
  for (const raw of names) {
    const name = (raw ?? '').trim()
    if (!name) continue
    const key = name.toLowerCase()
    if (!seen.has(key)) seen.set(key, name)
  }
  return Array.from(seen.values())
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface RelatedRoutesAndFAQProps {
  passportName: string
  passportSlug: string
  destinationName: string
  destinationSlug: string
  relatedDestinations: string[]
  otherPassports: string[]
}

// ─── FAQ data (route-aware) ───────────────────────────────────────────────────
interface FAQItem {
  question: string
  answer: string
}

function resolveFAQ(passportName: string, destinationName: string): FAQItem[] {
  const dest = destinationName.toLowerCase()
  const isUAE = dest.includes('uae') || dest.includes('united arab')

  return [
    {
      question: `Can I extend my ${destinationName} visa?`,
      answer: isUAE
        ? 'Yes — UAE eVisas can be extended for an additional 30 days through the ICP portal (smartservices.icp.gov.ae). Apply before your current visa expires to avoid overstay fines.'
        : `Extension policies vary by visa type. Contact the ${destinationName} immigration authority or your nearest embassy well before your visa expires.`,
    },
    {
      question: `What if my ${destinationName} visa is rejected?`,
      answer: `Visa rejection reasons are usually: incomplete documents, insufficient funds, or incorrect information. You can reapply after addressing the issue. Some rejections allow an appeal — check the official embassy website for the process. Maintaining a clean travel history improves future applications.`,
    },
    {
      question: `Can I work in ${destinationName} on a tourist visa?`,
      answer: `No — working on a tourist/visitor visa is illegal in almost all countries and can result in deportation and a travel ban. If you plan to work, you must apply for the correct work permit or employment visa through your employer.`,
    },
    {
      question: `How long does the ${destinationName} eVisa email take to arrive?`,
      answer: isUAE
        ? 'The UAE eVisa approval email typically arrives within 3–5 business days after submission. Check your spam folder. If you do not receive it within 7 days, contact the ICP support portal.'
        : `Processing times vary but you will receive a confirmation email once your application is approved. Apply at least 2–3 weeks before travel. Check your spam folder and follow up with the portal if needed.`,
    },
    {
      question: `Can ${passportName} passport holders apply for a ${destinationName} family group visa?`,
      answer: `Most countries allow family group applications. Each family member typically needs their own visa application but you may be able to submit them together. Children usually have reduced or waived fees. Check the official portal for group application options.`,
    },
  ]
}

// ─── Flag lookup ──────────────────────────────────────────────────────────────
const FLAG_MAP: Record<string, string> = {
  'uae': '🇦🇪', 'united arab emirates': '🇦🇪',
  'turkey': '🇹🇷', 'türkiye': '🇹🇷',
  'saudi arabia': '🇸🇦',
  'malaysia': '🇲🇾',
  'united kingdom': '🇬🇧', 'uk': '🇬🇧',
  'thailand': '🇹🇭',
  'japan': '🇯🇵',
  'singapore': '🇸🇬',
  'canada': '🇨🇦',
  'germany': '🇩🇪',
  'australia': '🇦🇺',
  'india': '🇮🇳',
  'china': '🇨🇳',
  'france': '🇫🇷',
  'italy': '🇮🇹',
  'egypt': '🇪🇬',
  'oman': '🇴🇲',
  'qatar': '🇶🇦',
  'bahrain': '🇧🇭',
  'kuwait': '🇰🇼',
  'indonesia': '🇮🇩',
  'pakistan': '🇵🇰',
  'bangladesh': '🇧🇩',
  'sri lanka': '🇱🇰',
  'nepal': '🇳🇵',
}

function getFlag(name: string): string {
  return FLAG_MAP[name.toLowerCase()] ?? '🌍'
}

// ─── FAQ accordion item ────────────────────────────────────────────────────────
function FAQItem({ item, open, onToggle }: { item: FAQItem; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-[#1F2937] hover:text-[#14B8A6] transition"
      >
        <span className="leading-snug">{item.question}</span>
        <span className={`text-gray-400 text-base flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <div className="pb-4">
          <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RelatedRoutesAndFAQ({
  passportName,
  passportSlug,
  destinationName,
  destinationSlug,
  relatedDestinations,
  otherPassports,
}: RelatedRoutesAndFAQProps) {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const faqItems = resolveFAQ(passportName, destinationName)

  // Dedupe source arrays before render — no route should appear twice (A1).
  const dedupedDestinations = dedupeBySlug(relatedDestinations).slice(0, 5)
  const dedupedPassports = dedupeBySlug(otherPassports).slice(0, 5)
  const passportDemonym = getDemonym(passportName)

  // Auto-match blog posts
  const relatedBlogs = blogPosts
    .filter(p =>
      p.passportCountry?.toLowerCase() === passportName.toLowerCase() ||
      p.destinationCountry?.toLowerCase() === destinationName.toLowerCase() ||
      p.title.toLowerCase().includes(destinationName.toLowerCase()) ||
      p.title.toLowerCase().includes(passportName.toLowerCase())
    )
    .slice(0, 3)

  return (
    <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-20 space-y-6">

      {/* ── Related routes row ─────────────────────────────────────────────── */}
      {(dedupedDestinations.length > 0 || dedupedPassports.length > 0) && (
        <div className="grid gap-5 md:grid-cols-2">

          {/* Same passport → other destinations */}
          {dedupedDestinations.length > 0 && (
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                {passportDemonym} also check...
              </p>
              <ul className="space-y-1.5">
                {dedupedDestinations.map(dest => (
                  <li key={`dest-${dest.toLowerCase()}`}>
                    <Link
                      href={`/visa/${encodeURIComponent(passportName)}/${encodeURIComponent(dest)}`}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[#1F2937] hover:bg-[#14B8A6]/5 hover:text-[#14B8A6] transition"
                    >
                      <span className="text-lg leading-none">{getFlag(dest)}</span>
                      <span>{passportName} → {dest} Visa</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/visa-requirements-for-${passportName.toLowerCase().replace(/\s+/g, '-')}-citizens`}
                className="mt-3 inline-block text-xs font-semibold text-[#14B8A6] hover:underline"
              >
                All {passportName} visa requirements →
              </Link>
            </div>
          )}

          {/* Other passports → same destination */}
          {dedupedPassports.length > 0 && (
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                Visa requirements for {destinationName} by passport
              </p>
              <ul className="space-y-1.5">
                {dedupedPassports.map(passport => (
                  <li key={`passport-${passport.toLowerCase()}`}>
                    <Link
                      href={`/visa/${encodeURIComponent(passport)}/${encodeURIComponent(destinationName)}`}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[#1F2937] hover:bg-[#14B8A6]/5 hover:text-[#14B8A6] transition"
                    >
                      <span className="text-lg leading-none">{getFlag(passport)}</span>
                      <span>{passport} → {destinationName} Visa</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/${destinationSlug.toLowerCase().replace(/\s+/g, '-')}-visa-requirements`}
                className="mt-3 inline-block text-xs font-semibold text-[#14B8A6] hover:underline"
              >
                All passports visiting {destinationName} →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── Related blog posts ─────────────────────────────────────────────── */}
      {relatedBlogs.length > 0 && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Related guides</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {relatedBlogs.map(post => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex items-start gap-3 rounded-xl p-3 hover:bg-[#14B8A6]/5 transition"
              >
                <span className="text-2xl leading-none mt-0.5">{post.coverEmoji}</span>
                <div>
                  <p className="text-sm font-medium text-[#1F2937] group-hover:text-[#14B8A6] transition leading-snug">
                    {post.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{post.readTime}</p>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/blog" className="mt-3 inline-block text-xs font-semibold text-[#14B8A6] hover:underline">
            All visa guides →
          </Link>
        </div>
      )}

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
        <h2 id="faq-heading" className="text-xl font-bold text-[#1F2937] mb-5">
          Frequently Asked Questions
        </h2>
        <div>
          {faqItems.map((item, i) => (
            <FAQItem
              key={i}
              item={item}
              open={openFAQ === i}
              onToggle={() => setOpenFAQ(openFAQ === i ? null : i)}
            />
          ))}
        </div>
      </div>

    </section>
  )
}
