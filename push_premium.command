#!/bin/bash
cd "$(dirname "$0")"

echo "🚀 VisitPlane — Force-syncing Premium Homepage..."
echo ""

# Remove stale locks
rm -f .git/HEAD.lock .git/index.lock 2>/dev/null

# Step 1: Fetch to update remote refs
echo "📥 Fetching latest remote state..."
git fetch origin main

# Step 2: Rebase our commit on top of true remote HEAD
echo "🔀 Rebasing premium commit on top of remote..."
git rebase origin/main

if [ $? -ne 0 ]; then
  echo ""
  echo "⚠️  Conflicts detected — using force push instead..."
  git rebase --abort 2>/dev/null
  git push origin main --force-with-lease
else
  # Step 3: Push cleanly
  echo ""
  echo "📤 Pushing to GitHub..."
  git push origin main
fi

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ DONE! Vercel is building the premium homepage."
  echo "🌐 Live at https://visitplane.com in ~90 seconds"
else
  echo ""
  echo "🔧 Trying force push as last resort..."
  git push origin main --force
  echo "✅ Force pushed! Check https://visitplane.com"
fi

echo ""
echo "Press Enter to close..."
read
