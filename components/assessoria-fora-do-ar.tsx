import Image from "next/image"
import { ArrowLeft, Lock } from "lucide-react"
import { ASSESSORIA_FORA_DO_AR } from "@/lib/assessoria-status"

/**
 * Tela única de "Assessoria fora do ar": ocupa a home e o /checkout enquanto
 * `ASSESSORIA_VENDAS_ABERTAS` for `false`.
 */
export function AssessoriaForaDoAr() {
  return (
    <main className="relative flex min-h-[100svh] flex-col bg-black text-white">
      <header className="container mx-auto flex h-20 items-center px-4 sm:px-6 lg:px-12">
        <a href="https://sommaclub.com.br" aria-label="SOMMA Club">
          <Image
            src="https://cdn.shopify.com/s/files/1/0788/1932/8253/files/Logo_Nova_Somma_Branca_Laranja.svg?v=1772736456"
            alt="SOMMA Club"
            width={120}
            height={32}
            className="h-8 w-auto"
          />
        </a>
      </header>

      <div className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 pb-24 text-center">
        <div className="flex h-36 w-36 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] md:h-48 md:w-48">
          <Lock className="h-16 w-16 text-[#ff4f2d] md:h-24 md:w-24" strokeWidth={1.75} aria-hidden="true" />
        </div>
        <h1 className="mt-10 text-4xl font-light tracking-tight text-balance md:text-6xl">{ASSESSORIA_FORA_DO_AR}</h1>
        <a
          href="https://sommaclub.com.br"
          className="mt-10 inline-flex items-center gap-2 text-sm font-light text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para o SOMMA Club
        </a>
      </div>
    </main>
  )
}
