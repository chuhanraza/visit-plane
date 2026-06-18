// @ts-check
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

// ── Serwist (PWA — Workbox 7 injectManifest) ─────────────────────────────────
// Install: npm install @serwist/next
// TRADEOFF: Serwist is the maintained 2024+ fork of next-pwa. It tracks Workbox 7
//           and Next.js 14+. The original next-pwa is unmaintained since 2022.
let withSerwist = (cfg) => cfg; // Passthrough if package not yet installed

try {
  const { default: serwist } = await import('@serwist/next');
  withSerwist = serwist({
    swSrc:           'src/service-worker.js',    // Your Workbox source (Deliverable 2)
    swDest:          'public/sw.js',             // Output — committed to public/
    injectionPoint:  'self.__WB_MANIFEST',       // Matches service-worker.js
    disable:         true, // Turbopack (Next 16 default) breaks Serwist — sw.js served as static file
    globPatterns: [
      '_next/static/**/*.{js,css}',
      '_next/static/media/**/*.{woff,woff2}',
      'icons/**/*.png',
      'offline.html',
      'favicon.ico',
    ],
    fallbacks: { document: '/offline.html' },
  });
} catch {
  // @serwist/next not installed yet — run: npm install @serwist/next
  console.warn('[PWA] @serwist/next not found. Run: npm install @serwist/next');
}

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
