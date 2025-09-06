"use client"

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'diocese' | 'any'
}

export default function ProtectedRoute({ children, requiredRole = 'any' }: ProtectedRouteProps) {
  const { user, loading, isAdmin, isDioceseAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
        return
      }

      // Vérifier les rôles si spécifié
      if (requiredRole === 'admin' && !isAdmin) {
        router.push('/admindiocese/dashboard')
        return
      }

      if (requiredRole === 'diocese' && !isDioceseAdmin) {
        router.push('/admin/dashboard')
        return
      }
    }
  }, [user, loading, isAdmin, isDioceseAdmin, router, requiredRole])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
