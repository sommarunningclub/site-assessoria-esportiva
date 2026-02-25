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

    // Buscar atleta na tabela "gestao-clientes-assessoria" pelo CPF
    const { data: athlete, error: fetchError } = await supabase
      .from("gestao-clientes-assessoria")
      .select("id, cpf, nome, email, status_assinatura, plano_assinatura")
      .eq("cpf", cleanCPF)
      .single()

    if (fetchError || !athlete) {
      console.error("[v0] CPF not found or error:", fetchError)
      return NextResponse.json({ error: "CPF não encontrado. Verifique e tente novamente." }, { status: 401 })
    }

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
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Erro ao processar login" }, { status: 500 })
  }
}
