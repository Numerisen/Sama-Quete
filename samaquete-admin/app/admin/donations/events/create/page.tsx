"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { DonationEvent, DonationService } from "@/lib/donation-service"
import { Church, Loader2, Target } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function CreateDonationEventPage() {
  const router = useRouter()
  const { userRole } = useAuth()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "messe" as DonationEvent['type'],
    parishId: "",
    targetAmount: "",
    startDate: "",
    endDate: "",
    isActive: true
  })

  const parishes = [
    { id: "parish1", name: "Paroisse Saint-Joseph de Medina" },
    { id: "parish2", name: "Paroisse Sainte-Anne de Thiès" },
    { id: "parish3", name: "Paroisse Sacré-Cœur de Kaolack" },
    { id: "parish4", name: "Paroisse Notre-Dame de Dakar" },
    { id: "parish5", name: "Paroisse Saint-Pierre de Ziguinchor" }
  ]

  const eventTypes = [
    { value: "messe", label: "Messe d'intention", icon: "⛪" },
    { value: "quete", label: "Quête dominicale", icon: "💰" },
    { value: "evenement", label: "Événement spécial", icon: "🎉" },
    { value: "collecte", label: "Collecte de fonds", icon: "🎯" }
  ]

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validation
      if (!formData.title || !formData.description || !formData.parishId) {
        toast.error("Veuillez remplir tous les champs obligatoires")
        return
      }

      if (!formData.startDate || !formData.endDate) {
        toast.error("Veuillez sélectionner les dates de début et de fin")
        return
      }

      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      
      if (startDate >= endDate) {
        toast.error("La date de fin doit être postérieure à la date de début")
        return
      }

      // Créer l'événement
      const eventData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        parishId: formData.parishId,
        targetAmount: formData.targetAmount ? parseFloat(formData.targetAmount) : undefined,
        startDate: startDate,
        endDate: endDate,
        isActive: formData.isActive,
        createdBy: userRole?.uid || "unknown"
      }

      const eventId = await DonationService.createDonationEvent(eventData)
      
      if (eventId) {
        toast.success("Événement créé avec succès !")
        router.push("/admin/donations/events")
      } else {
        toast.error("Erreur lors de la création de l'événement")
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-black mb-2 flex items-center gap-3">
            <Target className="w-8 h-8" />
            Créer un événement de don
          </CardTitle>
          <p className="text-black/80">
            Créez un événement pour collecter des dons (messe, quête, événement spécial...)
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titre et Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-black font-semibold">
                  Titre de l'événement *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Ex: Messe d'intention pour..."
                  className="border-blue-200 focus:border-green-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type" className="text-black font-semibold">
                  Type d'événement *
                </Label>
                <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                  <SelectTrigger className="border-blue-200 focus:border-green-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          {type.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-black font-semibold">
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Décrivez l'événement, son objectif, les bénéficiaires..."
                rows={4}
                className="border-blue-200 focus:border-green-500"
              />
            </div>

            {/* Paroisse et Montant cible */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="parish" className="text-black font-semibold">
                  Paroisse *
                </Label>
                <Select value={formData.parishId} onValueChange={(value) => handleChange("parishId", value)}>
                  <SelectTrigger className="border-blue-200 focus:border-green-500">
                    <SelectValue placeholder="Sélectionner une paroisse" />
                  </SelectTrigger>
                  <SelectContent>
                    {parishes.map(parish => (
                      <SelectItem key={parish.id} value={parish.id}>
                        <span className="flex items-center gap-2">
                          <Church className="w-4 h-4" />
                          {parish.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetAmount" className="text-black font-semibold">
                  Montant cible (FCFA)
                </Label>
                <Input
                  id="targetAmount"
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => handleChange("targetAmount", e.target.value)}
                  placeholder="Ex: 500000 (optionnel)"
                  className="border-blue-200 focus:border-green-500"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-black font-semibold">
                  Date de début *
                </Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="border-blue-200 focus:border-green-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-black font-semibold">
                  Date de fin *
                </Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  className="border-blue-200 focus:border-green-500"
                />
              </div>
            </div>

            {/* Statut actif */}
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange("isActive", checked)}
              />
              <Label htmlFor="isActive" className="text-black font-semibold">
                Événement actif (visible pour les fidèles)
              </Label>
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-700 hover:bg-blue-800 text-white shadow-lg rounded-xl px-6 py-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5 mr-2" />
                    Créer l'événement
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="px-6 py-3 border-blue-200 text-black hover:bg-blue-50 rounded-xl"
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}