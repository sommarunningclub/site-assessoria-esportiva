import { type NextRequest, NextResponse } from "next/server"

const ASAAS_API_URL = "https://api-sandbox.asaas.com/v3"
const ASAAS_API_KEY = process.env.ASAAS_API_KEY

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, billingType, value, cycle, description, creditCard, creditCardHolderInfo, remoteIp } = body

    // Calcular próxima data de vencimento
    const nextDueDate = new Date()
    nextDueDate.setDate(nextDueDate.getDate() + 1)
    const formattedDate = nextDueDate.toISOString().split("T")[0]

    const subscriptionData: any = {
      customer: customerId,
      billingType,
      value,
      cycle,
      description,
      nextDueDate: formattedDate,
    }

    // Se for cartão de crédito, adicionar dados do cartão
    if (billingType === "CREDIT_CARD" && creditCard) {
      subscriptionData.creditCard = creditCard
      subscriptionData.creditCardHolderInfo = creditCardHolderInfo
      subscriptionData.remoteIp = remoteIp
    }

    const response = await fetch(`${ASAAS_API_URL}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY || "",
      },
      body: JSON.stringify(subscriptionData),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[Asaas] Error creating subscription:", data)
      return NextResponse.json(
        { error: data.errors?.[0]?.description || "Erro ao criar assinatura" },
        { status: response.status },
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[Asaas] Error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
