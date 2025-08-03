"use client"
import { useState, useEffect, ChangeEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, UserCircle, Download } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

interface User {
  id: number
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

const initialUsers: User[] = [
  { id: 1, name: "Mgr Jean Ndiaye", email: "jean.ndiaye@ces.sn", role: "super_admin", status: "actif", avatar: "/placeholder-user.jpg" },
  { id: 2, name: "Père Martin Sarr", email: "martin.sarr@diocese.sn", role: "admin_diocesan", status: "actif", avatar: "/placeholder-user.jpg" },
  { id: 3, name: "Sœur Marie Diop", email: "marie.diop@paroisse.sn", role: "admin_parishial", status: "inactif", avatar: "/placeholder-user.jpg" },
]

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
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<{ name: string; email: string; role: string; status: string }>({ name: "", email: "", role: "admin_parishial", status: "actif" })
  const router = useRouter()

  // Initialisation depuis localStorage
  useEffect(() => {
    const loadUsers = () => {
      const stored = localStorage.getItem("admin_users")
      if (stored) {
        setUsers(JSON.parse(stored))
      } else {
        setUsers(initialUsers)
        localStorage.setItem("admin_users", JSON.stringify(initialUsers))
      }
    }
    loadUsers()
    // Recharger à chaque fois que l'onglet devient actif
    const onVisibility = () => {
      if (document.visibilityState === "visible") loadUsers()
    }
    // Recharger à chaque navigation (retour arrière, etc.)
    const onPopState = () => loadUsers()
    // Recharger à chaque focus (changement d'onglet)
    const onFocus = () => loadUsers()
    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("popstate", onPopState)
    window.addEventListener("focus", onFocus)
    return () => {
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("popstate", onPopState)
      window.removeEventListener("focus", onFocus)
    }
  }, [])

  // Sauvegarde à chaque modification
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem("admin_users", JSON.stringify(users))
    }
  }, [users])

  // Filtres combinés
  const filteredUsers = users.filter((u: User) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === "all" || u.role === roleFilter
    const matchStatus = statusFilter === "all" || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  // Suppression
  const handleDelete = (id: number) => {
    if (window.confirm("Confirmer la suppression de cet utilisateur ?")) {
      setUsers(users.filter((u: User) => u.id !== id))
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
  const handleEditSave = (id: number) => {
    setUsers(users.map((u: User) => u.id === id ? { ...u, ...editForm } : u))
    setEditId(null)
  }
  const handleEditCancel = () => {
    setEditId(null)
  }

  useEffect(() => {
    const stored = localStorage.getItem("admin_users")
    if (stored) {
      setUsers(JSON.parse(stored))
    }
  }, [search, roleFilter, statusFilter])

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="mb-8 shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-blue-900 mb-1">Gestion des utilisateurs admin</CardTitle>
            <p className="text-blue-800/80 text-sm">Créez, modifiez et supprimez les comptes administrateurs de l'Église numérique.</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 w-40 bg-white/90 border-gray-200"
            />
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="h-10 rounded px-2 border-gray-200 bg-white/90 text-blue-900">
              {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 rounded px-2 border-gray-200 bg-white/90 text-blue-900">
              {statuts.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <Button onClick={() => exportToCSV(filteredUsers)} variant="outline" className="flex items-center gap-2 text-blue-900 border-blue-200 bg-white/90 hover:bg-blue-50 rounded-xl px-3 py-2">
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
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="text-blue-900/80 text-sm bg-blue-50">
                  <th className="py-3 px-4">Avatar</th>
                  <th className="py-3 px-4">Nom</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Rôle</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user: User, i: number) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="border-b last:border-0 hover:bg-yellow-50/40"
                  >
                    <td className="py-2 px-4">
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border-2 border-blue-200 shadow" />
                    </td>
                    {editId === user.id ? (
                      <>
                        <td className="py-2 px-4 font-semibold text-blue-900">
                          <Input name="name" value={editForm.name} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4 text-blue-800">
                          <Input name="email" value={editForm.email} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <select name="role" value={editForm.role} onChange={handleEditChange} className="h-8 rounded px-2 border-gray-200 bg-white/90 text-blue-900">
                            {roles.filter(r => r.value !== "all").map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <select name="status" value={editForm.status} onChange={handleEditChange} className="h-8 rounded px-2 border-gray-200 bg-white/90 text-blue-900">
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
                        <td className="py-2 px-4 font-semibold text-blue-900">{user.name}</td>
                        <td className="py-2 px-4 text-blue-800">{user.email}</td>
                        <td className="py-2 px-4 capitalize">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === "super_admin" ? "bg-yellow-100 text-yellow-800" : user.role === "admin_diocesan" ? "bg-green-100 text-green-800" : "bg-purple-100 text-purple-800"}`}>{roles.find(r => r.value === user.role)?.label}</span>
                        </td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${user.status === "actif" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"}`}>{user.status}</span>
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
              <div className="text-center text-blue-900/60 py-8">Aucun utilisateur trouvé.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
