#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Pushing passport-strength fix to GitHub..."
git push origin main
echo ""
echo "✅ Done! Vercel will deploy automatically."
echo "   Live at: https://visitplane.com/passport-strength"
echo ""
echo "Press Enter to close..."
read
