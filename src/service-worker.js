/**
 * VisitPlane Service Worker — Workbox 7 (injectManifest)
 * Source: /src/service-worker.js
 * Compiled to: /public/sw.js  via @serwist/next during `next build`
 *
 * TRADEOFF: injectManifest chosen over generateSW — we need custom push
 * handlers and background sync logic generateSW cannot produce.
 */

import { clientsClaim, skipWaiting }      from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin }        from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { BackgroundSyncPlugin }    from 'workbox-background-sync';

// ── Immediate activation ─────────────────────────────────────────────────────
clientsClaim();
skipWaiting();

// ── A) App Shell — Precache ──────────────────────────────────────────────────
// self.__WB_MANIFEST is replaced by Serwist/Workbox with the asset manifest
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// ── B) Static assets — CacheFirst ────────────────────────────────────────────
registerRoute(
  ({ request, url }) =>
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/screenshots/') ||
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

// ── C) Visa data — StaleWhileRevalidate (24-hour smart cache) ────────────────
// Shows cached data instantly, updates in the background for next visit.
// TRADEOFF: User may see data up to 24h old. Acceptable for visa rules.
registerRoute(
  ({ url }) =>
    url.pathname.startsWith('/api/visa/') ||
    url.pathname.startsWith('/visa/') ||
    url.pathname.startsWith('/visa-checker') ||
    url.pathname.startsWith('/passport-strength') ||
    url.pathname.startsWith('/visa-free-countries') ||
    url.pathname.match(/^\/[a-z-]+-to-[a-z-]+-visa-requirements/),
  new StaleWhileRevalidate({
    cacheName: 'visitplane-visa-data-v1',
    plugins: [
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 24 * 60 * 60, purgeOnQuotaError: true }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// ── D) Navigation — NetworkFirst with offline fallback ───────────────────────
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

// Offline fallback for navigation
self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return;
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cache = await caches.open('visitplane-pages-v1');
      const cached = await cache.match(event.request);
      if (cached) return cached;
      const preCache = await caches.open('workbox-precache-v2');
      return (await preCache.match('/offline.html')) ||
             new Response('<h1>You are offline</h1>', { headers: { 'Content-Type': 'text/html' } });
    })
  );
});

// ── E) External — Google Fonts ───────────────────────────────────────────────
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

// Never cache auth or Supabase auth endpoints
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/auth/') || url.hostname.includes('supabase.co'),
  new NetworkOnly()
);

// ── F) Background Sync — offline POST queue ───────────────────────────────────
const bgSyncPlugin = new BackgroundSyncPlugin('visitplane-offline-queue', {
  maxRetentionTime: 24 * 60,
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request.clone());
        const clients = await self.clients.matchAll({ includeUncontrolled: true });
        clients.forEach(c => c.postMessage({ type: 'BACKGROUND_SYNC_SUCCESS', url: entry.request.url }));
      } catch {
        await queue.unshiftRequest(entry);
        throw new Error('Sync failed — will retry');
      }
    }
  },
});

// Queue offline POSTs to subscribe and save-search
registerRoute(
  ({ url, request }) =>
    request.method === 'POST' &&
    (url.pathname === '/api/subscribe' || url.pathname === '/api/save-search'),
  new NetworkOnly({ plugins: [bgSyncPlugin] }),
  'POST'
);

// ── Message listener (update prompt) ─────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

// ── Push notification handler ─────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data;
  try { data = event.data.json(); }
  catch { data = { title: 'VisitPlane Update', body: event.data.text(), url: '/', country: 'general' }; }

  event.waitUntil(
    self.registration.showNotification(data.title || 'VisitPlane', {
      body:               data.body || 'A visa requirement has changed.',
      icon:               '/icons/icon-192.png',
      badge:              '/icons/icon-72.png',
      image:              data.image || undefined,
      data:               { url: data.url || '/' },
      actions: [
        { action: 'view',    title: '🔍 View Change' },
        { action: 'dismiss', title: '✕ Dismiss'      },
      ],
      tag:                `visa-${data.country || 'update'}`,
      renotify:           true,
      requireInteraction: false,
      vibrate:            [200, 100, 200],
      timestamp:          Date.now(),
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

// ── Cache cleanup on activate ─────────────────────────────────────────────────
const KEEP = [
  'visitplane-static-v1', 'visitplane-visa-data-v1', 'visitplane-pages-v1',
  'visitplane-gfonts-sheets', 'visitplane-gfonts-files', 'workbox-precache-v2',
];
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => !KEEP.includes(k)).map(k => caches.delete(k)))
    )
  );
});
