import { NextResponse } from "next/server"

const ASAAS_API_KEY = process.env.ASAAS_API_KEY
const ASAAS_API_URL = "https://api.asaas.com/v3"

export async function GET() {
  try {
    // Log para verificar se a chave está configurada
    console.log("[v0] ASAAS_API_KEY configured:", !!ASAAS_API_KEY)
    console.log("[v0] ASAAS_API_KEY length:", ASAAS_API_KEY?.length || 0)

    if (!ASAAS_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "ASAAS_API_KEY não configurada",
          configured: false,
        },
        { status: 500 },
      )
    }

    // Testar conexão com a API do Asaas buscando informações da conta
    const response = await fetch(`${ASAAS_API_URL}/finance/balance`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY,
      },
    })

    console.log("[v0] Asaas API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] Asaas API error:", errorText)
      return NextResponse.json(
        {
          success: false,
          error: `Erro na API: ${response.status}`,
          details: errorText,
          configured: true,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("[v0] Asaas API balance data:", data)

    return NextResponse.json({
      success: true,
      message: "Conexão com Asaas funcionando!",
      configured: true,
      balance: data,
    })
  } catch (error) {
    console.error("[v0] Error testing Asaas connection:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        configured: !!ASAAS_API_KEY,
      },
      { status: 500 },
    )
  }
}
