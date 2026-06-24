import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase/admin'
import { resolveOrderAccess } from '@/lib/orders/access'
import { writeAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])

const safeName = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80) || 'file'

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: orderId } = await ctx.params

  const access = await resolveOrderAccess(orderId)
  if (!access.allowed) return NextResponse.json({ error: 'Not authorized for this order' }, { status: 403 })

  const form = await req.formData().catch(() => null)
  const file = form?.get('file')
  const docType = String(form?.get('docType') ?? 'other').slice(0, 60)
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (file.size === 0 || file.size > MAX_BYTES) return NextResponse.json({ error: 'File must be 1 byte–10 MB' }, { status: 422 })
  if (!ALLOWED_MIME.has(file.type)) return NextResponse.json({ error: 'Only JPG, PNG, WEBP, or PDF allowed' }, { status: 422 })

  const svc = getServiceClient()
  const uid = crypto.randomUUID()
  const path = `orders/${orderId}/${uid}__${safeName(file.name)}`
  const bytes = new Uint8Array(await file.arrayBuffer())

  const { error: upErr } = await svc.storage.from('order-documents')
    .upload(path, bytes, { contentType: file.type, upsert: false })
  if (upErr) return NextResponse.json({ error: `Upload failed: ${upErr.message}` }, { status: 500 })

  const { data: doc, error: dErr } = await svc.from('order_documents').insert({
    order_id: orderId,
    doc_type: docType,
    file_name: file.name.slice(0, 200),
    storage_path: path,
    file_size: file.size,
    mime_type: file.type,
    status: 'pending',
    uploaded_by: access.actor,
  }).select('id').single()
  if (dErr) {
    // best-effort cleanup of the orphaned object
    await svc.storage.from('order-documents').remove([path])
    return NextResponse.json({ error: `Could not record document: ${dErr.message}` }, { status: 500 })
  }

  await writeAudit({
    actor: access.actor, actorType: access.actorType,
    action: 'document.uploaded', entityType: 'order', entityId: orderId,
    metadata: { document_id: doc.id, doc_type: docType, file_name: file.name, size: file.size },
  })

  return NextResponse.json({ id: doc.id, status: 'pending' }, { status: 201 })
}
