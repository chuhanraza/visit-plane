import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f0c29;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#1a1650;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0a1628;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#34d399;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#2dd4bf;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#22d3ee;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="55%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.15" />
      <stop offset="100%" style="stop-color:#0f0c29;stop-opacity:0" />
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)" />
  <rect width="1200" height="630" fill="url(#glow)" />

  <!-- Subtle grid -->
  <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
  </pattern>
  <rect width="1200" height="630" fill="url(#grid)" />

  <!-- Plane emoji large -->
  <text x="600" y="200" text-anchor="middle" font-size="120" font-family="Apple Color Emoji, Segoe UI Emoji, sans-serif">✈️</text>

  <!-- VisitPlane title -->
  <text x="600" y="310" text-anchor="middle" font-size="90" font-weight="800" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fill="white">Visit</text>
  <text x="600" y="310" text-anchor="middle" font-size="90" font-weight="800" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
    <tspan fill="white">Visit</tspan><tspan fill="url(#textGrad)">Plane</tspan>
  </text>

  <!-- Subtext -->
  <text x="600" y="390" text-anchor="middle" font-size="32" font-weight="500" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fill="#2dd4bf" opacity="0.9">Visa Requirements for 197 Countries</text>

  <!-- Tagline -->
  <text x="600" y="450" text-anchor="middle" font-size="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fill="rgba(255,255,255,0.45)">Free · Fast · Always Updated · No Signup Required</text>

  <!-- Bottom badge -->
  <rect x="440" y="500" width="320" height="48" rx="24" fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.3)" stroke-width="1"/>
  <text x="600" y="530" text-anchor="middle" font-size="18" font-weight="700" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fill="#34d399">visitplane.com</text>
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  })
}
