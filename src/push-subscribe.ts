/**
 * VisitPlane — Frontend Push Subscription
 * ⚠️ WARNING: VAPID_PUBLIC_KEY must come from NEXT_PUBLIC_VAPID_PUBLIC_KEY env var — never hardcoded.
 */

// ⚠️ WARNING: This is the PUBLIC key only — safe to ship to browser
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(b64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export function getPushPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export async function subscribeToPush({
  country = null,
  userId  = null,
}: { country?: string | null; userId?: string | null } = {}): Promise<'subscribed' | 'denied' | 'error' | 'unsupported'> {

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported';
  if (!VAPID_PUBLIC_KEY) { console.error('[Push] NEXT_PUBLIC_VAPID_PUBLIC_KEY not set'); return 'error'; }

  try {
    let permission = Notification.permission;
    if (permission === 'default') permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      document.dispatchEvent(new CustomEvent('push:permission-denied'));
      return 'denied';
    }

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    const res = await fetch('/api/push/subscribe', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        subscription:  sub.toJSON(),
        country,
        userId,
        subscribedAt: new Date().toISOString(),
      }),
    });

    if (!res.ok) throw new Error(`Server ${res.status}`);
    document.dispatchEvent(new CustomEvent('push:subscribed', { detail: { country } }));
    return 'subscribed';
  } catch (err) {
    console.error('[Push] Subscribe failed:', err);
    return 'error';
  }
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  await fetch('/api/push/subscribe', {
    method:  'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ endpoint: sub.endpoint }),
  });
  await sub.unsubscribe();
  document.dispatchEvent(new CustomEvent('push:unsubscribed'));
}
