"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  Eye,
  EyeOff,
  Search,
  Calendar,
  AlertCircle,
  User
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { motion } from "framer-motion"

/**
 * Page "Notifications" - Admin Paroisse
 * 
 * Objectif: Communication vers les fidèles
 * 
 * Fonctionnalités:
 * - Créer / publier des notifications
 * - Types: news, prayer, activity, donation, liturgy
 * 
 * 📱 Mobile:
 * - Filtré par parishId
 * - Uniquement published = true
 */
interface Notification {
  id: string
  parishId: string
  title: string
  message: string
  type: 'news' | 'prayer' | 'activity' | 'donation' | 'liturgy'
  status: 'draft' | 'pending' | 'published'
  published: boolean
  createdBy: string
  createdAt: any
  updatedAt?: any
}

export default function NotificationsPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { userRole } = useAuth()
  const parishId = userRole?.parishId || searchParams.get('parishId') || ''
  
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateStart, setDateStart] = useState<string>("")
  const [dateEnd, setDateEnd] = useState<string>("")
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'news' as Notification['type'],
    status: 'draft' as Notification['status']
  })

  useEffect(() => {
    if (parishId) {
      loadNotifications()
    }
  }, [parishId])

  const loadNotifications = async () => {
    if (!parishId) return
    
    try {
      setLoading(true)
      const q = query(
        collection(db, 'notifications'),
        where('parishId', '==', parishId),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const notificationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[]
      
      setNotifications(notificationsData)
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les notifications",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!parishId || !userRole?.uid) return

    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      })
      return
    }

    try {
      const published = formData.status === 'published'
      
      await addDoc(collection(db, 'notifications'), {
        parishId,
        title: formData.title,
        message: formData.message,
        type: formData.type,
        status: formData.status,
        published,
        createdBy: userRole.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      toast({
        title: "Succès",
        description: "Notification créée avec succès"
      })
      setIsCreateDialogOpen(false)
      resetForm()
      loadNotifications()
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      toast({
        title: "Erreur",
        description: "Impossible de créer la notification",
        variant: "destructive"
      })
    }
  }

  const handleEdit = async () => {
    if (!editingNotification || !userRole?.uid) return

    // Vérifier que la notification n'est pas publiée
    if (editingNotification.status === 'published') {
      toast({
        title: "Erreur",
        description: "Impossible de modifier une notification publiée",
        variant: "destructive"
      })
      return
    }

    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      })
      return
    }

    try {
      const published = formData.status === 'published'
      
      await updateDoc(doc(db, 'notifications', editingNotification.id), {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        status: formData.status,
        published,
        updatedAt: serverTimestamp()
      })

      toast({
        title: "Succès",
        description: "Notification modifiée avec succès"
      })
      setIsEditDialogOpen(false)
      setEditingNotification(null)
      resetForm()
      loadNotifications()
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
      toast({
        title: "Erreur",
        description: "Impossible de modifier la notification",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (notificationId: string, status: string) => {
    // Vérifier que la notification n'est pas publiée
    if (status === 'published') {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer une notification publiée",
        variant: "destructive"
      })
      return
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) return

    try {
      await deleteDoc(doc(db, 'notifications', notificationId))
      toast({
        title: "Succès",
        description: "Notification supprimée"
      })
      loadNotifications()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la notification",
        variant: "destructive"
      })
    }
  }

  const handleTogglePublish = async (notification: Notification) => {
    try {
      const newStatus = notification.published ? 'draft' : 'published'
      const newPublished = !notification.published
      
      await updateDoc(doc(db, 'notifications', notification.id), {
        status: newStatus,
        published: newPublished,
        updatedAt: serverTimestamp()
      })

      toast({
        title: "Succès",
        description: newPublished ? "Notification publiée" : "Notification dépublée"
      })
      loadNotifications()
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error)
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'news',
      status: 'draft'
    })
  }

  const openEditDialog = (notification: Notification) => {
    if (notification.status === 'published') {
      toast({
        title: "Erreur",
        description: "Impossible de modifier une notification publiée",
        variant: "destructive"
      })
      return
    }

    setEditingNotification(notification)
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      status: notification.status
    })
    setIsEditDialogOpen(true)
  }

  // Filtres
  const filteredNotifications = notifications.filter(notification => {
    const matchSearch = notification.title.toLowerCase().includes(search.toLowerCase()) ||
                       notification.message.toLowerCase().includes(search.toLowerCase())
    
    const matchType = typeFilter === "all" || notification.type === typeFilter
    
    const matchStatus = statusFilter === "all" || notification.status === statusFilter
    
    const matchDate = (!dateStart || !dateEnd) || (() => {
      const createdAt = notification.createdAt?.toDate?.() || new Date(notification.createdAt)
      const start = new Date(dateStart)
      const end = new Date(dateEnd)
      end.setHours(23, 59, 59, 999)
      return createdAt >= start && createdAt <= end
    })()
    
    return matchSearch && matchType && matchStatus && matchDate
  })

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      news: 'bg-blue-100 text-blue-800',
      prayer: 'bg-purple-100 text-purple-800',
      activity: 'bg-green-100 text-green-800',
      donation: 'bg-yellow-100 text-yellow-800',
      liturgy: 'bg-red-100 text-red-800'
    }
    return <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>{type}</Badge>
  }

  const getStatusBadge = (status: string, published: boolean) => {
    if (published) {
      return <Badge className="bg-green-100 text-green-800">
        <Eye className="w-3 h-3 mr-1" />
        Publié
      </Badge>
    }
    switch (status) {
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Brouillon</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement des notifications...</p>
        </div>
      </div>
    )
  }

  if (!parishId) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">Aucune paroisse sélectionnée</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="shadow-xl bg-white/80 border-0 rounded-2xl mb-6">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-black mb-1">
              Notifications
            </CardTitle>
            <p className="text-black/80 text-sm">
              Créez et gérez les notifications pour votre paroisse
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-900 hover:bg-blue-800 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Créer une notification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer une notification</DialogTitle>
                <DialogDescription>
                  Cette notification sera visible côté mobile si elle est publiée
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-title">Titre *</Label>
                  <Input
                    id="create-title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Titre de la notification"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-message">Message *</Label>
                  <Textarea
                    id="create-message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Message de la notification"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-type">Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value as Notification['type']})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="news">News</SelectItem>
                        <SelectItem value="prayer">Prayer</SelectItem>
                        <SelectItem value="activity">Activity</SelectItem>
                        <SelectItem value="donation">Donation</SelectItem>
                        <SelectItem value="liturgy">Liturgy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-status">Statut *</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as Notification['status']})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Brouillon</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="published">Publié</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false)
                  resetForm()
                }}>
                  Annuler
                </Button>
                <Button onClick={handleCreate}>
                  Créer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="prayer">Prayer</SelectItem>
                <SelectItem value="activity">Activity</SelectItem>
                <SelectItem value="donation">Donation</SelectItem>
                <SelectItem value="liturgy">Liturgy</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="published">Publié</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="Date début"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="w-[150px]"
              />
              <Input
                type="date"
                placeholder="Date fin"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="w-[150px]"
              />
            </div>
            <Button variant="outline" onClick={loadNotifications}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>

          {/* Liste */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Aucune notification trouvée</p>
              </div>
            ) : (
              filteredNotifications.map((notification, i) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-black">{notification.title}</h3>
                        {getTypeBadge(notification.type)}
                        {getStatusBadge(notification.status, notification.published)}
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{notification.message}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {notification.createdAt?.toDate?.() 
                              ? new Date(notification.createdAt.toDate()).toLocaleDateString('fr-FR')
                              : new Date(notification.createdAt).toLocaleDateString('fr-FR')
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>Admin paroisse</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTogglePublish(notification)}
                      >
                        {notification.published ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-1" />
                            Dépublier
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-1" />
                            Publier
                          </>
                        )}
                      </Button>
                      {notification.status !== 'published' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(notification)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(notification.id, notification.status)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier la notification</DialogTitle>
            <DialogDescription>
              Les notifications publiées ne peuvent pas être modifiées
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titre *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Titre de la notification"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-message">Message *</Label>
              <Textarea
                id="edit-message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Message de la notification"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value as Notification['type']})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="prayer">Prayer</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                    <SelectItem value="donation">Donation</SelectItem>
                    <SelectItem value="liturgy">Liturgy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Statut *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as Notification['status']})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false)
              setEditingNotification(null)
              resetForm()
            }}>
              Annuler
            </Button>
            <Button onClick={handleEdit}>
              Modifier
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
