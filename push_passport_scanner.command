#!/bin/bash
cd "$(dirname "$0")"
echo "🔓 Clearing any stale git locks..."
rm -f .git/HEAD.lock .git/index.lock
echo "🚀 Pushing passport scanner to main..."
git push origin main
echo ""
echo "✅ Done! Passport Scanner is deploying to Vercel."
echo ""
read -p "Press Enter to close..."
