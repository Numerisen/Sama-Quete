"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { auth } from "@/lib/firebase"
import { createUserWithRole } from "@/lib/user-service"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { Key, Loader2, Mail, ShieldCheck, UserCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

const roles = [
  { value: "super_admin", label: "Super Admin" },
  { value: "diocese_admin", label: "Admin Diocésain" },
  { value: "parish_admin", label: "Admin Paroissial" },
]

export default function CreateAdminUserPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "parish_admin" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // 1. Créer l'utilisateur dans Firebase Auth
      console.log("🔐 Création de l'utilisateur Firebase Auth...")
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      )
      
      console.log("✅ Utilisateur Firebase Auth créé:", userCredential.user.uid)

      // 2. Créer le profil Firestore avec rôle
      console.log("📝 Création du profil Firestore...")
      await createUserWithRole(
        userCredential.user.uid,
        form.email,
        form.name,
        form.role as 'super_admin' | 'diocese_admin' | 'parish_admin' | 'user'
      )
      
      console.log("✅ Profil Firestore créé avec succès")
      
      setSuccess(`✅ Utilisateur créé avec succès ! Email: ${form.email}`)
      
      // Rediriger vers la liste des utilisateurs après 2 secondes
      setTimeout(() => {
        router.push("/admin/users")
      }, 2000)

    } catch (error: any) {
      console.error("❌ Erreur lors de la création:", error)
      
      // Gestion des erreurs spécifiques
      if (error.code === 'auth/email-already-in-use') {
        setError("❌ Un utilisateur avec cet email existe déjà.")
      } else if (error.code === 'auth/weak-password') {
        setError("❌ Le mot de passe doit contenir au moins 6 caractères.")
      } else if (error.code === 'auth/invalid-email') {
        setError("❌ Format d'email invalide.")
      } else {
        setError(`❌ Erreur lors de la création: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <Card className="shadow-xl bg-white/80 border-0 rounded-2xl mt-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-900 mb-1">Créer un nouvel utilisateur admin</CardTitle>
          <p className="text-blue-800/80 text-sm">Remplissez le formulaire pour ajouter un administrateur.</p>
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
              <label className="block text-blue-900 font-medium">Mot de passe</label>
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-400" />
                <Input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Mot de passe" className="bg-white/90 border-gray-200" />
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
            
            {/* Messages d'erreur et de succès */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}
            
            <Button type="submit" className="w-full h-12 text-lg bg-blue-900 hover:bg-blue-800 text-white rounded-xl" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                  Création en cours...
                </>
              ) : (
                "Créer l'utilisateur"
              )}
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
