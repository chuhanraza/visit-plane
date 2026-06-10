import { NextRequest, NextResponse } from 'next/server'

// ── Hardcoded decision-tree fallback (used when Claude API is unavailable) ─────
function buildFallbackResponse(
  passport: string,
  destination: string,
  purpose: string,
  duration: string,
  travelDate: string,
): string {
  const purposeLabel = purpose.replace(/^[^\s]+\s/, '')
  const durationLabel = duration.replace(/^[^\s]+\s/, '')
  const isUrgent = travelDate.toLowerCase().includes('2 weeks')

  const urgentNote = isUrgent
    ? '\n\n⚡ **Urgent Travel Note:** You mentioned traveling within 2 weeks. Apply immediately and request express/priority processing if available.'
    : ''

  return `🛂 **Visa Guidance: ${passport} → ${destination}**

Based on your answers, here is your personalised visa summary:

📋 **Your Trip Details**
• Passport: ${passport}
• Destination: ${destination}
• Purpose: ${purposeLabel}
• Planned stay: ${durationLabel}
• Travel window: ${travelDate}

📄 **Documents You Will Likely Need**
1. Valid passport (minimum 6 months validity beyond your travel dates)
2. Completed visa application form
3. Passport-sized photographs (2 copies, white background)
4. Bank statements — last 3 months showing sufficient funds
5. Round-trip flight itinerary or confirmed tickets
6. Hotel booking confirmation for your entire stay
7. Travel insurance (minimum USD $30,000 coverage)
${purposeLabel.toLowerCase().includes('business') ? '8. Invitation letter from host company\n9. Company registration documents' : purposeLabel.toLowerCase().includes('study') ? '8. University acceptance letter\n9. Academic transcripts' : '8. Employment letter / proof of employment'}

⏱️ **Processing Time**
Standard processing typically takes 5–15 business days. Express services (where available) can reduce this to 3–5 business days.

💰 **Estimated Fee**
Visa fees vary by nationality and visa type, typically between USD $50–$200 for tourist/visitor visas. Check the official embassy website for exact, current fees.

💡 **Top Tips for ${destination}**
1. Apply well in advance — at least 4–6 weeks before your travel date
2. Ensure all documents are certified/notarised where required
3. Double-check passport validity (most countries require 6 months beyond your return date)

⚠️ **Important Reminder**
This guidance is based on general visa knowledge. Requirements change frequently. Always verify the current requirements on the **official ${destination} embassy or consulate website** before submitting your application.

🔗 **Next Step:** Visit visitplane.com/visa/${encodeURIComponent(passport)}/${encodeURIComponent(destination)} for detailed, route-specific requirements.${urgentNote}`
}

export async function POST(req: NextRequest) {
  try {
    const { passport, destination, purpose, duration, travelDate } = await req.json()

    // If no API key configured, use decision-tree fallback immediately
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        text: buildFallbackResponse(passport, destination, purpose, duration, travelDate),
      })
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system:
          "You are VisitPlane's visa expert AI assistant. You provide accurate, helpful visa guidance. Always be friendly, concise and practical. Format your response in clear sections. Base answers on general visa knowledge.",
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
      // Graceful fallback instead of error response
      return NextResponse.json({
        text: buildFallbackResponse(passport, destination, purpose, duration, travelDate),
      })
    }

    const data = await res.json()
    return NextResponse.json({ text: data.content[0].text })
  } catch (e) {
    console.error('Wizard route error:', e)
    // Last-resort fallback
    try {
      const body = await (req as NextRequest & { _body?: { passport: string; destination: string; purpose: string; duration: string; travelDate: string } })._body
      void body
    } catch { /* ignore */ }
    return NextResponse.json({
      text: '🛂 We could not connect to the AI right now. Please visit visitplane.com/destinations to check visa requirements directly, or try again in a moment.',
    })
  }
}
