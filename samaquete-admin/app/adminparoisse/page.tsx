"use client"
import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function AdminParoisseContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paroisse = searchParams.get('paroisse') || 'Paroisse Saint Jean Bosco'

  useEffect(() => {
    // Rediriger vers le dashboard par défaut
    router.push(`/adminparoisse/dashboard?paroisse=${encodeURIComponent(paroisse)}`)
  }, [router, paroisse])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-lg text-gray-600">Redirection vers le tableau de bord...</span>
      </div>
    </div>
  )
}

export default function AdminParoissePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg text-gray-600">Chargement...</span>
        </div>
      </div>
    }>
      <AdminParoisseContent />
    </Suspense>
  )
}
