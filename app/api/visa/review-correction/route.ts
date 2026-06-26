import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminApi } from '@/lib/admin/guard'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const id       = formData.get('id') as string
  const action   = formData.get('action') as 'accept' | 'reject'

  const { error } = await supabase
    .from('data_corrections')
    .update({
      status:      action === 'accept' ? 'accepted' : 'rejected',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Redirect back to corrections tab
  return NextResponse.redirect(
    new URL(`/admin/data-quality?tab=corrections`, req.url),
  )
}
