"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { getDioceses, getParishes, getChurches } from "@/lib/firestore/services"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Mail, User } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { ViewToggle, ViewMode } from "@/components/ui/view-toggle"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/ui/pagination"

interface User {
  uid: string
  email: string
  displayName: string
  emailVerified: boolean
  disabled: boolean
  role: string
  mustChangePassword: boolean
  dioceseId: string
  parishId: string
  churchId: string
  archdioceseId: string
  metadata: {
    creationTime: string
    lastSignInTime?: string
  }
}

export default function UsersPage() {
  const { claims } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [dioceses, setDioceses] = useState<any[]>([])
  const [parishes, setParishes] = useState<any[]>([])
  const [churches, setChurches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [viewMode, setViewMode] = useState<ViewMode>("cards")

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      const [response, diocesesData, parishesData, churchesData] = await Promise.all([
        fetch("/api/users/list"),
        getDioceses(),
        getParishes(),
        getChurches(),
      ])
      
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des utilisateurs")
      }
      const data = await response.json()
      // Filtrer pour ne garder que les utilisateurs admin (exclure les fidèles de l'app mobile)
      const adminUsers = (data.users || []).filter((user: User) => {
        const role = user.role || ""
        // Garder seulement les utilisateurs avec un rôle admin
        return role === "super_admin" || 
               role === "archdiocese_admin" || 
               role === "diocese_admin" || 
               role === "parish_admin" || 
               role === "church_admin"
      })
      setUsers(adminUsers)
      setDioceses(diocesesData)
      setParishes(parishesData)
      setChurches(churchesData)
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (claims?.role === "super_admin") {
      loadUsers()
    }
  }, [claims?.role, loadUsers])

  async function handleDelete(uid: string) {
    try {
      const response = await fetch("/api/users/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de la suppression")
      }

      toast({
        title: "Succès",
        description: "Utilisateur supprimé avec succès",
      })

      // Recharger la liste après un court délai
      setTimeout(() => {
        loadUsers()
      }, 300)
    } catch (error: any) {
      console.error("Erreur suppression:", error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'utilisateur",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const getDioceseName = (dioceseId: string): string => {
    const diocese = dioceses.find(d => d.dioceseId === dioceseId)
    return diocese ? diocese.name : dioceseId
  }

  const getParishName = (parishId: string): string => {
    const parish = parishes.find(p => p.parishId === parishId)
    return parish ? parish.name : parishId
  }

  const getChurchName = (churchId: string): string => {
    const church = churches.find(c => c.churchId === churchId)
    return church ? church.name : churchId
  }

  const getEntityLabel = (user: User) => {
    if (user.archdioceseId) return `Archidiocèse de Dakar`
    if (user.dioceseId) return `Diocèse: ${getDioceseName(user.dioceseId)}`
    if (user.parishId) return `Paroisse: ${getParishName(user.parishId)}`
    if (user.churchId) return `Église: ${getChurchName(user.churchId)}`
    return "Non défini"
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      super_admin: "Super Admin",
      archdiocese_admin: "Admin Archidiocèse",
      diocese_admin: "Admin Diocèse",
      parish_admin: "Admin Paroisse",
      church_admin: "Admin Église",
    }
    return labels[role] || role
  }

  // Pagination
  const totalPages = Math.ceil(users.length / itemsPerPage)
  const paginatedUsers = useMemo(() => {
    return users.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
  }, [users, currentPage, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  if (claims?.role !== "super_admin") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Utilisateurs</h1>
          <p className="text-muted-foreground mt-2">
            Accès réservé au super administrateur
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Utilisateurs</h1>
          <p className="text-muted-foreground mt-2">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Utilisateurs</h1>
          <p className="text-muted-foreground mt-2">
            Gestion des utilisateurs du système • {users.length} utilisateur{users.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          <Link href="/admin/users/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel utilisateur
            </Button>
          </Link>
        </div>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
          </CardContent>
        </Card>
      ) : viewMode === "cards" ? (
        <Card>
          <CardHeader>
            <CardTitle>Liste des utilisateurs ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedUsers.map((user) => (
                <div
                  key={user.uid}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">
                            {user.displayName || user.email}
                          </p>
                          {user.disabled && (
                            <Badge variant="secondary" className="text-xs">
                              Désactivé
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                          <Badge variant="outline">{getRoleLabel(user.role)}</Badge>
                          <span>{getEntityLabel(user)}</span>
                        </div>
                        {user.metadata.lastSignInTime && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Dernière connexion: {new Date(user.metadata.lastSignInTime).toLocaleDateString("fr-FR")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/users/${user.uid}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setUserToDelete(user.uid)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Entité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.displayName || "-"}</TableCell>
                  <TableCell>
                    <Badge>{getRoleLabel(user.role)}</Badge>
                  </TableCell>
                  <TableCell>{getEntityLabel(user)}</TableCell>
                  <TableCell>
                    <Badge variant={user.disabled ? "destructive" : "default"}>
                      {user.disabled ? "Désactivé" : "Actif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/users/${user.uid}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setUserToDelete(user.uid)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && handleDelete(userToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {users.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={users.length}
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
