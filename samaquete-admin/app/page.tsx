"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const { user, userRole, loading, logout } = useAuth()
  const router = useRouter()

  // Redirection automatique basée sur le rôle
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Si pas d'utilisateur connecté, rediriger vers login
        router.push('/login')
        return
      }
      
      if (user && userRole) {
        // Si utilisateur connecté avec rôle, rediriger selon le rôle (hiérarchie complète)
        switch (userRole.role) {
          case 'super_admin':
            router.push('/admin/dashboard')
            break
          case 'archdiocese_admin':
            router.push('/adminarchdiocese/dashboard')
            break
          case 'diocese_admin':
            router.push('/admindiocese/dashboard')
            break
          case 'parish_admin':
            const parishName = userRole.parishId || 'Paroisse'
            router.push(`/adminparoisse/dashboard?paroisse=${encodeURIComponent(parishName)}`)
            break
          case 'church_admin':
            const churchName = userRole.churchId || 'Église'
            router.push(`/admineglise/dashboard?eglise=${encodeURIComponent(churchName)}`)
            break
          default:
            router.push('/login')
        }
      }
    }
  }, [user, userRole, loading, router])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

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

  // Si pas d'utilisateur connecté, ne rien afficher (redirection en cours)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Redirection vers la connexion...</p>
        </div>
      </div>
    )
  }

  // Si l'utilisateur n'a pas de rôle défini, afficher un message d'erreur
  if (!userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-black">
              Rôle non défini
            </CardTitle>
            <p className="text-black">Votre compte n'a pas de rôle défini</p>
          </CardHeader>
          <CardContent>
            <p className="text-black mb-4 text-center">
              Contactez l'administrateur pour définir votre rôle.
            </p>
            <Button variant="outline" onClick={handleLogout} className="w-full">
              Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Affichage de redirection pendant que la redirection se fait
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p>Redirection vers votre tableau de bord...</p>
      </div>
    </div>
  )
}
