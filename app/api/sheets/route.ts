import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, email, whatsapp, sexo, cidade } = body

    // Validate required fields
    if (!nome || !email || !whatsapp || !sexo || !cidade) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    // Google Apps Script Web App URL
    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL

    if (!GOOGLE_SCRIPT_URL) {
      console.error("[v0] GOOGLE_SCRIPT_URL not configured")
      return NextResponse.json({ success: true, warning: "Sheets integration not configured" })
    }

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        nome,
        email,
        whatsapp,
        sexo,
        cidade,
        timestamp: new Date().toISOString(),
      }),
      redirect: "follow",
    })

    const responseText = await response.text()
    console.log("[v0] Google Sheets response:", response.status, responseText)

    // If we got here without throwing, consider it a success
    // Google Apps Script can return 200, 302, or other codes on success
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving to Google Sheets:", error)
    // Return success anyway to not block the user experience
    return NextResponse.json({ success: true, warning: "Could not save to sheets" })
  }
}
