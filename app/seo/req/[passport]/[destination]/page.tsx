/**
 * Template 1 — Programmatic SEO
 * URL: /visa-requirements-for-{passport}-citizens-to-{destination}
 * e.g. /visa-requirements-for-pakistani-citizens-to-uae
 *
 * This is the primary long-form visa requirements page for
 * "[nationality] visa requirements for [destination]" search queries.
 * Target: 38,809 pages (197 passports × 197 destinations)
 *
 * ISR: revalidated every 7 days
 */
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { COUNTRIES, BY_NATIONALITY, BY_SLUG, resolveCountry, OFFICIAL_VISA_PORTALS } from '@/lib/seo/countries'
import type { VisaRequirement } from '@/components/visa/VisaRequirementsBlock'

// ── ISR ────────────────────────────────────────────────────────────────────────
// Render on demand instead of prerendering at build (avoids Next 16 prerender
// crashes on occasional null/dirty Supabase rows).
export const dynamic = 'force-dynamic'

// ── Static params for top 50 routes (build-time) ─────────────────────────────
export async function generateStaticParams() {
  // Build-time: generate top 50 routes
  // Remaining routes handled by ISR on first request
  const topRoutes: Array<{ passport: string; destination: string }> = [
    { passport: 'pakistani',   destination: 'uae' },
    { passport: 'pakistani',   destination: 'saudi-arabia' },
    { passport: 'pakistani',   destination: 'turkey' },
    { passport: 'pakistani',   destination: 'thailand' },
    { passport: 'pakistani',   destination: 'malaysia' },
    { passport: 'pakistani',   destination: 'united-kingdom' },
    { passport: 'pakistani',   destination: 'germany' },
    { passport: 'pakistani',   destination: 'united-states' },
    { passport: 'pakistani',   destination: 'china' },
    { passport: 'pakistani',   destination: 'qatar' },
    { passport: 'pakistani',   destination: 'oman' },
    { passport: 'pakistani',   destination: 'bahrain' },
    { passport: 'indian',      destination: 'uae' },
    { passport: 'indian',      destination: 'united-states' },
    { passport: 'indian',      destination: 'united-kingdom' },
    { passport: 'indian',      destination: 'germany' },
    { passport: 'indian',      destination: 'canada' },
    { passport: 'indian',      destination: 'australia' },
    { passport: 'indian',      destination: 'singapore' },
    { passport: 'indian',      destination: 'thailand' },
    { passport: 'bangladeshi', destination: 'uae' },
    { passport: 'bangladeshi', destination: 'saudi-arabia' },
    { passport: 'bangladeshi', destination: 'malaysia' },
    { passport: 'bangladeshi', destination: 'united-kingdom' },
    { passport: 'nigerian',    destination: 'united-kingdom' },
    { passport: 'nigerian',    destination: 'united-states' },
    { passport: 'nigerian',    destination: 'germany' },
    { passport: 'nigerian',    destination: 'uae' },
    { passport: 'indonesian',  destination: 'saudi-arabia' },
    { passport: 'indonesian',  destination: 'malaysia' },
    { passport: 'indonesian',  destination: 'japan' },
    { passport: 'indonesian',  destination: 'australia' },
    { passport: 'filipino',    destination: 'japan' },
    { passport: 'filipino',    destination: 'united-states' },
    { passport: 'filipino',    destination: 'australia' },
    { passport: 'filipino',    destination: 'south-korea' },
    { passport: 'egyptian',    destination: 'saudi-arabia' },
    { passport: 'egyptian',    destination: 'uae' },
    { passport: 'egyptian',    destination: 'germany' },
    { passport: 'american',    destination: 'uae' },
    { passport: 'american',    destination: 'japan' },
    { passport: 'british',     destination: 'uae' },
    { passport: 'british',     destination: 'australia' },
    { passport: 'german',      destination: 'uae' },
    { passport: 'german',      destination: 'japan' },
    { passport: 'canadian',    destination: 'uae' },
    { passport: 'kenyan',      destination: 'uae' },
    { passport: 'ethiopian',   destination: 'uae' },
    { passport: 'south-african', destination: 'uae' },
  ]
  return topRoutes
}

// ── Supabase ───────────────────────────────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

async function fetchVisaRequirement(passportIso: string, destinationIso: string): Promise<VisaRequirement | null> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('visa_requirements')
    .select('*')
    .eq('passport_iso', passportIso)
    .eq('destination_iso', destinationIso)
    .eq('purpose', 'tourist')
    .single()
  return data as VisaRequirement | null
}

// Throws on a Supabase ERROR (transient — caller must not 404 on it); returns []
// only for a genuinely empty result. Keeps "no data" distinguishable from "outage".
async function fetchLegacyVisaData(passportName: string, destinationName: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .ilike('passport_country', passportName)
    .ilike('country_name', destinationName)
    .limit(5)
  if (error) throw new Error(`[seo/req] destinations query failed: ${error.message}`)
  return data ?? []
}

