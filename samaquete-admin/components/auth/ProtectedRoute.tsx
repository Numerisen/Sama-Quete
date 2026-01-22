"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, getUserClaims } from "@/lib/auth"
import { UserRole, UserClaims } from "@/types"
import { canAccess } from "@/lib/permissions"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
  requiredDioceseId?: string
  requiredParishId?: string
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredDioceseId,
  requiredParishId,
}: ProtectedRouteProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser()
      if (!user) {
        router.push("/login")
        return
      }

      const claims = await getUserClaims()
      if (!claims) {
        router.push("/login")
        return
      }

      if (requiredRole) {
        const hasAccess = canAccess(
          claims,
          requiredRole,
          requiredDioceseId,
          requiredParishId
        )
        if (!hasAccess) {
          router.push("/unauthorized")
          return
        }
      }

      setIsAuthorized(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [router, requiredRole, requiredDioceseId, requiredParishId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
