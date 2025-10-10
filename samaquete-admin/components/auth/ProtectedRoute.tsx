"use client"

import { useAuth } from '@/lib/auth-context'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'super_admin' | 'diocese' | 'paroisse' | 'any'
}

export default function ProtectedRoute({ children, requiredRole = 'any' }: ProtectedRouteProps) {
  const { user, userRole, loading, isAdmin, isDioceseAdmin, isParishAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
        return
      }

      // Attendre que le rôle soit chargé depuis Firestore
      if (!userRole) {
        return // Ne pas rediriger tant que le rôle n'est pas chargé
      }

      // Vérifier les rôles si spécifié
      if ((requiredRole === 'admin' || requiredRole === 'super_admin') && !isAdmin) {
        router.push('/admindiocese/dashboard')
        return
      }

      if (requiredRole === 'diocese' && !isDioceseAdmin) {
        router.push('/admin/dashboard')
        return
      }

      if (requiredRole === 'paroisse' && !isParishAdmin) {
        router.push('/admin/dashboard')
        return
      }
    }
  }, [user, userRole, loading, isAdmin, isDioceseAdmin, isParishAdmin, router, requiredRole])

  if (loading || (user && !userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Chargement des permissions...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
