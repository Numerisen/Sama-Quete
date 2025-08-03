"use client"
import { useState, useEffect, ChangeEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, Download, MapPin, UserCircle, Users } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const diocesesList = [
  "Archidiocèse de Dakar",
  "Diocèse de Thiès",
  "Diocèse de Kaolack",
  "Diocèse de Ziguinchor",
  "Diocèse de Kolda",
  "Diocèse de Tambacounda",
  "Diocèse de Saint-Louis du Sénégal",
]

const initialParishes = [
  {
    id: 1,
    name: "Paroisse Saint-Joseph de Medina",
    diocese: "Archidiocèse de Dakar",
    city: "Dakar",
    cure: "Père Jean Sarr",
    vicaire: "Père Paul Diouf",
    catechists: "Sœur Marie, M. Ndiaye",
  
  },
  {
    id: 2,
    name: "Paroisse Sainte-Anne de Thiès",
    diocese: "Diocèse de Thiès",
    city: "Thiès",
    cure: "Père André Faye",
    vicaire: "",
    catechists: "M. Fall, Mme Diop",
  },
  {
    id: 3,
    name: "Paroisse Sacré-Cœur de Kaolack",
    diocese: "Diocèse de Kaolack",
    city: "Kaolack",
    cure: "Père Martin Sagna",
    vicaire: "Père Luc Badiane",
    catechists: "Mme Sarr",
  },
]

function exportToCSV(parishes: any[]) {
  const header = ["Nom", "Diocèse", "Ville", "Curé", "Vicaire", "Catéchistes"]
  const rows = parishes.map(p => [p.name, p.diocese, p.city, p.cure, p.vicaire, p.catechists])
  const csvContent = [header, ...rows].map(e => e.join(",")).join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", "paroisses.csv")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default function AdminParishesPage() {
  const [parishes, setParishes] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [dioceseFilter, setDioceseFilter] = useState("all")
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<any>({ name: "", diocese: diocesesList[0], city: "", cure: "", vicaire: "", catechists: "" })

  // Initialisation depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem("admin_parishes")
    if (stored) {
      setParishes(JSON.parse(stored))
    } else {
      setParishes(initialParishes)
      localStorage.setItem("admin_parishes", JSON.stringify(initialParishes))
    }
  }, [])
  // Sauvegarde à chaque modification
  useEffect(() => {
    if (parishes.length > 0) {
      localStorage.setItem("admin_parishes", JSON.stringify(parishes))
    }
  }, [parishes])

  // Filtres et recherche
  const filteredParishes = parishes.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase()) || p.cure.toLowerCase().includes(search.toLowerCase())
    const matchDiocese = dioceseFilter === "all" || p.diocese === dioceseFilter
    return matchSearch && matchDiocese
  })

  // Suppression
  const handleDelete = (id: number) => {
    if (window.confirm("Confirmer la suppression de cette paroisse ?")) {
      setParishes(parishes.filter(p => p.id !== id))
    }
  }
  // Edition inline
  const handleEdit = (item: any) => {
    setEditId(item.id)
    setEditForm({ ...item })
  }
  const handleEditChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }
  const handleEditSave = (id: number) => {
    setParishes(parishes.map(p => p.id === id ? { ...editForm, id } : p))
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
            <CardTitle className="text-3xl font-bold text-blue-900 mb-1">Gestion des paroisses</CardTitle>
            <p className="text-blue-800/80 text-sm">Gérez les paroisses, curés, vicaires, catéchistes et communautés.</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 w-40 bg-white/90 border-gray-200"
            />
            <select value={dioceseFilter} onChange={e => setDioceseFilter(e.target.value)} className="h-10 rounded px-2 border-gray-200 bg-white/90 text-blue-900">
              <option value="all">Tous les diocèses</option>
              {diocesesList.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <Button onClick={() => exportToCSV(filteredParishes)} variant="outline" className="flex items-center gap-2 text-blue-900 border-blue-200 bg-white/90 hover:bg-blue-50 rounded-xl px-3 py-2">
              <Download className="w-5 h-5" /> Export CSV
            </Button>
            <Link href="/admin/paroisses/create">
              <Button className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white shadow-lg rounded-xl px-4 py-2">
                <Plus className="w-5 h-5" /> Nouvelle paroisse
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="text-blue-900/80 text-sm bg-blue-50">
                  <th className="py-3 px-4">Nom</th>
                  <th className="py-3 px-4">Diocèse</th>
                  <th className="py-3 px-4">Ville</th>
                  <th className="py-3 px-4">Curé</th>
                  <th className="py-3 px-4">Vicaire</th>
                  <th className="py-3 px-4">Catéchistes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParishes.map((item, i) => (
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
                          <Input name="name" value={editForm.name} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <select name="diocese" value={editForm.diocese} onChange={handleEditChange} className="h-8 rounded px-2 border-gray-200 bg-white/90 text-blue-900">
                            {diocesesList.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <Input name="city" value={editForm.city} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <Input name="cure" value={editForm.cure} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <Input name="vicaire" value={editForm.vicaire} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <Input name="catechists" value={editForm.catechists} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4 text-right flex gap-2 justify-end">
                          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => handleEditSave(item.id)}>Enregistrer</Button>
                          <Button size="sm" variant="ghost" className="rounded-lg" onClick={handleEditCancel}>Annuler</Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-4 font-semibold text-blue-900">{item.name}</td>
                        <td className="py-2 px-4">{item.diocese}</td>
                        <td className="py-2 px-4">{item.city}</td>
                        <td className="py-2 px-4">{item.cure}</td>
                        <td className="py-2 px-4">{item.vicaire}</td>
                        <td className="py-2 px-4">{item.catechists}</td>
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
            {filteredParishes.length === 0 && (
              <div className="text-center text-blue-900/60 py-8">Aucune paroisse trouvée.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 