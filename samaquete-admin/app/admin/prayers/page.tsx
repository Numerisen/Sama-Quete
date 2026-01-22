"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { getPrayers, deletePrayer } from "@/lib/firestore/services"
import { Prayer, ContentStatus } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
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
import { useToast } from "@/components/ui/use-toast"

export default function PrayersPage() {
  const { claims } = useAuth()
  const { toast } = useToast()
  const [prayers, setPrayers] = useState<Prayer[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [prayerToDelete, setPrayerToDelete] = useState<string | null>(null)

  useEffect(() => {
    loadPrayers()
  }, [claims])

  async function loadPrayers() {
    try {
      let data: Prayer[] = []
      
      if (claims?.role === "church_admin") {
        // Église voit les prières de sa paroisse
        data = await getPrayers(claims.parishId, claims.dioceseId)
      } else if (claims?.role === "parish_admin") {
        // Paroisse voit ses prières
        data = await getPrayers(claims.parishId, claims.dioceseId)
      } else {
        // Autres rôles voient selon leur scope
        data = await getPrayers(claims?.parishId, claims?.dioceseId)
      }
      
      setPrayers(data)
    } catch (error) {
      console.error("Erreur chargement prières:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(prayerId: string) {
    try {
      await deletePrayer(prayerId)
      setPrayers(prayers.filter(p => p.prayerId !== prayerId))
      setDeleteDialogOpen(false)
      setPrayerToDelete(null)
      toast({
        title: "Succès",
        description: "Prière supprimée avec succès",
      })
    } catch (error) {
      console.error("Erreur suppression:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la prière",
        variant: "destructive",
      })
    }
  }

  async function handleToggleStatus(prayer: Prayer) {
    try {
      const { updatePrayer } = await import("@/lib/firestore/services")
      const newStatus: ContentStatus = prayer.status === "published" ? "draft" : "published"
      await updatePrayer(prayer.prayerId, { status: newStatus })
      setPrayers(prayers.map(p => p.prayerId === prayer.prayerId ? { ...p, status: newStatus } : p))
      toast({
        title: "Succès",
        description: `Prière ${newStatus === "published" ? "publiée" : "dépubliée"}`,
      })
    } catch (error) {
      console.error("Erreur mise à jour:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la prière",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: ContentStatus) => {
    const variants: Record<ContentStatus, string> = {
      draft: "bg-gray-500",
      pending: "bg-yellow-500",
      published: "bg-green-500",
    }
    return (
      <Badge className={variants[status]}>
        {status === "draft" ? "Brouillon" : status === "pending" ? "En attente" : "Publié"}
      </Badge>
    )
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">prières</h1>
          <p className="text-muted-foreground mt-2">
            Gestion des prières
          </p>
        </div>
        {claims?.role === "church_admin" && (
          <Link href="/admin/prayers/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle prière
            </Button>
          </Link>
        )}
      </div>

      {prayers.length === 0 && !loading && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Aucune prière. Créez votre première prière.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {prayers.map((prayer) => (
          <Card key={prayer.prayerId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{prayer.title}</CardTitle>
                {getStatusBadge(prayer.status)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {prayer.content}
              </p>
              {prayer.category && (
                <Badge variant="outline" className="mt-2">
                  {prayer.category}
                </Badge>
              )}
              <div className="mt-4 flex gap-2">
                <Link href={`/admin/prayers/${prayer.prayerId}/edit`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(prayer)}
                >
                  {prayer.status === "published" ? "Dépublier" : "Publier"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setPrayerToDelete(prayer.prayerId)
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
            <AlertDialogTitle>Supprimer la prière ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La prière sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => prayerToDelete && handleDelete(prayerToDelete)}
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
