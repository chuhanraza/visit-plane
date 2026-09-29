/**
 * RapidGateway (Pakistan) Hosted Redirect Checkout client. PKR only.
 *
 * SANDBOX → LIVE SWITCH: set RAPIDGATEWAY_MODE=live in Vercel. That is the only change
 * needed — it flips the path segment below from /sandbox/ to /rapid/ (and requires the
 * live client id / secret / merchant id / signing salt). Nothing else is hardcoded.
 */
import { randomBytes } from 'crypto'

export const RAPIDGATEWAY_BASE_URL = (process.env.RAPIDGATEWAY_BASE_URL || 'https://secure.rapid-gateway.com').replace(/\/$/, '')

export type RapidGatewayMode = 'sandbox' | 'live'
export const RAPIDGATEWAY_MODE: RapidGatewayMode = process.env.RAPIDGATEWAY_MODE === 'live' ? 'live' : 'sandbox'

/** URL path segment: 'sandbox' for test, 'rapid' for production. Derived from RAPIDGATEWAY_MODE. */
export const RAPIDGATEWAY_PATH_SEGMENT = RAPIDGATEWAY_MODE === 'live' ? 'rapid' : 'sandbox'

export const PREMIUM_REPORT_PRICE_PKR = 2000
export const PREMIUM_REPORT_AMOUNT = PREMIUM_REPORT_PRICE_PKR.toFixed(2)

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://visitplane.com').replace(/\/$/, '')
export function callbackUrls(basketId: string) {
  const q = `?order=${encodeURIComponent(basketId)}`
  return {
    success: `${SITE_URL}/premium-report/success${q}`,
    failure: `${SITE_URL}/premium-report/failed${q}`,
  }
}

/** Credentials: env first; documented shared sandbox creds are used ONLY in sandbox mode. */
export function gatewayCredentials() {
  const sandbox = RAPIDGATEWAY_MODE === 'sandbox'
  const clientId = process.env.RAPIDGATEWAY_CLIENT_ID || (sandbox ? 'client' : '')
  const clientSecret = process.env.RAPIDGATEWAY_CLIENT_SECRET || (sandbox ? 'secret' : '')
  const merchantId = process.env.RAPIDGATEWAY_MERCHANT_ID || (sandbox ? 'SANDBOX_MERCHANT' : '')
  const usingDefaults = !process.env.RAPIDGATEWAY_CLIENT_ID || !process.env.RAPIDGATEWAY_CLIENT_SECRET
  return { clientId, clientSecret, merchantId, usingDefaults }
}

export function logMode(where: string) {
  const c = gatewayCredentials()
  console.log(
    `[rapidgateway:${where}] mode=${RAPIDGATEWAY_MODE} base=${RAPIDGATEWAY_BASE_URL} ` +
      `credentials=${c.usingDefaults ? 'sandbox-shared-defaults' : 'from-env'} ` +
      `merchantId=${process.env.RAPIDGATEWAY_MERCHANT_ID ? 'from-env' : 'placeholder'} ` +
      `webhookSalt=${process.env.RAPIDGATEWAY_WEBHOOK_SIGNING_SALT ? 'set' : 'MISSING'}`,
  )
}

/** VP-<timestamp>-<random6>: URL-safe, <64 chars, unique per attempt (gateway idempotency key). */
export function newBasketId(): string {
  const rand = randomBytes(8).toString('base64url').replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase().padEnd(6, '0')
  return `VP-${Date.now()}-${rand}`
}

/** Accepts 03XXXXXXXXX, +923XXXXXXXXX, 923XXXXXXXXX, 3XXXXXXXXX → 03XXXXXXXXX, else null. */
export function normalizePkMobile(input: string): string | null {
  const d = input.replace(/[\s\-()]/g, '')
  const m = d.match(/^(?:\+?92|0)?(3\d{9})$/)
  return m ? `0${m[1]}` : null
}

let tokenCache: { token: string; expiresAt: number } | null = null

export async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.token
  const { clientId, clientSecret } = gatewayCredentials()
  if (!clientId || !clientSecret) throw new Error('RapidGateway client credentials are not configured')
  const res = await fetch(`${RAPIDGATEWAY_BASE_URL}/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`RapidGateway token request failed: HTTP ${res.status}`)
  const json = (await res.json()) as { access_token?: string; expires_in?: number }
  if (!json.access_token) throw new Error('RapidGateway token response had no access_token')
  tokenCache = { token: json.access_token, expiresAt: Date.now() + Math.max(30, (json.expires_in ?? 299) - 30) * 1000 }
  return json.access_token
}

export interface TransactionInput {
  basketId: string
  email: string
  mobile: string
}

/** Calls process-transaction and resolves the hosted-checkout URL to send the browser to. */
export async function createHostedCheckout(input: TransactionInput): Promise<string> {
  const token = await getAccessToken()
  const { merchantId } = gatewayCredentials()
  const urls = callbackUrls(input.basketId)
  const form = new URLSearchParams({
    MERCHANT_ID: merchantId,
    MERCHANT_NAME: 'VisitPlane',
    TXNAMT: PREMIUM_REPORT_AMOUNT,
    BASKET_ID: input.basketId,
    TXNDESC: 'VisitPlane Premium Visa Report',
    CUSTOMER_MOBILE_NO: input.mobile,
    CUSTOMER_EMAIL_ADDRESS: input.email,
    SUCCESS_URL: urls.success,
    FAILURE_URL: urls.failure,
  })
  if (RAPIDGATEWAY_MODE === 'sandbox') form.set('TEST_SCENARIO', process.env.RAPIDGATEWAY_TEST_SCENARIO || 'SUCCESS')

  const endpoint = `${RAPIDGATEWAY_BASE_URL}/${RAPIDGATEWAY_PATH_SEGMENT}/process-transaction`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
    redirect: 'manual',
    cache: 'no-store',
  })

  // Hosted redirect: normally a 3xx with Location. Tolerate JSON bodies carrying a URL.
  const loc = res.headers.get('location')
  if (res.status >= 300 && res.status < 400 && loc) return new URL(loc, RAPIDGATEWAY_BASE_URL).toString()

  const text = await res.text()
  if (res.ok) {
    try {
      const j = JSON.parse(text) as Record<string, unknown>
      const u = [j.redirectUrl, j.redirect_url, j.checkoutUrl, j.checkout_url, j.paymentUrl, j.url, j.location].find(
        (v): v is string => typeof v === 'string' && /^https?:\/\//.test(v),
      )
      if (u) return u
    } catch { /* not JSON */ }
    // A 200 HTML page IS the hosted checkout page; hand the browser the endpoint's final URL.
    if (res.url && /^https?:\/\//.test(res.url) && !res.url.endsWith('/process-transaction')) return res.url
  }
  throw new Error(`RapidGateway process-transaction unexpected response: HTTP ${res.status} ${text.slice(0, 200).replace(/\s+/g, ' ')}`)
}
