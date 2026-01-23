"use client"
import { useState, useEffect, ChangeEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, UserCircle, Download } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { UserService, UserItem } from "@/lib/firestore-services"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  avatar: string
}

const roles = [
  { value: "all", label: "Tous les rôles" },
  { value: "super_admin", label: "Super Admin" },
  { value: "admin_diocesan", label: "Admin Diocésain" },
  { value: "admin_parishial", label: "Admin Paroissial" },
]
const statuts = [
  { value: "all", label: "Tous les statuts" },
  { value: "actif", label: "Actif" },
  { value: "inactif", label: "Inactif" },
]

// Données initiales supprimées - Utilisation uniquement des données Firestore

function exportToCSV(users: User[]) {
  const header = ["Nom", "Email", "Rôle", "Statut"]
  const rows = users.map((u: User) => [u.name, u.email, roles.find(r => r.value === u.role)?.label, u.status])
  const csvContent = [header, ...rows].map(e => e.join(",")).join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", "utilisateurs_admin.csv")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ name: string; email: string; role: string; status: string }>({ name: "", email: "", role: "admin_parishial", status: "Actif" })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Charger les utilisateurs depuis Firestore
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)
        const firestoreUsers = await UserService.getAll()
        
        // Utiliser uniquement les données Firestore, pas de données fictives
        const convertedUsers = firestoreUsers.map(user => ({
          id: user.id!,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          avatar: "/placeholder-user.jpg"
        }))
        setUsers(convertedUsers)
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les utilisateurs",
          variant: "destructive"
        })
        setUsers([]) // Aucune donnée en cas d'erreur
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [toast])

  // S'abonner aux changements en temps réel
  useEffect(() => {
    const unsubscribe = UserService.subscribeToUsers((firestoreUsers) => {
      const convertedUsers = firestoreUsers.map(user => ({
        id: user.id!,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: "/placeholder-user.jpg"
      }))
      setUsers(convertedUsers)
    })

    return () => unsubscribe()
  }, [])

  // Filtres combinés
  const filteredUsers = users.filter((u: User) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === "all" || u.role === roleFilter
    const matchStatus = statusFilter === "all" || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  // Suppression
  const handleDelete = async (id: string) => {
    if (window.confirm("Confirmer la suppression de cet utilisateur ?")) {
      try {
        await UserService.delete(id)
        toast({
          title: "Succès",
          description: "Utilisateur supprimé avec succès",
        })
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'utilisateur",
          variant: "destructive"
        })
      }
    }
  }

  // Edition inline
  const handleEdit = (user: User) => {
    setEditId(user.id)
    setEditForm({ name: user.name, email: user.email, role: user.role, status: user.status })
  }
  
  const handleEditChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }
  
  const handleEditSave = async (id: string) => {
    try {
      await UserService.update(id, {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role as any,
        status: editForm.status as any
      })
      setEditId(null)
      toast({
        title: "Succès",
        description: "Utilisateur modifié avec succès",
      })
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'utilisateur",
        variant: "destructive"
      })
    }
  }
  
  const handleEditCancel = () => {
    setEditId(null)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="mb-8 shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-black mb-1">Gestion des utilisateurs admin</CardTitle>
            <p className="text-black/80 text-sm">Créez, modifiez et supprimez les comptes administrateurs de l'Église numérique.</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 w-40 bg-white/90 border-blue-200"
            />
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="h-10 rounded px-2 border-blue-200 bg-white/90 text-black">
              {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 rounded px-2 border-blue-200 bg-white/90 text-black">
              {statuts.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <Button onClick={() => exportToCSV(filteredUsers)} variant="outline" className="flex items-center gap-2 text-black border-blue-200 bg-white/90 hover:bg-blue-50 rounded-xl px-3 py-2">
              <Download className="w-5 h-5" /> Export CSV
            </Button>
            <Link href="/admin/users/create">
              <Button className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white shadow-lg rounded-xl px-4 py-2">
                <Plus className="w-5 h-5" /> Nouvel utilisateur
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-black">Chargement des utilisateurs...</div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCircle className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
              <p className="text-gray-600 mb-6">
                Aucun utilisateur n'est enregistré dans Firestore pour le moment.
              </p>
              <Link href="/admin/users/create">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Créer le premier utilisateur
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="text-black/80 text-sm bg-blue-50">
                    <th className="py-3 px-4 text-black">Avatar</th>
                    <th className="py-3 px-4 text-black">Nom</th>
                    <th className="py-3 px-4 text-black">Email</th>
                    <th className="py-3 px-4 text-black">Rôle</th>
                    <th className="py-3 px-4 text-black">Statut</th>
                    <th className="py-3 px-4 text-right text-black">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user: User, i: number) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="border-b last:border-0 hover:bg-blue-50/40"
                  >
                    <td className="py-2 px-4">
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border-2 border-blue-200 shadow" />
                    </td>
                    {editId === user.id ? (
                      <>
                        <td className="py-2 px-4 font-semibold text-black">
                          <Input name="name" value={editForm.name} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4 text-black">
                          <Input name="email" value={editForm.email} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <select name="role" value={editForm.role} onChange={handleEditChange} className="h-8 rounded px-2 border-blue-200 bg-white/90 text-black">
                            {roles.filter(r => r.value !== "all").map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <select name="status" value={editForm.status} onChange={handleEditChange} className="h-8 rounded px-2 border-blue-200 bg-white/90 text-black">
                            {statuts.filter(s => s.value !== "all").map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                        </td>
                        <td className="py-2 px-4 text-right flex gap-2 justify-end">
                          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => handleEditSave(user.id)}>Enregistrer</Button>
                          <Button size="sm" variant="ghost" className="rounded-lg" onClick={handleEditCancel}>Annuler</Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-4 font-semibold text-black">{user.name}</td>
                        <td className="py-2 px-4 text-black">{user.email}</td>
                        <td className="py-2 px-4 capitalize">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === "super_admin" ? "bg-blue-100 text-black" : user.role === "admin_diocesan" ? "bg-blue-100 text-black" : "bg-blue-100 text-black"}`}>{roles.find(r => r.value === user.role)?.label}</span>
                        </td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${user.status === "actif" ? "bg-blue-100 text-black" : "bg-blue-200 text-black"}`}>{user.status}</span>
                        </td>
                        <td className="py-2 px-4 text-right flex gap-2 justify-end">
                          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => handleEdit(user)}><Edit className="w-4 h-4" /></Button>
                          <Button size="sm" variant="destructive" className="rounded-lg" onClick={() => handleDelete(user.id)}><Trash2 className="w-4 h-4" /></Button>
                        </td>
                      </>
                    )}
                  </motion.tr>
                ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center text-black/60 py-8">Aucun utilisateur trouvé.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
