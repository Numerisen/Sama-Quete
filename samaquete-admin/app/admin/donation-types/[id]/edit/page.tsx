"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { getDonationTypeById, updateDonationType, getParishes } from "@/lib/firestore/services"
import { DonationType } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Heart, Gift, Church, Users, Flame } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

export default function EditDonationTypePage() {
  const router = useRouter()
  const params = useParams()
  const { claims } = useAuth()
  const { toast } = useToast()
  const donationTypeId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [parishes, setParishes] = useState<any[]>([])
  const [formData, setFormData] = useState<Omit<DonationType, "donationTypeId" | "createdAt" | "updatedAt">>({
    name: "",
    description: "",
    icon: "heart",
    defaultAmounts: [1000, 2000, 5000, 10000],
    parishId: "",
    dioceseId: "",
    isActive: true,
    createdBy: "",
    createdByRole: "parish_admin",
    churchId: undefined,
    validatedByParish: false,
  })

  useEffect(() => {
    loadDonationType()
    loadParishes()
  }, [donationTypeId])

  async function loadDonationType() {
    try {
      const donationType = await getDonationTypeById(donationTypeId)
      
      if (!donationType) {
        toast({
          title: "Erreur",
          description: "Type de don non trouvé",
          variant: "destructive",
        })
        router.push("/admin/donation-types")
        return
      }
      
      setFormData({
        name: donationType.name,
        description: donationType.description || "",
        icon: donationType.icon || "heart",
        defaultAmounts: donationType.defaultAmounts || [1000, 2000, 5000, 10000],
        parishId: donationType.parishId,
        dioceseId: donationType.dioceseId,
        isActive: donationType.isActive,
        createdBy: donationType.createdBy,
        createdByRole: donationType.createdByRole,
        churchId: donationType.churchId || undefined,
        validatedByParish: donationType.validatedByParish || false,
      })
    } catch (error) {
      console.error("Erreur chargement:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger le type de don",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadParishes() {
    try {
      if (claims?.role === "church_admin") {
        const data = await getParishes(claims.dioceseId)
        setParishes(data)
      }
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

    setSaving(true)
    try {
      // Forcer le rafraîchissement du token
      const { auth } = await import("@/lib/firebase")
      if (auth && auth.currentUser) {
        await auth.currentUser.getIdToken(true)
      }
      
      await updateDonationType(donationTypeId, formData)
      toast({
        title: "Succès",
        description: "Type de don mis à jour avec succès",
      })
      router.push("/admin/donation-types")
    } catch (error) {
      console.error("Erreur mise à jour:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le type de don",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>Chargement...</div>
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
          <h1 className="text-3xl font-bold">Modifier le type de don</h1>
          <p className="text-muted-foreground mt-2">
            Modifiez les informations du type de don
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
              </div>


              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Actif</Label>
                  <p className="text-xs text-muted-foreground">
                    Un type inactif ne sera pas visible dans l'app mobile
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>

              {claims?.role === "parish_admin" && 
               formData.parishId === claims.parishId && 
               !formData.validatedByParish && 
               formData.createdByRole === "church_admin" && (
                <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="validate">Valider ce type de don</Label>
                    <p className="text-xs text-muted-foreground">
                      Ce type de don a été créé par une église et nécessite votre validation pour être visible dans l'app mobile
                    </p>
                  </div>
                  <Switch
                    id="validate"
                    checked={formData.validatedByParish}
                    onCheckedChange={(checked) => setFormData({ ...formData, validatedByParish: checked })}
                  />
                </div>
              )}

              {formData.validatedByParish && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ Ce type de don a été validé par la paroisse et est visible dans l'app mobile
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Link href="/admin/donation-types">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </div>
      </form>
    </div>
  )
}
