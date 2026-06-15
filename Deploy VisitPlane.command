#!/bin/bash
# ════════════════════════════════════════════════════════════
#  VisitPlane — One-Click Deploy
#  Double-click this file in Finder to push your changes live.
#  (Vercel builds automatically and only swaps the live site if
#   the build succeeds, so a bad build can't break production.)
# ════════════════════════════════════════════════════════════

# Always run from the folder this file lives in (the project folder)
cd "$(dirname "$0")" || exit 1

echo "════════════════════════════════════════"
echo "   🚀  VisitPlane Deploy"
echo "════════════════════════════════════════"
echo "Folder: $(pwd)"
echo ""

# 1) Clear any stale git lock left by a crashed process
if [ -f .git/index.lock ]; then
  echo "• Clearing a stuck git lock..."
  rm -f .git/index.lock
fi

# 2) Pull the latest from GitHub first (prevents 'push rejected')
echo "• Syncing with GitHub..."
if ! git pull --rebase --autostash; then
  echo ""
  echo "⚠️  Couldn't sync cleanly — there may be a conflict."
  echo "    Nothing was deployed. Send this screen to Claude."
  echo ""
  read -r -p "Press Return to close this window. "
  exit 1
fi

# 3) Is there anything new to deploy?
if [ -z "$(git status --porcelain)" ]; then
  echo ""
  echo "✅ Nothing new to deploy — your site is already up to date."
  echo ""
  read -r -p "Press Return to close this window. "
  exit 0
fi

# 4) Show what's about to go live
echo ""
echo "• These files will be deployed:"
git status --short
echo ""

# 5) Ask for an optional description (just press Return to auto-name it)
read -r -p 'Describe this change (or press Return): ' MSG
if [ -z "$MSG" ]; then
  MSG="deploy: $(date '+%Y-%m-%d %H:%M')"
fi

# 6) Save + upload (the push triggers the Vercel deploy)
echo ""
echo "• Saving and uploading..."
git add -A
git commit -m "$MSG"
if ! git push; then
  echo ""
  echo "❌ Upload failed. Nothing changed on the live site."
  echo "    Send this screen to Claude."
  echo ""
  read -r -p "Press Return to close this window. "
  exit 1
fi

echo ""
echo "════════════════════════════════════════"
echo "✅ DONE — pushed to GitHub."
echo "   Vercel is now building your site."
echo "   It goes live in about 1–3 minutes."
echo "   Tip: hard-refresh with Cmd+Shift+R to see it."
echo "════════════════════════════════════════"
echo ""
read -r -p "Press Return to close this window. "
