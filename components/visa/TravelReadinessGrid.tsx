'use client'

import {
  affiliateTrackingUrl,
  isInsuranceRequired,
  getAirportCode,
  type AffiliatePartner,
} from '@/src/lib/affiliates'

// ─── Types ────────────────────────────────────────────────────────────────────
interface TravelReadinessGridProps {
  passportName: string
  destinationName: string
  destinationFlag: string
  /** ISO-3 passport country code — used to build flight routes */
  passportIso?: string
  /** ISO-3 destination country code */
  destinationIso?: string
}

interface TravelCard {
  partner: AffiliatePartner
  icon: string
  label: string
  tagline: string
  details: string
  price: string
  buttonLabel: string
  required: boolean
  requiredLabel: string
  requiredColor: string
}

// ─── Route-specific card config ───────────────────────────────────────────────
function resolveCards(
  destinationName: string,
  passportName: string,
  destinationIso?: string,
): TravelCard[] {
  const insuranceRequired = isInsuranceRequired(destinationName)
  const { city: flightCity, code: airportCode } = getAirportCode(destinationName)

  return [
    {
      partner: 'safetywing' as AffiliatePartner,
      icon: '🛡️',
      label: 'Travel Insurance',
      tagline: insuranceRequired
        ? `⚠️ Required for ${destinationName} visa`
        : `Recommended for ${destinationName}`,
      details: insuranceRequired
        ? 'Mandatory for Schengen visa. Must cover €30,000+ medical emergencies. SafetyWing meets all requirements from $1.50/day.'
        : 'Not required, but medical bills abroad can be $50,000+. SafetyWing covers you from just $1.50/day.',
      price: 'From $1.50/day',
      buttonLabel: insuranceRequired ? 'Get Required Insurance →' : 'Get Quote →',
      required: insuranceRequired,
      requiredLabel: insuranceRequired ? 'Required' : 'Recommended',
      requiredColor: insuranceRequired ? 'text-red-600' : 'text-amber-600',
    },
    {
      partner: 'airalo' as AffiliatePartner,
      icon: '📶',
      label: `eSIM — ${destinationName}`,
      tagline: 'Data from arrival, no SIM swap',
      details: `Activate before you land. Works with any unlocked phone — iPhone 13+ and most modern Android. ${destinationName} data plans from $5.`,
      price: 'From $5',
      buttonLabel: 'Get eSIM →',
      required: false,
      requiredLabel: 'Recommended',
      requiredColor: 'text-blue-600',
    },
    {
      partner: 'wayaway' as AffiliatePartner,
      icon: '✈️',
      label: 'Flights',
      tagline: `${passportName} → ${flightCity} (${airportCode})`,
      details: `Compare 700+ airlines. WayAway shows cashback-eligible fares — you can earn back up to 10% on your booking.`,
      price: 'Compare fares',
      buttonLabel: 'Search Flights →',
      required: false,
      requiredLabel: 'Book early',
      requiredColor: 'text-emerald-600',
    },
  ]
}

// ─── Individual card ──────────────────────────────────────────────────────────
function TravelCard({
  card,
  destinationName,
  destinationIso,
  passportIso,
}: {
  card: TravelCard
  destinationName: string
  destinationIso?: string
  passportIso?: string
}) {
  const trackingUrl = affiliateTrackingUrl(card.partner, {
    placement: 'visa_page',
    destIso: destinationIso ?? destinationName.slice(0, 3).toUpperCase(),
    routePassport: passportIso,
  })

  return (
    <div className="flex flex-col rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#14B8A6]/30">
      {/* Icon + status badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0FDFA] text-2xl shadow-sm">
            {card.icon}
          </span>
          <div>
            <div className="font-bold text-[#1F2937] text-sm leading-tight">{card.label}</div>
            <div className={`text-[11px] font-semibold ${card.requiredColor}`}>
              {card.requiredLabel}
            </div>
          </div>
        </div>
        {card.required && (
          <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 border border-red-200">
            REQUIRED
          </span>
        )}
      </div>

      {/* Tagline */}
      <p className="text-xs font-semibold text-[#1F2937] mb-1">{card.tagline}</p>

      {/* Details */}
      <p className="text-xs text-gray-500 leading-relaxed flex-1 mb-4">{card.details}</p>

      {/* Price + CTA */}
      <div className="flex items-center justify-between mt-auto">
        <span className="text-sm font-bold text-[#14B8A6]">{card.price}</span>
        <a
          href={trackingUrl}
          rel="nofollow sponsored"
          className={`rounded-xl px-4 py-2 text-xs font-bold text-white transition active:scale-95 ${
            card.required
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-[#14B8A6] hover:bg-[#0d9488]'
          }`}
        >
          {card.buttonLabel}
        </a>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TravelReadinessGrid({
  passportName,
  destinationName,
  destinationFlag: _destinationFlag,
  passportIso,
  destinationIso,
}: TravelReadinessGridProps) {
  const cards = resolveCards(destinationName, passportName, destinationIso)

  return (
    <section
      id="travel-readiness"
      aria-labelledby="travel-readiness-heading"
      className="scroll-mt-20 print:hidden"
    >
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <h2 id="travel-readiness-heading" className="text-xl font-bold text-[#1F2937]">
            Complete Your Trip
          </h2>
          <span className="text-xs text-gray-400 font-medium">
            — everything else you need
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          While your visa processes, get these sorted.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {cards.map((card) => (
            <TravelCard
              key={card.partner}
              card={card}
              destinationName={destinationName}
              destinationIso={destinationIso}
              passportIso={passportIso}
            />
          ))}
        </div>

        {/* FTC-required disclosure */}
        <p className="mt-4 text-[11px] text-gray-400 text-center leading-relaxed">
          Affiliate links — VisitPlane may earn a small commission at no extra cost to you.
          We only feature partners with ≥4★ Trustpilot ratings.
        </p>
      </div>
    </section>
  )
}
