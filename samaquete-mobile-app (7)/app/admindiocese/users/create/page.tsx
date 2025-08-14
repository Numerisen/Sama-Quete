"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { useToastContext } from "@/components/toast-provider"

export default function AdminDioceseUsersCreatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const diocese = searchParams.get('diocese') || 'Diocèse de Thiès'
  const toast = useToastContext()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Catéchiste",
    parish: "",
    status: "Actif"
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.email || !formData.parish) {
      toast.error("Erreur de validation", "Veuillez remplir tous les champs obligatoires")
      return
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Erreur de validation", "Veuillez entrer une adresse email valide")
      return
    }

    // Récupérer les utilisateurs existants
    const stored = localStorage.getItem("admin_users")
    const existingUsers = stored ? JSON.parse(stored) : []
    
    // Vérifier si l'email existe déjà
    const emailExists = existingUsers.some((user: any) => user.email === formData.email)
    if (emailExists) {
      toast.error("Erreur de validation", "Cette adresse email est déjà utilisée")
      return
    }
    
    // Créer le nouvel utilisateur
    const newUser = {
      id: Date.now(),
      ...formData,
      diocese: diocese
    }
    
    // Ajouter à la liste
    const updatedUsers = [...existingUsers, newUser]
    localStorage.setItem("admin_users", JSON.stringify(updatedUsers))
    
    toast.success("Utilisateur créé", "L'utilisateur a été créé avec succès")
    router.push(`/admindiocese/users?diocese=${encodeURIComponent(diocese)}`)
  }

  const roles = ["Curé", "Vicaire", "Catéchiste", "Administrateur", "Secrétaire"]
  const statuses = ["Actif", "Inactif"]

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Link href={`/admindiocese/users?diocese=${encodeURIComponent(diocese)}`}>
              <Button variant="outline" size="sm" className="rounded-lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux utilisateurs
              </Button>
            </Link>
            <div>
              <CardTitle className="text-3xl font-bold text-blue-900 mb-1">
                Nouvel utilisateur - {diocese}
              </CardTitle>
              <p className="text-blue-800/80 text-sm">
                Créez un nouvel utilisateur pour votre diocèse.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Nom complet *
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nom et prénom"
                  className="bg-white/90 border-gray-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Email *
                </label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="bg-white/90 border-gray-200"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Téléphone
                </label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+221 33 123 45 67"
                  className="bg-white/90 border-gray-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Rôle
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-gray-200 bg-white/90 text-blue-900 px-3"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
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

            <div className="flex justify-end gap-4 pt-6">
              <Link href={`/admindiocese/users?diocese=${encodeURIComponent(diocese)}`}>
                <Button variant="outline" className="rounded-lg">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" className="bg-blue-900 hover:bg-blue-800 text-white rounded-lg">
                <Save className="w-4 h-4 mr-2" />
                Créer l'utilisateur
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
