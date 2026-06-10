#!/bin/bash
cd "$(dirname "$0")"

echo "=== Fix: ALL_COUNTRIES server-boundary error ==="
echo ""

rm -f .git/HEAD.lock .git/index.lock

git add app/destinations/DestinationsClient.tsx
git add app/destinations/data.ts
git add "app/destinations/[country]/page.tsx"

git status

git commit -m "fix(build): extract ALL_COUNTRIES to server-safe data.ts

- Create app/destinations/data.ts (no 'use client') with types + array
- DestinationsClient.tsx: import from ./data, orphaned inline array removed
- [country]/page.tsx: import ALL_COUNTRIES from ../data not DestinationsClient

Fixes: TypeError: c.ALL_COUNTRIES.map is not a function in generateStaticParams"

git push origin main

echo ""
echo "✅ Fix pushed. Vercel is now rebuilding."
echo ""
echo "Press Enter to close..."
read
