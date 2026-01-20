"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Cookie } from "lucide-react"

function generateVisitorId() {
  return "visitor_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent")
    if (!consent) {
      setTimeout(() => setShowBanner(true), 1000)
    }
  }, [])

  const saveConsent = async (consentType: string, analyticsEnabled: boolean, marketingEnabled: boolean) => {
    setIsLoading(true)

    try {
      let visitorId = localStorage.getItem("visitor_id")
      if (!visitorId) {
        visitorId = generateVisitorId()
        localStorage.setItem("visitor_id", visitorId)
      }

      await fetch("/api/cookies/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          consentType,
          essentialCookies: true,
          analyticsCookies: analyticsEnabled,
          marketingCookies: marketingEnabled,
        }),
      })

      localStorage.setItem(
        "cookie_consent",
        JSON.stringify({
          type: consentType,
          essential: true,
          analytics: analyticsEnabled,
          marketing: marketingEnabled,
          timestamp: new Date().toISOString(),
        }),
      )

      setShowBanner(false)
    } catch (error) {
      console.error("[v0] Error saving consent:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptAll = () => {
    saveConsent("all", true, true)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-[9999]">
      <div className="max-w-sm bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-2xl shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#ff4f2d]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Cookie className="w-4 h-4 text-[#ff4f2d]" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-zinc-300 leading-relaxed">
              Usamos cookies para melhorar sua experiência.{" "}
              <Link href="/politica-de-cookies" className="text-[#ff4f2d] hover:underline">
                Saiba mais
              </Link>
            </p>
            <button
              onClick={handleAcceptAll}
              disabled={isLoading}
              className="mt-3 w-full px-4 py-2 bg-[#ff4f2d] hover:bg-[#ff6b4a] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? "..." : "Aceitar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
