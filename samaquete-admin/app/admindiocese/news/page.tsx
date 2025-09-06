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

const initialNews = [
  {
    id: 1,
    title: "Célébration de la fête de l'Assomption",
    content: "La paroisse Saint-Joseph de Thiès célèbre la fête de l'Assomption avec une messe solennelle.",
    author: "Père Jean Sarr",
    diocese: "Diocèse de Thiès",
    parish: "Paroisse Saint-Joseph",
    date: "2024-08-15",
    status: "Publié",
    category: "Événement"
  },
  {
    id: 2,
    title: "Retraite spirituelle pour les jeunes",
    content: "Une retraite spirituelle de 3 jours est organisée pour les jeunes du diocèse.",
    author: "Sœur Marie Diop",
    diocese: "Diocèse de Thiès",
    parish: "Paroisse Sainte-Anne",
    date: "2024-08-20",
    status: "Brouillon",
    category: "Formation"
  },
  {
    id: 3,
    title: "Collecte pour les nécessiteux",
    content: "Une collecte spéciale est organisée pour aider les familles dans le besoin.",
    author: "Père André Faye",
    diocese: "Diocèse de Thiès",
    parish: "Paroisse Sacré-Cœur",
    date: "2024-08-25",
    status: "Publié",
    category: "Charité"
  }
]

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

  // Initialisation depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem("admin_news")
    if (stored) {
      const allNews = JSON.parse(stored)
      const dioceseNews = allNews.filter((n: any) => n.diocese === diocese)
      setNews(dioceseNews)
    } else {
      const dioceseNews = initialNews.filter(n => n.diocese === diocese)
      setNews(dioceseNews)
      localStorage.setItem("admin_news", JSON.stringify(initialNews))
    }
  }, [diocese])

  // Sauvegarde à chaque modification
  useEffect(() => {
    if (news.length > 0) {
      const stored = localStorage.getItem("admin_news")
      const allNews = stored ? JSON.parse(stored) : []
      const otherNews = allNews.filter((n: any) => n.diocese !== diocese)
      const updatedNews = [...otherNews, ...news]
      localStorage.setItem("admin_news", JSON.stringify(updatedNews))
    }
  }, [news, diocese])

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
      toast.success("Actualité supprimée", "L'actualité a été supprimée avec succès")
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
    toast.success("Actualité modifiée", "L'actualité a été modifiée avec succès")
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
            <CardTitle className="text-3xl font-bold text-blue-900 mb-1">
              Gestion des actualités - {diocese}
            </CardTitle>
            <p className="text-blue-800/80 text-sm">
              Gérez les actualités et informations de votre diocèse.
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
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)} 
              className="h-10 rounded px-2 border-gray-200 bg-white/90 text-blue-900"
            >
              <option value="all">Tous les statuts</option>
              {statuses.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
            <select 
              value={categoryFilter} 
              onChange={e => setCategoryFilter(e.target.value)} 
              className="h-10 rounded px-2 border-gray-200 bg-white/90 text-blue-900"
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
                <tr className="text-blue-900/80 text-sm bg-blue-50">
                  <th className="py-3 px-4">Titre</th>
                  <th className="py-3 px-4">Auteur</th>
                  <th className="py-3 px-4">Paroisse</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
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
                        <td className="py-2 px-4 font-semibold text-blue-900">
                          <Input name="title" value={editForm.title} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <Input name="author" value={editForm.author} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <Input name="parish" value={editForm.parish} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <select name="category" value={editForm.category} onChange={handleEditChange} className="h-8 rounded px-2 border-gray-200 bg-white/90 text-blue-900">
                            {categories.map(category => <option key={category} value={category}>{category}</option>)}
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <Input name="date" type="date" value={editForm.date} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <select name="status" value={editForm.status} onChange={handleEditChange} className="h-8 rounded px-2 border-gray-200 bg-white/90 text-blue-900">
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
                        <td className="py-2 px-4 font-semibold text-blue-900">{item.title}</td>
                        <td className="py-2 px-4">{item.author}</td>
                        <td className="py-2 px-4">{item.parish}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.category === 'Événement' ? 'bg-blue-100 text-blue-800' :
                            item.category === 'Formation' ? 'bg-green-100 text-green-800' :
                            item.category === 'Charité' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="py-2 px-4">{new Date(item.date).toLocaleDateString('fr-FR')}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'Publié' ? 'bg-green-100 text-green-800' :
                            item.status === 'Brouillon' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
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
              <div className="text-center text-blue-900/60 py-8">Aucune actualité trouvée dans ce diocèse.</div>
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
