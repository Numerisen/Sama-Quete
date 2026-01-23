"use client"
export const dynamic = "force-dynamic"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Download, Flame, Image as ImageIcon, Megaphone, Star } from "lucide-react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Pagination } from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"
import { NewsService } from "@/lib/firestore-services"

// Données initiales supprimées - Utilisation uniquement des données Firestore

export default function AdminDioceseNewsPage() {
  const searchParams = useSearchParams()
  const diocese = searchParams.get('diocese') || 'Diocèse de Thiès'
  const { toast } = useToast()
  
  const [news, setNews] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Charger les actualités depuis Firestore
  useEffect(() => {
    const loadNews = async () => {
      try {
        const firestoreNews = await NewsService.getAll()
        const dioceseNews = firestoreNews
          .filter(n => (n.diocese || "") === diocese)
          .map(n => ({
            id: n.id!,
            title: n.title,
            excerpt: n.excerpt,
            date: n.date,
            category: n.category,
            priority: n.priority,
            image: n.image,
            published: n.published,
          }))
        setNews(dioceseNews)
      } catch (error) {
        console.error('Erreur lors du chargement des actualités:', error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les actualités",
          variant: "destructive",
        })
        setNews([])
      }
    }
    loadNews()
  }, [diocese, toast])

  // Filtres et recherche
  const filteredNews = news.filter(n => {
    const matchSearch = (n.title || "").toLowerCase().includes(search.toLowerCase()) ||
                       (n.excerpt || "").toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === "all" || n.category === categoryFilter
    const matchPriority = priorityFilter === "all" || n.priority === priorityFilter
    return matchSearch && matchCategory && matchPriority
  })

  // Pagination
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedNews = filteredNews.slice(startIndex, endIndex)

  // Réinitialiser la page courante quand les filtres changent
  useEffect(() => {
    setCurrentPage(1)
  }, [search, categoryFilter, priorityFilter, news])

  // Fonctions de modification et suppression supprimées - Mode consultation uniquement

  const categories = ["Événement", "Solidarité", "Formation", "Groupe", "Information"]
  const priorities = [
    { value: "high", label: "Haute" },
    { value: "medium", label: "Moyenne" },
    { value: "low", label: "Basse" },
  ]

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <Flame className="w-4 h-4 text-black inline-block mr-1" />
      case "medium":
        return <Star className="w-4 h-4 text-black inline-block mr-1" />
      case "low":
      default:
        return <Megaphone className="w-4 h-4 text-black inline-block mr-1" />
    }
  }

  const exportToCSV = (items: any[]) => {
    const header = ["Titre", "Extrait", "Date", "Catégorie", "Priorité", "Publié"]
    const rows = items.map(n => [n.title, n.excerpt, n.date, n.category, n.priority, n.published ? "oui" : "non"])
    const csvContent = [header, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "actualites-diocese.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
              value={priorityFilter} 
              onChange={e => setPriorityFilter(e.target.value)} 
              className="h-10 rounded px-2 border-blue-200 bg-white/90 text-black"
            >
              <option value="all">Toutes les priorités</option>
              {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <button
              onClick={() => exportToCSV(filteredNews)}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white/90 px-3 py-2 text-black hover:bg-blue-50"
              type="button"
            >
              <Download className="w-5 h-5" /> Export CSV
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="text-black/80 text-sm bg-blue-50">
                  <th className="py-3 px-4 text-black">Image</th>
                  <th className="py-3 px-4 text-black">Titre</th>
                  <th className="py-3 px-4 text-black">Extrait</th>
                  <th className="py-3 px-4 text-black">Date</th>
                  <th className="py-3 px-4 text-black">Catégorie</th>
                  <th className="py-3 px-4 text-black">Priorité</th>
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
                    <td className="py-2 px-4">
                      {article.image ? (
                        <img src={article.image} alt={article.title} className="w-16 h-16 object-cover rounded-xl border-2 border-blue-200 shadow" />
                      ) : (
                        <ImageIcon className="w-10 h-10 text-gray-500" />
                      )}
                    </td>
                    <td className="py-2 px-4 font-semibold text-black">{article.title || 'N/A'}</td>
                    <td className="py-2 px-4 text-black">{article.excerpt || 'N/A'}</td>
                    <td className="py-2 px-4 text-black">{article.date || 'N/A'}</td>
                    <td className="py-2 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {article.category || 'N/A'}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <span className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                        {getPriorityIcon(article.priority)}
                        {priorities.find(p => p.value === article.priority)?.label || article.priority || "N/A"}
                      </span>
                    </td>
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