"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { getPrayerTimeById, updatePrayerTime, getParishes } from "@/lib/firestore/services"
import { auth } from "@/lib/firebase"
import { PrayerTime, DAYS_OF_WEEK } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

export default function EditPrayerTimePage() {
  const router = useRouter()
  const params = useParams()
  const { claims } = useAuth()
  const { toast } = useToast()
  const prayerTimeId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [parishes, setParishes] = useState<any[]>([])
  const [formData, setFormData] = useState<Omit<PrayerTime, "id" | "createdAt" | "updatedAt">>({
    parishId: "",
    name: "",
    time: "",
    days: [],
    active: true,
    description: "",
    createdBy: "",
    createdByRole: "parish_admin",
    churchId: undefined,
    validatedByParish: false,
  })

  useEffect(() => {
    loadPrayerTime()
  }, [prayerTimeId])

  useEffect(() => {
    loadParishes()
  }, [claims])

  async function loadPrayerTime() {
    try {
      const prayerTime = await getPrayerTimeById(prayerTimeId)
      if (!prayerTime) {
        toast({
          title: "Erreur",
          description: "Heure de prière non trouvée",
          variant: "destructive",
        })
        router.push("/admin/prayer-times")
        return
      }
      
      setFormData({
        parishId: prayerTime.parishId,
        name: prayerTime.name,
        time: prayerTime.time,
        days: prayerTime.days || [],
        active: prayerTime.active,
        description: prayerTime.description || "",
        createdBy: prayerTime.createdBy || "",
        createdByRole: prayerTime.createdByRole || "parish_admin",
        churchId: prayerTime.churchId || undefined,
        validatedByParish: prayerTime.validatedByParish || false,
      })
    } catch (error) {
      console.error("Erreur chargement:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger l'heure de messe",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadParishes() {
    try {
      if (claims?.role === "super_admin" || claims?.role === "archdiocese_admin") {
        const data = await getParishes(undefined)
        setParishes(data)
      } else if (claims?.role === "diocese_admin") {
        const data = await getParishes(claims.dioceseId)
        setParishes(data)
      } else if (claims?.role === "church_admin") {
        // Église peut choisir parmi les paroisses de son diocèse
        const data = await getParishes(claims.dioceseId)
        setParishes(data)
      }
      // Parish admin ne peut modifier que pour sa paroisse (déjà chargée)
    } catch (error) {
      console.error("Erreur chargement paroisses:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.time) {
      toast({
        title: "Erreur",
        description: "Nom et heure sont requis",
        variant: "destructive",
      })
      return
    }

    if (formData.days.length === 0) {
      toast({
        title: "Erreur",
        description: "Sélectionnez au moins un jour",
        variant: "destructive",
      })
      return
    }

    // Validation de l'heure
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(formData.time)) {
      toast({
        title: "Erreur",
        description: "Format d'heure invalide. Utilisez HH:mm",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      // Forcer le rafraîchissement du token pour avoir les claims à jour
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true)
      }
      
      console.log("📝 Données de mise à jour:", formData)
      await updatePrayerTime(prayerTimeId, formData)
      toast({
        title: "Succès",
        description: "Heure de messe mise à jour avec succès",
      })
      router.push("/admin/prayer-times")
    } catch (error) {
      console.error("Erreur mise à jour:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'heure de messe",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }))
  }

  const selectAllDays = () => {
    setFormData(prev => ({ ...prev, days: [...DAYS_OF_WEEK] }))
  }

  const clearAllDays = () => {
    setFormData(prev => ({ ...prev, days: [] }))
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/prayer-times">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Modifier l'heure de messe</h1>
          <p className="text-muted-foreground mt-2">
            Modifiez les informations de l'heure de messe
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>
                Les informations principales de l'heure de messe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="parishId">Paroisse *</Label>
                  {(claims?.role === "super_admin" || 
                    claims?.role === "archdiocese_admin" || 
                    claims?.role === "diocese_admin" ||
                    claims?.role === "church_admin") ? (
                    <Select
                      value={formData.parishId}
                      onValueChange={(value) => setFormData({ ...formData, parishId: value })}
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
                  ) : (
                    <Input
                      id="parishId"
                      value={formData.parishId}
                      disabled
                      className="bg-muted text-muted-foreground cursor-not-allowed"
                    />
                  )}
                  <p className="text-xs text-muted-foreground">
                    {claims?.role === "parish_admin" 
                      ? "Vous modifiez une heure de messe pour votre paroisse"
                      : claims?.role === "church_admin"
                      ? "Sélectionnez la paroisse pour cette heure de messe"
                      : claims?.role === "diocese_admin"
                      ? "Sélectionnez une paroisse de votre diocèse"
                      : "Sélectionnez la paroisse"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la messe *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Ex: Messe du matin, Messe du soir, Messe dominicale"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Heure *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Format: HH:mm (ex: 06:30, 12:15, 18:45)
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Jours de la semaine *</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={selectAllDays}
                    >
                      Tout sélectionner
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearAllDays}
                    >
                      Tout désélectionner
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={day}
                        checked={formData.days.includes(day)}
                        onCheckedChange={() => toggleDay(day)}
                      />
                      <Label
                        htmlFor={day}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {day}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.days.length === 0 && (
                  <p className="text-xs text-destructive">
                    Sélectionnez au moins un jour
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnelle)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de cette heure de messe"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="active">Active</Label>
                  <p className="text-xs text-muted-foreground">
                    Une heure inactive ne sera pas visible dans l'app mobile
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
              </div>

              {claims?.role === "parish_admin" && 
               formData.parishId === claims.parishId && 
               !formData.validatedByParish && 
               formData.createdByRole === "church_admin" && (
                <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="validate">Valider cette heure de messe</Label>
                    <p className="text-xs text-muted-foreground">
                      Cette heure de messe a été créée par une église et nécessite votre validation pour être visible dans l'app mobile
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
                    ✓ Cette heure de messe a été validée par la paroisse et est visible dans l'app mobile
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Link href="/admin/prayer-times">
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
