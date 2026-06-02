'use client'

// ─── Types ────────────────────────────────────────────────────────────────────
interface TravelReadinessGridProps {
  passportName: string
  destinationName: string
  destinationFlag: string
}

interface TravelCard {
  icon: string
  label: string
  tagline: string
  details: string
  price: string
  buttonLabel: string
  href: string
  required: boolean | null
  requiredLabel: string
  requiredColor: string
}

// ─── Route-specific card config ───────────────────────────────────────────────
function resolveCards(destinationName: string, destinationFlag: string): TravelCard[] {
  const dest = destinationName.toLowerCase()

  // Insurance required flag per destination
  const insuranceRequired =
    dest.includes('schengen') || dest.includes('germany') || dest.includes('france') ||
    dest.includes('italy') || dest.includes('spain') || dest.includes('czech') ||
    dest.includes('austria') || dest.includes('netherlands') || dest.includes('switzerland')

  // Flight hub city
  let flightCity = destinationName
  let airportCode = 'DXB'
  if (dest.includes('uae') || dest.includes('united arab')) { flightCity = 'Dubai'; airportCode = 'DXB' }
  else if (dest.includes('turkey') || dest.includes('türkiye')) { flightCity = 'Istanbul'; airportCode = 'IST' }
  else if (dest.includes('saudi')) { flightCity = 'Riyadh'; airportCode = 'RUH' }
  else if (dest.includes('malaysia')) { flightCity = 'Kuala Lumpur'; airportCode = 'KUL' }
  else if (dest.includes('thailand')) { flightCity = 'Bangkok'; airportCode = 'BKK' }
  else if (dest.includes('uk') || dest.includes('united kingdom')) { flightCity = 'London'; airportCode = 'LHR' }
  else if (dest.includes('canada')) { flightCity = 'Toronto'; airportCode = 'YYZ' }

  return [
    {
      icon: '🛡️',
      label: 'Travel Insurance',
      tagline: `Required for ${destinationName}: ${insuranceRequired ? 'YES' : 'NO'}`,
      details: insuranceRequired
        ? 'Mandatory for Schengen visa application. Must cover €30,000+ medical.'
        : 'Not required but highly recommended. Medical bills abroad can be expensive.',
      price: 'From $1.50/day',
      buttonLabel: 'Get Quote',
      href: 'https://www.safetywing.com/?referenceID=visitplane',
      required: insuranceRequired,
      requiredLabel: insuranceRequired ? 'Required' : 'Recommended',
      requiredColor: insuranceRequired ? 'text-red-600' : 'text-amber-600',
    },
    {
      icon: '📶',
      label: `eSIM ${destinationName}`,
      tagline: 'Stay connected on arrival',
      details: `No need to swap SIMs — activate your ${destinationName} eSIM before departure. Works with most modern smartphones.`,
      price: 'From $5',
      buttonLabel: 'Get eSIM',
      href: 'https://www.airalo.com/?aff=visitplane',
      required: false,
      requiredLabel: 'Recommended',
      requiredColor: 'text-blue-600',
    },
    {
      icon: '✈️',
      label: 'Flights',
      tagline: `To ${flightCity} (${airportCode})`,
      details: `Compare hundreds of airlines for the best fares. Book early for best prices on the Pakistan → ${flightCity} route.`,
      price: 'From $280',
      buttonLabel: 'Search Flights',
      href: `https://www.skyscanner.net/flights/pk/${airportCode.toLowerCase()}/?ref=visitplane`,
      required: false,
      requiredLabel: 'Book early',
      requiredColor: 'text-emerald-600',
    },
  ]
}

// ─── Card component ───────────────────────────────────────────────────────────
function TravelCard({ card }: { card: TravelCard }) {
  return (
    <div className="flex flex-col rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#14B8A6]/30">
      {/* Icon + label */}
      <div className="flex items-center gap-3 mb-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0FDFA] text-2xl shadow-sm">
          {card.icon}
        </span>
        <div>
          <div className="font-bold text-[#1F2937] text-sm">{card.label}</div>
          <div className={`text-[11px] font-semibold ${card.requiredColor}`}>{card.requiredLabel}</div>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-xs font-semibold text-[#1F2937] mb-1">{card.tagline}</p>

      {/* Details */}
      <p className="text-xs text-gray-500 leading-relaxed flex-1 mb-4">{card.details}</p>

      {/* Price + CTA */}
      <div className="flex items-center justify-between mt-auto">
        <span className="text-sm font-bold text-[#14B8A6]">{card.price}</span>
        <a
          href={card.href}
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          className="rounded-xl bg-[#14B8A6] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#0d9488] active:scale-95"
        >
          {card.buttonLabel}
        </a>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TravelReadinessGrid({
  passportName: _passportName,
  destinationName,
  destinationFlag,
}: TravelReadinessGridProps) {
  const cards = resolveCards(destinationName, destinationFlag)

  return (
    <section id="travel-readiness" aria-labelledby="travel-readiness-heading" className="scroll-mt-20 print:hidden">
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <h2 id="travel-readiness-heading" className="text-xl font-bold text-[#1F2937]">
            Complete Your Trip
          </h2>
          <span className="text-xs text-gray-400 font-medium">— everything else you need</span>
        </div>
        <p className="text-sm text-gray-500 mb-6">While your visa is processing, get the rest sorted.</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {cards.map((card) => (
            <TravelCard key={card.label} card={card} />
          ))}
        </div>

        <p className="mt-4 text-[11px] text-gray-400 text-center">
          Affiliate links — VisitPlane may earn a small commission at no extra cost to you.
        </p>
      </div>
    </section>
  )
}
