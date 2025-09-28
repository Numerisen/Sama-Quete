"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, DollarSign, User, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Pagination } from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"

// Données initiales supprimées - Utilisation uniquement des données Firestore

export default function AdminDioceseDonationsPage() {
  const searchParams = useSearchParams()
  const diocese = searchParams.get('diocese') || 'Diocèse de Thiès'
  const { toast } = useToast()
  
  const [donations, setDonations] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Charger les dons depuis Firestore
  useEffect(() => {
    const loadDonations = async () => {
      try {
        // TODO: Implémenter le chargement depuis Firestore
        // const firestoreDonations = await DonationService.getAll()
        // const dioceseDonations = firestoreDonations.filter(d => d.diocese === diocese)
        // setDonations(dioceseDonations)
        setDonations([]) // Aucune donnée pour le moment
      } catch (error) {
        console.error('Erreur lors du chargement des dons:', error)
        setDonations([])
      }
    }
    loadDonations()
  }, [diocese])

  // Filtres et recherche
  const filteredDonations = donations.filter(d => {
    const matchSearch = d.donorName.toLowerCase().includes(search.toLowerCase()) || 
                       d.parish.toLowerCase().includes(search.toLowerCase()) ||
                       d.description.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || d.status === statusFilter
    const matchType = typeFilter === "all" || d.type === typeFilter
    return matchSearch && matchStatus && matchType
  })

  // Pagination
  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedDonations = filteredDonations.slice(startIndex, endIndex)

  // Réinitialiser la page courante quand les filtres changent
  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter, typeFilter, donations])

  // Calcul des statistiques
  const totalAmount = filteredDonations.reduce((sum, d) => sum + d.amount, 0)
  const receivedAmount = filteredDonations.filter(d => d.status === "Reçu").reduce((sum, d) => sum + d.amount, 0)
  const pendingAmount = filteredDonations.filter(d => d.status === "En attente").reduce((sum, d) => sum + d.amount, 0)

  // Suppression
  const handleDelete = (id: number) => {
    if (window.confirm("Confirmer la suppression de cette donation ?")) {
      setDonations(donations.filter(d => d.id !== id))
      toast({
          title: "Donation supprimée",
          description: "La donation a été supprimée avec succès"
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
    setDonations(donations.map(d => d.id === id ? { ...editForm, id } : d))
    setEditId(null)
    toast({
          title: "Donation modifiée",
          description: "La donation a été modifiée avec succès"
        })
  }

  const handleEditCancel = () => {
    setEditId(null)
  }

  const statuses = ["Reçu", "En attente", "Annulé"]
  const types = ["Offrande", "Dîme", "Don", "Collecte", "Autre"]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white/80 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Total des donations</p>
                <p className="text-2xl font-bold text-black">{totalAmount.toLocaleString()} FCFA</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="w-6 h-6 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Reçues</p>
                <p className="text-2xl font-bold text-black">{receivedAmount.toLocaleString()} FCFA</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">En attente</p>
                <p className="text-2xl font-bold text-black">{pendingAmount.toLocaleString()} FCFA</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="w-6 h-6 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8 shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-black mb-1">
              Gestion des donations - {diocese}
            </CardTitle>
            <p className="text-black/80 text-sm">
              Gérez les donations et offrandes de votre diocèse.
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
              value={typeFilter} 
              onChange={e => setTypeFilter(e.target.value)} 
              className="h-10 rounded px-2 border-blue-200 bg-white/90 text-black"
            >
              <option value="all">Tous les types</option>
              {types.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <Link href={`/admindiocese/donations/create?diocese=${encodeURIComponent(diocese)}`}>
              <Button className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white shadow-lg rounded-xl px-4 py-2">
                <Plus className="w-5 h-5" /> Nouvelle donation
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="text-black/80 text-sm bg-blue-50">
                  <th className="py-3 px-4 text-black">Donateur</th>
                  <th className="py-3 px-4 text-black">Montant</th>
                  <th className="py-3 px-4 text-black">Type</th>
                  <th className="py-3 px-4 text-black">Paroisse</th>
                  <th className="py-3 px-4 text-black">Date</th>
                  <th className="py-3 px-4 text-black">Statut</th>
                  <th className="py-3 px-4 text-right text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDonations.map((item, i) => (
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
                          <Input name="donorName" value={editForm.donorName} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <Input name="amount" type="number" value={editForm.amount} onChange={handleEditChange} className="h-8" />
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
                        <td className="py-2 px-4 font-semibold text-black">{item.donorName}</td>
                        <td className="py-2 px-4 font-semibold text-black">{item.amount.toLocaleString()} FCFA</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.type === 'Offrande' ? 'bg-blue-100 text-black' :
                            item.type === 'Dîme' ? 'bg-blue-100 text-black' :
                            item.type === 'Don' ? 'bg-blue-100 text-black' :
                            'bg-blue-100 text-black'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-black">{item.parish}</td>
                        <td className="py-2 px-4 text-black">{new Date(item.date).toLocaleDateString('fr-FR')}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'Reçu' ? 'bg-blue-100 text-black' :
                            item.status === 'En attente' ? 'bg-blue-100 text-black' :
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
            {paginatedDonations.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-12 h-12 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune donation trouvée</h3>
                <p className="text-gray-600 mb-6">
                  {donations.length === 0 
                    ? `Aucune donation n'est enregistrée dans Firestore pour le diocèse ${diocese}.`
                    : "Aucune donation ne correspond à vos critères de recherche."
                  }
                </p>
                {donations.length === 0 && (
                  <Link href="/admindiocese/donations/create">
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Enregistrer la première donation
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredDonations.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredDonations.length}
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
