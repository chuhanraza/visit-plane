#!/bin/bash
cd "$(dirname "$0")"
echo "=== Pushing affiliate commit to GitHub ==="
git push origin main
echo ""
echo "Done! Vercel will deploy in ~60 seconds."
echo "Test: https://www.visitplane.com/go/safetywing?placement=visa_page"
echo "Dashboard: https://www.visitplane.com/admin/affiliates"
echo ""
echo "Press Enter to close..."
read
