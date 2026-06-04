/**
 * scripts/generate-pak-uae-sample.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates Gemini content for Pakistan → UAE across all 4 templates.
 * Run with:  npx tsx scripts/generate-pak-uae-sample.ts
 *
 * Requires env vars:
 *   GEMINI_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

// Load .env.local (Next.js convention) without requiring the dotenv package
import { readFileSync } from 'fs'
import { resolve } from 'path'
try {
  const envPath = resolve(process.cwd(), '.env.local')
  readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const [key, ...rest] = line.split('=')
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
  })
} catch { /* .env.local not found — assume env vars already set */ }
import { generatePageContent, saveGeneratedContent } from '../lib/seo/contentGenerator'
import type { ContentGenerationRequest } from '../lib/seo/contentGenerator'

const ROUTES: Array<ContentGenerationRequest & { slug: string }> = [
  {
    template: 'template1',
    passportIso: 'PAK',
    destinationIso: 'ARE',
    forceRegenerate: true,
    slug: 'visa-requirements-for-pakistani-citizens-to-uae',
  },
  {
    template: 'template2',
    passportIso: 'PAK',
    forceRegenerate: true,
    slug: 'visa-free-countries-for-pakistani-passport',
  },
  {
    template: 'template3',
    passportIso: 'PAK',
    forceRegenerate: true,
    slug: 'cheapest-visas-from-pakistan-passport',
  },
  {
    template: 'template4',
    passportIso: 'PAK',
    destinationIso: 'ARE',
    forceRegenerate: true,
    slug: 'uae-visa-guide-for-pakistanis',
  },
]

async function main() {
  console.log('🚀 Pakistan → UAE sample content across all 4 templates\n')

  for (const { slug, ...route } of ROUTES) {
    console.log(`\n── ${route.template} ──────────────────────────────────────────`)
    console.log(`   /${slug}`)

    try {
      const result = await generatePageContent(route)

      if (!result.success || !result.content || !result.qualityResult) {
        console.log(`   ❌ Generation failed: ${result.error}`)
        continue
      }

      const { content, qualityResult } = result

      console.log(`   ✅ ${content.word_count} words generated`)
      console.log(`   ${qualityResult.passed ? '✓ QA PASSED' : '⚠ QA FAILED'}`)

      if (!qualityResult.passed) {
        qualityResult.failures.forEach(f => console.log(`      · ${f}`))
      } else {
        console.log(`   Flesch: ${qualityResult.fleschScore}  |  Uniqueness: ${qualityResult.uniquenessScore}%  |  Sources: ${qualityResult.sourcesCount}`)
      }

      const saved = await saveGeneratedContent(route, content, qualityResult)
      if (saved.success) {
        console.log(`   💾 Saved → seo_page_content`)
      } else {
        console.log(`   ⚠  Save error: ${saved.error}`)
      }

      // Rate limit — Groq free tier: 12,000 TPM, wait 20s between calls
      console.log(`   ⏳ Waiting 20s (rate limit)...`)
      await new Promise(r => setTimeout(r, 20000))

    } catch (err) {
      console.error(`   ❌ ERROR:`, err instanceof Error ? err.message : err)
    }
  }

  console.log('\n\n✨ Done. Pages live at:')
  ROUTES.forEach(r => console.log(`   → https://www.visitplane.com/${r.slug}`))
  console.log('\n   Check /admin/seo for quality results.')
}

main().catch(console.error)
