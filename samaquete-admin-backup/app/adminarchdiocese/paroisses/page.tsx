"use client"
export const dynamic = "force-dynamic"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MapPin, UserCircle, Users, Plus, Edit, Trash2, RefreshCw, Download } from "lucide-react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Pagination } from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"
import { ParishService, Diocese } from "@/lib/parish-service"
import { createParishAdmin } from "@/lib/admin-user-creation"

export default function AdminDioceseParishesPage() {
  const searchParams = useSearchParams()
  const dioceseName = searchParams.get('diocese') || 'Archidiocèse de Dakar'
  const { toast } = useToast()
  
  const [parishes, setParishes] = useState<any[]>([])
  const [dioceses, setDioceses] = useState<Diocese[]>([])
  const [currentDiocese, setCurrentDiocese] = useState<Diocese | null>(null)
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
    phone: '',
    email: '',
    description: ''
  })

  // Charger les diocèses et paroisses depuis Firestore
  const loadData = async () => {
    try {
      setLoading(true)
      const [diocesesData, parishesData] = await Promise.all([
        ParishService.getDioceses(),
        ParishService.getParishes({ isActive: true })
      ])
      
      setDioceses(diocesesData)
      
      // Trouver le diocèse par nom
      const foundDiocese = diocesesData.find(d => d.name === dioceseName)
      if (foundDiocese) {
        setCurrentDiocese(foundDiocese)
        // Filtrer les paroisses par dioceseId
        const dioceseParishes = parishesData.filter(p => p.dioceseId === foundDiocese.id)
        setParishes(dioceseParishes)
      } else {
        setParishes([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données depuis Firebase",
        variant: "destructive"
      })
      setParishes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [dioceseName])

  // Filtres et recherche
  const filteredParishes = parishes.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || 
                       p.city?.toLowerCase().includes(search.toLowerCase()) ||
                       (p.contactInfo?.email && p.contactInfo.email.toLowerCase().includes(search.toLowerCase())) ||
                       (p.contactInfo?.phone && p.contactInfo.phone.toLowerCase().includes(search.toLowerCase()))
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
    if (!currentDiocese) {
      toast({
        title: "Erreur",
        description: "Diocèse non trouvé",
        variant: "destructive"
      })
      return
    }

    try {
      const parishData = {
        name: formData.name,
        dioceseId: currentDiocese.id,
        dioceseName: currentDiocese.name,
        location: formData.city,
        city: formData.city,
        priest: '', // Champ requis mais vide
        contactInfo: {
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined
        },
        isActive: true
      }
      
      const parishId = await ParishService.createParish(parishData)
      
      if (parishId) {
        // Créer automatiquement un compte admin pour la paroisse
        const adminResult = await createParishAdmin(parishId, formData.name, currentDiocese.id)
        
        if (adminResult.success) {
          toast({
            title: "Succès",
            description: `Paroisse créée avec succès ! Compte admin: ${adminResult.email} / Admin123`,
            variant: "default"
          })
        } else {
          toast({
            title: "Succès",
            description: "Paroisse créée avec succès ! (Erreur lors de la création du compte admin)",
            variant: "default"
          })
          console.error("Erreur création compte admin:", adminResult.error)
        }
      } else {
        toast({
          title: "Erreur",
          description: "Erreur lors de la création de la paroisse",
          variant: "destructive"
        })
        return
      }
      
      setIsAddDialogOpen(false)
      resetForm()
      loadData()
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
    if (!currentDiocese || !editingParish) {
      toast({
        title: "Erreur",
        description: "Données manquantes",
        variant: "destructive"
      })
      return
    }

    try {
      const parishData = {
        name: formData.name,
        dioceseId: currentDiocese.id,
        dioceseName: currentDiocese.name,
        location: formData.city,
        city: formData.city,
        priest: '', // Champ requis mais vide
        contactInfo: {
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined
        }
      }
      
      const success = await ParishService.updateParish(editingParish.id, parishData)
      
      if (success) {
        toast({
          title: "Succès",
          description: "Paroisse modifiée avec succès",
          variant: "default"
        })
        setIsEditDialogOpen(false)
        setEditingParish(null)
        resetForm()
        loadData()
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de modifier la paroisse",
          variant: "destructive"
        })
      }
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
      const success = await ParishService.deleteParish(parishId)
      
      if (success) {
        toast({
          title: "Succès",
          description: "Paroisse supprimée avec succès",
          variant: "default"
        })
        loadData()
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la paroisse",
          variant: "destructive"
        })
      }
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
      address: parish.contactInfo?.address || '',
      phone: parish.contactInfo?.phone || '',
      email: parish.contactInfo?.email || '',
      description: ''
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
              Paroisses - {currentDiocese?.name || dioceseName}
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
              onClick={() => {
                const header = ["Nom", "Ville", "Email", "Téléphone", "Adresse"]
                const rows = filteredParishes.map(p => [
                  p.name || '',
                  p.city || '',
                  p.contactInfo?.email || '',
                  p.contactInfo?.phone || '',
                  p.contactInfo?.address || ''
                ])
                const csvContent = [header, ...rows].map(e => e.join(",")).join("\n")
                const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
                const url = URL.createObjectURL(blob)
                const link = document.createElement("a")
                link.href = url
                link.setAttribute("download", `paroisses-${currentDiocese?.name || dioceseName}.csv`)
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
              variant="outline"
              className="flex items-center gap-2 text-black border-blue-200 bg-white/90 hover:bg-blue-50 rounded-xl px-3 py-2"
            >
              <Download className="w-5 h-5" /> Export CSV
            </Button>
            <Button
              onClick={loadData}
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
                  <th className="py-3 px-4 text-black">Email</th>
                  <th className="py-3 px-4 text-black">Téléphone</th>
                  <th className="py-3 px-4 text-black">Adresse</th>
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
                    <td className="py-2 px-4 text-black">{parish.contactInfo?.email || 'N/A'}</td>
                    <td className="py-2 px-4 text-black">{parish.contactInfo?.phone || 'N/A'}</td>
                    <td className="py-2 px-4 text-black">{parish.contactInfo?.address || 'N/A'}</td>
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
                    ? `Aucune paroisse n'est enregistrée dans Firestore pour le diocèse ${currentDiocese?.name || dioceseName}.`
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