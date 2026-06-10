import { NextRequest, NextResponse } from 'next/server'
import { getVisaData } from '@/lib/visa-engine'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const passport = searchParams.get('passport') ?? ''
  const destination = searchParams.get('destination') ?? ''
  const purpose = searchParams.get('purpose') ?? 'Tourism'

  if (!passport || !destination) {
    return NextResponse.json({ error: 'passport and destination are required' }, { status: 400 })
  }

  const data = getVisaData(passport, destination, purpose)
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, max-age=86400' }, // cache 24h
  })
}
