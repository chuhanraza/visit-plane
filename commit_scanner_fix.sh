#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "📦 Installing dependencies..."
npm install
echo "✅ Committing changes..."
git add -A
git commit -m "fix: replace API-based scanner with free browser-side Tesseract+mrz parser"
echo "🚀 Pushing to remote..."
git push
echo "✅ Done! Passport scanner is now 100% free and browser-side."
