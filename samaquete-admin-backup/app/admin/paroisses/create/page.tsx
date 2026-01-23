"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Diocese, ParishService } from "@/lib/parish-service"
import { createParishAdmin } from "@/lib/admin-user-creation"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChangeEvent, useEffect, useState } from "react"
import { toast } from "sonner"

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
  const [form, setForm] = useState({
    name: "",
    dioceseId: "",
    city: "",
    email: "",
    phone: "",
    address: "",
  })
  const [dioceses, setDioceses] = useState<Diocese[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingDioceses, setLoadingDioceses] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  // Charger les diocèses depuis Firebase
  useEffect(() => {
    loadDioceses()
  }, [])

  const loadDioceses = async () => {
    try {
      setLoadingDioceses(true)
      const diocesesData = await ParishService.getDioceses()
      setDioceses(diocesesData)
      
      // Sélectionner le premier diocèse par défaut
      if (diocesesData.length > 0) {
        setForm(prev => ({ ...prev, dioceseId: diocesesData[0].id }))
      }
    } catch (error) {
      console.error("Erreur lors du chargement des diocèses:", error)
      toast.error("Erreur lors du chargement des diocèses")
    } finally {
      setLoadingDioceses(false)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validation
      if (!form.name || !form.dioceseId || !form.city) {
        setError("Veuillez remplir tous les champs obligatoires")
        return
      }

      // Trouver le diocèse sélectionné
      const selectedDiocese = dioceses.find(d => d.id === form.dioceseId)
      if (!selectedDiocese) {
        setError("Diocèse sélectionné invalide")
        return
      }

      // Créer la paroisse
      const parishData = {
        name: form.name,
        dioceseId: form.dioceseId,
        dioceseName: selectedDiocese.name,
        location: form.city,
        city: form.city,
        priest: "", // Champ requis mais vide
        contactInfo: {
          email: form.email || undefined,
          phone: form.phone || undefined,
          address: form.address || undefined
        },
        isActive: true
      }

      const parishId = await ParishService.createParish(parishData)
      
      if (parishId) {
        // Créer automatiquement un compte admin pour la paroisse
        const adminResult = await createParishAdmin(parishId, form.name, form.dioceseId)
        
        if (adminResult.success) {
          toast.success(`Paroisse créée avec succès ! Compte admin: ${adminResult.email} / Admin123`)
        } else {
          toast.success("Paroisse créée avec succès ! (Erreur lors de la création du compte admin)")
          console.error("Erreur création compte admin:", adminResult.error)
        }
        
        router.push("/admin/paroisses")
      } else {
        setError("Erreur lors de la création de la paroisse")
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
          <CardTitle className="text-2xl font-bold text-black mb-1">Créer une nouvelle paroisse</CardTitle>
          <p className="text-black/80 text-sm">Remplissez le formulaire pour ajouter une paroisse.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-black font-medium">Nom de la paroisse</label>
              <Input name="name" value={form.name} onChange={handleChange} required placeholder="Nom de la paroisse" className="bg-white/90 border-blue-200" />
            </div>
            <div className="space-y-2">
              <label className="block text-black font-medium">Diocèse *</label>
              {loadingDioceses ? (
                <div className="bg-white/90 border-blue-200 rounded px-3 py-2 w-full text-gray-600">
                  Chargement des diocèses...
                </div>
              ) : (
                <select 
                  name="dioceseId" 
                  value={form.dioceseId} 
                  onChange={handleChange} 
                  className="bg-white/90 border-blue-200 rounded px-3 py-2 w-full"
                  required
                >
                  <option value="">Sélectionner un diocèse</option>
                  {dioceses.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-black font-medium">Ville</label>
              <Input name="city" value={form.city} onChange={handleChange} required placeholder="Ville ou localité" className="bg-white/90 border-blue-200" />
            </div>
            
            <div className="space-y-2">
              <label className="block text-black font-medium">Email</label>
              <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email de contact (optionnel)" className="bg-white/90 border-blue-200" />
            </div>
            
            <div className="space-y-2">
              <label className="block text-black font-medium">Téléphone</label>
              <Input name="phone" value={form.phone} onChange={handleChange} placeholder="Téléphone de contact (optionnel)" className="bg-white/90 border-blue-200" />
            </div>
            
            <div className="space-y-2">
              <label className="block text-black font-medium">Adresse</label>
              <Input name="address" value={form.address} onChange={handleChange} placeholder="Adresse complète (optionnel)" className="bg-white/90 border-blue-200" />
            </div>
            
            {error && <div className="text-black text-sm text-center">{error}</div>}
            <Button type="submit" className="w-full h-12 text-lg bg-blue-900 hover:bg-blue-800 text-white rounded-xl" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Création...</> : "Créer la paroisse"}
            </Button>
            <div className="text-center mt-2">
              <Link href="/admin/paroisses" className="text-black hover:underline">Retour à la liste</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 