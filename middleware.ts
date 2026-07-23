import { NextRequest, NextResponse } from 'next/server';
import { BLOCKED_BOT_UA_PATTERN } from '@/lib/security/botBlocklist';

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
