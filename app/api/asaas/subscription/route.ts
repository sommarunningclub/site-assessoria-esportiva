import { type NextRequest, NextResponse } from "next/server"

const ASAAS_API_URL = "https://api.asaas.com/v3"
const ASAAS_API_KEY = process.env.ASAAS_API_KEY

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, billingType, value, cycle, description, creditCard, creditCardHolderInfo, remoteIp, maxPayments } = body

    // PASSO 1: Criar uma cobrança avulsa imediata (payment one-time)
    const today = new Date()
    const formattedToday = today.toISOString().split("T")[0]

    const paymentData = {
      customer: customerId,
      billingType,
      value,
      dueDate: formattedToday, // Data de hoje para cobrar imediatamente
      description: `${description} - Cobrança Imediata`,
      creditCard,
      creditCardHolderInfo,
      remoteIp,
    }

    console.log("[v0] Criando cobrança imediata:", { customerId, value })

    const paymentResponse = await fetch(`${ASAAS_API_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY || "",
      },
      body: JSON.stringify(paymentData),
    })

    const paymentData_response = await paymentResponse.json()

    if (!paymentResponse.ok) {
      console.error("[Asaas] Error creating immediate payment:", paymentData_response)
      
      // Tratar erros específicos de cartão de crédito
      const errorCode = paymentData_response.errors?.[0]?.code
      let friendlyMessage = "Erro ao processar pagamento"
      
      if (errorCode === "invalid_creditCard" || errorCode === "invalid_creditCardNumber") {
        friendlyMessage = "Pagamento não autorizado, verifique seu cartão."
      } else if (errorCode === "invalid_creditCardHolderInfo") {
        friendlyMessage = "Dados do titular do cartão inválidos."
      } else if (errorCode === "invalid_value") {
        friendlyMessage = "Valor inválido para o pagamento."
      } else if (paymentData_response.errors?.[0]?.description) {
        friendlyMessage = paymentData_response.errors[0].description
      }
      
      return NextResponse.json(
        { error: friendlyMessage },
        { status: paymentResponse.status },
      )
    }

    console.log("[v0] Cobrança imediata criada com sucesso:", paymentData_response.id)

    // PASSO 2: Se for assinatura recorrente (mais de 1 parcela), criar a assinatura para os próximos ciclos
    let subscriptionData_response = null

    if (maxPayments && maxPayments > 1) {
      // Agendar próxima cobrança para 30 dias a partir de hoje
      const nextDueDate = new Date()
      nextDueDate.setDate(nextDueDate.getDate() + 30)
      const formattedNextDueDate = nextDueDate.toISOString().split("T")[0]

      const subscriptionData = {
        customer: customerId,
        billingType,
        value,
        cycle: "MONTHLY",
        description: `${description} - Renovação Automática`,
        nextDueDate: formattedNextDueDate,
        maxPayments: maxPayments - 1, // Reduzir em 1 pois já foi cobrado uma vez
        creditCard,
        creditCardHolderInfo,
        remoteIp,
      }

      console.log("[v0] Criando assinatura recorrente:", { maxPayments: subscriptionData.maxPayments, nextDueDate: formattedNextDueDate })

      const subscriptionResponse = await fetch(`${ASAAS_API_URL}/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          access_token: ASAAS_API_KEY || "",
        },
        body: JSON.stringify(subscriptionData),
      })

      subscriptionData_response = await subscriptionResponse.json()

      if (!subscriptionResponse.ok) {
        console.error("[Asaas] Error creating subscription:", subscriptionData_response)
        // Não retorna erro aqui pois o pagamento já foi feito
        // Apenas registra o erro da assinatura
      } else {
        console.log("[v0] Assinatura recorrente criada com sucesso:", subscriptionData_response.id)
      }
    }

    // Retornar dados da cobrança imediata (principal) + assinatura se houver
    return NextResponse.json({
      payment: paymentData_response,
      subscription: subscriptionData_response,
      message: "Pagamento processado com sucesso",
    })
  } catch (error) {
    console.error("[Asaas] Error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
