"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, RefreshCw, DollarSign, Settings } from "lucide-react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Pagination } from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"
import { DonationTypeService, DonationTypeItem } from "@/lib/firestore-services"

export default function AdminParoisseDonationTypesPage() {
  const searchParams = useSearchParams()
  const paroisse = searchParams.get('paroisse') || 'Paroisse Saint Jean Bosco'
  const { toast } = useToast()
  
  const [donationTypes, setDonationTypes] = useState<DonationTypeItem[]>([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingType, setEditingType] = useState<DonationTypeItem | null>(null)

  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    suggestedAmount: 0,
    isActive: true
  })

  // Charger les types de dons depuis Firestore
  const loadDonationTypes = async () => {
    try {
      setLoading(true)
      // Charger tous les types et filtrer par paroisse
      const allTypes = await DonationTypeService.getAll()
      const types = allTypes.filter(t => t.paroisse === paroisse || t.diocese === paroisse)
      setDonationTypes(types)
    } catch (error) {
      console.error('Erreur lors du chargement des types de dons:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les types de dons",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Ajouter un nouveau type de don
  const handleAddType = async () => {
    try {
      if (!formData.name.trim()) {
        toast({
          title: "Erreur",
          description: "Le nom du type de don est requis",
          variant: "destructive"
        })
        return
      }

      await DonationTypeService.create({
        ...formData,
        paroisse: paroisse
      })
      
      toast({
        title: "Succès",
        description: "Type de don ajouté avec succès"
      })
      
      resetForm()
      setIsAddDialogOpen(false)
      loadDonationTypes()
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le type de don",
        variant: "destructive"
      })
    }
  }

  // Modifier un type de don
  const handleEditType = async () => {
    if (!editingType?.id) return

    try {
      await DonationTypeService.update(editingType.id, formData)
      
      toast({
        title: "Succès",
        description: "Type de don modifié avec succès"
      })
      
      resetForm()
      setIsEditDialogOpen(false)
      setEditingType(null)
      loadDonationTypes()
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
      toast({
        title: "Erreur",
        description: "Impossible de modifier le type de don",
        variant: "destructive"
      })
    }
  }

  // Supprimer un type de don
  const handleDeleteType = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce type de don ?')) return

    try {
      await DonationTypeService.delete(id)
      
      toast({
        title: "Succès",
        description: "Type de don supprimé avec succès"
      })
      
      loadDonationTypes()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le type de don",
        variant: "destructive"
      })
    }
  }

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      suggestedAmount: 0,
      isActive: true
    })
  }

  // Ouvrir le dialogue d'édition
  const openEditDialog = (type: DonationTypeItem) => {
    setEditingType(type)
    setFormData({
      name: type.name,
      description: type.description || '',
      suggestedAmount: type.suggestedAmount || 0,
      isActive: type.isActive
    })
    setIsEditDialogOpen(true)
  }

  // Filtrer les types de dons
  const filteredTypes = donationTypes.filter(type =>
    type.name.toLowerCase().includes(search.toLowerCase()) ||
    (type.description && type.description.toLowerCase().includes(search.toLowerCase()))
  )

  // Pagination
  const totalPages = Math.ceil(filteredTypes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTypes = filteredTypes.slice(startIndex, startIndex + itemsPerPage)

  useEffect(() => {
    loadDonationTypes()
  }, [paroisse])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Chargement des types de dons...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Types de Dons
              </h1>
              <p className="text-gray-600">
                Gérez les types de dons disponibles pour {paroisse}
              </p>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un Type
            </Button>
          </div>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Types</p>
                  <p className="text-2xl font-bold text-gray-900">{donationTypes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Settings className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Types Actifs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {donationTypes.filter(t => t.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <RefreshCw className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Dernière MAJ</p>
                  <p className="text-sm text-gray-500">Maintenant</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Barre de recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher un type de don..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              onClick={loadDonationTypes}
              variant="outline"
              className="px-4"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Liste des types de dons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {paginatedTypes.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun type de don trouvé
                </h3>
                <p className="text-gray-600 mb-6">
                  {search ? "Aucun type de don ne correspond à votre recherche." : "Commencez par ajouter votre premier type de don."}
                </p>
                {!search && (
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter le premier type
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {paginatedTypes.map((type, index) => (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {type.name}
                            </h3>
                            <Badge variant={type.isActive ? "default" : "secondary"}>
                              {type.isActive ? "Actif" : "Inactif"}
                            </Badge>
                          </div>
                          
                          {type.description && (
                            <p className="text-gray-600 mb-2">{type.description}</p>
                          )}
                          
                          {type.suggestedAmount && type.suggestedAmount > 0 && (
                            <p className="text-sm text-green-600 font-medium">
                              Montant suggéré: {type.suggestedAmount.toLocaleString()} FCFA
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(type)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteType(type.id!)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </motion.div>
        )}

        {/* Dialogue d'ajout */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un Type de Don</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du type *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Quête dominicale"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du type de don..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="suggestedAmount">Montant suggéré (FCFA)</Label>
                <Input
                  id="suggestedAmount"
                  type="number"
                  value={formData.suggestedAmount}
                  onChange={(e) => setFormData({ ...formData, suggestedAmount: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isActive">Type actif</Label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleAddType}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Ajouter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm()
                    setIsAddDialogOpen(false)
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialogue d'édition */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier le Type de Don</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nom du type *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Quête dominicale"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du type de don..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-suggestedAmount">Montant suggéré (FCFA)</Label>
                <Input
                  id="edit-suggestedAmount"
                  type="number"
                  value={formData.suggestedAmount}
                  onChange={(e) => setFormData({ ...formData, suggestedAmount: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="edit-isActive">Type actif</Label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleEditType}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm()
                    setIsEditDialogOpen(false)
                    setEditingType(null)
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
