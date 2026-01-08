import { type NextRequest, NextResponse } from "next/server"

// Cupons válidos - pode ser movido para banco de dados futuramente
const VALID_COUPONS: Record<string, { discount: number; type: "PERCENTAGE" | "FIXED"; description: string }> = {
  SOMMA10: {
    discount: 10,
    type: "PERCENTAGE",
    description: "10% de desconto na primeira mensalidade",
  },
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Código do cupom é obrigatório" }, { status: 400 })
    }

    const coupon = VALID_COUPONS[code.toUpperCase()]

    if (!coupon) {
      return NextResponse.json({ error: "Cupom inválido ou expirado" }, { status: 404 })
    }

    return NextResponse.json({
      valid: true,
      code: code.toUpperCase(),
      discount: coupon.discount,
      type: coupon.type,
      description: coupon.description,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao validar cupom" }, { status: 500 })
  }
}
