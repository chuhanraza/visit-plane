/**
 * Single source of truth for the order lifecycle — mirrors the DB transition trigger
 * (supabase/migrations/20260625_evisa_orders_schema.sql evisa_enforce_order_transition).
 * Keep these two in sync.
 */

export const ORDER_STATUSES = [
  'draft', 'submitted', 'awaiting_documents', 'in_review', 'processing',
  'approved', 'rejected', 'completed', 'refunded', 'cancelled',
] as const

export type OrderStatus = typeof ORDER_STATUSES[number]

/** Allowed forward transitions per status. Terminal states map to []. */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft:              ['submitted', 'cancelled'],
  submitted:          ['awaiting_documents', 'in_review', 'cancelled'],
  awaiting_documents: ['in_review', 'cancelled'],
  in_review:          ['processing', 'awaiting_documents', 'rejected', 'cancelled'],
  processing:         ['approved', 'rejected', 'awaiting_documents', 'cancelled'],
  approved:           ['completed', 'refunded'],
  rejected:           ['in_review', 'refunded', 'cancelled'],
  completed:          ['refunded'],
  refunded:           [],
  cancelled:          [],
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true
  return (ALLOWED_TRANSITIONS[from] ?? []).includes(to)
}

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  awaiting_documents: 'Awaiting documents',
  in_review: 'In review',
  processing: 'Processing',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
}

/** Tailwind badge classes per status (customer + admin UIs). */
export const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  awaiting_documents: 'bg-amber-100 text-amber-800',
  in_review: 'bg-indigo-100 text-indigo-700',
  processing: 'bg-purple-100 text-purple-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-emerald-100 text-emerald-700',
  refunded: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-gray-200 text-gray-600',
}

export const INVOICE_STATUS_BADGE: Record<string, string> = {
  unpaid: 'bg-amber-100 text-amber-800',
  paid: 'bg-green-100 text-green-700',
  refunded: 'bg-orange-100 text-orange-700',
  void: 'bg-gray-200 text-gray-600',
}
