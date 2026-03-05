"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { CreditCard, Loader2, Check, AlertCircle, Lock, MapPin, ChevronLeft, ShieldCheck, Tag } from "lucide-react"
import { useRouter } from "next/navigation"

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

export function CheckoutForm({ plan }: CheckoutFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<"customer" | "payment" | "processing" | "success" | "error">("customer")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [isCepLoading, setIsCepLoading] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)

  // Coupon state
  const [couponCode, setCouponCode] = useState("")
  const [couponData, setCouponData] = useState<CouponData | null>(null)
  const [isCouponLoading, setIsCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)

  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "",
    email: "",
    cpfCnpj: "",
    phone: "",
    postalCode: "",
    addressNumber: "",
    street: "",
    neighborhood: "",
    city: "",
    state: "",
  })

  const [creditCardData, setCreditCardData] = useState<CreditCardData>({
    holderName: "",
    number: "",
    expiryMonth: "",
    expiryYear: "",
    ccv: "",
  })

  const discountedPrice = couponData ? couponData.calculation.finalValue : plan.price
  const discountAmount = couponData ? couponData.calculation.discount : 0
  const discountedTotal = couponData
    ? plan.total - (discountAmount * plan.installments)
    : plan.total

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Digite um código de cupom")
      return
    }

    setIsCouponLoading(true)
    setCouponError(null)

    try {
      const response = await fetch(
        `/api/checkout/validate-coupon?code=${encodeURIComponent(couponCode)}&value=${plan.price}`
      )

      const data = await response.json()

      if (!data.valid) {
        setCouponError(data.error || "Cupom inválido")
        setCouponData(null)
        return
      }

      setCouponData(data)
      setCouponError(null)
    } catch {
      setCouponError("Erro ao validar cupom")
      setCouponData(null)
    } finally {
      setIsCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setCouponCode("")
    setCouponData(null)
    setCouponError(null)
  }

  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "")
    if (cleanCep.length !== 8) return

    setIsCepLoading(true)
    setCepError(null)

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`)
      if (!response.ok) throw new Error("CEP não encontrado")

      const data: CepResponse = await response.json()
      setCustomerData((prev) => ({
        ...prev,
        street: data.street || "",
        neighborhood: data.neighborhood || "",
        city: data.city || "",
        state: data.state || "",
      }))
    } catch {
      setCepError("CEP não encontrado")
    } finally {
      setIsCepLoading(false)
    }
  }

  const handleCepChange = (value: string) => {
    const formattedCep = formatCEP(value)
    setCustomerData({ ...customerData, postalCode: formattedCep })
    const cleanCep = value.replace(/\D/g, "")
    if (cleanCep.length === 8) {
      fetchAddressByCep(cleanCep)
    } else {
      setCepError(null)
    }
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    }
    return numbers
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1")
  }

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9)
  }

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{4})(?=\d)/g, "$1 ").slice(0, 19)
  }

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/asaas/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Erro ao criar cliente")

      setCustomerId(data.id)
      setStep("payment")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setStep("processing")

    try {
      const subscriptionPayload: any = {
        customerId,
        billingType: "CREDIT_CARD",
        value: discountedPrice,
        cycle: "MONTHLY",
        maxPayments: plan.installments > 1 ? plan.installments : undefined,
        description: `${plan.name} - ${plan.period}${couponData ? ` (Cupom: ${couponData.coupon.code})` : ""}`,
        creditCard: {
          holderName: creditCardData.holderName,
          number: creditCardData.number.replace(/\s/g, ""),
          expiryMonth: creditCardData.expiryMonth,
          expiryYear: creditCardData.expiryYear,
          ccv: creditCardData.ccv,
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

      const response = await fetch("/api/asaas/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscriptionPayload),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Erro ao processar pagamento")

      setStep("success")
    } catch (err: any) {
      setError(err.message)
      setStep("error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          {step === "payment" && (
            <button
              onClick={() => setStep("customer")}
              className="p-1.5 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-lg sm:text-xl font-light text-white">
              {step === "customer" && "Seus dados"}
              {step === "payment" && "Pagamento"}
              {step === "processing" && "Processando"}
              {step === "success" && "Sucesso"}
              {step === "error" && "Erro"}
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              {plan.name} • {plan.period}
            </p>
          </div>
        </div>
        <a
          href="/"
          className="text-white/60 hover:text-white transition-colors text-sm font-light"
        >
          ← Voltar
        </a>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Price Summary */}
          {(step === "customer" || step === "payment") && (
            <div className="mb-8 p-4 sm:p-6 bg-white/[0.02] border border-white/10 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs sm:text-sm font-light text-white/60 uppercase tracking-wide">
                    {plan.installments > 1 ? `${plan.installments}x sem juros` : "Mensal recorrente"}
                  </span>
                  {plan.installments > 1 && (
                    <p className="text-xs sm:text-sm text-white/60 mt-2">
                      Total: {couponData ? (
                        <>
                          <span className="line-through text-white/40">R$ {plan.total.toFixed(2).replace(".", ",")}</span>
                          {" "}
                          <span className="text-green-400">R$ {discountedTotal.toFixed(2).replace(".", ",")}</span>
                        </>
                      ) : (
                        `R$ ${plan.total.toFixed(2).replace(".", ",")}`
                      )}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {couponData ? (
                    <>
                      <span className="text-sm line-through text-white/40">
                        R$ {plan.price.toFixed(2).replace(".", ",")}
                      </span>
                      <br />
                      <span className="text-2xl sm:text-3xl font-light text-green-400">
                        R$ {discountedPrice.toFixed(2).replace(".", ",")}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl sm:text-3xl font-light text-white">
                      R$ {plan.price.toFixed(2).replace(".", ",")}
                    </span>
                  )}
                  <span className="text-xs sm:text-sm text-white/60">/mês</span>
                </div>
              </div>
              {couponData && (
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-green-400" />
                    <span className="text-xs sm:text-sm text-green-400">
                      {couponData.coupon.code}: -R$ {discountAmount.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs text-white/60 hover:text-red-400 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Coupon Field */}
          {step === "customer" && !couponData && (
            <div className="mb-6">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase())
                      setCouponError(null)
                    }}
                    placeholder="Cupom de desconto"
                    className={`w-full pl-9 pr-3 py-2.5 bg-white/[0.02] border rounded-lg text-sm text-white placeholder-white/40 focus:outline-none transition-colors ${
                      couponError ? "border-red-500/50" : "border-white/10 focus:border-[#ff4f2d]"
                    }`}
                  />
                </div>
                <button
                  type="button"
                  onClick={validateCoupon}
                  disabled={isCouponLoading || !couponCode.trim()}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-light rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCouponLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Aplicar"
                  )}
                </button>
              </div>
              {couponError && (
                <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {couponError}
                </p>
              )}
            </div>
          )}

          {/* Customer Form */}
          {step === "customer" && (
            <form onSubmit={handleCustomerSubmit} className="space-y-6">
              <div>
                <h3 className="text-xs sm:text-sm font-light text-white/60 mb-4 uppercase tracking-wider">Dados pessoais</h3>

                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#ff4f2d] transition-colors"
                    placeholder="Nome completo"
                  />

                  <input
                    type="email"
                    required
                    value={customerData.email}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#ff4f2d] transition-colors"
                    placeholder="E-mail"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={customerData.cpfCnpj}
                      onChange={(e) => setCustomerData({ ...customerData, cpfCnpj: formatCPF(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#ff4f2d] transition-colors"
                      placeholder="CPF"
                    />

                    <input
                      type="text"
                      required
                      value={customerData.phone}
                      onChange={(e) => setCustomerData({ ...customerData, phone: formatPhone(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#ff4f2d] transition-colors"
                      placeholder="WhatsApp"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-light text-white/60 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Endereço
                </h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    <div className="sm:col-span-3 relative">
                      <input
                        type="text"
                        required
                        value={customerData.postalCode}
                        onChange={(e) => handleCepChange(e.target.value)}
                        className={`w-full px-3 py-2.5 bg-white/[0.02] border rounded-lg text-sm text-white placeholder-white/40 focus:outline-none transition-colors ${
                          cepError ? "border-red-500/50" : "border-white/10 focus:border-[#ff4f2d]"
                        }`}
                        placeholder="CEP"
                      />
                      {isCepLoading && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 animate-spin" />
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        required
                        value={customerData.addressNumber}
                        onChange={(e) => setCustomerData({ ...customerData, addressNumber: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#ff4f2d] transition-colors"
                        placeholder="Número"
                      />
                    </div>
                  </div>

                  {cepError && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {cepError}
                    </p>
                  )}

                  {customerData.street && (
                    <div className="p-3 bg-white/[0.02] rounded-lg border border-white/10 space-y-2">
                      <p className="text-xs text-green-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Endereço encontrado
                      </p>
                      <p className="text-sm text-white/70">
                        {customerData.street}, {customerData.neighborhood}
                      </p>
                      <p className="text-xs text-white/50">
                        {customerData.city} - {customerData.state}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-xs sm:text-sm text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !customerData.street}
                className="w-full py-3 bg-[#ff4f2d] hover:bg-[#e6452a] text-black font-light rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Continuar para pagamento
                    <CreditCard className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Payment Form */}
          {step === "payment" && (
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div>
                <h3 className="text-xs sm:text-sm font-light text-white/60 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Dados do cartão
                </h3>

                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    value={creditCardData.holderName}
                    onChange={(e) => setCreditCardData({ ...creditCardData, holderName: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2.5 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#ff4f2d] transition-colors uppercase"
                    placeholder="Titular do Cartão"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      required
                      maxLength={2}
                      value={creditCardData.expiryMonth}
                      onChange={(e) =>
                        setCreditCardData({ ...creditCardData, expiryMonth: e.target.value.replace(/\D/g, "") })
                      }
                      className="w-full px-3 py-2.5 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#ff4f2d] transition-colors text-center"
                      placeholder="MM"
                    />
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={creditCardData.expiryYear}
                      onChange={(e) =>
                        setCreditCardData({ ...creditCardData, expiryYear: e.target.value.replace(/\D/g, "") })
                      }
                      className="w-full px-3 py-2.5 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#ff4f2d] transition-colors text-center"
                      placeholder="AAAA"
                    />
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={4}
                        value={creditCardData.ccv}
                        onChange={(e) =>
                          setCreditCardData({ ...creditCardData, ccv: e.target.value.replace(/\D/g, "") })
                        }
                        className="w-full px-3 py-2.5 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#ff4f2d] transition-colors text-center"
                        placeholder="CVV"
                      />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-white/[0.02] rounded-lg border border-white/10">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-white/60">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  <span>Pagamento seguro com criptografia SSL</span>
                </div>
              </div>

              {error && (
                <div className="p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-xs sm:text-sm text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#ff4f2d] hover:bg-[#e6452a] text-black font-light rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pagar R$ {discountedPrice.toFixed(2).replace(".", ",")}
                  </>
                )}
              </button>
            </form>
          )}

          {/* Processing */}
          {step === "processing" && (
            <div className="py-12 sm:py-16 text-center">
              <Loader2 className="w-12 h-12 text-white/40 animate-spin mx-auto mb-4" />
              <h2 className="text-lg sm:text-xl font-light text-white mb-2">Processando pagamento</h2>
              <p className="text-sm text-white/60">Aguarde enquanto confirmamos seu pagamento...</p>
            </div>
          )}

          {/* Success */}
          {step === "success" && (
            <div className="py-12 sm:py-16 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-lg sm:text-xl font-light text-white mb-2">Pagamento confirmado!</h2>
              <p className="text-sm text-white/60 mb-6">
                Sua assinatura do {plan.name} foi ativada com sucesso.
              </p>
              <div className="bg-white/[0.02] border border-white/10 rounded-lg p-4 sm:p-6 mb-6">
                <p className="text-sm font-light text-white mb-2">Próximos passos</p>
                <p className="text-sm text-white/70">
                  A equipe Somma Assessoria entrará em contato para o onboarding.
                </p>
              </div>
              <a
                href="/"
                className="inline-block px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-light rounded-lg transition-colors"
              >
                Voltar ao site
              </a>
            </div>
          )}

          {/* Error */}
          {step === "error" && (
            <div className="py-12 sm:py-16 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-lg sm:text-xl font-light text-white mb-2">Erro no pagamento</h2>
              <p className="text-sm text-white/60 mb-2">{error || "Ocorreu um erro ao processar seu pagamento."}</p>
              <p className="text-xs text-white/50 mb-6">Verifique os dados do cartão e tente novamente.</p>
              <div className="flex gap-3 justify-center flex-col sm:flex-row">
                <button
                  onClick={() => setStep("payment")}
                  className="px-6 py-2.5 bg-[#ff4f2d] hover:bg-[#e6452a] text-black font-light rounded-lg transition-colors"
                >
                  Tentar novamente
                </button>
                <a
                  href="/"
                  className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-light rounded-lg transition-colors"
                >
                  Voltar ao site
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
