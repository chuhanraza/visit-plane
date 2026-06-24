import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase/admin'
import { resolveOrderAccess } from '@/lib/orders/access'

export const dynamic = 'force-dynamic'

/**
 * Mint a short-lived signed URL for a private document and redirect to it. Only the
 * owning customer or an admin may access. The bucket is private — there is no public
 * URL path to these files.
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ docId: string }> }) {
  const { docId } = await ctx.params
  const svc = getServiceClient()

  const { data: doc } = await svc.from('order_documents')
    .select('id, order_id, storage_path').eq('id', docId).maybeSingle()
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const access = await resolveOrderAccess(doc.order_id as string)
  if (!access.allowed) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const { data: signed, error } = await svc.storage
    .from('order-documents')
    .createSignedUrl(doc.storage_path as string, 120) // 2-minute link
  if (error || !signed) return NextResponse.json({ error: 'Could not create link' }, { status: 500 })

  return NextResponse.redirect(signed.signedUrl)
}
