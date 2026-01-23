"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Image as ImageIcon, Star, Flame, Megaphone } from "lucide-react"
import { motion } from "framer-motion"
import { NewsService, NewsItem } from "@/lib/firestore-services"
import { useToast } from "@/hooks/use-toast"

const categories = [
  { value: "all", label: "Toutes les catégories" },
  { value: "Événement", label: "Événement" },
  { value: "Solidarité", label: "Solidarité" },
  { value: "Formation", label: "Formation" },
  { value: "Groupe", label: "Groupe" },
  { value: "Information", label: "Information" },
]
const priorities = [
  { value: "all", label: "Toutes les priorités" },
  { value: "high", label: "Haute" },
  { value: "medium", label: "Moyenne" },
  { value: "low", label: "Basse" },
]

// Données initiales supprimées - Utilisation uniquement des données Firestore

function getCategoryColor(category: string) {
  switch (category) {
    case "Événement":
      return "bg-blue-100 text-black"
    case "Solidarité":
      return "bg-green-100 text-black"
    case "Formation":
      return "bg-purple-100 text-black"
    case "Groupe":
      return "bg-amber-100 text-amber-700"
    case "Information":
      return "bg-gray-100 text-black"
    default:
      return "bg-gray-100 text-black"
  }
}
function getPriorityIcon(priority: string) {
  switch (priority) {
    case "high":
      return <Flame className="w-4 h-4 text-black inline-block mr-1" />
    case "medium":
      return <Star className="w-4 h-4 text-black inline-block mr-1" />
    case "low":
      return <Megaphone className="w-4 h-4 text-black inline-block mr-1" />
    default:
      return <Megaphone className="w-4 h-4 text-black inline-block mr-1" />
  }
}

function exportToCSV(news: any[]) {
  const header = ["Titre", "Extrait", "Date", "Heure", "Lieu", "Catégorie", "Priorité"]
  const rows = news.map(n => [n.title, n.excerpt, n.date, n.time, n.location, n.category, n.priority])
  const csvContent = [header, ...rows].map(e => e.join(",")).join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", "actualites.csv")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default function AdminNewsPage() {
  const [news, setNews] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Charger les actualités depuis Firestore
  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true)
        const firestoreNews = await NewsService.getAll()
        
        // Utiliser uniquement les données Firestore, pas de données fictives
        const convertedNews = firestoreNews.map(news => ({
          id: news.id!,
          title: news.title,
          excerpt: news.excerpt,
          content: news.content,
          date: news.date,
          time: news.time,
          location: news.location,
          category: news.category,
          priority: news.priority,
          image: news.image,
          diocese: news.diocese,
          published: news.published
        }))
        setNews(convertedNews)
      } catch (error) {
        console.error('Erreur lors du chargement des actualités:', error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les actualités",
          variant: "destructive"
        })
        setNews([]) // Aucune donnée en cas d'erreur
      } finally {
        setLoading(false)
      }
    }

    loadNews()
  }, [toast])

  // S'abonner aux changements en temps réel
  useEffect(() => {
    const unsubscribe = NewsService.subscribeToNews((firestoreNews) => {
      const convertedNews = firestoreNews.map(news => ({
        id: news.id!,
        title: news.title,
        excerpt: news.excerpt,
        content: news.content,
        date: news.date,
        time: news.time,
        location: news.location,
        category: news.category,
        priority: news.priority,
        image: news.image,
        diocese: news.diocese,
        published: news.published
      }))
      setNews(convertedNews)
    })

    return () => unsubscribe()
  }, [])

  // Filtres combinés
  const filteredNews = news.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.excerpt.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === "all" || n.category === categoryFilter
    const matchPrio = priorityFilter === "all" || n.priority === priorityFilter
    return matchSearch && matchCat && matchPrio
  })

  // Lecture seule (super_admin) : pas de CRUD sur les actualités

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="mb-8 shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-black mb-1">Gestion des actualités</CardTitle>
            <p className="text-black/80 text-sm">Consultation des actualités (lecture seule).</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 w-40 bg-white/90 border-gray-200"
            />
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="h-10 rounded px-2 border-gray-200 bg-white/90 text-black">
              {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="h-10 rounded px-2 border-gray-200 bg-white/90 text-black">
              {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <Button onClick={() => exportToCSV(filteredNews)} variant="outline" className="flex items-center gap-2 text-black border-green-200 bg-white/90 hover:bg-green-50 rounded-xl px-3 py-2">
              <Download className="w-5 h-5" /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-black">Chargement des actualités...</div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="text-black/80 text-sm bg-green-50">
                    <th className="py-3 px-4 text-black">Image</th>
                    <th className="py-3 px-4 text-black">Titre</th>
                    <th className="py-3 px-4 text-black">Extrait</th>
                    <th className="py-3 px-4 text-black">Date</th>
                    <th className="py-3 px-4 text-black">Catégorie</th>
                    <th className="py-3 px-4 text-black">Priorité</th>
                    {/* Lecture seule: pas d'actions */}
                  </tr>
                </thead>
                <tbody>
                  {filteredNews.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="border-b last:border-0 hover:bg-green-50/40"
                  >
                    <td className="py-2 px-4">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded-xl border-2 border-green-200 shadow" />
                      ) : (
                        <ImageIcon className="w-10 h-10 text-gray-500" />
                      )}
                    </td>
                    <td className="py-2 px-4 font-semibold text-black">{item.title}</td>
                    <td className="py-2 px-4 text-black">{item.excerpt}</td>
                    <td className="py-2 px-4 text-black">{item.date}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(item.category)}`}>{item.category}</span>
                    </td>
                    <td className="py-2 px-4">
                      <span className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                        {getPriorityIcon(item.priority)}
                        {priorities.find(p => p.value === item.priority)?.label}
                      </span>
                    </td>
                  </motion.tr>
                ))}
                </tbody>
              </table>
              {filteredNews.length === 0 && (
                <div className="text-center text-black/60 py-8">Aucune actualité trouvée.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
