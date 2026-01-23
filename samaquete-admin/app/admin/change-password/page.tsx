"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ChangePasswordPage() {
  const router = useRouter()
  const { user, claims, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Vérifier l'état d'authentification via AuthProvider
  useEffect(() => {
    // Timeout de sécurité : si l'auth ne se charge pas après 10 secondes, rediriger
    const timeoutId = setTimeout(() => {
      if (authLoading) {
        console.error("Timeout: L'authentification prend trop de temps")
        router.push("/login")
      }
    }, 10000)

    // Attendre que l'auth soit chargé
    if (authLoading) {
      return () => clearTimeout(timeoutId)
    }

    // Si pas d'utilisateur, rediriger vers login
    if (!user) {
      clearTimeout(timeoutId)
      router.push("/login")
      return
    }

    // Si mustChangePassword est false, rediriger vers le dashboard
    if (claims && claims.mustChangePassword !== true) {
      clearTimeout(timeoutId)
      router.push("/admin/dashboard")
      return
    }

    clearTimeout(timeoutId)
  }, [user, claims, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPassword || !confirmPassword) {
      toast({
        title: "Erreur",
        description: "Tous les champs sont requis",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      if (!user || !user.email) {
        throw new Error("Utilisateur non connecté")
      }

      // Réauthentifier avec le mot de passe actuel (par défaut)
      const credential = EmailAuthProvider.credential(user.email, currentPassword || "J@ngubi26")
      await reauthenticateWithCredential(user, credential)

      // Mettre à jour le mot de passe
      await updatePassword(user, newPassword)

      // Mettre à jour les claims pour retirer mustChangePassword
      // Cela nécessite une route API car on ne peut pas modifier les claims côté client
      const response = await fetch("/api/users/update-password-claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: user.uid }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour des permissions")
      }

      // Forcer le rafraîchissement du token
      await user.getIdToken(true)

      toast({
        title: "Succès",
        description: "Mot de passe changé avec succès",
      })

      router.push("/admin/dashboard")
    } catch (error: any) {
      console.error("Erreur changement mot de passe:", error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de changer le mot de passe",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Afficher un loader pendant le chargement de l'auth
  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vérification de l'authentification...</p>
          <p className="text-xs text-muted-foreground mt-2">
            Si cela prend trop de temps, <button 
              onClick={() => router.push("/login")}
              className="text-primary underline hover:text-primary/80"
            >
              retournez à la connexion
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Changement de mot de passe requis</CardTitle>
          <CardDescription>
            Vous devez changer votre mot de passe avant de continuer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertDescription>
              Mot de passe par défaut : <strong>J@ngubi26</strong>
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="J@ngubi26"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Changement en cours..." : "Changer le mot de passe"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
