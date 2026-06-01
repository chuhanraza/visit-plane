/**
 * VisitPlane — Service Worker Registration + Install Prompt
 * Import in app/layout.tsx client component or a 'use client' entry point.
 *
 * Events dispatched on document:
 *   'pwa:install-available' — show the install button
 *   'pwa:install-hide'      — hide the install button
 *   'pwa:installed'         — show "Installed ✓" badge
 */

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let swReg: ServiceWorkerRegistration | null = null;

// Extend Window with non-standard events
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// ── Analytics helper ─────────────────────────────────────────────────────────
function track(name: string, params: Record<string, string> = {}) {
  if (typeof window === 'undefined') return;
  if (typeof (window as any).gtag === 'function') (window as any).gtag('event', name, params);
  if (typeof (window as any).plausible === 'function') (window as any).plausible(name, { props: params });
}

// ── Detect standalone mode ───────────────────────────────────────────────────
export function isInstalledPWA(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  if ((navigator as any).standalone === true) return true; // iOS Safari
  return false;
}

export function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

// ── Update toast ─────────────────────────────────────────────────────────────
function showUpdateToast() {
  if (document.getElementById('vp-update-toast')) return;
  injectStyles();
  const toast = document.createElement('div');
  toast.id = 'vp-update-toast';
  toast.innerHTML = `<span>⬆️ New version available</span>
    <button id="vp-refresh">Refresh</button>
    <button id="vp-dismiss-update" aria-label="Dismiss">✕</button>`;
  Object.assign(toast.style, {
    position:'fixed', bottom:'80px', left:'50%', transform:'translateX(-50%)',
    background:'#0d1a2e', color:'#fff', border:'1px solid #1a2540',
    borderRadius:'12px', padding:'12px 16px', display:'flex', alignItems:'center',
    gap:'12px', boxShadow:'0 8px 32px rgba(0,0,0,0.5)', zIndex:'9999',
    fontSize:'14px', maxWidth:'calc(100vw - 32px)', animation:'vp-slide-up 0.3s ease',
  });
  document.body.appendChild(toast);
  document.getElementById('vp-refresh')!.onclick = () => {
    swReg?.waiting?.postMessage({ type: 'SKIP_WAITING' });
    toast.remove();
    setTimeout(() => location.reload(), 300);
  };
  document.getElementById('vp-dismiss-update')!.onclick = () => toast.remove();
  setTimeout(() => toast.isConnected && toast.remove(), 30000);
}

// ── Register SW ──────────────────────────────────────────────────────────────
async function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  try {
    swReg = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });

    if (swReg.waiting) showUpdateToast();

    swReg.addEventListener('updatefound', () => {
      const newWorker = swReg!.installing;
      if (!newWorker) return;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateToast();
        }
      });
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) { refreshing = true; location.reload(); }
    });

    // Periodic update check every 60 min
    setInterval(() => swReg?.update(), 60 * 60 * 1000);

    // Listen for bg-sync success messages from SW
    navigator.serviceWorker.addEventListener('message', (e) => {
      if (e.data?.type === 'BACKGROUND_SYNC_SUCCESS') showSyncToast();
    });
  } catch (err) {
    console.error('[PWA] SW registration failed:', err);
  }
}

// ── Install prompt ───────────────────────────────────────────────────────────
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e as BeforeInstallPromptEvent;
  document.dispatchEvent(new CustomEvent('pwa:install-available'));
  track('pwa_prompt_captured');
});

export async function showInstallPrompt(): Promise<'accepted' | 'dismissed' | 'unavailable' | 'ios'> {
  if (isIOS()) { showIOSInstructions(); return 'ios'; }
  if (!deferredPrompt) return 'unavailable';

  await deferredPrompt.prompt();
  track('pwa_prompt_shown');
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  track(`pwa_prompt_${outcome}`);
  if (outcome === 'accepted') { document.dispatchEvent(new CustomEvent('pwa:install-hide')); }
  return outcome;
}

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  document.dispatchEvent(new CustomEvent('pwa:install-hide'));
  document.dispatchEvent(new CustomEvent('pwa:installed'));
  track('pwa_app_installed');
});

// ── iOS instructions tooltip ─────────────────────────────────────────────────
function showIOSInstructions() {
  document.getElementById('vp-ios-tip')?.remove();
  injectStyles();
  const tip = document.createElement('div');
  tip.id = 'vp-ios-tip';
  tip.innerHTML = `<button id="vp-ios-close" style="position:absolute;top:12px;right:12px;background:none;border:none;color:#64748b;cursor:pointer;font-size:18px;">✕</button>
    <p style="font-weight:600;margin-bottom:10px;">Install on iPhone / iPad</p>
    <ol style="padding-left:18px;line-height:1.8;font-size:14px;">
      <li>Tap the <strong>Share</strong> button ⬆️ in Safari</li>
      <li>Tap <strong>"Add to Home Screen"</strong></li>
      <li>Tap <strong>"Add"</strong></li>
    </ol>
    <p style="font-size:12px;color:#64748b;margin-top:8px;">Safari only — Chrome on iOS cannot install PWAs.</p>`;
  Object.assign(tip.style, {
    position:'fixed', bottom:'80px', left:'16px', right:'16px',
    background:'#0d1a2e', color:'#fff', border:'1px solid #1a2540',
    borderRadius:'16px', padding:'20px', boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
    zIndex:'9999', animation:'vp-slide-up 0.3s ease',
  });
  document.body.appendChild(tip);
  document.getElementById('vp-ios-close')!.onclick = () => tip.remove();
  setTimeout(() => tip.isConnected && tip.remove(), 20000);
}

// ── Sync success toast ────────────────────────────────────────────────────────
function showSyncToast() {
  const t = document.createElement('div');
  t.textContent = '✅ Your saved search synced successfully!';
  Object.assign(t.style, {
    position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)',
    background:'#065f46', color:'#d1fae5', border:'1px solid #10B981',
    borderRadius:'10px', padding:'11px 20px', fontSize:'14px', zIndex:'9999',
    animation:'vp-slide-up 0.3s ease', maxWidth:'calc(100vw - 32px)',
  });
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

// ── Shared keyframe injection ─────────────────────────────────────────────────
function injectStyles() {
  if (document.getElementById('vp-pwa-styles')) return;
  const s = document.createElement('style');
  s.id = 'vp-pwa-styles';
  s.textContent = `
    @keyframes vp-slide-up {
      from { transform: translateX(-50%) translateY(20px); opacity: 0; }
      to   { transform: translateX(-50%) translateY(0);   opacity: 1; }
    }
    #vp-refresh {
      background:#10B981; color:#fff; border:none; border-radius:8px;
      padding:6px 14px; font-size:13px; font-weight:600; cursor:pointer;
    }
    #vp-refresh:hover { background:#059669; }
    #vp-dismiss-update { background:none; border:none; color:#64748b; cursor:pointer; font-size:16px; padding:4px; }
  `;
  document.head.appendChild(s);
}

// ── Init ──────────────────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  if (isInstalledPWA()) {
    document.dispatchEvent(new CustomEvent('pwa:install-hide'));
    document.dispatchEvent(new CustomEvent('pwa:installed'));
    track('pwa_launched_standalone');
  }
  if (document.readyState === 'loading') {
    window.addEventListener('load', registerSW);
  } else {
    registerSW();
  }
}
