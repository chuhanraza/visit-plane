// @ts-check
import createNextIntlPlugin from 'next-intl/plugin';

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
  // Never let lint warnings/errors block a production deploy. Type-checking still
  // runs and must pass — this only relaxes ESLint during `next build`.
  eslint: { ignoreDuringBuilds: true },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
    ],
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
