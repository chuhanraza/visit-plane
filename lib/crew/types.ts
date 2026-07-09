/** Group Sync shared types (UI + server). See docs/group-sync-PRD.md */

export type CrewRole = 'leader' | 'member'

/** All values must stay in sync with the CHECK constraint on crew_member_progress.status */
export type SlotStatus = 'not_started' | 'ready' | 'uploaded' | 'approved' | 'rejected'

export interface CrewRecord {
  id: string
  name: string
  destination_iso: string | null
  destination_name: string
  travel_date: string | null
  created_by: string
  max_members: number
  created_at: string
}

export interface CrewMemberRecord {
  id: string
  crew_id: string
  user_id: string
  role: CrewRole
  display_name: string
  joined_at: string
}

export interface ProgressRecord {
  id: string
  crew_id: string
  user_id: string
  slot_key: string
  slot_label: string
  status: SlotStatus
  updated_at: string
}

export interface CrewSlot {
  key: string
  label: string
}

/** Statuses that count as "done" in completion summaries. */
export const COMPLETE_STATUSES: SlotStatus[] = ['ready', 'uploaded', 'approved']

/** Statuses driven by the member's own real order — never manually togglable. */
export const ORDER_BACKED_STATUSES: SlotStatus[] = ['uploaded', 'approved', 'rejected']

export const STATUS_META: Record<SlotStatus, { label: string; dot: string; chip: string }> = {
  not_started: { label: 'Not yet',   dot: 'bg-gray-300',    chip: 'bg-gray-100 text-gray-500' },
  ready:       { label: 'Ready',     dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700' },
  uploaded:    { label: 'Uploaded',  dot: 'bg-blue-500',    chip: 'bg-blue-50 text-blue-700' },
  approved:    { label: 'Approved',  dot: 'bg-emerald-600', chip: 'bg-emerald-100 text-emerald-800' },
  rejected:    { label: 'Attention', dot: 'bg-red-500',     chip: 'bg-red-50 text-red-700' },
}

/**
 * The consent notice shown on the join page and dashboard footer. Kept in one
 * place so the wording (a YMYL privacy commitment) can't drift between surfaces.
 */
export const CREW_PRIVACY_NOTICE =
  'What your crew can see: your display name and a simple status for each document — like "Passport: ready" — so the group can plan together. ' +
  'What stays private: your documents, files, passport details, email, and everything in your visa application. Crew members can never open or view your documents. ' +
  'You can leave the crew at any time, which removes your status from the group.'
