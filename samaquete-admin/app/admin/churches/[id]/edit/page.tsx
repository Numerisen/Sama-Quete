"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { getChurch, updateChurch, getDioceses, getParishes } from "@/lib/firestore/services"
import { Church, FIXED_DIOCESES } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

export default function EditChurchPage() {
  const router = useRouter()
  const params = useParams()
  const { claims } = useAuth()
  const { toast } = useToast()
  const churchId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dioceses, setDioceses] = useState<any[]>([])
  const [parishes, setParishes] = useState<any[]>([])
  const [formData, setFormData] = useState<Omit<Church, "createdAt" | "updatedAt">>({
    churchId: "",
    name: "",
    parishId: "",
    dioceseId: "",
    isActive: true,
    address: "",
  })

  useEffect(() => {
    loadChurch()
    loadDioceses()
  }, [churchId])

  useEffect(() => {
    if (formData.dioceseId) {
      loadParishes(formData.dioceseId)
    }
  }, [formData.dioceseId])

  async function loadChurch() {
    try {
      const church = await getChurch(churchId)
      if (!church) {
        toast({
          title: "Erreur",
          description: "Église non trouvée",
          variant: "destructive",
        })
        router.push("/admin/churches")
        return
      }
      
      setFormData({
        churchId: church.churchId,
        name: church.name,
        parishId: church.parishId || "",
        dioceseId: church.dioceseId,
        isActive: church.isActive,
        address: church.address || "",
      })
    } catch (error) {
      console.error("Erreur chargement:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger l'église",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadDioceses() {
    try {
      if (claims?.role === "super_admin" || claims?.role === "archdiocese_admin") {
        setDioceses(FIXED_DIOCESES.map(d => ({ dioceseId: d.dioceseId, name: d.name })))
      } else {
        const diocese = FIXED_DIOCESES.find(d => d.dioceseId === claims?.dioceseId)
        if (diocese) {
          setDioceses([{ dioceseId: diocese.dioceseId, name: diocese.name }])
        }
      }
    } catch (error) {
      console.error("Erreur chargement diocèses:", error)
    }
  }

  async function loadParishes(dioceseId: string) {
    try {
      const data = await getParishes(dioceseId)
      setParishes(data)
    } catch (error) {
      console.error("Erreur chargement paroisses:", error)
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

    setSaving(true)
    try {
      await updateChurch(churchId, formData)
      toast({
        title: "Succès",
        description: "Église mise à jour avec succès",
      })
      router.push("/admin/churches")
    } catch (error) {
      console.error("Erreur mise à jour:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'église",
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
        <Link href="/admin/churches">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Modifier l'église</h1>
          <p className="text-muted-foreground mt-2">
            Modifiez les informations de l'église
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>
                Les informations principales de l'église
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dioceseId">Diocèse *</Label>
                  {(claims?.role === "super_admin" || claims?.role === "archdiocese_admin") ? (
                    <Select
                      value={formData.dioceseId}
                      onValueChange={(value) => setFormData({ ...formData, dioceseId: value, parishId: "" })}
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
                  ) : (
                    <Input
                      id="dioceseId"
                      value={formData.dioceseId}
                      disabled
                      className="bg-muted text-muted-foreground cursor-not-allowed"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parishId">Paroisse (optionnelle)</Label>
                  <Select
                    value={formData.parishId || "none"}
                    onValueChange={(value) => setFormData({ ...formData, parishId: value === "none" ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une paroisse (optionnel)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune paroisse</SelectItem>
                      {parishes.map((parish) => (
                        <SelectItem key={parish.parishId} value={parish.parishId}>
                          {parish.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'église *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Ex: Église Saint Paul"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="churchId">ID de l'église</Label>
                <Input
                  id="churchId"
                  value={formData.churchId}
                  disabled
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  L'ID ne peut pas être modifié
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse (optionnelle)</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Adresse de l'église"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Active</Label>
                  <p className="text-xs text-muted-foreground">
                    Une église inactive ne sera pas visible
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
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Link href="/admin/churches">
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
