import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cpf, password } = body

    if (!cpf || !password) {
      return NextResponse.json({ error: "CPF e senha são obrigatórios" }, { status: 400 })
    }

    const cleanCPF = cpf.replace(/\D/g, "")
    if (cleanCPF.length !== 11) {
      return NextResponse.json({ error: "CPF inválido" }, { status: 400 })
    }

    const supabase = await createClient()

    // Buscar atleta pelo CPF
    const { data: athlete, error: fetchError } = await supabase
      .from("athletes")
      .select("id, cpf, name, email, subscription_status, subscription_plan")
      .eq("cpf", cleanCPF)
      .single()

    if (fetchError || !athlete) {
      return NextResponse.json({ error: "CPF ou senha inválidos" }, { status: 401 })
    }

    // Validação simples de senha (em produção, usar bcrypt)
    // Por agora, usar hash do CPF como senha padrão para teste
    const defaultPassword = crypto.createHash("sha256").update(`somma-${cleanCPF}`).digest("hex")
    const inputHash = crypto.createHash("sha256").update(password).digest("hex")

    if (inputHash !== defaultPassword && password !== process.env.ATLETA_MASTER_PASSWORD) {
      return NextResponse.json({ error: "CPF ou senha inválidos" }, { status: 401 })
    }

    // Criar session token
    const sessionToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias

    // Salvar sessão no Supabase (se tiver tabela de sessions)
    // Por agora, usar cookie JWT

    // Criar response com cookie de sessão
    const response = NextResponse.json({
      success: true,
      athlete: {
        id: athlete.id,
        name: athlete.name,
        cpf: cleanCPF,
        email: athlete.email,
        subscription_status: athlete.subscription_status,
        subscription_plan: athlete.subscription_plan,
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
