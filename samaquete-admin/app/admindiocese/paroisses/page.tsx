"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MapPin, UserCircle, Users, Plus, Edit, Trash2, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Pagination } from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"
import { ParishService } from "@/lib/firestore-services"

export default function AdminDioceseParishesPage() {
  const searchParams = useSearchParams()
  const diocese = searchParams.get('diocese') || 'Diocèse de Thiès'
  const { toast } = useToast()
  
  const [parishes, setParishes] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingParish, setEditingParish] = useState<any>(null)

  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    cure: '',
    vicaire: '',
    catechists: '',
    members: 0,
    phone: '',
    email: '',
    description: ''
  })

  // Charger les paroisses depuis Firestore
  const loadParishes = async () => {
    try {
      setLoading(true)
      const firestoreParishes = await ParishService.getAll()
      const dioceseParishes = firestoreParishes.filter(p => p.diocese === diocese)
      setParishes(dioceseParishes)
    } catch (error) {
      console.error('Erreur lors du chargement des paroisses:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les paroisses depuis Firebase",
        variant: "destructive"
      })
      setParishes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadParishes()
  }, [diocese])

  // Filtres et recherche
  const filteredParishes = parishes.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || 
                       p.city?.toLowerCase().includes(search.toLowerCase()) ||
                       p.cure?.toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  // Pagination
  const totalPages = Math.ceil(filteredParishes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedParishes = filteredParishes.slice(startIndex, endIndex)

  // Réinitialiser la page courante quand les filtres changent
  useEffect(() => {
    setCurrentPage(1)
  }, [search, parishes])

  // Fonctions CRUD
  const handleAddParish = async () => {
    try {
      const parishData = {
        ...formData,
        diocese: diocese,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await ParishService.create(parishData)
      toast({
        title: "Succès",
        description: "Paroisse ajoutée avec succès",
        variant: "default"
      })
      setIsAddDialogOpen(false)
      resetForm()
      loadParishes()
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la paroisse:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la paroisse",
        variant: "destructive"
      })
    }
  }

  const handleEditParish = async () => {
    try {
      const parishData = {
        ...formData,
        diocese: diocese,
        updatedAt: new Date().toISOString()
      }
      
      await ParishService.update(editingParish.id, parishData)
      toast({
        title: "Succès",
        description: "Paroisse modifiée avec succès",
        variant: "default"
      })
      setIsEditDialogOpen(false)
      setEditingParish(null)
      resetForm()
      loadParishes()
    } catch (error) {
      console.error('Erreur lors de la modification de la paroisse:', error)
      toast({
        title: "Erreur",
        description: "Impossible de modifier la paroisse",
        variant: "destructive"
      })
    }
  }

  const handleDeleteParish = async (parishId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette paroisse ?')) return
    
    try {
      await ParishService.delete(parishId)
      toast({
        title: "Succès",
        description: "Paroisse supprimée avec succès",
        variant: "default"
      })
      loadParishes()
    } catch (error) {
      console.error('Erreur lors de la suppression de la paroisse:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la paroisse",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      city: '',
      address: '',
      cure: '',
      vicaire: '',
      catechists: '',
      members: 0,
      phone: '',
      email: '',
      description: ''
    })
  }

  const openEditDialog = (parish: any) => {
    setEditingParish(parish)
    setFormData({
      name: parish.name || '',
      city: parish.city || '',
      address: parish.address || '',
      cure: parish.cure || '',
      vicaire: parish.vicaire || '',
      catechists: parish.catechists || '',
      members: parish.members || 0,
      phone: parish.phone || '',
      email: parish.email || '',
      description: parish.description || ''
    })
    setIsEditDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-100">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
          <span className="text-lg text-gray-600">Chargement des paroisses...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Liste des paroisses */}
      <Card className="shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-black mb-1">
              Paroisses - {diocese}
            </CardTitle>
            <p className="text-black/80 text-sm">
              Gérez les paroisses de votre diocèse.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 w-40 bg-white/90 border-blue-200"
            />
            <Button
              onClick={loadParishes}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ajouter une nouvelle paroisse</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de la paroisse *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: Paroisse Saint-Pierre"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="Ex: Dakar"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Adresse complète de la paroisse"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cure">Curé</Label>
                    <Input
                      id="cure"
                      value={formData.cure}
                      onChange={(e) => setFormData({...formData, cure: e.target.value})}
                      placeholder="Nom du curé"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vicaire">Vicaire</Label>
                    <Input
                      id="vicaire"
                      value={formData.vicaire}
                      onChange={(e) => setFormData({...formData, vicaire: e.target.value})}
                      placeholder="Nom du vicaire"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="catechists">Catéchistes</Label>
                    <Input
                      id="catechists"
                      value={formData.catechists}
                      onChange={(e) => setFormData({...formData, catechists: e.target.value})}
                      placeholder="Nombre de catéchistes"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="members">Nombre de membres</Label>
                    <Input
                      id="members"
                      type="number"
                      value={formData.members}
                      onChange={(e) => setFormData({...formData, members: parseInt(e.target.value) || 0})}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+221 XX XXX XX XX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="paroisse@example.com"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Description de la paroisse..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddParish} disabled={!formData.name || !formData.city}>
                    Ajouter
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="text-black/80 text-sm bg-blue-50">
                  <th className="py-3 px-4 text-black">Nom</th>
                  <th className="py-3 px-4 text-black">Ville</th>
                  <th className="py-3 px-4 text-black">Curé</th>
                  <th className="py-3 px-4 text-black">Vicaire</th>
                  <th className="py-3 px-4 text-black">Catéchistes</th>
                  <th className="py-3 px-4 text-black">Membres</th>
                  <th className="py-3 px-4 text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedParishes.map((parish, i) => (
                  <motion.tr
                    key={parish.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="border-b last:border-0 hover:bg-blue-50/40"
                  >
                    <td className="py-2 px-4 font-semibold text-black">{parish.name || 'N/A'}</td>
                    <td className="py-2 px-4 text-black">{parish.city || 'N/A'}</td>
                    <td className="py-2 px-4 text-black">{parish.cure || 'N/A'}</td>
                    <td className="py-2 px-4 text-black">{parish.vicaire || 'N/A'}</td>
                    <td className="py-2 px-4 text-black">{parish.catechists || 'N/A'}</td>
                    <td className="py-2 px-4 text-black">{parish.members || 0}</td>
                    <td className="py-2 px-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(parish)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteParish(parish.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {paginatedParishes.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune paroisse trouvée</h3>
                <p className="text-gray-600 mb-6">
                  {parishes.length === 0 
                    ? `Aucune paroisse n'est enregistrée dans Firestore pour le diocèse ${diocese}.`
                    : "Aucune paroisse ne correspond à vos critères de recherche."
                  }
                </p>
                {parishes.length === 0 && (
                  <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Ajouter la première paroisse
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredParishes.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredParishes.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage)
            setCurrentPage(1)
          }}
        />
      )}

      {/* Dialog d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier la paroisse</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom de la paroisse *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Paroisse Saint-Pierre"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-city">Ville *</Label>
              <Input
                id="edit-city"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="Ex: Dakar"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-address">Adresse</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Adresse complète de la paroisse"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cure">Curé</Label>
              <Input
                id="edit-cure"
                value={formData.cure}
                onChange={(e) => setFormData({...formData, cure: e.target.value})}
                placeholder="Nom du curé"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-vicaire">Vicaire</Label>
              <Input
                id="edit-vicaire"
                value={formData.vicaire}
                onChange={(e) => setFormData({...formData, vicaire: e.target.value})}
                placeholder="Nom du vicaire"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-catechists">Catéchistes</Label>
              <Input
                id="edit-catechists"
                value={formData.catechists}
                onChange={(e) => setFormData({...formData, catechists: e.target.value})}
                placeholder="Nombre de catéchistes"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-members">Nombre de membres</Label>
              <Input
                id="edit-members"
                type="number"
                value={formData.members}
                onChange={(e) => setFormData({...formData, members: parseInt(e.target.value) || 0})}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Téléphone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+221 XX XXX XX XX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="paroisse@example.com"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Description de la paroisse..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditParish} disabled={!formData.name || !formData.city}>
              Modifier
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}