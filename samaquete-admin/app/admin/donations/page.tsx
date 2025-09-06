"use client"
import { useState, useEffect, ChangeEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, Download, CreditCard, Phone, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

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

const initialDonations = [
  {
    id: 1,
    fullname: "Fatou Ndiaye",
    phone: "+221 77 123 45 67",
    type: "messe",
    amount: 10000,
    payment: "cb",
    parish: "Paroisse Saint-Joseph de Medina",
    date: "2024-06-10 09:30",
  },
  {
    id: 2,
    fullname: "Mamadou Diop",
    phone: "+221 76 987 65 43",
    type: "quete",
    amount: 2000,
    payment: "wave",
    parish: "Paroisse Sainte-Anne de Thiès",
    date: "2024-06-09 11:00",
  },
  {
    id: 3,
    fullname: "Awa Sarr",
    phone: "+221 70 555 12 34",
    type: "denier",
    amount: 5000,
    payment: "orange",
    parish: "Paroisse Sacré-Cœur de Kaolack",
    date: "2024-06-08 18:45",
  },
]

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
  const [donations, setDonations] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [parishFilter, setParishFilter] = useState("all")
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<any>({ fullname: "", phone: "", type: "messe", amount: 0, payment: "cb", parish: parishesList[0], date: "" })

  // Initialisation depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem("admin_donations")
    if (stored) {
      setDonations(JSON.parse(stored))
    } else {
      setDonations(initialDonations)
      localStorage.setItem("admin_donations", JSON.stringify(initialDonations))
    }
  }, [])
  // Sauvegarde à chaque modification
  useEffect(() => {
    if (donations.length > 0) {
      localStorage.setItem("admin_donations", JSON.stringify(donations))
    }
  }, [donations])

  // Filtres et recherche
  const filteredDonations = donations.filter(d => {
    const matchSearch = d.fullname.toLowerCase().includes(search.toLowerCase()) || d.phone.includes(search)
    const matchType = typeFilter === "all" || d.type === typeFilter
    const matchPayment = paymentFilter === "all" || d.payment === paymentFilter
    const matchParish = parishFilter === "all" || d.parish === parishFilter
    return matchSearch && matchType && matchPayment && matchParish
  })

  // Suppression
  const handleDelete = (id: number) => {
    if (window.confirm("Confirmer la suppression de ce don ?")) {
      setDonations(donations.filter(d => d.id !== id))
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
    setDonations(donations.map(d => d.id === id ? { ...editForm, id, amount: Number(editForm.amount) } : d))
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
            <CardTitle className="text-3xl font-bold text-green-900 mb-1">Gestion des dons</CardTitle>
            <p className="text-green-800/80 text-sm">Visualisez, filtrez et exportez tous les dons effectués dans les paroisses.</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              placeholder="Recherche nom ou téléphone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 w-48 bg-white/90 border-gray-200"
            />
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="h-10 rounded px-2 border-gray-200 bg-white/90 text-green-900">
              {donationTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="h-10 rounded px-2 border-gray-200 bg-white/90 text-green-900">
              {paymentModes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <select value={parishFilter} onChange={e => setParishFilter(e.target.value)} className="h-10 rounded px-2 border-gray-200 bg-white/90 text-green-900">
              <option value="all">Toutes les paroisses</option>
              {parishesList.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <Button onClick={() => exportToCSV(filteredDonations)} variant="outline" className="flex items-center gap-2 text-green-900 border-green-200 bg-white/90 hover:bg-green-50 rounded-xl px-3 py-2">
              <Download className="w-5 h-5" /> Export CSV
            </Button>
            <Link href="/admin/donations/create">
              {/* <Button className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white shadow-lg rounded-xl px-4 py-2">
                <Plus className="w-5 h-5" /> Nouveau don
              </Button> */}
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left min-w-[1000px]">
              <thead>
                <tr className="text-green-900/80 text-sm bg-green-50">
                  <th className="py-3 px-4">Nom complet</th>
                  <th className="py-3 px-4">Téléphone</th>
                  <th className="py-3 px-4">Type de don</th>
                  <th className="py-3 px-4">Montant (FCFA)</th>
                  <th className="py-3 px-4">Mode de paiement</th>
                  <th className="py-3 px-4">Paroisse</th>
                  <th className="py-3 px-4">Date/Heure</th>
                  {/* <th className="py-3 px-4 text-right">Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="border-b last:border-0 hover:bg-green-50/40"
                  >
                    {editId === item.id ? (
                      <>
                        <td className="py-2 px-4 font-semibold text-green-900">
                          <Input name="fullname" value={editForm.fullname} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <Input name="phone" value={editForm.phone} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <select name="type" value={editForm.type} onChange={handleEditChange} className="h-8 rounded px-2 border-gray-200 bg-white/90 text-green-900">
                            {donationTypes.filter(t => t.value !== "all").map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <Input name="amount" type="number" min={0} value={editForm.amount} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <select name="payment" value={editForm.payment} onChange={handleEditChange} className="h-8 rounded px-2 border-gray-200 bg-white/90 text-green-900">
                            {paymentModes.filter(p => p.value !== "all").map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <select name="parish" value={editForm.parish} onChange={handleEditChange} className="h-8 rounded px-2 border-gray-200 bg-white/90 text-green-900">
                            {parishesList.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <Input name="date" value={editForm.date} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4 text-right flex gap-2 justify-end">
                          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => handleEditSave(item.id)}>Enregistrer</Button>
                          <Button size="sm" variant="ghost" className="rounded-lg" onClick={handleEditCancel}>Annuler</Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-4 font-semibold text-green-900">{item.fullname}</td>
                        <td className="py-2 px-4">{item.phone}</td>
                        <td className="py-2 px-4">{donationTypes.find(t => t.value === item.type)?.label}</td>
                        <td className="py-2 px-4">{formatAmount(item.amount)}</td>
                        <td className="py-2 px-4">{paymentModes.find(p => p.value === item.payment)?.label}</td>
                        <td className="py-2 px-4">{item.parish}</td>
                        <td className="py-2 px-4">{item.date}</td>
                        <td className="py-2 px-4 text-right flex gap-2 justify-end">
                          {/*<Button size="sm" variant="outline" className="rounded-lg" onClick={() => handleEdit(item)}><Edit className="w-4 h-4" /></Button> */}
                          {/* <Button size="sm" variant="destructive" className="rounded-lg" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button> */}
                        </td>
                      </>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filteredDonations.length === 0 && (
              <div className="text-center text-green-900/60 py-8">Aucun don trouvé.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 