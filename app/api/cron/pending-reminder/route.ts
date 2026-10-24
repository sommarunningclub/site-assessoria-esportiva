import { NextResponse } from "next/server"

/** Desativado: lembrete pendente do feedback semanal */
export async function GET() {
  return NextResponse.json(
    { ok: false, disabled: true, message: "pending-reminder desativado" },
    { status: 410 },
  )
}

export async function POST() {
  return GET()
}
