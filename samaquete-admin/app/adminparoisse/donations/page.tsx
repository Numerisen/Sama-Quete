"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  Search, 
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  TrendingUp,
  BarChart3
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ParishDonationService } from "@/lib/parish-services"

interface Donation {
  id: string;
  fullname: string;
  amount: number;
  date: string;
  type: string;
  description?: string;
  phone?: string;
  email?: string;
  status: "confirmed" | "pending" | "cancelled";
}

export default function ParoisseDonationsPage() {
  const searchParams = useSearchParams()
  const paroisse = searchParams.get('paroisse') || 'Paroisse Saint Jean Bosco'
  const { toast } = useToast()
  const { userRole } = useAuth()
  const parishId = userRole?.parishId

  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const donationTypes = Array.from(
    new Set(donations.map(d => d.type).filter(Boolean))
  )
  const statusOptions = ["confirmed", "pending", "cancelled"]

  useEffect(() => {
    const load = async () => {
      try {
        if (!parishId) {
          setDonations([])
          return
        }
        setLoading(true)
        const data = await ParishDonationService.getAll(parishId)
        setDonations(
          (data || []).map((d: any) => ({
            id: String(d.id || ''),
            fullname: d.fullname || 'Utilisateur',
            amount: Number(d.amount || 0),
            date: d.date,
            type: d.type,
            description: d.description,
            phone: d.phone,
            email: d.email,
            status: d.status,
          }))
        )
      } catch (e) {
        console.error(e)
        toast({
          title: "Erreur",
          description: "Impossible de charger les dons (mobile + admin).",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [parishId, toast])

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || donation.type === filterType
    const matchesStatus = filterStatus === "all" || donation.status === filterStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0)
  const confirmedAmount = donations.filter(d => d.status === "confirmed").reduce((sum, d) => sum + d.amount, 0)
  const pendingAmount = donations.filter(d => d.status === "pending").reduce((sum, d) => sum + d.amount, 0)
  const today = new Date().toISOString().split('T')[0]
  const todayDonations = donations.filter(d => (d.date || "").startsWith(today)).length

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("fr-FR").replace(/\s/g, " ")
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="default" className="bg-green-100 text-green-800">Confirmé</Badge>
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">En attente</Badge>
      case "cancelled":
        return <Badge variant="destructive">Annulé</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleDeleteDonation = (id: string) => {
    setDonations(donations.filter(d => d.id !== id))
    toast({
      title: "Succès",
      description: "Don supprimé avec succès"
    })
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    setDonations(donations.map(d => 
      d.id === id ? { ...d, status: newStatus as any } : d
    ))
    toast({
      title: "Succès",
      description: "Statut du don mis à jour"
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dons de la paroisse</h1>
            <p className="text-gray-600 mt-1">
              {paroisse} • Gestion des dons et offrandes
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/adminparoisse/donations/create">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nouveau don
              </Button>
            </Link>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total collecté</p>
                  <p className="text-2xl font-bold text-green-600">{formatAmount(totalAmount)} FCFA</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Confirmés</p>
                  <p className="text-2xl font-bold text-blue-600">{formatAmount(confirmedAmount)} FCFA</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600">{formatAmount(pendingAmount)} FCFA</p>
                </div>
                <Calendar className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Dons aujourd'hui</p>
                  <p className="text-2xl font-bold text-purple-600">{todayDonations}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Rechercher</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Nom, type de don..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="type-filter">Type de don</Label>
                <select
                  id="type-filter"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">Tous les types</option>
                  {donationTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="status-filter">Statut</Label>
                <select
                  id="status-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="confirmed">Confirmé</option>
                  <option value="pending">En attente</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des dons */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Liste des dons ({filteredDonations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDonations.map((donation) => (
                <div key={donation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{donation.fullname}</h3>
                      {getStatusBadge(donation.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formatAmount(donation.amount)} FCFA
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(donation.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Filter className="w-4 h-4" />
                        {donation.type}
                      </div>
                      {donation.phone && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {donation.phone}
                        </div>
                      )}
                    </div>
                    {donation.description && (
                      <p className="text-sm text-gray-500 mt-1">{donation.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {donation.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(donation.id, "confirmed")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Confirmer
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDonation(donation.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredDonations.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun don trouvé</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterType !== "all" || filterStatus !== "all" 
                    ? "Aucun don ne correspond à vos critères de recherche."
                    : "Aucun don n'a encore été enregistré pour cette paroisse."
                  }
                </p>
                {!searchTerm && filterType === "all" && filterStatus === "all" && (
                  <Link href="/adminparoisse/donations/create">
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Enregistrer le premier don
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
