"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, User, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Pagination } from "@/components/ui/pagination"
import { useToastContext } from "@/components/toast-provider"

const initialUsers = [
  {
    id: 1,
    name: "Jean Sarr",
    email: "jean.sarr@example.com",
    phone: "+221 33 123 45 67",
    role: "Curé",
    parish: "Paroisse Saint-Joseph de Thiès",
    diocese: "Diocèse de Thiès",
    status: "Actif"
  },
  {
    id: 2,
    name: "Marie Diop",
    email: "marie.diop@example.com",
    phone: "+221 33 234 56 78",
    role: "Catéchiste",
    parish: "Paroisse Sainte-Anne de Thiès",
    diocese: "Diocèse de Thiès",
    status: "Actif"
  },
  {
    id: 3,
    name: "Paul Faye",
    email: "paul.faye@example.com",
    phone: "+221 33 345 67 89",
    role: "Vicaire",
    parish: "Paroisse Sacré-Cœur de Thiès",
    diocese: "Diocèse de Thiès",
    status: "Actif"
  },
  {
    id: 4,
    name: "Michel Diop",
    email: "michel.diop@example.com",
    phone: "+221 33 456 78 90",
    role: "Curé",
    parish: "Paroisse Notre-Dame de Thiès",
    diocese: "Diocèse de Thiès",
    status: "Actif"
  }
]

export default function AdminDioceseUsersPage() {
  const searchParams = useSearchParams()
  const diocese = searchParams.get('diocese') || 'Archidiocèse de Dakar'
  const toast = useToastContext()
  
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Initialisation depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem("admin_users")
    if (stored) {
      const allUsers = JSON.parse(stored)
      const dioceseUsers = allUsers.filter((u: any) => u.diocese === diocese)
      setUsers(dioceseUsers)
    } else {
      const dioceseUsers = initialUsers.filter(u => u.diocese === diocese)
      setUsers(dioceseUsers)
      localStorage.setItem("admin_users", JSON.stringify(initialUsers))
    }
  }, [diocese])

  // Sauvegarde à chaque modification
  useEffect(() => {
    if (users.length > 0) {
      const stored = localStorage.getItem("admin_users")
      const allUsers = stored ? JSON.parse(stored) : []
      const otherUsers = allUsers.filter((u: any) => u.diocese !== diocese)
      const updatedUsers = [...otherUsers, ...users]
      localStorage.setItem("admin_users", JSON.stringify(updatedUsers))
    }
  }, [users, diocese])

  // Filtres et recherche
  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                       u.email.toLowerCase().includes(search.toLowerCase()) ||
                       u.parish.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === "all" || u.role === roleFilter
    const matchStatus = statusFilter === "all" || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  // Réinitialiser la page courante quand les filtres changent
  useEffect(() => {
    setCurrentPage(1)
  }, [search, roleFilter, statusFilter, users])

  // Suppression
  const handleDelete = (id: number) => {
    if (window.confirm("Confirmer la suppression de cet utilisateur ?")) {
      setUsers(users.filter(u => u.id !== id))
      toast.success("Utilisateur supprimé", "L'utilisateur a été supprimé avec succès")
    }
  }

  // Edition inline
  const handleEdit = (user: any) => {
    setEditId(user.id)
    setEditForm({ ...user })
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleEditSave = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...editForm, id } : u))
    setEditId(null)
    toast.success("Utilisateur modifié", "L'utilisateur a été modifié avec succès")
  }

  const handleEditCancel = () => {
    setEditId(null)
  }

  const roles = ["Curé", "Vicaire", "Catéchiste", "Administrateur", "Utilisateur"]
  const statuses = ["Actif", "Inactif"]

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="mb-8 shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-blue-900 mb-1">
              Gestion des utilisateurs - {diocese}
            </CardTitle>
            <p className="text-blue-800/80 text-sm">
              Gérez les utilisateurs de votre diocèse, leurs rôles et permissions.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 w-40 bg-white/90 border-gray-200"
            />
            <select 
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value)} 
              className="h-10 rounded px-2 border-gray-200 bg-white/90 text-blue-900"
            >
              <option value="all">Tous les rôles</option>
              {roles.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)} 
              className="h-10 rounded px-2 border-gray-200 bg-white/90 text-blue-900"
            >
              <option value="all">Tous les statuts</option>
              {statuses.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
            <Link href={`/admindiocese/users/create?diocese=${encodeURIComponent(diocese)}`}>
              <Button className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white shadow-lg rounded-xl px-4 py-2">
                <Plus className="w-5 h-5" /> Nouvel utilisateur
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="text-blue-900/80 text-sm bg-blue-50">
                  <th className="py-3 px-4">Nom</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Téléphone</th>
                  <th className="py-3 px-4">Rôle</th>
                  <th className="py-3 px-4">Paroisse</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="border-b last:border-0 hover:bg-blue-50/40"
                  >
                    {editId === user.id ? (
                      <>
                        <td className="py-2 px-4 font-semibold text-blue-900">
                          <Input name="name" value={editForm.name} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <Input name="email" value={editForm.email} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <Input name="phone" value={editForm.phone} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <select name="role" value={editForm.role} onChange={handleEditChange} className="h-8 rounded px-2 border-gray-200 bg-white/90 text-blue-900">
                            {roles.map(role => <option key={role} value={role}>{role}</option>)}
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <Input name="parish" value={editForm.parish} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <select name="status" value={editForm.status} onChange={handleEditChange} className="h-8 rounded px-2 border-gray-200 bg-white/90 text-blue-900">
                            {statuses.map(status => <option key={status} value={status}>{status}</option>)}
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
                        <td className="py-2 px-4">{user.email}</td>
                        <td className="py-2 px-4">{user.phone}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'Curé' ? 'bg-blue-100 text-blue-800' :
                            user.role === 'Vicaire' ? 'bg-green-100 text-green-800' :
                            user.role === 'Catéchiste' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-2 px-4">{user.parish}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
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
            {paginatedUsers.length === 0 && (
              <div className="text-center text-blue-900/60 py-8">Aucun utilisateur trouvé dans ce diocèse.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage)
            setCurrentPage(1)
          }}
        />
      )}
    </div>
  )
}
