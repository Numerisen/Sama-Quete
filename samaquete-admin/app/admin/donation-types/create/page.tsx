"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { createDonationType, getParishes, getDioceses } from "@/lib/firestore/services"
import { auth } from "@/lib/firebase"
import { DonationType } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Heart, Gift, Church, Users, Flame } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

export default function CreateDonationTypePage() {
  const router = useRouter()
  const { claims } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [parishes, setParishes] = useState<any[]>([])
  const [dioceses, setDioceses] = useState<any[]>([])
  const [selectedDioceseId, setSelectedDioceseId] = useState<string>("")
  const [formData, setFormData] = useState<Omit<DonationType, "donationTypeId" | "createdAt" | "updatedAt">>({
    name: "",
    description: "",
    icon: "heart",
    defaultAmounts: [1000, 2000, 5000, 10000],
    parishId: claims?.parishId || "",
    dioceseId: claims?.dioceseId || "",
    isActive: true,
    createdBy: "",
    createdByRole: claims?.role || "parish_admin",
    churchId: claims?.churchId || undefined,
    validatedByParish: claims?.role === "parish_admin" || claims?.role === "super_admin" ? true : false,
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedDioceseId && claims?.role === "super_admin") {
      loadParishesForDiocese(selectedDioceseId)
    }
  }, [selectedDioceseId])

  async function loadData() {
    try {
      if (claims?.role === "super_admin") {
        const diocesesData = await getDioceses()
        setDioceses(diocesesData)
        if (formData.parishId) {
          // Si une paroisse est déjà sélectionnée, charger les paroisses de son diocèse
          const parishesData = await getParishes(formData.dioceseId)
          setParishes(parishesData)
        }
      } else if (claims?.role === "church_admin") {
        // Église peut choisir parmi les paroisses de son diocèse
        const parishesData = await getParishes(claims.dioceseId)
        setParishes(parishesData)
      }
      // Parish admin ne peut créer que pour sa paroisse (déjà pré-rempli)
    } catch (error) {
      console.error("Erreur chargement données:", error)
    }
  }

  async function loadParishesForDiocese(dioceseId: string) {
    try {
      const parishesData = await getParishes(dioceseId)
      setParishes(parishesData)
      // Réinitialiser la paroisse si le diocèse change
      setFormData(prev => ({ ...prev, parishId: "", dioceseId }))
    } catch (error) {
      console.error("Erreur chargement paroisses:", error)
    }
  }

  const handleAmountChange = (index: number, value: string) => {
    const amount = parseInt(value) || 0
    const newAmounts = [...formData.defaultAmounts]
    newAmounts[index] = amount
    setFormData({ ...formData, defaultAmounts: newAmounts })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.parishId) {
      toast({
        title: "Erreur",
        description: "Nom et paroisse sont requis",
        variant: "destructive",
      })
      return
    }

    if (formData.defaultAmounts.some(amount => amount <= 0)) {
      toast({
        title: "Erreur",
        description: "Tous les montants doivent être supérieurs à 0",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Forcer le rafraîchissement du token
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true)
      }
      
      // Récupérer l'ID de l'utilisateur
      const userId = auth.currentUser?.uid || ""
      
      const donationTypeData = {
        ...formData,
        createdBy: userId,
      }
      
      await createDonationType(donationTypeData)
      toast({
        title: "Succès",
        description: claims?.role === "church_admin"
          ? "Type de don créé. En attente de validation par la paroisse."
          : "Type de don créé avec succès",
      })
      router.push("/admin/donation-types")
    } catch (error) {
      console.error("Erreur création:", error)
      toast({
        title: "Erreur",
        description: "Impossible de créer le type de don",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/donation-types">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nouveau type de don</h1>
          <p className="text-muted-foreground mt-2">
            {claims?.role === "church_admin"
              ? "Créez un type de don (nécessite validation par la paroisse)"
              : "Créez un nouveau type de don pour la paroisse"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>
                Les informations principales du type de don
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {claims?.role === "super_admin" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="dioceseId">Diocèse *</Label>
                    <Select
                      value={selectedDioceseId}
                      onValueChange={setSelectedDioceseId}
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
                      value={formData.parishId}
                      onValueChange={(value) => {
                        const selectedParish = parishes.find(p => p.parishId === value)
                        setFormData({ 
                          ...formData, 
                          parishId: value,
                          dioceseId: selectedParish?.dioceseId || ""
                        })
                      }}
                      required
                      disabled={!selectedDioceseId}
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
                </>
              )}

              {claims?.role === "church_admin" && (
                <div className="space-y-2">
                  <Label htmlFor="parishId">Paroisse *</Label>
                  <Select
                    value={formData.parishId}
                    onValueChange={(value) => {
                      const selectedParish = parishes.find(p => p.parishId === value)
                      setFormData({ 
                        ...formData, 
                        parishId: value,
                        dioceseId: selectedParish?.dioceseId || ""
                      })
                    }}
                    required
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
                  <p className="text-xs text-muted-foreground">
                    Sélectionnez la paroisse pour laquelle créer ce type de don
                  </p>
                </div>
              )}

              {claims?.role === "parish_admin" && (
                <div className="space-y-2">
                  <Label htmlFor="parishId">Paroisse *</Label>
                  <Input
                    id="parishId"
                    value={formData.parishId}
                    disabled
                    className="bg-muted text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Vous créez un type de don pour votre paroisse
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Ex: Quête, Denier, Cierge"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnelle)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du type de don..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icône *</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une icône" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="heart">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        <span>Cœur</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="gift">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4" />
                        <span>Cadeau</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="church">
                      <div className="flex items-center gap-2">
                        <Church className="h-4 w-4" />
                        <span>Église</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="users">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Utilisateurs</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="flame">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4" />
                        <span>Flamme</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {formData.icon && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    {formData.icon === "heart" && <Heart className="h-5 w-5 text-red-500" />}
                    {formData.icon === "gift" && <Gift className="h-5 w-5 text-yellow-500" />}
                    {formData.icon === "church" && <Church className="h-5 w-5 text-purple-500" />}
                    {formData.icon === "users" && <Users className="h-5 w-5 text-green-500" />}
                    {formData.icon === "flame" && <Flame className="h-5 w-5 text-orange-500" />}
                    <span className="text-sm font-medium">
                      {formData.icon === "heart" && "Cœur"}
                      {formData.icon === "gift" && "Cadeau"}
                      {formData.icon === "church" && "Église"}
                      {formData.icon === "users" && "Utilisateurs"}
                      {formData.icon === "flame" && "Flamme"}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Montants par défaut (FCFA) *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="space-y-1">
                      <Label htmlFor={`amount-${index}`} className="text-xs">
                        Montant {index + 1}
                      </Label>
                      <Input
                        id={`amount-${index}`}
                        type="number"
                        value={formData.defaultAmounts[index] || 0}
                        onChange={(e) => handleAmountChange(index, e.target.value)}
                        required
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Définissez 4 montants par défaut pour ce type de don
                </p>
              </div>

            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Link href="/admin/donation-types">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Création..." : "Créer le type de don"}
          </Button>
        </div>
      </form>
    </div>
  )
}
