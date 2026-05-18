#!/bin/bash
cd "$(dirname "$0")"
echo "🌍 Pushing IP Geolocation feature to GitHub..."
git push origin main
echo ""
echo "✅ Done! Vercel will auto-deploy in ~30 seconds."
echo "🔗 Test the API: https://visitplane.com/api/geo"
echo "   Should return your country based on your IP."
