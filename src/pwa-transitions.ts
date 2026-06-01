/**
 * VisitPlane — View Transitions + Splash controller (client-only)
 * Imported dynamically by PWAProvider.
 */

const HAS_VT = 'startViewTransition' in document;
const NAV_KEY = 'vp_nav_idx';

function getIdx() { return parseInt(sessionStorage.getItem(NAV_KEY) ?? '0', 10); }

let currentIdx = getIdx();

window.addEventListener('popstate', (e) => {
  const newIdx = (e.state as any)?.navIdx ?? 0;
  document.documentElement.dataset.nav = newIdx < currentIdx ? 'back' : 'forward';
  currentIdx = newIdx;
});

export async function navigateTo(url: string, direction: 'forward' | 'back' | 'none' = 'forward') {
  if (direction !== 'none') document.documentElement.dataset.nav = direction;
  else delete document.documentElement.dataset.nav;

  if (!HAS_VT) { location.href = url; return; }

  document.startViewTransition(() => { location.href = url; });
}

// ── Splash screen ─────────────────────────────────────────────────────────────
function initSplash() {
  // Add loading class early to prevent FOUC
  document.documentElement.classList.add('vp-loading');

  function hideSplash() {
    document.documentElement.classList.remove('vp-loading');
    document.documentElement.classList.add('vp-ready');
    const el = document.getElementById('vp-splash');
    if (el) {
      el.classList.add('hidden');
      el.addEventListener('transitionend', () => el.remove(), { once: true });
    }
  }

  if (document.readyState === 'complete') {
    setTimeout(hideSplash, 80);
  } else {
    window.addEventListener('load', () => setTimeout(hideSplash, 80));
    setTimeout(hideSplash, 2500); // safety net
  }
}

initSplash();
