'use client';

/**
 * VisitPlane PWA Install Button
 * Drop this anywhere you want an install CTA.
 * Replaces App Store / Google Play buttons.
 *
 * Usage:
 *   import InstallButton from '@/components/InstallButton';
 *   <InstallButton />
 */

import { useEffect, useState } from 'react';

type State = 'hidden' | 'available' | 'installed';

export default function InstallButton({ className = '' }: { className?: string }) {
  const [state, setState] = useState<State>('hidden');

  useEffect(() => {
    // Check if already running as installed PWA
    import('@/src/pwa-register').then(({ isInstalledPWA }) => {
      if (isInstalledPWA()) setState('installed');
    });

    const onAvail     = () => setState('available');
    const onHide      = () => setState('hidden');
    const onInstalled = () => setState('installed');

    document.addEventListener('pwa:install-available', onAvail);
    document.addEventListener('pwa:install-hide',      onHide);
    document.addEventListener('pwa:installed',         onInstalled);

    return () => {
      document.removeEventListener('pwa:install-available', onAvail);
      document.removeEventListener('pwa:install-hide',      onHide);
      document.removeEventListener('pwa:installed',         onInstalled);
    };
  }, []);

  if (state === 'installed') {
    return (
      <span className={`inline-flex items-center gap-1.5 text-emerald-400 text-sm font-medium ${className}`}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        App Installed
      </span>
    );
  }

  if (state !== 'available') return null;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <button
        onClick={() => import('@/src/pwa-register').then(m => m.showInstallPrompt())}
        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95
                   text-white font-semibold px-6 py-3 rounded-xl transition-all duration-150
                   shadow-lg shadow-emerald-500/25"
      >
        <span className="text-lg">📲</span>
        Install App
      </button>
      <p className="text-xs text-slate-400">Works on all devices · No app store needed</p>
    </div>
  );
}
