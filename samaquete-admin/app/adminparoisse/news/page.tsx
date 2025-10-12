"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  RefreshCw,
  AlertTriangle
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
  showAuthor?: boolean
  parishId?: string
  createdAt?: any
  updatedAt?: any
}

const newsCategories = [
  "Annonce", "Événement", "Célébration", "Formation",
  "Pastorale", "Jeunesse", "Caritative", "Autre"
]

export default function NewsPage() {
  const searchParams = useSearchParams()
  const paroisse = searchParams.get('paroisse') || 'Paroisse Saint Jean Bosco'
  const { userRole } = useAuth()
  const { toast } = useToast()

  const parishId = userRole?.parishId || 'paroisse-saint-jean-bosco'

  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [newsToDelete, setNewsToDelete] = useState<NewsItem | null>(null)
  const [imageType, setImageType] = useState<'url' | 'file'>('url')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [newNews, setNewNews] = useState<Partial<NewsItem>>({
    title: "",
    content: "",
    excerpt: "",
    category: newsCategories[0],
    published: false,
    image: "",
    author: "",
    showAuthor: true
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("Toutes")

  useEffect(() => {
    loadNews()
  }, [parishId, filterCategory])

  const loadNews = async () => {
    try {
      setLoading(true)
      const allNews = await ParishNewsService.getAll(parishId)
      const filteredNews = filterCategory === "Toutes"
        ? allNews
        : allNews.filter(news => news.category === filterCategory)
      setNewsItems(filteredNews as NewsItem[])
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
    if (!newNews.title || !newNews.content || !newNews.excerpt || !newNews.category) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      })
      return
    }

    try {
      let imageUrl = newNews.image || ""
      
      // Si un fichier a été sélectionné, l'uploader
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile)
      }

      const newsData = {
        title: newNews.title!,
        content: newNews.content!,
        excerpt: newNews.excerpt!,
        category: newNews.category!,
        published: newNews.published ?? false,
        image: imageUrl,
        author: newNews.author || "",
        showAuthor: newNews.showAuthor ?? true,
        parishId
      }

      await ParishNewsService.create(newsData)

      // Envoyer la notification si l'actualité est publiée
      try {
        if (newsData.published) {
          await AdminNotificationService.notifyNewsUpdate(
            parishId,
            newsData.title,
            newsData.excerpt,
            true
          )
        }
      } catch (notifError) {
        console.warn('Erreur lors de l\'envoi de la notification (non bloquant):', notifError)
      }

      await loadNews()
      setNewNews({ title: "", content: "", excerpt: "", category: newsCategories[0], published: false, image: "", author: "", showAuthor: true })
      setImageFile(null)
      setImageType('url')
      setIsAdding(false)

      toast({
        title: "Succès",
        description: "Actualité ajoutée avec succès"
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

  const handleEditNews = (id: string) => {
    const newsToEdit = newsItems.find(news => news.id === id)
    if (newsToEdit) {
      setNewNews(newsToEdit)
      setEditingId(id)
      setIsAdding(false)
    }
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    // Pour l'instant, on convertit l'image en base64
    // Dans une version production, vous devriez uploader vers Firebase Storage
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result as string)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    
    if (!newNews.title || !newNews.content || !newNews.excerpt || !newNews.category) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      })
      return
    }

    try {
      const oldNews = newsItems.find(n => n.id === editingId)
      
      let imageUrl = newNews.image || ""
      
      // Si un fichier a été sélectionné, l'uploader
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile)
      }

      const updatedNews = {
        title: newNews.title,
        content: newNews.content,
        excerpt: newNews.excerpt,
        category: newNews.category,
        published: newNews.published,
        image: imageUrl,
        author: newNews.author || "",
        showAuthor: newNews.showAuthor ?? true,
      }

      await ParishNewsService.update(editingId, updatedNews)

      // Send notification if published status changes or content changes
      try {
        if (updatedNews.published && !oldNews?.published) {
          await AdminNotificationService.notifyNewsUpdate(
            parishId,
            updatedNews.title,
            updatedNews.excerpt,
            true
          )
        } else if (updatedNews.published && oldNews?.published &&
          (updatedNews.title !== oldNews?.title || updatedNews.excerpt !== oldNews?.excerpt || updatedNews.content !== oldNews?.content)) {
          await AdminNotificationService.notifyNewsUpdate(
            parishId,
            updatedNews.title,
            updatedNews.excerpt,
            false
          )
        }
      } catch (notifError) {
        console.warn('Erreur lors de l\'envoi de la notification (non bloquant):', notifError)
      }

      await loadNews()
      setEditingId(null)
      setNewNews({ title: "", content: "", excerpt: "", category: newsCategories[0], published: false, image: "", author: "", showAuthor: true })
      setImageFile(null)
      setImageType('url')

      toast({
        title: "Succès",
        description: "Actualité mise à jour avec succès"
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

  const handleDeleteClick = (news: NewsItem) => {
    setNewsToDelete(news)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!newsToDelete?.id) return

    try {
      await ParishNewsService.delete(newsToDelete.id)

      // Envoyer la notification de suppression si l'actualité était publiée
      try {
        if (newsToDelete.published) {
          await AdminNotificationService.notifyNewsDeleted(
            parishId,
            newsToDelete.title
          )
        }
      } catch (notifError) {
        console.warn('Erreur lors de l\'envoi de la notification (non bloquant):', notifError)
      }

      await loadNews()
      setDeleteDialogOpen(false)
      setNewsToDelete(null)

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

  const toggleNewsPublished = async (id: string) => {
    try {
      const newsItem = newsItems.find(n => n.id === id)
      if (newsItem) {
        const newPublishedStatus = !newsItem.published
        
        await ParishNewsService.update(id, { published: newPublishedStatus })

        // Envoyer la notification seulement si on publie
        try {
          if (newPublishedStatus) {
            await AdminNotificationService.notifyNewsUpdate(
              parishId,
              newsItem.title,
              newsItem.excerpt,
              true
            )
          }
        } catch (notifError) {
          console.warn('Erreur lors de l\'envoi de la notification (non bloquant):', notifError)
        }

        await loadNews()
        toast({
          title: "Succès",
          description: `Actualité ${newsItem.published ? "dépubliée" : "publiée"} avec succès`
        })
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut de publication:', error)
      toast({
        title: "Erreur",
        description: "Impossible de changer le statut de publication",
        variant: "destructive"
      })
    }
  }

  const filteredAndSearchedNews = newsItems.filter(news =>
    news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    news.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    news.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
        <p className="ml-3 text-lg text-gray-700">Chargement des actualités...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Card className="bg-white shadow-lg rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">Actualités de la paroisse</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Gérez les actualités qui apparaîtront dans l'application mobile</p>
          </div>
          <Button onClick={() => setIsAdding(true)} className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle actualité
          </Button>
        </CardHeader>
        <CardContent>
          {(isAdding || editingId) && (
            <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">
                {editingId ? "Modifier l'actualité" : "Ajouter une nouvelle actualité"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="title" className="text-gray-700">Titre</Label>
                  <Input
                    id="title"
                    value={newNews.title}
                    onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                    placeholder="Titre de l'actualité"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-gray-700">Catégorie</Label>
                  <select
                    id="category"
                    value={newNews.category}
                    onChange={(e) => setNewNews({ ...newNews, category: e.target.value })}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  >
                    {newsCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  
                </div>
              </div>

              <div className="mb-4">
                <Label htmlFor="excerpt" className="text-gray-700">Extrait (court résumé)</Label>
                <Textarea
                  id="excerpt"
                  value={newNews.excerpt}
                  onChange={(e) => setNewNews({ ...newNews, excerpt: e.target.value })}
                  placeholder="Un court résumé de l'actualité"
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="content" className="text-gray-700">Contenu complet</Label>
                <Textarea
                  id="content"
                  value={newNews.content}
                  onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                  placeholder="Contenu détaillé de l'actualité"
                  className="mt-1"
                  rows={5}
                />
              </div>

              {/* Section Auteur */}
              <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-start gap-2 mb-3">
                  <Label className="text-gray-700 flex-1 font-semibold">Auteur de l'actualité</Label>
                  <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    Optionnel
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-4 italic">
                  💡 Vous pouvez choisir d'afficher ou de masquer l'auteur dans l'application mobile
                </p>
                
                <div className="mb-3">
                  <Label htmlFor="author" className="text-gray-700 text-sm">Nom de l'auteur (optionnel)</Label>
                  <Input
                    id="author"
                    value={newNews.author}
                    onChange={(e) => setNewNews({ ...newNews, author: e.target.value })}
                    placeholder="Ex: Père Jean, Équipe pastorale, Catéchiste Marie..."
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Si vide, "Paroisse" sera affiché par défaut
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="showAuthor"
                    type="checkbox"
                    checked={newNews.showAuthor}
                    onChange={(e) => setNewNews({ ...newNews, showAuthor: e.target.checked })}
                    className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <Label htmlFor="showAuthor" className="text-sm text-gray-700 font-medium">
                    Afficher l'auteur dans l'application mobile
                  </Label>
                </div>
                
                {/*{newNews.showAuthor ? (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1 bg-green-50 p-2 rounded">
                    <span>✓</span> L'auteur sera visible dans l'app : <strong>"{newNews.author || 'Paroisse'}"</strong>
                  </p>
                ) : (
                  <p className="text-xs text-orange-600 mt-2 flex items-center gap-1 bg-orange-50 p-2 rounded">
                    <span>✕</span> L'auteur sera complètement masqué. Aucun nom ne sera affiché dans l'app mobile.
                  </p>
                )*/}
              </div>

              <div className="mb-4">
                <Label className="text-gray-700 mb-2 block">Image (optionnel)</Label>
                <div className="flex gap-2 mb-3">
                  <Button
                    type="button"
                    variant={imageType === 'url' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImageType('url')}
                  >
                    URL
                  </Button>
                  <Button
                    type="button"
                    variant={imageType === 'file' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImageType('file')}
                  >
                    Fichier
                  </Button>
                </div>

                {imageType === 'url' ? (
                  <Input
                    id="image"
                    value={newNews.image}
                    onChange={(e) => setNewNews({ ...newNews, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
                  />
                ) : (
                  <div>
                    <Input
                      id="imageFile"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setImageFile(file)
                          // Créer une preview
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setNewNews({ ...newNews, image: reader.result as string })
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="mt-1"
                    />
                    {imageFile && (
                      <p className="text-xs text-gray-500 mt-1">
                        Fichier sélectionné: {imageFile.name}
                      </p>
                    )}
                  </div>
                )}

                {newNews.image && (
                  <div className="mt-3">
                    <Label className="text-sm text-gray-600">Aperçu:</Label>
                    <img 
                      src={newNews.image} 
                      alt="Aperçu" 
                      className="mt-2 w-full h-40 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <input
                  id="published"
                  type="checkbox"
                  checked={newNews.published}
                  onChange={(e) => setNewNews({ ...newNews, published: e.target.checked })}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <Label htmlFor="published" className="text-gray-700">Publier immédiatement</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => { 
                    setIsAdding(false); 
                    setEditingId(null); 
                    setNewNews({ title: "", content: "", excerpt: "", category: newsCategories[0], published: false, image: "", author: "", showAuthor: true })
                    setImageFile(null)
                    setImageType('url')
                  }} 
                  className="text-gray-600"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button 
                  type="button"
                  onClick={editingId ? handleSaveEdit : handleAddNews} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? "Sauvegarder" : "Ajouter"}
                </Button>
              </div>
            </div>
          )}

          {!isAdding && !editingId && (
            <>
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Rechercher une actualité..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border rounded-md w-full"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="block w-auto p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                  <option value="Toutes">Toutes les catégories</option>
                  {newsCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {filteredAndSearchedNews.length === 0 ? (
                <div className="text-center py-12">
                  <Newspaper className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Aucune actualité trouvée</p>
                  <p className="text-gray-400 text-sm mt-2">Commencez par créer votre première actualité</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSearchedNews.map(news => (
                    <Card key={news.id} className="bg-white shadow-md rounded-lg overflow-hidden border-l-4 border-green-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="secondary" className="text-xs font-medium bg-green-100 text-green-800">
                            {news.category}
                          </Badge>
                          <Badge variant={news.published ? "default" : "secondary"} className="text-xs">
                            {news.published ? "Publiée" : "Brouillon"}
                          </Badge>
                        </div>
                        
                        <h4 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{news.title}</h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-3">{news.excerpt}</p>
                        
                        {news.showAuthor && news.author && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                            <span>✍️</span>
                            <span>{news.author}</span>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap justify-end gap-1.5 mt-4 pt-4 border-t">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => toggleNewsPublished(news.id!)} 
                            className="text-gray-600 text-xs px-2.5 py-1.5 h-auto"
                          >
                            {news.published ? <EyeOff className="w-3.5 h-3.5 mr-1" /> : <Eye className="w-3.5 h-3.5 mr-1" />}
                            {news.published ? "Dépublier" : "Publier"}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditNews(news.id!)} 
                            className="text-blue-600 text-xs px-2.5 py-1.5 h-auto"
                          >
                            <Edit className="w-3.5 h-3.5 mr-1" />
                            Modifier
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteClick(news)}
                            className="text-xs px-2.5 py-1.5 h-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription className="pt-4">
              Êtes-vous sûr de vouloir supprimer l'actualité <strong>"{newsToDelete?.title}"</strong> ?
              {newsToDelete?.published && (
                <span className="block mt-2 text-orange-600 font-medium">
                  ⚠️ Cette actualité est publiée. Les utilisateurs ne pourront plus la voir.
                </span>
              )}
              <span className="block mt-2 text-gray-600">
                Cette action est irréversible.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setNewsToDelete(null)
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

