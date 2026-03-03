/**
 * Validações para formulário de checkout
 */

export const validators = {
  // Validar CPF
  cpf: (cpf: string): { valid: boolean; message: string } => {
    const numbers = cpf.replace(/\D/g, "")
    if (numbers.length !== 11) {
      return { valid: false, message: "CPF deve conter 11 dígitos" }
    }
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(numbers)) {
      return { valid: false, message: "CPF inválido" }
    }
    
    return { valid: true, message: "" }
  },

  // Validar Email
  email: (email: string): { valid: boolean; message: string } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { valid: false, message: "Email inválido" }
    }
    return { valid: true, message: "" }
  },

  // Validar Número de Cartão
  cardNumber: (number: string): { valid: boolean; message: string } => {
    const numbers = number.replace(/\D/g, "")
    if (numbers.length < 13 || numbers.length > 19) {
      return { valid: false, message: "Número de cartão inválido" }
    }
    
    // Algoritmo de Luhn
    let sum = 0
    let isEven = false
    for (let i = numbers.length - 1; i >= 0; i--) {
      let digit = Number.parseInt(numbers[i], 10)
      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
      isEven = !isEven
    }
    
    const valid = sum % 10 === 0
    return { valid, message: valid ? "" : "Número de cartão inválido" }
  },

  // Validar Data de Expiração
  cardExpiry: (month: string, year: string): { valid: boolean; message: string } => {
    const m = Number.parseInt(month, 10)
    const y = Number.parseInt(year, 10)
    
    if (m < 1 || m > 12) {
      return { valid: false, message: "Mês de expiração inválido" }
    }
    
    const currentYear = new Date().getFullYear() % 100
    const currentMonth = new Date().getMonth() + 1
    
    if (y < currentYear || (y === currentYear && m < currentMonth)) {
      return { valid: false, message: "Cartão expirado" }
    }
    
    return { valid: true, message: "" }
  },

  // Validar CVV
  cardCvv: (cvv: string): { valid: boolean; message: string } => {
    const numbers = cvv.replace(/\D/g, "")
    if (numbers.length < 3 || numbers.length > 4) {
      return { valid: false, message: "CVV deve ter 3 ou 4 dígitos" }
    }
    return { valid: true, message: "" }
  },

  // Validar CEP
  cep: (cep: string): { valid: boolean; message: string } => {
    const numbers = cep.replace(/\D/g, "")
    if (numbers.length !== 8) {
      return { valid: false, message: "CEP deve conter 8 dígitos" }
    }
    return { valid: true, message: "" }
  },

  // Validar Telefone
  phone: (phone: string): { valid: boolean; message: string } => {
    const numbers = phone.replace(/\D/g, "")
    if (numbers.length < 10 || numbers.length > 11) {
      return { valid: false, message: "Telefone inválido" }
    }
    return { valid: true, message: "" }
  },

  // Validar Nome
  name: (name: string): { valid: boolean; message: string } => {
    const trimmed = name.trim()
    if (trimmed.length < 3) {
      return { valid: false, message: "Nome deve ter pelo menos 3 caracteres" }
    }
    return { valid: true, message: "" }
  },
}
