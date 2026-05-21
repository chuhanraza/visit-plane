#!/bin/bash
cd /Users/muhammadhamadashraf/Desktop/visitplane
echo "Removing stale git lock files..."
rm -f .git/HEAD.lock .git/index.lock
echo "Staging changes..."
git add .
echo "Committing..."
git commit -m "fix: UI polish - SEO titles, navbar, dynamic destinations, breadcrumbs, passport strength

- Fix 1: Unique metadata (layout.tsx) for all 17 pages
- Fix 2: Visa Requirements navbar now links to / (homepage)
- Fix 3: Dynamic popular pills by passport (6 pills each for Pakistan/India/Nigeria/Bangladesh/USA/UK/default)
- Fix 4: Quick-pick pills teal active state; fixed label visibility; fixed share card text color
- Fix 5: All tool page heroes verified #FAFAFA bg, teal badge, dark headline, gray subtext, teal CTA
- Fix 6: ToolBreadcrumb component added to all 11 tool pages"
echo "Pushing..."
git push origin main
echo ""
echo "✅ All done! visitplane.com will update in ~1 minute."
echo "Press Enter to close..."
read
rm -f /Users/muhammadhamadashraf/Desktop/visitplane/visitplane_deploy.command
