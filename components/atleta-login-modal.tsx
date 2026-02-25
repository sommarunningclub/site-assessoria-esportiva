"use client"

import { useState } from "react"
import { AlertCircle, LogIn } from "lucide-react"

interface AtletaLoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AtletaLoginModal({ isOpen, onClose }: AtletaLoginModalProps) {
  const [cpf, setCpf] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const cpfNumbers = cpf.replace(/\D/g, "")

    if (cpfNumbers.length !== 11) {
      setError("CPF deve conter 11 dígitos")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/atleta/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: cpfNumbers }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erro ao fazer login")
        return
      }

      // Login bem-sucedido, redirecionar para o portal
      window.location.href = "/atleta/portal"
    } catch {
      setError("Erro ao conectar ao servidor")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-light text-white mb-2">Atleta Somma</h2>
          <p className="text-sm text-zinc-400">Faça login com seu CPF para acessar seus benefícios</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">CPF</label>
            <input
              type="text"
              value={cpf}
              onChange={handleCPFChange}
              placeholder="000.000.000-00"
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
              disabled={isLoading}
              maxLength={14}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !cpf}
            className="w-full mt-6 px-6 py-2.5 bg-black hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 border border-zinc-800"
          >
            <LogIn className="w-4 h-4" />
            {isLoading ? "Conectando..." : "Entrar"}
          </button>
        </form>

        <button
          onClick={onClose}
          className="w-full mt-4 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-all"
        >
          Voltar
        </button>
      </div>
    </div>
  )
}
