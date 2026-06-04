#!/bin/bash
cd "$(dirname "$0")"
echo "Pushing TS fix to GitHub..."
git push origin main
echo "✅ Done — Vercel will redeploy automatically."
read -p "Press Enter to close..."
