"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { createParish, getDioceses } from "@/lib/firestore/services"
import { auth } from "@/lib/firebase"
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

export default function CreateParishPage() {
  const router = useRouter()
  const { claims } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [dioceses, setDioceses] = useState<Diocese[]>([])
  const [formData, setFormData] = useState<Omit<Parish, "createdAt" | "updatedAt">>({
    parishId: "",
    name: "",
    dioceseId: claims?.dioceseId || "",
    isActive: true,
    address: "",
    phone: "",
    email: "",
  })

  useEffect(() => {
    loadDioceses()
  }, [])

  async function loadDioceses() {
    try {
      // Super admin et archdiocese admin peuvent choisir n'importe quel diocèse
      if (claims?.role === "super_admin" || claims?.role === "archdiocese_admin") {
        const data = await getDioceses()
        setDioceses(data)
      } else {
        // Diocese admin ne peut créer que dans son diocèse
        setDioceses([])
      }
    } catch (error) {
      console.error("Erreur chargement diocèses:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.parishId || !formData.name || !formData.dioceseId) {
      toast({
        title: "Erreur",
        description: "ID, nom et diocèse sont requis",
        variant: "destructive",
      })
      return
    }

    // Validation : diocese admin ne peut créer que dans son diocèse
    if (claims?.role === "diocese_admin" && formData.dioceseId !== claims.dioceseId) {
      toast({
        title: "Erreur",
        description: "Vous ne pouvez créer des paroisses que dans votre diocèse",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Forcer le rafraîchissement du token pour avoir les claims à jour
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true) // true = force refresh
        console.log("🔄 Token rafraîchi")
      }
      
      console.log("🔍 Tentative de création paroisse:", {
        parishId: formData.parishId,
        name: formData.name,
        dioceseId: formData.dioceseId,
        role: claims?.role,
        userClaims: claims,
      })
      await createParish(formData)
      toast({
        title: "Succès",
        description: "Paroisse créée avec succès",
      })
      router.push("/admin/parishes")
    } catch (error: any) {
      console.error("❌ Erreur création:", error)
      console.error("📋 Détails:", {
        code: error.code,
        message: error.message,
        role: claims?.role,
        dioceseId: claims?.dioceseId,
        formData: formData,
      })
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la paroisse. Vérifiez vos permissions.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-3xl font-bold">Nouvelle paroisse</h1>
          <p className="text-muted-foreground mt-2">
            Créez une nouvelle paroisse
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
                <Label htmlFor="parishId">ID de la paroisse *</Label>
                <Input
                  id="parishId"
                  value={formData.parishId}
                  onChange={(e) => setFormData({ ...formData, parishId: e.target.value.toUpperCase() })}
                  placeholder="PAR_001"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Identifiant unique (ex: PAR_001, PAR_002)
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
                  ? "Vous créez une paroisse dans votre diocèse"
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
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Création..." : "Créer la paroisse"}
          </Button>
        </div>
      </form>
    </div>
  )
}
