#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/HEAD.lock .git/index.lock
git add .
git commit -m "fix: Currency converter API, navbar + footer all tool pages"
git push origin main
echo ""
echo "✅ Done! Navbar + footer updated on all tool pages."
read -p "Press Enter to close..."
