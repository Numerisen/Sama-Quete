"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Search, 
  RefreshCw,
  AlertCircle,
  Clock,
  User,
  Church as ChurchIcon
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ContentValidationService, ContentItem } from "@/lib/content-validation-service"
import { ChurchService } from "@/lib/church-service"
import { getUserRole } from "@/lib/user-service"
// import { motion } from "framer-motion"
// Stub temporaire
const motion = {
  div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

/**
 * Page "Actualités & contenus" - Admin Paroisse
 * 
 * Objectif: Contrôle éditorial total
 * 
 * Fonctionnalités:
 * - Voir tous les contenus créés par les admins église
 * - Actions: valider, refuser, publier
 * - Créer et publier des annonces officielles paroissiales
 * 
 * 📱 Mobile:
 * - Affiche UNIQUEMENT published = true
 * - Filtré par parishId
 */
function ActualitesContenusContent() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { userRole } = useAuth()
  const parishId = userRole?.parishId || searchParams.get('parishId') || ''
  
  const [contents, setContents] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  
  // Pour afficher les noms des églises et auteurs
  const [churchesMap, setChurchesMap] = useState<Record<string, string>>({})
  const [authorsMap, setAuthorsMap] = useState<Record<string, string>>({})
  
  // Dialog de rejet
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectingContentId, setRejectingContentId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  
  // Dialog de création
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newContent, setNewContent] = useState({
    title: "",
    content: "",
    excerpt: ""
  })

  useEffect(() => {
    if (parishId) {
      loadContents()
      loadChurches()
    }
  }, [parishId])

  const loadContents = async () => {
    if (!parishId || !db) return
    
    try {
      setLoading(true)
      // Récupérer tous les contenus de la paroisse (tous statuts)
      const q = query(
        collection(db, 'admin_news'),
        where('parishId', '==', parishId)
      )
      const querySnapshot = await getDocs(q)
      const contentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContentItem[]
      
      // Trier: pending en premier, puis published, puis rejected
      contentsData.sort((a, b) => {
        const order = { pending: 0, published: 1, rejected: 2, draft: 3 }
        return (order[a.status] || 99) - (order[b.status] || 99)
      })
      
      setContents(contentsData)
      
      // Charger les noms des auteurs
      const uniqueAuthors = [...new Set(contentsData.map(c => c.createdBy))]
      for (const authorUid of uniqueAuthors) {
        if (!authorsMap[authorUid]) {
          const authorRole = await getUserRole(authorUid)
          if (authorRole) {
            setAuthorsMap(prev => ({
              ...prev,
              [authorUid]: authorRole.displayName
            }))
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des contenus:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les contenus",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadChurches = async () => {
    if (!parishId) return
    
    try {
      const churches = await ChurchService.getChurchesByParish(parishId)
      const map: Record<string, string> = {}
      churches.forEach(church => {
        map[church.id] = church.name
      })
      setChurchesMap(map)
    } catch (error) {
      console.error('Erreur lors du chargement des églises:', error)
    }
  }

  const handleValidate = async (contentId: string) => {
    if (!userRole?.uid) {
      toast({
        title: "Erreur",
        description: "Utilisateur non authentifié",
        variant: "destructive"
      })
      return
    }

    try {
      await ContentValidationService.validateContent(contentId, userRole.uid, 'admin_news')
      toast({
        title: "Succès",
        description: "Contenu validé et publié avec succès"
      })
      loadContents()
    } catch (error) {
      console.error('Erreur lors de la validation:', error)
      toast({
        title: "Erreur",
        description: "Impossible de valider le contenu",
        variant: "destructive"
      })
    }
  }

  const handleReject = async () => {
    if (!rejectingContentId || !userRole?.uid) return

    if (!rejectionReason.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez indiquer une raison de rejet",
        variant: "destructive"
      })
      return
    }

    try {
      await ContentValidationService.rejectContent(
        rejectingContentId,
        userRole.uid,
        rejectionReason,
        'admin_news'
      )
      toast({
        title: "Succès",
        description: "Contenu rejeté"
      })
      setRejectDialogOpen(false)
      setRejectingContentId(null)
      setRejectionReason("")
      loadContents()
    } catch (error) {
      console.error('Erreur lors du rejet:', error)
      toast({
        title: "Erreur",
        description: "Impossible de rejeter le contenu",
        variant: "destructive"
      })
    }
  }

  const handleCreateContent = async () => {
    if (!parishId || !userRole?.uid) return

    if (!newContent.title.trim() || !newContent.content.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      })
      return
    }

    try {
      if (!db) {
        throw new Error("Firestore n'est pas initialisé")
      }
      const { addDoc, serverTimestamp } = await import('firebase/firestore')
      
      await addDoc(collection(db, 'admin_news'), {
        title: newContent.title,
        content: newContent.content,
        excerpt: newContent.excerpt || newContent.content.substring(0, 150),
        parishId,
        status: 'published', // Contenu paroissial publié directement
        published: true,
        createdBy: userRole.uid,
        createdByRole: 'parish_admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      toast({
        title: "Succès",
        description: "Annonce paroissiale créée et publiée"
      })
      setCreateDialogOpen(false)
      setNewContent({ title: "", content: "", excerpt: "" })
      loadContents()
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      toast({
        title: "Erreur",
        description: "Impossible de créer le contenu",
        variant: "destructive"
      })
    }
  }

  // Filtres
  const filteredContents = contents.filter(content => {
    const matchSearch = content.title.toLowerCase().includes(search.toLowerCase()) ||
                      content.content?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || content.status === statusFilter
    const matchType = typeFilter === "all" || 
                     (typeFilter === "church" && content.createdByRole === 'church_admin') ||
                     (typeFilter === "parish" && content.createdByRole === 'parish_admin')
    return matchSearch && matchStatus && matchType
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Publié</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Brouillon</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement des contenus...</p>
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
              Actualités & contenus
            </CardTitle>
            <p className="text-black/80 text-sm">
              Contrôle éditorial total - Validez les contenus créés par les églises
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-900 hover:bg-blue-800 text-white">
                <FileText className="w-4 h-4 mr-2" />
                Créer une annonce paroissiale
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer une annonce paroissiale</DialogTitle>
                <DialogDescription>
                  Cette annonce sera publiée directement (visible côté mobile)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-title">Titre *</Label>
                  <Input
                    id="new-title"
                    value={newContent.title}
                    onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                    placeholder="Titre de l'annonce"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-excerpt">Résumé</Label>
                  <Textarea
                    id="new-excerpt"
                    value={newContent.excerpt}
                    onChange={(e) => setNewContent({...newContent, excerpt: e.target.value})}
                    placeholder="Résumé (optionnel)"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-content">Contenu *</Label>
                  <Textarea
                    id="new-content"
                    value={newContent.content}
                    onChange={(e) => setNewContent({...newContent, content: e.target.value})}
                    placeholder="Contenu de l'annonce"
                    rows={6}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => {
                  setCreateDialogOpen(false)
                  setNewContent({ title: "", content: "", excerpt: "" })
                }}>
                  Annuler
                </Button>
                <Button onClick={handleCreateContent}>
                  Publier
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="published">Publié</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="church">Créé par église</SelectItem>
                <SelectItem value="parish">Créé par paroisse</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadContents}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>

          {/* Liste des contenus */}
          <div className="space-y-4">
            {filteredContents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Aucun contenu trouvé</p>
              </div>
            ) : (
              filteredContents.map((content, i) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-black">{content.title}</h3>
                        {getStatusBadge(content.status)}
                      </div>
                      
                      {content.excerpt && (
                        <p className="text-gray-600 text-sm mb-3">{content.excerpt}</p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{authorsMap[content.createdBy] || 'Auteur inconnu'}</span>
                        </div>
                        {content.churchId && (
                          <div className="flex items-center gap-1">
                            <ChurchIcon className="w-4 h-4" />
                            <span>{churchesMap[content.churchId] || 'Église inconnue'}</span>
                          </div>
                        )}
                        {content.createdByRole === 'parish_admin' && (
                          <Badge variant="outline">Paroisse</Badge>
                        )}
                        {content.validatedAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Validé le {new Date(content.validatedAt?.toDate?.() || Date.now()).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      
                      {content.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                          <strong>Raison du rejet:</strong> {content.rejectionReason}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {content.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleValidate(content.id!)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Valider
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setRejectingContentId(content.id!)
                              setRejectDialogOpen(true)
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Refuser
                          </Button>
                        </>
                      )}
                      {content.status === 'published' && (
                        <Badge className="bg-green-100 text-green-800">
                          <Eye className="w-3 h-3 mr-1" />
                          Visible mobile
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de rejet */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter le contenu</DialogTitle>
            <DialogDescription>
              Indiquez la raison du rejet. Cette raison sera visible par l'auteur.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Raison du rejet *</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ex: Contenu non conforme, informations incorrectes..."
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => {
              setRejectDialogOpen(false)
              setRejectingContentId(null)
              setRejectionReason("")
            }}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Rejeter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ActualitesContenusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-lg">Chargement...</span>
        </div>
      </div>
    }>
      <ActualitesContenusContent />
    </Suspense>
  )
}
