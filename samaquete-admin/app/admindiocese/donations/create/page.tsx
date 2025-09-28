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

export default function AdminDioceseDonationsCreatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const diocese = searchParams.get('diocese') || 'Diocèse de Thiès'
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    donorName: "",
    amount: "",
    type: "Offrande",
    parish: "",
    date: new Date().toISOString().split('T')[0],
    status: "En attente",
    description: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.donorName || !formData.amount || !formData.parish) {
      toast({
          title: "Erreur de validation",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive"
        })
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      toast({
          title: "Erreur de validation",
          description: "Le montant doit être un nombre positif",
          variant: "destructive"
        })
      return
    }

    // Récupérer les donations existantes
    // Code localStorage supprimé - Migration vers Firestore
          const existingDonations = stored ? JSON.parse(stored) : []
    
    // Créer la nouvelle donation
    const newDonation = {
      id: Date.now(),
      ...formData,
      amount: amount,
      diocese: diocese
    }
    
    // Ajouter à la liste
    const updatedDonations = [...existingDonations, newDonation]
    // localStorage supprimé - Migration vers Firestore
          
    toast({
          title: "Donation créée",
          description: "La donation a été créée avec succès"
        })
    router.push(`/admindiocese/donations?diocese=${encodeURIComponent(diocese)}`)
  }

  const types = ["Offrande", "Dîme", "Don", "Collecte", "Autre"]
  const statuses = ["En attente", "Reçu", "Annulé"]

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Link href={`/admindiocese/donations?diocese=${encodeURIComponent(diocese)}`}>
              <Button variant="outline" size="sm" className="rounded-lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux donations
              </Button>
            </Link>
            <div>
              <CardTitle className="text-3xl font-bold text-black mb-1">
                Nouvelle donation - {diocese}
              </CardTitle>
              <p className="text-black/80 text-sm">
                Enregistrez une nouvelle donation pour votre diocèse.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Nom du donateur *
                </label>
                <Input
                  name="donorName"
                  value={formData.donorName}
                  onChange={handleChange}
                  placeholder="Nom complet du donateur"
                  className="bg-white/90 border-blue-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Montant (FCFA) *
                </label>
                <Input
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Montant en FCFA"
                  className="bg-white/90 border-blue-200"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Type de donation
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
                  Statut
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-blue-200 bg-white/90 text-black px-3"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Date de donation
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
                Description
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description de la donation (optionnel)..."
                rows={4}
                className="bg-white/90 border-blue-200 resize-none"
              />
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Link href={`/admindiocese/donations?diocese=${encodeURIComponent(diocese)}`}>
                <Button variant="outline" className="rounded-lg">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" className="bg-blue-900 hover:bg-blue-800 text-white rounded-lg">
                <Save className="w-4 h-4 mr-2" />
                Créer la donation
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
