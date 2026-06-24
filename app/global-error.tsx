'use client'

// Last-resort boundary: replaces the ENTIRE document (including the root layout)
// when an error is thrown in the root layout itself. Must therefore render its
// own <html>/<body> and cannot rely on SiteHeader/SiteFooter.
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          background: '#FAFAFA',
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
          color: '#1F2937',
          textAlign: 'center',
          padding: '24px',
        }}
      >
        <div style={{ fontSize: '48px' }}>⚠️</div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>Something went wrong</h1>
        <p style={{ maxWidth: '28rem', color: '#6B7280', margin: 0 }}>
          VisitPlane hit an unexpected error. Please try again — if it keeps
          happening, come back in a few minutes.
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            onClick={reset}
            style={{
              background: '#14B8A6',
              color: '#fff',
              border: 'none',
              borderRadius: '9999px',
              padding: '12px 28px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ↻ Try again
          </button>
          <a
            href="/"
            style={{
              background: '#fff',
              color: '#1F2937',
              border: '1px solid #E5E7EB',
              borderRadius: '9999px',
              padding: '12px 28px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            ← Back to home
          </a>
        </div>
      </body>
    </html>
  )
}
