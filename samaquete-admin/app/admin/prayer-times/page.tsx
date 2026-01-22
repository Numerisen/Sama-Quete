"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { getPrayerTimes, deletePrayerTime, validatePrayerTime } from "@/lib/firestore/services"
import { PrayerTime, DAYS_OF_WEEK } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
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

export default function PrayerTimesPage() {
  const { claims } = useAuth()
  const { toast } = useToast()
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [prayerTimeToDelete, setPrayerTimeToDelete] = useState<string | null>(null)

  useEffect(() => {
    loadPrayerTimes()
  }, [claims])

  async function loadPrayerTimes() {
    try {
      // Filtrer selon le rôle
      let data: PrayerTime[] = [];
      
      if (claims?.role === "super_admin" || claims?.role === "archdiocese_admin") {
        // Super admin et archdiocèse voient toutes les heures de prières
        data = await getPrayerTimes(undefined);
      } else if (claims?.role === "diocese_admin") {
        // Diocèse voit les heures de prières de ses paroisses
        data = await getPrayerTimes(undefined);
        // Filtrer côté client par diocèse (nécessite de récupérer les paroisses)
        // Pour simplifier, on affiche toutes les heures de prières
        // TODO: Filtrer par diocèse si nécessaire
      } else if (claims?.role === "parish_admin") {
        // Paroisse voit seulement ses heures de prières
        data = await getPrayerTimes(claims?.parishId);
      } else if (claims?.role === "church_admin") {
        // Église voit les heures de prières qu'elle a créées
        data = await getPrayerTimes(undefined);
        // Filtrer côté client pour ne montrer que celles créées par cette église
        data = data.filter(pt => pt.churchId === claims?.churchId);
      }
      
      setPrayerTimes(data)
    } catch (error) {
      console.error("Erreur chargement heures de messes:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(prayerTimeId: string) {
    try {
      await deletePrayerTime(prayerTimeId)
      setPrayerTimes(prayerTimes.filter(pt => pt.id !== prayerTimeId))
      setDeleteDialogOpen(false)
      setPrayerTimeToDelete(null)
    } catch (error) {
      console.error("Erreur suppression:", error)
    }
  }

  async function handleToggleActive(prayerTime: PrayerTime) {
    try {
      const { updatePrayerTime } = await import("@/lib/firestore/services")
      await updatePrayerTime(prayerTime.id!, { active: !prayerTime.active })
      setPrayerTimes(prayerTimes.map(pt => pt.id === prayerTime.id ? { ...pt, active: !pt.active } : pt))
    } catch (error) {
      console.error("Erreur mise à jour:", error)
    }
  }

  async function handleValidate(prayerTimeId: string) {
    try {
      await validatePrayerTime(prayerTimeId)
      setPrayerTimes(prayerTimes.map(pt => pt.id === prayerTimeId ? { ...pt, validatedByParish: true } : pt))
      toast({
        title: "Succès",
        description: "Heure de messe validée",
      })
    } catch (error) {
      console.error("Erreur validation:", error)
      toast({
        title: "Erreur",
        description: "Impossible de valider l'heure de messe",
        variant: "destructive",
      })
    }
  }

  const getDaysBadge = (days: string[]) => {
    if (days.length === 7) return "Tous les jours"
    if (days.length === 0) return "Aucun jour"
    return days.join(", ")
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Heures de messes</h1>
          <p className="text-muted-foreground mt-2">
            Gestion des heures de messes de la paroisse (visibles dans l'app mobile)
          </p>
        </div>
        {(claims?.role === "parish_admin" || claims?.role === "church_admin") && (
          <Link href="/admin/prayer-times/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle heure de messe
            </Button>
          </Link>
        )}
      </div>

      {prayerTimes.length === 0 && !loading && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Aucune heure de messe. Créez votre première heure de messe pour qu'elle apparaisse dans l'app mobile.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {prayerTimes.map((prayerTime) => (
          <Card key={prayerTime.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {prayerTime.name}
                  </CardTitle>
                  <p className="text-2xl font-bold mt-2">{prayerTime.time}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={prayerTime.active ? "default" : "secondary"}>
                    {prayerTime.active ? "Active" : "Inactive"}
                  </Badge>
                  {!prayerTime.validatedByParish && prayerTime.createdByRole === "church_admin" && (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      En attente de validation
                    </Badge>
                  )}
                  {prayerTime.validatedByParish && (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Validée
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Jours :</p>
                  <p className="text-sm">{getDaysBadge(prayerTime.days)}</p>
                </div>
                {prayerTime.description && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Description :</p>
                    <p className="text-sm line-clamp-2">{prayerTime.description}</p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Paroisse: {prayerTime.parishId}
                </p>
                {prayerTime.churchId && (
                  <p className="text-xs text-muted-foreground">
                    Créée par église: {prayerTime.churchId}
                  </p>
                )}
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
                <Link href={`/admin/prayer-times/${prayerTime.id}/edit`} className="flex-1 min-w-[100px]">
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </Link>
                {claims?.role === "parish_admin" && 
                 prayerTime.parishId === claims.parishId && 
                 !prayerTime.validatedByParish && 
                 prayerTime.createdByRole === "church_admin" && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleValidate(prayerTime.id!)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Valider
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(prayerTime)}
                >
                  {prayerTime.active ? "Désactiver" : "Activer"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setPrayerTimeToDelete(prayerTime.id!)
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
            <AlertDialogTitle>Supprimer l'heure de messe ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'heure de messe sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => prayerTimeToDelete && handleDelete(prayerTimeToDelete)}
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
