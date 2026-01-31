"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, CreditCard, Loader2, Check, AlertCircle, Lock, MapPin, ChevronLeft, ShieldCheck, Tag } from "lucide-react"

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  plan: {
    name: string
    period: string
    price: number
    totalPrice: number
    installments: number
    cycle: "MONTHLY"
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
  code: string
  discount: number
  type: "PERCENTAGE" | "FIXED"
  description: string
}

export function CheckoutModal({ isOpen, onClose, plan }: CheckoutModalProps) {
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      document.body.style.position = "fixed"
      document.body.style.width = "100%"
      document.body.style.top = `-${window.scrollY}px`
    } else {
      const scrollY = document.body.style.top
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.width = ""
      document.body.style.top = ""
      window.scrollTo(0, Number.parseInt(scrollY || "0") * -1)
    }

    return () => {
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.width = ""
      document.body.style.top = ""
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setStep("customer")
      setIsLoading(false)
      setError(null)
      setCustomerId(null)
      setCepError(null)
      setCouponCode("")
      setCouponData(null)
      setCouponError(null)
    }
  }, [isOpen])

  // Calculate discounted price
  const getDiscountedPrice = (originalPrice: number) => {
    if (!couponData) return originalPrice
    if (couponData.type === "PERCENTAGE") {
      return originalPrice * (1 - couponData.discount / 100)
    }
    return Math.max(0, originalPrice - couponData.discount)
  }

  const discountedPrice = getDiscountedPrice(plan.price)
  const discountedTotal = getDiscountedPrice(plan.totalPrice)

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Digite um código de cupom")
      return
    }

    setIsCouponLoading(true)
    setCouponError(null)

    try {
      const response = await fetch("/api/asaas/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      })

      const data = await response.json()

      if (!response.ok) {
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

  if (!isOpen) return null

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
      const subscriptionPayload = {
        customerId,
        billingType: "CREDIT_CARD",
        value: discountedPrice, // Usar preço com desconto se houver cupom
        cycle: "MONTHLY",
        maxPayments: plan.installments > 1 ? plan.installments : undefined, // Se for semestral (6) ou anual (12), limita as parcelas
        description: `${plan.name} - ${plan.period}${couponData ? ` (Cupom: ${couponData.code})` : ""}`,
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 touch-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md max-h-[90vh] overflow-hidden bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col touch-auto">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {step === "payment" && (
              <button
                onClick={() => setStep("customer")}
                className="p-1.5 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-base font-medium text-white">
                {step === "customer" && "Seus dados"}
                {step === "payment" && "Pagamento"}
                {step === "processing" && "Processando"}
                {step === "success" && "Sucesso"}
                {step === "error" && "Erro"}
              </h2>
              <p className="text-xs text-zinc-500">
                {plan.name} • {plan.period}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4">
          {/* Price Summary - Always visible */}
          {(step === "customer" || step === "payment") && (
            <div className="mb-4 p-3 bg-gradient-to-r from-zinc-900 to-zinc-900/50 rounded-xl border border-zinc-800">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wide">
                    {plan.installments > 1 ? `${plan.installments}x sem juros` : "Mensal recorrente"}
                  </span>
                  {plan.installments > 1 && (
                    <p className="text-xs text-zinc-600 mt-1">
                      Total: {couponData ? (
                        <>
                          <span className="line-through text-zinc-600">R$ {plan.totalPrice.toFixed(2).replace(".", ",")}</span>
                          {" "}
                          <span className="text-green-500">R$ {discountedTotal.toFixed(2).replace(".", ",")}</span>
                        </>
                      ) : (
                        `R$ ${plan.totalPrice.toFixed(2).replace(".", ",")}`
                      )}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {couponData ? (
                    <>
                      <span className="text-sm line-through text-zinc-600">
                        R$ {plan.price.toFixed(2).replace(".", ",")}
                      </span>
                      <br />
                      <span className="text-2xl font-semibold text-green-500">
                        R$ {discountedPrice.toFixed(2).replace(".", ",")}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-semibold text-white">
                      R$ {plan.price.toFixed(2).replace(".", ",")}
                    </span>
                  )}
                  <span className="text-xs text-zinc-500">/mês</span>
                </div>
              </div>
              {couponData && (
                <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-xs text-green-500">{couponData.code}: {couponData.description}</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Coupon Field - Only on customer step */}
          {step === "customer" && !couponData && (
            <div className="mb-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase())
                      setCouponError(null)
                    }}
                    placeholder="Cupom de desconto"
                    className={`w-full pl-9 pr-3 py-2.5 bg-zinc-900/50 border rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors ${
                      couponError ? "border-red-500" : "border-zinc-800 focus:border-[#ff4f2d]"
                    }`}
                  />
                </div>
                <button
                  type="button"
                  onClick={validateCoupon}
                  disabled={isCouponLoading || !couponCode.trim()}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCouponLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Aplicar"
                  )}
                </button>
              </div>
              {couponError && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {couponError}
                </p>
              )}
            </div>
          )}

          {/* Step: Customer Data */}
          {step === "customer" && (
            <form onSubmit={handleCustomerSubmit} className="space-y-3">
              <div>
                <h3 className="text-xs text-zinc-400 mb-3 uppercase tracking-wide">Dados pessoais</h3>

                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff4f2d] transition-colors"
                    placeholder="Nome completo"
                  />

                  <input
                    type="email"
                    required
                    value={customerData.email}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff4f2d] transition-colors"
                    placeholder="E-mail"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={customerData.cpfCnpj}
                      onChange={(e) => setCustomerData({ ...customerData, cpfCnpj: formatCPF(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff4f2d] transition-colors"
                      placeholder="CPF"
                    />

                    <input
                      type="text"
                      required
                      value={customerData.phone}
                      onChange={(e) => setCustomerData({ ...customerData, phone: formatPhone(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff4f2d] transition-colors"
                      placeholder="WhatsApp"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <h3 className="text-xs text-zinc-400 mb-3 uppercase tracking-wide flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  Endereço
                </h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-3 relative">
                      <input
                        type="text"
                        required
                        value={customerData.postalCode}
                        onChange={(e) => handleCepChange(e.target.value)}
                        className={`w-full px-3 py-2.5 bg-zinc-900/50 border rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors ${
                          cepError ? "border-red-500" : "border-zinc-800 focus:border-[#ff4f2d]"
                        }`}
                        placeholder="CEP"
                      />
                      {isCepLoading && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ff4f2d] animate-spin" />
                      )}
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        required
                        value={customerData.addressNumber}
                        onChange={(e) => setCustomerData({ ...customerData, addressNumber: e.target.value })}
                        className="w-full px-3 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff4f2d] transition-colors"
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
                    <div className="p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50 space-y-2">
                      <p className="text-xs text-green-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Endereço encontrado
                      </p>
                      <p className="text-sm text-zinc-300">
                        {customerData.street}, {customerData.neighborhood}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {customerData.city} - {customerData.state}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !customerData.street}
                className="w-full py-3 bg-[#ff4f2d] hover:bg-[#e6452a] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

          {/* Step: Payment */}
          {step === "payment" && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <h3 className="text-xs text-zinc-400 mb-3 uppercase tracking-wide flex items-center gap-1.5">
                  <CreditCard className="w-3 h-3" />
                  Dados do cartão
                </h3>

                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    value={creditCardData.holderName}
                    onChange={(e) => setCreditCardData({ ...creditCardData, holderName: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff4f2d] transition-colors uppercase"
                    placeholder="Nome no cartão"
                  />

                  <input
                    type="text"
                    required
                    value={creditCardData.number}
                    onChange={(e) => setCreditCardData({ ...creditCardData, number: formatCardNumber(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff4f2d] transition-colors"
                    placeholder="Número do cartão"
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
                      className="w-full px-3 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff4f2d] transition-colors text-center"
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
                      className="w-full px-3 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff4f2d] transition-colors text-center"
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
                        className="w-full px-3 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff4f2d] transition-colors text-center"
                        placeholder="CVV"
                      />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>Pagamento seguro com criptografia SSL</span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#ff4f2d] hover:bg-[#e6452a] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

          {/* Step: Processing */}
          {step === "processing" && (
            <div className="py-12 text-center">
              <Loader2 className="w-12 h-12 text-[#ff4f2d] animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Processando pagamento</h3>
              <p className="text-sm text-zinc-400">Aguarde enquanto confirmamos seu pagamento...</p>
            </div>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Pagamento confirmado!</h3>
              <p className="text-sm text-zinc-400 mb-6">
                Sua assinatura do {plan.name} foi ativada com sucesso.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          )}

          {/* Step: Error */}
          {step === "error" && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Erro no pagamento</h3>
              <p className="text-sm text-zinc-400 mb-2">{error || "Ocorreu um erro ao processar seu pagamento."}</p>
              <p className="text-xs text-zinc-500 mb-6">Verifique os dados do cartão e tente novamente.</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setStep("payment")}
                  className="px-6 py-2.5 bg-[#ff4f2d] hover:bg-[#e6452a] text-white font-medium rounded-lg transition-colors"
                >
                  Tentar novamente
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
