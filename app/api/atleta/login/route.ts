import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cpf } = body

    if (!cpf) {
      return NextResponse.json({ error: "CPF é obrigatório" }, { status: 400 })
    }

    const cleanCPF = cpf.replace(/\D/g, "")
    if (cleanCPF.length !== 11) {
      return NextResponse.json({ error: "CPF inválido" }, { status: 400 })
    }

    const supabase = await createClient()

    console.log("[v0] Buscando CPF:", cleanCPF)

    // Buscar atleta na tabela "gestao-clientes-assessoria" pelo CPF
    const { data: athlete, error: fetchError } = await supabase
      .from("gestao-clientes-assessoria")
      .select("*")
      .eq("cpf", cleanCPF)
      .maybeSingle()

    if (fetchError) {
      console.error("[v0] Supabase error:", fetchError?.message || "Unknown error")
      return NextResponse.json({ error: "Erro ao buscar CPF. Tente novamente." }, { status: 500 })
    }

    if (!athlete) {
      console.log("[v0] CPF não encontrado:", cleanCPF)
      return NextResponse.json({ error: "CPF não encontrado. Verifique e tente novamente." }, { status: 401 })
    }

    console.log("[v0] Atleta encontrado")

    // Criar session token
    const sessionToken = crypto.randomBytes(32).toString("hex")

    // Criar response com cookie de sessão
    const response = NextResponse.json({
      success: true,
      athlete: {
        id: athlete.id,
        name: athlete.nome,
        cpf: cleanCPF,
        email: athlete.email,
        subscription_status: athlete.status_assinatura,
        subscription_plan: athlete.plano_assinatura,
      },
    })

    // Adicionar cookie seguro com token de sessão
    response.cookies.set("atleta_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 dias
      path: "/",
    })

    response.cookies.set("atleta_id", athlete.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    })

    return response
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[v0] Login error:", errorMessage)
    return NextResponse.json({ error: "Erro ao processar login" }, { status: 500 })
  }
}
