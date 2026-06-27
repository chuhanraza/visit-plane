'use client'

import { useState } from 'react'
import { getCountryImage } from '@/lib/data/countryImages'

/**
 * Destination card image with a guaranteed branded fallback.
 *
 * Resolves the photo from the centralized verified map. If no photo is mapped,
 * or the mapped photo fails to load, it renders a clean teal-gradient placeholder
 * with the country flag + name — never a broken glyph and never an unrelated image.
 */
export default function DestinationImage({
  name,
  flag,
  className = '',
}: {
  name: string
  flag: string
  className?: string
}) {
  const src = getCountryImage(name)
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-teal-500 via-emerald-500 to-emerald-600 text-white ${className}`}
        aria-label={name}
        role="img"
      >
        <span className="text-3xl drop-shadow-sm" aria-hidden="true">{flag}</span>
        <span className="px-2 text-center text-xs font-bold tracking-wide drop-shadow-sm">{name}</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={`${name} — travel destination`}
      onError={() => setFailed(true)}
      loading="lazy"
      decoding="async"
      // Intrinsic size of the Unsplash request (w=600). The card sets the rendered
      // box via h-full/w-full + object-cover; giving the browser the aspect ratio
      // up front avoids layout shift (CLS) while the photo loads.
      width={600}
      height={400}
      className={`h-full w-full object-cover ${className}`}
    />
  )
}
