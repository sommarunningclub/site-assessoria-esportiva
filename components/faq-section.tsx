"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "Quanto tempo dura a Assessoria? Tem fidelidade?",
    answer:
      "A Assessoria Somma tem a duração do plano que você escolher: mensal, semestral ou anual. Não há fidelidade. Você tem liberdade para permanecer na assessoria pelo tempo que fizer sentido para seus objetivos.",
  },
  {
    question: "Como funciona o planejamento de treinos?",
    answer:
      "Após a confirmação da sua assinatura, você receberá acesso ao aplicativo de treinamento onde seu plano personalizado será disponibilizado semanalmente. O planejamento é feito com base no seu nível atual, objetivos e disponibilidade de treino, com ajustes conforme sua evolução.",
  },
  {
    question: "Quais são as formas de pagamento? É seguro?",
    answer:
      "Aceitamos pagamentos via Cartão de Crédito (com parcelamento nos planos semestrais e anuais). Todo o processo é seguro e protegido, garantindo total proteção aos seus dados.",
  },
  {
    question: "Como funciona a garantia e o cancelamento?",
    answer:
      "Ao assinar a Assessoria Somma, você tem 7 dias de garantia incondicional. Se não estiver satisfeito nesse período, pode solicitar cancelamento e reembolso total. Após os 7 dias, você pode cancelar a qualquer momento, e seu acesso continuará ativo pelo período já pago.",
  },
  {
    question: "A assinatura renova automaticamente?",
    answer:
      "Sim. A renovação é automática ao final do período contratado para garantir continuidade no seu treinamento. Caso não deseje renovar, basta cancelar antes da data de renovação.",
  },
  {
    question: "Preciso de equipamentos especiais?",
    answer:
      "Para aproveitar ao máximo a Assessoria, recomendamos o uso de um relógio GPS ou smartphone com app de corrida (como Strava) para registro dos treinos. Isso permite acompanhamento preciso das métricas e ajustes mais eficientes no planejamento.",
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="relative z-20 py-12 sm:py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light mb-4 sm:mb-6 text-balance">
            Perguntas Frequentes
          </h2>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-400 mb-8 sm:mb-12 md:mb-16 leading-relaxed">
            Tire suas dúvidas sobre a Assessoria Somma e entenda como funciona o treinamento personalizado e
            acompanhamento profissional.
          </p>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-zinc-800 rounded-lg overflow-hidden transition-all duration-300 hover:border-zinc-700"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-4 sm:px-6 py-4 sm:py-5 md:py-6 flex items-start justify-between gap-3 sm:gap-4 hover:bg-zinc-950/50 transition-colors text-left"
                >
                  <span className="text-sm sm:text-base md:text-lg font-light text-white text-balance pr-2 sm:pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 flex-shrink-0 transition-transform duration-300 mt-0.5 sm:mt-1 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openIndex === index && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-zinc-800 bg-zinc-950/30">
                    <p className="text-zinc-300 text-sm sm:text-base md:text-lg font-light leading-relaxed pt-4">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
