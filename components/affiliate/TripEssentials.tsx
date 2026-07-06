/**
 * TripEssentials — a compact, honest, disclosed affiliate offer block for pages
 * where purchase intent is real (cheapest-countries, route, itinerary pages).
 *
 * Server-safe (pure JSX, no hooks). Max 3 cards. Every link uses the tracked
 * /go route with an explicit placement + source so clicks are attributable, and
 * carries rel="nofollow sponsored" + an FTC disclosure. Do NOT exceed 3 cards
 * or stack multiple instances on one page — keep it tasteful.
 */
import { affiliateTrackingUrl, type AffiliatePlacement, type AffiliatePartner } from '@/src/lib/affiliates'

type Essential = 'insurance' | 'esim' | 'flights' | 'ivisa'

interface Props {
  placement: AffiliatePlacement
  /** clean path identifier for attribution, e.g. /seo/cheapest/pakistan */
  source?: string
  destIso?: string
  passportIso?: string
  heading?: string
  subheading?: string
  show?: Essential[]
}

const CARDS: Record<Essential, { partner: AffiliatePartner; icon: string; label: string; desc: string; price: string; cta: string }> = {
  insurance: {
    partner: 'safetywing', icon: '🛡️', label: 'Travel insurance',
    desc: 'Required for Schengen and recommended everywhere — a medical bill abroad can run into the thousands.',
    price: 'From $1.50/day', cta: 'Get a quote →',
  },
  esim: {
    partner: 'airalo', icon: '📶', label: 'eSIM data',
    desc: 'Data the moment you land — no roaming bills, no hunting for a local SIM. Works in 200+ countries.',
    price: 'From $5', cta: 'Get an eSIM →',
  },
  flights: {
    partner: 'wayaway', icon: '✈️', label: 'Flights',
    desc: 'Compare 700+ airlines and see cashback-eligible fares before you book.',
    price: 'Compare fares', cta: 'Search flights →',
  },
  // Not shown anywhere yet — iVisa affiliate application is still in review.
  // Once approved (NEXT_PUBLIC_IVISA_TRACKING_URL set), enable it on a page by
  // adding 'ivisa' to that page's `show` array — no other change needed.
  ivisa: {
    partner: 'ivisa', icon: '📄', label: 'Visa application help',
    desc: 'Expert review of your application and documents, with 24/7 support.',
    price: 'Service fee applies', cta: 'Get help applying →',
  },
}

export default function TripEssentials({
  placement, source, destIso, passportIso,
  heading = 'Plan the rest of your trip',
  subheading = 'Once your visa is sorted, these are the essentials travelers book next.',
  show = ['insurance', 'esim', 'flights'],
}: Props) {
  return (
    <section aria-labelledby="trip-essentials-heading" className="mb-12">
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 id="trip-essentials-heading" className="text-xl font-bold text-[#1F2937] mb-1">{heading}</h2>
        <p className="text-sm text-gray-500 mb-5">{subheading}</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {show.map(key => {
            const c = CARDS[key]
            const href = affiliateTrackingUrl(c.partner, { placement, destIso, routePassport: passportIso, source })
            return (
              <div key={key} className="flex flex-col rounded-2xl border border-gray-200 bg-gray-50/60 p-5">
                <div className="text-2xl mb-2">{c.icon}</div>
                <h3 className="font-bold text-[#1F2937] text-sm mb-1">{c.label}</h3>
                <p className="text-xs text-gray-500 leading-relaxed flex-1 mb-4">{c.desc}</p>
                <div className="flex items-center justify-between gap-2 mt-auto">
                  <span className="text-sm font-bold text-teal-600">{c.price}</span>
                  <a href={href} rel="nofollow sponsored"
                    className="shrink-0 whitespace-nowrap rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-teal-700 active:scale-95">
                    {c.cta}
                  </a>
                </div>
              </div>
            )
          })}
        </div>
        <p className="mt-4 text-[11px] text-gray-400 text-center leading-relaxed">
          Affiliate links — VisitPlane may earn a small commission at no extra cost to you.
          We only feature partners with ≥4★ Trustpilot ratings.
        </p>
      </div>
    </section>
  )
}
