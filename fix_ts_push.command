#!/bin/bash
cd "$(dirname "$0")"
echo "=== Fixing TypeScript error + pushing ==="
rm -f .git/index.lock .git/HEAD.lock .git/MERGE_HEAD.lock 2>/dev/null || true
git add src/lib/affiliates.ts
git commit -m "fix: TS narrowing error — cast partner in default case"
git push origin main
echo ""
echo "Done! Vercel will redeploy in ~60s."
echo "Press Enter to close..."
read
