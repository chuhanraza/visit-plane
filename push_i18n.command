#!/bin/bash
# VisitPlane – push middleware fix (commit already created by Claude)
set -e

cd "$(dirname "$0")"

# Clear any stale git lock files
rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/main.lock 2>/dev/null || true

echo "🚀 Pushing to GitHub (Vercel auto-deploys)..."
git push origin main

echo ""
echo "✅ Done! Vercel will deploy in ~60 seconds."
echo "   Visit https://visitplane.com to see the updated language mapping."
