/**
 * scripts/import-visa-data.mjs
 * Bulk-imports sample visa data into the Supabase `destinations` table.
 *
 * Run with plain Node — no extra installs needed:
 *   node scripts/import-visa-data.mjs
 *
 * Reads credentials from .env.local automatically.
 * Required vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

// ─── Inline .env.local loader ─────────────────────────────────────────────────
const __dirname = fileURLToPath(new URL('.', import.meta.url))
const root      = resolve(__dirname, '..')

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return
  for (const line of readFileSync(filePath, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key   = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (!(key in process.env)) process.env[key] = value
  }
}

loadEnvFile(resolve(root, '.env.local'))
loadEnvFile(resolve(root, '.env'))

// ─── Supabase client ──────────────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  console.error('    Add them to .env.local and try again.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ─── Passport countries ───────────────────────────────────────────────────────
const PASSPORTS = [
  'United States',
  'United Kingdom',
  'Pakistan',
  'India',
  'Germany',
  'Australia',
  'Canada',
  'France',
]

// ─── Destinations + visa options ──────────────────────────────────────────────
const DESTINATIONS = {
  Japan: [
    { visa_type: 'Tourist e-Visa',   processing_time: '4-5 Days',  pricing: '$30'  },
    { visa_type: 'Business Visa',    processing_time: '7-10 Days', pricing: '$75'  },
    { visa_type: 'Sticker Visa',     processing_time: '2-3 Weeks', pricing: '$45'  },
  ],
  Thailand: [
    { visa_type: 'Tourist e-Visa',   processing_time: '1-2 Days',  pricing: '$30'  },
    { visa_type: 'Tourist Visa',     processing_time: '4-5 Days',  pricing: '$45'  },
    { visa_type: 'Business Visa',    processing_time: '7-10 Days', pricing: '$75'  },
  ],
  Turkey: [
    { visa_type: 'Tourist e-Visa',   processing_time: '1-2 Days',  pricing: '$30'  },
    { visa_type: 'Business Visa',    processing_time: '4-5 Days',  pricing: '$75'  },
    { visa_type: 'Student Visa',     processing_time: '2-3 Weeks', pricing: '$100' },
  ],
  UAE: [
    { visa_type: 'Tourist e-Visa',   processing_time: '1-2 Days',  pricing: '$45'  },
    { visa_type: 'Business Visa',    processing_time: '4-5 Days',  pricing: '$100' },
    { visa_type: 'Transit Visa',     processing_time: '1-2 Days',  pricing: '$30'  },
  ],
  Singapore: [
    { visa_type: 'Tourist Visa',     processing_time: '4-5 Days',  pricing: '$30'  },
    { visa_type: 'Business Visa',    processing_time: '7-10 Days', pricing: '$75'  },
    { visa_type: 'Student Visa',     processing_time: '2-3 Weeks', pricing: '$100' },
  ],
  Malaysia: [
    { visa_type: 'Tourist e-Visa',   processing_time: '1-2 Days',  pricing: '$30'  },
    { visa_type: 'Business Visa',    processing_time: '4-5 Days',  pricing: '$75'  },
    { visa_type: 'Sticker Visa',     processing_time: '7-10 Days', pricing: '$45'  },
  ],
  India: [
    { visa_type: 'Tourist e-Visa',   processing_time: '1-2 Days',  pricing: '$30'  },
    { visa_type: 'Business e-Visa',  processing_time: '1-2 Days',  pricing: '$75'  },
    { visa_type: 'Student Visa',     processing_time: '2-3 Weeks', pricing: '$100' },
  ],
  Indonesia: [
    { visa_type: 'Visa on Arrival',  processing_time: '1-2 Days',  pricing: '$30'  },
    { visa_type: 'Tourist e-Visa',   processing_time: '4-5 Days',  pricing: '$45'  },
    { visa_type: 'Business Visa',    processing_time: '7-10 Days', pricing: '$75'  },
  ],
  Vietnam: [
    { visa_type: 'Tourist e-Visa',   processing_time: '1-2 Days',  pricing: '$25'  },
    { visa_type: 'Business Visa',    processing_time: '4-5 Days',  pricing: '$75'  },
    { visa_type: 'Sticker Visa',     processing_time: '7-10 Days', pricing: '$45'  },
  ],
  Philippines: [
    { visa_type: 'Tourist Visa',     processing_time: '4-5 Days',  pricing: '$30'  },
    { visa_type: 'Business Visa',    processing_time: '7-10 Days', pricing: '$75'  },
    { visa_type: 'Student Visa',     processing_time: '2-3 Weeks', pricing: '$100' },
  ],
  Mexico: [
    { visa_type: 'Tourist Visa',     processing_time: '4-5 Days',  pricing: '$36'  },
    { visa_type: 'Business Visa',    processing_time: '7-10 Days', pricing: '$75'  },
    { visa_type: 'Sticker Visa',     processing_time: '2-3 Weeks', pricing: '$45'  },
  ],
  Canada: [
    { visa_type: 'Tourist Visa',     processing_time: '2-3 Weeks', pricing: '$100' },
    { visa_type: 'Business Visa',    processing_time: '2-3 Weeks', pricing: '$100' },
    { visa_type: 'Student Visa',     processing_time: '2-3 Weeks', pricing: '$150' },
  ],
}

// ─── Build records ────────────────────────────────────────────────────────────
function buildRecords() {
  const records = []
  const STRONG  = new Set(['United States', 'United Kingdom', 'Germany', 'Australia', 'Canada', 'France'])

  for (const passport of PASSPORTS) {
    for (const [destination, options] of Object.entries(DESTINATIONS)) {
      if (passport === destination) continue   // skip self-travel

      // Strong passports get the 2 faster options; others get all 3
      const slice = STRONG.has(passport) ? options.slice(0, 2) : options

      for (const opt of slice) {
        records.push({
          passport_country: passport,
          country_name:     destination,
          visa_type:        opt.visa_type,
          processing_time:  opt.processing_time,
          pricing:          opt.pricing,
        })
      }
    }
  }

  return records
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀  Starting visa data import…\n')

  // 1. Clear existing rows
  console.log('🗑️   Clearing existing destinations…')
  const { error: deleteError } = await supabase
    .from('destinations')
    .delete()
    .neq('id', 0)

  if (deleteError) {
    console.error('❌  Failed to clear table:', deleteError.message)
    process.exit(1)
  }
  console.log('    Table cleared.\n')

  // 2. Build records
  const records = buildRecords()
  console.log(
    `📋  Built ${records.length} records` +
    ` (${PASSPORTS.length} passports × ${Object.keys(DESTINATIONS).length} destinations,` +
    ` minus self-travel, 2–3 visa types each).\n`
  )

  // 3. Insert in batches of 50
  const BATCH_SIZE = 50
  let inserted = 0

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)

    const { error: insertError } = await supabase
      .from('destinations')
      .insert(batch)

    if (insertError) {
      console.error(`\n❌  Insert failed at batch ${i}–${i + batch.length}:`, insertError.message)
      process.exit(1)
    }

    inserted += batch.length
    process.stdout.write(`    Inserted ${inserted} / ${records.length} records…\r`)
  }

  console.log('\n')

  // 4. Verify final count
  const { count, error: countError } = await supabase
    .from('destinations')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.warn('⚠️   Could not verify row count:', countError.message)
  } else {
    console.log(`🔍  Verified: ${count} rows now in the destinations table.`)
  }

  console.log(`\n✅  Imported ${inserted} records successfully.\n`)
}

main().catch((err) => {
  console.error('❌  Unexpected error:', err)
  process.exit(1)
})
