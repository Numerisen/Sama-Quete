"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function AdminDioceseLiturgyCreatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const diocese = searchParams.get('diocese') || 'Diocèse de Thiès'
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    type: "Messe",
    parish: "",
    date: new Date().toISOString().split('T')[0],
    time: "09:00",
    duration: "1h30",
    celebrant: "",
    description: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.title || !formData.parish || !formData.celebrant) {
      toast({
          title: "Erreur de validation",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive"
        })
      return
    }

    // Récupérer les célébrations existantes
    // Code localStorage supprimé - Migration vers Firestore
          const existingLiturgy = stored ? JSON.parse(stored) : []
    
    // Créer la nouvelle célébration
    const newLiturgy = {
      id: Date.now(),
      ...formData,
      diocese: diocese
    }
    
    // Ajouter à la liste
    const updatedLiturgy = [...existingLiturgy, newLiturgy]
    // localStorage supprimé - Migration vers Firestore
          
    toast({
          title: "Célébration créée",
          description: "La célébration a été créée avec succès"
        })
    router.push(`/admindiocese/liturgy?diocese=${encodeURIComponent(diocese)}`)
  }

  const types = ["Messe", "Adoration", "Vêpres", "Confession", "Baptême", "Mariage", "Autre"]

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Link href={`/admindiocese/liturgy?diocese=${encodeURIComponent(diocese)}`}>
              <Button variant="outline" size="sm" className="rounded-lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la liturgie
              </Button>
            </Link>
            <div>
              <CardTitle className="text-3xl font-bold text-black mb-1">
                Nouvelle célébration - {diocese}
              </CardTitle>
              <p className="text-black/80 text-sm">
                Créez une nouvelle célébration liturgique pour votre diocèse.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Titre de la célébration *
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Messe dominicale"
                  className="bg-white/90 border-blue-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Type de célébration
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-blue-200 bg-white/90 text-black px-3"
                >
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Paroisse *
                </label>
                <Input
                  name="parish"
                  value={formData.parish}
                  onChange={handleChange}
                  placeholder="Nom de la paroisse"
                  className="bg-white/90 border-blue-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Célébrant *
                </label>
                <Input
                  name="celebrant"
                  value={formData.celebrant}
                  onChange={handleChange}
                  placeholder="Nom du célébrant"
                  className="bg-white/90 border-blue-200"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Date
                </label>
                <Input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="bg-white/90 border-blue-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Heure
                </label>
                <Input
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="bg-white/90 border-blue-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Durée
                </label>
                <Input
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="Ex: 1h30"
                  className="bg-white/90 border-blue-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Description
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description de la célébration (optionnel)..."
                rows={4}
                className="bg-white/90 border-blue-200 resize-none"
              />
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Link href={`/admindiocese/liturgy?diocese=${encodeURIComponent(diocese)}`}>
                <Button variant="outline" className="rounded-lg">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" className="bg-blue-900 hover:bg-blue-800 text-white rounded-lg">
                <Save className="w-4 h-4 mr-2" />
                Créer la célébration
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
