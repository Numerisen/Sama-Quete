"use client"

import { useEffect, useState, useMemo } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { getChurches, deleteChurch, getDioceses, getParishes } from "@/lib/firestore/services"
import { Church, Diocese, Parish } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ViewToggle, ViewMode } from "@/components/ui/view-toggle"
import { Pagination } from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

export default function ChurchesPage() {
  const { claims } = useAuth()
  const [churches, setChurches] = useState<Church[]>([])
  const [dioceses, setDioceses] = useState<Diocese[]>([])
  const [parishes, setParishes] = useState<Parish[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [churchToDelete, setChurchToDelete] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("cards")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    loadChurches()
  }, [claims])

  async function loadChurches() {
    try {
      let data: Church[] = []
      
      if (claims?.role === "super_admin" || claims?.role === "archdiocese_admin") {
        // Voir toutes les églises
        data = await getChurches(undefined, undefined)
      } else if (claims?.role === "diocese_admin") {
        // Voir les églises de son diocèse
        data = await getChurches(undefined, claims.dioceseId)
      } else if (claims?.role === "parish_admin") {
        // Voir les églises de son diocèse
        data = await getChurches(undefined, claims.dioceseId)
      } else if (claims?.role === "church_admin") {
        // Voir seulement son église
        data = await getChurches(undefined, claims.dioceseId)
        data = data.filter(c => c.churchId === claims.churchId)
      }
      
      // Charger les diocèses et paroisses pour afficher les noms
      const [diocesesData, parishesData] = await Promise.all([
        getDioceses(),
        getParishes(),
      ])
      
      setChurches(data)
      setDioceses(diocesesData)
      setParishes(parishesData)
    } catch (error) {
      console.error("Erreur chargement églises:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDioceseName = (dioceseId: string): string => {
    const diocese = dioceses.find(d => d.dioceseId === dioceseId)
    return diocese ? diocese.name : dioceseId
  }

  const getParishName = (parishId: string): string => {
    const parish = parishes.find(p => p.parishId === parishId)
    return parish ? parish.name : parishId
  }

  async function handleDelete(churchId: string) {
    try {
      await deleteChurch(churchId)
      setChurches(churches.filter(c => c.churchId !== churchId))
      setDeleteDialogOpen(false)
      setChurchToDelete(null)
    } catch (error) {
      console.error("Erreur suppression:", error)
    }
  }

  // Pagination
  const totalPages = Math.ceil(churches.length / itemsPerPage)
  const paginatedChurches = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return churches.slice(start, end)
  }, [churches, currentPage, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Églises</h1>
          <p className="text-muted-foreground mt-2">
            Liste des églises (internes) • {churches.length} église{churches.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          {(claims?.role === "super_admin" || 
            claims?.role === "archdiocese_admin" ||
            claims?.role === "diocese_admin" || 
            claims?.role === "parish_admin") && (
            <Link href="/admin/churches/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle église
              </Button>
            </Link>
          )}
        </div>
      </div>

      {churches.length === 0 && !loading && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Aucune église. Créez votre première église.
            </p>
          </CardContent>
        </Card>
      )}

      {viewMode === "cards" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedChurches.map((church) => (
          <Card key={church.churchId}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="flex-1">{church.name}</CardTitle>
                <Badge variant={church.isActive ? "default" : "secondary"}>
                  {church.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  ID: {church.churchId}
                </p>
                <p className="text-sm text-muted-foreground">
                  Diocèse: {getDioceseName(church.dioceseId)}
                </p>
                {church.parishId && (
                  <p className="text-sm text-muted-foreground">
                    Paroisse: {getParishName(church.parishId)}
                  </p>
                )}
                {church.address && (
                  <p className="text-sm text-muted-foreground">
                    {church.address}
                  </p>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Link href={`/admin/churches/${church.churchId}/edit`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </Link>
                {(claims?.role === "super_admin" || 
                  claims?.role === "archdiocese_admin" ||
                  claims?.role === "diocese_admin" || 
                  claims?.role === "parish_admin") && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setChurchToDelete(church.churchId)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {viewMode === "list" && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Diocèse</TableHead>
                <TableHead>Paroisse</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedChurches.map((church) => (
                <TableRow key={church.churchId}>
                  <TableCell className="font-medium">{church.name}</TableCell>
                  <TableCell>{getDioceseName(church.dioceseId)}</TableCell>
                  <TableCell>{church.parishId ? getParishName(church.parishId) : "-"}</TableCell>
                  <TableCell>
                    <Badge variant={church.isActive ? "default" : "secondary"}>
                      {church.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/churches/${church.churchId}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                      </Link>
                      {(claims?.role === "super_admin" || 
                        claims?.role === "archdiocese_admin" ||
                        claims?.role === "diocese_admin" || 
                        claims?.role === "parish_admin") && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setChurchToDelete(church.churchId)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {churches.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={churches.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage)
            setCurrentPage(1)
          }}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'église ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'église sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => churchToDelete && handleDelete(churchToDelete)}
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
