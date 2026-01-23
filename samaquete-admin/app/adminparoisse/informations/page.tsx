"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { ParishService, Parish } from "@/lib/parish-service"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Save, Info } from "lucide-react"
import { useSearchParams } from "next/navigation"

/**
 * Page "Informations paroisse" - Admin Paroisse
 * 
 * Objectif: Gérer les informations utilisées par le mobile lors du choix de la paroisse
 * 
 * Champs:
 * - Nom
 * - Description
 * - Statut actif / inactif
 * 
 * 📱 Ces données alimentent directement:
 * - la liste des paroisses côté mobile
 * - l'écran "Votre église actuelle"
 */
export default function InformationsParoissePage() {
  const { toast } = useToast()
  const { userRole } = useAuth()
  const searchParams = useSearchParams()
  const parishId = userRole?.parishId || searchParams.get('parishId') || ''
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [parish, setParish] = useState<Parish | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  })

  useEffect(() => {
    if (parishId) {
      loadParishInfo()
    } else {
      toast({
        title: "Erreur",
        description: "Aucune paroisse sélectionnée",
        variant: "destructive"
      })
      setLoading(false)
    }
  }, [parishId])

  const loadParishInfo = async () => {
    try {
      setLoading(true)
      const parishData = await ParishService.getParishById(parishId)
      
      if (parishData) {
        setParish(parishData)
        setFormData({
          name: parishData.name,
          description: (parishData as any).description || '',
          isActive: parishData.isActive
        })
      } else {
        toast({
          title: "Erreur",
          description: "Paroisse introuvable",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les informations de la paroisse",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!parishId) {
      toast({
        title: "Erreur",
        description: "Aucune paroisse sélectionnée",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    
    try {
      const success = await ParishService.updateParish(parishId, {
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive
      } as any)

      if (success) {
        toast({
          title: "Succès",
          description: "Informations de la paroisse mises à jour avec succès"
        })
        await loadParishInfo()
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour les informations",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement des informations...</p>
        </div>
      </div>
    )
  }

  if (!parish) {
    return (
      <div className="text-center py-12">
        <Info className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">Paroisse introuvable</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-black mb-1">
            Informations paroisse
          </CardTitle>
          <p className="text-black/80 text-sm">
            Gérez les informations utilisées par le mobile lors du choix de la paroisse
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-black font-semibold">
                Nom de la paroisse *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Paroisse Saint-Joseph"
                className="bg-white border-gray-200"
                required
              />
              <p className="text-xs text-gray-500">
                Ce nom apparaîtra dans la liste des paroisses côté mobile
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-black font-semibold">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la paroisse..."
                className="bg-white border-gray-200 min-h-[120px]"
                rows={4}
              />
              <p className="text-xs text-gray-500">
                Description visible dans l'écran "Votre église actuelle" du mobile
              </p>
            </div>

            {/* Statut actif */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-0.5">
                <Label htmlFor="isActive" className="text-black font-semibold">
                  Statut actif
                </Label>
                <p className="text-xs text-gray-500">
                  Si désactivé, la paroisse ne sera plus visible dans la liste mobile
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            {/* Informations supplémentaires (lecture seule) */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-black">Informations complémentaires</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600 text-sm">Ville</Label>
                  <p className="text-black font-medium">{parish.city || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-600 text-sm">Diocèse</Label>
                  <p className="text-black font-medium">{parish.dioceseName || '-'}</p>
                </div>
                {parish.contactInfo?.email && (
                  <div>
                    <Label className="text-gray-600 text-sm">Email</Label>
                    <p className="text-black font-medium">{parish.contactInfo.email}</p>
                  </div>
                )}
                {parish.contactInfo?.phone && (
                  <div>
                    <Label className="text-gray-600 text-sm">Téléphone</Label>
                    <p className="text-black font-medium">{parish.contactInfo.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bouton de sauvegarde */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-900 hover:bg-blue-800 text-white shadow-lg rounded-xl px-6 py-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
