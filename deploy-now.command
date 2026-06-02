#!/bin/bash
# VisitPlane deployment script — removes git locks and pushes to GitHub
set -e

cd "$(dirname "$0")"

echo "=== VisitPlane Deploy ==="
echo "Working dir: $(pwd)"
echo ""

# Remove git lock files if present
rm -f .git/HEAD.lock .git/index.lock 2>/dev/null && echo "Lock files cleared" || echo "No lock files"

# Stage all new and modified files
git add \
  "app/[passport]-to-[destination]-visa-requirements/page.tsx" \
  "app/admin/data-quality/page.tsx" \
  "app/api/visa/report-correction/route.ts" \
  "app/api/visa/review-correction/route.ts" \
  "app/api/visa/run-pipeline/route.ts" \
  "app/destinations/DestinationsClient.tsx" \
  "app/destinations/page.tsx" \
  "components/PassportSwitcher.tsx" \
  "components/visa/VisaRequirementsBlock.tsx" \
  "data/verified/PAK-ARE-tourist.json" \
  "scripts/verify-visa-route.mjs" \
  "supabase/migrations/20260602_visa_requirements.sql" \
  "vercel.json"

echo ""
echo "Staged files:"
git status --short

echo ""
echo "Committing..."
git commit -m "feat: route-specific visa data infrastructure — verified 20 PAK routes, new schema, pipeline, UI, admin dashboard"

echo ""
echo "Pushing to origin main..."
git push origin main

echo ""
echo "=== DONE! Vercel will auto-deploy in ~1 minute. ==="
echo "Check: https://vercel.com/chuhanraza/visit-plane"
read -p "Press Enter to close..."
