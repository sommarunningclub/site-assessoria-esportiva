import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    console.log("[v0] Testing database connection...")

    // Teste 1: Listar todas as tabelas
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")

    console.log("[v0] Tables error:", tablesError)
    console.log("[v0] Tables found:", tables ? "yes" : "no")

    // Teste 2: Tentar buscar da tabela com hífens
    const { data: data1, error: error1 } = await supabase
      .from("gestao-clientes-assessoria")
      .select("id, cpf, nome")
      .limit(1)

    console.log("[v0] Query com hífen - error:", error1 ? error1.message : "none")
    console.log("[v0] Query com hífen - data:", data1 ? "found" : "empty")

    // Teste 3: Tentar com underline
    const { data: data2, error: error2 } = await supabase
      .from("gestao_clientes_assessoria")
      .select("id, cpf, nome")
      .limit(1)

    console.log("[v0] Query com underscore - error:", error2 ? error2.message : "none")
    console.log("[v0] Query com underscore - data:", data2 ? "found" : "empty")

    // Teste 4: Raw query
    const { data: data3, error: error3 } = await supabase.rpc("get_table_names")

    console.log("[v0] RPC test - error:", error3 ? error3.message : "none")

    return NextResponse.json({
      supabase_connected: true,
      tests: {
        test_hyphen: { error: error1?.message, has_data: !!data1 },
        test_underscore: { error: error2?.message, has_data: !!data2 },
      },
    })
  } catch (error) {
    console.error("[v0] Test error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
