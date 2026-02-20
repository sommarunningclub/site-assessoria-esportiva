"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import Image from "next/image"
import { CheckoutModal } from "./checkout-modal"

const benefits = [
  { name: "Presença VIP nas provas Somma", membership: true, assessoria: true },
  { name: "Estrutura Somma em eventos", membership: true, assessoria: true },
  { name: "Descontos em parceiros Somma", membership: true, assessoria: true },
  { name: "Track&Field", membership: true, assessoria: true },
  { name: "Tex Barbearia", membership: true, assessoria: true },
  {
    name: "Dopahmina",
    membership: true,
    assessoria: true,
    logo: "/partners/dopahmina.png",
    link: "https://www.instagram.com/dopahmina/",
  },
  { name: "Academia Evolve", membership: true, assessoria: true, link: "https://academiaevolve.com.br/" },
  { name: "Bugu Delicias", membership: true, assessoria: true, link: "https://www.instagram.com/bugu_delicias/" },
  { name: "Marcas de suplementos", membership: true, assessoria: true },
  { name: "Sorteios mensais", membership: true, assessoria: true },
  { name: "Encontros mensais exclusivos", membership: true, assessoria: true },
  { name: "Corridas temáticas nos encontros", membership: true, assessoria: true },
  { name: "Palestras e experiências nos encontros", membership: true, assessoria: true },
  { name: "Treinamento personalizado via app", membership: false, assessoria: true },
  { name: "Integração com Strava e relógios GPS", membership: false, assessoria: true },
  { name: "Acompanhamento de métricas de performance", membership: false, assessoria: true },
  { name: "Camiseta oficial de membro", membership: "Semestral e anual", assessoria: "Semestral e anual" },
  { name: "Camiseta exclusiva da Assessoria", membership: false, assessoria: true },
  { name: "Desconto para camisetas extras", membership: "50%", assessoria: false },
]

