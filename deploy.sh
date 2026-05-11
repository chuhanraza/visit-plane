#!/bin/bash
# VisitPlane – commit & deploy green design to Vercel
set -e

cd "$(dirname "$0")"

echo "📦 Committing green design changes..."
rm -f .git/index.lock 2>/dev/null || true
git add app/page.tsx "app/visa/[passport]/[destination]/page.tsx"
git commit -m "feat: green design – hero, badge, mint bg, #10B981 accent"

echo "🚀 Deploying to production..."
if command -v vercel &>/dev/null; then
  vercel --prod
else
  npx vercel --prod
fi

echo "✅ Done! Visit https://visitplane.com"
