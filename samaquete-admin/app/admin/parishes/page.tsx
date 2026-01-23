"use client"

import { useEffect, useState, useMemo } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { getParishes, getDioceses, deleteParish } from "@/lib/firestore/services"
import { Parish, Diocese } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Church, MapPin, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ViewToggle, ViewMode } from "@/components/ui/view-toggle"
import { FiltersBar, FilterConfig } from "@/components/ui/filters-bar"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function ParishesPage() {
  const { claims } = useAuth()
  const [parishes, setParishes] = useState<Parish[]>([])
  const [dioceses, setDioceses] = useState<Diocese[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [parishToDelete, setParishToDelete] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("cards")
  const [filters, setFilters] = useState<Record<string, string>>({
    name: "",
    diocese: "",
    status: "",
  })

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
        getDioceses(), // Toujours charger les diocèses pour afficher les noms
      ])
      setParishes(parishesData)
      setDioceses(diocesesData)
    } catch (error) {
      console.error("Erreur chargement paroisses:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDioceseName = (dioceseId: string): string => {
    const diocese = dioceses.find(d => d.dioceseId === dioceseId)
    return diocese ? diocese.name : dioceseId
  }

  // Filtrage côté frontend (logique UI uniquement)
  const filteredParishes = useMemo(() => {
    return parishes.filter((parish) => {
      const nameMatch = !filters.name || 
        parish.name.toLowerCase().includes(filters.name.toLowerCase()) ||
        parish.parishId.toLowerCase().includes(filters.name.toLowerCase())
      
      const dioceseMatch = !filters.diocese || parish.dioceseId === filters.diocese
      
      const statusMatch = !filters.status || 
        (filters.status === "active" && parish.isActive) ||
        (filters.status === "inactive" && !parish.isActive)
      
      return nameMatch && dioceseMatch && statusMatch
    })
  }, [parishes, filters, dioceses])

  const filterConfigs: FilterConfig[] = [
    {
      type: "text",
      key: "name",
      label: "Nom",
      placeholder: "Rechercher par nom ou ID...",
    },
    {
      type: "select",
      key: "diocese",
      label: "Diocèse",
      options: dioceses.map(d => ({ value: d.dioceseId, label: d.name })),
    },
    {
      type: "select",
      key: "status",
      label: "Statut",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ]

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleClearFilters = () => {
    setFilters({ name: "", diocese: "", status: "" })
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
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Paroisses</h1>
            <p className="text-gray-600 mt-1">
              Liste des paroisses • {filteredParishes.length} paroisse{filteredParishes.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
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
        </div>

        {/* Filtres */}
        <FiltersBar
          filters={filterConfigs}
          values={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
        />

        {filteredParishes.length === 0 && !loading && (
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">
                {parishes.length === 0 
                  ? "Aucune paroisse. Créez votre première paroisse."
                  : "Aucune paroisse ne correspond aux filtres sélectionnés."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Vue Cartes */}
        {viewMode === "cards" && filteredParishes.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredParishes.map((parish) => (
              <Card key={parish.parishId} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg font-semibold text-gray-900">{parish.name}</CardTitle>
                    <Badge variant={parish.isActive ? "default" : "secondary"} className={parish.isActive ? "bg-green-600" : ""}>
                      {parish.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Church className="h-4 w-4 text-amber-600" />
                      <span className="font-medium">ID:</span>
                      <span>{parish.parishId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-amber-600" />
                      <span className="font-medium">Diocèse:</span>
                      <span className="font-semibold text-gray-900">{getDioceseName(parish.dioceseId)}</span>
                    </div>
                    {parish.address && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {parish.address}
                      </p>
                    )}
                    {parish.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4 text-amber-600" />
                        <span>{parish.phone}</span>
                      </div>
                    )}
                    {parish.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4 text-amber-600" />
                        <span>{parish.email}</span>
                      </div>
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
        )}

        {/* Vue Liste */}
        {viewMode === "list" && filteredParishes.length > 0 && (
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Nom de la paroisse</TableHead>
                    <TableHead className="font-semibold">Diocèse</TableHead>
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParishes.map((parish) => (
                    <TableRow key={parish.parishId} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">
                        {parish.name}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {getDioceseName(parish.dioceseId)}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {parish.parishId}
                      </TableCell>
                      <TableCell>
                        <Badge variant={parish.isActive ? "default" : "secondary"} className={parish.isActive ? "bg-green-600" : ""}>
                          {parish.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {parish.phone || parish.email || "-"}
                      </TableCell>
                      <TableCell>
                        {canEdit(parish) && (
                          <div className="flex gap-2">
                            <Link href={`/admin/parishes/${parish.parishId}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
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
