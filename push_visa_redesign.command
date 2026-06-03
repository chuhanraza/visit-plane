#!/bin/bash
# VisitPlane — Visa Page Redesign Deploy
# Double-click this file to push to GitHub → Vercel auto-deploys in ~60s

set -e
cd "$(dirname "$0")"

echo "============================================"
echo "  VisitPlane — Visa Page Redesign Deploy"
echo "============================================"
echo ""
echo "Working dir: $(pwd)"
echo ""

# Clear any stale lock files
rm -f .git/HEAD.lock .git/index.lock 2>/dev/null && echo "✓ Lock files cleared" || true

# Show what's staged
echo ""
echo "Files in this commit:"
git log --name-only --oneline -1
echo ""

echo "Pushing to GitHub (Vercel will auto-deploy)..."
git push origin main

echo ""
echo "============================================"
echo "  ✅ DONE! Deploy triggered."
echo "  Check Vercel dashboard in ~60 seconds:"
echo "  https://vercel.com/chuhanraza/visit-plane"
echo ""
echo "  Live URL:"
echo "  https://www.visitplane.com/visa/Pakistan/UAE"
echo "============================================"
echo ""
read -p "Press Enter to close..."
