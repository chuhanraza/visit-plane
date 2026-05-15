#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/HEAD.lock .git/index.lock
git add app/compare/page.tsx
git commit -m "fix: Use select('*') in compare query to avoid missing-column errors"
git push origin main
echo ""
echo "✅ Done! Press any key to close."
read -n 1
