"use client"

import { useEffect, useState, useMemo } from "react"
import { getDioceses, createDiocese } from "@/lib/firestore/services"
import { Diocese, FIXED_DIOCESES } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Building2, MapPin } from "lucide-react"
import { ViewToggle, ViewMode } from "@/components/ui/view-toggle"
import { FiltersBar, FilterConfig } from "@/components/ui/filters-bar"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function DiocesesPage() {
  const [dioceses, setDioceses] = useState<Diocese[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("cards")
  const [filters, setFilters] = useState<Record<string, string>>({
    name: "",
    type: "",
  })

  useEffect(() => {
    loadDioceses()
  }, [])

  async function loadDioceses() {
    try {
      const data = await getDioceses()
      setDioceses(data)
    } catch (error) {
      console.error("Erreur chargement diocèses:", error)
    } finally {
      setLoading(false)
    }
  }

  async function seedDioceses() {
    try {
      for (const diocese of FIXED_DIOCESES) {
        await createDiocese({
          dioceseId: diocese.dioceseId,
          name: diocese.name,
          isMetropolitan: diocese.isMetropolitan,
        })
      }
      await loadDioceses()
    } catch (error) {
      console.error("Erreur seed diocèses:", error)
    }
  }

  // Filtrage côté frontend (logique UI uniquement)
  const filteredDioceses = useMemo(() => {
    return dioceses.filter((diocese) => {
      const nameMatch = !filters.name || 
        diocese.name.toLowerCase().includes(filters.name.toLowerCase()) ||
        diocese.dioceseId.toLowerCase().includes(filters.name.toLowerCase())
      
      const typeMatch = !filters.type || 
        (filters.type === "archdiocese" && diocese.isMetropolitan) ||
        (filters.type === "diocese" && !diocese.isMetropolitan)
      
      return nameMatch && typeMatch
    })
  }, [dioceses, filters])

  const filterConfigs: FilterConfig[] = [
    {
      type: "text",
      key: "name",
      label: "Nom",
      placeholder: "Rechercher par nom ou ID...",
    },
    {
      type: "select",
      key: "type",
      label: "Type",
      options: [
        { value: "archdiocese", label: "Archidiocèse" },
        { value: "diocese", label: "Diocèse" },
      ],
    },
  ]

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleClearFilters = () => {
    setFilters({ name: "", type: "" })
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
            <h1 className="text-3xl font-bold text-gray-900">Diocèses</h1>
            <p className="text-gray-600 mt-1">
              Gestion des diocèses du Sénégal • {filteredDioceses.length} diocèse{filteredDioceses.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            {dioceses.length === 0 && (
              <Button onClick={seedDioceses}>
                <Plus className="h-4 w-4 mr-2" />
                Initialiser les diocèses
              </Button>
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

        {/* Vue Cartes */}
        {viewMode === "cards" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDioceses.map((diocese) => (
              <Card key={diocese.dioceseId} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg font-semibold text-gray-900">{diocese.name}</CardTitle>
                    {diocese.isMetropolitan && (
                      <Badge className="bg-amber-600 text-white">Archidiocèse</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="h-4 w-4 text-amber-600" />
                      <span className="font-medium">ID:</span>
                      <span>{diocese.dioceseId}</span>
                    </div>
                    {diocese.isMetropolitan && (
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <MapPin className="h-4 w-4" />
                        <span>Archidiocèse métropolitain</span>
                      </div>
                    )}
                    {diocese.createdAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Créé le {new Date(diocese.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Vue Liste */}
        {viewMode === "list" && (
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Nom du diocèse</TableHead>
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Date de création</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDioceses.map((diocese) => (
                    <TableRow key={diocese.dioceseId} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">
                        {diocese.name}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {diocese.dioceseId}
                      </TableCell>
                      <TableCell>
                        {diocese.isMetropolitan ? (
                          <Badge className="bg-amber-600 text-white">Archidiocèse</Badge>
                        ) : (
                          <Badge variant="outline">Diocèse</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {diocese.createdAt 
                          ? new Date(diocese.createdAt).toLocaleDateString("fr-FR")
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {filteredDioceses.length === 0 && (
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">
                {dioceses.length === 0 
                  ? "Aucun diocèse. Cliquez sur 'Initialiser les diocèses' pour commencer."
                  : "Aucun diocèse ne correspond aux filtres sélectionnés."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
