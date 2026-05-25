import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mimeType, data: imageBase64 },
              },
              {
                type: "text",
                text: `Extract passport data from this image. Read both the printed fields and the MRZ lines at the bottom.
Return ONLY a valid JSON object, no explanation, no markdown, no backticks:
{
  "fullName": "Given Names Surname in Title Case",
  "surname": "Surname only in Title Case",
  "givenNames": "Given names only in Title Case",
  "nationality": "Country name",
  "passportNo": "Passport number exactly as printed",
  "dateOfBirth": "DD/MM/YYYY",
  "expiryDate": "DD/MM/YYYY",
  "gender": "Male or Female"
}
Rules:
- fullName must be Given Names first then Surname (e.g. Muhammad Salman Ashraf)
- Title Case for all names
- For Pakistani passports: Surname field is family name, Given Names are personal names`,
              },
            ],
          },
        ],
      }),
    });
    const responseText = await response.text();
    if (!response.ok) {
      console.error("Anthropic API error:", response.status, responseText);
      return NextResponse.json(
        { error: `Scan service error: ${response.status}` },
        { status: 500 }
      );
    }
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("Failed to parse Anthropic response:", responseText);
      return NextResponse.json({ error: "Invalid response from scan service" }, { status: 500 });
    }
    const text = data.content?.find((c: any) => c.type === "text")?.text || "";
    if (!text) {
      return NextResponse.json({ error: "No data extracted from passport" }, { status: 500 });
    }
    const clean = text.replace(/```json|```/g, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      console.error("Failed to parse passport JSON:", clean);
      return NextResponse.json({ error: "Could not read passport fields. Try a clearer image." }, { status: 500 });
    }
    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Passport scan route error:", err);
    return NextResponse.json({ error: err.message || "Scan failed" }, { status: 500 });
  }
}
