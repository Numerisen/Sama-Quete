"use client"
import { useState, useEffect, ChangeEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, Download, MapPin, UserCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const initialDioceses = [
  {
    id: 1,
    name: "Archidiocèse de Dakar",
    city: "Dakar",
    type: "Archevêché métropolitain",
    bishop: "Mgr Benjamin Ndiaye",
    email: "contact@archidiocesedakar.sn",
    phone: "+221 33 821 14 14",
  },
  {
    id: 2,
    name: "Diocèse de Thiès",
    city: "Thiès",
    type: "Diocèse",
    bishop: "Mgr André Gueye",
    email: "contact@diocesethies.sn",
    phone: "+221 33 951 12 34",
  },
  {
    id: 3,
    name: "Diocèse de Kaolack",
    city: "Kaolack",
    type: "Diocèse",
    bishop: "Mgr Martin Boucar Tine",
    email: "contact@diocesekaolack.sn",
    phone: "+221 33 941 23 45",
  },
  {
    id: 4,
    name: "Diocèse de Ziguinchor",
    city: "Ziguinchor",
    type: "Diocèse",
    bishop: "Mgr Paul Abel Mamba",
    email: "contact@dioceseziguinchor.sn",
    phone: "+221 33 991 34 56",
  },
  {
    id: 5,
    name: "Diocèse de Kolda",
    city: "Kolda",
    type: "Diocèse",
    bishop: "Mgr Jean-Pierre Bassène",
    email: "contact@diocesekolda.sn",
    phone: "+221 33 991 45 67",
  },
  {
    id: 6,
    name: "Diocèse de Tambacounda",
    city: "Tambacounda",
    type: "Diocèse",
    bishop: "Mgr Paul Abel Mamba",
    email: "contact@diocesetambacounda.sn",
    phone: "+221 33 991 56 78",
  },
  {
    id: 7,
    name: "Diocèse de Saint-Louis du Sénégal",
    city: "Saint-Louis",
    type: "Diocèse",
    bishop: "Mgr Ernest Sambou",
    email: "contact@diocesestlouis.sn",
    phone: "+221 33 991 67 89",
  },
]

function exportToCSV(dioceses: any[]) {
  const header = ["Nom", "Ville", "Type", "Évêque", "Email", "Téléphone"]
  const rows = dioceses.map(d => [d.name, d.city, d.type, d.bishop, d.email, d.phone])
  const csvContent = [header, ...rows].map(e => e.join(",")).join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", "dioceses.csv")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default function AdminDiocesesPage() {
  const [dioceses, setDioceses] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<any>({ name: "", city: "", type: "Diocèse", bishop: "", email: "", phone: "" })

  // Initialisation depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem("admin_dioceses")
    if (stored) {
      setDioceses(JSON.parse(stored))
    } else {
      setDioceses(initialDioceses)
      localStorage.setItem("admin_dioceses", JSON.stringify(initialDioceses))
    }
  }, [])
  // Sauvegarde à chaque modification
  useEffect(() => {
    if (dioceses.length > 0) {
      localStorage.setItem("admin_dioceses", JSON.stringify(dioceses))
    }
  }, [dioceses])

  // Filtres et recherche
  const filteredDioceses = dioceses.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.city.toLowerCase().includes(search.toLowerCase()) ||
    d.bishop.toLowerCase().includes(search.toLowerCase())
  )

  // Suppression
  const handleDelete = (id: number) => {
    if (window.confirm("Confirmer la suppression de ce diocèse ?")) {
      setDioceses(dioceses.filter(d => d.id !== id))
    }
  }
  // Edition inline
  const handleEdit = (item: any) => {
    setEditId(item.id)
    setEditForm({ ...item })
  }
  const handleEditChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }
  const handleEditSave = (id: number) => {
    setDioceses(dioceses.map(d => d.id === id ? { ...editForm, id } : d))
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
            <CardTitle className="text-3xl font-bold text-blue-900 mb-1">Gestion des diocèses</CardTitle>
            <p className="text-blue-800/80 text-sm">Gérez les diocèses du Sénégal, leurs évêques et informations clés.</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 w-40 bg-white/90 border-gray-200"
            />
            <Button onClick={() => exportToCSV(filteredDioceses)} variant="outline" className="flex items-center gap-2 text-blue-900 border-blue-200 bg-white/90 hover:bg-blue-50 rounded-xl px-3 py-2">
              <Download className="w-5 h-5" /> Export CSV
            </Button>
            <Link href="/admin/dioceses/create">
              <Button className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white shadow-lg rounded-xl px-4 py-2">
                <Plus className="w-5 h-5" /> Nouveau diocèse
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="text-blue-900/80 text-sm bg-blue-50">
                  <th className="py-3 px-4">Nom</th>
                  <th className="py-3 px-4">Ville</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Évêque</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Téléphone</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDioceses.map((item, i) => (
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
                          <Input name="city" value={editForm.city} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <Input name="type" value={editForm.type} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <Input name="bishop" value={editForm.bishop} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <Input name="email" value={editForm.email} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <Input name="phone" value={editForm.phone} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4 text-right flex gap-2 justify-end">
                          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => handleEditSave(item.id)}>Enregistrer</Button>
                          <Button size="sm" variant="ghost" className="rounded-lg" onClick={handleEditCancel}>Annuler</Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-4 font-semibold text-blue-900">{item.name}</td>
                        <td className="py-2 px-4">{item.city}</td>
                        <td className="py-2 px-4">{item.type}</td>
                        <td className="py-2 px-4">{item.bishop}</td>
                        <td className="py-2 px-4">{item.email}</td>
                        <td className="py-2 px-4">{item.phone}</td>
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
            {filteredDioceses.length === 0 && (
              <div className="text-center text-blue-900/60 py-8">Aucun diocèse trouvé.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
