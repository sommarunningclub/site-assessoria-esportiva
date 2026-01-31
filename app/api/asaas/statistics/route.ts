import { NextResponse } from "next/server"

const ASAAS_API_KEY = process.env.ASAAS_API_KEY
const ASAAS_API_URL = "https://api.asaas.com/v3"

async function getPaymentStatistics(status?: string) {
  const url = status
    ? `${ASAAS_API_URL}/finance/payment/statistics?status=${status}`
    : `${ASAAS_API_URL}/finance/payment/statistics`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      access_token: ASAAS_API_KEY || "",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch statistics: ${response.status}`)
  }

  return response.json()
}

async function getPaymentCount(status: string) {
  const url = `${ASAAS_API_URL}/payments?status=${status}&limit=1`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      access_token: ASAAS_API_KEY || "",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch payments: ${response.status}`)
  }

  const data = await response.json()
  return data.totalCount || 0
}

export async function GET() {
  try {
    if (!ASAAS_API_KEY) {
      return NextResponse.json({ error: "ASAAS_API_KEY not configured" }, { status: 500 })
    }

    // Buscar estatísticas em paralelo para cada status
    const [
      receivedStats,
      confirmedStats,
      pendingStats,
      overdueStats,
      receivedCount,
      confirmedCount,
      pendingCount,
      overdueCount,
    ] = await Promise.all([
      getPaymentStatistics("RECEIVED"),
      getPaymentStatistics("CONFIRMED"),
      getPaymentStatistics("PENDING"),
      getPaymentStatistics("OVERDUE"),
      getPaymentCount("RECEIVED"),
      getPaymentCount("CONFIRMED"),
      getPaymentCount("PENDING"),
      getPaymentCount("OVERDUE"),
    ])

    const statistics = {
      received: {
        label: "Recebidas",
        count: receivedCount,
        value: receivedStats.quantity || 0,
        total: receivedStats.value || 0,
        netValue: receivedStats.netValue || 0,
      },
      confirmed: {
        label: "Confirmadas",
        count: confirmedCount,
        value: confirmedStats.quantity || 0,
        total: confirmedStats.value || 0,
        netValue: confirmedStats.netValue || 0,
      },
      pending: {
        label: "Aguardando Pagamento",
        count: pendingCount,
        value: pendingStats.quantity || 0,
        total: pendingStats.value || 0,
        netValue: pendingStats.netValue || 0,
      },
      overdue: {
        label: "Vencidas",
        count: overdueCount,
        value: overdueStats.quantity || 0,
        total: overdueStats.value || 0,
        netValue: overdueStats.netValue || 0,
      },
    }

    return NextResponse.json(statistics)
  } catch (error) {
    console.error("Error fetching Asaas statistics:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
