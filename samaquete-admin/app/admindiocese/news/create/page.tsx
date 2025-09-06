"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function AdminDioceseNewsCreatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const diocese = searchParams.get('diocese') || 'Diocèse de Thiès'
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
    parish: "",
    date: new Date().toISOString().split('T')[0],
    status: "Brouillon",
    category: "Événement"
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.title || !formData.content || !formData.author || !formData.parish) {
      toast.error("Erreur de validation", "Veuillez remplir tous les champs obligatoires")
      return
    }

    // Récupérer les actualités existantes
    const stored = localStorage.getItem("admin_news")
    const existingNews = stored ? JSON.parse(stored) : []
    
    // Créer la nouvelle actualité
    const newNews = {
      id: Date.now(),
      ...formData,
      diocese: diocese
    }
    
    // Ajouter à la liste
    const updatedNews = [...existingNews, newNews]
    localStorage.setItem("admin_news", JSON.stringify(updatedNews))
    
    toast.success("Actualité créée", "L'actualité a été créée avec succès")
    router.push(`/admindiocese/news?diocese=${encodeURIComponent(diocese)}`)
  }

  const categories = ["Événement", "Formation", "Charité", "Liturgie", "Communauté"]
  const statuses = ["Brouillon", "Publié", "Archivé"]

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Link href={`/admindiocese/news?diocese=${encodeURIComponent(diocese)}`}>
              <Button variant="outline" size="sm" className="rounded-lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux actualités
              </Button>
            </Link>
            <div>
              <CardTitle className="text-3xl font-bold text-blue-900 mb-1">
                Nouvelle actualité - {diocese}
              </CardTitle>
              <p className="text-blue-800/80 text-sm">
                Créez une nouvelle actualité pour votre diocèse.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Titre *
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Titre de l'actualité"
                  className="bg-white/90 border-gray-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Auteur *
                </label>
                <Input
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="Nom de l'auteur"
                  className="bg-white/90 border-gray-200"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Paroisse *
                </label>
                <Input
                  name="parish"
                  value={formData.parish}
                  onChange={handleChange}
                  placeholder="Nom de la paroisse"
                  className="bg-white/90 border-gray-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Catégorie
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-gray-200 bg-white/90 text-blue-900 px-3"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Statut
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-gray-200 bg-white/90 text-blue-900 px-3"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Date de publication
              </label>
              <Input
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className="bg-white/90 border-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Contenu *
              </label>
              <Textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Contenu de l'actualité..."
                rows={8}
                className="bg-white/90 border-gray-200 resize-none"
                required
              />
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Link href={`/admindiocese/news?diocese=${encodeURIComponent(diocese)}`}>
                <Button variant="outline" className="rounded-lg">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" className="bg-blue-900 hover:bg-blue-800 text-white rounded-lg">
                <Save className="w-4 h-4 mr-2" />
                Créer l'actualité
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
