import { NextResponse } from 'next/server'

// Social networks (WhatsApp, Facebook, LinkedIn, X) do not render SVG share images, so the
// default card is now the static PNG at /og-default.png. This route stays only so that older
// cached links to /api/og-default keep working.
export async function GET(request: Request) {
  return NextResponse.redirect(new URL('/og-default.png', request.url), 308)
}
