#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "=== Sprint 4: Tools Verification + Claim Audit ==="
echo ""

git add app/api/wizard/route.ts \
        app/checklist/page.tsx \
        app/processing-times/page.tsx \
        app/page.tsx

echo "--- Staged files ---"
git diff --cached --name-only
echo ""

git commit -m "fix(tools): verify all 6 tools functional + sweep aspirational claims

- Wizard: add hardcoded decision-tree fallback when ANTHROPIC_API_KEY
  is absent or Claude API returns error; no more silent failures
- Checklist: persist checkbox state to localStorage (survives refresh)
- Processing Times: replace 15-route hardcoded lookup with full Supabase
  query across all passport/destination pairs; add source citation;
  expose all available destinations (not just 10)
- Homepage: replace 'Updated Daily' with 'Embassy-Verified Data' and
  'Sourced from official embassy data, verified per route'
- FAQ: 10 real Q&As already in place (no change needed)
- Contact: Formspree form + email cards already in place (no change needed)
- 24/7 Support: not found anywhere (clean)
- 10,000+ Travelers: not found anywhere (clean)
- Powered by Claude AI: kept only in wizard where Claude is actually used"

echo ""
echo "--- Pushing to origin ---"
git push

echo ""
echo "✅ Sprint 4 deployed. Verify on production:"
echo "   https://visitplane.com/wizard"
echo "   https://visitplane.com/checklist"
echo "   https://visitplane.com/processing-times"
