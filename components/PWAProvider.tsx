'use client';

/**
 * PWAProvider — loads all PWA client-side modules.
 * Imported once in app/layout.tsx inside <body>.
 * Uses dynamic import so it never runs on the server.
 */

import { useEffect } from 'react';

export default function PWAProvider() {
  useEffect(() => {
    // Dynamically import PWA modules so they never run during SSR
    import('@/src/pwa-register').catch(console.error);
    import('@/src/background-sync-fallback').catch(console.error);
    import('@/src/pwa-transitions').catch(console.error);
  }, []);

  return null; // Renders nothing — side-effects only
}
