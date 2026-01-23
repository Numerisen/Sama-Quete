"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Diocese, ParishService } from "@/lib/parish-service"
import { motion } from "framer-motion"
import { Download, Edit, Loader2, Plus, Trash2, Church } from "lucide-react"
import Link from "next/link"
import { ChangeEvent, useEffect, useState } from "react"
import { toast } from "sonner"

// Données initiales supprimées - Utilisation uniquement des données Firestore

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
  const [dioceses, setDioceses] = useState<Diocese[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<any>({ name: "", city: "", type: "Diocèse", bishop: "", email: "", phone: "", address: "" })

  // Chargement des données depuis Firebase
  useEffect(() => {
    loadDioceses()
  }, [])

  const loadDioceses = async () => {
    try {
      setLoading(true)
      const diocesesData = await ParishService.getDioceses()
      setDioceses(diocesesData)
    } catch (error) {
      console.error("Erreur lors du chargement des diocèses:", error)
      toast.error("Erreur lors du chargement des diocèses")
    } finally {
      setLoading(false)
    }
  }

  // Filtres et recherche
  const filteredDioceses = dioceses.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.city.toLowerCase().includes(search.toLowerCase()) ||
    d.bishop.toLowerCase().includes(search.toLowerCase())
  )

  // Suppression
  const handleDelete = async (id: string) => {
    if (window.confirm("Confirmer la suppression de ce diocèse ?")) {
      try {
        const success = await ParishService.deleteDiocese(id)
        if (success) {
          setDioceses(dioceses.filter(d => d.id !== id))
          toast({
          title: "Diocèse supprimé",
          description: "Le diocèse a été supprimé avec succès"
        })
        } else {
          toast({
          title: "Erreur",
          description: "Erreur lors de la suppression du diocèse",
          variant: "destructive"
        })
        }
      } catch (error) {
        console.error("Erreur:", error)
        toast({
          title: "Erreur",
          description: "Erreur lors de la suppression",
          variant: "destructive"
        })
      }
    }
  }

  // Edition inline
  const handleEdit = (item: Diocese) => {
    setEditId(item.id)
    setEditForm({ 
      name: item.name,
      city: item.city,
      type: item.type,
      bishop: item.bishop,
      email: item.contactInfo?.email || "",
      phone: item.contactInfo?.phone || "",
      address: item.contactInfo?.address || ""
    })
  }

  const handleEditChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleEditSave = async (id: string) => {
    try {
      const success = await ParishService.updateDiocese(id, {
        name: editForm.name,
        city: editForm.city,
        type: editForm.type,
        bishop: editForm.bishop,
        contactInfo: {
          email: editForm.email,
          phone: editForm.phone,
          address: editForm.address
        }
      })
      
      if (success) {
        setEditId(null)
        toast({
          title: "Diocèse modifié",
          description: "Le diocèse a été modifié avec succès"
        })
        loadDioceses() // Recharger les données
      } else {
        toast({
          title: "Erreur",
          description: "Erreur lors de la modification",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast({
          title: "Erreur",
          description: "Erreur lors de la modification",
          variant: "destructive"
        })
    }
  }

  const handleEditCancel = () => {
    setEditId(null)
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-black" />
            <p className="text-black">Chargement des diocèses...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="mb-8 shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-black mb-1">Gestion des diocèses</CardTitle>
            <p className="text-black/80 text-sm">Gérez les diocèses du Sénégal, leurs évêques et informations clés.</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 w-40 bg-white/90 border-blue-200"
            />
            <Button onClick={() => exportToCSV(filteredDioceses)} variant="outline" className="flex items-center gap-2 text-black border-blue-200 bg-white/90 hover:bg-blue-50 rounded-xl px-3 py-2">
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
                <tr className="text-black/80 text-sm bg-blue-50">
                  <th className="py-3 px-4 text-black">Nom</th>
                  <th className="py-3 px-4 text-black">Ville</th>
                  <th className="py-3 px-4 text-black">Type</th>
                  <th className="py-3 px-4 text-black">Évêque</th>
                  <th className="py-3 px-4 text-black">Email</th>
                  <th className="py-3 px-4 text-black">Téléphone</th>
                  <th className="py-3 px-4 text-right text-black">Actions</th>
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
                        <td className="py-2 px-4 font-semibold text-black">
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
                        <td className="py-2 px-4 font-semibold text-black">{item.name}</td>
                        <td className="py-2 px-4 text-black">{item.city}</td>
                        <td className="py-2 px-4 text-black">{item.type}</td>
                        <td className="py-2 px-4 text-black">{item.bishop}</td>
                        <td className="py-2 px-4 text-black">{item.contactInfo?.email || "-"}</td>
                        <td className="py-2 px-4 text-black">{item.contactInfo?.phone || "-"}</td>
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
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Church className="w-12 h-12 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun diocèse trouvé</h3>
                <p className="text-gray-600 mb-6">
                  {dioceses.length === 0 
                    ? "Aucun diocèse n'est enregistré dans Firestore pour le moment."
                    : "Aucun diocèse ne correspond à vos critères de recherche."
                  }
                </p>
                {dioceses.length === 0 && (
                  <Link href="/admin/dioceses/create">
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Créer le premier diocèse
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
