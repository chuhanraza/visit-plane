#!/bin/bash
# Remove stale git lock files if they exist
rm -f .git/HEAD.lock .git/index.lock

git add .

git commit -m "fix: Critical trust fixes - remove fake press logos, fix broken links, consistent stats, honest claims, email capture

- Fix 1: Remove fake press logos (TechCrunch/Forbes/Bloomberg/WIRED/Reuters/Guardian/BBC/CNN/Lonely Planet); add honest trust bar
- Fix 2: Remove non-existent App Store / Google Play badges from footer
- Fix 3: Create /destinations, /how-it-works, /visa-requirements, /cost-calculator pages; fix all footer links; fix blog navbars
- Fix 4: Consistent stats everywhere - 197 Countries (not 200+), 10,000+ Travelers (not 100K+)
- Fix 5: Replace fake named testimonials with honest Verified User, Country cards; remove photos
- Fix 6: New hero headline - Know Exactly Which Visa You Need / In 10 Seconds
- Fix 7: Remove powered by AI claim; replace with backed by official embassy sources
- Fix 8: Standardize navbar - remove broken How it Works links; fix Get Started /get-started (404) to Check Visa /
- Fix 9: Fix Apply with VisitPlane /apply (404) to Check Official Embassy Website; remove Money-back Guarantee; fix pay fee step
- Fix 10: Add email capture section saving to Supabase waitlist table"

git push origin main

echo ""
echo "✅ All trust fixes committed and pushed!"
