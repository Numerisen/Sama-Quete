"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserCircle, Mail, Key, ShieldCheck, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"

const roles = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin_diocesan", label: "Admin Diocésain" },
  { value: "admin_parishial", label: "Admin Paroissial" },
]

// Pour la démo, on simule un utilisateur à éditer
const mockUser = {
  id: 2,
  name: "Père Martin Sarr",
  email: "martin.sarr@diocese.sn",
  role: "admin_diocesan",
  password: "",
}

export default function EditAdminUserPage() {
  const [form, setForm] = useState(mockUser)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const params = useParams()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    // Simule la modification (à remplacer par un appel API)
    setTimeout(() => {
      setLoading(false)
      router.push("/admin/users")
    }, 1200)
  }

  return (
    <div className="max-w-xl mx-auto">
      <Card className="shadow-xl bg-white/80 border-0 rounded-2xl mt-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-900 mb-1">Modifier l'utilisateur admin</CardTitle>
          <p className="text-blue-800/80 text-sm">Modifiez les informations de l'administrateur.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-blue-900 font-medium">Nom complet</label>
              <div className="flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-blue-400" />
                <Input name="name" value={form.name} onChange={handleChange} required placeholder="Nom complet" className="bg-white/90 border-gray-200" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-blue-900 font-medium">Email</label>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                <Input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Email" className="bg-white/90 border-gray-200" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-blue-900 font-medium">Mot de passe (laisser vide pour ne pas changer)</label>
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-400" />
                <Input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Nouveau mot de passe" className="bg-white/90 border-gray-200" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-blue-900 font-medium">Rôle</label>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <select name="role" value={form.role} onChange={handleChange} className="bg-white/90 border-gray-200 rounded px-3 py-2">
                  {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <Button type="submit" className="w-full h-12 text-lg bg-blue-900 hover:bg-blue-800 text-white rounded-xl" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Modification...</> : "Enregistrer les modifications"}
            </Button>
            <div className="text-center mt-2">
              <Link href="/admin/users" className="text-blue-700 hover:underline">Retour à la liste</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
