import { type NextRequest, NextResponse } from "next/server"

const ASAAS_API_URL = "https://api.asaas.com/v3"
const ASAAS_API_KEY = process.env.ASAAS_API_KEY

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, billingType, value, cycle, description, creditCard, creditCardHolderInfo, remoteIp, maxPayments } = body

    // Calcular próxima data de vencimento
    const nextDueDate = new Date()
    nextDueDate.setDate(nextDueDate.getDate() + 1)
    const formattedDate = nextDueDate.toISOString().split("T")[0]

    const subscriptionData: any = {
      customer: customerId,
      billingType,
      value,
      cycle: "MONTHLY", // Sempre MONTHLY - cobrança mensal recorrente
      description,
      nextDueDate: formattedDate,
    }
    
    // Se tiver limite de parcelas (semestral ou anual), definir maxPayments
    if (maxPayments && maxPayments > 1) {
      subscriptionData.maxPayments = maxPayments
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
      
      // Tratar erros específicos de cartão de crédito
      const errorCode = data.errors?.[0]?.code
      let friendlyMessage = "Erro ao criar assinatura"
      
      if (errorCode === "invalid_creditCard" || errorCode === "invalid_creditCardNumber") {
        friendlyMessage = "Pagamento não autorizado, verifique seu cartão."
      } else if (errorCode === "invalid_creditCardHolderInfo") {
        friendlyMessage = "Dados do titular do cartão inválidos."
      } else if (errorCode === "invalid_value") {
        friendlyMessage = "Valor inválido para a assinatura."
      } else if (data.errors?.[0]?.description) {
        friendlyMessage = data.errors[0].description
      }
      
      return NextResponse.json(
        { error: friendlyMessage },
        { status: response.status },
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[Asaas] Error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
