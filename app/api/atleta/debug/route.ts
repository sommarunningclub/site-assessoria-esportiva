import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Listar todas as tabelas disponíveis
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")

    if (tablesError) {
      console.error("[v0] Erro ao listar tabelas:", String(tablesError).substring(0, 100))
    }

    // Tentar buscar com hífens
    const result1 = await supabase
      .from("gestao-clientes-assessoria")
      .select("*")
      .limit(1)

    // Tentar buscar com underscores
    const result2 = await supabase
      .from("gestao_clientes_assessoria")
      .select("*")
      .limit(1)

    return NextResponse.json({
      message: "Diagnóstico de conexão",
      tables: tables || [],
      "gestao-clientes-assessoria": {
        error: result1.error ? String(result1.error).substring(0, 100) : null,
        found: result1.data && result1.data.length > 0,
      },
      "gestao_clientes_assessoria": {
        error: result2.error ? String(result2.error).substring(0, 100) : null,
        found: result2.data && result2.data.length > 0,
      },
    })
  } catch (error) {
    return NextResponse.json({
      error: "Erro ao diagnosticar",
      message: error instanceof Error ? error.message : "unknown",
    })
  }
}
