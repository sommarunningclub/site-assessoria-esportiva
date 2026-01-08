"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, CreditCard, Loader2, Check, AlertCircle, Lock, MapPin, Tag, ChevronLeft, ShieldCheck } from "lucide-react"

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  plan: {
    name: string
    period: string
    price: number
    cycle: "MONTHLY" | "SEMIANNUALLY" | "YEARLY"
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

interface CouponData {
  valid: boolean
  code: string
  discount: number
  type: "PERCENTAGE" | "FIXED"
  description: string
}

interface CepResponse {
  cep: string
  state: string
  city: string
  neighborhood: string
  street: string
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

  // Calculate final price with discount
  const calculateFinalPrice = () => {
    if (!couponData) return plan.price

    if (couponData.type === "PERCENTAGE") {
      return plan.price * (1 - couponData.discount / 100)
    }
    return Math.max(0, plan.price - couponData.discount)
  }

  const finalPrice = calculateFinalPrice()
  const discountAmount = plan.price - finalPrice

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

  // Validate coupon
  const validateCoupon = async () => {
    if (!couponCode.trim()) return

    setIsCouponLoading(true)
    setCouponError(null)

    try {
      const response = await fetch("/api/asaas/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Cupom inválido")
      }

      setCouponData(data)
    } catch (err: any) {
      setCouponError(err.message)
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
      const subscriptionPayload: any = {
        customerId,
        billingType: "CREDIT_CARD",
        value: finalPrice,
        cycle: plan.cycle,
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

      // Add discount info if coupon applied
      if (couponData) {
        subscriptionPayload.discount = {
          value: couponData.type === "PERCENTAGE" ? couponData.discount : discountAmount,
          dueDateLimitDays: 0,
          type: couponData.type,
        }
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
                  <span className="text-xs text-zinc-500 uppercase tracking-wide">Valor</span>
                  {couponData && (
                    <p className="text-sm text-zinc-500 line-through">R$ {plan.price.toFixed(2).replace(".", ",")}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-2xl font-semibold text-white">
                    R$ {finalPrice.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-xs text-zinc-500">/mês</span>
                </div>
              </div>
              {couponData && (
                <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-green-400 text-xs">
                    <Tag className="w-3 h-3" />
                    <span>{couponData.code} aplicado</span>
                  </div>
                  <span className="text-green-400 text-xs font-medium">
                    -R$ {discountAmount.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Step: Customer Data */}
          {step === "customer" && (
            <form onSubmit={handleCustomerSubmit} className="space-y-3">
              {/* Coupon Field */}
              <div className="p-3 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
                <label className="block text-xs text-zinc-400 mb-2 flex items-center gap-1.5">
                  <Tag className="w-3 h-3" />
                  Cupom de desconto
                </label>
                {couponData ? (
                  <div className="flex items-center justify-between p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400 font-medium">{couponData.code}</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs text-zinc-400 hover:text-white transition-colors"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase())
                        setCouponError(null)
                      }}
                      className="flex-1 px-3 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff4f2d] transition-colors uppercase"
                      placeholder="Digite o código"
                    />
                    <button
                      type="button"
                      onClick={validateCoupon}
                      disabled={!couponCode.trim() || isCouponLoading}
                      className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      {isCouponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aplicar"}
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {couponError}
                  </p>
                )}
              </div>

              <div className="pt-2">
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
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || isCepLoading}
                className="w-full py-3 bg-[#ff4f2d] hover:bg-[#e6452a] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Continuar"
                )}
              </button>
            </form>
          )}

          {/* Step: Payment */}
          {step === "payment" && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              {/* Card Icon */}
              <div className="flex items-center justify-center gap-2 py-3 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
                <CreditCard className="w-5 h-5 text-[#ff4f2d]" />
                <span className="text-sm text-zinc-300">Pagamento com Cartão de Crédito</span>
              </div>

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
                      setCreditCardData({
                        ...creditCardData,
                        expiryMonth: e.target.value.replace(/\D/g, "").slice(0, 2),
                      })
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
                      setCreditCardData({
                        ...creditCardData,
                        expiryYear: e.target.value.replace(/\D/g, "").slice(0, 4),
                      })
                    }
                    className="w-full px-3 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff4f2d] transition-colors text-center"
                    placeholder="AAAA"
                  />
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={creditCardData.ccv}
                    onChange={(e) =>
                      setCreditCardData({ ...creditCardData, ccv: e.target.value.replace(/\D/g, "").slice(0, 4) })
                    }
                    className="w-full px-3 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff4f2d] transition-colors text-center"
                    placeholder="CVV"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#ff4f2d] hover:bg-[#e6452a] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pagar R$ {finalPrice.toFixed(2).replace(".", ",")}
                  </>
                )}
              </button>

              <p className="text-[10px] text-zinc-600 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Pagamento seguro criptografado
              </p>
            </form>
          )}

          {/* Step: Processing */}
          {step === "processing" && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#ff4f2d]/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#ff4f2d] animate-spin" />
              </div>
              <h3 className="text-lg font-medium text-white mb-1">Processando pagamento</h3>
              <p className="text-sm text-zinc-500">Aguarde alguns segundos...</p>
            </div>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <div className="py-8 text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Assinatura Realizada com Sucesso!</h3>
              <p className="text-sm text-zinc-400 mb-2">
                Parabéns! Você agora é membro do <span className="text-[#ff4f2d] font-medium">{plan.name}</span>
              </p>
              <p className="text-xs text-zinc-500 mb-8">
                Você receberá um e-mail de confirmação com todos os detalhes da sua assinatura.
              </p>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Plano</span>
                  <span className="text-white font-medium">{plan.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-zinc-400">Período</span>
                  <span className="text-white">{plan.period}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-zinc-400">Valor</span>
                  <span className="text-[#ff4f2d] font-medium">R$ {finalPrice.toFixed(2).replace(".", ",")}/mês</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-[#ff4f2d] hover:bg-[#e6452a] text-white font-medium rounded-xl transition-colors"
              >
                Concluir
              </button>
            </div>
          )}

          {/* Step: Error */}
          {step === "error" && (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Erro no pagamento</h3>
              <p className="text-sm text-zinc-400 mb-6">
                {error || "Não foi possível processar seu pagamento. Verifique os dados e tente novamente."}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep("payment")}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
                >
                  Tentar novamente
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-[#ff4f2d] hover:bg-[#e6452a] text-white font-medium rounded-xl transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 p-4 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-sm"></div>
      </div>
    </div>
  )
}
