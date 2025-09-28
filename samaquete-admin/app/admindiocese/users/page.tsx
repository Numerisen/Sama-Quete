"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Mail, Phone } from "lucide-react"
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
  // États de modification supprimés - Mode consultation uniquement
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

  // Fonctions de modification et suppression supprimées - Mode consultation uniquement

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
            {/* Bouton de création supprimé - Mode consultation uniquement */}
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
                  {/* Colonne Actions supprimée - Mode consultation uniquement */}
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
                    {/* Mode consultation uniquement - Pas d'édition ni suppression */}
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
                        user.status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    {/* Actions supprimées - Mode consultation uniquement */}
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
                {/* Bouton de création supprimé - Mode consultation uniquement */}
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
