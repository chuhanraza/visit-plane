import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'Visa Guides & Travel Tips'
  const category = searchParams.get('category') ?? 'Visa Guides'
  const emoji = searchParams.get('emoji') ?? '✈️'

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #d1fae5 100%)',
          padding: '60px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div
            style={{
              background: '#10B981',
              borderRadius: '12px',
              padding: '8px 16px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {category}
          </div>
          <span style={{ color: '#6B7280', fontSize: '14px' }}>visitplane.com</span>
        </div>

        {/* Emoji */}
        <div style={{ fontSize: '80px', marginBottom: '32px', lineHeight: 1 }}>{emoji}</div>

        {/* Title */}
        <div
          style={{
            fontSize: '48px',
            fontWeight: 700,
            color: '#111827',
            lineHeight: 1.2,
            maxWidth: '900px',
            marginBottom: 'auto',
          }}
        >
          {title}
        </div>

        {/* Bottom brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '40px' }}>
          <span style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>Visit</span>
          <span style={{ fontSize: '24px', fontWeight: 700, color: '#10B981' }}>Plane</span>
          <span style={{ color: '#9CA3AF', marginLeft: '8px', fontSize: '16px' }}>
            · Visa Requirements for 197 Countries
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
