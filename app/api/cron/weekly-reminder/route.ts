import { NextResponse } from "next/server"

/** Desativado: e-mails "Como foi sua semana de treinos?" */
export async function GET() {
  return NextResponse.json(
    { ok: false, disabled: true, message: "weekly-reminder desativado" },
    { status: 410 },
  )
}

export async function POST() {
  return GET()
}
