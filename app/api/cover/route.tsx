/**
 * /api/cover
 * ─────────────────────────────────────────────────────────────────────────────
 * Reliable, on-brand blog cover image generator (same-origin — never breaks).
 * Replaces fragile external photo hotlinks for blog hero/card/inline images.
 *
 * Query params:
 *   slug   string  — blog post slug (used to look up destination, emoji, title)
 *   v      string  — variant: 'hero' | 'card' | 'inline' | 'alt' (changes palette)
 * Falls back to explicit params when slug is absent:
 *   d (destination), e (emoji), c (category), t (title)
 */

import { ImageResponse } from 'next/og'
import { getPostBySlug } from '@/src/lib/posts'

export const runtime = 'edge'

// Variant palettes — distinct gradients so hero / inline / alt look different.
const PALETTES: Record<string, { from: string; via: string; to: string; accent: string }> = {
  hero:   { from: '#0f0c29', via: '#302b63', to: '#0d9488', accent: '#2dd4bf' },
  inline: { from: '#0b1f3a', via: '#0d5c63', to: '#10b981', accent: '#5eead4' },
  alt:    { from: '#1a1035', via: '#3b2f7a', to: '#0ea5a0', accent: '#67e8f9' },
  card:   { from: '#0f0c29', via: '#2b2a55', to: '#0d9488', accent: '#2dd4bf' },
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug') ?? ''
  const v = searchParams.get('v') ?? 'hero'
  const pal = PALETTES[v] ?? PALETTES.hero

  const post = slug ? getPostBySlug(slug) : undefined
  const destination = post?.destinationCountry ?? searchParams.get('d') ?? 'Your Destination'
  const emoji = post?.coverEmoji ?? searchParams.get('e') ?? '✈️'
  const category = post?.category ?? searchParams.get('c') ?? 'Visa Guide'
  const passport = post?.passportCountry ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          position: 'relative',
          background: `linear-gradient(135deg, ${pal.from} 0%, ${pal.via} 48%, ${pal.to} 100%)`,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '64px 72px',
          color: 'white',
          overflow: 'hidden',
        }}
      >
        {/* Glow blobs */}
        <div style={{ position: 'absolute', top: '-120px', right: '-100px', width: '460px', height: '460px', borderRadius: '50%', background: `radial-gradient(circle, ${pal.accent}55, transparent 70%)` }} />
        <div style={{ position: 'absolute', bottom: '-140px', left: '-80px', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.10), transparent 70%)' }} />

        {/* Top row: category pill + brand */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '100px', padding: '8px 22px', fontSize: '20px', fontWeight: 700, letterSpacing: '0.5px' }}>
            {category}
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '26px', fontWeight: 800 }}>Visit</span>
            <span style={{ fontSize: '26px', fontWeight: 800, color: pal.accent }}>Plane</span>
          </div>
        </div>

        {/* Center: big emoji + destination */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
          <div style={{ fontSize: '150px', lineHeight: 1, marginBottom: '8px' }}>{emoji}</div>
          {passport ? (
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '30px', fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: '6px' }}>
              {passport}&nbsp;&nbsp;→&nbsp;&nbsp;{destination}
            </div>
          ) : null}
          <div style={{ fontSize: '76px', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.05 }}>
            {destination} Visa
          </div>
        </div>

        {/* Bottom: brand line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '22px', color: 'rgba(255,255,255,0.7)' }}>
          <span style={{ color: pal.accent, fontWeight: 800 }}>VisitPlane</span>
          <span>— visa requirements, decoded in seconds · visitplane.com</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
