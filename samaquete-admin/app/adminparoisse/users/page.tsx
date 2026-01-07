"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { User, Mail, Phone, Plus, Edit, Trash2, RefreshCw } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Pagination } from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"
import { UserService, ParishService } from "@/lib/firestore-services"

export default function AdminParoisseUsersPage() {
  const searchParams = useSearchParams()
  const paroisse = searchParams.get('paroisse') || 'Paroisse Saint Jean Bosco'
  const { toast } = useToast()
  
  const [users, setUsers] = useState<any[]>([])
  const [parishes, setParishes] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    parish: '',
    status: 'Actif',
    address: '',
    description: ''
  })

  // Charger les utilisateurs et paroisses depuis Firestore
  const loadUsers = async () => {
    try {
      setLoading(true)
      const [firestoreUsers, firestoreParishes] = await Promise.all([
        UserService.getAll(),
        ParishService.getAll()
      ])
      const paroisseUsers = firestoreUsers.filter(u => u.paroisse === paroisse || u.parish === paroisse)
      const paroisseParishes = firestoreParishes.filter(p => p.paroisse === paroisse || p.name === paroisse)
      setUsers(paroisseUsers)
      setParishes(paroisseParishes)
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs depuis Firebase",
        variant: "destructive"
      })
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [paroisse])

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

  // Fonctions CRUD
  const handleAddUser = async () => {
    try {
      const userData = {
        ...formData,
        paroisse: paroisse,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await UserService.create(userData)
      toast({
        title: "Succès",
        description: "Utilisateur ajouté avec succès",
        variant: "default"
      })
      setIsAddDialogOpen(false)
      resetForm()
      loadUsers()
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'utilisateur:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'utilisateur",
        variant: "destructive"
      })
    }
  }

  const handleEditUser = async () => {
    try {
      const userData = {
        ...formData,
        paroisse: paroisse,
        updatedAt: new Date().toISOString()
      }
      
      await UserService.update(editingUser.id, userData)
      toast({
        title: "Succès",
        description: "Utilisateur modifié avec succès",
        variant: "default"
      })
      setIsEditDialogOpen(false)
      setEditingUser(null)
      resetForm()
      loadUsers()
    } catch (error) {
      console.error('Erreur lors de la modification de l\'utilisateur:', error)
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'utilisateur",
        variant: "destructive"
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return
    
    try {
      await UserService.delete(userId)
      toast({
        title: "Succès",
        description: "Utilisateur supprimé avec succès",
        variant: "default"
      })
      loadUsers()
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: '',
      parish: '',
      status: 'Actif',
      address: '',
      description: ''
    })
  }

  const openEditDialog = (user: any) => {
    setEditingUser(user)
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || '',
      parish: user.parish || '',
      status: user.status || 'Actif',
      address: user.address || '',
      description: user.description || ''
    })
    setIsEditDialogOpen(true)
  }

  const roles = ["Curé", "Vicaire", "Catéchiste", "Administrateur", "Utilisateur"]
  const statuses = ["Actif", "Inactif"]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Chargement des utilisateurs...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="mb-8 shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-black mb-1">
              Gestion des utilisateurs - {paroisse}
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
            <Button
              onClick={loadUsers}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: Jean Dupont"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="jean.dupont@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+221 XX XXX XX XX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Rôle *</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parish">Paroisse</Label>
                    <Select value={formData.parish} onValueChange={(value) => setFormData({...formData, parish: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une paroisse" />
                      </SelectTrigger>
                      <SelectContent>
                        {parishes.map(parish => (
                          <SelectItem key={parish.id} value={parish.name}>{parish.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Statut</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Adresse complète"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Description de l'utilisateur..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddUser} disabled={!formData.name || !formData.email || !formData.role}>
                    Ajouter
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
                  <th className="py-3 px-4 text-black">Actions</th>
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
                    <td className="py-2 px-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {paginatedUsers.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
                <p className="text-gray-600 mb-6">
                  {users.length === 0 
                    ? `Aucun utilisateur n'est enregistré dans Firestore pour le diocèse ${paroisse}.`
                    : "Aucun utilisateur ne correspond à vos critères de recherche."
                  }
                </p>
                {users.length === 0 && (
                  <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Ajouter le premier utilisateur
                  </Button>
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

      {/* Dialog d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom complet *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Jean Dupont"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="jean.dupont@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Téléphone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+221 XX XXX XX XX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rôle *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-parish">Paroisse</Label>
              <Select value={formData.parish} onValueChange={(value) => setFormData({...formData, parish: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une paroisse" />
                </SelectTrigger>
                <SelectContent>
                  {parishes.map(parish => (
                    <SelectItem key={parish.id} value={parish.name}>{parish.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Statut</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-address">Adresse</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Adresse complète"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Description de l'utilisateur..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditUser} disabled={!formData.name || !formData.email || !formData.role}>
              Modifier
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
