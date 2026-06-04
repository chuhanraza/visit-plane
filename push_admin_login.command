#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/HEAD.lock .git/index.lock 2>/dev/null || true

git add \
  app/admin/seo/page.tsx \
  app/admin/affiliates/page.tsx \
  app/admin/data-quality/page.tsx

git commit -m "fix: decode URL-encoded cookie value in admin auth check"
git push origin main

echo "✅ Done — Vercel redeploying. Try logging in again in ~2 min."
read -p "Press Enter to close..."
