"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { getDioceses, getParishes, getChurches, getParish, getChurch } from "@/lib/firestore/services"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

type EntityType = "diocese" | "archdiocese" | "parish" | "church"
type UserRole = "diocese_admin" | "archdiocese_admin" | "parish_admin" | "church_admin"

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const uid = params.uid as string
  const { claims } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dioceses, setDioceses] = useState<any[]>([])
  const [parishes, setParishes] = useState<any[]>([])
  const [churches, setChurches] = useState<any[]>([])
  const [selectedDioceseId, setSelectedDioceseId] = useState<string>("")
  const [selectedParishId, setSelectedParishId] = useState<string>("")
  
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    entityType: "diocese" as EntityType,
    entityId: "",
    role: "diocese_admin" as UserRole,
  })

  const loadUserData = useCallback(async () => {
    try {
      const response = await fetch("/api/users/list")
      if (!response.ok) throw new Error("Erreur chargement utilisateurs")
      const data = await response.json()
      const user = data.users.find((u: any) => u.uid === uid)
      
      if (!user) {
        toast({
          title: "Erreur",
          description: "Utilisateur non trouvé",
          variant: "destructive",
        })
        router.push("/admin/users")
        return
      }

      // Déterminer le type d'entité
      let entityType: EntityType = "diocese"
      let entityId = ""
      if (user.archdioceseId) {
        entityType = "archdiocese"
        entityId = user.archdioceseId
      } else if (user.dioceseId) {
        entityType = "diocese"
        entityId = user.dioceseId
        setSelectedDioceseId(user.dioceseId)
      } else if (user.parishId) {
        entityType = "parish"
        entityId = user.parishId
        setSelectedParishId(user.parishId)
        // Récupérer le dioceseId depuis la paroisse
        const parish = await getParish(user.parishId)
        if (parish) {
          setSelectedDioceseId(parish.dioceseId)
        }
      } else if (user.churchId) {
        entityType = "church"
        entityId = user.churchId
        // Récupérer le dioceseId depuis l'église (paroisse optionnelle)
        const church = await getChurch(user.churchId)
        if (church) {
          setSelectedDioceseId(church.dioceseId)
          if (church.parishId) {
            setSelectedParishId(church.parishId)
          }
        }
      }

      setFormData({
        email: user.email || "",
        name: user.displayName || "",
        entityType,
        entityId,
        role: user.role as UserRole,
      })
    } catch (error) {
      console.error("Erreur chargement utilisateur:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de l'utilisateur",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [uid, router, toast])

  const loadDioceses = useCallback(async () => {
    try {
      const data = await getDioceses()
      setDioceses(data)
    } catch (error) {
      console.error("Erreur chargement diocèses:", error)
    }
  }, [])

  const loadParishes = useCallback(async (dioceseId: string) => {
    try {
      const data = await getParishes(dioceseId)
      setParishes(data)
    } catch (error) {
      console.error("Erreur chargement paroisses:", error)
    }
  }, [])

  const loadChurches = useCallback(async (parishId?: string, dioceseId?: string) => {
    try {
      const data = await getChurches(parishId, dioceseId)
      setChurches(data)
    } catch (error) {
      console.error("Erreur chargement églises:", error)
    }
  }, [])

  useEffect(() => {
    if (claims?.role !== "super_admin") {
      router.push("/admin/users")
      return
    }
    loadUserData()
    loadDioceses()
  }, [uid, claims?.role, router, loadUserData, loadDioceses])

  useEffect(() => {
    if (formData.entityType === "parish" && selectedDioceseId) {
      loadParishes(selectedDioceseId)
    } else if (formData.entityType === "church" && selectedDioceseId) {
      // Charger les églises directement par diocèse (sans paroisse)
      loadChurches(selectedParishId || undefined, selectedDioceseId)
    }
  }, [formData.entityType, selectedDioceseId, selectedParishId, loadParishes, loadChurches])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.name) {
      toast({
        title: "Erreur",
        description: "Email et nom sont requis",
        variant: "destructive",
      })
      return
    }

    // Validation pour église
    if (formData.entityType === "church" && !selectedDioceseId) {
      toast({
        title: "Erreur",
        description: "Diocèse requis pour un utilisateur église",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const requestBody: any = {
        uid,
        email: formData.email,
        name: formData.name,
        role: formData.role,
        entityType: formData.entityType,
        entityId: formData.entityId,
      }
      
      // Pour église, ajouter le dioceseId
      if (formData.entityType === "church" && selectedDioceseId) {
        requestBody.dioceseId = selectedDioceseId
      }
      
      // Pour paroisse, ajouter le dioceseId si disponible
      if (formData.entityType === "parish" && selectedDioceseId) {
        requestBody.dioceseId = selectedDioceseId
      }
      
      // Pour église, ajouter le parishId si disponible
      if (formData.entityType === "church" && selectedParishId) {
        requestBody.parishId = selectedParishId
      }
      
      const response = await fetch("/api/users/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de la mise à jour")
      }

      toast({
        title: "Succès",
        description: "Utilisateur mis à jour avec succès. Les modifications seront visibles après rafraîchissement.",
      })
      
      // Attendre un peu pour que les claims soient propagés
      await new Promise(resolve => setTimeout(resolve, 500))
      
      router.push("/admin/users")
    } catch (error: any) {
      console.error("Erreur mise à jour:", error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour l'utilisateur",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6">Chargement...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Modifier l'utilisateur</h1>
          <p className="text-muted-foreground mt-2">
            Modifiez les informations de l'utilisateur
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>
              Informations de base de l'utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="user@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Nom de l'utilisateur"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entityType">Type d'entité *</Label>
              <Select
                value={formData.entityType}
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    entityType: value as EntityType,
                    entityId: "",
                  })
                  setSelectedDioceseId("")
                  setSelectedParishId("")
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diocese">Diocèse</SelectItem>
                  <SelectItem value="archdiocese">Archidiocèse</SelectItem>
                  <SelectItem value="parish">Paroisse</SelectItem>
                  <SelectItem value="church">Église</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.entityType === "diocese" && (
              <div className="space-y-2">
                <Label htmlFor="diocese">Diocèse *</Label>
                <Select
                  value={formData.entityId}
                  onValueChange={(value) => {
                    setFormData({ ...formData, entityId: value })
                    setSelectedDioceseId(value)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un diocèse" />
                  </SelectTrigger>
                  <SelectContent>
                    {dioceses.map((diocese) => (
                      <SelectItem key={diocese.dioceseId} value={diocese.dioceseId}>
                        {diocese.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.entityType === "archdiocese" && (
              <div className="space-y-2">
                <Label htmlFor="archdiocese">Archidiocèse *</Label>
                <Input
                  id="archdiocese"
                  value="DAKAR"
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Seul l'archidiocèse de Dakar est disponible
                </p>
                <input type="hidden" value="DAKAR" />
              </div>
            )}

            {formData.entityType === "parish" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="diocese">Diocèse *</Label>
                  <Select
                    value={selectedDioceseId}
                    onValueChange={(value) => {
                      setSelectedDioceseId(value)
                      setFormData({ ...formData, entityId: "" })
                      setSelectedParishId("")
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un diocèse" />
                    </SelectTrigger>
                    <SelectContent>
                      {dioceses.map((diocese) => (
                        <SelectItem key={diocese.dioceseId} value={diocese.dioceseId}>
                          {diocese.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedDioceseId && (
                  <div className="space-y-2">
                    <Label htmlFor="parish">Paroisse *</Label>
                    <Select
                      value={formData.entityId}
                      onValueChange={(value) => {
                        setFormData({ ...formData, entityId: value })
                        setSelectedParishId(value)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une paroisse" />
                      </SelectTrigger>
                      <SelectContent>
                        {parishes.map((parish) => (
                          <SelectItem key={parish.parishId} value={parish.parishId}>
                            {parish.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            {formData.entityType === "church" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="diocese">Diocèse *</Label>
                  <Select
                    value={selectedDioceseId}
                    onValueChange={(value) => {
                      setSelectedDioceseId(value)
                      setFormData({ ...formData, entityId: "" })
                      setSelectedParishId("")
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un diocèse" />
                    </SelectTrigger>
                    <SelectContent>
                      {dioceses.map((diocese) => (
                        <SelectItem key={diocese.dioceseId} value={diocese.dioceseId}>
                          {diocese.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedDioceseId && (
                  <div className="space-y-2">
                    <Label htmlFor="church">Église *</Label>
                    <Select
                      value={formData.entityId}
                      onValueChange={(value) => {
                        setFormData({ ...formData, entityId: value })
                      }}
                      required
                      disabled={!selectedDioceseId || churches.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !selectedDioceseId
                            ? "Sélectionnez d'abord un diocèse"
                            : churches.length === 0
                            ? "Aucune église trouvée"
                            : "Sélectionner une église"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {churches.length === 0 && selectedDioceseId ? (
                          <SelectItem value="__no_church__" disabled>
                            Aucune église trouvée
                          </SelectItem>
                        ) : (
                          churches.map((church) => (
                            <SelectItem key={church.churchId} value={church.churchId}>
                              {church.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {churches.length === 0 && selectedDioceseId && (
                      <p className="text-xs text-red-600">
                        Aucune église trouvée pour ce diocèse. Veuillez créer une église avant de modifier l'utilisateur.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">Rôle *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diocese_admin">Admin Diocèse</SelectItem>
                  <SelectItem value="archdiocese_admin">Admin Archidiocèse</SelectItem>
                  <SelectItem value="parish_admin">Admin Paroisse</SelectItem>
                  <SelectItem value="church_admin">Admin Église</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
              <Link href="/admin/users">
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
