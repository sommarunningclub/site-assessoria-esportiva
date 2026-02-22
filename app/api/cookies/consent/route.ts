import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { visitorId, consentType, essentialCookies, analyticsCookies, marketingCookies } = body

    // Sempre retornar sucesso no cliente - cookies consent é opcional
    // Tenta salvar no Supabase mas não bloqueia se falhar
    try {
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

      if (!error) {
        return NextResponse.json({ success: true, data })
      }
    } catch {
      // Silenciosamente falha - cookie consent não é crítico
    }

    // Retorna sucesso mesmo se Supabase falhou
    return NextResponse.json({ success: true })
  } catch (error) {
    // Erro no parsing do body ou outro erro crítico
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
  }
}
