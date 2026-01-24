"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { createParishNews } from "@/lib/firestore/services"
import { ParishNews, NEWS_CATEGORIES } from "@/types"
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

export default function CreateNewsPage() {
  const router = useRouter()
  const { claims, user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  // Super admin ne peut pas créer d'actualités
  useEffect(() => {
    if (claims?.role === "super_admin") {
      router.push("/admin/news")
      toast({
        title: "Accès refusé",
        description: "Le super admin ne peut pas créer d'actualités",
        variant: "destructive",
      })
    }
  }, [claims, router, toast])
  
  // Déterminer le scope selon le rôle
  const getScope = (): "parish" | "diocese" | "archdiocese" => {
    if (claims?.role === "archdiocese_admin") {
      return "archdiocese";
    }
    if (claims?.role === "diocese_admin") {
      return "diocese";
    }
    return "parish";
  };

  const [formData, setFormData] = useState<Omit<ParishNews, "id" | "createdAt" | "updatedAt">>({
    scope: getScope(),
    parishId: claims?.parishId || undefined,
    dioceseId: claims?.dioceseId || undefined,
    archdioceseId: claims?.role === "archdiocese_admin" ? "DAKAR" : undefined,
    title: "",
    content: "",
    excerpt: "",
    category: "Annonce",
    published: false,
    image: "",
    author: user?.displayName || user?.email || "",
    showAuthor: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation selon le scope
    if (formData.scope === "parish" && !formData.parishId) {
      toast({
        title: "Erreur",
        description: "Paroisse requise pour une actualité de paroisse",
        variant: "destructive",
      })
      return
    }
    
    if (formData.scope === "diocese" && !formData.dioceseId) {
      toast({
        title: "Erreur",
        description: "Diocèse requis pour une actualité diocésaine",
        variant: "destructive",
      })
      return
    }
    
    if (formData.scope === "archdiocese" && !formData.archdioceseId) {
      toast({
        title: "Erreur",
        description: "Archidiocèse requis pour une actualité archidiocésaine",
        variant: "destructive",
      })
      return
    }

    if (!formData.title || !formData.content) {
      toast({
        title: "Erreur",
        description: "Titre et contenu requis",
        variant: "destructive",
      })
      return
    }

    // Générer un excerpt si non fourni
    if (!formData.excerpt) {
      formData.excerpt = formData.content.substring(0, 150) + (formData.content.length > 150 ? "..." : "")
    }

    setLoading(true)
    try {
      await createParishNews(formData)
      toast({
        title: "Succès",
        description: "Actualité créée avec succès",
      })
      router.push("/admin/news")
    } catch (error) {
      console.error("Erreur création:", error)
      toast({
        title: "Erreur",
        description: "Impossible de créer l'actualité",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/news">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {formData.scope === "archdiocese" 
              ? "Nouvelle actualité archidiocésaine" 
              : formData.scope === "diocese"
              ? "Nouvelle actualité diocésaine"
              : "Nouvelle actualité de paroisse"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {formData.scope === "archdiocese"
              ? "Cette actualité sera visible dans toutes les paroisses de l'archidiocèse de Dakar"
              : formData.scope === "diocese"
              ? `Cette actualité sera visible dans toutes les paroisses du diocèse ${claims?.dioceseId}`
              : "Cette actualité sera visible dans l'app mobile pour votre paroisse"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>
                Les informations principales de l'actualité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Titre de l'actualité"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NEWS_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Résumé</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Résumé court de l'actualité (sera généré automatiquement si vide)"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Ce résumé apparaîtra dans la liste des actualités de l'app mobile
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenu *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Contenu complet de l'actualité"
                  rows={8}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Média</CardTitle>
              <CardDescription>Image de l'actualité</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image">URL de l'image</Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image && (
                  <div className="mt-2 aspect-video w-full overflow-hidden rounded-lg bg-muted">
                    <img
                      src={formData.image}
                      alt="Aperçu"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publication</CardTitle>
              <CardDescription>Paramètres de publication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="published">Publier immédiatement</Label>
                  <p className="text-xs text-muted-foreground">
                    L'actualité sera visible dans l'app mobile
                  </p>
                </div>
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Auteur</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Nom de l'auteur"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showAuthor">Afficher l'auteur</Label>
                  <p className="text-xs text-muted-foreground">
                    Afficher le nom de l'auteur dans l'app mobile
                  </p>
                </div>
                <Switch
                  id="showAuthor"
                  checked={formData.showAuthor}
                  onCheckedChange={(checked) => setFormData({ ...formData, showAuthor: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Link href="/admin/news">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Création..." : "Créer l'actualité"}
          </Button>
        </div>
      </form>
    </div>
  )
}
