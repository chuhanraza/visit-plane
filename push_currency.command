#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/HEAD.lock .git/index.lock
git add .
git commit -m "feat: Real-time Currency Converter"
git push origin main
echo ""
echo "✅ Deployed! Quick amounts, popular pairs, tips + Tools menu live."
read -p "Press Enter to close..."
