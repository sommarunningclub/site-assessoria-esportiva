import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    // Verificar se existe sessão válida
    const athleteId = request.cookies.get("atleta_id")?.value

    if (!athleteId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const supabase = await createClient()

    // Buscar dados do atleta
    const { data: athlete, error: athleteError } = await supabase
      .from("athletes")
      .select("id, name, cpf, email, subscription_status, subscription_plan")
      .eq("id", athleteId)
      .single()

    if (athleteError || !athlete) {
      return NextResponse.json({ error: "Atleta não encontrado" }, { status: 404 })
    }

    // Buscar benefícios do atleta
    const { data: athleteBenefits, error: benefitsError } = await supabase
      .from("athlete_benefits")
      .select(
        `
        id,
        benefit_id,
        activated_at,
        expires_at,
        benefits:benefit_id (
          id,
          name,
          description,
          icon,
          category
        )
      `
      )
      .eq("athlete_id", athleteId)

    if (benefitsError) {
      console.error("[v0] Benefits fetch error:", benefitsError)
    }

    // Formatar benefícios
    const benefits = athleteBenefits?.map((ab: any) => ({
      id: ab.benefits.id,
      name: ab.benefits.name,
      description: ab.benefits.description,
      icon: ab.benefits.icon,
      category: ab.benefits.category,
      activated: true,
      activated_at: ab.activated_at,
      expires_at: ab.expires_at,
    })) || []

    return NextResponse.json({
      athlete: {
        ...athlete,
        cpf: athlete.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"),
      },
      benefits,
    })
  } catch (error) {
    console.error("[v0] Profile error:", error)
    return NextResponse.json({ error: "Erro ao buscar perfil" }, { status: 500 })
  }
}
