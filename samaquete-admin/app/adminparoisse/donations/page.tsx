"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  DollarSign, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  Calendar,
  User,
  TrendingUp,
  BarChart3,
  AlertCircle,
  Eye
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ParishDonationService } from "@/lib/parish-services"
import { DonationTypeService } from "@/lib/donation-type-service"
// import { motion } from "framer-motion"
// Stub temporaire
const motion = {
  div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  tr: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
  td: ({ children, ...props }: any) => <td {...props}>{children}</td>,
  th: ({ children, ...props }: any) => <th {...props}>{children}</th>,
}

/**
 * Page "Dons" - Admin Paroisse (LECTURE SEULE)
 * 
 * Objectif: Transparence et suivi financier
 * 
 * Fonctionnalités:
 * - Voir tous les dons de la paroisse
 * - Statistiques: total, par type, par période
 * 
 * ⛔ Lecture seule (aucune modification possible)
 * 
 * 📱 Mobile:
 * - Affiche uniquement ses propres dons
 * - Admin paroisse voit tous les dons de sa paroisse
 */
interface Donation {
  id: string
  fullname: string
  amount: number
  date: string
  type: string
  description?: string
  status: "confirmed" | "pending" | "cancelled"
  provider?: string
  phone?: string
  email?: string
}

function DonsContent() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { userRole } = useAuth()
  const parishId = userRole?.parishId || searchParams.get('parishId') || ''
  
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateStart, setDateStart] = useState<string>("")
  const [dateEnd, setDateEnd] = useState<string>("")
  
  // Types de dons disponibles
  const [donationTypes, setDonationTypes] = useState<string[]>([])

  useEffect(() => {
    if (parishId) {
      loadDonations()
      loadDonationTypes()
    }
  }, [parishId])

  const loadDonations = async () => {
    if (!parishId) return
    
    try {
      setLoading(true)
      const data = await ParishDonationService.getAll(parishId)
      const donationsData = (data || []).map((d: any) => ({
        id: String(d.id || ''),
        fullname: d.fullname || 'Donateur anonyme',
        amount: Number(d.amount || 0),
        date: d.date || '',
        type: d.type || 'Autre',
        description: d.description,
        status: d.status || 'pending',
        provider: d.provider || 'Non spécifié',
        phone: d.phone,
        email: d.email
      })) as Donation[]
      
      setDonations(donationsData)
    } catch (error) {
      console.error('Erreur lors du chargement des dons:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les dons",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadDonationTypes = async () => {
    if (!parishId) return
    
    try {
      const types = await DonationTypeService.getAllDonationTypesByParish(parishId)
      const typeNames = types.map(t => t.name)
      setDonationTypes(typeNames)
    } catch (error) {
      console.error('Erreur lors du chargement des types:', error)
    }
  }

  // Filtres
  const filteredDonations = donations.filter(donation => {
    const matchSearch = donation.fullname.toLowerCase().includes(search.toLowerCase()) ||
                       donation.type.toLowerCase().includes(search.toLowerCase()) ||
                       (donation.description && donation.description.toLowerCase().includes(search.toLowerCase()))
    
    const matchType = typeFilter === "all" || donation.type === typeFilter
    
    const matchStatus = statusFilter === "all" || donation.status === statusFilter
    
    const matchDate = (!dateStart || donation.date >= dateStart) && 
                     (!dateEnd || donation.date <= dateEnd)
    
    return matchSearch && matchType && matchStatus && matchDate
  })

  // Statistiques
  const stats = {
    total: filteredDonations.reduce((sum, d) => sum + d.amount, 0),
    totalCount: filteredDonations.length,
    confirmed: filteredDonations
      .filter(d => d.status === 'confirmed')
      .reduce((sum, d) => sum + d.amount, 0),
    confirmedCount: filteredDonations.filter(d => d.status === 'confirmed').length,
    pending: filteredDonations
      .filter(d => d.status === 'pending')
      .reduce((sum, d) => sum + d.amount, 0),
    pendingCount: filteredDonations.filter(d => d.status === 'pending').length
  }

  // Statistiques par type
  const statsByType: Record<string, { amount: number; count: number }> = {}
  filteredDonations.forEach(d => {
    if (!statsByType[d.type]) {
      statsByType[d.type] = { amount: 0, count: 0 }
    }
    statsByType[d.type].amount += d.amount
    statsByType[d.type].count += 1
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmé</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Annulé</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount).replace('XOF', 'FCFA')
  }

  const exportToCSV = () => {
    const header = ["Date", "Type", "Montant", "Statut", "Donateur", "Moyen de paiement"]
    const rows = filteredDonations.map(d => [
      d.date,
      d.type,
      d.amount.toString(),
      d.status,
      d.fullname,
      d.provider || 'Non spécifié'
    ])
    const csvContent = [header, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `dons-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({
      title: "Succès",
      description: "Export CSV généré"
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement des dons...</p>
        </div>
      </div>
    )
  }

  if (!parishId) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">Aucune paroisse sélectionnée</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Avertissement lecture seule */}
      <Card className="mb-4 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800 mb-1">
                ⛔ Mode lecture seule
              </p>
              <p className="text-xs text-blue-700">
                Cette page est en lecture seule. Aucune modification des dons n'est autorisée.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total général</p>
                <p className="text-2xl font-bold text-black">{formatAmount(stats.total)}</p>
                <p className="text-xs text-gray-500">{stats.totalCount} dons</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmés</p>
                <p className="text-2xl font-bold text-green-600">{formatAmount(stats.confirmed)}</p>
                <p className="text-xs text-gray-500">{stats.confirmedCount} dons</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{formatAmount(stats.pending)}</p>
                <p className="text-xs text-gray-500">{stats.pendingCount} dons</p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Types de dons</p>
                <p className="text-2xl font-bold text-black">{Object.keys(statsByType).length}</p>
                <p className="text-xs text-gray-500">différents</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques par type */}
      {Object.keys(statsByType).length > 0 && (
        <Card className="mb-6 shadow-xl bg-white/80 border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-black">Répartition par type de don</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(statsByType).map(([type, stat]) => (
                <div key={type} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-black mb-1">{type}</p>
                  <p className="text-2xl font-bold text-blue-600">{formatAmount(stat.amount)}</p>
                  <p className="text-xs text-gray-500">{stat.count} don(s)</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des dons */}
      <Card className="shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-black mb-1">
              Dons
            </CardTitle>
            <p className="text-black/80 text-sm">
              Liste complète des dons de la paroisse (lecture seule)
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={loadDonations}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type de don" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {donationTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="confirmed">Confirmé</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="Date début"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="w-[150px]"
              />
              <Input
                type="date"
                placeholder="Date fin"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="w-[150px]"
              />
            </div>
          </div>

          {/* Tableau */}
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="text-black/80 text-sm bg-blue-50">
                  <th className="py-3 px-4 text-black">Date</th>
                  <th className="py-3 px-4 text-black">Type</th>
                  <th className="py-3 px-4 text-black">Montant</th>
                  <th className="py-3 px-4 text-black">Statut</th>
                  <th className="py-3 px-4 text-black">Moyen de paiement</th>
                  <th className="py-3 px-4 text-black">Donateur</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">Aucun don trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filteredDonations.map((donation, i) => (
                    <motion.tr
                      key={donation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b last:border-0 hover:bg-blue-50/40"
                    >
                      <td className="py-2 px-4 text-black">
                        {donation.date ? new Date(donation.date).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td className="py-2 px-4 text-black font-medium">{donation.type}</td>
                      <td className="py-2 px-4 text-black font-bold">{formatAmount(donation.amount)}</td>
                      <td className="py-2 px-4">{getStatusBadge(donation.status)}</td>
                      <td className="py-2 px-4 text-black">{donation.provider || 'Non spécifié'}</td>
                      <td className="py-2 px-4 text-black">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{donation.fullname}</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Total période */}
          {filteredDonations.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-black">
                  Total période sélectionnée:
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatAmount(stats.total)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {stats.totalCount} don(s) sur {donations.length} au total
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function DonsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-lg">Chargement...</span>
        </div>
      </div>
    }>
      <DonsContent />
    </Suspense>
  )
}
