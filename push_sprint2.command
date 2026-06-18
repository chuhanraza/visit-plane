#!/bin/bash
# ════════════════════════════════════════════════════════════
#  VisitPlane — Commit + Push Sprint 2 (non-interactive)
#  Commits any staged/pending changes and pushes to GitHub.
#  Vercel auto-builds on push and only swaps the live site if
#  the build succeeds.
# ════════════════════════════════════════════════════════════
cd "$(dirname "$0")" || exit 1

echo "════════════════════════════════════════"
echo "   🚀  VisitPlane — commit + push Sprint 2"
echo "════════════════════════════════════════"
echo "Folder: $(pwd)"

# Clear any stale git lock
[ -f .git/index.lock ] && rm -f .git/index.lock

# Stage everything (the build-fix files may already be staged)
git add -A

# Commit if there is anything to commit (ignore error when nothing pending)
if ! git diff --cached --quiet; then
  echo "• Committing pending changes..."
  git commit -m "fix(build): force-dynamic on DB-backed SEO routes so Next 16 stops crashing on build-time prerender"
else
  echo "• Nothing new to commit (already committed)."
fi

echo ""
echo "• Latest local commit:"
git log --oneline -1

echo ""
echo "• Pushing to GitHub (origin main)..."
if git push origin main; then
  echo ""
  echo "✅ Pushed. Vercel is now building — live in ~1–3 minutes."
else
  echo ""
  echo "❌ Push failed. Send this screen to Claude."
fi
echo ""
read -r -p "Press Return to close this window. "
