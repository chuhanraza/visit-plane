/**
 * DestinationCard — one destination in the "15 cheapest countries" listicle
 * template. Flag + visa-status badge + daily-cost figure + cached photo (or
 * a graceful flag-only placeholder when no photo has been ingested/approved
 * yet) + the existing 2-3 sentence copy for that destination.
 */
import { blurhashToDataUrl } from '@/lib/blurhash'
import type { DestinationListItem } from '@/src/lib/destinationListItems'

export interface DestinationPhoto {
  imageUrl: string
  blurhash: string | null
  photographerName: string | null
  photographerUrl: string | null
}

interface DestinationCardProps {
  rank: number
  item: DestinationListItem
  photo: DestinationPhoto | null
  avgDailyCostUsd: number | null
  /** True only for the first card rendered on the page — eager-loads, no lazy/blurhash. */
  priority: boolean
}

const VALUE_FEEL_STYLE: Record<DestinationListItem['valueFeel'], { bg: string; text: string }> = {
  Outstanding: { bg: '#047857', text: '#ffffff' },
  Excellent: { bg: '#0d9488', text: '#ffffff' },
  'Very good': { bg: '#1E3A5F', text: '#ffffff' },
  Good: { bg: '#7C8983', text: '#ffffff' },
}

export default function DestinationCard({ rank, item, photo, avgDailyCostUsd, priority }: DestinationCardProps) {
  const feel = VALUE_FEEL_STYLE[item.valueFeel]
  const blurDataUrl = !priority && photo?.blurhash ? blurhashToDataUrl(photo.blurhash) : null
  const flagCode = item.countryCode.toLowerCase()

  return (
    <div className="overflow-hidden rounded-2xl bg-white" style={{ border: '1px solid var(--vp-hairline)' }}>
      <div
        className="relative aspect-video w-full overflow-hidden bg-gray-100"
        style={blurDataUrl ? { backgroundImage: `url(${blurDataUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.imageUrl}
            alt={`${item.countryName} — travel destination`}
            width={800}
            height={450}
            className="h-full w-full object-cover"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2" style={{ color: 'var(--vp-muted)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://flagcdn.com/w80/${flagCode}.png`}
              srcSet={`https://flagcdn.com/w80/${flagCode}.png 1x, https://flagcdn.com/w160/${flagCode}.png 2x`}
              alt=""
              width={64}
              height={48}
              className="rounded shadow-sm"
              loading="lazy"
              decoding="async"
            />
            <span className="text-xs font-medium">Photo coming soon</span>
          </div>
        )}
        <span
          className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow"
          style={{ background: 'var(--vp-stamp)' }}
        >
          {rank}
        </span>
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://flagcdn.com/w40/${flagCode}.png`}
            alt=""
            width={20}
            height={15}
            className="rounded-sm shadow-sm"
            loading="lazy"
            decoding="async"
          />
          <h3 className="text-base font-bold leading-tight" style={{ color: 'var(--vp-ink)' }}>
            {item.countryName}
          </h3>
        </div>
        <p className="mb-3 text-sm font-medium" style={{ color: 'var(--vp-muted)' }}>{item.subtitle}</p>

        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: feel.bg, color: feel.text }}>
            {item.entryNote}
          </span>
          {avgDailyCostUsd != null && (
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-bold"
              style={{ background: 'var(--vp-paper)', color: 'var(--vp-ink)', border: '1px solid var(--vp-hairline)' }}
            >
              ~${avgDailyCostUsd}/day
            </span>
          )}
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-medium"
            style={{ background: 'var(--vp-paper)', color: 'var(--vp-muted)', border: '1px solid var(--vp-hairline)' }}
          >
            {item.gettingThere}
          </span>
        </div>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--vp-ink)' }}>{item.body}</p>

        {photo?.photographerName && (
          <p className="mt-3 text-[10px]" style={{ color: 'var(--vp-muted)' }}>
            Photo by{' '}
            {photo.photographerUrl ? (
              <a href={photo.photographerUrl} rel="nofollow noopener" target="_blank" className="underline">
                {photo.photographerName}
              </a>
            ) : (
              photo.photographerName
            )}
          </p>
        )}
      </div>
    </div>
  )
}