export function PricingPlans() {
  const [membershipPeriod, setMembershipPeriod] = useState<"mensal" | "semestral" | "anual">("semestral")
  const [assessoriaPeriod, setAssessoriaPeriod] = useState<"mensal" | "semestral" | "anual">("semestral")

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{
    name: string
    period: string
    price: number
    totalPrice: number
    installments: number
    cycle: "MONTHLY"
  } | null>(null)

  const assessoriaPrices = {
    mensal: { price: 220, total: 220, installments: 1, savings: null, description: "Cobrança mensal recorrente" },
    semestral: { price: 200, total: 1200, installments: 6, savings: "R$ 120 de economia", description: "6x R$ 200,00 sem juros" },
    anual: { price: 180, total: 2160, installments: 12, savings: "R$ 480 de economia", description: "12x R$ 180,00 sem juros" },
  }

  const handleSubscribe = (planName: string, period: "mensal" | "semestral" | "anual") => {
    const periodLabels = {
      mensal: "Mensal",
      semestral: "Semestral",
      anual: "Anual",
    }
    
    const priceData = assessoriaPrices[period]

    setSelectedPlan({
      name: planName,
      period: periodLabels[period],
      price: priceData.price,
      totalPrice: priceData.total,
      installments: priceData.installments,
      cycle: "MONTHLY", // Sempre MONTHLY - cobrança mensal recorrente
    })
    setIsCheckoutOpen(true)
  }

  const renderBenefitValue = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff4f2d] mx-auto" />
      ) : (
        <X className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-600 mx-auto" />
      )
    }
    return <span className="text-[10px] sm:text-xs md:text-sm text-zinc-300 text-center block">{value}</span>
  }

  return (
    <div className="space-y-8 sm:space-y-12 md:space-y-16">
      {/* Plans Cards */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 w-full">
        {/* Somma Assessoria Card */}
        <div className="relative rounded-xl sm:rounded-2xl border border-[#ff4f2d]/50 bg-zinc-950/50 p-4 sm:p-6 md:p-8 hover:border-[#ff4f2d] transition-colors w-full">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="px-3 sm:px-4 py-0.5 sm:py-1 bg-[#ff4f2d] text-black text-[10px] sm:text-xs font-bold rounded-full whitespace-nowrap">
              PLANO PRINCIPAL
            </span>
          </div>

          <div className="mb-6 sm:mb-8 mt-2 sm:mt-0">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-light text-white mb-1 sm:mb-2">Somma Assessoria</h3>
            <p className="text-xs sm:text-sm md:text-base text-zinc-400">
              Treinamento completo e acompanhamento personalizado
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 bg-zinc-900/50 p-1 rounded-lg">
            {(["mensal", "semestral", "anual"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setAssessoriaPeriod(period)}
                className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded text-[10px] sm:text-xs md:text-sm font-light transition-colors ${
                  assessoriaPeriod === period ? "bg-[#ff4f2d] text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>

          {/* Price Display */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="text-3xl sm:text-4xl md:text-5xl font-light text-white">
                R$ {assessoriaPrices[assessoriaPeriod].price.toFixed(2).replace(".", ",")}
              </span>
              <span className="text-zinc-400 text-sm sm:text-base">/mês</span>
            </div>
            {/* Total e parcelas */}
            {assessoriaPeriod !== "mensal" && (
              <div className="mt-2">
                <p className="text-sm text-zinc-400">
                  Total: <span className="text-white font-medium">R$ {assessoriaPrices[assessoriaPeriod].total.toFixed(2).replace(".", ",")}</span>
                </p>
                <p className="text-xs text-[#ff4f2d]">
                  {assessoriaPrices[assessoriaPeriod].description}
                </p>
              </div>
            )}
            {assessoriaPeriod === "mensal" && (
              <p className="text-xs text-zinc-500 mt-2">
                {assessoriaPrices[assessoriaPeriod].description}
              </p>
            )}
            {assessoriaPrices[assessoriaPeriod].savings && (
              <p className="text-xs text-green-500 mt-1">
                {assessoriaPrices[assessoriaPeriod].savings}
              </p>
            )}
          </div>

          <button
            onClick={() => handleSubscribe("Somma Assessoria", assessoriaPeriod)}
            className="w-full py-2.5 sm:py-3 md:py-4 px-4 rounded-lg bg-[#ff4f2d] text-black font-light hover:bg-[#ff6647] transition-colors text-sm sm:text-base"
          >
            Assinar Agora
          </button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="min-w-[500px] sm:min-w-full">
          <div className="overflow-hidden rounded-lg sm:rounded-xl border border-zinc-800">
            <table className="w-full divide-y divide-zinc-800">
              <thead className="bg-zinc-900/50">
                <tr>
                  <th
                    scope="col"
                    className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm md:text-base font-light text-white sticky left-0 bg-zinc-900/50 z-10"
                  >
                    Benefícios
                  </th>
                  <th
                    scope="col"
                    className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm md:text-base font-light text-white min-w-[100px] sm:min-w-[140px]"
                  >
                    <span className="hidden sm:inline">Somma </span>Assessoria
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 bg-zinc-950/50">
                {benefits.map((benefit, index) => (
                  <tr key={index} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-[11px] sm:text-xs md:text-sm text-zinc-300 font-light sticky left-0 bg-zinc-950/50 z-10">
                      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                        {benefit.link ? (
                          <a
                            href={benefit.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[#ff4f2d] transition-colors underline underline-offset-2"
                          >
                            {benefit.name}
                          </a>
                        ) : (
                          <span>{benefit.name}</span>
                        )}
                        {benefit.logo && (
                          <Image
                            src={benefit.logo || "/placeholder.svg"}
                            alt={`${benefit.name} logo`}
                            width={24}
                            height={24}
                            className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 object-contain rounded-full flex-shrink-0"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-center">
                      {renderBenefitValue(benefit.assessoria)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedPlan && (
        <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} plan={selectedPlan} />
      )}
    </div>
  )
}
