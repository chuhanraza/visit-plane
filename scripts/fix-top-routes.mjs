import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wmoywcqadkjxujgwduup.supabase.co'
const SUPABASE_KEY = 'sb_publishable_J51KjtqCA0vMu8uPDfIIWA_bJesCMTu'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const routes = [
  // USA Routes
  { passport: 'United States', destination: 'Canada',        visa_type: 'Visa Free',              processing_time: 'Instant', pricing: 'Free' },
  { passport: 'United States', destination: 'Mexico',        visa_type: 'Visa Free',              processing_time: 'Instant', pricing: 'Free' },
  { passport: 'United States', destination: 'United Kingdom',visa_type: 'Visa Free (6 months)',   processing_time: 'Instant', pricing: 'Free' },
  // UK Routes
  { passport: 'United Kingdom', destination: 'United States', visa_type: 'Visa Free',             processing_time: 'Instant', pricing: 'Free' },
  { passport: 'United Kingdom', destination: 'Canada',        visa_type: 'Visa Free',             processing_time: 'Instant', pricing: 'Free' },
  // Australia Routes
  { passport: 'Australia', destination: 'New Zealand',  visa_type: 'Visa Free',         processing_time: 'Instant', pricing: 'Free' },
  { passport: 'Australia', destination: 'Singapore',    visa_type: 'Visa Free',         processing_time: 'Instant', pricing: 'Free' },
  { passport: 'Australia', destination: 'Thailand',     visa_type: 'Visa on Arrival',   processing_time: 'Instant', pricing: 'Free' },
  // India Routes
  { passport: 'India', destination: 'United Arab Emirates', visa_type: 'Visa on Arrival', processing_time: 'Instant', pricing: 'Free' },
  { passport: 'India', destination: 'Thailand',             visa_type: 'Visa Free',        processing_time: 'Instant', pricing: 'Free' },
  // Pakistan Routes
  { passport: 'Pakistan', destination: 'United Arab Emirates', visa_type: 'Visa on Arrival', processing_time: 'Instant', pricing: 'Free' },
  { passport: 'Pakistan', destination: 'Saudi Arabia',         visa_type: 'Visa on Arrival', processing_time: 'Instant', pricing: 'Free' },
  { passport: 'Pakistan', destination: 'Turkey',               visa_type: 'Visa Free',        processing_time: 'Instant', pricing: 'Free' },
  // Canada Routes
  { passport: 'Canada', destination: 'United States', visa_type: 'Visa Free', processing_time: 'Instant', pricing: 'Free' },
  { passport: 'Canada', destination: 'Mexico',        visa_type: 'Visa Free', processing_time: 'Instant', pricing: 'Free' },
  // Germany Routes
  { passport: 'Germany', destination: 'France', visa_type: 'Visa Free (Schengen)', processing_time: 'Instant', pricing: 'Free' },
  { passport: 'Germany', destination: 'Spain',  visa_type: 'Visa Free (Schengen)', processing_time: 'Instant', pricing: 'Free' },
]

let totalUpdated = 0

for (const route of routes) {
  const label = `${route.passport} → ${route.destination}`

  // Fetch matching records first
  const { data: existing, error: fetchError } = await supabase
    .from('destinations')
    .select('id')
    .ilike('passport_country', route.passport)
    .ilike('country_name', route.destination)

  if (fetchError) {
    console.error(`❌ Fetch error for ${label}:`, fetchError.message)
    continue
  }

  if (!existing || existing.length === 0) {
    console.log(`⚠️  No records found for ${label}`)
    continue
  }

  const ids = existing.map(r => r.id)

  const { error: updateError, count } = await supabase
    .from('destinations')
    .update({
      visa_type: route.visa_type,
      processing_time: route.processing_time,
      pricing: route.pricing,
      documents: ['Valid Passport'],
    })
    .in('id', ids)

  if (updateError) {
    console.error(`❌ Update error for ${label}:`, updateError.message)
    continue
  }

  console.log(`✅ Updated ${label} (${ids.length} record${ids.length !== 1 ? 's' : ''})`)
  totalUpdated += ids.length
}

console.log(`\n✅ Fixed ${routes.length} routes! Total ${totalUpdated} records updated`)
