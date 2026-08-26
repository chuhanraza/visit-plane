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

  return (
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
  )
}
