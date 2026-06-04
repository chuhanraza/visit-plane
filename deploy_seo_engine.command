#!/bin/bash
# deploy_seo_engine.command
# Double-click this file to commit + push the programmatic SEO engine to GitHub.
# Vercel will auto-deploy on push.

set -e
cd "$(dirname "$0")"

echo ""
echo "══════════════════════════════════════════════════"
echo "  Visitplane — SEO Engine Deploy"
echo "══════════════════════════════════════════════════"
echo ""

# Remove stale lock if exists
rm -f .git/index.lock 2>/dev/null || true

git add \
  "app/[destination]-visa-guide-for-[passport]/page.tsx" \
  "app/visa-requirements-for-[passport]-citizens-to-[destination]/page.tsx" \
  "app/cheapest-visas-from-[nationality]-passport/page.tsx" \
  "app/visa-free-countries-for-[nationality]-passport/page.tsx" \
  "app/admin/seo/page.tsx" \
  "app/admin/seo/generate/page.tsx" \
  "app/api/og/route.tsx" \
  "app/api/seo/generate/route.ts" \
  "app/api/seo/batch/route.ts" \
  "app/sitemap.ts" \
  "lib/seo/contentGenerator.ts" \
  "lib/seo/qualityGates.ts" \
  "lib/seo/internalLinks.ts" \
  "lib/seo/countries.ts" \
  "scripts/generate-pak-uae-sample.ts" \
  "supabase/migrations/20260603_seo_page_content.sql" \
  "supabase/migrations/20260603_seo_generation_jobs.sql" \
  "supabase/migrations/20260603_visa_applications.sql" \
  "package.json" \
  "package-lock.json" \
  2>/dev/null || true

git commit -m "feat: programmatic SEO engine — 4 templates + Gemini pipeline + admin dashboard

Templates (all ISR 7-day):
- T1: /visa-requirements-for-[nationality]-citizens-to-[destination]
- T2: /visa-free-countries-for-[nationality]-passport
- T3: /cheapest-visas-from-[nationality]-passport
- T4: /[destination]-visa-guide-for-[noun-plural]

Content pipeline:
- Gemini 1.5 Flash w/ JSON mode + web search grounding
- 7 quality gates: word count, uniqueness, Flesch, sources, AI phrases, etc.
- Passport authority clusters + destination hub internal linking
- Single source of truth: 197 countries in lib/seo/countries.ts

API + Admin:
- POST /api/seo/generate — single-route generation
- POST /api/seo/batch — phase-based bulk generation (phases 1-4)
- /admin/seo — dashboard: stats, QA, GSC traffic, jobs
- /admin/seo/generate — UI form to trigger individual routes

SEO infrastructure:
- /api/og — per-template OG images (4 colour schemes)
- sitemap.ts — all 4 template URL patterns + deduplication
- JSON-LD schemas per template

Supabase (migrations already applied):
- seo_page_content (RLS: public read published, service_role write)
- seo_generation_jobs (phase tracking)
- seo_dashboard_summary + seo_top_pages views"

echo ""
echo "✅ Committed. Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Pushed! Vercel deployment triggered."
echo ""
echo "Next steps:"
echo "  1. Watch deploy at https://vercel.com/relianmfg-7748s-projects/visit-plane"
echo "  2. Once live, run Pakistan→UAE sample:"
echo "     npx tsx scripts/generate-pak-uae-sample.ts"
echo "  3. Visit /admin/seo to monitor quality gates"
echo ""
read -p "Press Enter to close..."
