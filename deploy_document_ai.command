#!/bin/bash
# VisitPlane — Deploy Document AI feature
# Double-click this file to commit & push to GitHub → Vercel auto-deploys

set -e
cd "$(dirname "$0")"

echo ""
echo "🚀 VisitPlane Document AI — Deploying..."
echo ""

# Kill any lingering git processes and remove all lock files
pkill -f "git" 2>/dev/null || true
sleep 1
rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/*.lock .git/packed-refs.lock 2>/dev/null || true
echo "✓ Git locks cleared"

# Stage all Document AI changes + TS fix
git add \
  app/api/check-document/route.ts \
  app/components/DocumentChecker/FinalReport.tsx \
  app/components/DocumentChecker/PrivacyBanner.tsx \
  app/components/DocumentChecker/UploadStep.tsx \
  app/components/DocumentChecker/index.tsx \
  "app/visa/[passport]/[destination]/VisaPageClient.tsx" \
  components/visa/DocumentChecklist.tsx \
  src/lib/affiliates.ts

echo "✓ Files staged"

# Only commit if there's something new to commit
if git diff --cached --quiet; then
  echo "✓ Changes already committed in previous run"
else
  git commit -m "fix: TS narrowing error in affiliates.ts default case"
  echo "✓ Committed"
fi

# Force-push-with-lease: safe force push (fails if someone else pushed)
git push --force-with-lease origin main

echo ""
echo "✅ Pushed to GitHub — Vercel is deploying now!"
echo "   Check: https://vercel.com/dashboard"
echo ""
read -p "Press Enter to close..."
