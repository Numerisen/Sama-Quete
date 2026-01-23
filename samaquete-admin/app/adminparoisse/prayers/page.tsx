"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Bell,
  Calendar,
  Settings,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { PrayerTimeService } from "@/lib/parish-services"
import { AdminNotificationService } from "@/lib/notification-service"

interface PrayerTime {
  id?: string;
  name: string;
  time: string;
  days: string[];
  active: boolean;
  description?: string;
  parishId?: string;
}

export default function PrayersPage() {
  const searchParams = useSearchParams()
  const paroisse = searchParams.get('paroisse') || 'Paroisse Saint Jean Bosco'
  const { userRole } = useAuth()
  const { toast } = useToast()
  
  const [parishId, setParishId] = useState<string>('')
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([])
  const [loading, setLoading] = useState(true)

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newPrayer, setNewPrayer] = useState<Partial<PrayerTime>>({
    name: "",
    time: "",
    days: [],
    active: true,
    description: ""
  })

  const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]

  // Récupérer le vrai ID de la paroisse depuis Firestore
  useEffect(() => {
    const fetchParishId = async () => {
      try {
        const { ParishService } = await import('@/lib/parish-service')
        const parishes = await ParishService.getParishes({ isActive: true })
        const foundParish = parishes.find(p => 
          p.name.toLowerCase().includes(paroisse.toLowerCase()) || 
          paroisse.toLowerCase().includes(p.name.toLowerCase())
        )
        if (foundParish) {
          setParishId(foundParish.id)
          console.log('✅ ParishId trouvé:', foundParish.id, 'pour:', foundParish.name)
        } else if (userRole?.parishId) {
          setParishId(userRole.parishId)
          console.log('⚠️ Utilisation du parishId du userRole:', userRole.parishId)
        } else {
          console.error('❌ Paroisse non trouvée:', paroisse)
          toast({
            title: "Erreur",
            description: `Paroisse "${paroisse}" non trouvée dans Firestore`,
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du parishId:', error)
        if (userRole?.parishId) {
          setParishId(userRole.parishId)
        }
      }
    }
    fetchParishId()
  }, [paroisse, userRole])

  // Charger les heures de prières depuis Firestore
  useEffect(() => {
    if (parishId) {
      loadPrayerTimes()
    }
  }, [parishId])

  const loadPrayerTimes = async () => {
    try {
      setLoading(true)
      const times = await PrayerTimeService.getAll(parishId)
      setPrayerTimes(times as PrayerTime[])
    } catch (error) {
      console.error('Erreur lors du chargement des heures de prières:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les heures de prières",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddPrayer = async () => {
    if (!newPrayer.name || !newPrayer.time || newPrayer.days?.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      })
      return
    }

    try {
      const prayerData = {
        name: newPrayer.name!,
        time: newPrayer.time!,
        days: newPrayer.days!,
        active: newPrayer.active ?? true,
        description: newPrayer.description || "",
        parishId
      }

      await PrayerTimeService.create(prayerData)
      
      // Envoyer une notification à tous les utilisateurs de la paroisse
      await AdminNotificationService.notifyPrayerTimeUpdate(
        parishId,
        prayerData.name,
        prayerData.time,
        true
      )
      
      await loadPrayerTimes()
      
      setNewPrayer({ name: "", time: "", days: [], active: true, description: "" })
      setIsAdding(false)
      
      toast({
        title: "Succès",
        description: "Heure de prière ajoutée avec succès et notification envoyée"
      })
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'heure de prière:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'heure de prière",
        variant: "destructive"
      })
    }
  }

  const handleEditPrayer = (id: string) => {
    setEditingId(id)
  }

  const handleSaveEdit = async (id: string, updatedPrayer: Partial<PrayerTime>) => {
    try {
      await PrayerTimeService.update(id, updatedPrayer)
      
      // Envoyer une notification de modification
      if (updatedPrayer.name && updatedPrayer.time) {
        await AdminNotificationService.notifyPrayerTimeUpdate(
          parishId,
          updatedPrayer.name,
          updatedPrayer.time,
          false
        )
      }
      
      await loadPrayerTimes()
      setEditingId(null)
      
      toast({
        title: "Succès", 
        description: "Heure de prière mise à jour avec succès et notification envoyée"
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'heure de prière:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'heure de prière",
        variant: "destructive"
      })
    }
  }

  const handleDeletePrayer = async (id: string) => {
    try {
      const prayer = prayerTimes.find(p => p.id === id)
      
      await PrayerTimeService.delete(id)
      
      // Envoyer une notification de suppression
      if (prayer) {
        await AdminNotificationService.notifyPrayerTimeDeleted(
          parishId,
          prayer.name
        )
      }
      
      await loadPrayerTimes()
      
      toast({
        title: "Succès",
        description: "Heure de prière supprimée avec succès et notification envoyée"
      })
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'heure de prière:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'heure de prière",
        variant: "destructive"
      })
    }
  }

  const togglePrayerActive = async (id: string) => {
    try {
      const prayer = prayerTimes.find(p => p.id === id)
      if (prayer) {
        await PrayerTimeService.update(id, { active: !prayer.active })
        await loadPrayerTimes()
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error)
      toast({
        title: "Erreur",
        description: "Impossible de changer le statut",
        variant: "destructive"
      })
    }
  }

  const toggleDay = (day: string) => {
    const currentDays = newPrayer.days || []
    if (currentDays.includes(day)) {
      setNewPrayer({ ...newPrayer, days: currentDays.filter(d => d !== day) })
    } else {
      setNewPrayer({ ...newPrayer, days: [...currentDays, day] })
    }
  }

  const activePrayers = prayerTimes.filter(p => p.active).length
  const totalPrayers = prayerTimes.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Heures de prières</h1>
            <p className="text-gray-600 mt-1">
              {paroisse} • Gestion des horaires de prières et prières
            </p>
          </div>
          <Button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter une heure
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total des heures</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPrayers}</p>
                </div>
                <Clock className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Heures actives</p>
                  <p className="text-2xl font-bold text-green-600">{activePrayers}</p>
                </div>
                <Bell className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Heures inactives</p>
                  <p className="text-2xl font-bold text-gray-500">{totalPrayers - activePrayers}</p>
                </div>
                <Settings className="w-8 h-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulaire d'ajout */}
        {isAdding && (
          <Card className="border-0 shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-500" />
                Ajouter une nouvelle heure de prière
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom de la prière *</Label>
                  <Input
                    id="name"
                    value={newPrayer.name || ""}
                    onChange={(e) => setNewPrayer({ ...newPrayer, name: e.target.value })}
                    placeholder="Ex: prière du matin"
                  />
                </div>
                <div>
                  <Label htmlFor="time">Heure *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newPrayer.time || ""}
                    onChange={(e) => setNewPrayer({ ...newPrayer, time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Jours de la semaine *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {daysOfWeek.map(day => (
                    <Button
                      key={day}
                      variant={newPrayer.days?.includes(day) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDay(day)}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description (optionnel)</Label>
                <Input
                  id="description"
                  value={newPrayer.description || ""}
                  onChange={(e) => setNewPrayer({ ...newPrayer, description: e.target.value })}
                  placeholder="Description de cette heure de prière"
                />
              </div>

              <div className="flex items-center gap-4">
                <Button onClick={handleAddPrayer} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAdding(false)
                    setNewPrayer({ name: "", time: "", days: [], active: true, description: "" })
                  }}
                >
                  <X className="w-4 h-4" />
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liste des heures de prières */}
        <div className="space-y-4">
          {prayerTimes.map((prayer) => (
            <Card key={prayer.id} className="border-0 shadow-lg">
              <CardContent className="p-6">
                {editingId === prayer.id ? (
                  <EditPrayerForm 
                    prayer={prayer}
                    onSave={(updated) => handleSaveEdit(prayer.id, updated)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{prayer.name}</h3>
                        <Badge variant={prayer.active ? "default" : "secondary"}>
                          {prayer.active ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {prayer.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {prayer.days.join(", ")}
                        </div>
                      </div>
                      {prayer.description && (
                        <p className="text-sm text-gray-500 mt-2">{prayer.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePrayerActive(prayer.id)}
                      >
                        {prayer.active ? "Désactiver" : "Activer"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPrayer(prayer.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePrayer(prayer.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {prayerTimes.length === 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune heure de prière configurée</h3>
              <p className="text-gray-600 mb-4">
                Commencez par ajouter les heures de prières et prières de votre paroisse.
              </p>
              <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Ajouter la première heure
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Composant pour l'édition d'une heure de prière
function EditPrayerForm({ 
  prayer, 
  onSave, 
  onCancel 
}: { 
  prayer: PrayerTime; 
  onSave: (updated: Partial<PrayerTime>) => void; 
  onCancel: () => void; 
}) {
  const [editedPrayer, setEditedPrayer] = useState<Partial<PrayerTime>>(prayer)
  const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]

  const toggleDay = (day: string) => {
    const currentDays = editedPrayer.days || []
    if (currentDays.includes(day)) {
      setEditedPrayer({ ...editedPrayer, days: currentDays.filter(d => d !== day) })
    } else {
      setEditedPrayer({ ...editedPrayer, days: [...currentDays, day] })
    }
  }

  const handleSave = () => {
    if (!editedPrayer.name || !editedPrayer.time || editedPrayer.days?.length === 0) {
      return
    }
    onSave(editedPrayer)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-name">Nom de la prière</Label>
          <Input
            id="edit-name"
            value={editedPrayer.name || ""}
            onChange={(e) => setEditedPrayer({ ...editedPrayer, name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="edit-time">Heure</Label>
          <Input
            id="edit-time"
            type="time"
            value={editedPrayer.time || ""}
            onChange={(e) => setEditedPrayer({ ...editedPrayer, time: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label>Jours de la semaine</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {daysOfWeek.map(day => (
            <Button
              key={day}
              variant={editedPrayer.days?.includes(day) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleDay(day)}
            >
              {day}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="edit-description">Description</Label>
        <Input
          id="edit-description"
          value={editedPrayer.description || ""}
          onChange={(e) => setEditedPrayer({ ...editedPrayer, description: e.target.value })}
        />
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Sauvegarder
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4" />
          Annuler
        </Button>
      </div>
    </div>
  )
}
