import { NextRequest, NextResponse } from 'next/server';
import { BLOCKED_BOT_UA_PATTERN } from '@/lib/security/botBlocklist';

// Next.js 16 renamed the "middleware" convention to "proxy" and quietly
// flipped the *default* runtime for files using this legacy convention to
// Node.js (previously Edge). OpenNext's Cloudflare adapter does not support
// Node.js middleware/proxy bundling yet (`Node.js middleware is not
// currently supported` at build time) — and the new `proxy.ts` convention
// forbids declaring a runtime at all (Next.js hard-codes it to Node.js for
// that file, throwing `Proxy always runs on Node.js runtime` if overridden).
// So this file intentionally stays as `middleware.ts` with an explicit
// `experimental-edge` runtime (the value Next.js requires for this legacy
// convention outside API routes) to keep it on Edge, which is what OpenNext
// can bundle correctly for the Workers runtime. Revisit once OpenNext
// Cloudflare adds Node.js middleware support and/or `proxy.ts` allows an
// edge opt-out.
export const runtime = 'experimental-edge';

export default async function middleware(request: NextRequest) {
  // Hard-block aggressive/non-essential crawlers before they ever reach an
  // ISR/SSR route — robots.txt is advisory only, and these bots (SEO
  // scrapers, AI training/browsing bots) were driving the bulk of our ISR
  // writes and bandwidth. Never blocks Googlebot/Bingbot. Fails open: any
  // error in the check just falls through to normal request handling.
  try {
    const userAgent = request.headers.get('user-agent') ?? '';
    if (userAgent && BLOCKED_BOT_UA_PATTERN.test(userAgent)) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  } catch {
    // fail-open — a bug in bot detection must never block real traffic
  }

  // NOTE: this middleware used to also auto-detect locale from
  // x-vercel-ip-country and set a NEXT_LOCALE cookie on every first-touch
  // request. i18n.ts and app/layout.tsx no longer read that cookie (locale
  // is hardcoded to 'en' — see the comments there), so the cookie was dead
  // weight. Worse: a Set-Cookie header on nearly every response made every
  // page look "personalized" to Cloudflare, which never caches responses
  // with Set-Cookie — forcing 100% of traffic (bots included) through to
  // Vercel's origin instead of being served from Cloudflare's edge cache.
  // Removed so pages can be edge-cached again.
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
