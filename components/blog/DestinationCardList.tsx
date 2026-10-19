/**
 * DestinationCardList — server component. Given a "15 cheapest countries"
 * post slug, pulls its structured destination items + any approved cached
 * photo/daily-cost for each, and renders a DestinationCard grid.
 *
 * Reads via lib/supabase/public.ts (no cookies()/headers()) — this renders
 * inside a statically-generated blog post page, and cookies()/headers() would
 * force it into dynamic rendering (see the ISR incident that convention
 * exists to avoid). Degrades gracefully: destination_photos is empty until
 * ingestion + admin review run, so every card should render correctly with
 * photo: null.
 */
import { getPublicClient } from '@/lib/supabase/public'
import { DESTINATION_LIST_ITEMS } from '@/src/lib/destinationListItems'
import DestinationCard, { type DestinationPhoto } from './DestinationCard'

export default async function DestinationCardList({ slug }: { slug: string }) {
  const items = DESTINATION_LIST_ITEMS[slug]
  if (!items || items.length === 0) return null

  const countryNames = items.map((i) => i.countryName)

  let countryRows: { id: string; country_name: string; avg_daily_cost_usd: number | null }[] = []
  let photoRows: { destination_id: string; image_url: string; blurhash: string | null; photographer_name: string | null; photographer_url: string | null }[] = []

  try {
    const supabase = getPublicClient()
    const { data: countries } = await supabase
      .from('destination_photo_countries')
      .select('id, country_name, avg_daily_cost_usd')
      .in('country_name', countryNames)
    countryRows = countries ?? []

    const destinationIds = countryRows.map((c) => c.id)
    if (destinationIds.length > 0) {
      const { data: photos } = await supabase
        .from('destination_photos')
        .select('destination_id, image_url, blurhash, photographer_name, photographer_url')
        .in('destination_id', destinationIds)
        .eq('is_active', true)
        .eq('is_primary', true)
      photoRows = photos ?? []
    }
  } catch {
    // Photo/cost data is an enhancement, not a requirement — render cards
    // with no photo/cost rather than breaking the page if Supabase is down.
  }

  const countryByName = new Map(countryRows.map((c) => [c.country_name, c]))
  const photoByDestinationId = new Map(photoRows.map((p) => [p.destination_id, p]))

  // Quick-scan summary. Everything here is already on the cards below (entry note,
  // getting there, the estimated daily budget): no new facts, just in a form that is
  // easy to read, quote and lift into an answer. Daily budgets come from the database and
  // are shown only where a figure exists.
  const costOf = (name: string) => countryByName.get(name)?.avg_daily_cost_usd ?? null
  const priced = items
    .map((i) => ({ name: i.countryName, cost: costOf(i.countryName) }))
    .filter((x): x is { name: string; cost: number } => x.cost != null)
    .sort((x, y) => x.cost - y.cost)
  const lowestCost = priced.length >= 3 ? priced[0].cost : null
  const lowestNames = lowestCost != null ? priced.filter((x) => x.cost === lowestCost).map((x) => x.name) : []

  return (
    <>
    <section className="not-prose my-8" aria-label="The countries on this list at a glance">
      {lowestCost != null && (
        <p className="mb-3 text-sm leading-relaxed" style={{ color: 'var(--vp-ink)' }}>
          <strong>Lowest estimated daily budget on this list:</strong>{' '}
          {lowestNames.join(', ')} (about ${lowestCost} a day for a budget traveller, before flights and visa fees).
        </p>
      )}
      <div className="overflow-x-auto rounded-xl bg-white" style={{ border: '1px solid var(--vp-hairline)' }}>
        <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
          <caption className="sr-only">The {items.length} countries on this list: entry rule, estimated daily budget and how to get there</caption>
          <thead>
            <tr style={{ background: 'var(--vp-paper)', color: 'var(--vp-muted)' }}>
              <th scope="col" className="px-3 py-2 text-xs font-semibold">#</th>
              <th scope="col" className="px-3 py-2 text-xs font-semibold">Country</th>
              <th scope="col" className="px-3 py-2 text-xs font-semibold">Entry</th>
              <th scope="col" className="px-3 py-2 text-xs font-semibold">Est. budget / day</th>
              <th scope="col" className="px-3 py-2 text-xs font-semibold">Getting there</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const cost = costOf(item.countryName)
              return (
                <tr key={item.countryName} style={{ borderTop: '1px solid var(--vp-hairline)' }}>
                  <td className="px-3 py-2 tabular-nums" style={{ color: 'var(--vp-muted)' }}>{i + 1}</td>
                  <th scope="row" className="px-3 py-2 font-semibold" style={{ color: 'var(--vp-ink)' }}>{item.countryName}</th>
                  <td className="px-3 py-2">{item.entryNote}</td>
                  <td className="px-3 py-2 tabular-nums">{cost != null ? `~$${cost}` : '—'}</td>
                  <td className="px-3 py-2">{item.gettingThere}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs" style={{ color: 'var(--vp-muted)' }}>
        Daily budgets are rough VisitPlane estimates for a budget traveller (stay, food, local transport) and exclude flights and visa fees.
        Entry rules change: confirm yours on the Visa Wizard before booking.
      </p>
    </section>
    <div className="not-prose my-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => {
        const country = countryByName.get(item.countryName)
        const photoRow = country ? photoByDestinationId.get(country.id) : undefined
        const photo: DestinationPhoto | null = photoRow
          ? {
              imageUrl: photoRow.image_url,
              blurhash: photoRow.blurhash,
              photographerName: photoRow.photographer_name,
              photographerUrl: photoRow.photographer_url,
            }
          : null

        return (
          <DestinationCard
            key={item.countryName}
            rank={i + 1}
            item={item}
            photo={photo}
            avgDailyCostUsd={country?.avg_daily_cost_usd ?? null}
            priority={i === 0}
          />
        )
      })}
    </div>
    </>
  )
}
