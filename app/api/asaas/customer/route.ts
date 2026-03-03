import { type NextRequest, NextResponse } from "next/server"

const ASAAS_API_URL = "https://api.asaas.com/v3"
const ASAAS_API_KEY = process.env.ASAAS_API_KEY

export async function POST(request: NextRequest) {
  try {
    // Validar que a chave de API está configurada
    if (!ASAAS_API_KEY) {
      console.error("[Asaas] ASAAS_API_KEY não está configurada")
      return NextResponse.json(
        { error: "Chave de API do ASAAS não configurada" },
        { status: 500 },
      )
    }

    const body = await request.json()
    const { name, email, cpfCnpj, phone, postalCode, addressNumber } = body

    console.log("[Asaas] Criando cliente:", { name, email, cpfCnpj: cpfCnpj?.replace(/\D/g, "") })

    // Criar cliente no Asaas
    const response = await fetch(`${ASAAS_API_URL}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY,
      },
      body: JSON.stringify({
        name,
        email,
        cpfCnpj: cpfCnpj.replace(/\D/g, ""),
        phone: phone?.replace(/\D/g, ""),
        postalCode: postalCode?.replace(/\D/g, ""),
        addressNumber,
        notificationDisabled: false,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[Asaas] Error creating customer:", data)
      return NextResponse.json(
        { error: data.errors?.[0]?.description || "Erro ao criar cliente" },
        { status: response.status },
      )
    }

    console.log("[Asaas] Cliente criado com sucesso:", data.id)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Asaas] Error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
