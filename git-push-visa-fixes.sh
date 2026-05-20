#!/bin/bash
# Run this once to commit and push the visa page fixes
# Usage: bash git-push-visa-fixes.sh

set -e
cd "$(dirname "$0")"

# Remove any stale git lock files
rm -f .git/HEAD.lock .git/index.lock

git add "app/visa/[passport]/[destination]/VisaPageClient.tsx"

git commit -m "fix: Country visa pages - smart badges, fee transparency, correct processing times, visa-type specific document lists

- FIX 1: Replace REQ badge with smart color-coded badges (VISA FREE/ON ARRIVAL/E-VISA/STUDENT/WORK/BUSINESS/VISA REQUIRED)
- FIX 2: Smart fee display - FREE for visa-free, dollar amount for known fees, check official source link for unknown
- FIX 3: Processing time logic - Instant for visa-free/on-arrival, emoji-prefixed hours/days/weeks otherwise
- FIX 4: Improved header with Tourist Visa Requirements title, Updated today / Official Embassy Data / disclaimer badges
- FIX 5: Quick stats bar below header showing Processing / Fee / Validity at a glance
- FIX 6: Visa-type-specific document checklists (minimal for visa-free, medium for on-arrival, full for tourist/eVisa, work, student)
- FIX 7: Official embassy links card at bottom with embassy website + embassy near me search buttons
- FIX 8: Smarter tabs with improved empty-state messages and embassy search links when no data available"

git push origin main

echo ""
echo "✅ Done! All visa page fixes pushed to main."
echo "   Vercel will deploy automatically in ~1-2 minutes."
