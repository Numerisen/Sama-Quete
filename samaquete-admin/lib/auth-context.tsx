"use client"

import {
    User,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth } from './firebase'
import { UserRole, getUserRole, hasPermission, updateLastLogin } from './user-service'

interface AuthContextType {
  user: User | null
  userRole: UserRole | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
  isDioceseAdmin: boolean
  isParishAdmin: boolean
  hasPermission: (permission: keyof UserRole['permissions']) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      if (user) {
        // Récupérer le rôle de l'utilisateur depuis Firestore
        try {
          const role = await getUserRole(user.uid)
          setUserRole(role)
          
          // Mettre à jour le dernier login
          if (role) {
            await updateLastLogin(user.uid)
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du rôle:', error)
          setUserRole(null)
        }
      } else {
        setUserRole(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password)
  }

  const logout = async () => {
    await signOut(auth)
  }

  // Déterminer le type d'utilisateur basé sur le rôle Firestore
  const isAdmin = userRole?.role === 'super_admin'
  const isDioceseAdmin = userRole?.role === 'diocese_admin'
  const isParishAdmin = userRole?.role === 'parish_admin'

  // Fonction pour vérifier les permissions
  const checkPermission = (permission: keyof UserRole['permissions']) => {
    return hasPermission(userRole, permission)
  }

  const value = {
    user,
    userRole,
    loading,
    signIn,
    signUp,
    logout,
    isAdmin,
    isDioceseAdmin,
    isParishAdmin,
    hasPermission: checkPermission
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
