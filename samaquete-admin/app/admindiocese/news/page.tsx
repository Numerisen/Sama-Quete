"use client"
export const dynamic = "force-dynamic"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Calendar, Megaphone, Eye, User } from "lucide-react"
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
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
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
    const matchSearch = n.title?.toLowerCase().includes(search.toLowerCase()) || 
                       n.content?.toLowerCase().includes(search.toLowerCase()) ||
                       n.author?.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === "all" || n.category === categoryFilter
    const matchStatus = statusFilter === "all" || n.status === statusFilter
    return matchSearch && matchCategory && matchStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedNews = filteredNews.slice(startIndex, endIndex)

  // Réinitialiser la page courante quand les filtres changent
  useEffect(() => {
    setCurrentPage(1)
  }, [search, categoryFilter, statusFilter, news])

  // Fonctions de modification et suppression supprimées - Mode consultation uniquement

  const categories = ["Événement", "Formation", "Charité", "Liturgie", "Communauté"]
  const statuses = ["Publié", "Brouillon", "Archivé"]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Liste des actualités */}
      <Card className="shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-black mb-1">
              Actualités - {diocese}
            </CardTitle>
            <p className="text-black/80 text-sm">
              Consultez les actualités de votre diocèse.
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
              value={categoryFilter} 
              onChange={e => setCategoryFilter(e.target.value)} 
              className="h-10 rounded px-2 border-blue-200 bg-white/90 text-black"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(category => <option key={category} value={category}>{category}</option>)}
            </select>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)} 
              className="h-10 rounded px-2 border-blue-200 bg-white/90 text-black"
            >
              <option value="all">Tous les statuts</option>
              {statuses.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
            {/* Boutons d'action supprimés - Mode consultation uniquement */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="text-black/80 text-sm bg-blue-50">
                  <th className="py-3 px-4 text-black">Titre</th>
                  <th className="py-3 px-4 text-black">Catégorie</th>
                  <th className="py-3 px-4 text-black">Auteur</th>
                  <th className="py-3 px-4 text-black">Statut</th>
                  <th className="py-3 px-4 text-black">Date</th>
                  <th className="py-3 px-4 text-black">Vues</th>
                  {/* Colonne Actions supprimée - Mode consultation uniquement */}
                </tr>
              </thead>
              <tbody>
                {paginatedNews.map((article, i) => (
                  <motion.tr
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="border-b last:border-0 hover:bg-blue-50/40"
                  >
                    {/* Mode consultation uniquement - Pas d'édition ni suppression */}
                    <td className="py-2 px-4 font-semibold text-black">{article.title || 'N/A'}</td>
                    <td className="py-2 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {article.category || 'N/A'}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-black">{article.author || 'N/A'}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        article.status === 'Publié' ? 'bg-green-100 text-green-800' :
                        article.status === 'Brouillon' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {article.status || 'N/A'}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-black">{article.date || 'N/A'}</td>
                    <td className="py-2 px-4 text-black">{article.views || 0}</td>
                    {/* Actions supprimées - Mode consultation uniquement */}
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {paginatedNews.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Megaphone className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune actualité trouvée</h3>
                <p className="text-gray-600 mb-6">
                  {news.length === 0 
                    ? `Aucune actualité n'est enregistrée dans Firestore pour le diocèse ${diocese}.`
                    : "Aucune actualité ne correspond à vos critères de recherche."
                  }
                </p>
                {/* Bouton de création supprimé - Mode consultation uniquement */}
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