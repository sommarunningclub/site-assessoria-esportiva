"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CircleArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import Script from "next/script"
import { SubscriptionForm } from "@/components/subscription-form"
import { FAQSection } from "@/components/faq-section"
import { PricingPlans } from "@/components/pricing-plans"

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const viewportHeight = window.innerHeight
      const progress = Math.min(scrollY / viewportHeight, 1)
      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const linesOpacity = 1 - scrollProgress
  const linesScale = 1 - scrollProgress * 0.3

  const scrollToCapabilities = () => {
    const capabilitiesSection = document.getElementById("capabilities")
    if (capabilitiesSection) {
      capabilitiesSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <main className="relative min-h-[200vh] bg-black text-white overflow-hidden">
      <Script
        src="https://unpkg.com/@splinetool/viewer@1.0.17/build/spline-viewer.js"
        type="module"
        strategy="afterInteractive"
      />

      <Navbar />

      <div
        className="fixed inset-0 z-0 w-screen h-screen pointer-events-none transition-all duration-100 hidden sm:block"
        style={{
          opacity: linesOpacity,
          transform: `scale(${linesScale})`,
        }}
      >
        <div className="bg-lines-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="2269"
            height="2108"
            viewBox="0 0 2269 2108"
            fill="none"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            <path
              d="M510.086 0.543457L507.556 840.047C506.058 1337.18 318.091 1803.4 1.875 2094.29"
              stroke="#ff4f2d"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeDasharray="100px 99999px"
              className="animate-line-race-1"
            />
            <path
              d="M929.828 0.543457L927.328 829.877C925.809 1334 737.028 1807.4 418.435 2106"
              stroke="#ff4f2d"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeDasharray="100px 99999px"
              className="animate-line-race-2"
            />
            <path
              d="M1341.9 0.543457L1344.4 829.876C1345.92 1334 1534.7 1807.4 1853.29 2106"
              stroke="#ff4f2d"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeDasharray="100px 99999px"
              className="animate-line-race-3"
            />
            <path
              d="M1758.96 0.543457L1761.49 840.047C1762.99 1337.18 1950.96 1803.4 2267.17 2094.29"
              stroke="#ff4f2d"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeDasharray="100px 99999px"
              className="animate-line-race-4"
            />
            <path
              opacity="0.2"
              d="M929.828 0.543457L927.328 829.877C925.809 1334 737.028 1807.4 418.435 2106"
              stroke="white"
              strokeWidth="1"
              strokeMiterlimit="10"
            />
            <path
              opacity="0.2"
              d="M510.086 0.543457L507.556 840.047C506.058 1337.18 318.091 1803.4 1.875 2094.29"
              stroke="white"
              strokeWidth="1"
              strokeMiterlimit="10"
            />
            <path
              opacity="0.2"
              d="M1758.96 0.543457L1761.49 840.047C1762.99 1337.18 1950.96 1803.4 2267.17 2094.29"
              stroke="white"
              strokeWidth="1"
              strokeMiterlimit="10"
            />
            <path
              opacity="0.2"
              d="M1341.9 0.543457L1344.4 829.876C1345.92 1334 1534.7 1807.4 1853.29 2106"
              stroke="white"
              strokeWidth="1"
              strokeMiterlimit="10"
            />
          </svg>
        </div>
      </div>

      <div
        className="fixed right-0 top-0 w-1/2 h-screen pointer-events-none z-10 hidden lg:block"
        style={{
          opacity: linesOpacity,
          transform: `scale(${linesScale})`,
        }}
      >
        <div className="track">
          <spline-viewer
            url="https://prod.spline.design/ZxKIijKh056svcM5/scene.splinecode"
            className="w-full h-full"
            style={{ position: "sticky", top: "0px", height: "100vh" }}
          />
        </div>
      </div>

      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-12 pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-24 md:pb-32 min-h-screen flex flex-col justify-center">
        <div className="max-w-3xl">
          {/* Status Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-8 md:mb-12 animate-fade-in">
            <div className="relative w-10 sm:w-14 h-5 sm:h-7 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex-shrink-0">
              <div className="absolute right-0.5 sm:right-1 top-0.5 sm:top-1 w-4 sm:w-5 h-4 sm:h-5 bg-white rounded-full transition-transform duration-300" />
            </div>
            <span className="text-xs sm:text-sm text-zinc-300 leading-tight">
              Entre na lista de espera e fiquei por dentro
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-light mb-4 sm:mb-6 md:mb-8 leading-[1.15] sm:leading-[1.1] animate-fade-in text-balance">
            Somma Running Club Membros
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-400 mb-6 sm:mb-8 md:mb-12 animate-fade-in-up animation-delay-200 max-w-xl">
            Grupo Exclusivo de Membros para ajudar na sua performance.
          </p>

          {/* CTA Button */}
          <div className="animate-fade-in-up animation-delay-400">
            <Button
              size="lg"
              onClick={scrollToCapabilities}
              className="group bg-[#ff4f2d] hover:bg-[#ff6647] text-white px-5 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 text-sm sm:text-base rounded-full transition-all duration-[650ms] hover:scale-[1.02] w-full sm:w-auto"
            >
              Inscreva-se
              <CircleArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5 transition-transform duration-[650ms] group-hover:rotate-90" />
            </Button>
          </div>
        </div>
      </div>

      {/* Capabilities section with tabs */}
      <section id="capabilities" className="relative z-20 py-12 sm:py-16 md:py-24">
        <div className="container p-4 sm:p-6 md:p-8 lg:p-12 rounded-xl sm:rounded-2xl z-50 bg-[#09090b] border border-zinc-800 mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light mb-4 sm:mb-6 text-balance">
            Lista VIP Somma Club Membros
          </h2>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-400 mb-6 sm:mb-8 md:mb-12 leading-relaxed">
            Estamos preparando algo especial para a nossa comunidade. O SOMMA Club ainda não está aberto, mas você pode
            garantir seu lugar na lista VIP e ser o primeiro a saber quando as inscrições abrirem com condições
            exclusivas de lançamento.
          </p>

          <Tabs defaultValue="development" className="w-full">
            <TabsList className="bg-zinc-950 border border-zinc-800 p-1 mb-6 sm:mb-8 rounded-full">
              <TabsTrigger
                value="development"
                className="text-zinc-500 data-[state=active]:bg-[#ff4f2d] data-[state=active]:text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-full transition-all text-xs sm:text-sm"
              >
                Inscreva-se
              </TabsTrigger>
            </TabsList>

            <TabsContent value="development" className="mt-6 sm:mt-8">
              <SubscriptionForm />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* SOMMA Club Section */}
      <section className="relative z-20 py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light mb-6 sm:mb-8 text-balance">
              Para quem é o SOMMA Club?
            </h2>

            <div className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-300 leading-relaxed space-y-4 sm:space-y-6">
              <p>
                O SOMMA Club é a comunidade para membros do nosso clube de corrida em Brasília. É para você que já é
                parte da nossa família aos sábados e quer mais, e também para você que busca um incentivo para começar.
              </p>

              <p>
                Seja você um corredor iniciante, que ainda está descobrindo o prazer da corrida, ou um atleta experiente
                em busca de novos desafios e conexões, aqui é o seu lugar.
              </p>

              <p>
                Se você valoriza a constância, acredita no poder da união e quer fazer parte de um movimento que vai
                além do esporte, o SOMMA Club foi feito para você.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SOMMA Club Filosofia Section */}
      <section className="relative z-20 py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light mb-6 sm:mb-8 text-balance">
              Nossa Filosofia
            </h2>

            <div className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-300 leading-relaxed space-y-4 sm:space-y-6">
              <p>
                No SOMMA, acreditamos que correr é um ato coletivo. Não se trata apenas de bater metas e quebrar
                recordes, mas de compartilhar a jornada, celebrar cada conquista e apoiar uns aos outros.
              </p>

              <p>
                Somos uma comunidade que encontra na corrida uma forma de cuidar da saúde, fortalecer laços e aproveitar
                o melhor que a vida ao ar livre pode oferecer.
              </p>

              <p className="font-light text-[#ff4f2d]">
                Somos os "The Real Connection Runners". Aqui, a conversa flui para criar conexões verdadeiras,
                compartilhar experiências e fortalecer nosso espírito de equipe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SOMMA Club Interaction Section */}
      <section className="relative z-20 py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light mb-6 sm:mb-8 text-balance">
              Como funciona a interação?
            </h2>

            <div className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-400 leading-relaxed space-y-4 sm:space-y-6">
              <p>
                Ao se tornar membro do SOMMA Club, você terá acesso a um grupo exclusivo no WhatsApp. Este será nosso
                ponto de encontro virtual, onde todos os membros, gestores e profissionais parceiros se conectam.
              </p>

              <p>
                É lá que você ficará por dentro de todas as novidades, receberá dicas, participará de desafios e, claro,
                combinará os próximos treinos e encontros.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SOMMA Club Benefits Section */}
      <section className="relative z-20 py-12 sm:py-16 md:py-24">
        <div className="container p-4 sm:p-6 md:p-8 lg:p-12 rounded-xl sm:rounded-2xl z-50 bg-[#09090b] border border-zinc-800 mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-white mb-4 sm:mb-6">
            Vantagens de ser Membro
          </h2>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-400 mb-6 sm:mb-8 md:mb-12 leading-relaxed">
            Ao se tornar membro do SOMMA Club, você terá acesso a um universo de benefícios pensados para potencializar
            sua experiência como corredor e membro da nossa comunidade.
          </p>

          <div className="block lg:hidden space-y-3">
            {[
              {
                title: "Presença VIP nas provas Somma",
                desc: "Acesso privilegiado e exclusivo em todas as provas organizadas pelo SOMMA",
              },
              {
                title: "Estrutura Somma em eventos",
                desc: "Apoio completo da equipe SOMMA durante eventos e competições",
              },
              {
                title: "Descontos em parceiros",
                desc: "Vantagens exclusivas em Track&Field, Tex Barbearia, Dopahmina, Academia Evolve, Bugu Delicias e marcas de suplementos",
              },
              {
                title: "Sorteios mensais",
                desc: "Participe de sorteios exclusivos todos os meses com prêmios especiais",
              },
              {
                title: "Encontros mensais exclusivos",
                desc: "Eventos especiais para membros com corridas temáticas, palestras e experiências únicas",
              },
              {
                title: "Treinamento personalizado via app",
                desc: "Plano de treino personalizado com integração Strava/relógios GPS e acompanhamento de métricas (exclusivo Assessoria)",
              },
              {
                title: "Camiseta oficial de membro",
                desc: "Camiseta exclusiva do SOMMA Club nos planos semestral e anual",
              },
              {
                title: "Desconto em camisetas extras",
                desc: "50% de desconto para membros do Membership em camisetas adicionais",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
              >
                <h3 className="font-medium text-white text-sm mb-2">{item.title}</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="hidden lg:block overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/50">
                  <th className="text-left px-6 py-4 font-light text-white text-lg">Benefício</th>
                  <th className="text-left px-6 py-4 font-light text-white text-lg">O que você ganha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                <tr className="hover:bg-zinc-950/50 transition-colors">
                  <td className="px-6 py-6">
                    <span className="font-light text-white text-base">Presença VIP nas provas Somma</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-zinc-300">
                      Acesso privilegiado e exclusivo em todas as provas organizadas pelo SOMMA
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-zinc-950/50 transition-colors">
                  <td className="px-6 py-6">
                    <span className="font-light text-white text-base">Estrutura Somma em eventos</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-zinc-300">Apoio completo da equipe SOMMA durante eventos e competições</span>
                  </td>
                </tr>
                <tr className="hover:bg-zinc-950/50 transition-colors">
                  <td className="px-6 py-6">
                    <span className="font-light text-white text-base">Descontos em parceiros</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-zinc-300">
                      Track&Field, Tex Barbearia, Dopahmina, Academia Evolve, Bugu Delicias e marcas de suplementos
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-zinc-950/50 transition-colors">
                  <td className="px-6 py-6">
                    <span className="font-light text-white text-base">Sorteios mensais</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-zinc-300">
                      Participe de sorteios exclusivos todos os meses com prêmios especiais para membros
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-zinc-950/50 transition-colors">
                  <td className="px-6 py-6">
                    <span className="font-light text-white text-base">Encontros mensais exclusivos</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-zinc-300">
                      Eventos especiais para membros com corridas temáticas, palestras e experiências únicas
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-zinc-950/50 transition-colors">
                  <td className="px-6 py-6">
                    <span className="font-light text-white text-base">Treinamento personalizado via app</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-zinc-300">
                      Plano de treino personalizado com integração Strava/relógios GPS e acompanhamento de métricas
                      (exclusivo Assessoria)
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-zinc-950/50 transition-colors">
                  <td className="px-6 py-6">
                    <span className="font-light text-white text-base">Camiseta oficial de membro</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-zinc-300">Camiseta exclusiva do SOMMA Club nos planos semestral e anual</span>
                  </td>
                </tr>
                <tr className="hover:bg-zinc-950/50 transition-colors">
                  <td className="px-6 py-6">
                    <span className="font-light text-white text-base">Desconto em camisetas extras</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-zinc-300">
                      50% de desconto para membros do Membership em camisetas adicionais
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SOMMA Club Pricing Section */}
      <section className="relative z-20 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container p-4 sm:p-6 md:p-8 lg:p-12 rounded-xl sm:rounded-2xl z-50 bg-[#09090b] border border-zinc-800 mx-auto relative overflow-hidden">
          {/* Blur Overlay with Lock */}
          <div className="absolute inset-0 z-50 backdrop-blur-md bg-black/40 flex flex-col items-center justify-center">
            {/* Lock Icon */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[#ff4f2d]/20 blur-2xl rounded-full animate-pulse" />
              <svg
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-[#ff4f2d] relative z-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            
            {/* Text */}
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-white mb-3 text-center px-4">
              Planos em Breve
            </h3>
            <p className="text-sm sm:text-base text-zinc-300 text-center max-w-md px-4">
              Entre na lista VIP para ter acesso antecipado quando os planos forem liberados
            </p>
          </div>

          {/* Original Content (blurred) */}
          <div className="blur-sm pointer-events-none select-none">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light mb-3 sm:mb-4 md:mb-6 text-balance">
              Planos de Assinatura
            </h2>

            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-400 mb-6 sm:mb-8 md:mb-12 leading-relaxed">
              O SOMMA Club oferece opções flexíveis para você escolher o plano que melhor se encaixa na sua rotina e
              objetivos.
            </p>

            <PricingPlans />
          </div>
        </div>
      </section>

      {/* FAQ Section - Hidden */}
      {/* <FAQSection /> */}
    </main>
  )
}
