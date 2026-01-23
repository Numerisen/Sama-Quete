"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Church, Plus, Edit, Trash2, RefreshCw, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Pagination } from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"
import { ChurchService, Church as ChurchType } from "@/lib/church-service"
import { createChurchAdmin } from "@/lib/admin-user-creation"
import { useAuth } from "@/lib/auth-context"

/**
 * Page "Églises" - Admin Paroisse
 * 
 * Objectif: Organisation interne de la paroisse
 * 
 * Fonctionnalités:
 * - Créer / modifier / activer / désactiver une église
 * - Assigner des admins église
 * 
 * ⚠️ Les églises ne sont JAMAIS visibles côté mobile
 */
export default function AdminParoisseEglisesPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { userRole } = useAuth()
  const parishId = userRole?.parishId || searchParams.get('parishId') || ''
  
  const [churches, setChurches] = useState<ChurchType[]>([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingChurch, setEditingChurch] = useState<ChurchType | null>(null)

  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    contactInfo: {
      email: '',
      phone: ''
    },
    isActive: true
  })

  useEffect(() => {
    if (parishId) {
      loadChurches()
    } else {
      toast({
        title: "Erreur",
        description: "Aucune paroisse sélectionnée",
        variant: "destructive"
      })
      setLoading(false)
    }
  }, [parishId])

  const loadChurches = async () => {
    if (!parishId) return
    
    try {
      setLoading(true)
      const churchesData = await ChurchService.getChurchesByParish(parishId)
      setChurches(churchesData)
    } catch (error) {
      console.error('Erreur lors du chargement des églises:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les églises depuis Firebase",
        variant: "destructive"
      })
      setChurches([])
    } finally {
      setLoading(false)
    }
  }

  // Filtres et recherche
  const filteredChurches = churches.filter(c => {
    const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase()) || 
                       c.city?.toLowerCase().includes(search.toLowerCase()) ||
                       c.description?.toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  // Pagination
  const totalPages = Math.ceil(filteredChurches.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedChurches = filteredChurches.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [search, churches])

  // Fonctions CRUD
  const handleAddChurch = async () => {
    if (!parishId) {
      toast({
        title: "Erreur",
        description: "Aucune paroisse sélectionnée",
        variant: "destructive"
      })
      return
    }

    if (!formData.name) {
      toast({
        title: "Erreur",
        description: "Le nom de l'église est obligatoire",
        variant: "destructive"
      })
      return
    }

    try {
      const churchId = await ChurchService.createChurch({
        name: formData.name,
        parishId,
        description: formData.description || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        contactInfo: {
          email: formData.contactInfo.email || undefined,
          phone: formData.contactInfo.phone || undefined
        },
        isActive: formData.isActive
      })
      
      if (churchId) {
        // Créer automatiquement un compte admin pour l'église
        if (userRole?.dioceseId) {
          const adminResult = await createChurchAdmin(
            churchId,
            formData.name,
            parishId,
            userRole.dioceseId
          )
          
          if (adminResult.success) {
            toast({
              title: "Succès",
              description: `Église ajoutée avec succès ! Compte admin: ${adminResult.email} / Admin123`,
            })
          } else {
            toast({
              title: "Succès",
              description: "Église ajoutée avec succès ! (Erreur lors de la création du compte admin)",
            })
            console.error("Erreur création compte admin:", adminResult.error)
          }
        } else {
          toast({
            title: "Succès",
            description: "Église ajoutée avec succès",
          })
        }
        
        setIsAddDialogOpen(false)
        resetForm()
        loadChurches()
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de créer l'église",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'église:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'église",
        variant: "destructive"
      })
    }
  }

  const handleEditChurch = async () => {
    if (!editingChurch) return

    try {
      const success = await ChurchService.updateChurch(editingChurch.id, {
        name: formData.name,
        description: formData.description || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        contactInfo: {
          email: formData.contactInfo.email || undefined,
          phone: formData.contactInfo.phone || undefined
        },
        isActive: formData.isActive
      })

      if (success) {
        toast({
          title: "Succès",
          description: "Église modifiée avec succès",
        })
        setIsEditDialogOpen(false)
        setEditingChurch(null)
        resetForm()
        loadChurches()
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de modifier l'église",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erreur lors de la modification de l\'église:', error)
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'église",
        variant: "destructive"
      })
    }
  }

  const handleDeleteChurch = async (churchId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette église ?')) return
    
    try {
      const success = await ChurchService.deleteChurch(churchId)
      if (success) {
        toast({
          title: "Succès",
          description: "Église supprimée avec succès",
        })
        loadChurches()
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'église",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'église:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'église",
        variant: "destructive"
      })
    }
  }

  const handleToggleActive = async (churchId: string, isActive: boolean) => {
    try {
      const success = await ChurchService.toggleChurch(churchId, isActive)
      if (success) {
        toast({
          title: "Succès",
          description: isActive ? "Église activée" : "Église désactivée",
        })
        loadChurches()
      }
    } catch (error) {
      console.error('Erreur lors du changement d\'état:', error)
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'état de l'église",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      city: '',
      contactInfo: {
        email: '',
        phone: ''
      },
      isActive: true
    })
  }

  const openEditDialog = (church: ChurchType) => {
    setEditingChurch(church)
    setFormData({
      name: church.name,
      description: church.description || '',
      address: church.address || '',
      city: church.city || '',
      contactInfo: {
        email: church.contactInfo?.email || '',
        phone: church.contactInfo?.phone || ''
      },
      isActive: church.isActive
    })
    setIsEditDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement des églises...</p>
        </div>
      </div>
    )
  }

  if (!parishId) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">Aucune paroisse sélectionnée</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Avertissement */}
      <Card className="mb-4 bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-800 mb-1">
                ⚠️ Les églises sont internes à l'administration
              </p>
              <p className="text-xs text-yellow-700">
                Les églises ne sont JAMAIS visibles côté mobile. Seules les paroisses sont visibles pour les utilisateurs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des églises */}
      <Card className="shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-black mb-1">
              Églises
            </CardTitle>
            <p className="text-black/80 text-sm">
              Organisation interne de la paroisse
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 w-40 bg-white/90 border-gray-200"
            />
            <Button
              onClick={loadChurches}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white">
                  <Plus className="w-4 h-4" />
                  Nouvelle église
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ajouter une nouvelle église</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de l'église *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: Église Saint-Pierre"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Description de l'église..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Ville</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        placeholder="Ex: Dakar"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="Adresse complète"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={formData.contactInfo.phone}
                        onChange={(e) => setFormData({
                          ...formData, 
                          contactInfo: {...formData.contactInfo, phone: e.target.value}
                        })}
                        placeholder="+221 XX XXX XX XX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.contactInfo.email}
                        onChange={(e) => setFormData({
                          ...formData, 
                          contactInfo: {...formData.contactInfo, email: e.target.value}
                        })}
                        placeholder="eglise@example.com"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <Label htmlFor="isActive">Statut actif</Label>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => {
                    setIsAddDialogOpen(false)
                    resetForm()
                  }}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddChurch} disabled={!formData.name}>
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
                  <th className="py-3 px-4 text-black">Contact</th>
                  <th className="py-3 px-4 text-black">Statut</th>
                  <th className="py-3 px-4 text-right text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedChurches.map((church, i) => (
                  <motion.tr
                    key={church.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="border-b last:border-0 hover:bg-blue-50/40"
                  >
                    <td className="py-2 px-4 font-semibold text-black">{church.name}</td>
                    <td className="py-2 px-4 text-black">{church.city || '-'}</td>
                    <td className="py-2 px-4 text-black">
                      {church.contactInfo?.phone || church.contactInfo?.email || '-'}
                    </td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        church.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {church.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(church.id, !church.isActive)}
                        >
                          {church.isActive ? 'Désactiver' : 'Activer'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(church)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteChurch(church.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {paginatedChurches.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Church className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune église trouvée</h3>
                <p className="text-gray-600 mb-6">
                  {churches.length === 0 
                    ? "Aucune église n'est enregistrée pour cette paroisse."
                    : "Aucune église ne correspond à vos critères de recherche."
                  }
                </p>
                {churches.length === 0 && (
                  <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Ajouter la première église
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredChurches.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredChurches.length}
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
            <DialogTitle>Modifier l'église</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom de l'église *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Église Saint-Pierre"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Description de l'église..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-city">Ville</Label>
                <Input
                  id="edit-city"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="Ex: Dakar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Adresse</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Adresse complète"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Téléphone</Label>
                <Input
                  id="edit-phone"
                  value={formData.contactInfo.phone}
                  onChange={(e) => setFormData({
                    ...formData, 
                    contactInfo: {...formData.contactInfo, phone: e.target.value}
                  })}
                  placeholder="+221 XX XXX XX XX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={(e) => setFormData({
                    ...formData, 
                    contactInfo: {...formData.contactInfo, email: e.target.value}
                  })}
                  placeholder="eglise@example.com"
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="edit-isActive">Statut actif</Label>
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false)
              setEditingChurch(null)
              resetForm()
            }}>
              Annuler
            </Button>
            <Button onClick={handleEditChurch} disabled={!formData.name}>
              Modifier
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
