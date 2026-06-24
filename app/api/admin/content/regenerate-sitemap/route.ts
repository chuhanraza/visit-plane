import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdminApi } from '@/lib/admin/guard'
import { writeAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/**
 * Force the dynamic sitemap routes to regenerate on next request.
 * app/sitemap.ts and app/sitemap-blog.xml/route.ts are force-dynamic; this clears
 * any cached output so the next crawl/fetch rebuilds from current data.
 */
export async function POST(req: NextRequest) {
  const actor = await requireAdminApi()
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const paths = ['/sitemap.xml', '/sitemap-blog.xml']
  for (const p of paths) {
    try { revalidatePath(p) } catch { /* best-effort */ }
  }

  await writeAudit({
    actor, actorType: 'admin', action: 'content.regenerate_sitemap',
    entityType: 'sitemap', metadata: { paths },
    ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null,
  })
  return NextResponse.json({ ok: true, revalidated: paths })
}
