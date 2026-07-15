// @ts-check
import createNextIntlPlugin from 'next-intl/plugin';
import { blogRedirects } from './lib/data/blogRedirects.mjs';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

// ── Serwist (PWA — Workbox 7 injectManifest) ─────────────────────────────────
// Install: npm install @serwist/next
// TRADEOFF: Serwist is the maintained 2024+ fork of next-pwa. It tracks Workbox 7
//           and Next.js 14+. The original next-pwa is unmaintained since 2022.
// PWA via Serwist is intentionally OFF (it was already `disable: true`, and the
// SW is served as a static /sw.js file). The webpack builder actually invokes
// and *validates* the Serwist plugin config (Turbopack silently skipped it),
// and the legacy options object below is no longer schema-valid in this Serwist
// version (`globPatterns`/`fallbacks` are not plugin-level keys). Since PWA is
// disabled anyway, keep `withSerwist` as a passthrough so the build is bundler-
// agnostic. Re-enable by wiring a schema-correct serwist() call here later.
const withSerwist = (cfg) => cfg; // passthrough — PWA disabled, no functional change

/** @type {import('next').NextConfig} */
const nextConfig = {
  // `eslint.ignoreDuringBuilds` was REMOVED in Next.js 16 along with `next lint`
  // (see node_modules/next/dist/docs/.../config/03-eslint.md, "next lint removal":
  // "the eslint option in your Next config file is no longer needed and can be
  // safely removed" — it produced an "Unrecognized key(s)" warning and, per
  // node_modules/next/dist/build/index.js, was never read at all). This isn't a
  // regression of the original intent: `next build` on this version doesn't run
  // ESLint as part of the build in the first place (confirmed empirically: a
  // local `next build` shows no lint/eslint step in its output at all), so lint
  // errors/warnings cannot block a production build, with or without this key.
  // Type-checking is unaffected and still runs.

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
    ],
  },

  // ── Programmatic-SEO URL rewrites ────────────────────────────────────────────
  // These pretty URLs use a single flat path segment with literal text around a
  // dynamic value (e.g. /visa-free-countries-for-pakistani-passport). Next.js App
  // Router does NOT reliably serve such "partial dynamic segment" folders — they
  // returned HTTP 500 in production (the route function was never invoked; the
  // edge served /500). The fix: keep the exact public URLs, but route them to
  // clean nested [param] segments under /seo/* (which DO work — same shape as
  // /visa/[passport]/[destination], /blog/[slug], /destinations/[country]).
  // `beforeFiles` ensures these intercept before the legacy folders are matched.
  // ── Sprint 5 content prune: 301 merge-cluster duplicates → survivor ──────────
  // Permanent redirects from de-duplicated doorway clones to their best cluster
  // member. Sourced from lib/data/blogRedirects.mjs (generated). Reversible: drop
  // an entry to restore the page. No content deleted.
  async redirects() {
    // statusCode 301 (not `permanent: true`, which emits 308) to match the SEO
    // recovery spec — classic Moved Permanently that consolidates link equity.
    return [
      // Orphan URL with no page — was serving a crawlable 500. Document Check
      // lives inside the visa flow, so send these visitors to the Wizard.
      { source: '/check-my-documents', destination: '/wizard', statusCode: 301 },
      ...blogRedirects.map(({ source, destination }) => ({
        source,
        destination,
        statusCode: 301,
      })),
    ];
  },

  async rewrites() {
    return {
      beforeFiles: [
        { source: '/visa-free-countries-for-:nationality-passport', destination: '/seo/visa-free/:nationality' },
        { source: '/cheapest-visas-from-:nationality-passport',     destination: '/seo/cheapest/:nationality' },
        { source: '/cheapest-visa-from-:nationality-passport',      destination: '/seo/cheapest/:nationality' },
        { source: '/visa-requirements-for-:passport-citizens-to-:destination', destination: '/seo/req/:passport/:destination' },
        { source: '/visa-requirements-for-:nationality-citizens',   destination: '/seo/req-nat/:nationality' },
        { source: '/:passport-to-:destination-visa-requirements',   destination: '/seo/route/:passport/:destination' },
        { source: '/:destination-visa-guide-for-:passport',         destination: '/seo/guide/:destination/:passport' },
      ],
    };
  },

  async headers() {
    return [
      {
        // Service worker — must NEVER be HTTP-cached
        source: '/sw.js',
        headers: [
          { key: 'Content-Type',  value: 'application/javascript' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
      {
        // Manifest — short cache OK
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type',  value: 'application/manifest+json' },
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
    ];
  },
};

// Chain: Serwist → next-intl → nextConfig
export default withNextIntl(withSerwist(nextConfig));
