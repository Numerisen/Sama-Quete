"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, Calendar, User, Eye } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Pagination } from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"

// Données initiales supprimées - Utilisation uniquement des données Firestore

export default function AdminDioceseNewsPage() {
  const searchParams = useSearchParams()
  const diocese = searchParams.get('diocese') || 'Diocèse de Thiès'
  const { toast } = useToast()
  
  const [news, setNews] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Charger les actualités depuis Firestore
  useEffect(() => {
    const loadNews = async () => {
      try {
        // TODO: Implémenter le chargement depuis Firestore
        // const firestoreNews = await NewsService.getAll()
        // const dioceseNews = firestoreNews.filter(n => n.diocese === diocese)
        // setNews(dioceseNews)
        setNews([]) // Aucune donnée pour le moment
      } catch (error) {
        console.error('Erreur lors du chargement des actualités:', error)
        setNews([])
      }
    }
    loadNews()
  }, [diocese])

  // Filtres et recherche
  const filteredNews = news.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                       n.content.toLowerCase().includes(search.toLowerCase()) ||
                       n.author.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || n.status === statusFilter
    const matchCategory = categoryFilter === "all" || n.category === categoryFilter
    return matchSearch && matchStatus && matchCategory
  })

  // Pagination
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedNews = filteredNews.slice(startIndex, endIndex)

  // Réinitialiser la page courante quand les filtres changent
  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter, categoryFilter, news])

  // Suppression
  const handleDelete = (id: number) => {
    if (window.confirm("Confirmer la suppression de cette actualité ?")) {
      setNews(news.filter(n => n.id !== id))
      toast({
          title: "Actualité supprimée",
          description: "L'actualité a été supprimée avec succès"
        })
    }
  }

  // Edition inline
  const handleEdit = (item: any) => {
    setEditId(item.id)
    setEditForm({ ...item })
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleEditSave = (id: number) => {
    setNews(news.map(n => n.id === id ? { ...editForm, id } : n))
    setEditId(null)
    toast({
          title: "Actualité modifiée",
          description: "L'actualité a été modifiée avec succès"
        })
  }

  const handleEditCancel = () => {
    setEditId(null)
  }

  const statuses = ["Publié", "Brouillon", "Archivé"]
  const categories = ["Événement", "Formation", "Charité", "Liturgie", "Communauté"]

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="mb-8 shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-black mb-1">
              Gestion des actualités - {diocese}
            </CardTitle>
            <p className="text-black/80 text-sm">
              Gérez les actualités et informations de votre diocèse.
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
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)} 
              className="h-10 rounded px-2 border-blue-200 bg-white/90 text-black"
            >
              <option value="all">Tous les statuts</option>
              {statuses.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
            <select 
              value={categoryFilter} 
              onChange={e => setCategoryFilter(e.target.value)} 
              className="h-10 rounded px-2 border-blue-200 bg-white/90 text-black"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(category => <option key={category} value={category}>{category}</option>)}
            </select>
            <Link href={`/admindiocese/news/create?diocese=${encodeURIComponent(diocese)}`}>
              <Button className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white shadow-lg rounded-xl px-4 py-2">
                <Plus className="w-5 h-5" /> Nouvelle actualité
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="text-black/80 text-sm bg-blue-50">
                  <th className="py-3 px-4 text-black">Titre</th>
                  <th className="py-3 px-4 text-black">Auteur</th>
                  <th className="py-3 px-4 text-black">Paroisse</th>
                  <th className="py-3 px-4 text-black">Catégorie</th>
                  <th className="py-3 px-4 text-black">Date</th>
                  <th className="py-3 px-4 text-black">Statut</th>
                  <th className="py-3 px-4 text-right text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedNews.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="border-b last:border-0 hover:bg-blue-50/40"
                  >
                    {editId === item.id ? (
                      <>
                        <td className="py-2 px-4 font-semibold text-black">
                          <Input name="title" value={editForm.title} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <Input name="author" value={editForm.author} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <Input name="parish" value={editForm.parish} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <select name="category" value={editForm.category} onChange={handleEditChange} className="h-8 rounded px-2 border-blue-200 bg-white/90 text-black">
                            {categories.map(category => <option key={category} value={category}>{category}</option>)}
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <Input name="date" type="date" value={editForm.date} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <select name="status" value={editForm.status} onChange={handleEditChange} className="h-8 rounded px-2 border-blue-200 bg-white/90 text-black">
                            {statuses.map(status => <option key={status} value={status}>{status}</option>)}
                          </select>
                        </td>
                        <td className="py-2 px-4 text-right flex gap-2 justify-end">
                          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => handleEditSave(item.id)}>Enregistrer</Button>
                          <Button size="sm" variant="ghost" className="rounded-lg" onClick={handleEditCancel}>Annuler</Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-4 font-semibold text-black">{item.title}</td>
                        <td className="py-2 px-4 text-black">{item.author}</td>
                        <td className="py-2 px-4 text-black">{item.parish}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.category === 'Événement' ? 'bg-blue-100 text-black' :
                            item.category === 'Formation' ? 'bg-blue-100 text-black' :
                            item.category === 'Charité' ? 'bg-blue-100 text-black' :
                            'bg-blue-100 text-black'
                          }`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-black">{new Date(item.date).toLocaleDateString('fr-FR')}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'Publié' ? 'bg-blue-100 text-black' :
                            item.status === 'Brouillon' ? 'bg-blue-100 text-black' :
                            'bg-blue-100 text-black'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-right flex gap-2 justify-end">
                          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => handleEdit(item)}><Edit className="w-4 h-4" /></Button>
                          <Button size="sm" variant="destructive" className="rounded-lg" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                        </td>
                      </>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {paginatedNews.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-12 h-12 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune actualité trouvée</h3>
                <p className="text-gray-600 mb-6">
                  {news.length === 0 
                    ? `Aucune actualité n'est enregistrée dans Firestore pour le diocèse ${diocese}.`
                    : "Aucune actualité ne correspond à vos critères de recherche."
                  }
                </p>
                {news.length === 0 && (
                  <Link href="/admindiocese/news/create">
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Créer la première actualité
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredNews.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredNews.length}
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
