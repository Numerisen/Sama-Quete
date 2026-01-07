"use client"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function AdminEglisePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eglise = searchParams.get('eglise') || 'Église Saint Jean Bosco'

  useEffect(() => {
    // Rediriger vers le dashboard par défaut
    router.push(`/admineglise/dashboard?eglise=${encodeURIComponent(eglise)}`)
  }, [router, eglise])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-lg text-gray-600">Redirection vers le tableau de bord...</span>
      </div>
    </div>
  )
}
