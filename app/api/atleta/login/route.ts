import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cpf } = body

    if (!cpf) {
      return NextResponse.json({ error: "CPF é obrigatório" }, { status: 400 })
    }

    const cleanCPF = cpf.replace(/\D/g, "")
    console.log("[v0] Login CPF recebido:", cleanCPF)

    if (cleanCPF.length !== 11) {
      return NextResponse.json({ error: "CPF deve conter 11 dígitos" }, { status: 400 })
    }

    const supabase = await createClient()

    // Buscar na tabela gestao-clientes-assessoria
    const { data, error } = await supabase
      .from("gestao-clientes-assessoria")
      .select("id, cpf, nome, email")
      .eq("cpf", cleanCPF)
      .limit(1)

    console.log("[v0] Query result - data:", data ? "encontrado" : "vazio", "error:", error ? "sim" : "não")

    if (error) {
      console.error("[v0] Erro na query:", error.message)
      return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 })
    }

    if (!data || data.length === 0) {
      console.log("[v0] CPF não encontrado na base")
      return NextResponse.json({ error: "CPF não encontrado" }, { status: 401 })
    }

    const athlete = data[0]
    console.log("[v0] CPF encontrado com sucesso")

    // Login bem-sucedido
    const response = NextResponse.json({
      success: true,
      message: "Login realizado com sucesso",
    })

    // Salvar sessão no cookie
    response.cookies.set("atleta_cpf", cleanCPF, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[v0] Login error:", error instanceof Error ? error.message : "unknown")
    return NextResponse.json({ error: "Erro ao processar login" }, { status: 500 })
  }
}
