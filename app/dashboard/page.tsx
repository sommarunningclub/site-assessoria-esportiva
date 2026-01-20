"use client"

import { useEffect, useState } from "react"
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  BadgeCheck,
  RefreshCw,
  TrendingUp,
  ArrowLeft,
  Wifi,
  WifiOff,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface StatItem {
  label: string
  count: number
  value: number
  total: number
  netValue: number
}

interface Statistics {
  received: StatItem
  confirmed: StatItem
  pending: StatItem
  overdue: StatItem
}

interface ConnectionStatus {
  success: boolean
  message?: string
  error?: string
  configured: boolean
  balance?: {
    balance: number
  }
}

export default function DashboardPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null)
  const [testingConnection, setTestingConnection] = useState(true)

  const testConnection = async () => {
    setTestingConnection(true)
    try {
      const response = await fetch("/api/asaas/test")
      const data = await response.json()
      console.log("[v0] Connection test result:", data)
      setConnectionStatus(data)
      return data.success
    } catch (err) {
      console.log("[v0] Connection test error:", err)
      setConnectionStatus({
        success: false,
        error: err instanceof Error ? err.message : "Erro de conexão",
        configured: false,
      })
      return false
    } finally {
      setTestingConnection(false)
    }
  }

  const fetchStatistics = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/asaas/statistics")
      const data = await response.json()
      console.log("[v0] Statistics response:", data)

      if (!response.ok) {
        throw new Error(data.error || "Falha ao carregar estatísticas")
      }

      setStatistics(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.log("[v0] Statistics error:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      const connected = await testConnection()
      if (connected) {
        await fetchStatistics()
      } else {
        setLoading(false)
      }
    }
    init()
  }, [])

  const handleRefresh = async () => {
    await testConnection()
    await fetchStatistics()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const statCards = statistics
    ? [
        {
          key: "received",
          data: statistics.received,
          icon: CheckCircle2,
          color: "text-emerald-500",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/20",
        },
        {
          key: "confirmed",
          data: statistics.confirmed,
          icon: BadgeCheck,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/20",
        },
        {
          key: "pending",
          data: statistics.pending,
          icon: Clock,
          color: "text-amber-500",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/20",
        },
        {
          key: "overdue",
          data: statistics.overdue,
          icon: AlertTriangle,
          color: "text-red-500",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/20",
        },
      ]
    : []

  const totalReceived = statistics ? statistics.received.total + statistics.confirmed.total : 0
  const totalPending = statistics ? statistics.pending.total + statistics.overdue.total : 0

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Voltar</span>
              </Link>
              <div className="h-6 w-px bg-zinc-700 hidden sm:block" />
              <div className="flex items-center gap-3">
                <Image src="/logo-somma.png" alt="SOMMA" width={32} height={32} className="rounded-lg" />
                <div>
                  <h1 className="text-lg font-semibold">Dashboard Financeiro</h1>
                  <p className="text-xs text-zinc-500">SOMMA Club Membros</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading || testingConnection}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading || testingConnection ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${
            testingConnection
              ? "bg-zinc-800 border border-zinc-700"
              : connectionStatus?.success
                ? "bg-emerald-500/10 border border-emerald-500/20"
                : "bg-red-500/10 border border-red-500/20"
          }`}
        >
          {testingConnection ? (
            <>
              <RefreshCw className="w-5 h-5 text-zinc-400 animate-spin" />
              <div>
                <p className="text-sm font-medium text-zinc-300">Verificando conexão com Asaas...</p>
              </div>
            </>
          ) : connectionStatus?.success ? (
            <>
              <Wifi className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-emerald-400">Conexão com Asaas funcionando!</p>
                <p className="text-xs text-zinc-500">API Key configurada corretamente</p>
              </div>
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-400">
                  {connectionStatus?.configured ? "Erro na conexão com Asaas" : "API Key não configurada"}
                </p>
                <p className="text-xs text-zinc-500">
                  {connectionStatus?.error || "Verifique a variável ASAAS_API_KEY"}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <p className="text-xs text-zinc-500 mb-6">Última atualização: {lastUpdated.toLocaleString("pt-BR")}</p>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && !statistics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-pulse">
                <div className="h-10 w-10 bg-zinc-800 rounded-lg mb-4" />
                <div className="h-4 w-24 bg-zinc-800 rounded mb-2" />
                <div className="h-8 w-32 bg-zinc-800 rounded mb-2" />
                <div className="h-3 w-20 bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        {statistics && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map(({ key, data, icon: Icon, color, bgColor, borderColor }) => (
                <div
                  key={key}
                  className={`bg-zinc-900 border ${borderColor} rounded-xl p-6 hover:bg-zinc-800/50 transition-colors`}
                >
                  <div className={`${bgColor} w-10 h-10 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <p className="text-sm text-zinc-400 mb-1">{data.label}</p>
                  <p className="text-2xl font-bold mb-1">{formatCurrency(data.total)}</p>
                  <p className="text-xs text-zinc-500">
                    {data.count} {data.count === 1 ? "cobrança" : "cobranças"}
                  </p>
                </div>
              ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-emerald-500/20 w-10 h-10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Total Recebido</p>
                    <p className="text-xs text-zinc-500">Recebidas + Confirmadas</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-emerald-400">{formatCurrency(totalReceived)}</p>
              </div>

              <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-amber-500/20 w-10 h-10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Total a Receber</p>
                    <p className="text-xs text-zinc-500">Aguardando + Vencidas</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-amber-400">{formatCurrency(totalPending)}</p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
