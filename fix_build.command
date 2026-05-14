#!/bin/bash
cd "$(dirname "$0")"

echo "=== Fixing Vercel build error: @next/third-parties ==="
echo ""

# Remove stale git lock file
rm -f .git/HEAD.lock .git/index.lock
echo "✓ Cleared stale git locks"

# Commit the fix
git add package.json package-lock.json
git commit -m "Fix: Install @next/third-parties package for GA4"
echo "✓ Committed"

# Push to GitHub (triggers Vercel rebuild)
git push origin main
echo ""
echo "✓ Pushed to GitHub — Vercel is now rebuilding!"
echo ""
echo "Press Enter to close..."
read
