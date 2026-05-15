#!/bin/bash
cd "$(dirname "$0")"
git add .
git commit -m "fix: Checklist flags, dropdown filter, missing pages (privacy, terms, contact, about, faq)"
git push origin main
echo ""
echo "✅ Done! Check https://visitplane.com in ~2 minutes."
