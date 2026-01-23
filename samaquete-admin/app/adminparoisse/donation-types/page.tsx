"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  AlertCircle,
  GripVertical,
  Eye,
  EyeOff
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DonationTypeService, DonationType } from "@/lib/donation-type-service"
import { motion } from "framer-motion"

/**
 * Page "Types de dons" - Admin Paroisse
 * 
 * Objectif: Configurer l'écran "Faire un don" du mobile
 * 
 * Fonctionnalités:
 * - Créer / modifier / activer / désactiver un type de don
 * - Définir: nom, description, icône, montants suggérés (4), ordre d'affichage
 * 
 * 📱 Ces données sont consommées directement par le mobile
 * ⚠️ Si un type est inactif, il ne doit jamais apparaître côté mobile
 */
export default function TypesDonsPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { userRole } = useAuth()
  const parishId = userRole?.parishId || searchParams.get('parishId') || ''
  
  const [donationTypes, setDonationTypes] = useState<DonationType[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingType, setEditingType] = useState<DonationType | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'heart-outline',
    gradientColors: ['#f87171', '#ef4444'] as [string, string],
    defaultAmounts: ['', '', '', ''] as [string, string, string, string],
    order: 0,
    isActive: true
  })

  useEffect(() => {
    if (parishId) {
      loadDonationTypes()
    }
  }, [parishId])

  const loadDonationTypes = async () => {
    if (!parishId) return
    
    try {
      setLoading(true)
      const types = await DonationTypeService.getAllDonationTypesByParish(parishId)
      // Trier par ordre
      types.sort((a, b) => (a.order || 0) - (b.order || 0))
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

  const handleAdd = async () => {
    if (!parishId) return

    if (!formData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom est obligatoire",
        variant: "destructive"
      })
      return
    }

    // Vérifier que les 4 montants sont remplis
    const amounts = formData.defaultAmounts.filter(a => a.trim() !== '')
    if (amounts.length < 4) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir les 4 montants suggérés",
        variant: "destructive"
      })
      return
    }

    try {
      // Calculer l'ordre (max + 1)
      const maxOrder = donationTypes.length > 0 
        ? Math.max(...donationTypes.map(t => t.order || 0))
        : 0

      const typeId = await DonationTypeService.createDonationType({
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        gradientColors: formData.gradientColors,
        defaultAmounts: formData.defaultAmounts,
        isActive: formData.isActive,
        parishId,
        order: maxOrder + 1
      })

      if (typeId) {
        toast({
          title: "Succès",
          description: "Type de don créé avec succès"
        })
        setIsAddDialogOpen(false)
        resetForm()
        loadDonationTypes()
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de créer le type de don",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive"
      })
    }
  }

  const handleEdit = async () => {
    if (!editingType?.id) return

    if (!formData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom est obligatoire",
        variant: "destructive"
      })
      return
    }

    try {
      const success = await DonationTypeService.updateDonationType(editingType.id, {
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        gradientColors: formData.gradientColors,
        defaultAmounts: formData.defaultAmounts,
        order: formData.order,
        isActive: formData.isActive
      })

      if (success) {
        toast({
          title: "Succès",
          description: "Type de don modifié avec succès"
        })
        setIsEditDialogOpen(false)
        setEditingType(null)
        resetForm()
        loadDonationTypes()
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de modifier le type de don",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (typeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce type de don ?')) return

    try {
      const success = await DonationTypeService.deleteDonationType(typeId)
      if (success) {
        toast({
          title: "Succès",
          description: "Type de don supprimé"
        })
        loadDonationTypes()
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le type de don",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive"
      })
    }
  }

  const handleToggleActive = async (typeId: string, isActive: boolean) => {
    try {
      const success = await DonationTypeService.toggleDonationType(typeId, isActive)
      if (success) {
        toast({
          title: "Succès",
          description: isActive ? "Type de don activé" : "Type de don désactivé"
        })
        loadDonationTypes()
      }
    } catch (error) {
      console.error('Erreur lors du changement d\'état:', error)
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'état",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: 'heart-outline',
      gradientColors: ['#f87171', '#ef4444'],
      defaultAmounts: ['', '', '', ''],
      order: 0,
      isActive: true
    })
  }

  const openEditDialog = (type: DonationType) => {
    setEditingType(type)
    setFormData({
      name: type.name,
      description: type.description,
      icon: type.icon,
      gradientColors: type.gradientColors,
      defaultAmounts: type.defaultAmounts,
      order: type.order || 0,
      isActive: type.isActive
    })
    setIsEditDialogOpen(true)
  }

  const iconOptions = [
    { value: 'heart-outline', label: 'Cœur' },
    { value: 'add', label: 'Plus' },
    { value: 'flame', label: 'Flamme' },
    { value: 'business', label: 'Église' },
    { value: 'gift', label: 'Cadeau' },
    { value: 'church', label: 'Église' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement des types de dons...</p>
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
      <Card className="mb-4 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800 mb-1">
                📱 Source unique pour le mobile
              </p>
              <p className="text-xs text-blue-700">
                Ces types de dons sont consommés directement par l'application mobile. 
                Les types inactifs ne seront jamais visibles côté mobile.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-black mb-1">
              Types de dons
            </CardTitle>
            <p className="text-black/80 text-sm">
              Configurez l'écran "Faire un don" du mobile
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-900 hover:bg-blue-800 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau type de don
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un type de don</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Quête dominicale"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Description du type de don"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">Icône</Label>
                  <select
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    className="w-full rounded-md border border-gray-200 px-3 py-2"
                  >
                    {iconOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Montants suggérés (4 montants) *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map(index => (
                      <Input
                        key={index}
                        value={formData.defaultAmounts[index]}
                        onChange={(e) => {
                          const newAmounts = [...formData.defaultAmounts] as [string, string, string, string]
                          newAmounts[index] = e.target.value
                          setFormData({...formData, defaultAmounts: newAmounts})
                        }}
                        placeholder={`Montant ${index + 1} (FCFA)`}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Ordre d'affichage</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500">Plus petit = affiché en premier</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <Label htmlFor="isActive">Actif</Label>
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
                <Button onClick={handleAdd}>
                  Créer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {donationTypes.length === 0 ? (
              <div className="text-center py-12">
                <Tag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Aucun type de don trouvé</p>
              </div>
            ) : (
              donationTypes.map((type, i) => (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-black">{type.name}</h3>
                        {type.isActive ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Eye className="w-3 h-3 mr-1" />
                            Actif
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Inactif
                          </Badge>
                        )}
                        <Badge variant="outline">Ordre: {type.order || 0}</Badge>
                      </div>
                      {type.description && (
                        <p className="text-gray-600 text-sm mb-3">{type.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-gray-500">Montants suggérés:</span>
                        {type.defaultAmounts.map((amount, idx) => (
                          <Badge key={idx} variant="outline">
                            {amount} FCFA
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(type.id!, !type.isActive)}
                      >
                        {type.isActive ? 'Désactiver' : 'Activer'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(type)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(type.id!)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le type de don</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Quête dominicale"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Description du type de don"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-icon">Icône</Label>
              <select
                id="edit-icon"
                value={formData.icon}
                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                className="w-full rounded-md border border-gray-200 px-3 py-2"
              >
                {iconOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Montants suggérés (4 montants) *</Label>
              <div className="grid grid-cols-2 gap-2">
                {[0, 1, 2, 3].map(index => (
                  <Input
                    key={index}
                    value={formData.defaultAmounts[index]}
                    onChange={(e) => {
                      const newAmounts = [...formData.defaultAmounts] as [string, string, string, string]
                      newAmounts[index] = e.target.value
                      setFormData({...formData, defaultAmounts: newAmounts})
                    }}
                    placeholder={`Montant ${index + 1} (FCFA)`}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-order">Ordre d'affichage</Label>
              <Input
                id="edit-order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                placeholder="0"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="edit-isActive">Actif</Label>
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
              setEditingType(null)
              resetForm()
            }}>
              Annuler
            </Button>
            <Button onClick={handleEdit}>
              Modifier
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
