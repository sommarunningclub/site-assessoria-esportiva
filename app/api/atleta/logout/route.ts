import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })

  // Limpar cookies de sessão
  response.cookies.set("atleta_session", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  })

  response.cookies.set("atleta_id", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  })

  return response
}