async function fetchRelatedRoutes(passportIso: string, destinationIso: string) {
  const supabase = getSupabase()
  // Other destinations from same passport
  const { data: samePassport } = await supabase
    .from('destinations')
    .select('country_name')
    .ilike('passport_country', BY_SLUG[COUNTRIES.find(c => c.iso3 === passportIso)?.slug ?? '']?.name ?? '')
    .neq('country_name', COUNTRIES.find(c => c.iso3 === destinationIso)?.name ?? '')
    .limit(6)

  // Other passports to same destination
  const { data: sameDestination } = await supabase
    .from('destinations')
    .select('passport_country')
    .ilike('country_name', COUNTRIES.find(c => c.iso3 === destinationIso)?.name ?? '')
    .neq('passport_country', COUNTRIES.find(c => c.iso3 === passportIso)?.name ?? '')
    .limit(4)

  return {
    // Filter out null names — a null here crashed the build when downstream
    // code called dest.toLowerCase() during prerender.
    samePassport: (samePassport ?? []).map(r => r.country_name as string).filter(Boolean),
    sameDestination: (sameDestination ?? []).map(r => r.passport_country as string).filter(Boolean),
  }
}

async function fetchSeoContent(passportIso: string, destinationIso: string) {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('seo_page_content')
    .select('intro_paragraph, content_json')
    .eq('template', 'template1')
    .eq('passport_iso', passportIso)
    .eq('destination_iso', destinationIso)
    .single()
  return data
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function visaCategoryLabel(cat: string): string {
  return ({
    visa_free: 'Visa Free',
    visa_on_arrival: 'Visa on Arrival',
    evisa: 'eVisa Required',
    eta: 'ETA Required',
    visa_required: 'Visa Required',
    not_permitted: 'Entry Not Permitted',
    conditional: 'Conditional Entry',
  }[cat] ?? cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
}

function visaCategoryColor(cat: string): { bg: string; text: string; border: string } {
  return ({
    visa_free:      { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    visa_on_arrival:{ bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'    },
    evisa:          { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200'    },
    eta:            { bg: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200'    },
    visa_required:  { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200'  },
    not_permitted:  { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200'     },
    conditional:    { bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200'  },
  }[cat] ?? { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' })
}

function processHours(min?: number | null, max?: number | null, label?: string | null): string {
  if (label) return label
  if (min && max) {
    if (min < 24 && max <= 48)  return `${min}–${max} hours`
    const dMin = Math.ceil(min / 24)
    const dMax = Math.ceil(max / 24)
    if (dMin === dMax) return `${dMin} business day${dMin > 1 ? 's' : ''}`
    return `${dMin}–${dMax} business days`
  }
  return 'Varies'
}

function feeDisplay(req: VisaRequirement): string {
  if (req.fee_is_free || req.visa_category === 'visa_free') return 'Free'
  if (req.fee_amount && req.fee_currency) {
    const local = `${req.fee_currency} ${req.fee_amount}`
    const usd   = req.fee_amount_usd ? ` (≈ USD ${req.fee_amount_usd})` : ''
    return `${local}${usd}`
  }
  return 'Check official source'
}

// ── Metadata ───────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ passport: string; destination: string }>
}): Promise<Metadata> {
  const { passport: passportSlug, destination: destinationSlug } = await params

  const passportCountry     = BY_NATIONALITY[passportSlug.toLowerCase()] ?? BY_SLUG[passportSlug.toLowerCase()]
  const destinationCountry  = BY_SLUG[destinationSlug.toLowerCase()]

  const passportName    = passportCountry?.name ?? passportSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const destinationName = destinationCountry?.name ?? destinationSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const year = new Date().getFullYear()

  const title = `Visa Requirements for ${passportName} Citizens Traveling to ${destinationName} (${year})`
  const description = `Complete ${year} visa guide for ${passportName} passport holders visiting ${destinationName}. Exact fees, processing times, required documents, application steps, and official sources. Updated ${new Date().toLocaleString('en', { month: 'long', year: 'numeric' })}.`
  // Lowercase the slug echo — lookups are case-insensitive, so an uppercase URL
  // variant would otherwise self-canonicalise as a duplicate.
  const canonical = `https://www.visitplane.com/visa-requirements-for-${passportSlug.toLowerCase()}-citizens-to-${destinationSlug.toLowerCase()}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      images: [`https://www.visitplane.com/api/og?passport=${passportSlug}&destination=${destinationSlug}&template=1`],
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function Template1Page({
  params,
}: {
  params: Promise<{ passport: string; destination: string }>
}) {
  const { passport: passportSlug, destination: destinationSlug } = await params

  const passportCountry    = BY_NATIONALITY[passportSlug.toLowerCase()] ?? BY_SLUG[passportSlug.toLowerCase()]
  const destinationCountry = BY_SLUG[destinationSlug.toLowerCase()]

  if (!passportCountry || !destinationCountry) notFound()

  const passportName    = passportCountry.name
  const destinationName = destinationCountry.name
  const passportFlag    = passportCountry.flag
  const destinationFlag = destinationCountry.flag
  const year            = new Date().getFullYear()
  const updatedMonth    = new Date().toLocaleString('en', { month: 'long', year: 'numeric' })

  let verifiedReq: Awaited<ReturnType<typeof fetchVisaRequirement>> = null
  let legacyData: Awaited<ReturnType<typeof fetchLegacyVisaData>> = []
  let relatedRoutes: Awaited<ReturnType<typeof fetchRelatedRoutes>> = { samePassport: [], sameDestination: [] }
  let seoContent: Awaited<ReturnType<typeof fetchSeoContent>> = null
  let fetchFailed = false
  try {
    ;[verifiedReq, legacyData, relatedRoutes, seoContent] = await Promise.all([
      fetchVisaRequirement(passportCountry.iso3, destinationCountry.iso3),
      fetchLegacyVisaData(passportName, destinationName),
      fetchRelatedRoutes(passportCountry.iso3, destinationCountry.iso3),
      fetchSeoContent(passportCountry.iso3, destinationCountry.iso3),
    ])
  } catch (err) {
    console.error('[Template1Page] data fetch error for', passportName, '→', destinationName, err)
    fetchFailed = true
  }

  const primary = legacyData[0]
  // A transient fetch failure must surface as a 5xx (Google retries those), never
  // as a 404 (Google deindexes those) — only a confirmed-empty result may 404.
  if (fetchFailed && !verifiedReq && !primary) throw new Error('Visa data temporarily unavailable')
  if (!verifiedReq && !primary) notFound()

  // Resolve data — prefer verified, fall back to legacy
  const visaCategory   = verifiedReq?.visa_category ?? (primary?.visa_type?.toLowerCase().includes('free') ? 'visa_free' : primary?.visa_type?.toLowerCase().includes('arrival') ? 'visa_on_arrival' : 'visa_required')
  const visaLabel      = verifiedReq ? visaCategoryLabel(verifiedReq.visa_category) : (primary?.visa_type ?? 'Visa Required')
  const categoryColors = visaCategoryColor(visaCategory)
  const processingTime = processHours(verifiedReq?.processing_min_hours, verifiedReq?.processing_max_hours, verifiedReq?.processing_label ?? primary?.processing_time)
  const fee            = verifiedReq ? feeDisplay(verifiedReq) : (primary?.pricing ?? 'Check official source')
  const maxStay        = verifiedReq?.max_stay_days ? `${verifiedReq.max_stay_days} days` : 'Check destination requirements'
  const appUrl         = verifiedReq?.application_url ?? OFFICIAL_VISA_PORTALS[destinationCountry.iso3]?.url
  const portalName     = OFFICIAL_VISA_PORTALS[destinationCountry.iso3]?.name ?? `${destinationName} Official Portal`
  const documents: Array<{ name: string; detail: string; mandatory: boolean }> = verifiedReq?.required_documents ?? []

  // Intro paragraph — use Gemini-generated if available, else template
  const intro = seoContent?.intro_paragraph ?? (() => {
    switch (visaCategory) {
      case 'visa_free':
        return `If you hold a ${passportName} passport, you can enter ${destinationName} without a visa — one of the travel world's most convenient arrangements. ${passportName} citizens can travel directly with just their valid passport. This guide covers everything you still need to know: how long you can stay, what documents to carry at immigration, and any entry conditions that apply. Always verify requirements with the official ${destinationName} immigration authority before travel, as rules can change without notice.`
      case 'visa_on_arrival':
        return `${passportName} passport holders can obtain a ${destinationName} visa on arrival — no advance appointment required. You'll apply directly at the immigration counter when you land. This guide explains the exact fee to bring (pay in accepted currencies), the supporting documents you'll need in hand, and tips for a smooth arrival. Many travelers don't realize that having the right documents ready at the counter can save hours in queues.`
      case 'evisa':
        return `${passportName} citizens apply for a ${destinationName} eVisa entirely online — no embassy visit, no courier needed. The process typically takes ${processingTime} and the approval arrives by email. This guide walks you through each step of the official portal, the exact documents to upload, and common reasons applications get delayed or rejected. Start your application at least 2 weeks before travel even if processing says faster.`
      default:
        return `${passportName} passport holders require a ${destinationName} visa, which must be obtained before travel. This comprehensive guide covers the visa types available, the complete document checklist, step-by-step application instructions, current fees, and realistic processing timelines. Applying for the right visa type — and having complete documentation — is the single biggest factor in approval success.`
    }
  })()

  // ── JSON-LD schemas ──────────────────────────────────────────────────────────
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',         item: 'https://www.visitplane.com' },
      { '@type': 'ListItem', position: 2, name: destinationName, item: `https://www.visitplane.com/destinations/${destinationSlug}` },
      { '@type': 'ListItem', position: 3, name: `${passportName} Citizens`, item: `https://www.visitplane.com/visa-requirements-for-${passportSlug}-citizens-to-${destinationSlug}` },
    ],
  }

  const travelActionSchema = {
    '@context': 'https://schema.org',
    '@type': 'TravelAction',
    name: `${passportName} Citizens Traveling to ${destinationName}`,
    fromLocation: { '@type': 'Country', name: passportName },
    toLocation: { '@type': 'Country', name: destinationName },
  }

  const faqItems = [
    {
      q: `Do ${passportName} citizens need a visa to visit ${destinationName}?`,
      a: verifiedReq
        ? `${passportName} passport holders require a ${visaLabel} to enter ${destinationName}. ${visaCategory === 'visa_free' ? 'No visa application is needed.' : `The fee is ${fee} and processing takes ${processingTime}.`}`
        : primary?.visa_type
        ? `${passportName} citizens need: ${primary.visa_type}. ${primary.processing_time ? `Processing time: ${primary.processing_time}.` : ''}`
        : `Verify current requirements at the official ${destinationName} immigration authority.`,
    },
    {
      q: `How long can ${passportName} citizens stay in ${destinationName}?`,
      a: verifiedReq?.max_stay_days
        ? `${passportName} passport holders can stay in ${destinationName} for up to ${verifiedReq.max_stay_days} days per visit. Overstaying results in fines and possible entry bans.`
        : `The permitted stay varies by visa type. Check your visa stamp or approval letter for your specific authorized period.`,
    },
    {
      q: `What documents do ${passportName} citizens need for ${destinationName}?`,
      a: documents.length > 0
        ? `For ${passportName} citizens visiting ${destinationName}: ${documents.filter(d => d.mandatory).map(d => d.name).join(', ')}.`
        : `Core documents include: valid passport (6+ months validity), completed visa application form, recent passport photos, return ticket, accommodation proof, and bank statements.`,
    },
    {
      q: `How much does a ${destinationName} visa cost for ${passportName} citizens?`,
      a: verifiedReq?.fee_is_free
        ? `Entry is free for ${passportName} passport holders — no visa fee applies.`
        : verifiedReq?.fee_amount
        ? `The ${destinationName} visa fee for ${passportName} citizens is ${fee}. ${verifiedReq.fee_notes ?? ''}`
        : `Visa fees vary. Check the official ${destinationName} embassy or immigration website for current rates.`,
    },
    {
      q: `How long does ${destinationName} visa processing take for ${passportName} citizens?`,
      a: `Processing time for ${passportName} citizens is typically ${processingTime}. Apply at least 2–4 weeks before travel, especially during peak season (Eid, summer, Christmas).`,
    },
    {
      q: `Can ${passportName} citizens extend their ${destinationName} visa?`,
      a: `Visa extension policies depend on your visa type. Contact the ${destinationName} immigration authority before your visa expires. Overstaying — even by one day — can result in fines, deportation, and future entry bans.`,
    },
    {
      q: `What are the common rejection reasons for ${passportName} citizens applying for a ${destinationName} visa?`,
      a: `Common reasons include: incomplete documentation, insufficient bank balance, inconsistent travel history, unexplained gaps in employment, prior visa rejections not disclosed, and applying too close to travel date. Being thorough and accurate prevents most rejections.`,
    },
    {
      q: `Where can ${passportName} citizens apply for a ${destinationName} visa?`,
      a: visaCategory === 'evisa'
        ? `${passportName} citizens apply online at ${appUrl ?? `the official ${destinationName} eVisa portal`}. No embassy visit required.`
        : visaCategory === 'visa_on_arrival'
        ? `${passportName} citizens apply at the ${destinationName} immigration counter on arrival. No advance application needed.`
        : `${passportName} citizens apply at the ${destinationName} embassy or consulate in their country, or at an authorised Visa Application Centre (VFS Global / BLS International).`,
    },
  ]

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  // ── Application steps ───────────────────────────────────────────────────────
  const applicationSteps = (() => {
    if (visaCategory === 'visa_free') return [
      { n: 1, title: 'Check passport validity',   desc: `Ensure your ${passportName} passport is valid for at least 6 months beyond your planned stay in ${destinationName}.` },
      { n: 2, title: 'Book flights and hotel',    desc: 'You don\'t need a visa — book your trip directly. Having a return ticket and hotel booking ready for immigration is advisable.' },
      { n: 3, title: 'Prepare entry documents',   desc: `Carry: valid passport, return ticket, hotel confirmation, proof of sufficient funds. Immigration officers may ask for any of these.` },
      { n: 4, title: 'Arrive and clear customs',  desc: `Present your passport at immigration. Your stay is typically authorized for ${maxStay}. Never overstay — fines and bans apply.` },
    ]
    if (visaCategory === 'visa_on_arrival') return [
      { n: 1, title: 'Prepare required documents', desc: `Before flying, prepare: valid passport (6+ months), return ticket, hotel booking, bank statement, and ${fee !== 'Check official source' ? `exact fee of ${fee} in cash` : 'the visa fee in cash (local or USD)'}.` },
      { n: 2, title: 'Land and proceed to VOA counter', desc: `Follow signs to "Visa on Arrival" after landing in ${destinationName}. Queues can be long — allow 45–90 minutes for the process.` },
      { n: 3, title: 'Complete application form', desc: 'Fill out the form at the counter or kiosk. Write clearly and accurately. Any discrepancy with your passport causes delays.' },
      { n: 4, title: 'Pay the visa fee',           desc: `Pay ${fee} at the counter. Bring exact change or accept that you may not receive change. Some airports accept cards.` },
      { n: 5, title: 'Receive your visa stamp',    desc: `Your visa is stamped in your passport. Check the dates carefully before leaving the counter. You're authorized to stay ${maxStay}.` },
    ]
    if (visaCategory === 'evisa') return [
      { n: 1, title: 'Create your account',        desc: `Visit ${appUrl ?? 'the official eVisa portal'} and create an applicant account using your email. Use an email you check regularly — approvals arrive there.` },
      { n: 2, title: 'Fill in application form',   desc: `Complete the online form with your personal details, travel dates, and purpose. Match every field exactly with your passport.` },
      { n: 3, title: 'Upload documents',           desc: `Upload scanned copies of: passport data page (clear, no glare), recent passport photo (white background), and any additional required documents.` },
      { n: 4, title: 'Pay the visa fee',           desc: `Pay ${fee} online using a credit or debit card. Keep the payment reference number.` },
      { n: 5, title: 'Wait for approval',          desc: `Processing takes ${processingTime}. You'll receive an approval email. Check spam folders. If no response after ${processingTime}, check your application status online.` },
      { n: 6, title: 'Print and travel',           desc: `Print your approved eVisa (or save it digitally). Present it at immigration on arrival in ${destinationName}. Some airports require a printed copy.` },
    ]
    return [
      { n: 1, title: 'Check eligibility',          desc: `Confirm you're applying for the correct visa type for your purpose. Tourist, business, and transit visas each have different requirements.` },
      { n: 2, title: 'Book an appointment',         desc: `Schedule an appointment at the ${destinationName} embassy or an authorised Visa Application Centre (VFS Global / BLS International) in ${passportName}.` },
      { n: 3, title: 'Prepare your documents',     desc: `Gather all required documents. Missing even one document is grounds for rejection. Use the checklist above.` },
      { n: 4, title: 'Attend in person',           desc: `Attend your appointment with original documents. Dress professionally — first impressions can affect officer interactions.` },
      { n: 5, title: 'Pay the fee and submit',     desc: `Pay the visa fee (${fee}) and submit your application. Keep the receipt.` },
      { n: 6, title: 'Wait for processing',        desc: `Processing takes ${processingTime}. Track your application online or via the VAC. Do not book non-refundable travel until your visa is approved.` },
      { n: 7, title: 'Collect your passport',      desc: `Collect your passport with the visa stamped, or arrange courier delivery. Check all details — name spelling, dates, number of entries.` },
    ]
  })()

  // ── Document checklist ──────────────────────────────────────────────────────
  const defaultDocuments = [
    { name: 'Valid Passport', detail: `Must have at least 6 months validity beyond your stay in ${destinationName}, plus at least 2 blank pages for stamps.`, mandatory: true },
    { name: 'Completed Visa Application Form', detail: `Download from the official ${destinationName} embassy website. Fill in block capitals with a black pen.`, mandatory: true },
    { name: '2 Passport-Sized Photographs', detail: 'White background, taken within the last 6 months. Size: typically 3.5 × 4.5 cm. Check specific requirements for this destination.', mandatory: true },
    { name: 'Confirmed Return/Onward Flight Ticket', detail: 'Booking confirmation showing entry and exit dates. Some embassies require a fully paid ticket, not just a hold.', mandatory: true },
    { name: 'Proof of Accommodation', detail: 'Hotel booking confirmation or invitation letter from a host. Must cover your entire stay.', mandatory: true },
    { name: 'Bank Statement (last 3–6 months)', detail: `Must show sufficient funds for your trip. The general rule is USD 50–100 per day in ${destinationName}. Stamped by bank is preferred.`, mandatory: true },
    { name: 'Travel Insurance', detail: `Minimum coverage: medical + repatriation. Required for most ${destinationName} visa types. Check minimum sum insured.`, mandatory: visaCategory === 'visa_required' },
    { name: 'Proof of Employment / Income', detail: 'Employment letter on company letterhead, pay slips, or business registration (for self-employed).', mandatory: false },
    { name: 'No Objection Certificate (NOC)', detail: 'If employed, your employer confirms you have leave approved for the trip. Strongly recommended for all applicants.', mandatory: false },
  ]

  const displayDocs = documents.length > 0 ? documents : defaultDocuments

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2937] antialiased">

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(travelActionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-100 print:hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-1.5 py-2.5 text-xs text-gray-400 flex-wrap">
            <li><Link href="/" className="hover:text-[#14B8A6] transition-colors">Home</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link href="/destinations" className="hover:text-[#14B8A6] transition-colors">Destinations</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link href={`/destinations/${destinationSlug}`} className="hover:text-[#14B8A6] transition-colors">{destinationFlag} {destinationName}</Link></li>
            <li aria-hidden="true">›</li>
            <li className="font-medium text-[#1F2937]" aria-current="page">{passportFlag} {passportName} Visa Requirements</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <header className="bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0d9488]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-white/90">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Updated {updatedMonth}
            </span>
            <span className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-white/80">
              {verifiedReq ? '✓ Embassy-Verified Data' : 'Community Verified'}
            </span>
          </div>

          {/* Flags + route */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-4xl sm:text-5xl">{passportFlag}</span>
            <div className="flex flex-col">
              <span className="text-white/60 text-xs uppercase tracking-widest">Passport</span>
              <span className="text-white font-semibold">{passportName}</span>
            </div>
            <div className="text-white/40 text-2xl mx-2">→</div>
            <span className="text-4xl sm:text-5xl">{destinationFlag}</span>
            <div className="flex flex-col">
              <span className="text-white/60 text-xs uppercase tracking-widest">Destination</span>
              <span className="text-white font-semibold">{destinationName}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Visa Requirements for {passportName} Citizens
            <span className="block text-[#34d399]">Traveling to {destinationName}</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/75 max-w-2xl leading-relaxed">
            The complete {year} guide — exact fees, processing times, documents checklist, and step-by-step application instructions for {passportName} passport holders.
          </p>

          {/* Quick facts */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
            {[
              { label: 'Visa Type', value: visaLabel },
              { label: 'Processing', value: processingTime },
              { label: 'Fee',        value: fee },
              { label: 'Max Stay',   value: maxStay },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 p-3 sm:p-4">
                <div className="text-[10px] uppercase tracking-widest text-white/50 mb-1">{label}</div>
                <div className="text-sm font-bold text-white leading-tight">{value}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          {appUrl && visaCategory !== 'visa_free' && visaCategory !== 'visa_on_arrival' && (
            <div className="mt-6">
              <a
                href={appUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-2 rounded-xl bg-[#14B8A6] hover:bg-[#0d9488] text-white font-semibold px-6 py-3 text-sm transition-colors"
              >
                Apply at {portalName} →
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Disclaimer */}
      <div className="bg-amber-50 border-b border-amber-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-2.5">
          <p className="text-xs text-amber-700">
            <strong>Disclaimer:</strong> Visa rules change frequently. Always verify with the official {destinationName} embassy or immigration authority before travel. This page is for informational purposes only.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-10 xl:gap-14">

          {/* Left: main content */}
          <div className="space-y-12">

            {/* Intro */}
            <section>
              <p className="text-gray-600 text-base leading-relaxed">{intro}</p>
            </section>

            {/* Visa quick facts table */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] mb-4">Visa Quick Facts</h2>
              <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { label: 'Visa Type',            value: visaLabel,   highlight: true },
                      { label: 'Fee',                   value: fee },
                      { label: 'Processing Time',       value: processingTime },
                      { label: 'Maximum Stay',          value: maxStay },
                      { label: 'Multiple Entry',        value: verifiedReq?.multiple_entry === true ? 'Yes' : verifiedReq?.multiple_entry === false ? 'No' : 'Check visa type' },
                      { label: 'Validity',              value: verifiedReq?.validity_days ? `${verifiedReq.validity_days} days from issue` : 'Check approval' },
                      { label: 'Passport Validity',     value: verifiedReq?.passport_validity_months ? `Min. ${verifiedReq.passport_validity_months} months beyond stay` : 'Min. 6 months recommended' },
                      ...(appUrl ? [{ label: 'Application Portal', value: portalName, link: appUrl }] : []),
                    ].map(({ label, value, highlight, link }) => (
                      <tr key={label} className={highlight ? `${categoryColors.bg}` : ''}>
                        <td className="px-5 py-3.5 font-medium text-gray-500 w-44">{label}</td>
                        <td className={`px-5 py-3.5 font-semibold ${highlight ? categoryColors.text : 'text-[#1F2937]'}`}>
                          {link ? (
                            <a href={link} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2">
                              {value}
                            </a>
                          ) : value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Warnings / eligibility conditions */}
            {((verifiedReq?.warnings?.length ?? 0) > 0 || (verifiedReq?.eligibility_conditions?.length ?? 0) > 0) && (
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] mb-4">Important Notices</h2>
                <div className="space-y-3">
                  {verifiedReq?.eligibility_conditions?.map((cond, i) => (
                    <div key={i} className="flex gap-3 rounded-xl bg-blue-50 border border-blue-100 p-4">
                      <span className="text-blue-500 text-lg shrink-0">ℹ️</span>
                      <p className="text-sm text-blue-800 leading-relaxed">{typeof cond === 'string' ? cond : JSON.stringify(cond)}</p>
                    </div>
                  ))}
                  {verifiedReq?.warnings?.map((warn, i) => (
                    <div key={i} className="flex gap-3 rounded-xl bg-amber-50 border border-amber-100 p-4">
                      <span className="text-amber-500 text-lg shrink-0">⚠️</span>
                      <p className="text-sm text-amber-800 leading-relaxed">{typeof warn === 'string' ? warn : JSON.stringify(warn)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Document checklist */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] mb-4">
                Required Documents for {passportName} Citizens
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                Missing even one document can result in rejection or delays. Prepare originals AND photocopies of everything.
              </p>
              <div className="space-y-3">
                {/* Mandatory */}
                <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                  <div className="px-5 py-3 bg-red-50 border-b border-red-100">
                    <h3 className="text-sm font-bold text-red-700">✓ Mandatory Documents</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {displayDocs.filter(d => d.mandatory).map((doc, i) => (
                      <div key={i} className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 h-5 w-5 rounded-full bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
                            <span className="text-red-600 text-xs font-bold">{i + 1}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#1F2937]">{doc.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{doc.detail}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optional */}
                {displayDocs.filter(d => !d.mandatory).length > 0 && (
                  <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                    <div className="px-5 py-3 bg-yellow-50 border-b border-yellow-100">
                      <h3 className="text-sm font-bold text-yellow-700">⚡ Strongly Recommended</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {displayDocs.filter(d => !d.mandatory).map((doc, i) => (
                        <div key={i} className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 h-5 w-5 rounded-full bg-yellow-100 border border-yellow-200 flex items-center justify-center shrink-0">
                              <span className="text-yellow-700 text-xs font-bold">{i + 1}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#1F2937]">{doc.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{doc.detail}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Application process */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] mb-4">
                How to Apply — Step by Step
              </h2>
              <ol className="space-y-4">
                {applicationSteps.map(({ n, title, desc }) => (
                  <li key={n} className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#14B8A6] text-sm font-bold text-white shadow-sm">
                      {n}
                    </div>
                    <div className="pt-1">
                      <p className="font-semibold text-[#1F2937]">{title}</p>
                      <p className="text-sm text-gray-500 mt-1 leading-relaxed">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Common rejection reasons */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] mb-4">
                Common Rejection Reasons
              </h2>
              <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                <p className="text-sm text-red-700 mb-4 leading-relaxed">
                  Many travelers don't realize that most {destinationName} visa rejections for {passportName} citizens are preventable. Here are the top reasons — avoid every one:
                </p>
                <ul className="space-y-2.5">
                  {[
                    'Incomplete documentation — even one missing document triggers rejection',
                    'Bank statement showing insufficient funds (officers calculate daily spend required)',
                    'Travel history with overstays in any country — discloses risk profile',
                    'Inconsistencies between application form and passport (name spelling, DOB)',
                    'Prior visa rejections not disclosed on the application form',
                    'Unexplained employment gaps or unusual income patterns',
                    'Applying too close to travel date — insufficient processing time',
                    'Passport valid for less than 6 months beyond the planned stay',
                  ].map((reason, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-red-800">
                      <span className="text-red-400 mt-0.5 shrink-0">✕</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Official sources */}
            {(verifiedReq?.official_sources?.length ?? 0) > 0 && (
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] mb-4">Official Sources</h2>
                <div className="space-y-2">
                  {verifiedReq!.official_sources.map((source, i) => (
                    <a
                      key={i}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm hover:border-teal-200 hover:bg-teal-50 transition-colors group"
                    >
                      <span className="text-gray-400 group-hover:text-teal-500">🔗</span>
                      <div>
                        <span className="font-medium text-[#1F2937] group-hover:text-teal-700">{source.label}</span>
                        {source.is_authoritative && (
                          <span className="ml-2 rounded-full bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 font-semibold">Official</span>
                        )}
                        {source.verified_at && (
                          <span className="block text-[11px] text-gray-400">Verified {new Date(source.verified_at).toLocaleDateString('en', { month: 'short', year: 'numeric' })}</span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* FAQ */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {faqItems.map(({ q, a }, i) => (
                  <details key={i} className="group rounded-xl border border-gray-200 bg-white">
                    <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-medium text-[#1F2937] text-sm gap-4">
                      <span>{q}</span>
                      <span className="text-gray-400 group-open:rotate-180 transition-transform shrink-0">▾</span>
                    </summary>
                    <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">{a}</p>
                  </details>
                ))}
              </div>
            </section>

            {/* Related long-form guide */}
            <section className="rounded-2xl border border-teal-100 bg-teal-50 p-5">
              <h3 className="font-bold text-teal-800 mb-3">
                Also Read: {destinationName} Visa Guide for {passportName} Citizens
              </h3>
              <p className="text-sm text-teal-700 mb-4">
                Looking for a more in-depth guide with step-by-step walkthroughs, document photos, real timeline expectations, and what to do if rejected?
              </p>
              <Link
                href={`/${destinationSlug}-visa-guide-for-${passportSlug}`}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2.5 text-sm transition-colors"
              >
                Read the Full Guide →
              </Link>
            </section>

          </div>

          {/* Right sidebar */}
          <aside className="mt-10 lg:mt-0 space-y-6">

            {/* Visa status card */}
            <div className={`rounded-2xl border ${categoryColors.border} ${categoryColors.bg} p-5`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{destinationFlag}</span>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Entry Type</p>
                  <p className={`text-base font-bold ${categoryColors.text}`}>{visaLabel}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Fee</span>
                  <span className="font-semibold text-[#1F2937]">{fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Processing</span>
                  <span className="font-semibold text-[#1F2937]">{processingTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Max stay</span>
                  <span className="font-semibold text-[#1F2937]">{maxStay}</span>
                </div>
              </div>
              {appUrl && (
                <a
                  href={appUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#14B8A6] hover:bg-[#0d9488] text-white font-semibold px-4 py-2.5 text-sm transition-colors w-full"
                >
                  Apply Online →
                </a>
              )}
            </div>

            {/* Internal links */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="font-bold text-[#1F2937] text-sm mb-3">Quick Links</h3>
              <div className="space-y-2">
                {[
                  { href: `/visa/${encodeURIComponent(passportName)}/${encodeURIComponent(destinationName)}`, label: '⚡ Quick Visa Check' },
                  { href: `/${destinationSlug}-visa-guide-for-${passportSlug}`, label: '📖 Full Visa Guide' },
                  { href: `/visa-free-countries-for-${passportSlug}-passport`, label: `🌍 All Visa-Free for ${passportName}` },
                  { href: `/cheapest-visa-from-${passportSlug}-passport`, label: '💰 Cheapest Visas' },
                  { href: '/checklist', label: '✅ Document Checklist' },
                  { href: '/embassy-finder', label: '🏛️ Embassy Finder' },
                  { href: '/travel-insurance', label: '🛡️ Travel Insurance' },
                  { href: '/cost-calculator', label: '🧮 Cost Calculator' },
                ].map(({ href, label }) => (
                  <Link key={href} href={href} className="block text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg px-3 py-2 transition-colors">
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Other destinations from this passport */}
            {relatedRoutes.samePassport.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="font-bold text-[#1F2937] text-sm mb-3">{passportFlag} {passportName} → Other Destinations</h3>
                <div className="space-y-1.5">
                  {relatedRoutes.samePassport.map(dest => {
                    const destCountry = COUNTRIES.find(c => c.name.toLowerCase() === dest.toLowerCase())
                    const destSlug    = destCountry?.slug ?? dest.toLowerCase().replace(/\s+/g, '-')
                    return (
                      <Link
                        key={dest}
                        href={`/visa-requirements-for-${passportSlug}-citizens-to-${destSlug}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg px-2 py-1.5 transition-colors"
                      >
                        <span>{destCountry?.flag ?? '🌍'}</span>
                        <span>{dest}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Other passports to this destination */}
            {relatedRoutes.sameDestination.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="font-bold text-[#1F2937] text-sm mb-3">{destinationFlag} {destinationName} visa for:</h3>
                <div className="space-y-1.5">
                  {relatedRoutes.sameDestination.map(passport => {
                    const ppCountry  = COUNTRIES.find(c => c.name.toLowerCase() === passport.toLowerCase())
                    const ppNat      = ppCountry?.nationality ?? passport.toLowerCase().replace(/\s+/g, '-')
                    return (
                      <Link
                        key={passport}
                        href={`/visa-requirements-for-${ppNat}-citizens-to-${destinationSlug}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg px-2 py-1.5 transition-colors"
                      >
                        <span>{ppCountry?.flag ?? '🌍'}</span>
                        <span>{passport} citizens</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

          </aside>
        </div>
      </div>

    </div>
  )
}
