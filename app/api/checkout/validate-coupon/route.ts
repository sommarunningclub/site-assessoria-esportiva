import { NextResponse } from "next/server"

// Cupons cadastrados - edite aqui para adicionar/remover cupons
const COUPONS: Record<string, { type: "PERCENTAGE" | "FIXED"; value: number; description: string; active: boolean }> = {
  "SOMMA10": { type: "PERCENTAGE", value: 10, description: "10% de desconto", active: true },
  "SOMMA20": { type: "PERCENTAGE", value: 20, description: "20% de desconto", active: true },
  "SOMMA50": { type: "FIXED", value: 50, description: "R$ 50,00 de desconto", active: true },
  "PRIMEIRACOMPRA": { type: "PERCENTAGE", value: 15, description: "15% na primeira compra", active: true },
  "SOMMA99": { type: "PERCENTAGE", value: 99, description: "99% de desconto", active: true },
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")?.toUpperCase().trim()
    const valueParam = searchParams.get("value")
    const value = valueParam ? parseFloat(valueParam) : 0

    if (!code) {
      return NextResponse.json(
        { valid: false, error: "Código do cupom não informado" },
        { status: 400 }
      )
    }

    if (!value || value <= 0) {
      return NextResponse.json(
        { valid: false, error: "Valor inválido" },
        { status: 400 }
      )
    }

    const coupon = COUPONS[code]

    if (!coupon) {
      return NextResponse.json(
        { valid: false, error: "Cupom não encontrado" },
        { status: 404 }
      )
    }

    if (!coupon.active) {
      return NextResponse.json(
        { valid: false, error: "Cupom expirado ou inativo" },
        { status: 400 }
      )
    }

    // Calcular desconto
    let discountAmount: number
    if (coupon.type === "PERCENTAGE") {
      discountAmount = value * (coupon.value / 100)
    } else {
      discountAmount = Math.min(coupon.value, value) // Não pode ser maior que o valor total
    }

    const finalValue = Math.max(0, value - discountAmount)

    return NextResponse.json({
      valid: true,
      coupon: {
        code,
        type: coupon.type,
        value: coupon.value,
        description: coupon.description,
      },
      calculation: {
        originalValue: value,
        discount: discountAmount,
        finalValue,
      },
      asaasDiscount: {
        value: discountAmount,
        dueDateLimitDays: 0,
        type: "FIXED",
      },
    })
  } catch (error) {
    console.error("[validate-coupon] Error:", error)
    return NextResponse.json(
      { valid: false, error: "Erro ao validar cupom" },
      { status: 500 }
    )
  }
}
