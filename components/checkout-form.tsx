"use client"

import type React from "react"
import { useState } from "react"
import {
  CreditCard,
  Loader2,
  Check,
  AlertCircle,
  Lock,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Tag,
  User,
} from "lucide-react"
import Image from "next/image"

interface CheckoutFormProps {
  plan: {
    name: string
    period: string
    price: number
    total: number
    installments: number
  }
}

interface CustomerData {
  name: string
  email: string
  cpfCnpj: string
  phone: string
  postalCode: string
  addressNumber: string
  street: string
  neighborhood: string
  city: string
  state: string
}

interface CreditCardData {
  holderName: string
  number: string
  expiryMonth: string
  expiryYear: string
  ccv: string
}

interface CepResponse {
  cep: string
  state: string
  city: string
  neighborhood: string
  street: string
}

interface CouponData {
  valid: boolean
  coupon: {
    code: string
    type: "PERCENTAGE" | "FIXED"
    value: number
    description: string
  }
  calculation: {
    originalValue: number
    discount: number
    finalValue: number
  }
  asaasDiscount: {
    value: number
    dueDateLimitDays: number
    type: string
  }
}

type Step = "info" | "payment" | "processing" | "success" | "error"

const STEPS = [
  { key: "info", label: "Informações" },
  { key: "payment", label: "Pagamento" },
  { key: "success", label: "Confirmação" },
]

function formatCPF(value: string) {
  const n = value.replace(/\D/g, "").slice(0, 11)
  return n
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}

function formatPhone(value: string) {
  const n = value.replace(/\D/g, "").slice(0, 11)
  return n.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2")
}

function formatCEP(value: string) {
  const n = value.replace(/\D/g, "").slice(0, 8)
  return n.replace(/(\d{5})(\d)/, "$1-$2")
}

function formatCardNumber(value: string) {
  const n = value.replace(/\D/g, "").slice(0, 16)
  return n.replace(/(\d{4})(?=\d)/g, "$1 ")
}

function fmtBRL(value: number) {
  return value.toFixed(2).replace(".", ",")
}

