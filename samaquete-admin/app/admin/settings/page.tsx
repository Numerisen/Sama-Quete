"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { getParish, getChurch, getDioceses } from "@/lib/firestore/services"
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { Building2, Church, Mail, Lock, Save, Edit, Download, FileSpreadsheet } from "lucide-react"

export default function SettingsPage() {
  const { user, claims } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Informations de l'entité
  const [entityName, setEntityName] = useState("")
  const [entityEmail, setEntityEmail] = useState("")
  const [entityId, setEntityId] = useState("")
  const [entityType, setEntityType] = useState<"parish" | "church" | "diocese" | "archdiocese" | "super_admin">("parish")
  const [editingName, setEditingName] = useState(false)
  const [editingEmail, setEditingEmail] = useState(false)
  const [editingId, setEditingId] = useState(false)
  const [tempName, setTempName] = useState("")
  const [tempEmail, setTempEmail] = useState("")
  const [tempId, setTempId] = useState("")
  
  // Mot de passe
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  useEffect(() => {
    loadEntityInfo()
  }, [claims, user])

  async function loadEntityInfo() {
    if (!claims || !user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Récupérer l'email de connexion
      setEntityEmail(user.email || "")
      
      // Récupérer les informations de l'entité selon le rôle
      if (claims.role === "parish_admin" && claims.parishId) {
        const parish = await getParish(claims.parishId)
        if (parish) {
          setEntityName(parish.name)
          setEntityId(parish.parishId)
          setEntityType("parish")
        }
      } else if (claims.role === "church_admin" && claims.churchId) {
        const church = await getChurch(claims.churchId)
        if (church) {
          setEntityName(church.name)
          setEntityId(church.churchId)
          setEntityType("church")
        }
      } else if (claims.role === "diocese_admin" && claims.dioceseId) {
        const dioceses = await getDioceses()
        const diocese = dioceses.find(d => d.dioceseId === claims.dioceseId)
        if (diocese) {
          setEntityName(diocese.name)
          setEntityId(diocese.dioceseId)
          setEntityType("diocese")
        }
      } else if (claims.role === "archdiocese_admin") {
        // Archidiocèse de Dakar
        setEntityName("Archidiocèse de Dakar")
        setEntityId("DAKAR")
        setEntityType("archdiocese")
      } else if (claims.role === "super_admin") {
        setEntityName("Super Administrateur")
        setEntityId("SUPER_ADMIN")
        setEntityType("super_admin")
      }
    } catch (error) {
      console.error("Erreur chargement informations:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les informations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getEntityTypeLabel = () => {
    if (!claims) return ""
    switch (claims.role) {
      case "parish_admin":
        return "Paroisse"
      case "church_admin":
        return "Église"
      case "diocese_admin":
        return "Diocèse"
      case "archdiocese_admin":
        return "Archidiocèse"
      case "super_admin":
        return "Super Administrateur"
      default:
        return "Entité"
    }
  }

  const handleNameUpdate = async () => {
    if (!tempName || tempName === entityName) {
      setEditingName(false)
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/entities/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entityType,
          entityId,
          newName: tempName,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de la mise à jour")
      }

      setEntityName(tempName)
      setEditingName(false)
      toast({
        title: "Succès",
        description: "Nom mis à jour avec succès",
      })
    } catch (error: any) {
      console.error("Erreur mise à jour nom:", error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le nom",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEmailUpdate = async () => {
    if (!tempEmail || tempEmail === entityEmail || !user) {
      setEditingEmail(false)
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/users/update-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user.uid,
          newEmail: tempEmail,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de la mise à jour")
      }

      setEntityEmail(tempEmail)
      setEditingEmail(false)
      toast({
        title: "Succès",
        description: "Email mis à jour avec succès. Veuillez vérifier votre nouvel email.",
      })
    } catch (error: any) {
      console.error("Erreur mise à jour email:", error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour l'email",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleIdUpdate = async () => {
    if (!tempId || tempId === entityId) {
      setEditingId(false)
      return
    }

    toast({
      title: "Information",
      description: "La modification de l'ID n'est pas supportée. Veuillez contacter un administrateur pour créer une nouvelle entité avec le nouvel ID.",
      variant: "default",
    })
    setEditingId(false)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPassword || !confirmPassword || !currentPassword) {
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

    if (!user || !user.email) {
      toast({
        title: "Erreur",
        description: "Utilisateur non connecté",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      // Réauthentifier l'utilisateur
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)

      // Mettre à jour le mot de passe
      await updatePassword(user, newPassword)

      toast({
        title: "Succès",
        description: "Mot de passe modifié avec succès",
      })

      // Réinitialiser le formulaire
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setShowPasswordForm(false)
    } catch (error: any) {
      console.error("Erreur modification mot de passe:", error)
      let errorMessage = "Impossible de modifier le mot de passe"
      
      if (error.code === "auth/wrong-password") {
        errorMessage = "Mot de passe actuel incorrect"
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Le mot de passe est trop faible"
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground mt-2">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground mt-2">
          Gérez les informations de votre {getEntityTypeLabel().toLowerCase()}
        </p>
      </div>

      {/* Informations de l'entité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {entityType === "church" ? (
              <Church className="h-5 w-5" />
            ) : (
              <Building2 className="h-5 w-5" />
            )}
            Informations de la {getEntityTypeLabel()}
          </CardTitle>
          <CardDescription>
            Informations générales de votre {getEntityTypeLabel().toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="entityName">Nom de la {getEntityTypeLabel().toLowerCase()}</Label>
              {!editingName && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTempName(entityName)
                    setEditingName(true)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              )}
            </div>
            {editingName ? (
              <div className="flex gap-2">
                <Input
                  id="entityName"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleNameUpdate}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingName(false)
                    setTempName("")
                  }}
                >
                  Annuler
                </Button>
              </div>
            ) : (
              <Input
                id="entityName"
                value={entityName}
                disabled
                className="bg-muted text-muted-foreground cursor-not-allowed"
              />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="entityId">ID de la {getEntityTypeLabel().toLowerCase()}</Label>
              {!editingId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTempId(entityId)
                    setEditingId(true)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              )}
            </div>
            {editingId ? (
              <div className="flex gap-2">
                <Input
                  id="entityId"
                  value={tempId}
                  onChange={(e) => setTempId(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleIdUpdate}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingId(false)
                    setTempId("")
                  }}
                >
                  Annuler
                </Button>
              </div>
            ) : (
              <Input
                id="entityId"
                value={entityId}
                disabled
                className="bg-muted text-muted-foreground cursor-not-allowed"
              />
            )}
            <p className="text-xs text-muted-foreground">
              Note: La modification de l'ID peut nécessiter la création d'une nouvelle entité.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Informations de connexion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Informations de connexion
          </CardTitle>
          <CardDescription>
            Email et mot de passe de votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="email">Email de connexion</Label>
              {!editingEmail && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTempEmail(entityEmail)
                    setEditingEmail(true)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              )}
            </div>
            {editingEmail ? (
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleEmailUpdate}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingEmail(false)
                    setTempEmail("")
                  }}
                >
                  Annuler
                </Button>
              </div>
            ) : (
              <Input
                id="email"
                type="email"
                value={entityEmail}
                disabled
                className="bg-muted text-muted-foreground cursor-not-allowed"
              />
            )}
            <p className="text-xs text-muted-foreground">
              Après modification, vous devrez vérifier votre nouvel email.
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Mot de passe</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Modifiez votre mot de passe pour sécuriser votre compte
                </p>
              </div>
              <Button
                variant={showPasswordForm ? "outline" : "default"}
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                <Lock className="h-4 w-4 mr-2" />
                {showPasswordForm ? "Annuler" : "Modifier le mot de passe"}
              </Button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel *</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Entrez votre mot de passe actuel"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe *</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Au moins 6 caractères"
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Le mot de passe doit contenir au moins 6 caractères
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirmez votre nouveau mot de passe"
                    minLength={6}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Enregistrement..." : "Enregistrer le mot de passe"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowPasswordForm(false)
                      setCurrentPassword("")
                      setNewPassword("")
                      setConfirmPassword("")
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Export de données (Super Admin uniquement) */}
      {claims?.role === "super_admin" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Export de données
            </CardTitle>
            <CardDescription>
              Exporter les données en format Excel ou CSV
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Export des dons</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/export/donations?format=csv")
                      if (!response.ok) throw new Error("Erreur lors de l'export")
                      const blob = await response.blob()
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = `dons_${new Date().toISOString().split("T")[0]}.csv`
                      document.body.appendChild(a)
                      a.click()
                      window.URL.revokeObjectURL(url)
                      document.body.removeChild(a)
                    } catch (error) {
                      console.error("Erreur export:", error)
                      toast({
                        title: "Erreur",
                        description: "Impossible d'exporter les dons",
                        variant: "destructive",
                      })
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter en CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/export/donations?format=excel")
                      if (!response.ok) throw new Error("Erreur lors de l'export")
                      const blob = await response.blob()
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = `dons_${new Date().toISOString().split("T")[0]}.csv`
                      document.body.appendChild(a)
                      a.click()
                      window.URL.revokeObjectURL(url)
                      document.body.removeChild(a)
                    } catch (error) {
                      console.error("Erreur export:", error)
                      toast({
                        title: "Erreur",
                        description: "Impossible d'exporter les dons",
                        variant: "destructive",
                      })
                    }
                  }}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exporter en Excel
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Export des utilisateurs (Admin)</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/export/users?format=csv")
                      if (!response.ok) throw new Error("Erreur lors de l'export")
                      const blob = await response.blob()
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = `utilisateurs_${new Date().toISOString().split("T")[0]}.csv`
                      document.body.appendChild(a)
                      a.click()
                      window.URL.revokeObjectURL(url)
                      document.body.removeChild(a)
                    } catch (error) {
                      console.error("Erreur export:", error)
                      toast({
                        title: "Erreur",
                        description: "Impossible d'exporter les utilisateurs",
                        variant: "destructive",
                      })
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter en CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/export/users?format=excel")
                      if (!response.ok) throw new Error("Erreur lors de l'export")
                      const blob = await response.blob()
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = `utilisateurs_${new Date().toISOString().split("T")[0]}.csv`
                      document.body.appendChild(a)
                      a.click()
                      window.URL.revokeObjectURL(url)
                      document.body.removeChild(a)
                    } catch (error) {
                      console.error("Erreur export:", error)
                      toast({
                        title: "Erreur",
                        description: "Impossible d'exporter les utilisateurs",
                        variant: "destructive",
                      })
                    }
                  }}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exporter en Excel
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Export des fidèles (App mobile)</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/export/fideles?format=csv")
                      if (!response.ok) throw new Error("Erreur lors de l'export")
                      const blob = await response.blob()
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = `fideles_${new Date().toISOString().split("T")[0]}.csv`
                      document.body.appendChild(a)
                      a.click()
                      window.URL.revokeObjectURL(url)
                      document.body.removeChild(a)
                    } catch (error) {
                      console.error("Erreur export:", error)
                      toast({
                        title: "Erreur",
                        description: "Impossible d'exporter les fidèles",
                        variant: "destructive",
                      })
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter en CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/export/fideles?format=excel")
                      if (!response.ok) throw new Error("Erreur lors de l'export")
                      const blob = await response.blob()
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = `fideles_${new Date().toISOString().split("T")[0]}.csv`
                      document.body.appendChild(a)
                      a.click()
                      window.URL.revokeObjectURL(url)
                      document.body.removeChild(a)
                    } catch (error) {
                      console.error("Erreur export:", error)
                      toast({
                        title: "Erreur",
                        description: "Impossible d'exporter les fidèles",
                        variant: "destructive",
                      })
                    }
                  }}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exporter en Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
