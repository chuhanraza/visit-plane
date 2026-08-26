import type { Metadata } from 'next'
import { requirePermission } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import PhotoActions from './PhotoActions'

export const metadata: Metadata = { title: 'Destination Photos — VisitPlane Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

interface CountryRow {
  id: string
  country_code: string
  country_name: string
  region: string | null
  avg_daily_cost_usd: number | null
}

interface PhotoRow {
  id: string
  destination_id: string
  provider: string
  provider_asset_id: string
  image_url: string
  photographer_name: string | null
  photographer_url: string | null
  is_primary: boolean
  is_active: boolean
  created_at: string
}

export default async function DestinationPhotosReview() {
  await requirePermission('content', 'edit')

  const svc = getServiceClient()
  const { data: countries, error: countriesError } = await svc
    .from('destination_photo_countries')
    .select('id, country_code, country_name, region, avg_daily_cost_usd')
    .order('country_name')
  const { data: photos, error: photosError } = await svc
    .from('destination_photos')
    .select('id, destination_id, provider, provider_asset_id, image_url, photographer_name, photographer_url, is_primary, is_active, created_at')
    .order('created_at', { ascending: false })

  const rows = (countries ?? []) as CountryRow[]
  const allPhotos = (photos ?? []) as PhotoRow[]
  const photosByDestination = new Map<string, PhotoRow[]>()
  for (const p of allPhotos) {
    const list = photosByDestination.get(p.destination_id) ?? []
    list.push(p)
    photosByDestination.set(p.destination_id, list)
  }

  const withCandidates = rows.filter((r) => (photosByDestination.get(r.id) ?? []).length > 0)
  const withoutCandidates = rows.filter((r) => (photosByDestination.get(r.id) ?? []).length === 0)
  const liveCount = allPhotos.filter((p) => p.is_active).length

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Destination photos — review queue</h1>
        <p className="mt-1 text-sm text-gray-400">
          Human-in-the-loop gate for the 15-cheapest-countries destination cards. Nothing here goes live on the
          blog until you approve it — <code className="text-gray-300">destination_photos.is_active</code> only
          flips true from this page. Run the ingestion script (
          <code className="text-gray-300">node scripts/destination-photos/ingest.mjs</code>) to populate
          candidates once Unsplash/Pexels API keys are configured.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
        <span>{rows.length} destinations</span>
        <span>·</span>
        <span>{withCandidates.length} with photo candidates</span>
        <span>·</span>
        <span>{liveCount} live</span>
        <span>·</span>
        <span>{withoutCandidates.length} not yet ingested</span>
      </div>

      {(countriesError || photosError) && (
        <div className="text-sm text-red-400">
          Failed to load: {countriesError?.message ?? photosError?.message}
        </div>
      )}

      {withCandidates.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-400">
          No photo candidates yet. This is expected until ingestion has run — see the note above.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withCandidates.map((country) => {
            const candidates = (photosByDestination.get(country.id) ?? []).sort(
              (a, b) => Number(b.is_primary) - Number(a.is_primary)
            )
            return (
              <div key={country.id} className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
                <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://flagcdn.com/w40/${country.country_code.toLowerCase()}.png`}
                      alt=""
                      width={20}
                      height={15}
                      className="rounded-sm"
                    />
                    <span className="font-semibold text-white">{country.country_name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{candidates.length} candidate{candidates.length === 1 ? '' : 's'}</span>
                </div>
                <div className="divide-y divide-gray-800">
                  {candidates.map((photo) => (
                    <div key={photo.id} className="flex gap-3 p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.image_url}
                        alt=""
                        className="h-16 w-24 shrink-0 rounded-lg object-cover"
                        loading="lazy"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <span className="capitalize">{photo.provider}</span>
                          {photo.is_active && (
                            <span className="rounded-full bg-emerald-900/60 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">LIVE</span>
                          )}
                        </div>
                        <p className="truncate text-xs text-gray-500">{photo.photographer_name ?? 'Unknown photographer'}</p>
                        <PhotoActions photoId={photo.id} destinationId={country.id} isActive={photo.is_active} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {withoutCandidates.length > 0 && (
        <details className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-gray-300">
            {withoutCandidates.length} destination{withoutCandidates.length === 1 ? '' : 's'} not yet ingested
          </summary>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {withoutCandidates.map((c) => (
              <span key={c.id} className="rounded-full bg-gray-800 px-2 py-1 text-xs text-gray-400">
                {c.country_name}
              </span>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
