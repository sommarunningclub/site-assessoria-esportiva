/**
 * Vendas da Assessoria Somma. Fechadas desde 23/10/2026: nenhuma assinatura
 * nova entra, por nenhum caminho.
 *
 * Com `false`, a home e todo /checkout/* mostram o cadeado de "fora do ar", e
 * as rotas que criam cliente e cobrança no Asaas recusam o pedido (é essa a
 * trava que vale: quem chama a API direto também não passa). O painel /admin
 * e o webhook seguem funcionando para quem já é aluno.
 *
 * Para reabrir, trocar para `true` e publicar.
 */
export const ASSESSORIA_VENDAS_ABERTAS = false

export const ASSESSORIA_FORA_DO_AR = "Assessoria fora do ar"

/**
 * Resposta das rotas de cobrança enquanto as vendas estão fechadas. `Response`
 * e não `NextResponse`: este arquivo também é lido pela home, que é client.
 */
export function respostaVendasFechadas() {
  return new Response(
    JSON.stringify({ error: `${ASSESSORIA_FORA_DO_AR}. Novas assinaturas estão suspensas.` }),
    { status: 403, headers: { "Content-Type": "application/json" } }
  )
}
