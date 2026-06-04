#!/bin/bash
cd "$(dirname "$0")"

echo "=== VisitPlane Affiliate Integration Deploy ==="
echo ""

echo "Clearing stale git locks..."
rm -f .git/index.lock .git/HEAD.lock 2>/dev/null || true

echo "Staging changes..."
git add .

echo "Committing..."
git commit -m "feat: affiliate monetization — tracking, placements, admin dashboard

- /go/[partner] redirect endpoint: logs every click to Supabase, 302s to partner
- affiliate_clicks table: partner/placement/route/session/hashed-IP schema
- src/lib/affiliates.ts: central config — SafetyWing, HeyMondo, Airalo, Saily, WayAway, Kiwi
- TravelReadinessGrid: /go/ tracking URLs + REQUIRED badge for Schengen insurance
- AffiliateDisclosure component (FTC/ASA compliant)
- BlogTripBox: Recommended for this trip box on all blog post footers
- Inline Schengen insurance callout on relevant blog posts
- Soft PS affiliate mention in push notification alerts
- /admin/affiliates analytics dashboard (clicks/partner/day, top routes, EPC)
- Recommended Partners section in SiteFooter
- All affiliate links: rel=nofollow sponsored"

echo ""
echo "Pushing to GitHub (triggers Vercel deploy)..."
git push origin main

echo ""
echo "==========================================="
echo "DONE! Vercel will deploy in ~60 seconds."
echo "Test: https://www.visitplane.com/go/safetywing?placement=visa_page"
echo "Dashboard: https://www.visitplane.com/admin/affiliates"
echo "==========================================="
echo ""
echo "Press Enter to close..."
read
