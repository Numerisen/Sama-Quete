'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { DonationType, DonationTypeService } from '@/lib/donation-type-service'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/lib/auth-context'
import { useSearchParams } from 'next/navigation'

export default function DonationTypesPage() {
  const [donationTypes, setDonationTypes] = useState<DonationType[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingType, setEditingType] = useState<DonationType | null>(null)
  const { toast } = useToast()
  const { userRole } = useAuth()
  const searchParams = useSearchParams()
  
  // Récupérer l'ID de la paroisse depuis l'utilisateur connecté ou les paramètres
  const parishId = userRole?.parishId || searchParams.get('parishId') || ''
  const parishName = userRole?.parishName || searchParams.get('paroisse') || 'Paroisse'

  // État du formulaire
  const [formData, setFormData] = useState<Partial<DonationType>>({
    name: '',
    description: '',
    icon: 'heart-outline',
    gradientColors: ['#f87171', '#ef4444'],
    defaultAmounts: ['1,000', '2,000', '5,000', '10,000'],
    isActive: true,
    order: 1
  })

  useEffect(() => {
    if (parishId) {
      loadDonationTypes()
    }
  }, [parishId])

  const loadDonationTypes = async () => {
    setLoading(true)
    try {
      const types = await DonationTypeService.getAllDonationTypesByParish(parishId)
      setDonationTypes(types)
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les types de dons',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (type?: DonationType) => {
    if (type) {
      setEditingType(type)
      setFormData(type)
    } else {
      setEditingType(null)
      setFormData({
        name: '',
        description: '',
        icon: 'heart-outline',
        gradientColors: ['#f87171', '#ef4444'],
        defaultAmounts: ['1,000', '2,000', '5,000', '10,000'],
        isActive: true,
        order: donationTypes.length + 1,
        parishId
      })
    }
    setShowDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setEditingType(null)
    setFormData({
      name: '',
      description: '',
      icon: 'heart-outline',
      gradientColors: ['#f87171', '#ef4444'],
      defaultAmounts: ['1,000', '2,000', '5,000', '10,000'],
      isActive: true,
      order: 1
    })
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.description) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive'
      })
      return
    }

    try {
      if (editingType?.id) {
        // Mise à jour
        const success = await DonationTypeService.updateDonationType(editingType.id, formData)
        if (success) {
          toast({
            title: 'Succès',
            description: 'Type de don mis à jour avec succès'
          })
          loadDonationTypes()
          handleCloseDialog()
        }
      } else {
        // Création
        const dataWithParish = { ...formData, parishId }
        const id = await DonationTypeService.createDonationType(dataWithParish as Omit<DonationType, 'id' | 'createdAt' | 'updatedAt'>)
        if (id) {
          toast({
            title: 'Succès',
            description: 'Type de don créé avec succès'
          })
          loadDonationTypes()
          handleCloseDialog()
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive'
      })
    }
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    const success = await DonationTypeService.toggleDonationType(id, !isActive)
    if (success) {
      toast({
        title: 'Succès',
        description: `Type de don ${!isActive ? 'activé' : 'désactivé'}`
      })
      loadDonationTypes()
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce type de don ?')) {
      const success = await DonationTypeService.deleteDonationType(id)
      if (success) {
        toast({
          title: 'Succès',
          description: 'Type de don supprimé avec succès'
        })
        loadDonationTypes()
      }
    }
  }

  const handleInitializeDefaults = async () => {
    if (confirm('Voulez-vous initialiser les types de dons par défaut pour cette paroisse ?')) {
      const success = await DonationTypeService.initializeDefaultDonationTypes(parishId)
      if (success) {
        toast({
          title: 'Succès',
          description: 'Types de dons par défaut initialisés'
        })
        loadDonationTypes()
      }
    }
  }

  if (!parishId) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <p className="text-red-600 font-semibold mb-2">Erreur</p>
          <p className="text-muted-foreground">
            Impossible de déterminer la paroisse. Veuillez vous reconnecter.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Types de dons</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les types de dons et leurs montants par défaut pour {parishName}
          </p>
        </div>
        <div className="flex gap-2">
          {donationTypes.length === 0 && (
            <Button onClick={handleInitializeDefaults} variant="outline">
              Initialiser les types par défaut
            </Button>
          )}
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau type
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : donationTypes.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">
            Aucun type de don configuré pour cette paroisse
          </p>
          <Button onClick={handleInitializeDefaults}>
            Initialiser les types par défaut
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {donationTypes.map((type) => (
            <Card key={type.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${type.gradientColors[0]}, ${type.gradientColors[1]})`
                  }}
                >
                  <span className="text-white text-2xl">💰</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggle(type.id!, type.isActive)}
                  >
                    {type.isActive ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenDialog(type)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(type.id!)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-2">{type.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {type.description}
              </p>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Montants par défaut:
                </p>
                <div className="flex flex-wrap gap-2">
                  {type.defaultAmounts.map((amount, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-secondary rounded text-xs font-medium"
                    >
                      {amount} FCFA
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Ordre: {type.order}
                  </span>
                  <span
                    className={`px-2 py-1 rounded ${
                      type.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {type.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog pour créer/modifier */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingType ? 'Modifier' : 'Créer'} un type de don
            </DialogTitle>
            <DialogDescription>
              Configurez les détails du type de don et ses montants par défaut
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Quête dominicale"
                />
              </div>
              <div>
                <Label htmlFor="order">Ordre d'affichage</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez ce type de don..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color1">Couleur 1 (gradient)</Label>
                <Input
                  id="color1"
                  type="color"
                  value={formData.gradientColors?.[0] || '#f87171'}
                  onChange={(e) => setFormData({
                    ...formData,
                    gradientColors: [e.target.value, formData.gradientColors?.[1] || '#ef4444']
                  })}
                />
              </div>
              <div>
                <Label htmlFor="color2">Couleur 2 (gradient)</Label>
                <Input
                  id="color2"
                  type="color"
                  value={formData.gradientColors?.[1] || '#ef4444'}
                  onChange={(e) => setFormData({
                    ...formData,
                    gradientColors: [formData.gradientColors?.[0] || '#f87171', e.target.value]
                  })}
                />
              </div>
            </div>

            <div>
              <Label>Montants par défaut (4 montants) *</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[0, 1, 2, 3].map((index) => (
                  <Input
                    key={index}
                    placeholder={`Montant ${index + 1}`}
                    value={formData.defaultAmounts?.[index] || ''}
                    onChange={(e) => {
                      const newAmounts = [...(formData.defaultAmounts || ['', '', '', ''])]
                      newAmounts[index] = e.target.value
                      setFormData({ ...formData, defaultAmounts: newAmounts as [string, string, string, string] })
                    }}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Utilisez le format: 1,000 ou 1000
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Type de don actif</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Annuler
            </Button>
            <Button onClick={handleSubmit}>
              {editingType ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

