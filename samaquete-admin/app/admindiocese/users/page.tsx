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
import { useToast } from "@/hooks/use-toast"

// Données initiales supprimées - Utilisation uniquement des données Firestore

export default function AdminDioceseUsersPage() {
  const searchParams = useSearchParams()
  const diocese = searchParams.get('diocese') || 'Archidiocèse de Dakar'
  const { toast } = useToast()
  
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Charger les utilisateurs depuis Firestore
  useEffect(() => {
    const loadUsers = async () => {
      try {
        // TODO: Implémenter le chargement depuis Firestore
        // const firestoreUsers = await UserService.getAll()
        // const dioceseUsers = firestoreUsers.filter(u => u.diocese === diocese)
        // setUsers(dioceseUsers)
        setUsers([]) // Aucune donnée pour le moment
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error)
        setUsers([])
      }
    }
    loadUsers()
  }, [diocese])

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
      toast({
          title: "Utilisateur supprimé",
          description: "L'utilisateur a été supprimé avec succès"
        })
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
    toast({
          title: "Utilisateur modifié",
          description: "L'utilisateur a été modifié avec succès"
        })
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
            <CardTitle className="text-3xl font-bold text-black mb-1">
              Gestion des utilisateurs - {diocese}
            </CardTitle>
            <p className="text-black/80 text-sm">
              Gérez les utilisateurs de votre diocèse, leurs rôles et permissions.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 w-40 bg-white/90 border-blue-200"
            />
            <select 
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value)} 
              className="h-10 rounded px-2 border-blue-200 bg-white/90 text-black"
            >
              <option value="all">Tous les rôles</option>
              {roles.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)} 
              className="h-10 rounded px-2 border-blue-200 bg-white/90 text-black"
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
                <tr className="text-black/80 text-sm bg-blue-50">
                  <th className="py-3 px-4 text-black">Nom</th>
                  <th className="py-3 px-4 text-black">Email</th>
                  <th className="py-3 px-4 text-black">Téléphone</th>
                  <th className="py-3 px-4 text-black">Rôle</th>
                  <th className="py-3 px-4 text-black">Paroisse</th>
                  <th className="py-3 px-4 text-black">Statut</th>
                  <th className="py-3 px-4 text-right text-black">Actions</th>
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
                        <td className="py-2 px-4 font-semibold text-black">
                          <Input name="name" value={editForm.name} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <Input name="email" value={editForm.email} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <Input name="phone" value={editForm.phone} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <select name="role" value={editForm.role} onChange={handleEditChange} className="h-8 rounded px-2 border-blue-200 bg-white/90 text-black">
                            {roles.map(role => <option key={role} value={role}>{role}</option>)}
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <Input name="parish" value={editForm.parish} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <select name="status" value={editForm.status} onChange={handleEditChange} className="h-8 rounded px-2 border-blue-200 bg-white/90 text-black">
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
                        <td className="py-2 px-4 font-semibold text-black">{user.name}</td>
                        <td className="py-2 px-4 text-black">{user.email}</td>
                        <td className="py-2 px-4 text-black">{user.phone}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'Curé' ? 'bg-blue-100 text-black' :
                            user.role === 'Vicaire' ? 'bg-blue-100 text-black' :
                            user.role === 'Catéchiste' ? 'bg-blue-100 text-black' :
                            'bg-blue-100 text-black'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-black">{user.parish}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'Actif' ? 'bg-blue-100 text-black' : 'bg-blue-100 text-black'
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
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
                <p className="text-gray-600 mb-6">
                  {users.length === 0 
                    ? `Aucun utilisateur n'est enregistré dans Firestore pour le diocèse ${diocese}.`
                    : "Aucun utilisateur ne correspond à vos critères de recherche."
                  }
                </p>
                {users.length === 0 && (
                  <Link href="/admindiocese/users/create">
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Créer le premier utilisateur
                    </Button>
                  </Link>
                )}
              </div>
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
