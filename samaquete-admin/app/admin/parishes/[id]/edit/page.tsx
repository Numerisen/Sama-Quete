"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { getParish, updateParish, getDioceses } from "@/lib/firestore/services"
import { Parish, Diocese, FIXED_DIOCESES } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

export default function EditParishPage() {
  const router = useRouter()
  const params = useParams()
  const { claims } = useAuth()
  const { toast } = useToast()
  const parishId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dioceses, setDioceses] = useState<Diocese[]>([])
  const [formData, setFormData] = useState<Omit<Parish, "createdAt" | "updatedAt">>({
    parishId: "",
    name: "",
    dioceseId: "",
    isActive: true,
    address: "",
    phone: "",
    email: "",
  })

  useEffect(() => {
    loadParish()
    loadDioceses()
  }, [parishId])

  async function loadParish() {
    try {
      const parish = await getParish(parishId)
      if (!parish) {
        toast({
          title: "Erreur",
          description: "Paroisse non trouvée",
          variant: "destructive",
        })
        router.push("/admin/parishes")
        return
      }
      
      setFormData({
        parishId: parish.parishId,
        name: parish.name,
        dioceseId: parish.dioceseId,
        isActive: parish.isActive,
        address: parish.address || "",
        phone: parish.phone || "",
        email: parish.email || "",
      })
    } catch (error) {
      console.error("Erreur chargement:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger la paroisse",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadDioceses() {
    try {
      // Super admin et archdiocese admin peuvent choisir n'importe quel diocèse
      if (claims?.role === "super_admin" || claims?.role === "archdiocese_admin") {
        const data = await getDioceses()
        setDioceses(data)
      }
    } catch (error) {
      console.error("Erreur chargement diocèses:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.dioceseId) {
      toast({
        title: "Erreur",
        description: "Nom et diocèse sont requis",
        variant: "destructive",
      })
      return
    }

    // Validation : diocese admin ne peut modifier que dans son diocèse
    if (claims?.role === "diocese_admin" && formData.dioceseId !== claims.dioceseId) {
      toast({
        title: "Erreur",
        description: "Vous ne pouvez modifier que les paroisses de votre diocèse",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      await updateParish(parishId, formData)
      toast({
        title: "Succès",
        description: "Paroisse mise à jour avec succès",
      })
      router.push("/admin/parishes")
    } catch (error: any) {
      console.error("Erreur mise à jour:", error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour la paroisse",
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
        <Link href="/admin/parishes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Modifier la paroisse</h1>
          <p className="text-muted-foreground mt-2">
            Modifiez les informations de la paroisse
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>
              Les informations principales de la paroisse
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="parishId">ID de la paroisse</Label>
                <Input
                  id="parishId"
                  value={formData.parishId}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  L'ID ne peut pas être modifié
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nom de la paroisse *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Paroisse Saint..."
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dioceseId">Diocèse *</Label>
              {(claims?.role === "super_admin" || claims?.role === "archdiocese_admin") ? (
                <Select
                  value={formData.dioceseId}
                  onValueChange={(value) => setFormData({ ...formData, dioceseId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un diocèse" />
                  </SelectTrigger>
                  <SelectContent>
                    {FIXED_DIOCESES.map((diocese) => (
                      <SelectItem key={diocese.dioceseId} value={diocese.dioceseId}>
                        {diocese.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="dioceseId"
                  value={formData.dioceseId}
                  disabled
                  className="bg-muted"
                />
              )}
              <p className="text-xs text-muted-foreground">
                {claims?.role === "diocese_admin" 
                  ? "Vous ne pouvez modifier que les paroisses de votre diocèse"
                  : "Sélectionnez le diocèse de cette paroisse"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Adresse complète de la paroisse"
                rows={2}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+221 XX XXX XX XX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="paroisse@example.com"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Paroisse active</Label>
                <p className="text-xs text-muted-foreground">
                  Une paroisse inactive ne sera pas visible dans l'app mobile
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Link href="/admin/parishes">
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
