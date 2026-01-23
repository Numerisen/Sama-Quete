"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { UserClaims } from "@/types"

interface AuthContextType {
  user: any
  claims: UserClaims | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  claims: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [claims, setClaims] = useState<UserClaims | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier que auth est initialisé
    if (!auth) {
      console.error("Firebase Auth n'est pas initialisé")
      setLoading(false)
      return
    }

    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (cancelled) return

      setUser(user)
      if (user) {
        try {
          // Timeout de sécurité pour éviter un blocage infini (5 secondes)
          const tokenPromise = user.getIdTokenResult(true) // Force refresh
          const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => {
              reject(new Error("Timeout lors de la récupération du token"))
            }, 5000) // 5 secondes max
          })

          const token = await Promise.race([tokenPromise, timeoutPromise]) as any
          
          if (cancelled) return

          // Construire les claims à partir du token
          const userClaims = {
            role: token.claims.role as any,
            dioceseId: token.claims.dioceseId as string | undefined,
            parishId: token.claims.parishId as string | undefined,
            churchId: token.claims.churchId as string | undefined,
            mustChangePassword: token.claims.mustChangePassword as boolean | undefined,
          }
          setClaims(userClaims)
        } catch (error) {
          console.error("Erreur lors de la récupération du token:", error)
          // En cas d'erreur, continuer sans les claims plutôt que de bloquer
          setClaims(null)
        } finally {
          if (timeoutId) {
            clearTimeout(timeoutId)
          }
          if (!cancelled) {
            setLoading(false)
          }
        }
      } else {
        setClaims(null)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, claims, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
