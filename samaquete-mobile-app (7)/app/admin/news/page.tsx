"use client"
import { useState, useEffect, ChangeEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, Download, Image as ImageIcon, Star, Flame, Megaphone } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

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

const initialNews = [
  {
    id: 1,
    title: "Célébration de la Journée Mondiale de la Jeunesse",
    excerpt: "Rejoignez-nous pour une journée spéciale dédiée aux jeunes de notre paroisse avec des activités spirituelles et culturelles.",
    date: "25 Janvier 2024",
    time: "14:00",
    location: "Salle paroissiale",
    category: "Événement",
    image: "/placeholder.svg?height=200&width=300",
    priority: "high",
  },
  {
    id: 2,
    title: "Collecte pour les familles nécessiteuses",
    excerpt: "Notre paroisse organise une collecte de vivres et de vêtements pour soutenir les familles en difficulté de notre communauté.",
    date: "20 Janvier 2024",
    time: "Après chaque messe",
    location: "Entrée de l'église",
    category: "Solidarité",
    image: "/placeholder.svg?height=200&width=300",
    priority: "medium",
  },
  {
    id: 3,
    title: "Retraite spirituelle de Carême",
    excerpt: "Préparez-vous au temps du Carême avec une retraite spirituelle de trois jours animée par le Père Antoine Diop.",
    date: "10 Février 2024",
    time: "09:00 - 17:00",
    location: "Centre spirituel",
    category: "Formation",
    image: "/placeholder.svg?height=200&width=300",
    priority: "high",
  },
  {
    id: 4,
    title: "Nouveau groupe de prière des mères",
    excerpt: "Formation d'un nouveau groupe de prière dédié aux mères de famille. Première rencontre le samedi prochain.",
    date: "27 Janvier 2024",
    time: "16:00",
    location: "Salle de catéchèse",
    category: "Groupe",
    image: "/placeholder.svg?height=200&width=300",
    priority: "medium",
  },
  {
    id: 5,
    title: "Travaux de rénovation de l'église",
    excerpt: "Début des travaux de rénovation de la toiture de l'église. Merci pour votre patience et vos contributions.",
    date: "15 Janvier 2024",
    time: "08:00",
    location: "Église principale",
    category: "Information",
    image: "/placeholder.svg?height=200&width=300",
    priority: "low",
  },
]

function getCategoryColor(category: string) {
  switch (category) {
    case "Événement":
      return "bg-blue-100 text-blue-700"
    case "Solidarité":
      return "bg-green-100 text-green-700"
    case "Formation":
      return "bg-purple-100 text-purple-700"
    case "Groupe":
      return "bg-amber-100 text-amber-700"
    case "Information":
      return "bg-gray-100 text-gray-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}
function getPriorityIcon(priority: string) {
  switch (priority) {
    case "high":
      return <Flame className="w-4 h-4 text-red-500 inline-block mr-1" />
    case "medium":
      return <Star className="w-4 h-4 text-yellow-500 inline-block mr-1" />
    case "low":
      return <Megaphone className="w-4 h-4 text-blue-400 inline-block mr-1" />
    default:
      return <Megaphone className="w-4 h-4 text-blue-400 inline-block mr-1" />
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
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<any>({ title: "", excerpt: "", date: "", time: "", location: "", category: "Événement", priority: "medium", image: "" })

  // Initialisation depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem("admin_news")
    if (stored) {
      setNews(JSON.parse(stored))
    } else {
      setNews(initialNews)
      localStorage.setItem("admin_news", JSON.stringify(initialNews))
    }
  }, [])
  // Sauvegarde à chaque modification
  useEffect(() => {
    if (news.length > 0) {
      localStorage.setItem("admin_news", JSON.stringify(news))
    }
  }, [news])

  // Filtres combinés
  const filteredNews = news.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.excerpt.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === "all" || n.category === categoryFilter
    const matchPrio = priorityFilter === "all" || n.priority === priorityFilter
    return matchSearch && matchCat && matchPrio
  })

  // Suppression
  const handleDelete = (id: number) => {
    if (window.confirm("Confirmer la suppression de cette actualité ?")) {
      setNews(news.filter(n => n.id !== id))
    }
  }
  // Edition inline
  const handleEdit = (item: any) => {
    setEditId(item.id)
    setEditForm({ ...item })
  }
  const handleEditChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }
  const handleEditSave = (id: number) => {
    setNews(news.map(n => n.id === id ? { ...editForm, id } : n))
    setEditId(null)
  }
  const handleEditCancel = () => {
    setEditId(null)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="mb-8 shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-green-900 mb-1">Gestion des actualités</CardTitle>
            <p className="text-green-800/80 text-sm">Publiez, modifiez et supprimez les actualités paroissiales.</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 w-40 bg-white/90 border-gray-200"
            />
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="h-10 rounded px-2 border-gray-200 bg-white/90 text-green-900">
              {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="h-10 rounded px-2 border-gray-200 bg-white/90 text-green-900">
              {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <Button onClick={() => exportToCSV(filteredNews)} variant="outline" className="flex items-center gap-2 text-green-900 border-green-200 bg-white/90 hover:bg-green-50 rounded-xl px-3 py-2">
              <Download className="w-5 h-5" /> Export CSV
            </Button>
            <Link href="/admin/news/create">
              <Button className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white shadow-lg rounded-xl px-4 py-2">
                <Plus className="w-5 h-5" /> Nouvelle actu
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="text-green-900/80 text-sm bg-green-50">
                  <th className="py-3 px-4">Image</th>
                  <th className="py-3 px-4">Titre</th>
                  <th className="py-3 px-4">Extrait</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4">Priorité</th>
                  <th className="py-3 px-4 text-right">Actions</th>
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
                        <ImageIcon className="w-10 h-10 text-green-300" />
                      )}
                    </td>
                    {editId === item.id ? (
                      <>
                        <td className="py-2 px-4 font-semibold text-green-900">
                          <Input name="title" value={editForm.title} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4 text-green-800">
                          <textarea name="excerpt" value={editForm.excerpt} onChange={handleEditChange} className="h-8 w-full rounded border border-gray-200 px-2" />
                        </td>
                        <td className="py-2 px-4">
                          <Input name="date" value={editForm.date} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <select name="category" value={editForm.category} onChange={handleEditChange} className="h-8 rounded px-2 border-gray-200 bg-white/90 text-green-900">
                            {categories.filter(c => c.value !== "all").map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <select name="priority" value={editForm.priority} onChange={handleEditChange} className="h-8 rounded px-2 border-gray-200 bg-white/90 text-green-900">
                            {priorities.filter(p => p.value !== "all").map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                          </select>
                        </td>
                        <td className="py-2 px-4 text-right flex gap-2 justify-end">
                          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => handleEditSave(item.id)}>Enregistrer</Button>
                          <Button size="sm" variant="ghost" className="rounded-lg" onClick={handleEditCancel}>Annuler</Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-4 font-semibold text-green-900">{item.title}</td>
                        <td className="py-2 px-4 text-green-800">{item.excerpt}</td>
                        <td className="py-2 px-4">{item.date}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(item.category)}`}>{item.category}</span>
                        </td>
                        <td className="py-2 px-4">
                          <span className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                            {getPriorityIcon(item.priority)}
                            {priorities.find(p => p.value === item.priority)?.label}
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
            {filteredNews.length === 0 && (
              <div className="text-center text-green-900/60 py-8">Aucune actualité trouvée.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
