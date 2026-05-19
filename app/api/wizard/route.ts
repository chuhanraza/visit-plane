import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { passport, destination, purpose, duration, travelDate } = await req.json()

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system:
          'You are VisitPlane\'s visa expert AI assistant. You provide accurate, helpful visa guidance. Always be friendly, concise and practical. Format your response in clear sections. Base answers on general visa knowledge.',
        messages: [
          {
            role: 'user',
            content: `A traveler needs visa guidance:
- Passport: ${passport}
- Destination: ${destination}
- Purpose: ${purpose}
- Duration: ${duration}
- Travel date: ${travelDate}

Provide a complete visa guide including:
1. Visa requirement (required/free/on arrival)
2. Recommended visa type
3. Key documents needed (5-7 items)
4. Estimated processing time
5. Estimated cost
6. Top 3 tips for this specific route
7. One important warning/reminder

Keep response friendly and under 300 words. Use emojis for readability.`,
          },
        ],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Claude API error:', err)
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json({ text: data.content[0].text })
  } catch (e) {
    console.error('Wizard route error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
