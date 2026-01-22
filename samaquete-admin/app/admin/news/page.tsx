"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { getParishNews, deleteParishNews } from "@/lib/firestore/services"
import { ParishNews, NEWS_CATEGORIES } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function NewsPage() {
  const { claims } = useAuth()
  const [news, setNews] = useState<ParishNews[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [newsToDelete, setNewsToDelete] = useState<string | null>(null)

  useEffect(() => {
    loadNews()
  }, [claims])

  async function loadNews() {
    try {
      // Filtrer selon le rôle
      let data: ParishNews[] = [];
      
      if (claims?.role === "super_admin" || claims?.role === "archdiocese_admin") {
        // Super admin et archidiocèse voient toutes les actualités (paroisse, diocèse, archidiocèse)
        data = await getParishNews(undefined);
        // Filtrer pour archidiocèse : seulement celles de DAKAR
        if (claims?.role === "archdiocese_admin") {
          data = data.filter(n => 
            n.scope === "archdiocese" || 
            (n.scope === "diocese" && n.dioceseId === "DAKAR") ||
            (n.scope === "parish" && n.dioceseId === "DAKAR")
          );
        }
      } else if (claims?.role === "diocese_admin") {
        // Diocèse voit ses actualités diocésaines + celles de ses paroisses
        data = await getParishNews(undefined);
        data = data.filter(n => 
          (n.scope === "diocese" && n.dioceseId === claims.dioceseId) ||
          (n.scope === "parish" && n.dioceseId === claims.dioceseId) ||
          (n.scope === "archdiocese" && n.archdioceseId === "DAKAR")
        );
      } else {
        // Paroisse voit seulement ses actualités
        data = await getParishNews(claims?.parishId);
      }
      
      setNews(data)
    } catch (error) {
      console.error("Erreur chargement actualités:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(newsId: string) {
    try {
      await deleteParishNews(newsId)
      setNews(news.filter(n => n.id !== newsId))
      setDeleteDialogOpen(false)
      setNewsToDelete(null)
    } catch (error) {
      console.error("Erreur suppression:", error)
    }
  }

  async function handleTogglePublish(news: ParishNews) {
    try {
      const { updateParishNews } = await import("@/lib/firestore/services")
      await updateParishNews(news.id!, { published: !news.published })
      setNews(news.map(n => n.id === news.id ? { ...n, published: !n.published } : n))
    } catch (error) {
      console.error("Erreur mise à jour:", error)
    }
  }

  const getCategoryBadge = (category: string) => {
    const categoryMap: Record<string, { label: string; color: string }> = {
      "Annonce": { label: "📢 Annonce", color: "bg-yellow-100 text-yellow-800" },
      "Événement": { label: "🎉 Événement", color: "bg-orange-100 text-orange-800" },
      "Célébration": { label: "✨ Célébration", color: "bg-purple-100 text-purple-800" },
      "Formation": { label: "📚 Formation", color: "bg-green-100 text-green-800" },
      "Pastorale": { label: "🙏 Pastorale", color: "bg-red-100 text-red-800" },
      "Jeunesse": { label: "🌟 Jeunesse", color: "bg-cyan-100 text-cyan-800" },
      "Caritative": { label: "❤️ Caritative", color: "bg-pink-100 text-pink-800" },
      "Autre": { label: "📰 Autre", color: "bg-gray-100 text-gray-800" },
    }
    const cat = categoryMap[category] || categoryMap["Autre"]
    return <Badge className={cat.color}>{cat.label}</Badge>
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Actualités</h1>
          <p className="text-muted-foreground mt-2">
            {claims?.role === "archdiocese_admin" 
              ? "Gestion des actualités archidiocésaines (visibles dans toutes les paroisses)"
              : claims?.role === "diocese_admin"
              ? "Gestion des actualités diocésaines (visibles dans toutes les paroisses du diocèse)"
              : "Gestion des actualités de la paroisse (visibles dans l'app mobile)"}
          </p>
        </div>
        {claims?.role !== "church_admin" && (
          <Link href="/admin/news/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle actualité
            </Button>
          </Link>
        )}
      </div>

      {news.length === 0 && !loading && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Aucune actualité. Créez votre première actualité pour qu'elle apparaisse dans l'app mobile.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {news.map((item) => (
          <Card key={item.id} className="flex flex-col">
            {item.image && (
              <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                <Badge variant={item.published ? "default" : "secondary"}>
                  {item.published ? "Publié" : "Brouillon"}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {getCategoryBadge(item.category)}
                <Badge variant="outline" className="text-xs">
                  {item.scope === "archdiocese" 
                    ? "🏛️ Archidiocèse" 
                    : item.scope === "diocese"
                    ? "⛪ Diocèse"
                    : "📍 Paroisse"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                {item.excerpt || item.content}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {item.createdAt && format(new Date(item.createdAt), "PP")}
                </span>
                {item.author && item.showAuthor && (
                  <span>Par {item.author}</span>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Link href={`/admin/news/${item.id}/edit`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTogglePublish(item)}
                >
                  {item.published ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setNewsToDelete(item.id!)
                    setDeleteDialogOpen(true)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'actualité ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'actualité sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => newsToDelete && handleDelete(newsToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
