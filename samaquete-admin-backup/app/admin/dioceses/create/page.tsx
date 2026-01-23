"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ParishService } from "@/lib/parish-service"
import { createDioceseAdmin } from "@/lib/admin-user-creation"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChangeEvent, useState } from "react"
import { toast } from "sonner"

const dioceseTypes = [
  "Diocèse",
  "Archevêché métropolitain",
  "Archidiocèse"
]

export default function CreateDiocesePage() {
  const [form, setForm] = useState({
    name: "",
    city: "",
    type: dioceseTypes[0],
    bishop: "",
    email: "",
    phone: "",
    address: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validation
      if (!form.name || !form.city || !form.bishop) {
        setError("Veuillez remplir tous les champs obligatoires")
        return
      }

      // Créer le diocèse
      const dioceseData = {
        name: form.name,
        location: form.city,
        city: form.city,
        type: form.type,
        bishop: form.bishop,
        contactInfo: {
          email: form.email || undefined,
          phone: form.phone || undefined,
          address: form.address || undefined
        },
        isActive: true
      }

      const dioceseId = await ParishService.createDiocese(dioceseData)
      
      if (dioceseId) {
        // Créer automatiquement un compte admin pour le diocèse
        const adminResult = await createDioceseAdmin(dioceseId, form.name)
        
        if (adminResult.success) {
          toast.success(`Diocèse créé avec succès ! Compte admin: ${adminResult.email} / Admin123`)
        } else {
          toast.success("Diocèse créé avec succès ! (Erreur lors de la création du compte admin)")
          console.error("Erreur création compte admin:", adminResult.error)
        }
        
        router.push("/admin/dioceses")
      } else {
        setError("Erreur lors de la création du diocèse")
      }
    } catch (error) {
      console.error("Erreur:", error)
      setError("Une erreur est survenue lors de la création")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <Card className="shadow-xl bg-white/80 border-0 rounded-2xl mt-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-black mb-1">Créer un nouveau diocèse</CardTitle>
          <p className="text-black/80 text-sm">Remplissez le formulaire pour ajouter un diocèse.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-black font-medium">Nom du diocèse *</label>
              <Input 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                required 
                placeholder="Ex: Diocèse de Thiès" 
                className="bg-white/90 border-blue-200" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-black font-medium">Ville principale *</label>
              <Input 
                name="city" 
                value={form.city} 
                onChange={handleChange} 
                required 
                placeholder="Ex: Thiès" 
                className="bg-white/90 border-blue-200" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-black font-medium">Type de juridiction *</label>
              <select 
                name="type" 
                value={form.type} 
                onChange={handleChange} 
                className="bg-white/90 border-blue-200 rounded px-3 py-2 w-full"
                required
              >
                {dioceseTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-black font-medium">Évêque *</label>
              <Input 
                name="bishop" 
                value={form.bishop} 
                onChange={handleChange} 
                required 
                placeholder="Ex: Mgr André Gueye" 
                className="bg-white/90 border-blue-200" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-black font-medium">Email de contact</label>
              <Input 
                name="email" 
                type="email" 
                value={form.email} 
                onChange={handleChange} 
                placeholder="contact@diocesethies.sn" 
                className="bg-white/90 border-blue-200" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-black font-medium">Téléphone de contact</label>
              <Input 
                name="phone" 
                value={form.phone} 
                onChange={handleChange} 
                placeholder="+221 33 951 12 34" 
                className="bg-white/90 border-blue-200" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-black font-medium">Adresse</label>
              <Input 
                name="address" 
                value={form.address} 
                onChange={handleChange} 
                placeholder="Adresse complète du diocèse" 
                className="bg-white/90 border-blue-200" 
              />
            </div>
            
            {error && <div className="text-black text-sm text-center">{error}</div>}
            
            <Button 
              type="submit" 
              className="w-full h-12 text-lg bg-blue-900 hover:bg-blue-800 text-white rounded-xl" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Création...
                </>
              ) : (
                "Créer le diocèse"
              )}
            </Button>
            
            <div className="text-center mt-2">
              <Link href="/admin/dioceses" className="text-black hover:underline">
                Retour à la liste
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}