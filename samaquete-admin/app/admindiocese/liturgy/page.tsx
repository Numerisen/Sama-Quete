"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, Calendar, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Pagination } from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"

// Données initiales supprimées - Utilisation uniquement des données Firestore

export default function AdminDioceseLiturgyPage() {
  const searchParams = useSearchParams()
  const diocese = searchParams.get('diocese') || 'Diocèse de Thiès'
  const { toast } = useToast()
  
  const [liturgy, setLiturgy] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Charger la liturgie depuis Firestore
  useEffect(() => {
    const loadLiturgy = async () => {
      try {
        // TODO: Implémenter le chargement depuis Firestore
        // const firestoreLiturgy = await LiturgyService.getAll()
        // const dioceseLiturgy = firestoreLiturgy.filter(l => l.diocese === diocese)
        // setLiturgy(dioceseLiturgy)
        setLiturgy([]) // Aucune donnée pour le moment
      } catch (error) {
        console.error('Erreur lors du chargement de la liturgie:', error)
        setLiturgy([])
      }
    }
    loadLiturgy()
  }, [diocese])

  // Filtres et recherche
  const filteredLiturgy = liturgy.filter(l => {
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase()) || 
                       l.parish.toLowerCase().includes(search.toLowerCase()) ||
                       l.celebrant.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === "all" || l.type === typeFilter
    return matchSearch && matchType
  })

  // Pagination
  const totalPages = Math.ceil(filteredLiturgy.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedLiturgy = filteredLiturgy.slice(startIndex, endIndex)

  // Réinitialiser la page courante quand les filtres changent
  useEffect(() => {
    setCurrentPage(1)
  }, [search, typeFilter, liturgy])

  // Suppression
  const handleDelete = (id: number) => {
    if (window.confirm("Confirmer la suppression de cette célébration ?")) {
      setLiturgy(liturgy.filter(l => l.id !== id))
      toast({
          title: "Célébration supprimée",
          description: "La célébration a été supprimée avec succès"
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
    setLiturgy(liturgy.map(l => l.id === id ? { ...editForm, id } : l))
    setEditId(null)
    toast({
          title: "Célébration modifiée",
          description: "La célébration a été modifiée avec succès"
        })
  }

  const handleEditCancel = () => {
    setEditId(null)
  }

  const types = ["Messe", "Adoration", "Vêpres", "Confession", "Baptême", "Mariage", "Autre"]

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="mb-8 shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-black mb-1">
              Gestion de la liturgie - {diocese}
            </CardTitle>
            <p className="text-black/80 text-sm">
              Gérez les célébrations et événements liturgiques de votre diocèse.
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
              value={typeFilter} 
              onChange={e => setTypeFilter(e.target.value)} 
              className="h-10 rounded px-2 border-blue-200 bg-white/90 text-black"
            >
              <option value="all">Tous les types</option>
              {types.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <Link href={`/admindiocese/liturgy/create?diocese=${encodeURIComponent(diocese)}`}>
              <Button className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white shadow-lg rounded-xl px-4 py-2">
                <Plus className="w-5 h-5" /> Nouvelle célébration
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
                  <th className="py-3 px-4 text-black">Type</th>
                  <th className="py-3 px-4 text-black">Paroisse</th>
                  <th className="py-3 px-4 text-black">Date</th>
                  <th className="py-3 px-4 text-black">Heure</th>
                  <th className="py-3 px-4 text-black">Célébrant</th>
                  <th className="py-3 px-4 text-right text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLiturgy.map((item, i) => (
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
                          <select name="type" value={editForm.type} onChange={handleEditChange} className="h-8 rounded px-2 border-blue-200 bg-white/90 text-black">
                            {types.map(type => <option key={type} value={type}>{type}</option>)}
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <Input name="parish" value={editForm.parish} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <Input name="date" type="date" value={editForm.date} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <Input name="time" type="time" value={editForm.time} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <Input name="celebrant" value={editForm.celebrant} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4 text-right flex gap-2 justify-end">
                          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => handleEditSave(item.id)}>Enregistrer</Button>
                          <Button size="sm" variant="ghost" className="rounded-lg" onClick={handleEditCancel}>Annuler</Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-4 font-semibold text-black">{item.title}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.type === 'Messe' ? 'bg-blue-100 text-black' :
                            item.type === 'Adoration' ? 'bg-blue-100 text-black' :
                            'bg-blue-100 text-black'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-black">{item.parish}</td>
                        <td className="py-2 px-4 text-black">{new Date(item.date).toLocaleDateString('fr-FR')}</td>
                        <td className="py-2 px-4 text-black">{item.time}</td>
                        <td className="py-2 px-4 text-black">{item.celebrant}</td>
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
            {paginatedLiturgy.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-12 h-12 text-indigo-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune célébration trouvée</h3>
                <p className="text-gray-600 mb-6">
                  {liturgy.length === 0 
                    ? `Aucune célébration n'est enregistrée dans Firestore pour le diocèse ${diocese}.`
                    : "Aucune célébration ne correspond à vos critères de recherche."
                  }
                </p>
                {liturgy.length === 0 && (
                  <Link href="/admindiocese/liturgy/create">
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Créer la première célébration
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredLiturgy.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredLiturgy.length}
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
