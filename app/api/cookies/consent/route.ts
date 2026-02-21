import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { visitorId, consentType, essentialCookies, analyticsCookies, marketingCookies } = body

    const supabase = await createClient()

    // Get IP and User Agent from request
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    const { data, error } = await supabase
      .from("cookie_consents")
      .insert({
        visitor_id: visitorId,
        ip_address: ipAddress,
        user_agent: userAgent,
        consent_type: consentType,
        essential_cookies: essentialCookies,
        analytics_cookies: analyticsCookies,
        marketing_cookies: marketingCookies,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase error:", error.message || JSON.stringify(error))
      // Se houver erro na tabela, apenas retorn sucesso (não bloqueia o fluxo)
      return NextResponse.json({ success: true, warning: "Cookie consent not persisted" })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Error saving cookie consent:", error instanceof Error ? error.message : String(error))
    // Não falha a requisição - apenas log do erro
    return NextResponse.json({ success: true, warning: "Failed to save consent" })
  }
}
