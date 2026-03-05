"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { CheckoutModal } from "./checkout-modal"
import { PasswordProtectionModal } from "./password-protection-modal"

const benefits = [
  { name: "Presença VIP nas provas Somma", assessoria: true },
  { name: "Estrutura Somma em eventos", assessoria: true },
  { name: "Descontos em parceiros Somma", assessoria: true },
  { name: "Track&Field", assessoria: true },
  { name: "Tex Barbearia", assessoria: true },
  { name: "Dopahmina", assessoria: true, link: "https://www.instagram.com/dopahmina/" },
  { name: "Academia Evolve", assessoria: true, link: "https://academiaevolve.com.br/" },
  { name: "Bugu Delicias", assessoria: true, link: "https://www.instagram.com/bugu_delicias/" },
  { name: "Marcas de suplementos", assessoria: true },
  { name: "Sorteios mensais", assessoria: true },
  { name: "Encontros mensais exclusivos", assessoria: true },
  { name: "Corridas temáticas nos encontros", assessoria: true },
  { name: "Palestras e experiências nos encontros", assessoria: true },
  { name: "Treinamento personalizado via app", assessoria: true },
  { name: "Integração com Strava e relógios GPS", assessoria: true },
  { name: "Acompanhamento de métricas de performance", assessoria: true },
  { name: "Camiseta oficial de membro (semestral/anual)", assessoria: "Sim" },
  { name: "Camiseta exclusiva da Assessoria", assessoria: true },
  { name: "Desconto para camisetas extras", assessoria: "50%" },
]

export function PricingPlans() {
  const [assessoriaPeriod, setAssessoriaPeriod] = useState<"mensal" | "semestral" | "anual">("semestral")

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
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
    setIsPasswordOpen(true)

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
      cycle: "MONTHLY",
    })
  }

  const handlePasswordSuccess = () => {
    setIsPasswordOpen(false)
    setIsCheckoutOpen(true)
  }

  const renderBenefitValue = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff4f2d] mx-auto" />
      ) : (
        <X className="w-4 h-4 sm:w-5 sm:h-5 text-white/20 mx-auto" />
      )
    }
    return <span className="text-xs md:text-sm text-white/70 text-center block">{value}</span>
  }

  return (
    <div className="space-y-12">
      {/* Plan Card */}
      <div className="relative border border-white/10 bg-white/5 p-6 sm:p-8 md:p-12">
        <div className="mb-8">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-white mb-2">Somma Assessoria</h3>
          <p className="text-xs sm:text-sm text-white/60">
            Treinamento completo e acompanhamento personalizado
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-8 bg-white/5 p-1 border border-white/10">
          {(["mensal", "semestral", "anual"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setAssessoriaPeriod(period)}
              className={`flex-1 py-2 px-3 text-xs sm:text-sm font-light transition-colors ${
                assessoriaPeriod === period ? "bg-[#ff4f2d] text-black" : "text-white/60 hover:text-white"
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

        {/* Price Display */}
        <div className="mb-8 pb-8 border-b border-white/10">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl sm:text-5xl md:text-6xl font-light text-white">
              R$ {assessoriaPrices[assessoriaPeriod].price.toFixed(2).replace(".", ",")}
            </span>
            <span className="text-white/60 text-sm sm:text-base">/mês</span>
          </div>

          {assessoriaPeriod !== "mensal" && (
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-white/60">
                Total: <span className="text-white font-light">R$ {assessoriaPrices[assessoriaPeriod].total.toFixed(2).replace(".", ",")}</span>
              </p>
              <p className="text-xs text-[#ff4f2d]">
                {assessoriaPrices[assessoriaPeriod].description}
              </p>
            </div>
          )}

          {assessoriaPeriod === "mensal" && (
            <p className="text-xs text-white/50 mt-2">
              {assessoriaPrices[assessoriaPeriod].description}
            </p>
          )}

          {assessoriaPrices[assessoriaPeriod].savings && (
            <p className="text-xs text-[#ff4f2d] mt-2">
              {assessoriaPrices[assessoriaPeriod].savings}
            </p>
          )}
        </div>

        <button
          onClick={() => handleSubscribe("Somma Assessoria", assessoriaPeriod)}
          className="w-full py-3 md:py-4 px-4 bg-[#ff4f2d] text-black hover:bg-[#ff6647] transition-colors text-sm sm:text-base font-light"
        >
          Assinar Agora
        </button>
      </div>

      {/* Benefits Table */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="border border-white/10 divide-y divide-white/10">
            <div className="grid grid-cols-[2fr_1fr] bg-white/5">
              <div className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-light text-white">Benefícios</div>
              <div className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-light text-white text-center">Incluído</div>
            </div>

            {benefits.map((benefit, index) => (
              <div key={index} className="grid grid-cols-[2fr_1fr] hover:bg-white/[0.02] transition-colors">
                <div className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-white/70 font-light">
                  {benefit.link ? (
                    <a href={benefit.link} target="_blank" rel="noopener noreferrer" className="hover:text-[#ff4f2d] transition-colors underline">
                      {benefit.name}
                    </a>
                  ) : (
                    <span>{benefit.name}</span>
                  )}
                </div>
                <div className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                  {renderBenefitValue(benefit.assessoria)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedPlan && (
        <>
          <PasswordProtectionModal
            isOpen={isPasswordOpen}
            onClose={() => setIsPasswordOpen(false)}
            onSuccess={handlePasswordSuccess}
          />
          <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} plan={selectedPlan} />
        </>
      )}
    </div>
  )
}
