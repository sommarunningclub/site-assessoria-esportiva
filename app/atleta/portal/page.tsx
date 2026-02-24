"use client"

import { useEffect, useState } from "react"
import { LogOut, User, Calendar, Award, Users, Headset, Target, Link as LinkIcon } from "lucide-react"
import { useRouter } from "next/navigation"

interface AthleteData {
  id: string
  name: string
  cpf: string
  email: string
  subscription_status: string
  subscription_plan: string
}

interface Benefit {
  id: string
  name: string
  description: string
  icon: string
  category: string
  activated: boolean
}

const ICON_MAP: Record<string, React.ReactNode> = {
  app: <LinkIcon className="w-8 h-8" />,
  chart: <Award className="w-8 h-8" />,
  users: <Users className="w-8 h-8" />,
  headset: <Headset className="w-8 h-8" />,
  target: <Target className="w-8 h-8" />,
  link: <LinkIcon className="w-8 h-8" />,
  apple: <Award className="w-8 h-8" />,
  calendar: <Calendar className="w-8 h-8" />,
}

export default function AtletaPortal() {
  const router = useRouter()
  const [athlete, setAthlete] = useState<AthleteData | null>(null)
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/atleta/profile")
        if (!response.ok) {
          router.push("/atleta")
          return
        }

        const data = await response.json()
        setAthlete(data.athlete)
        setBenefits(data.benefits || [])
      } catch (error) {
        console.error("[v0] Auth check error:", error)
        router.push("/atleta")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await fetch("/api/atleta/logout", { method: "POST" })
    router.push("/atleta")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-zinc-800 border-t-[#ff4f2d] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Carregando portal...</p>
        </div>
      </div>
    )
  }

  if (!athlete) {
    return null
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-light">Bem-vindo, {athlete.name}!</h1>
            <p className="text-sm text-zinc-400 mt-1">Portal Atleta Somma</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </header>

      {/* Profile Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#ff4f2d] to-orange-600 rounded-lg flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-light text-white">{athlete.name}</h2>
              <p className="text-sm text-zinc-400 mt-1">CPF: {athlete.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}</p>
              {athlete.email && <p className="text-sm text-zinc-400">{athlete.email}</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-xs text-zinc-500 mb-1">Status da Assinatura</p>
              <p className="text-lg font-medium capitalize">
                {athlete.subscription_status === "active" ? (
                  <span className="text-green-400">Ativo</span>
                ) : (
                  <span className="text-red-400">Inativo</span>
                )}
              </p>
            </div>

            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-xs text-zinc-500 mb-1">Plano</p>
              <p className="text-lg font-medium capitalize">{athlete.subscription_plan || "—"}</p>
            </div>

            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-xs text-zinc-500 mb-1">Benefícios Ativos</p>
              <p className="text-lg font-medium">{benefits.filter((b) => b.activated).length} de {benefits.length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <h3 className="text-2xl font-light mb-6">Meus Benefícios</h3>

        {benefits.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
            <p className="text-zinc-400">Nenhum benefício disponível no momento.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.id}
                className={`rounded-lg p-6 border transition-all ${
                  benefit.activated
                    ? "bg-zinc-900 border-zinc-700 hover:border-zinc-600"
                    : "bg-zinc-950 border-zinc-800 opacity-50"
                }`}
              >
                <div className="text-[#ff4f2d] mb-3">{ICON_MAP[benefit.icon] || <Award className="w-8 h-8" />}</div>
                <h4 className="font-medium text-white mb-2">{benefit.name}</h4>
                <p className="text-xs text-zinc-400 mb-3">{benefit.description}</p>
                {benefit.activated ? (
                  <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">
                    Ativo
                  </span>
                ) : (
                  <span className="inline-block px-2 py-1 bg-zinc-700/50 text-zinc-400 text-xs font-medium rounded">
                    Inativo
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-16 border-t border-zinc-800 py-8 px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-zinc-400">
          <p>© 2025 Assessoria Somma Club | Portal do Atleta</p>
        </div>
      </footer>
    </main>
  )
}
