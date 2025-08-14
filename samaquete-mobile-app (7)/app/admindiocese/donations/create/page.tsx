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
import { useToastContext } from "@/components/toast-provider"

export default function AdminDioceseDonationsCreatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const diocese = searchParams.get('diocese') || 'Diocèse de Thiès'
  const toast = useToastContext()

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
      toast.error("Erreur de validation", "Veuillez remplir tous les champs obligatoires")
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Erreur de validation", "Le montant doit être un nombre positif")
      return
    }

    // Récupérer les donations existantes
    const stored = localStorage.getItem("admin_donations")
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
    localStorage.setItem("admin_donations", JSON.stringify(updatedDonations))
    
    toast.success("Donation créée", "La donation a été créée avec succès")
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
              <CardTitle className="text-3xl font-bold text-blue-900 mb-1">
                Nouvelle donation - {diocese}
              </CardTitle>
              <p className="text-blue-800/80 text-sm">
                Enregistrez une nouvelle donation pour votre diocèse.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Nom du donateur *
                </label>
                <Input
                  name="donorName"
                  value={formData.donorName}
                  onChange={handleChange}
                  placeholder="Nom complet du donateur"
                  className="bg-white/90 border-gray-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Montant (FCFA) *
                </label>
                <Input
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Montant en FCFA"
                  className="bg-white/90 border-gray-200"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Type de donation
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-gray-200 bg-white/90 text-blue-900 px-3"
                >
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Paroisse *
                </label>
                <Input
                  name="parish"
                  value={formData.parish}
                  onChange={handleChange}
                  placeholder="Nom de la paroisse"
                  className="bg-white/90 border-gray-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Statut
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-gray-200 bg-white/90 text-blue-900 px-3"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Date de donation
              </label>
              <Input
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className="bg-white/90 border-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Description
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description de la donation (optionnel)..."
                rows={4}
                className="bg-white/90 border-gray-200 resize-none"
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
