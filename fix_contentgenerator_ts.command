#!/bin/bash
cd "$(dirname "$0")"
# Remove stale git locks
rm -f .git/HEAD.lock .git/index.lock 2>/dev/null || true
echo "Committing contentGenerator.ts fix..."
git add lib/seo/contentGenerator.ts
git commit -m "fix: remove duplicate template key in batchGenerate object spread"
git push origin main
echo "✅ Done — Vercel will redeploy automatically."
read -p "Press Enter to close..."
