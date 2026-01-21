"use client"
export const dynamic = "force-dynamic"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DollarSign, User, Calendar, TrendingUp, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Pagination } from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"
import { DonationService, ParishService, DonationItem, ParishItem } from "@/lib/firestore-services"
import { useAuth } from "@/lib/auth-context"

export default function AdminDioceseDonationsPage() {
  const searchParams = useSearchParams()
  const diocese = searchParams.get('diocese') || 'Votre diocèse'
  const dioceseIdFromUrl = searchParams.get('dioceseId') || undefined
  const { toast } = useToast()
  const { userRole } = useAuth()
  const dioceseId = userRole?.dioceseId || dioceseIdFromUrl
  
  const [donations, setDonations] = useState<DonationItem[]>([])
  const [parishes, setParishes] = useState<ParishItem[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Charger les dons et paroisses depuis Firestore
  const loadDonations = async () => {
    try {
      setLoading(true)
      const [firestoreDonations, firestoreParishes] = await Promise.all([
        DonationService.getAll(),
        ParishService.getAll()
      ])
      // 🔥 Filtrer en priorité par dioceseId (fiable), sinon fallback par nom de diocèse (string)
      const dioceseDonations = dioceseId
        ? firestoreDonations.filter(d => d.dioceseId === dioceseId)
        : firestoreDonations.filter(d => d.diocese === diocese)

      const dioceseParishes = dioceseId
        ? firestoreParishes.filter(p => p.dioceseId === dioceseId)
        : firestoreParishes.filter(p => p.diocese === diocese)

      setDonations(dioceseDonations)
      setParishes(dioceseParishes)
    } catch (error) {
      console.error('Erreur lors du chargement des dons:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les dons depuis Firebase",
        variant: "destructive"
      })
      setDonations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDonations()
  }, [diocese, dioceseId])

  // Filtres et recherche
  const filteredDonations = donations.filter(d => {
    const matchSearch = d.donorName?.toLowerCase().includes(search.toLowerCase()) || 
                       d.parish?.toLowerCase().includes(search.toLowerCase()) ||
                       d.description?.toLowerCase().includes(search.toLowerCase())
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
  const totalAmount = filteredDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
  // Statuts normalisés dans Firestore (admin_donations): pending | confirmed | cancelled
  const receivedAmount = filteredDonations.filter(d => d.status === "confirmed").reduce((sum, d) => sum + (d.amount || 0), 0)
  const pendingAmount = filteredDonations.filter(d => d.status === "pending").reduce((sum, d) => sum + (d.amount || 0), 0)


  const statuses = [
    { value: "confirmed", label: "Reçu" },
    { value: "pending", label: "En attente" },
    { value: "cancelled", label: "Annulé" },
  ]
  const types = ["quete", "denier", "cierge", "messe", "autre"]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-100">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
          <span className="text-lg text-gray-600">Chargement des dons...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white/80 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total collecté</p>
                <p className="text-2xl font-bold text-black">{totalAmount.toLocaleString()} FCFA</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reçu</p>
                <p className="text-2xl font-bold text-black">{receivedAmount.toLocaleString()} FCFA</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-black">{pendingAmount.toLocaleString()} FCFA</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des dons */}
      <Card className="shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-black mb-1">
              Dons - {diocese}
            </CardTitle>
            <p className="text-black/80 text-sm">
              Consultez les dons reçus dans votre diocèse.
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
              {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select 
              value={typeFilter} 
              onChange={e => setTypeFilter(e.target.value)} 
              className="h-10 rounded px-2 border-blue-200 bg-white/90 text-black"
            >
              <option value="all">Tous les types</option>
              {types.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <Button
              onClick={loadDonations}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="text-black/80 text-sm bg-blue-50">
                  <th className="py-3 px-4 text-black">Donateur</th>
                  <th className="py-3 px-4 text-black">Type</th>
                  <th className="py-3 px-4 text-black">Montant</th>
                  <th className="py-3 px-4 text-black">Paroisse</th>
                  <th className="py-3 px-4 text-black">Statut</th>
                  <th className="py-3 px-4 text-black">Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDonations.map((donation, i) => (
                  <motion.tr
                    key={donation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="border-b last:border-0 hover:bg-blue-50/40"
                  >
                    <td className="py-2 px-4 font-semibold text-black">{donation.donorName || 'N/A'}</td>
                    <td className="py-2 px-4 text-black">{donation.type || 'N/A'}</td>
                    <td className="py-2 px-4 text-black font-semibold">{(donation.amount || 0).toLocaleString()} FCFA</td>
                    <td className="py-2 px-4 text-black">{donation.parish || 'N/A'}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        donation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        donation.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {donation.status === 'confirmed'
                          ? 'Reçu'
                          : donation.status === 'pending'
                          ? 'En attente'
                          : donation.status === 'cancelled'
                          ? 'Annulé'
                          : (donation.status || 'N/A')}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-black">{donation.date || 'N/A'}</td>
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