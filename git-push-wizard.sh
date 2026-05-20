#!/bin/bash
# Push the AI Visa Wizard
# Usage: bash git-push-wizard.sh

set -e
cd "$(dirname "$0")"

# Remove any stale git lock files
rm -f .git/HEAD.lock .git/index.lock

git push origin main

echo ""
echo "✅ Done! AI Visa Wizard pushed to main."
echo "   visitplane.com/wizard will be live in ~1-2 minutes."
