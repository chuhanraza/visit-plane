#!/bin/bash
# Deploy blog posts to GitHub / Vercel
cd "$(dirname "$0")"

echo "🗑  Removing stale git lock..."
rm -f .git/index.lock

echo "📦 Staging files..."
git add app/blog/ content/ src/lib/posts.ts app/sitemap.ts package.json package-lock.json

echo "💾 Committing..."
git commit -m "feat: add blog system with 10 visa guide posts

- Create src/lib/posts.ts with blog post metadata for all 10 posts
- Add app/blog/page.tsx (blog listing page, 10 cards in grid)
- Add app/blog/[slug]/page.tsx (individual post page with markdown rendering)
- Create content/blog/ directory with 10 markdown files
- Update app/sitemap.ts to include /blog and all 10 post URLs
- Install gray-matter, remark, remark-html for markdown parsing

Posts: Schengen (PK), Dubai tourist (IN), UK student, Canada tourist (PK),
Australia work (IN), Germany job seeker, Japan tourist (PK), USA F1 student,
UAE residence, Schengen (IN)"

echo "🚀 Pushing to GitHub (Vercel will auto-deploy)..."
git push origin main

echo "✅ Done! Vercel is building now. Check https://visitplane.com/blog in ~1 minute."
