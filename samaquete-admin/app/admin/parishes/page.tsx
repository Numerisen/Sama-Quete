"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { getParishes, getDioceses, deleteParish } from "@/lib/firestore/services"
import { Parish, Diocese } from "@/types"
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

export default function ParishesPage() {
  const { claims } = useAuth()
  const [parishes, setParishes] = useState<Parish[]>([])
  const [dioceses, setDioceses] = useState<Diocese[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [parishToDelete, setParishToDelete] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [claims])

  async function loadData() {
    try {
      // Super admin et archdiocese admin voient toutes les paroisses
      // Diocese admin voit seulement ses paroisses
      const dioceseId = (claims?.role === "super_admin" || claims?.role === "archdiocese_admin") 
        ? undefined 
        : claims?.dioceseId;
      
      const [parishesData, diocesesData] = await Promise.all([
        getParishes(dioceseId),
        (claims?.role === "super_admin" || claims?.role === "archdiocese_admin") 
          ? getDioceses() 
          : Promise.resolve([]),
      ])
      setParishes(parishesData)
      setDioceses(diocesesData)
    } catch (error) {
      console.error("Erreur chargement paroisses:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(parishId: string) {
    try {
      await deleteParish(parishId)
      setParishes(parishes.filter(p => p.parishId !== parishId))
      setDeleteDialogOpen(false)
      setParishToDelete(null)
    } catch (error) {
      console.error("Erreur suppression:", error)
    }
  }

  const canEdit = (parish: Parish): boolean => {
    if (!claims) return false
    if (claims.role === "super_admin") return true
    if (claims.role === "archdiocese_admin") return true
    if (claims.role === "diocese_admin" && parish.dioceseId === claims.dioceseId) return true
    return false
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Paroisses</h1>
          <p className="text-muted-foreground mt-2">
            Liste des paroisses
          </p>
        </div>
        {(claims?.role === "super_admin" || 
          claims?.role === "archdiocese_admin" || 
          claims?.role === "diocese_admin") && (
          <Link href="/admin/parishes/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle paroisse
            </Button>
          </Link>
        )}
      </div>

      {parishes.length === 0 && !loading && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Aucune paroisse. Créez votre première paroisse.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {parishes.map((parish) => (
          <Card key={parish.parishId}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{parish.name}</CardTitle>
                <Badge variant={parish.isActive ? "default" : "secondary"}>
                  {parish.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  ID: {parish.parishId}
                </p>
                <p className="text-sm text-muted-foreground">
                  Diocèse: {parish.dioceseId}
                </p>
                {parish.address && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {parish.address}
                  </p>
                )}
                {parish.phone && (
                  <p className="text-sm text-muted-foreground">
                    📞 {parish.phone}
                  </p>
                )}
                {parish.email && (
                  <p className="text-sm text-muted-foreground">
                    ✉️ {parish.email}
                  </p>
                )}
              </div>
              {canEdit(parish) && (
                <div className="mt-4 flex gap-2">
                  <Link href={`/admin/parishes/${parish.parishId}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setParishToDelete(parish.parishId)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la paroisse ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La paroisse sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => parishToDelete && handleDelete(parishToDelete)}
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
