"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { createPrayerTime, getParishes, getChurches } from "@/lib/firestore/services"
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

export default function CreatePrayerTimePage() {
  const router = useRouter()
  const { claims } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [parishes, setParishes] = useState<any[]>([])
  const [formData, setFormData] = useState<Omit<PrayerTime, "id" | "createdAt" | "updatedAt">>({
    parishId: claims?.parishId || "",
    name: "",
    time: "",
    days: [],
    active: true,
    description: "",
    createdBy: "",
    createdByRole: claims?.role === "church_admin" ? "church_admin" : "parish_admin",
    churchId: claims?.churchId || undefined,
    validatedByParish: claims?.role === "parish_admin" ? true : false,
  })

  useEffect(() => {
    loadParishes()
  }, [])

  async function loadParishes() {
    try {
      if (claims?.role === "church_admin") {
        // Église peut choisir parmi les paroisses de son diocèse
        const data = await getParishes(claims.dioceseId)
        setParishes(data)
      }
      // Parish admin ne peut créer que pour sa paroisse (déjà pré-rempli)
    } catch (error) {
      console.error("Erreur chargement paroisses:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.parishId || !formData.name || !formData.time) {
      toast({
        title: "Erreur",
        description: "Paroisse, nom et heure sont requis",
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

    // Validation de l'heure (format HH:mm)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(formData.time)) {
      toast({
        title: "Erreur",
        description: "Format d'heure invalide. Utilisez HH:mm (ex: 06:30)",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Forcer le rafraîchissement du token pour avoir les claims à jour
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true)
      }
      
      // Récupérer l'ID de l'utilisateur
      const userId = auth.currentUser?.uid || ""
      
      const prayerTimeData = {
        ...formData,
        createdBy: userId,
      }
      
      await createPrayerTime(prayerTimeData)
      toast({
        title: "Succès",
        description: claims?.role === "church_admin" 
          ? "Heure de messe créée. En attente de validation par la paroisse."
          : "Heure de messe créée avec succès",
      })
      router.push("/admin/prayer-times")
    } catch (error) {
      console.error("Erreur création:", error)
      toast({
        title: "Erreur",
        description: "Impossible de créer l'heure de messe",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/prayer-times">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nouvelle heure de messe</h1>
          <p className="text-muted-foreground mt-2">
            Créez une heure de messe qui apparaîtra dans l'app mobile
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
                  {claims?.role === "church_admin" ? (
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
                      ? "Vous créez une heure de messe pour votre paroisse"
                      : claims?.role === "church_admin"
                      ? "Sélectionnez la paroisse dans laquelle créer cette heure de messe"
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
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Link href="/admin/prayer-times">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Création..." : "Créer l'heure de messe"}
          </Button>
        </div>
      </form>
    </div>
  )
}
