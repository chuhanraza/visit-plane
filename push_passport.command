#!/bin/bash
cd "$(dirname "$0")"
echo "🔓 Clearing any stale git locks..."
rm -f .git/HEAD.lock .git/index.lock
echo "📁 Staging files..."
git add -A
echo "💾 Committing..."
git commit -m "feat: Complete passport strength checker with scores, stats, share"
echo "🚀 Pushing to main..."
git push origin main
echo ""
echo "✅ Done! Fix is deploying to Vercel."
echo ""
read -p "Press Enter to close..."
