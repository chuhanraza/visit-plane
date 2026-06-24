/**
 * Payment feature-flag resolution. Live Stripe charging is OFF unless BOTH
 * PAYMENTS_ENABLED=true AND a STRIPE_SECRET_KEY is present. Otherwise the system
 * runs in "manual" mode: invoices are created unpaid and an admin marks them paid.
 */
export type PaymentMode = 'stripe' | 'manual'

export function paymentsEnabled(): boolean {
  return process.env.PAYMENTS_ENABLED === 'true' && !!process.env.STRIPE_SECRET_KEY
}

export function paymentMode(): PaymentMode {
  return paymentsEnabled() ? 'stripe' : 'manual'
}

export function publishableKey(): string | null {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null
}
