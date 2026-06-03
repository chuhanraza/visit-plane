#!/bin/bash
# Affiliate monetization deployment
set -e

echo "Clearing any stale git locks..."
rm -f .git/index.lock .git/HEAD.lock .git/MERGE_HEAD.lock

echo "Staging all changes..."
git add .

echo "Committing affiliate integration..."
git commit -m "feat: affiliate monetization — tracking, placements, admin dashboard

- /go/[partner] redirect endpoint: logs every click to Supabase, 302s to partner
- affiliate_clicks table with partner/placement/route/session/hashed-IP schema
- src/lib/affiliates.ts: central config for SafetyWing, HeyMondo, Airalo, Saily, WayAway, Kiwi
- TravelReadinessGrid: tracking URLs + REQUIRED badge for Schengen insurance
- AffiliateDisclosure component (FTC/ASA compliant, visible on all affiliate pages)
- BlogTripBox: Recommended for this trip box on all blog post footers
- Inline Schengen insurance callout on relevant blog posts
- Soft P.S. affiliate mention in push notification alerts
- /admin/affiliates analytics dashboard (clicks/partner/day, top routes, top placements, EPC)
- Recommended Partners section added to SiteFooter
- All affiliate links: rel=nofollow sponsored
- Affiliate IDs configured via env vars — see /admin/affiliates for apply-at links"

echo "Pushing to GitHub (triggers Vercel deploy)..."
git push origin main

echo ""
echo "Done! Vercel will deploy in ~60 seconds."
echo "Check: https://visitplane.com/go/safetywing?placement=visa_page (should redirect)"
echo "Dashboard: https://visitplane.com/admin/affiliates"
