/**
 * /api/og
 * ─────────────────────────────────────────────────────────────────────────────
 * Dynamic Open Graph image generator — one endpoint, 4 template styles.
 *
 * Query params:
 *  title        string  — page title
 *  passport     string  — passport flag + name e.g. "🇵🇰 Pakistan"
 *  destination  string  — destination flag + name e.g. "🇦🇪 UAE"
 *  template     '1'|'2'|'3'|'4'  — controls layout & colour palette
 *  category     string  — pill label override
 *
 * Used in generateMetadata() on every SEO template page:
 *   openGraph.images = [`/api/og?template=1&title=...&passport=...&destination=...`]
 */

import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Per-template colour schemes
const THEMES = {
  '1': { bg: 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 60%,#bfdbfe 100%)', pill: '#2563EB', text: '#1E3A5F' },
  '2': { bg: 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 60%,#bbf7d0 100%)', pill: '#16A34A', text: '#14532D' },
  '3': { bg: 'linear-gradient(135deg,#fefce8 0%,#fef9c3 60%,#fde68a 100%)', pill: '#D97706', text: '#78350F' },
  '4': { bg: 'linear-gradient(135deg,#fdf4ff 0%,#fae8ff 60%,#f5d0fe 100%)', pill: '#9333EA', text: '#4A044E' },
} as const

type TemplateKey = keyof typeof THEMES

const DEFAULT_CATEGORY: Record<TemplateKey, string> = {
  '1': 'Visa Requirements',
  '2': 'Visa-Free Destinations',
  '3': 'Budget Visa Guide',
  '4': 'Visa Guide',
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const templateKey = (searchParams.get('template') ?? '1') as TemplateKey
  const theme       = THEMES[templateKey] ?? THEMES['1']

  const title       = searchParams.get('title')       ?? 'Visa Requirements Guide'
  const passport    = searchParams.get('passport')    ?? ''
  const destination = searchParams.get('destination') ?? ''
  const category    = searchParams.get('category')    ?? DEFAULT_CATEGORY[templateKey]

  return new ImageResponse(
    (
      <div
        style={{
          display:        'flex',
          flexDirection:  'column',
          width:          '100%',
          height:         '100%',
          background:     theme.bg,
          padding:        '56px 64px',
          fontFamily:     'system-ui, -apple-system, sans-serif',
          position:       'relative',
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '400px', height: '400px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.25)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-40px',
          width: '280px', height: '280px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.18)',
        }} />

        {/* Top row: category pill + brand */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' }}>
          <div style={{
            background:   theme.pill,
            borderRadius: '100px',
            padding:      '7px 20px',
            color:        'white',
            fontSize:     '15px',
            fontWeight:   700,
            letterSpacing: '0.3px',
          }}>
            {category}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: theme.text }}>Visit</span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: theme.pill }}>Plane</span>
            <span style={{ color: '#9CA3AF', fontSize: '14px', marginLeft: '4px' }}>· visitplane.com</span>
          </div>
        </div>

        {/* Passport → Destination flags (T1 and T4) */}
        {passport && destination && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <span style={{ fontSize: '52px', lineHeight: 1 }}>{passport.split(' ')[0]}</span>
            <span style={{ fontSize: '28px', color: '#D1D5DB', fontWeight: 300 }}>→</span>
            <span style={{ fontSize: '52px', lineHeight: 1 }}>{destination.split(' ')[0]}</span>
            <span style={{ fontSize: '20px', color: theme.text, opacity: 0.7, marginLeft: '8px' }}>
              {passport.split(' ').slice(1).join(' ')} → {destination.split(' ').slice(1).join(' ')}
            </span>
          </div>
        )}

        {/* Single flag (T2 and T3 — passport only) */}
        {passport && !destination && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <span style={{ fontSize: '64px', lineHeight: 1 }}>{passport.split(' ')[0]}</span>
            <span style={{ fontSize: '22px', color: theme.text, opacity: 0.75 }}>
              {passport.split(' ').slice(1).join(' ')} Passport
            </span>
          </div>
        )}

        {/* Title */}
        <div
          style={{
            fontSize:    title.length > 70 ? '38px' : '46px',
            fontWeight:  800,
            color:       theme.text,
            lineHeight:  1.2,
            maxWidth:    '960px',
            marginBottom: 'auto',
            flex:        1,
            display:     'flex',
            alignItems:  'flex-end',
          }}
        >
          {title}
        </div>

        {/* Bottom strip */}
        <div style={{
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'space-between',
          marginTop:    '32px',
          paddingTop:   '20px',
          borderTop:    `2px solid rgba(0,0,0,0.08)`,
        }}>
          <span style={{ fontSize: '14px', color: '#6B7280' }}>
            Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <span style={{
            fontSize: '14px',
            color:    theme.pill,
            fontWeight: 600,
          }}>
            Template {templateKey} · Programmatic SEO
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
