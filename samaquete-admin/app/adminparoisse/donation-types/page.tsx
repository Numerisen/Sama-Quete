"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  Heart,
  Gift,
  Church,
  Users,
  Flame
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ParishDonationTypeService, DonationType } from "@/lib/parish-services"

const iconOptions = [
  { value: 'heart', label: 'Cœur', icon: Heart },
  { value: 'gift', label: 'Cadeau', icon: Gift },
  { value: 'church', label: 'Église', icon: Church },
  { value: 'users', label: 'Communauté', icon: Users },
  { value: 'flame', label: 'Bougie/Cierge', icon: Flame },
]

export default function DonationTypesPage() {
  const searchParams = useSearchParams()
  const paroisse = searchParams.get('paroisse') || 'Paroisse Saint Jean Bosco'
  const { userRole } = useAuth()
  const { toast } = useToast()

  const parishId = userRole?.parishId || 'paroisse-saint-jean-bosco'

  const [donationTypes, setDonationTypes] = useState<DonationType[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newType, setNewType] = useState<Partial<DonationType>>({
    name: "",
    description: "",
    icon: "heart",
    defaultAmounts: [1000, 5000, 10000, 25000],
    active: true,
    order: 0
  })

  useEffect(() => {
    loadDonationTypes()
  }, [parishId])

  const loadDonationTypes = async () => {
    try {
      setLoading(true)
      const types = await ParishDonationTypeService.getAll(parishId)
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

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleAddType = async () => {
    if (!newType.name || !newType.description || newType.defaultAmounts?.length !== 4) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs et définir 4 montants par défaut",
        variant: "destructive"
      })
      return
    }

    try {
      const typeData = {
        name: newType.name!,
        description: newType.description!,
        icon: newType.icon || "heart",
        defaultAmounts: newType.defaultAmounts!,
        active: newType.active ?? true,
        order: newType.order || 0,
        parishId
      }

      await ParishDonationTypeService.create(typeData)
      await loadDonationTypes()

      setNewType({ 
        name: "", 
        description: "", 
        icon: "heart", 
        defaultAmounts: [1000, 5000, 10000, 25000], 
        active: true,
        order: 0 
      })
      setIsAdding(false)

      toast({
        title: "Succès",
        description: "Type de don ajouté avec succès"
      })
    } catch (error) {
      console.error('Erreur lors de l\'ajout du type de don:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le type de don",
        variant: "destructive"
      })
    }
  }

  const handleEditType = (id: string) => {
    const typeToEdit = donationTypes.find(type => type.id === id)
    if (typeToEdit) {
      setNewType(typeToEdit)
      setEditingId(id)
    }
  }

  const handleSaveEdit = async (id: string, updatedType: Partial<DonationType>) => {
    try {
      await ParishDonationTypeService.update(id, updatedType)
      await loadDonationTypes()
      setEditingId(null)
      setNewType({ 
        name: "", 
        description: "", 
        icon: "heart", 
        defaultAmounts: [1000, 5000, 10000, 25000], 
        active: true,
        order: 0 
      })

      toast({
        title: "Succès",
        description: "Type de don mis à jour avec succès"
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour du type de don:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le type de don",
        variant: "destructive"
      })
    }
  }

  const handleDeleteType = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce type de don ?')) {
      return
    }

    try {
      await ParishDonationTypeService.delete(id)
      await loadDonationTypes()

      toast({
        title: "Succès",
        description: "Type de don supprimé avec succès"
      })
    } catch (error) {
      console.error('Erreur lors de la suppression du type de don:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le type de don",
        variant: "destructive"
      })
    }
  }

  const toggleTypeActive = async (id: string) => {
    try {
      const type = donationTypes.find(t => t.id === id)
      if (type) {
        await ParishDonationTypeService.update(id, { active: !type.active })
        await loadDonationTypes()
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error)
      toast({
        title: "Erreur",
        description: "Impossible de changer le statut du type de don",
        variant: "destructive"
      })
    }
  }

  const handleAmountChange = (index: number, value: string) => {
    const amounts = [...(newType.defaultAmounts || [1000, 5000, 10000, 25000])]
    amounts[index] = parseInt(value) || 0
    setNewType({ ...newType, defaultAmounts: amounts })
  }

  const getIconComponent = (iconName: string) => {
    const icon = iconOptions.find(opt => opt.value === iconName)
    return icon ? icon.icon : Heart
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
        <p className="ml-3 text-lg text-gray-700">Chargement des types de dons...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Card className="bg-white shadow-lg rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">Types de dons</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Configurez les types de dons et les montants par défaut pour votre paroisse
            </p>
          </div>
          <Button onClick={() => setIsAdding(true)} className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="w-5 h-5 mr-2" />
            Nouveau type de don
          </Button>
        </CardHeader>
        <CardContent>
          {(isAdding || editingId) && (
            <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">
                {editingId ? "Modifier le type de don" : "Ajouter un nouveau type de don"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700">Nom du type de don</Label>
                  <Input
                    id="name"
                    value={newType.name}
                    onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                    placeholder="Ex: Don pour la rénovation"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="icon" className="text-gray-700">Icône</Label>
                  <select
                    id="icon"
                    value={newType.icon}
                    onChange={(e) => setNewType({ ...newType, icon: e.target.value })}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  >
                    {iconOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <Label htmlFor="description" className="text-gray-700">Description</Label>
                <Textarea
                  id="description"
                  value={newType.description}
                  onChange={(e) => setNewType({ ...newType, description: e.target.value })}
                  placeholder="Description du type de don"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="mb-4">
                <Label className="text-gray-700 mb-3 block">Montants par défaut (4 montants en FCFA)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index}>
                      <Label htmlFor={`amount-${index}`} className="text-sm text-gray-600">
                        Montant {index + 1}
                      </Label>
                      <Input
                        id={`amount-${index}`}
                        type="number"
                        value={newType.defaultAmounts?.[index] || 0}
                        onChange={(e) => handleAmountChange(index, e.target.value)}
                        placeholder="1000"
                        className="mt-1"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Les utilisateurs pourront aussi saisir un montant personnalisé
                </p>
              </div>

              <div className="mb-4">
                <Label htmlFor="order" className="text-gray-700">Ordre d'affichage</Label>
                <Input
                  id="order"
                  type="number"
                  value={newType.order || 0}
                  onChange={(e) => setNewType({ ...newType, order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="mt-1 w-32"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAdding(false)
                    setEditingId(null)
                    setNewType({ 
                      name: "", 
                      description: "", 
                      icon: "heart", 
                      defaultAmounts: [1000, 5000, 10000, 25000], 
                      active: true,
                      order: 0 
                    })
                  }} 
                  className="text-gray-600"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button 
                  onClick={editingId ? () => handleSaveEdit(editingId, newType) : handleAddType} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? "Sauvegarder" : "Ajouter"}
                </Button>
              </div>
            </div>
          )}

          {donationTypes.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Aucun type de don configuré</p>
              <p className="text-gray-400 text-sm mt-2">Commencez par ajouter votre premier type de don</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {donationTypes.map(type => {
                const IconComponent = getIconComponent(type.icon || 'heart')
                return (
                  <Card key={type.id} className="bg-white shadow-md rounded-lg overflow-hidden border-l-4 border-green-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800">{type.name}</h4>
                            <Badge variant={type.active ? "default" : "secondary"} className="text-xs mt-1">
                              {type.active ? "Actif" : "Inactif"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{type.description}</p>

                      <div className="mb-4">
                        <Label className="text-sm text-gray-700 mb-2 block">Montants par défaut :</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {type.defaultAmounts.map((amount, index) => (
                            <Badge key={index} variant="outline" className="justify-center py-2 text-sm">
                              {formatAmount(amount)}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toggleTypeActive(type.id!)} 
                          className="text-gray-600"
                        >
                          {type.active ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                          {type.active ? "Désactiver" : "Activer"}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditType(type.id!)} 
                          className="text-blue-600"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteType(type.id!)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
