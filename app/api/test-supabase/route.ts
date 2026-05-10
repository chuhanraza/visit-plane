import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase     = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('destinations')
      .select('*')

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        hint: error.hint,
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      url: supabaseUrl,
      table: 'destinations',
      rowCount: data.length,
      data: data,
    })
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
    }, { status: 500 })
  }
}
