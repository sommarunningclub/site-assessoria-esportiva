"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { AtletaLoginModal } from "@/components/atleta-login-modal"

export default function AtletaPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-4 sm:py-6">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Image
            src="https://cdn.shopify.com/s/files/1/0788/1932/8253/files/Stories_SOMMA_15_0ad925c6-c95b-430e-b715-26726e2a0c06.png?v=1771962276"
            alt="Assessoria Somma"
            width={120}
            height={40}
            className="h-10 w-auto object-contain"
          />
        </Link>
        <Link href="/" className="text-xs sm:text-sm text-zinc-400 hover:text-white transition-colors">
          Voltar
        </Link>
      </nav>

      <AtletaLoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* Hero Section */}
      <section className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light mb-6 sm:mb-8 leading-tight text-balance">
            Portal do Atleta Somma
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-zinc-400 mb-8 sm:mb-12 leading-relaxed max-w-2xl mx-auto">
            Acesse seus benefícios exclusivos, acompanhe seu progresso e desfrute de todos os privilégios de ser um
            atleta da Assessoria Somma.
          </p>

          <button
            onClick={() => setIsLoginOpen(true)}
            className="inline-flex items-center gap-3 px-8 py-3.5 bg-[#ff4f2d] hover:bg-[#ff4f2d]/90 text-white font-medium rounded-lg transition-all group"
          >
            Acessar Portal
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-32 bg-zinc-900/30 border-t border-b border-zinc-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light mb-12 sm:mb-16 text-center">
            Benefícios Exclusivos
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: "Planejamento Personalizado",
                description: "Treinos adaptados aos seus objetivos e nível atual",
              },
              {
                title: "Acompanhamento Profissional",
                description: "Suporte contínuo da equipe Somma",
              },
              {
                title: "Análise de Desempenho",
                description: "Relatórios detalhados de sua evolução",
              },
              {
                title: "Comunidade Exclusiva",
                description: "Conecte-se com outros atletas Somma",
              },
              {
                title: "Integração com Apps",
                description: "Sincronização com Strava e relógios GPS",
              },
              {
                title: "Eventos Especiais",
                description: "Convites para corridas e encontros exclusivos",
              },
            ].map((feature, i) => (
              <div key={i} className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors">
                <h3 className="text-lg font-medium text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light mb-6 sm:mb-8">Já é um Atleta Somma?</h2>
          <p className="text-lg text-zinc-400 mb-8 sm:mb-12">
            Faça login com seu CPF para acessar o portal exclusivo com todos os seus benefícios.
          </p>
          <button
            onClick={() => setIsLoginOpen(true)}
            className="inline-flex items-center gap-3 px-8 py-3.5 bg-[#ff4f2d] hover:bg-[#ff4f2d]/90 text-white font-medium rounded-lg transition-all group"
          >
            Entrar no Portal
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </main>
  )
}
