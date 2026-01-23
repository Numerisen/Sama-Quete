"use client"
import { useState, ChangeEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Image as ImageIcon, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

const categories = [
  { value: "Événement", label: "Événement" },
  { value: "Solidarité", label: "Solidarité" },
  { value: "Formation", label: "Formation" },
  { value: "Groupe", label: "Groupe" },
  { value: "Information", label: "Information" },
]
const priorities = [
  { value: "high", label: "Haute" },
  { value: "medium", label: "Moyenne" },
  { value: "low", label: "Basse" },
]

export default function CreateAdminNewsPage() {
  // ✅ Super admin: lecture seule sur Actualités (pas de CRUD)
  const { isAdmin } = useAuth()
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    date: "",
    time: "",
    location: "",
    category: "Événement",
    priority: "medium",
    image: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (isAdmin) {
      router.replace("/admin/news")
    }
  }, [isAdmin, router])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setForm(f => ({ ...f, image: reader.result as string }))
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setTimeout(() => {
      // Code localStorage supprimé - Migration vers Firestore
      const newNews = {
        id: Date.now(),
        ...form
      }
      // TODO: Implémenter la création avec Firestore
      console.log('Nouvelle actualité:', newNews)
      setLoading(false)
      router.push("/admin/news")
    }, 800)
  }

  return (
    <div className="max-w-xl mx-auto">
      <Card className="shadow-xl bg-white/80 border-0 rounded-2xl mt-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-black mb-1">Créer une nouvelle actualité</CardTitle>
          <p className="text-black/80 text-sm">Remplissez le formulaire pour publier une actualité paroissiale.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-black font-medium">Titre</label>
              <Input name="title" value={form.title} onChange={handleChange} required placeholder="Titre de l'actualité" className="bg-white/90 border-blue-200" />
            </div>
            <div className="space-y-2">
              <label className="block text-black font-medium">Extrait</label>
              <Textarea name="excerpt" value={form.excerpt} onChange={handleChange} required placeholder="Résumé ou introduction..." className="bg-white/90 border-blue-200" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <label className="block text-black font-medium">Date</label>
                <Input name="date" value={form.date} onChange={handleChange} required placeholder="ex: 25 Janvier 2024" className="bg-white/90 border-blue-200" />
              </div>
              <div className="flex-1 space-y-2">
                <label className="block text-black font-medium">Heure</label>
                <Input name="time" value={form.time} onChange={handleChange} required placeholder="ex: 14:00" className="bg-white/90 border-blue-200" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-black font-medium">Lieu</label>
              <Input name="location" value={form.location} onChange={handleChange} required placeholder="Lieu de l'événement" className="bg-white/90 border-blue-200" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <label className="block text-black font-medium">Catégorie</label>
                <select name="category" value={form.category} onChange={handleChange} className="bg-white/90 border-blue-200 rounded px-3 py-2 w-full">
                  {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="flex-1 space-y-2">
                <label className="block text-black font-medium">Priorité</label>
                <select name="priority" value={form.priority} onChange={handleChange} className="bg-white/90 border-blue-200 rounded px-3 py-2 w-full">
                  {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-black font-medium">Image</label>
              <div className="flex items-center gap-3">
                <input type="file" accept="image/*" onChange={handleImageChange} className="block" />
                {imagePreview ? (
                  <img src={imagePreview} alt="aperçu" className="w-16 h-16 object-cover rounded-xl border-2 border-blue-200 shadow" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-gray-600" />
                )}
              </div>
            </div>
            {error && <div className="text-black text-sm text-center">{error}</div>}
            <Button type="submit" className="w-full h-12 text-lg bg-blue-700 hover:bg-blue-800 text-white rounded-xl" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Publication...</> : "Publier l'actualité"}
            </Button>
            <div className="text-center mt-2">
              <Link href="/admin/news" className="text-black hover:underline">Retour à la liste</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 