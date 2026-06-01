/**
 * VisitPlane Service Worker — Workbox 7 (CDN, no bundler)
 * Replaces the Serwist-compiled version since Next.js 16 + Turbopack
 * breaks @serwist/next. Functionally equivalent; precache list is empty
 * (runtime caching covers all dynamic routes).
 */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');

const { clientsClaim, skipWaiting } = workbox.core;
const { precacheAndRoute, cleanupOutdatedCaches } = workbox.precaching;
const { registerRoute, NavigationRoute } = workbox.routing;
const { CacheFirst, NetworkFirst, StaleWhileRevalidate, NetworkOnly } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;
const { CacheableResponsePlugin } = workbox.cacheableResponse;
const { BackgroundSyncPlugin } = workbox.backgroundSync;

clientsClaim();
skipWaiting();

// No build-time precache manifest — use empty array
precacheAndRoute([]);
cleanupOutdatedCaches();

// ── Static assets ─────────────────────────────────────────────────────────────
registerRoute(
  ({ request, url }) =>
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/splash/') ||
    request.destination === 'font',
  new CacheFirst({
    cacheName: 'visitplane-static-v1',
    plugins: [
      new ExpirationPlugin({ maxEntries: 120, maxAgeSeconds: 30 * 24 * 60 * 60, purgeOnQuotaError: true }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// ── Visa data ─────────────────────────────────────────────────────────────────
registerRoute(
  ({ url }) =>
    url.pathname.startsWith('/api/visa/') ||
    url.pathname.startsWith('/visa/') ||
    url.pathname.startsWith('/visa-checker') ||
    url.pathname.startsWith('/passport-strength') ||
    url.pathname.startsWith('/visa-free-countries'),
  new StaleWhileRevalidate({
    cacheName: 'visitplane-visa-data-v1',
    plugins: [
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 24 * 60 * 60, purgeOnQuotaError: true }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// ── Navigation / pages ────────────────────────────────────────────────────────
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'visitplane-pages-v1',
      networkTimeoutSeconds: 3,
      plugins: [
        new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 7 * 24 * 60 * 60 }),
        new CacheableResponsePlugin({ statuses: [200] }),
      ],
    }),
    { denylist: [/^\/_next\//, /\/api\//] }
  )
);

// Offline fallback
self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return;
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cache = await caches.open('visitplane-pages-v1');
      const cached = await cache.match(event.request);
      if (cached) return cached;
      return new Response('<h1>You are offline</h1>', { headers: { 'Content-Type': 'text/html' } });
    })
  );
});

// ── Google Fonts ──────────────────────────────────────────────────────────────
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({ cacheName: 'visitplane-gfonts-sheets', plugins: [new ExpirationPlugin({ maxEntries: 4 })] })
);
registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'visitplane-gfonts-files',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 }),
    ],
  })
);

// Never cache auth
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/auth/') || url.hostname.includes('supabase.co'),
  new NetworkOnly()
);

// ── Background Sync ───────────────────────────────────────────────────────────
const bgSyncPlugin = new BackgroundSyncPlugin('visitplane-offline-queue', { maxRetentionTime: 24 * 60 });
registerRoute(
  ({ url, request }) =>
    request.method === 'POST' &&
    (url.pathname === '/api/subscribe' || url.pathname === '/api/save-search'),
  new NetworkOnly({ plugins: [bgSyncPlugin] }),
  'POST'
);

// ── Message listener ──────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

// ── Push notifications ────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data;
  try { data = event.data.json(); }
  catch { data = { title: 'VisitPlane Update', body: event.data.text(), url: '/' }; }

  event.waitUntil(
    self.registration.showNotification(data.title || 'VisitPlane', {
      body:    data.body || 'A visa requirement has changed.',
      icon:    '/icons/icon-192.png',
      badge:   '/icons/icon-72.png',
      data:    { url: data.url || '/' },
      actions: [{ action: 'view', title: '🔍 View Change' }, { action: 'dismiss', title: '✕ Dismiss' }],
      tag:     `visa-${data.country || 'update'}`,
      renotify: true,
      vibrate: [200, 100, 200],
    })
  );
});

// ── Notification click ────────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (new URL(client.url).origin === self.location.origin) {
          return client.focus().then(c => c.navigate(targetUrl));
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});

// ── Cache cleanup ─────────────────────────────────────────────────────────────
const KEEP = ['visitplane-static-v1', 'visitplane-visa-data-v1', 'visitplane-pages-v1', 'visitplane-gfonts-sheets', 'visitplane-gfonts-files'];
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => !KEEP.includes(k)).map(k => caches.delete(k)))
    )
  );
});
