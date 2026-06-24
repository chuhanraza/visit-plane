/** Shared e-visa order types (UI + server). */

export interface RequiredDoc {
  key: string
  label: string
  required: boolean
}

export interface ServiceRecord {
  id: string
  slug: string
  country_iso: string
  country_name: string
  visa_type: string
  description: string | null
  govt_fee: number
  service_fee: number
  currency: string
  processing_days_min: number
  processing_days_max: number
  required_documents: RequiredDoc[]
  active: boolean
  is_test: boolean
}

export interface TravelerInput {
  full_name: string
  passport_number: string
  dob?: string | null
  nationality?: string | null
  passport_expiry?: string | null
}
