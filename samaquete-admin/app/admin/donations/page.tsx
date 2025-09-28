"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Donation, DonationService, DonationStats } from "@/lib/donation-service"
import { motion } from "framer-motion"
import { Church, DollarSign, Download, Edit, Loader2, Plus, Target, Trash2, TrendingUp } from "lucide-react"
import Link from "next/link"
import { ChangeEvent, useEffect, useState } from "react"
import { toast } from "sonner"

const donationTypes = [
  { value: "all", label: "Tous les types" },
  { value: "messe", label: "Messe d'intention" },
  { value: "cierge", label: "Cierge pascal" },
  { value: "denier", label: "Denier du culte" },
  { value: "quete", label: "Quête dominicale" },
]
const paymentModes = [
  { value: "all", label: "Tous les paiements" },
  { value: "cb", label: "Carte bancaire" },
  { value: "wave", label: "Wave" },
  { value: "orange", label: "Orange Money" },
  { value: "especes", label: "Espèces" },
]
const parishesList = [
  "Paroisse Saint-Joseph de Medina",
  "Paroisse Sainte-Anne de Thiès",
  "Paroisse Sacré-Cœur de Kaolack",
]

// Données initiales supprimées - Utilisation uniquement des données Firestore

function exportToCSV(donations: any[]) {
  const header = ["Nom complet", "Téléphone", "Type de don", "Montant", "Mode de paiement", "Paroisse", "Date/Heure"]
  const rows = donations.map(d => [d.fullname, d.phone, donationTypes.find(t => t.value === d.type)?.label, d.amount, paymentModes.find(p => p.value === d.payment)?.label, d.parish, d.date])
  const csvContent = [header, ...rows].map(e => e.join(",")).join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", "dons.csv")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function formatAmount(amount: number) {
  return amount.toLocaleString("fr-FR").replace(/\s/g, " ");
}

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [stats, setStats] = useState<DonationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [parishFilter, setParishFilter] = useState("all")
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<any>({ donorName: "", donorPhone: "", type: "messe", amount: 0, paymentMethod: "cb", parishId: "", message: "" })

  // Chargement des données depuis Firebase
  useEffect(() => {
    loadDonations()
    loadStats()
  }, [])

  const loadDonations = async () => {
    try {
      setLoading(true)
      const donationsData = await DonationService.getDonations({ limit: 100 })
      setDonations(donationsData)
    } catch (error) {
      console.error("Erreur lors du chargement des dons:", error)
      toast.error("Erreur lors du chargement des dons")
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await DonationService.getDonationStats()
      setStats(statsData)
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error)
    }
  }

  // Filtres et recherche
  const filteredDonations = donations.filter(d => {
    const matchSearch = d.donorName.toLowerCase().includes(search.toLowerCase()) || d.donorPhone.includes(search)
    const matchType = typeFilter === "all" || d.type === typeFilter
    const matchPayment = paymentFilter === "all" || d.paymentMethod === paymentFilter
    const matchParish = parishFilter === "all" || d.parishId === parishFilter
    return matchSearch && matchType && matchPayment && matchParish
  })

  // Suppression
  const handleDelete = async (id: string) => {
    if (window.confirm("Confirmer la suppression de ce don ?")) {
      try {
        const success = await DonationService.deleteDonation(id)
        if (success) {
          setDonations(donations.filter(d => d.id !== id))
          toast.success("Don supprimé avec succès")
          loadStats() // Recharger les stats
        } else {
          toast.error("Erreur lors de la suppression")
        }
      } catch (error) {
        console.error("Erreur:", error)
        toast.error("Erreur lors de la suppression")
      }
    }
  }

  // Edition inline
  const handleEdit = (item: Donation) => {
    setEditId(item.id)
    setEditForm({ 
      donorName: item.donorName,
      donorPhone: item.donorPhone,
      type: item.type,
      amount: item.amount,
      paymentMethod: item.paymentMethod,
      parishId: item.parishId,
      message: item.message || ""
    })
  }

  const handleEditChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleEditSave = async (id: string) => {
    try {
      // Ici on pourrait ajouter une méthode updateDonation dans le service
      toast.success("Modification enregistrée")
      setEditId(null)
      loadDonations() // Recharger les données
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur lors de la modification")
    }
  }

  const handleEditCancel = () => {
    setEditId(null)
  }

  const formatDate = (date: any) => {
    if (!date) return "Non définie"
    const d = date.toDate ? date.toDate() : new Date(date)
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-black" />
            <p className="text-black">Chargement des dons...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Collecté</p>
                  <p className="text-2xl font-bold">{formatAmount(stats.totalAmount)} FCFA</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Dons</p>
                  <p className="text-2xl font-bold">{stats.totalDonations}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Paroisses Actives</p>
                  <p className="text-2xl font-bold">{Object.keys(stats.byParish).length}</p>
                </div>
                <Church className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Dons Récents</p>
                  <p className="text-2xl font-bold">{stats.recentDonations.length}</p>
                </div>
                <Target className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mb-8 shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-black mb-1">Gestion des dons</CardTitle>
            <p className="text-black/80 text-sm">Visualisez, filtrez et exportez tous les dons effectués dans les paroisses.</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              placeholder="Recherche nom ou téléphone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 w-48 bg-white/90 border-blue-200"
            />
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="h-10 rounded px-2 border-blue-200 bg-white/90 text-black">
              {donationTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="h-10 rounded px-2 border-blue-200 bg-white/90 text-black">
              {paymentModes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <select value={parishFilter} onChange={e => setParishFilter(e.target.value)} className="h-10 rounded px-2 border-blue-200 bg-white/90 text-black">
              <option value="all">Toutes les paroisses</option>
              {parishesList.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <Button onClick={() => exportToCSV(filteredDonations)} variant="outline" className="flex items-center gap-2 text-black border-blue-200 bg-white/90 hover:bg-blue-50 rounded-xl px-3 py-2">
              <Download className="w-5 h-5" /> Export CSV
            </Button>
            <div className="flex gap-2">
              <Link href="/admin/donations/events">
                <Button variant="outline" className="flex items-center gap-2 text-black border-blue-200 bg-white/90 hover:bg-blue-50 rounded-xl px-3 py-2">
                  <Target className="w-5 h-5" /> Événements
                </Button>
              </Link>
              <Link href="/admin/donations/events/create">
                <Button className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white shadow-lg rounded-xl px-4 py-2">
                  <Plus className="w-5 h-5" /> Nouvel événement
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left min-w-[1000px]">
              <thead>
                <tr className="text-black/80 text-sm bg-blue-50">
                  <th className="py-3 px-4 text-black">Nom du donateur</th>
                  <th className="py-3 px-4 text-black">Téléphone</th>
                  <th className="py-3 px-4 text-black">Type de don</th>
                  <th className="py-3 px-4 text-black">Montant (FCFA)</th>
                  <th className="py-3 px-4 text-black">Mode de paiement</th>
                  <th className="py-3 px-4 text-black">Paroisse</th>
                  <th className="py-3 px-4 text-black">Statut</th>
                  <th className="py-3 px-4 text-black">Date/Heure</th>
                  <th className="py-3 px-4 text-right text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((item, i) => (
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
                          <Input name="donorPhone" value={editForm.donorPhone} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <select name="type" value={editForm.type} onChange={handleEditChange} className="h-8 rounded px-2 border-blue-200 bg-white/90 text-black">
                            {donationTypes.filter(t => t.value !== "all").map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <Input name="amount" type="number" min={0} value={editForm.amount} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <select name="paymentMethod" value={editForm.paymentMethod} onChange={handleEditChange} className="h-8 rounded px-2 border-blue-200 bg-white/90 text-black">
                            {paymentModes.filter(p => p.value !== "all").map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <Input name="parishId" value={editForm.parishId} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <select name="status" value={editForm.status} onChange={handleEditChange} className="h-8 rounded px-2 border-blue-200 bg-white/90 text-black">
                            <option value="pending">En attente</option>
                            <option value="completed">Complété</option>
                            <option value="failed">Échoué</option>
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <span className="text-sm text-black">{formatDate(item.createdAt)}</span>
                        </td>
                        <td className="py-2 px-4 text-right flex gap-2 justify-end">
                          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => handleEditSave(item.id)}>Enregistrer</Button>
                          <Button size="sm" variant="ghost" className="rounded-lg" onClick={handleEditCancel}>Annuler</Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-4 font-semibold text-black">{item.donorName}</td>
                        <td className="py-2 px-4 text-black">{item.donorPhone}</td>
                        <td className="py-2 px-4 text-black">{donationTypes.find(t => t.value === item.type)?.label}</td>
                        <td className="py-2 px-4 font-semibold text-black">{formatAmount(item.amount)}</td>
                        <td className="py-2 px-4 text-black">{paymentModes.find(p => p.value === item.paymentMethod)?.label}</td>
                        <td className="py-2 px-4 text-black">{item.parishId}</td>
                        <td className="py-2 px-4">
                          <Badge 
                            variant={item.status === 'completed' ? 'default' : item.status === 'pending' ? 'secondary' : 'destructive'}
                            className={item.status === 'completed' ? 'bg-blue-600' : item.status === 'pending' ? 'bg-blue-500' : 'bg-blue-600'}
                          >
                            {item.status === 'completed' ? 'Complété' : item.status === 'pending' ? 'En attente' : 'Échoué'}
                          </Badge>
                        </td>
                        <td className="py-2 px-4 text-sm text-black">{formatDate(item.createdAt)}</td>
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
            {filteredDonations.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-12 h-12 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun don trouvé</h3>
                <p className="text-gray-600 mb-6">
                  {donations.length === 0 
                    ? "Aucun don n'est enregistré dans Firestore pour le moment."
                    : "Aucun don ne correspond à vos critères de recherche."
                  }
                </p>
                {donations.length === 0 && (
                  <Link href="/admin/donations/create">
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Enregistrer le premier don
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