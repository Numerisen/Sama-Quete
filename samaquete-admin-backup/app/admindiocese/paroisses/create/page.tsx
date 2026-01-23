"use client"
export const dynamic = "force-dynamic"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Church } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

const diocesesList = [
  "Archidiocèse de Dakar",
  "Diocèse de Thiès",
  "Diocèse de Kaolack",
  "Diocèse de Ziguinchor",
  "Diocèse de Kolda",
  "Diocèse de Tambacounda",
  "Diocèse de Saint-Louis du Sénégal",
]

export default function CreateParishPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const diocese = searchParams.get('diocese') || 'Archidiocèse de Dakar'
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    name: "",
    diocese: diocese,
    city: "",
    cure: "",
    vicaire: "",
    catechists: "",
    address: "",
    phone: "",
    email: "",
    description: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation basique
    if (!formData.name || !formData.city) {
      toast({
          title: "Erreur de validation",
          description: "Veuillez remplir au moins le nom et la ville de la paroisse",
          variant: "destructive"
        })
      return
    }

    // Code localStorage supprimé - Migration vers Firestore
    // TODO: Implémenter avec Firestore
    const existingParishes: any[] = []
    
    // Créer la nouvelle paroisse
    const newParish = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString()
    }
    
    // Ajouter à la liste
    const updatedParishes = [...existingParishes, newParish]
    // localStorage supprimé - Migration vers Firestore
          
    toast({
          title: "Paroisse créée",
          description: "La paroisse a été créée avec succès !"
        })
    router.push(`/admindiocese/paroisses?diocese=${encodeURIComponent(diocese)}`)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Link 
          href={`/admindiocese/paroisses?diocese=${encodeURIComponent(diocese)}`}
          className="inline-flex items-center gap-2 text-black hover:text-black mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux paroisses
        </Link>
        <h1 className="text-3xl font-bold text-black mb-2">
          Nouvelle paroisse - {diocese}
        </h1>
        <p className="text-black/80">
          Créez une nouvelle paroisse dans votre diocèse
        </p>
      </motion.div>

      <Card className="shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <Church className="w-5 h-5" />
            Informations de la paroisse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nom de la paroisse */}
              <div className="md:col-span-2">
                <Label htmlFor="name" className="text-black font-medium">
                  Nom de la paroisse *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Paroisse Saint-Joseph de Medina"
                  className="mt-1"
                  required
                />
              </div>

              {/* Diocèse */}
              <div>
                <Label htmlFor="diocese" className="text-black font-medium">
                  Diocèse
                </Label>
                <select
                  id="diocese"
                  name="diocese"
                  value={formData.diocese}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 bg-white"
                  disabled
                >
                  {diocesesList.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Ville */}
              <div>
                <Label htmlFor="city" className="text-black font-medium">
                  Ville *
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Ex: Dakar"
                  className="mt-1"
                  required
                />
              </div>

              {/* Curé */}
              <div>
                <Label htmlFor="cure" className="text-black font-medium">
                  Curé
                </Label>
                <Input
                  id="cure"
                  name="cure"
                  value={formData.cure}
                  onChange={handleChange}
                  placeholder="Ex: Père Jean Sarr"
                  className="mt-1"
                />
              </div>

              {/* Vicaire */}
              <div>
                <Label htmlFor="vicaire" className="text-black font-medium">
                  Vicaire
                </Label>
                <Input
                  id="vicaire"
                  name="vicaire"
                  value={formData.vicaire}
                  onChange={handleChange}
                  placeholder="Ex: Père Paul Diouf"
                  className="mt-1"
                />
              </div>

              {/* Catéchistes */}
              <div className="md:col-span-2">
                <Label htmlFor="catechists" className="text-black font-medium">
                  Catéchistes
                </Label>
                <Input
                  id="catechists"
                  name="catechists"
                  value={formData.catechists}
                  onChange={handleChange}
                  placeholder="Ex: Sœur Marie, M. Ndiaye"
                  className="mt-1"
                />
              </div>

              {/* Adresse */}
              <div className="md:col-span-2">
                <Label htmlFor="address" className="text-black font-medium">
                  Adresse
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Adresse complète de la paroisse"
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* Téléphone */}
              <div>
                <Label htmlFor="phone" className="text-black font-medium">
                  Téléphone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Ex: +221 33 123 45 67"
                  className="mt-1"
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-black font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Ex: paroisse@example.com"
                  className="mt-1"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <Label htmlFor="description" className="text-black font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description de la paroisse, horaires des prières, etc."
                  className="mt-1"
                  rows={4}
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-4 pt-6 border-t border-blue-200">
              <Link href={`/admindiocese/paroisses?diocese=${encodeURIComponent(diocese)}`}>
                <Button type="button" variant="outline" className="rounded-lg">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" className="bg-blue-900 hover:bg-blue-800 rounded-lg">
                <Save className="w-4 h-4 mr-2" />
                Créer la paroisse
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
