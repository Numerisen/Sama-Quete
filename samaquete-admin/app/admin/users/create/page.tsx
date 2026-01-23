"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { getDioceses, getParishes, getChurches } from "@/lib/firestore/services"
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

export default function CreateUserPage() {
  const router = useRouter()
  const { claims } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
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

  useEffect(() => {
    if (claims?.role !== "super_admin") {
      router.push("/admin/users")
      return
    }
    loadDioceses()
  }, [])

  useEffect(() => {
    if (formData.entityType === "parish" && selectedDioceseId) {
      loadParishes(selectedDioceseId)
    } else if (formData.entityType === "church") {
      if (selectedParishId) {
        loadChurches(selectedParishId)
      } else if (selectedDioceseId) {
        // Charger les paroisses du diocèse sélectionné
        loadParishes(selectedDioceseId)
      }
    }
  }, [formData.entityType, selectedDioceseId, selectedParishId])

  useEffect(() => {
    // Mettre à jour le rôle selon le type d'entité
    const roleMap: Record<EntityType, UserRole> = {
      diocese: "diocese_admin",
      archdiocese: "archdiocese_admin",
      parish: "parish_admin",
      church: "church_admin",
    }
    setFormData(prev => ({ ...prev, role: roleMap[prev.entityType] }))
  }, [formData.entityType])

  async function loadDioceses() {
    try {
      const data = await getDioceses()
      setDioceses(data)
    } catch (error) {
      console.error("Erreur chargement diocèses:", error)
    }
  }

  async function loadParishes(dioceseId: string) {
    try {
      setParishes([]) // Réinitialiser avant le chargement
      const data = await getParishes(dioceseId)
      setParishes(data)
    } catch (error) {
      console.error("Erreur chargement paroisses:", error)
      setParishes([])
    }
  }

  async function loadChurches(parishId: string) {
    try {
      setChurches([]) // Réinitialiser avant le chargement
      const data = await getChurches(parishId)
      setChurches(data)
    } catch (error) {
      console.error("Erreur chargement églises:", error)
      setChurches([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.entityId) {
      toast({
        title: "Erreur",
        description: "Email et entité sont requis",
        variant: "destructive",
      })
      return
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Erreur",
        description: "Format d'email invalide",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          role: formData.role,
          entityType: formData.entityType,
          entityId: formData.entityId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création")
      }

      toast({
        title: "Succès",
        description: `Utilisateur créé avec succès. Mot de passe par défaut: ${data.defaultPassword}`,
      })
      router.push("/admin/users")
    } catch (error: any) {
      console.error("Erreur création:", error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer l'utilisateur",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (claims?.role !== "super_admin") {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nouvel utilisateur</h1>
          <p className="text-muted-foreground mt-2">
            Créez un nouvel utilisateur avec un mot de passe par défaut (J@ngubi26)
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informations de l'utilisateur</CardTitle>
              <CardDescription>
                Les informations principales de l'utilisateur
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
                  placeholder="exemple@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nom complet (optionnel)</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom complet de l'utilisateur"
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
                    setParishes([]) // Réinitialiser la liste des paroisses
                    setChurches([]) // Réinitialiser la liste des églises
                  }}
                  required
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
                  <Label htmlFor="entityId">Diocèse *</Label>
                  <Select
                    value={formData.entityId}
                    onValueChange={(value) => setFormData({ ...formData, entityId: value })}
                    required
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
                  <Label htmlFor="entityId">Archidiocèse *</Label>
                  <Select
                    value={formData.entityId}
                    onValueChange={(value) => setFormData({ ...formData, entityId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un archidiocèse" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAKAR">Dakar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.entityType === "parish" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="dioceseId">Diocèse *</Label>
                    <Select
                      value={selectedDioceseId}
                      onValueChange={(value) => {
                        setSelectedDioceseId(value)
                        setFormData({ ...formData, entityId: "" })
                        setParishes([]) // Réinitialiser la liste des paroisses
                      }}
                      required
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
                  <div className="space-y-2">
                    <Label htmlFor="entityId">Paroisse *</Label>
                    <Select
                      value={formData.entityId}
                      onValueChange={(value) => setFormData({ ...formData, entityId: value })}
                      required
                      disabled={!selectedDioceseId || parishes.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !selectedDioceseId 
                            ? "Sélectionnez d'abord un diocèse" 
                            : parishes.length === 0 
                            ? "Chargement des paroisses..." 
                            : "Sélectionner une paroisse"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {parishes.length === 0 ? (
                          <SelectItem value="loading" disabled>
                            {!selectedDioceseId ? "Sélectionnez un diocèse" : "Chargement..."}
                          </SelectItem>
                        ) : (
                          parishes.map((parish) => (
                            <SelectItem key={parish.parishId} value={parish.parishId}>
                              {parish.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {formData.entityType === "church" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="dioceseId">Diocèse *</Label>
                    <Select
                      value={selectedDioceseId}
                      onValueChange={(value) => {
                        setSelectedDioceseId(value)
                        setSelectedParishId("")
                        setFormData({ ...formData, entityId: "" })
                        setParishes([]) // Réinitialiser la liste des paroisses
                        setChurches([]) // Réinitialiser la liste des églises
                      }}
                      required
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
                  <div className="space-y-2">
                    <Label htmlFor="parishId">Paroisse *</Label>
                    <Select
                      value={selectedParishId}
                      onValueChange={(value) => {
                        setSelectedParishId(value)
                        setFormData({ ...formData, entityId: "" })
                        setChurches([]) // Réinitialiser la liste des églises
                      }}
                      required
                      disabled={!selectedDioceseId || parishes.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !selectedDioceseId 
                            ? "Sélectionnez d'abord un diocèse" 
                            : parishes.length === 0 
                            ? "Chargement des paroisses..." 
                            : "Sélectionner une paroisse"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {parishes.length === 0 ? (
                          <SelectItem value="loading" disabled>
                            {!selectedDioceseId ? "Sélectionnez un diocèse" : "Chargement..."}
                          </SelectItem>
                        ) : (
                          parishes.map((parish) => (
                            <SelectItem key={parish.parishId} value={parish.parishId}>
                              {parish.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entityId">Église *</Label>
                    <Select
                      value={formData.entityId}
                      onValueChange={(value) => setFormData({ ...formData, entityId: value })}
                      required
                      disabled={!selectedParishId || churches.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !selectedParishId 
                            ? "Sélectionnez d'abord une paroisse" 
                            : churches.length === 0 
                            ? "Chargement des églises..." 
                            : "Sélectionner une église"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {churches.length === 0 ? (
                          <SelectItem value="loading" disabled>
                            {!selectedParishId ? "Sélectionnez une paroisse" : "Chargement..."}
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
                  </div>
                </>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Mot de passe par défaut :</strong> J@ngubi26
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  L'utilisateur devra changer son mot de passe lors de sa première connexion.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Link href="/admin/users">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Création..." : "Créer l'utilisateur"}
          </Button>
        </div>
      </form>
    </div>
  )
}
