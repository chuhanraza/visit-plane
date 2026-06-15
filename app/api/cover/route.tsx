/**
 * /api/cover
 * ─────────────────────────────────────────────────────────────────────────────
 * Reliable, on-brand cover image — returned as a pure SVG (image/svg+xml) so it
 * can never throw or 404. Used as the guaranteed fallback for blog imagery when
 * a real photo isn't available.
 *
 * Query: slug, v (hero|card|inline|alt), and optional d/e/c overrides.
 */

import { getPostBySlug } from '@/src/lib/posts'

export const runtime = 'nodejs'

const PALETTES: Record<string, { from: string; via: string; to: string; accent: string }> = {
  hero:   { from: '#0f0c29', via: '#302b63', to: '#0d9488', accent: '#2dd4bf' },
  inline: { from: '#0b1f3a', via: '#0d5c63', to: '#10b981', accent: '#5eead4' },
  alt:    { from: '#1a1035', via: '#3b2f7a', to: '#0ea5a0', accent: '#67e8f9' },
  card:   { from: '#0f0c29', via: '#2b2a55', to: '#0d9488', accent: '#2dd4bf' },
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug') ?? ''
  const v = searchParams.get('v') ?? 'hero'
  const pal = PALETTES[v] ?? PALETTES.hero

  const post = slug ? getPostBySlug(slug) : undefined
  const destination = esc(post?.destinationCountry ?? searchParams.get('d') ?? 'Your Destination')
  const category = esc(post?.category ?? searchParams.get('c') ?? 'Visa Guide')
  const passport = post?.passportCountry ?? searchParams.get('p') ?? ''
  const route = passport ? esc(`${passport}  →  ${post?.destinationCountry ?? destination}`) : ''

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${destination} visa guide by VisitPlane">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${pal.from}"/>
      <stop offset="0.5" stop-color="${pal.via}"/>
      <stop offset="1" stop-color="${pal.to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.15" r="0.6">
      <stop offset="0" stop-color="${pal.accent}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${pal.accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.5" fill="#ffffff" fill-opacity="0.06"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#dots)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
    <rect x="72" y="64" rx="22" ry="22" width="${Math.min(560, 130 + category.length * 15)}" height="44" fill="#ffffff" fill-opacity="0.14" stroke="#ffffff" stroke-opacity="0.25"/>
    <text x="96" y="93" font-size="22" font-weight="700" fill="#ffffff">${category}</text>
    <text x="1128" y="94" text-anchor="end" font-size="26" font-weight="800" fill="#ffffff">Visit<tspan fill="${pal.accent}">Plane</tspan></text>
    ${route ? `<text x="72" y="300" font-size="30" font-weight="600" fill="#ffffff" fill-opacity="0.8">${route}</text>` : ''}
    <text x="72" y="382" font-size="86" font-weight="800" fill="#ffffff" letter-spacing="-1.5">${destination}</text>
    <text x="72" y="470" font-size="60" font-weight="800" fill="${pal.accent}" letter-spacing="-1">Visa Guide 2026</text>
    <text x="72" y="566" font-size="22" fill="#ffffff" fill-opacity="0.7"><tspan fill="${pal.accent}" font-weight="800">VisitPlane</tspan> — visa requirements, decoded in seconds · visitplane.com</text>
  </g>
</svg>`

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
    },
  })
}
