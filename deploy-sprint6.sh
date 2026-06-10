#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "=== Sprint 6: Deploying AI Visa Wizard ==="
echo ""

# Phase 1-4: Decision tree wizard (no AI)
git add \
  lib/visa-engine.ts \
  app/api/visa-data/route.ts \
  app/wizard/WizardClient.tsx \
  app/wizard/components/WizardStep.tsx \
  app/wizard/components/WizardResults.tsx \
  app/api/wizard-email/route.ts \
  "app/wizard/result/[state]/page.tsx"

git commit -m "feat(wizard): real conversational wizard with decision-tree results

- 5-step screen-per-question wizard (replaces chat UI)
- Progress bar + back navigation on every question
- Questions: passport country, destination, purpose (6 options), duration (number), travel date (optional)
- /api/visa-data — decision tree engine with 100+ country-pair lookups
- Rich result card: visa type badge, processing time, cost, stay limit, action plan
- Action plan calculates earliest application date from travel date
- Collapsible document checklist (required + conditional)
- Email capture inline → /api/wizard-email (adds to subscribers)
- Shareable URL: /wizard/result/{base64-encoded-state}
- JSON-LD structured data on result pages for SEO
- WizardHero unchanged — Start Wizard flows into step 1"

echo "✓ Phase 1-4 committed"

# Phase 5-6: Gemini AI layer + rate limiting
git add app/api/wizard/route.ts

git commit -m "feat(wizard): add Gemini AI personalization layer with caching + rate limit

- Gemini Flash (gemini-1.5-flash) generates personalized 4-part insight
- AI section appears async below result card (non-blocking)
- Fallback: if Gemini fails/times out, result card shown without AI section
- In-memory cache per state hash, 24h TTL
- Rate limit: 10 wizard runs per IP per hour
- 8s timeout on Gemini requests"

echo "✓ Phase 5-6 committed"

git push

echo ""
echo "=== Deployed! ==="
echo ""
echo "Add to Vercel env vars (Settings → Environment Variables):"
echo "  GEMINI_API_KEY=  (get free at aistudio.google.com)"
echo ""
echo "Test checklist:"
echo "  ✓ /wizard → click Start Wizard"
echo "  ✓ Walk through all 5 questions"
echo "  ✓ Check result card shows visa type badge"
echo "  ✓ Copy share link → open in incognito"
echo "  ✓ Try Email This Plan to Myself"
echo "  ✓ Mobile at 375px width"
