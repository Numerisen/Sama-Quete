"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { createPrayer } from "@/lib/firestore/services"
import { Prayer, ContentStatus } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { auth } from "@/lib/firebase"

export default function CreatePrayerPage() {
  const router = useRouter()
  const { claims } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Omit<Prayer, "prayerId" | "createdAt" | "updatedAt">>({
    title: "",
    content: "",
    category: "",
    dioceseId: claims?.dioceseId || "",
    parishId: claims?.parishId || "",
    status: "draft",
    createdBy: "",
    createdByRole: claims?.role || "church_admin",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.content) {
      toast({
        title: "Erreur",
        description: "Titre et contenu sont requis",
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
      
      const prayerData = {
        ...formData,
        createdBy: userId,
      }
      
      await createPrayer(prayerData)
      toast({
        title: "Succès",
        description: "Prière créée avec succès",
      })
      router.push("/admin/prayers")
    } catch (error) {
      console.error("Erreur création:", error)
      toast({
        title: "Erreur",
        description: "Impossible de créer la prière",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/prayers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nouvelle prière</h1>
          <p className="text-muted-foreground mt-2">
            Créez une nouvelle prière (nécessite validation par la paroisse pour publication)
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informations de la prière</CardTitle>
              <CardDescription>
                Les informations principales de la prière
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Ex: Prière du matin"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenu *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  placeholder="Contenu de la prière..."
                  rows={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie (optionnelle)</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ex: Matin, Soir, Action de grâce"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as ContentStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="pending">En attente de validation</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Les prières créées par les églises nécessitent une validation par la paroisse pour être publiées
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Link href="/admin/prayers">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Création..." : "Créer la prière"}
          </Button>
        </div>
      </form>
    </div>
  )
}
