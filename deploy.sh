#!/bin/bash
# VisitPlane UI Polish Deployment Script
# Run this from the visitplane directory: bash deploy.sh

echo "Cleaning stale git lock files..."
rm -f .git/HEAD.lock .git/index.lock

echo "Staging all changes..."
git add .

echo "Committing..."
git commit -m "fix: UI polish - unique SEO titles, navbar, dynamic popular destinations, breadcrumbs, passport strength

- Fix 1: Unique metadata (layout.tsx) for all 17 pages
- Fix 2: Visa Requirements navbar now links to / (homepage)
- Fix 3: Dynamic popular pills by passport - Pakistan/India/Nigeria/Bangladesh/USA/UK/default (6 pills each)
- Fix 4: Quick-pick pills use teal active state; fixed visibility on light bg; fixed share preview text
- Fix 5: All tool page heroes verified with #FAFAFA bg, badge, headline, gray subtext, teal CTA
- Fix 6: Added ToolBreadcrumb component; breadcrumbs on all 11 tool pages"

echo "Pushing to main..."
git push origin main

echo "Done! Check visitplane.com in a few minutes."
rm -f deploy.sh
