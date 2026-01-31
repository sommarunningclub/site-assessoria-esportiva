'use client'

import React from "react"

import { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'

interface AccessCodeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AccessCodeModal({ isOpen, onClose, onSuccess }: AccessCodeModalProps) {
  const [code, setCode] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validate code
    if (code.trim() === '#somma@2026') {
      onSuccess()
      setCode('')
      setIsLoading(false)
    } else {
      setError('Código inválido. Tente novamente.')
      setCode('')
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-50 w-full max-w-md mx-4 p-6 sm:p-8 rounded-2xl border border-zinc-800 bg-[#09090b]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#ff4f2d]/10">
              <Lock className="w-6 h-6 text-[#ff4f2d]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-light text-white">Código de Acesso</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Description */}
        <p className="text-sm sm:text-base text-zinc-400 mb-6">
          Digite o código de acesso para prosseguir com a assinatura.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Code Input */}
          <div className="relative">
            <input
              type={showCode ? 'text' : 'password'}
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError('')
              }}
              placeholder="Digite o código"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff4f2d] transition-colors font-light"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowCode(!showCode)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
              aria-label={showCode ? 'Ocultar código' : 'Mostrar código'}
            >
              {showCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="w-full py-3 px-4 rounded-lg bg-[#ff4f2d] text-black font-light hover:bg-[#ff6647] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Verificando...' : 'Continuar'}
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-lg border border-zinc-800 text-zinc-300 font-light hover:bg-zinc-900 transition-colors"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  )
}