export function CheckoutForm({ plan }: CheckoutFormProps) {
  const [step, setStep] = useState<Step>("info")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [isCepLoading, setIsCepLoading] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)

  const [couponCode, setCouponCode] = useState("")
  const [couponData, setCouponData] = useState<CouponData | null>(null)
  const [isCouponLoading, setIsCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)

  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "", email: "", cpfCnpj: "", phone: "",
    postalCode: "", addressNumber: "", street: "", neighborhood: "", city: "", state: "",
  })

  const [cardData, setCardData] = useState<CreditCardData>({
    holderName: "", number: "", expiryMonth: "", expiryYear: "", ccv: "",
  })

  const discountedPrice = couponData ? couponData.calculation.finalValue : plan.price
  const discountAmount = couponData ? couponData.calculation.discount : 0
  const discountedTotal = couponData ? plan.total - discountAmount * plan.installments : plan.total

  const activeStepIndex = step === "info" ? 0 : step === "payment" ? 1 : 2

  // ─── CEP ─────────────────────────────────────────────────────────────────
  const fetchAddressByCep = async (cep: string) => {
    setIsCepLoading(true)
    setCepError(null)
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`)
      if (!res.ok) throw new Error()
      const data: CepResponse = await res.json()
      setCustomerData((prev) => ({
        ...prev,
        street: data.street || "",
        neighborhood: data.neighborhood || "",
        city: data.city || "",
        state: data.state || "",
      }))
    } catch {
      setCepError("CEP não encontrado. Verifique e tente novamente.")
    } finally {
      setIsCepLoading(false)
    }
  }

  const handleCepChange = (value: string) => {
    const formatted = formatCEP(value)
    setCustomerData((prev) => ({ ...prev, postalCode: formatted }))
    const clean = value.replace(/\D/g, "")
    if (clean.length === 8) fetchAddressByCep(clean)
    else setCepError(null)
  }

  // ─── Coupon ───────────────────────────────────────────────────────────────
  const validateCoupon = async () => {
    if (!couponCode.trim()) { setCouponError("Digite um código de cupom"); return }
    setIsCouponLoading(true)
    setCouponError(null)
    try {
      const res = await fetch(`/api/checkout/validate-coupon?code=${encodeURIComponent(couponCode)}&value=${plan.price}`)
      const data = await res.json()
      if (!data.valid) { setCouponError(data.error || "Cupom inválido"); setCouponData(null); return }
      setCouponData(data)
    } catch {
      setCouponError("Erro ao validar cupom")
    } finally {
      setIsCouponLoading(false)
    }
  }

  // ─── Step 1 submit ────────────────────────────────────────────────────────
  const handleInfoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/asaas/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao salvar dados")
      setCustomerId(data.id)
      setStep("payment")
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Step 2 submit ────────────────────────────────────────────────────────
  const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setStep("processing")

    try {
      const payload: any = {
        customerId,
        billingType: "CREDIT_CARD",
        value: discountedPrice,
        cycle: "MONTHLY",
        maxPayments: plan.installments > 1 ? plan.installments : undefined,
        description: `Somma Assessoria - Plano ${plan.name}${couponData ? ` (Cupom: ${couponData.coupon.code})` : ""}`,
        creditCard: {
          holderName: cardData.holderName,
          number: cardData.number.replace(/\s/g, ""),
          expiryMonth: cardData.expiryMonth,
          expiryYear: cardData.expiryYear,
          ccv: cardData.ccv,
        },
        creditCardHolderInfo: {
          name: customerData.name,
          email: customerData.email,
          cpfCnpj: customerData.cpfCnpj.replace(/\D/g, ""),
          postalCode: customerData.postalCode.replace(/\D/g, ""),
          addressNumber: customerData.addressNumber,
          phone: customerData.phone.replace(/\D/g, ""),
        },
        remoteIp: "127.0.0.1",
      }

      const res = await fetch("/api/asaas/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao processar pagamento")
      setStep("success")
    } catch (err: any) {
      setError(err.message)
      setStep("error")
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Shared: input class ──────────────────────────────────────────────────
  const inputClass = (hasError?: boolean) =>
    `w-full px-4 py-3 bg-white/[0.03] border rounded-xl text-sm text-white placeholder-white/30 focus:outline-none transition-all ${
      hasError
        ? "border-red-500/50 focus:border-red-500"
        : "border-white/10 focus:border-[#ff4f2d] focus:bg-white/[0.05]"
    }`

  // ─── Shared: field wrapper ────────────────────────────────────────────────
  const Field = ({
    label,
    error: fieldError,
    children,
  }: {
    label: string
    error?: string | null
    children: React.ReactNode
  }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider">{label}</label>
      {children}
      {fieldError && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {fieldError}
        </p>
      )}
    </div>
  )

  // ─── Shared: order summary ────────────────────────────────────────────────
  const OrderSummary = () => (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 space-y-5">
      <div>
        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Plano selecionado</p>
        <h3 className="text-white font-medium text-base">Somma Assessoria — Plano {plan.name}</h3>
        <p className="text-white/50 text-sm mt-0.5">
          {plan.installments > 1 ? `${plan.installments}x mensais sem juros` : "Cobrança mensal recorrente"}
        </p>
      </div>

      <div className="border-t border-white/10 pt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Valor por mês</span>
          <span className="text-white">R$ {fmtBRL(plan.price)}</span>
        </div>
        {plan.installments > 1 && (
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Total do período</span>
            <span className="text-white">R$ {fmtBRL(plan.total)}</span>
          </div>
        )}
        {couponData && (
          <div className="flex justify-between text-sm">
            <span className="text-green-400 flex items-center gap-1">
              <Tag className="w-3 h-3" /> {couponData.coupon.code}
            </span>
            <span className="text-green-400">-R$ {fmtBRL(discountAmount)}/mês</span>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="flex justify-between items-baseline">
          <span className="text-white/60 text-sm">Total agora</span>
          <div className="text-right">
            {couponData && (
              <span className="text-white/30 line-through text-sm mr-2">R$ {fmtBRL(plan.price)}</span>
            )}
            <span className="text-2xl font-light text-white">R$ {fmtBRL(discountedPrice)}</span>
          </div>
        </div>
        {plan.installments > 1 && couponData && (
          <p className="text-xs text-green-400 mt-1 text-right">
            Total do período: R$ {fmtBRL(discountedTotal)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <ShieldCheck className="w-4 h-4 text-green-400 flex-shrink-0" />
        <p className="text-xs text-white/40">Pagamento 100% seguro com criptografia SSL</p>
      </div>
    </div>
  )

  // ─── PROCESSING ──────────────────────────────────────────────────────────
  if (step === "processing") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-white/10 border-t-[#ff4f2d] rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-light text-white mb-2">Processando pagamento</h2>
          <p className="text-sm text-white/40">Aguarde, estamos confirmando sua assinatura...</p>
        </div>
      </div>
    )
  }

  // ─── SUCCESS ─────────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-400" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-light text-white mb-2">Bem-vindo à Somma!</h2>
          <p className="text-white/50 mb-8 text-sm">
            Sua assinatura do Plano {plan.name} foi ativada com sucesso.
          </p>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-left mb-8 space-y-4">
            <p className="text-sm font-medium text-white">Próximos passos</p>
            {[
              "Verifique seu e-mail — enviaremos as instruções de acesso",
              "Nossa equipe entrará em contato em até 24h para o onboarding",
              "Baixe o app e configure seu perfil de corredor",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#ff4f2d]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] text-[#ff4f2d] font-semibold">{i + 1}</span>
                </div>
                <p className="text-sm text-white/60">{item}</p>
              </div>
            ))}
          </div>
          <a
            href="/"
            className="inline-block w-full py-3 bg-white/10 hover:bg-white/15 text-white font-light rounded-xl transition-colors"
          >
            Voltar ao site
          </a>
        </div>
      </div>
    )
  }

  // ─── ERROR ───────────────────────────────────────────────────────────────
  if (step === "error") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-400" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-light text-white mb-2">Erro no pagamento</h2>
          <p className="text-sm text-white/50 mb-2">{error || "Ocorreu um erro ao processar seu pagamento."}</p>
          <p className="text-xs text-white/30 mb-8">Verifique os dados do cartão e tente novamente.</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setStep("payment"); setError(null) }}
              className="w-full py-3 bg-[#ff4f2d] hover:bg-[#e6452a] text-black font-medium rounded-xl transition-colors"
            >
              Tentar novamente
            </button>
            <a
              href="/"
              className="w-full py-3 bg-white/10 hover:bg-white/15 text-white font-light rounded-xl transition-colors text-center"
            >
              Voltar ao site
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ─── MAIN LAYOUT ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white">

      {/* Top bar */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/">
            <Image
              src="https://cdn.shopify.com/s/files/1/0788/1932/8253/files/Logo_Nova_Somma_Branca_Laranja.svg"
              alt="Somma"
              width={110}
              height={32}
              className="h-8 w-auto"
            />
          </a>
          <a href="/" className="text-xs text-white/40 hover:text-white transition-colors">
            ← Voltar ao site
          </a>
        </div>
      </div>

      {/* Steps breadcrumb */}
      <div className="border-b border-white/10 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center gap-3">
          {STEPS.map((s, i) => {
            const isActive = i === activeStepIndex
            const isDone = i < activeStepIndex
            return (
              <div key={s.key} className="flex items-center gap-3">
                <div className={`flex items-center gap-2 text-xs transition-colors ${
                  isActive ? "text-white font-medium"
                  : isDone ? "text-[#ff4f2d]"
                  : "text-white/30"
                }`}>
                  {isDone ? (
                    <div className="w-4 h-4 rounded-full bg-[#ff4f2d] flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold ${
                      isActive ? "border-white text-white" : "border-white/20 text-white/30"
                    }`}>{i + 1}</div>
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-white/15" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Page body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-16">

          {/* ── LEFT: Form ─────────────────────────────────────────────────── */}
          <div>

            {/* STEP 1 — Informações */}
            {step === "info" && (
              <form onSubmit={handleInfoSubmit} className="space-y-8">
                {/* Contato */}
                <section>
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-6 h-6 rounded-full bg-[#ff4f2d]/15 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-[#ff4f2d]" />
                    </div>
                    <h2 className="text-base font-medium text-white">Informações de contato</h2>
                  </div>
                  <div className="space-y-4">
                    <Field label="Nome completo">
                      <input
                        type="text" required
                        value={customerData.name}
                        onChange={(e) => setCustomerData((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Seu nome completo"
                        className={inputClass()}
                      />
                    </Field>
                    <Field label="E-mail">
                      <input
                        type="email" required
                        value={customerData.email}
                        onChange={(e) => setCustomerData((p) => ({ ...p, email: e.target.value }))}
                        placeholder="seu@email.com"
                        className={inputClass()}
                        autoComplete="email"
                      />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="CPF">
                        <input
                          type="text" required
                          value={customerData.cpfCnpj}
                          onChange={(e) => setCustomerData((p) => ({ ...p, cpfCnpj: formatCPF(e.target.value) }))}
                          placeholder="000.000.000-00"
                          className={inputClass()}
                          inputMode="numeric"
                        />
                      </Field>
                      <Field label="WhatsApp">
                        <input
                          type="text" required
                          value={customerData.phone}
                          onChange={(e) => setCustomerData((p) => ({ ...p, phone: formatPhone(e.target.value) }))}
                          placeholder="(61) 90000-0000"
                          className={inputClass()}
                          inputMode="tel"
                        />
                      </Field>
                    </div>
                  </div>
                </section>

                {/* Endereço */}
                <section>
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-6 h-6 rounded-full bg-[#ff4f2d]/15 flex items-center justify-center">
                      <MapPin className="w-3.5 h-3.5 text-[#ff4f2d]" />
                    </div>
                    <h2 className="text-base font-medium text-white">Endereço de cobrança</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="CEP" error={cepError}>
                        <div className="relative">
                          <input
                            type="text" required
                            value={customerData.postalCode}
                            onChange={(e) => handleCepChange(e.target.value)}
                            placeholder="00000-000"
                            className={inputClass(!!cepError)}
                            inputMode="numeric"
                          />
                          {isCepLoading && (
                            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 animate-spin" />
                          )}
                        </div>
                      </Field>
                      <Field label="Número">
                        <input
                          type="text" required
                          value={customerData.addressNumber}
                          onChange={(e) => setCustomerData((p) => ({ ...p, addressNumber: e.target.value }))}
                          placeholder="Ex: 123"
                          className={inputClass()}
                        />
                      </Field>
                    </div>

                    {customerData.street && (
                      <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                        <p className="text-xs text-green-400 flex items-center gap-1.5 mb-2">
                          <Check className="w-3.5 h-3.5" />
                          Endereço encontrado
                        </p>
                        <p className="text-sm text-white/70">
                          {customerData.street}, {customerData.neighborhood}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">
                          {customerData.city} — {customerData.state}
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {/* Mobile summary */}
                <div className="lg:hidden"><OrderSummary /></div>

                <button
                  type="submit"
                  disabled={isLoading || !customerData.street || !customerData.addressNumber}
                  className="w-full py-4 bg-[#ff4f2d] hover:bg-[#e6452a] disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Continuar para pagamento <ChevronRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2 — Pagamento */}
            {step === "payment" && (
              <form onSubmit={handlePaymentSubmit} className="space-y-8">
                {/* Info recap */}
                <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-white/40 uppercase tracking-wider">Contato</p>
                    <button
                      type="button"
                      onClick={() => setStep("info")}
                      className="text-xs text-[#ff4f2d] hover:underline"
                    >
                      Editar
                    </button>
                  </div>
                  <p className="text-sm text-white">{customerData.name}</p>
                  <p className="text-xs text-white/50">{customerData.email}</p>
                  {customerData.street && (
                    <p className="text-xs text-white/40 mt-1">
                      {customerData.street}, {customerData.addressNumber} — {customerData.city}/{customerData.state}
                    </p>
                  )}
                </div>

                {/* Dados do cartão */}
                <section>
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-6 h-6 rounded-full bg-[#ff4f2d]/15 flex items-center justify-center">
                      <CreditCard className="w-3.5 h-3.5 text-[#ff4f2d]" />
                    </div>
                    <h2 className="text-base font-medium text-white">Dados do cartão</h2>
                  </div>
                  <div className="space-y-4">
                    <Field label="Número do cartão">
                      <input
                        type="text" required
                        value={cardData.number}
                        onChange={(e) => setCardData((p) => ({ ...p, number: formatCardNumber(e.target.value) }))}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        className={inputClass()}
                        autoComplete="cc-number"
                        inputMode="numeric"
                      />
                    </Field>
                    <Field label="Nome no cartão">
                      <input
                        type="text" required
                        value={cardData.holderName}
                        onChange={(e) => setCardData((p) => ({ ...p, holderName: e.target.value.toUpperCase() }))}
                        placeholder="NOME IMPRESSO NO CARTÃO"
                        className={`${inputClass()} uppercase`}
                        autoComplete="cc-name"
                      />
                    </Field>
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Mês (MM)">
                        <input
                          type="text" required maxLength={2}
                          value={cardData.expiryMonth}
                          onChange={(e) => setCardData((p) => ({ ...p, expiryMonth: e.target.value.replace(/\D/g, "") }))}
                          placeholder="MM"
                          className={inputClass()}
                          autoComplete="cc-exp-month"
                          inputMode="numeric"
                        />
                      </Field>
                      <Field label="Ano (AAAA)">
                        <input
                          type="text" required maxLength={4}
                          value={cardData.expiryYear}
                          onChange={(e) => setCardData((p) => ({ ...p, expiryYear: e.target.value.replace(/\D/g, "") }))}
                          placeholder="AAAA"
                          className={inputClass()}
                          autoComplete="cc-exp-year"
                          inputMode="numeric"
                        />
                      </Field>
                      <Field label="CVV">
                        <div className="relative">
                          <input
                            type="text" required maxLength={4}
                            value={cardData.ccv}
                            onChange={(e) => setCardData((p) => ({ ...p, ccv: e.target.value.replace(/\D/g, "") }))}
                            placeholder="000"
                            className={inputClass()}
                            autoComplete="cc-csc"
                            inputMode="numeric"
                          />
                          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                        </div>
                      </Field>
                    </div>
                  </div>
                </section>

                {/* Cupom */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-[#ff4f2d]/15 flex items-center justify-center">
                      <Tag className="w-3.5 h-3.5 text-[#ff4f2d]" />
                    </div>
                    <h2 className="text-base font-medium text-white">Cupom de desconto</h2>
                  </div>
                  {couponData ? (
                    <div className="flex items-center justify-between p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400 font-medium">{couponData.coupon.code}</span>
                        <span className="text-xs text-white/40">— {couponData.coupon.description}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setCouponData(null); setCouponCode("") }}
                        className="text-xs text-white/30 hover:text-red-400 transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(null) }}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), validateCoupon())}
                          placeholder="CÓDIGO DO CUPOM"
                          className={`flex-1 px-4 py-3 bg-white/[0.03] border rounded-xl text-sm text-white placeholder-white/25 focus:outline-none transition-all uppercase ${
                            couponError ? "border-red-500/50" : "border-white/10 focus:border-[#ff4f2d]"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={validateCoupon}
                          disabled={isCouponLoading || !couponCode.trim()}
                          className="px-5 py-3 bg-white/8 hover:bg-white/15 border border-white/10 text-white text-sm rounded-xl transition-colors disabled:opacity-40 flex items-center gap-2"
                        >
                          {isCouponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aplicar"}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />{couponError}
                        </p>
                      )}
                    </div>
                  )}
                </section>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {/* Mobile summary */}
                <div className="lg:hidden"><OrderSummary /></div>

                <div className="space-y-3 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-[#ff4f2d] hover:bg-[#e6452a] disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Pagar R$ {fmtBRL(discountedPrice)}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("info")}
                    className="w-full py-2.5 text-white/40 hover:text-white text-sm transition-colors"
                  >
                    ← Voltar para informações
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ── RIGHT: Sticky summary (desktop) ──────────────────────────── */}
          <div className="hidden lg:block">
            <div className="sticky top-8">
              <OrderSummary />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
