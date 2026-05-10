import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// Read real credentials from .env.local
const envContent = readFileSync('.env.local', 'utf-8')
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#') && line.trim())
    .map(line => {
      const [key, ...values] = line.split('=')
      return [key.trim(), values.join('=').trim()]
    })
)

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔌 Connecting to Supabase...')
console.log(`   URL: ${supabaseUrl}`)
console.log('')

if (!supabaseUrl || supabaseUrl.includes('your_project') || supabaseUrl.includes('xxxxxxxx')) {
  console.error('❌ Placeholder URL detected in .env.local — please add your real credentials.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const { data, error } = await supabase
  .from('destinations')
  .select('*')

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
if (error) {
  console.error('❌ Connection Error!')
  console.error('   Message:', error.message)
  console.error('   Code   :', error.code)
  console.error('   Hint   :', error.hint)
} else {
  console.log('✅ Supabase connected successfully!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  if (data.length === 0) {
    console.log('📭 destinations table is empty — connection works!')
  } else {
    console.log(`📊 Found ${data.length} row(s) in destinations table:`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(JSON.stringify(data, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  }
}
