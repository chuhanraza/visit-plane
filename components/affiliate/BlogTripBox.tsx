/**
 * BlogTripBox — "Recommended for this trip" box for blog post footers
 *
 * Shows all 3 affiliate streams contextualised to the destination in the post.
 * Placed at the bottom of every blog post, just before related posts.
 *
 * Usage:
 *   <BlogTripBox
 *     destinationName="Germany"
 *     passportCountry="Pakistan"
 *     blogSlug="pakistan-to-germany-visa-guide"
 *   />
 */

import { affiliateTrackingUrl, isInsuranceRequired } from '@/src/lib/affiliates'

interface BlogTripBoxProps {
  destinationName: string
  passportCountry: string
  blogSlug: string
  /** ISO-3 destination code (optional, improves eSIM and flight targeting) */
  destinationIso?: string
}

interface BoxCard {
  icon: string
  label: string
  description: string
  cta: string
  href: string
  highlight?: boolean
}

export default function BlogTripBox({
  destinationName,
  passportCountry,
  blogSlug,
  destinationIso,
}: BlogTripBoxProps) {
  const insuranceRequired = isInsuranceRequired(destinationName)
  const dest = destinationIso ?? destinationName.slice(0, 3).toUpperCase()

  const insuranceUrl = affiliateTrackingUrl('safetywing', {
    placement: 'blog_post',
    destIso: dest,
    blogSlug,
  })
  // DECLINED 2026-07-09 — Airalo rejected the affiliate application; the eSIM
  // row is removed so no traffic flows to an unattributed link. Re-enable
  // (once reapproved): restore the esimUrl + the eSIM entry in `cards` below.
  // const esimUrl = affiliateTrackingUrl('airalo', {
  //   placement: 'blog_post',
  //   destIso: dest,
  //   blogSlug,
  // })
  const flightsUrl = affiliateTrackingUrl('wayaway', {
    placement: 'blog_post',
    destIso: dest,
    blogSlug,
  })

  const cards: BoxCard[] = [
    {
      icon: '🛡️',
      label: insuranceRequired
        ? `Travel Insurance (Required for ${destinationName})`
        : `Travel Insurance — ${destinationName}`,
      description: insuranceRequired
        ? `Mandatory for your ${destinationName} visa. SafetyWing meets all requirements from $1.50/day.`
        : `Not required but highly recommended. Medical bills abroad can reach $50,000+.`,
      cta: insuranceRequired ? 'Get Required Insurance →' : 'Get Quote →',
      href: insuranceUrl,
      highlight: insuranceRequired,
    },
    // {
    //   icon: '📶',
    //   label: `eSIM for ${destinationName}`,
    //   description: `Stay connected from arrival. Activate before you fly — no SIM swap needed.`,
    //   cta: 'Get eSIM →',
    //   href: esimUrl,
    // },
    {
      icon: '✈️',
      label: `Flights: ${passportCountry} → ${destinationName}`,
      description: `Compare 700+ airlines and find cashback-eligible fares with WayAway.`,
      cta: 'Search Flights →',
      href: flightsUrl,
    },
  ]

  return (
    <div className="mt-12 rounded-2xl border border-[#14B8A6]/20 bg-[#F0FDFA] p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-lg">✅</span>
        <h3 className="text-base font-bold text-[#1F2937]">
          Recommended for this trip
        </h3>
      </div>

      <div className="space-y-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`flex items-start justify-between gap-4 rounded-xl border bg-white p-4 ${
              card.highlight
                ? 'border-red-200 bg-red-50/40'
                : 'border-gray-100'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <span className="mt-0.5 shrink-0 text-xl">{card.icon}</span>
              <div className="min-w-0">
                <p className={`text-sm font-semibold leading-snug ${
                  card.highlight ? 'text-red-700' : 'text-[#1F2937]'
                }`}>
                  {card.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
            <a
              href={card.href}
              rel="nofollow sponsored"
              className={`inline-flex min-h-[44px] shrink-0 items-center rounded-lg px-4 py-2 text-xs font-bold text-white transition hover:opacity-90 active:scale-95 sm:min-h-0 sm:px-3 ${
                card.highlight ? 'bg-red-500' : 'bg-[#14B8A6]'
              }`}
            >
              {card.cta}
            </a>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[10px] text-gray-400 text-center">
        Affiliate links — VisitPlane may earn a commission at no extra cost to you.
        We only recommend services with ≥4★ Trustpilot ratings.
      </p>
    </div>
  )
}
