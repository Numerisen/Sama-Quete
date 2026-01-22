"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { getParish, updateParish } from "@/lib/firestore/services"
import { Parish } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

export default function ParishInfoPage() {
  const { claims } = useAuth()
  const { toast } = useToast()
  const [parish, setParish] = useState<Parish | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  })

  useEffect(() => {
    if (claims?.parishId) {
      loadParish()
    }
  }, [claims])

  async function loadParish() {
    try {
      const data = await getParish(claims!.parishId!)
      if (data) {
        setParish(data)
        setFormData({
          name: data.name || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
        })
      }
    } catch (error) {
      console.error("Erreur chargement paroisse:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!claims?.parishId) return

    setSaving(true)
    try {
      await updateParish(claims.parishId, formData)
      toast({
        title: "Succès",
        description: "Informations de la paroisse mises à jour",
      })
      await loadParish()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les informations",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  if (!parish) {
    return <div>Paroisse non trouvée</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Informations paroisse</h1>
        <p className="text-muted-foreground mt-2">
          Gérez les informations de votre paroisse
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails de la paroisse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la paroisse</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
