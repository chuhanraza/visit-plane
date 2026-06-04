#!/bin/bash
# VisitPlane — Pakistan→UAE Fee Fix Deploy
# Double-click this file to push to GitHub → Vercel auto-deploys in ~60s

set -e
cd "$(dirname "$0")"

echo "============================================"
echo "  Pakistan→UAE Fee Fix — Push to GitHub"
echo "============================================"
echo ""

# Clear stale lock files
rm -f .git/HEAD.lock .git/index.lock 2>/dev/null || true

echo "Last commit:"
git log --oneline -1
echo ""

echo "Staging and committing..."
git add -A
git diff --cached --stat
git commit -m "fix: force-dynamic on visa page to bypass Next.js fetch cache" 2>/dev/null || echo "(nothing new to commit)"

echo "Pushing to GitHub (Vercel will auto-deploy)..."
git push origin main

echo ""
echo "============================================"
echo "  ✅ Pushed! Vercel deploying now (~60s)"
echo "  Live at: https://www.visitplane.com/visa/Pakistan/UAE"
echo "============================================"
