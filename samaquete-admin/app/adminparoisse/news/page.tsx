"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Newspaper, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Eye,
  EyeOff,
  Search,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ParishNewsService } from "@/lib/parish-services"
import { AdminNotificationService } from "@/lib/notification-service"

interface NewsItem {
  id?: string
  title: string
  content: string
  excerpt: string
  category: string
  published: boolean
  image?: string
  author?: string
  parishId?: string
}

const categories = [
  "Annonce",
  "Événement",
  "Célébration",
  "Formation",
  "Pastorale",
  "Jeunesse",
  "Caritative",
  "Autre"
]

export default function ParoisseNewsPage() {
  const searchParams = useSearchParams()
  const paroisse = searchParams.get('paroisse') || 'Paroisse Saint Jean Bosco'
  const { userRole } = useAuth()
  const { toast } = useToast()
  
  const parishId = userRole?.parishId || 'BRVgyxJZA6OjBt5VZszs'

  const [newsList, setNewsList] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  
  const [newNews, setNewNews] = useState<Partial<NewsItem>>({
    title: "",
    content: "",
    excerpt: "",
    category: "Annonce",
    published: true,
    author: userRole?.name || "Admin"
  })

  // Charger les actualités depuis Firestore
  useEffect(() => {
    loadNews()
  }, [parishId])

  const loadNews = async () => {
    try {
      setLoading(true)
      const news = await ParishNewsService.getAll(parishId)
      setNewsList(news as NewsItem[])
    } catch (error) {
      console.error('Erreur lors du chargement des actualités:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les actualités",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddNews = async () => {
    if (!newNews.title || !newNews.content || !newNews.excerpt) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      })
      return
    }

    try {
      const newsData = {
        title: newNews.title!,
        content: newNews.content!,
        excerpt: newNews.excerpt!,
        category: newNews.category || "Annonce",
        published: newNews.published ?? true,
        author: newNews.author || userRole?.name || "Admin",
        parishId
      }

      const newsId = await ParishNewsService.create(newsData)
      
      // Envoyer une notification si l'actualité est publiée
      if (newsData.published) {
        await AdminNotificationService.notifyNews(
          parishId,
          newsData.title,
          newsId
        )
      }
      
      await loadNews()
      
      setNewNews({
        title: "",
        content: "",
        excerpt: "",
        category: "Annonce",
        published: true,
        author: userRole?.name || "Admin"
      })
      setIsAdding(false)
      
      toast({
        title: "Succès",
        description: "Actualité ajoutée avec succès" + (newsData.published ? " et notification envoyée" : "")
      })
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'actualité:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'actualité",
        variant: "destructive"
      })
    }
  }

  const handleSaveEdit = async (id: string, updatedNews: Partial<NewsItem>) => {
    try {
      const wasPublished = newsList.find(n => n.id === id)?.published
      
      await ParishNewsService.update(id, updatedNews)
      
      // Envoyer une notification si l'actualité vient d'être publiée
      if (!wasPublished && updatedNews.published && updatedNews.title) {
        await AdminNotificationService.notifyNews(
          parishId,
          updatedNews.title,
          id
        )
      }
      
      await loadNews()
      setEditingId(null)
      
      toast({
        title: "Succès",
        description: "Actualité mise à jour avec succès" + 
          (!wasPublished && updatedNews.published ? " et notification envoyée" : "")
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'actualité:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'actualité",
        variant: "destructive"
      })
    }
  }

  const handleDeleteNews = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette actualité ?")) {
      return
    }

    try {
      await ParishNewsService.delete(id)
      await loadNews()
      
      toast({
        title: "Succès",
        description: "Actualité supprimée avec succès"
      })
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'actualité:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'actualité",
        variant: "destructive"
      })
    }
  }

  const togglePublished = async (id: string) => {
    try {
      const newsItem = newsList.find(n => n.id === id)
      if (newsItem) {
        const newPublishedState = !newsItem.published
        await ParishNewsService.update(id, { published: newPublishedState })
        
        // Envoyer une notification si on publie
        if (newPublishedState) {
          await AdminNotificationService.notifyNews(
            parishId,
            newsItem.title,
            id
          )
        }
        
        await loadNews()
        
        toast({
          title: newPublishedState ? "Publié" : "Dépublié",
          description: newPublishedState 
            ? "L'actualité est maintenant visible et une notification a été envoyée" 
            : "L'actualité n'est plus visible"
        })
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error)
      toast({
        title: "Erreur",
        description: "Impossible de changer le statut",
        variant: "destructive"
      })
    }
  }

  const filteredNews = newsList.filter(news =>
    news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    news.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    news.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Actualités</h1>
          <p className="text-gray-600 mt-1">Gérez les actualités de votre paroisse</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadNews}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle actualité
          </Button>
        </div>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher une actualité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Formulaire d'ajout */}
      {isAdding && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Nouvelle actualité</span>
              <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Titre *</Label>
                <Input
                  value={newNews.title || ""}
                  onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                  placeholder="Titre de l'actualité"
                />
              </div>
              
              <div className="col-span-2">
                <Label>Résumé * (court texte d'accroche)</Label>
                <Textarea
                  value={newNews.excerpt || ""}
                  onChange={(e) => setNewNews({ ...newNews, excerpt: e.target.value })}
                  placeholder="Résumé court de l'actualité..."
                  rows={2}
                />
              </div>

              <div className="col-span-2">
                <Label>Contenu * (texte complet)</Label>
                <Textarea
                  value={newNews.content || ""}
                  onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                  placeholder="Contenu détaillé de l'actualité..."
                  rows={6}
                />
              </div>

              <div>
                <Label>Catégorie</Label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={newNews.category || "Annonce"}
                  onChange={(e) => setNewNews({ ...newNews, category: e.target.value })}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Auteur</Label>
                <Input
                  value={newNews.author || ""}
                  onChange={(e) => setNewNews({ ...newNews, author: e.target.value })}
                  placeholder="Nom de l'auteur"
                />
              </div>

              <div className="col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={newNews.published ?? true}
                  onChange={(e) => setNewNews({ ...newNews, published: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="published" className="cursor-pointer">
                  Publier immédiatement (envoie une notification)
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddNews}>
                <Save className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des actualités */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-gray-400 mb-2" />
            <p className="text-gray-600">Chargement des actualités...</p>
          </CardContent>
        </Card>
      ) : filteredNews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Newspaper className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">
              {searchTerm ? "Aucune actualité trouvée" : "Aucune actualité pour le moment"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredNews.map((news) => (
            <Card key={news.id} className={!news.published ? "bg-gray-50" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={news.published ? "default" : "secondary"}>
                        {news.category}
                      </Badge>
                      {!news.published && (
                        <Badge variant="outline" className="text-gray-500">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Brouillon
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {news.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-3">{news.excerpt}</p>
                    
                    {editingId === news.id ? (
                      <div className="space-y-3 mt-4">
                        <Textarea
                          defaultValue={news.content}
                          rows={4}
                          className="w-full"
                          id={`content-${news.id}`}
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => {
                              const content = (document.getElementById(`content-${news.id}`) as HTMLTextAreaElement).value
                              handleSaveEdit(news.id!, { content })
                            }}
                          >
                            <Save className="w-3 h-3 mr-1" />
                            Enregistrer
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 line-clamp-2">{news.content}</p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      {news.author && <span>Par {news.author}</span>}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublished(news.id!)}
                      title={news.published ? "Dépublier" : "Publier"}
                    >
                      {news.published ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(news.id!)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNews(news.id!)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

