"use client"
import { useState, ChangeEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
    diocese: diocesesList[0],
    city: "",
    cure: "",
    vicaire: "",
    catechists: "",
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
    setTimeout(() => {
      const stored = localStorage.getItem("admin_parishes")
      let parishes = stored ? JSON.parse(stored) : []
      const newParish = {
        id: Date.now(),
        ...form,
      }
      parishes.unshift(newParish)
      localStorage.setItem("admin_parishes", JSON.stringify(parishes))
      setLoading(false)
      router.push("/admin/paroisses")
    }, 800)
  }

  return (
    <div className="max-w-xl mx-auto">
      <Card className="shadow-xl bg-white/80 border-0 rounded-2xl mt-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-900 mb-1">Créer une nouvelle paroisse</CardTitle>
          <p className="text-blue-800/80 text-sm">Remplissez le formulaire pour ajouter une paroisse.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-blue-900 font-medium">Nom de la paroisse</label>
              <Input name="name" value={form.name} onChange={handleChange} required placeholder="Nom de la paroisse" className="bg-white/90 border-gray-200" />
            </div>
            <div className="space-y-2">
              <label className="block text-blue-900 font-medium">Diocèse</label>
              <select name="diocese" value={form.diocese} onChange={handleChange} className="bg-white/90 border-gray-200 rounded px-3 py-2 w-full">
                {diocesesList.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-blue-900 font-medium">Ville</label>
              <Input name="city" value={form.city} onChange={handleChange} required placeholder="Ville ou localité" className="bg-white/90 border-gray-200" />
            </div>
            <div className="space-y-2">
              <label className="block text-blue-900 font-medium">Curé</label>
              <Input name="cure" value={form.cure} onChange={handleChange} required placeholder="Nom du curé" className="bg-white/90 border-gray-200" />
            </div>
            <div className="space-y-2">
              <label className="block text-blue-900 font-medium">Vicaire</label>
              <Input name="vicaire" value={form.vicaire} onChange={handleChange} placeholder="Nom du vicaire (optionnel)" className="bg-white/90 border-gray-200" />
            </div>
            <div className="space-y-2">
              <label className="block text-blue-900 font-medium">Catéchistes</label>
              <Input name="catechists" value={form.catechists} onChange={handleChange} placeholder="Liste des catéchistes (optionnel)" className="bg-white/90 border-gray-200" />
            </div>
            
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <Button type="submit" className="w-full h-12 text-lg bg-blue-900 hover:bg-blue-800 text-white rounded-xl" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Création...</> : "Créer la paroisse"}
            </Button>
            <div className="text-center mt-2">
              <Link href="/admin/paroisses" className="text-blue-700 hover:underline">Retour à la liste</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 