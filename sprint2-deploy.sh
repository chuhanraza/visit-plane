#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "=== Sprint 2 Deploy ==="
git add \
  app/visa/\[passport\]/\[destination\]/page.tsx \
  components/visa/ApplicationSteps.tsx \
  components/layout/SiteHeader.tsx \
  SPRINT_2_COMPLETE.md

git commit -m "fix(visa): deduplicate related routes, fix cost contradiction, remove duplicate CTA

- Bug 1: fetchRelatedDestinations + fetchOtherPassports now deduplicate by
  country name (destinations table has 2-3 rows per country). Fetches 25
  rows, returns first 5 unique. No more Grenada×3, Canada×3 duplicates.

- Bug 2: ApplicationSteps.resolveSteps now reads the 'pricing' DB column
  (same as VisaHeroCard), and removes the hardcoded '\$90' fallback. Hero
  card and apply step #4 now always show the same fee value.

- Bug 3: Desktop CTA changed from hidden sm:inline-flex to hidden md:inline-flex.
  At 640-767px the hamburger is visible but the desktop CTA is now correctly
  hidden — only one 'Check My Visa' button visible at any viewport width."

git push

echo ""
echo "✅ Sprint 2 deployed. Verify at /visa/Pakistan/UAE"
