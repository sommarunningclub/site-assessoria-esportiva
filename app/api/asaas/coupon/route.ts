import { NextResponse } from "next/server"

// Cupons válidos - você pode gerenciar isso via banco de dados ou painel admin
// Por enquanto, está definido diretamente no código para facilitar
const VALID_COUPONS: Record<string, {
  code: string
  discount: number
  type: "PERCENTAGE" | "FIXED"
  description: string
  active: boolean
  expiresAt?: Date
  maxUses?: number
  currentUses?: number
}> = {
  "SOMMA10": {
    code: "SOMMA10",
    discount: 10,
    type: "PERCENTAGE",
    description: "10% de desconto",
    active: true,
  },
  "SOMMA20": {
    code: "SOMMA20",
    discount: 20,
    type: "PERCENTAGE",
    description: "20% de desconto",
    active: true,
  },
  "DESCONTO50": {
    code: "DESCONTO50",
    discount: 50,
    type: "FIXED",
    description: "R$ 50,00 de desconto",
    active: true,
  },
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { valid: false, error: "Código do cupom não informado" },
        { status: 400 }
      )
    }

    const couponCode = code.toUpperCase().trim()
    const coupon = VALID_COUPONS[couponCode]

    if (!coupon) {
      return NextResponse.json(
        { valid: false, error: "Cupom inválido" },
        { status: 400 }
      )
    }

    if (!coupon.active) {
      return NextResponse.json(
        { valid: false, error: "Este cupom está inativo" },
        { status: 400 }
      )
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json(
        { valid: false, error: "Este cupom expirou" },
        { status: 400 }
      )
    }

    if (coupon.maxUses && coupon.currentUses && coupon.currentUses >= coupon.maxUses) {
      return NextResponse.json(
        { valid: false, error: "Este cupom atingiu o limite de uso" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount: coupon.discount,
      type: coupon.type,
      description: coupon.description,
    })
  } catch (error) {
    console.error("[Coupon] Error validating coupon:", error)
    return NextResponse.json(
      { valid: false, error: "Erro ao validar cupom" },
      { status: 500 }
    )
  }
}
