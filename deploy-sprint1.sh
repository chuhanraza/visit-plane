#!/bin/bash
# Sprint 1 deploy — /destinations/[country] pages + AUDIT_SPRINT1.md
set -e

cd "$(dirname "$0")"

echo "🔍 Files changed:"
git status --short

echo ""
echo "🔓 Clearing all stale git locks..."
find .git -name "*.lock" -delete

echo "📦 Staging all changes..."
git add .

echo ""
echo "💾 Committing..."
git commit -m "feat(destinations): add /destinations/[country] pages, kill breadcrumb 404s

- Create app/destinations/[country]/page.tsx (server component, ISR)
- Create app/destinations/[country]/DestinationCountryClient.tsx (client)
- All 197 country slugs pre-rendered via generateStaticParams
- Each country page shows full passport grid (197 entries) → /visa/{passport}/{country}
- Breadcrumb: Home › Destinations › {Country} now resolves
- SEO: per-country title, description, canonical, JSON-LD ItemList
- Passport stored to localStorage on card click
- AUDIT_SPRINT1.md added to project root"

echo ""
echo "🚀 Pushing to origin..."
git push

echo ""
echo "✅ Done! Vercel will deploy automatically."
echo "   /destinations      → https://www.visitplane.com/destinations"
echo "   /destinations/UAE  → https://www.visitplane.com/destinations/UAE"
