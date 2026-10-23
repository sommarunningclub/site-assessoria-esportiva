import type { Metadata } from "next"
import { AssessoriaForaDoAr } from "@/components/assessoria-fora-do-ar"
import { ASSESSORIA_VENDAS_ABERTAS } from "@/lib/assessoria-status"

// Vendas fechadas: o cadeado no lugar de qualquer página de checkout.
export const metadata: Metadata = ASSESSORIA_VENDAS_ABERTAS
  ? {}
  : { robots: { index: false, follow: false } }

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  if (!ASSESSORIA_VENDAS_ABERTAS) return <AssessoriaForaDoAr />
  return children
}
