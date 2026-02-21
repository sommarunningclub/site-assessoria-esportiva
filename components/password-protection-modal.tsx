"use client"

import { useState } from "react"
import { Lock, AlertCircle, Loader2 } from "lucide-react"

interface PasswordProtectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PasswordProtectionModal({ isOpen, onClose, onSuccess }: PasswordProtectionModalProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const correctPassword = "SOMMA2026"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Simulate a small delay for security appearance
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (password === correctPassword) {
      onSuccess()
      setPassword("")
    } else {
      setError("Senha incorreta. Tente novamente.")
    }

    setIsLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-[#ff4f2d]/20 p-3">
            <Lock className="w-6 h-6 text-[#ff4f2d]" />
          </div>
        </div>

        <h2 className="mb-2 text-center text-lg font-medium text-white">Acesso Protegido</h2>
        <p className="mb-6 text-center text-sm text-zinc-400">Digite a senha para acessar os planos</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(null)
              }}
              placeholder="Digite a senha"
              className={`w-full rounded-lg border bg-zinc-900/50 px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none transition-colors ${
                error ? "border-red-500" : "border-zinc-800 focus:border-[#ff4f2d]"
              }`}
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 p-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-zinc-800 py-2.5 font-light text-white hover:border-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="flex-1 rounded-lg bg-[#ff4f2d] py-2.5 font-light text-black hover:bg-[#ff6647] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Acessar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
