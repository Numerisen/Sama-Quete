"use client"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function AdminParoissePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paroisse = searchParams.get('paroisse') || 'Paroisse Saint Jean Bosco'

  useEffect(() => {
    // Rediriger vers le dashboard par défaut
    router.push(`/adminparoisse/dashboard?paroisse=${encodeURIComponent(paroisse)}`)
  }, [router, paroisse])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-lg text-gray-600">Redirection vers le tableau de bord...</span>
      </div>
    </div>
  )
}

