"use client"

import { useEffect, useState, useMemo } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { getDonationTypes, deleteDonationType, validateDonationType, syncDonationTypeToParishCollection } from "@/lib/firestore/services"
import { DonationType } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
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

export default function DonationTypesPage() {
  const { claims } = useAuth()
  const { toast } = useToast()
  const [donationTypes, setDonationTypes] = useState<DonationType[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [donationTypeToDelete, setDonationTypeToDelete] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [viewMode, setViewMode] = useState<ViewMode>("cards")

  useEffect(() => {
    loadDonationTypes()
  }, [claims])

  async function loadDonationTypes() {
    try {
      let data = await getDonationTypes()
      
      // Filtrer selon le rôle
      if (claims?.role === "parish_admin") {
        data = data.filter(dt => dt.parishId === claims.parishId)
      } else if (claims?.role === "church_admin") {
        data = data.filter(dt => dt.churchId === claims.churchId)
      } else if (claims?.role === "diocese_admin") {
        data = data.filter(dt => dt.dioceseId === claims.dioceseId)
      }
      // super_admin et archdiocese_admin voient tout
      
      setDonationTypes(data)
    } catch (error) {
      console.error("Erreur chargement types de dons:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActive(donationType: DonationType) {
    try {
      const { updateDonationType } = await import("@/lib/firestore/services")
      await updateDonationType(donationType.donationTypeId, { isActive: !donationType.isActive })
      setDonationTypes(donationTypes.map(dt => 
        dt.donationTypeId === donationType.donationTypeId 
          ? { ...dt, isActive: !dt.isActive } 
          : dt
      ))
      toast({
        title: "Succès",
        description: `Type de don ${!donationType.isActive ? "activé" : "désactivé"}`,
      })
    } catch (error) {
      console.error("Erreur mise à jour:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le type de don",
        variant: "destructive",
      })
    }
  }

  async function handleValidate(donationTypeId: string) {
    try {
      await validateDonationType(donationTypeId)
      const updatedDonationType = donationTypes.find(dt => dt.donationTypeId === donationTypeId)
      if (updatedDonationType && updatedDonationType.isActive) {
        // Synchroniser vers parish_donation_types
        await syncDonationTypeToParishCollection(updatedDonationType)
      }
      setDonationTypes(donationTypes.map(dt => 
        dt.donationTypeId === donationTypeId 
          ? { ...dt, validatedByParish: true } 
          : dt
      ))
      toast({
        title: "Succès",
        description: "Type de don validé et synchronisé avec l'app mobile",
      })
    } catch (error) {
      console.error("Erreur validation:", error)
      toast({
        title: "Erreur",
        description: "Impossible de valider le type de don",
        variant: "destructive",
      })
    }
  }

  async function handleDelete(donationTypeId: string) {
    try {
      await deleteDonationType(donationTypeId)
      setDonationTypes(donationTypes.filter(dt => dt.donationTypeId !== donationTypeId))
      toast({
        title: "Succès",
        description: "Type de don supprimé",
      })
    } catch (error) {
      console.error("Erreur suppression:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le type de don",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setDonationTypeToDelete(null)
    }
  }

  // Pagination
  const totalPages = Math.ceil(donationTypes.length / itemsPerPage)
  const paginatedDonationTypes = useMemo(() => {
    return donationTypes.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
  }, [donationTypes, currentPage, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  if (loading) {
    return <div className="p-6">Chargement...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Types de dons</h1>
          <p className="text-muted-foreground mt-2">
            Gestion des types de dons disponibles pour les contributions • {donationTypes.length} type{donationTypes.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          {(claims?.role === "super_admin" || 
            claims?.role === "parish_admin" || 
            claims?.role === "church_admin") && (
            <Link href="/admin/donation-types/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Créer un type de don
              </Button>
            </Link>
          )}
        </div>
      </div>

      {donationTypes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Aucun type de don trouvé</p>
          </CardContent>
        </Card>
      ) : viewMode === "cards" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedDonationTypes.map((type) => (
              <Card key={type.donationTypeId}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{type.name}</CardTitle>
                  <div className="flex gap-2">
                    {type.isActive ? (
                      <Badge variant="default" className="bg-green-600">Actif</Badge>
                    ) : (
                      <Badge variant="secondary">Inactif</Badge>
                    )}
                    {type.validatedByParish ? (
                      <Badge variant="default" className="bg-blue-600">Validé</Badge>
                    ) : (
                      <Badge variant="outline">En attente</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {type.description && (
                  <p className="text-sm text-muted-foreground mb-4">{type.description}</p>
                )}
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Montants par défaut:</p>
                  <div className="flex flex-wrap gap-2">
                    {type.defaultAmounts.map((amount, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-secondary rounded text-xs"
                      >
                        {amount.toLocaleString()} FCFA
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <Link href={`/admin/donation-types/${type.donationTypeId}/edit`} className="flex-1 min-w-[100px]">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                  </Link>
                  {claims?.role === "parish_admin" && 
                   type.parishId === claims.parishId && 
                   !type.validatedByParish && 
                   type.createdByRole === "church_admin" && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleValidate(type.donationTypeId)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Valider
                    </Button>
                  )}
                  {type.validatedByParish && type.isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await syncDonationTypeToParishCollection(type)
                          toast({
                            title: "Succès",
                            description: "Type de don synchronisé avec l'app mobile",
                          })
                        } catch (error) {
                          console.error("Erreur synchronisation:", error)
                          toast({
                            title: "Erreur",
                            description: "Impossible de synchroniser",
                            variant: "destructive",
                          })
                        }
                      }}
                      title="Synchroniser manuellement avec l'app mobile"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Sync
                    </Button>
                  )}
                  {(claims?.role === "super_admin" || 
                    (claims?.role === "parish_admin" && type.parishId === claims.parishId) ||
                    (claims?.role === "church_admin" && type.churchId === claims.churchId && type.createdByRole === "church_admin")) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setDonationTypeToDelete(type.donationTypeId)
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
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Montants</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Validation</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDonationTypes.map((type) => (
                <TableRow key={type.donationTypeId}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell className="max-w-md truncate">{type.description || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {type.defaultAmounts.slice(0, 3).map((amount, idx) => (
                        <span key={idx} className="text-xs px-1.5 py-0.5 bg-secondary rounded">
                          {amount.toLocaleString()} FCFA
                        </span>
                      ))}
                      {type.defaultAmounts.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{type.defaultAmounts.length - 3}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={type.isActive ? "default" : "secondary"}>
                      {type.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={type.validatedByParish ? "default" : "outline"}>
                      {type.validatedByParish ? "Validé" : "En attente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/donation-types/${type.donationTypeId}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                      </Link>
                      {(claims?.role === "super_admin" || 
                        (claims?.role === "parish_admin" && type.parishId === claims.parishId) ||
                        (claims?.role === "church_admin" && type.churchId === claims.churchId && type.createdByRole === "church_admin")) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setDonationTypeToDelete(type.donationTypeId)
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce type de don ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => donationTypeToDelete && handleDelete(donationTypeToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {donationTypes.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={donationTypes.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage)
            setCurrentPage(1)
          }}
        />
      )}
    </div>
  )
}
