/**
 * VisitPlane — Background Sync Fallback (localStorage queue)
 * For browsers without the Background Sync API (Firefox, older Safari).
 * Chrome/Edge use the Workbox BackgroundSyncPlugin in service-worker.js instead.
 *
 * Import in your app entry:  import '@/src/background-sync-fallback'
 *
 * Usage:
 *   import { queueOfflineRequest } from '@/src/background-sync-fallback';
 *   await queueOfflineRequest('/api/save-search', { method:'POST', body: JSON.stringify(data) }, { label: 'Your search' });
 */

const HAS_BG_SYNC = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'SyncManager' in window;
const QUEUE_KEY   = 'vp_offline_queue';
const MAX_AGE_MS  = 24 * 60 * 60 * 1000;

interface QueueEntry {
  id:         string;
  url:        string;
  method:     string;
  headers:    Record<string, string>;
  body:       string | null;
  queuedAt:   number;
  label:      string;
  retryCount: number;
}

function readQueue(): QueueEntry[] {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]'); }
  catch { return []; }
}
function writeQueue(q: QueueEntry[]) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); }
  catch { /* storage full */ }
}
function pruneExpired(q: QueueEntry[]): QueueEntry[] {
  return q.filter(e => Date.now() - e.queuedAt < MAX_AGE_MS);
}

export async function queueOfflineRequest(
  url: string,
  options: { method?: string; headers?: Record<string, string>; body?: string } = {},
  meta: { label?: string } = {}
): Promise<void> {
  if (HAS_BG_SYNC) {
    // Native BgSync available — let the SW BackgroundSyncPlugin handle it
    try { await fetch(url, options as RequestInit); } catch { /* SW will queue */ }
    return;
  }
  const queue = pruneExpired(readQueue());
  queue.push({
    id:         `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    url,
    method:     options.method  ?? 'POST',
    headers:    options.headers ?? { 'Content-Type': 'application/json' },
    body:       options.body    ?? null,
    queuedAt:   Date.now(),
    label:      meta.label      ?? 'Your action',
    retryCount: 0,
  });
  writeQueue(queue);
  showToast(`📶 Offline — "${meta.label ?? 'Your action'}" will sync when back online.`, '#92400e', '#fef3c7', '#fbbf24');
}

export function getPendingCount(): number {
  return pruneExpired(readQueue()).length;
}

async function replayQueue(): Promise<void> {
  const queue = pruneExpired(readQueue());
  if (!queue.length) return;

  const failed: QueueEntry[] = [];
  const successLabels: string[] = [];

  for (const entry of queue) {
    try {
      const res = await fetch(entry.url, { method: entry.method, headers: entry.headers, body: entry.body });
      if (res.ok) { successLabels.push(entry.label); }
      else {
        entry.retryCount++;
        if (entry.retryCount < 5) failed.push(entry);
      }
    } catch {
      failed.push(entry);
    }
  }

  writeQueue(failed);
  if (successLabels.length) {
    showToast(`✅ Synced: ${[...new Set(successLabels)].join(', ')}`, '#065f46', '#d1fae5', '#10B981');
  }
}

function showToast(msg: string, bg: string, color: string, border: string) {
  if (typeof document === 'undefined') return;
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {
    position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)',
    background:bg, color, border:`1px solid ${border}`, borderRadius:'10px',
    padding:'11px 18px', fontSize:'14px', zIndex:'9999',
    boxShadow:'0 4px 16px rgba(0,0,0,0.3)', maxWidth:'calc(100vw - 32px)', textAlign:'center',
  });
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 5000);
}

// Auto-replay when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => setTimeout(replayQueue, 1500));
  if (navigator.onLine) {
    if (document.readyState === 'complete') replayQueue();
    else window.addEventListener('load', replayQueue);
  }
  // Also handle SW sync messages
  navigator.serviceWorker?.addEventListener('message', (e) => {
    if (e.data?.type === 'BACKGROUND_SYNC_SUCCESS') {
      showToast('✅ Your action synced successfully!', '#065f46', '#d1fae5', '#10B981');
    }
  });
}
