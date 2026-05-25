import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
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
                text: `Extract passport data from this image. Read both the printed fields and the MRZ lines.
Return ONLY a valid JSON object, no explanation, no markdown, no backticks:
{
  "fullName": "Given Names Surname in Title Case natural order",
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
    const data = await response.json();
    const text = data.content?.find((c: any) => c.type === "text")?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Scan failed" }, { status: 500 });
  }
}
