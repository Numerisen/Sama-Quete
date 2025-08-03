"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MapPin, DollarSign, PieChart, BarChart2, TrendingUp, CreditCard } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Bar, Line, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement)

function formatAmount(amount: number) {
  return amount.toLocaleString("fr-FR").replace(/\s/g, " ");
}

// Génération de données fictives réalistes
function generateFakeData() {
  const parishes = [
    "Paroisse Saint-Joseph de Medina",
    "Paroisse Sainte-Anne de Thiès",
    "Paroisse Sacré-Cœur de Kaolack",
    "Paroisse Saint-Paul de Ziguinchor",
    "Paroisse Sainte-Marie de Kolda",
    "Paroisse Saint-Pierre de Tambacounda",
    "Paroisse Saint-Louis du Sénégal",
  ]
  const types = ["messe", "cierge", "denier", "quete"]
  const payments = ["cb", "wave", "orange", "especes"]
  const users = Array.from({ length: 120 }, (_, i) => ({
    id: i + 1,
    fullname: `Donateur ${i + 1}`,
    phone: `+221 77 ${Math.floor(1000000 + Math.random() * 8999999)}`,
  }))
  const donations = []
  const now = new Date()
  for (let i = 0; i < 300; i++) {
    const user = users[Math.floor(Math.random() * users.length)]
    const parish = parishes[Math.floor(Math.random() * parishes.length)]
    const type = types[Math.floor(Math.random() * types.length)]
    const payment = payments[Math.floor(Math.random() * payments.length)]
    const amount = [2000, 5000, 10000, 20000, 50000][Math.floor(Math.random() * 5)]
    const daysAgo = Math.floor(Math.random() * 30)
    const date = new Date(now)
    date.setDate(now.getDate() - daysAgo)
    const dateStr = date.toISOString().slice(0, 10) + " " + (8 + Math.floor(Math.random() * 10)) + ":" + (Math.floor(Math.random() * 60)).toString().padStart(2, "0")
    donations.push({
      id: i + 1,
      fullname: user.fullname,
      phone: user.phone,
      type,
      amount,
      payment,
      parish,
      date: dateStr,
    })
  }
  return { donations, parishes, users }
}

const typeLabels: Record<string, string> = {
  messe: "Messe d'intention",
  cierge: "Cierge pascal",
  denier: "Denier du culte",
  quete: "Quête dominicale",
}
const paymentLabels: Record<string, string> = {
  cb: "Carte bancaire",
  wave: "Wave",
  orange: "Orange Money",
  especes: "Espèces",
}

export default function AdminDashboardPage() {
  const [donations, setDonations] = useState<any[]>([])
  const [parishes, setParishes] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    // Génère des données fictives à chaque chargement
    const { donations, parishes, users } = generateFakeData()
    setDonations(donations)
    setParishes(parishes)
    setUsers(users)
  }, [])

  // Statistiques clés
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0)
  const totalDonations = donations.length
  const uniqueDonors = new Set(donations.map(d => d.fullname)).size
  const today = new Date().toISOString().slice(0, 10)
  const donationsToday = donations.filter(d => d.date.startsWith(today)).length
  const avgDonation = totalDonations ? Math.round(totalAmount / totalDonations) : 0

  // Dons par jour (30 derniers jours)
  const daysArr = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().slice(0, 10)
  })
  const donationsByDay = daysArr.map(date => donations.filter(d => d.date.startsWith(date)).reduce((sum, d) => sum + d.amount, 0))

  // Histogramme par paroisse
  const parishSums: Record<string, number> = {}
  donations.forEach(d => { parishSums[d.parish] = (parishSums[d.parish] || 0) + d.amount })
  const parishLabels = Object.keys(parishSums)
  const parishAmounts = parishLabels.map(p => parishSums[p])

  // Camembert par type de don
  const typeSums: Record<string, number> = { messe: 0, cierge: 0, denier: 0, quete: 0 }
  donations.forEach(d => { if (typeSums[d.type] !== undefined) typeSums[d.type] += d.amount })
  const typeData = Object.values(typeSums)

  // Camembert par mode de paiement
  const paymentSums: Record<string, number> = { cb: 0, wave: 0, orange: 0, especes: 0 }
  donations.forEach(d => { if (paymentSums[d.payment] !== undefined) paymentSums[d.payment] += d.amount })
  const paymentData = Object.values(paymentSums)

  // Nouveaux donateurs par semaine (4 dernières semaines)
  const weeks = [0, 1, 2, 3].map(w => {
    const start = new Date()
    start.setDate(start.getDate() - w * 7)
    const end = new Date()
    end.setDate(start.getDate() - 6)
    const weekDonors = new Set(
      donations.filter(d => {
        const dDate = new Date(d.date)
        return dDate >= end && dDate <= start
      }).map(d => d.fullname)
    )
    return weekDonors.size
  }).reverse()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 relative overflow-hidden">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="w-full max-w-6xl z-10">
        {/* Statistiques clés */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8 mt-8">
          <Card className="rounded-2xl shadow-xl bg-white/90 backdrop-blur-sm border-0 flex flex-col items-center py-8">
            <DollarSign className="w-8 h-8 text-green-600 mb-2" />
            <div className="text-lg font-semibold text-gray-700 mb-1">Montant total collecté</div>
            <div className="text-2xl font-bold text-green-700">{formatAmount(totalAmount)} FCFA</div>
          </Card>
          <Card className="rounded-2xl shadow-xl bg-white/90 backdrop-blur-sm border-0 flex flex-col items-center py-8">
            <TrendingUp className="w-8 h-8 text-green-500 mb-2" />
            <div className="text-lg font-semibold text-gray-700 mb-1">Dons aujourd'hui</div>
            <div className="text-2xl font-bold text-green-600">{donationsToday}</div>
          </Card>
          <Card className="rounded-2xl shadow-xl bg-white/90 backdrop-blur-sm border-0 flex flex-col items-center py-8">
            <Users className="w-8 h-8 text-green-500 mb-2" />
            <div className="text-lg font-semibold text-gray-700 mb-1">Donateurs uniques</div>
            <div className="text-2xl font-bold text-green-600">{uniqueDonors}</div>
          </Card>
          <Card className="rounded-2xl shadow-xl bg-white/90 backdrop-blur-sm border-0 flex flex-col items-center py-8">
            <MapPin className="w-8 h-8 text-green-500 mb-2" />
            <div className="text-lg font-semibold text-gray-700 mb-1">Nombre de paroisses</div>
            <div className="text-2xl font-bold text-green-600">{parishes.length}</div>
          </Card>
          <Card className="rounded-2xl shadow-xl bg-white/90 backdrop-blur-sm border-0 flex flex-col items-center py-8">
            <CreditCard className="w-8 h-8 text-green-500 mb-2" />
            <div className="text-lg font-semibold text-gray-700 mb-1">Don moyen</div>
            <div className="text-2xl font-bold text-green-600">{formatAmount(avgDonation)} FCFA</div>
          </Card>
        </div>
        {/* Graphiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card className="rounded-2xl shadow-xl bg-white/90 backdrop-blur-sm border-0 p-6">
            <CardTitle className="mb-4 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-green-600" /> Évolution des dons (30 jours)</CardTitle>
            <Line
              data={{
                labels: daysArr.map(d => d.slice(5)),
                datasets: [
                  {
                    label: "Montant collecté (FCFA)",
                    data: donationsByDay,
                    borderColor: "#16a34a",
                    backgroundColor: "rgba(22,163,74,0.1)",
                    tension: 0.4,
                    fill: true,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </Card>
          <Card className="rounded-2xl shadow-xl bg-white/90 backdrop-blur-sm border-0 p-6">
            <CardTitle className="mb-4 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-green-600" /> Montants collectés par paroisse</CardTitle>
            <Bar
              data={{
                labels: parishLabels,
                datasets: [
                  {
                    label: "Montant (FCFA)",
                    data: parishAmounts,
                    backgroundColor: "#16a34a",
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card className="rounded-2xl shadow-xl bg-white/90 backdrop-blur-sm border-0 p-6">
            <CardTitle className="mb-4 flex items-center gap-2"><PieChart className="w-5 h-5 text-green-600" /> Répartition par type de don</CardTitle>
            <Pie
              data={{
                labels: Object.values(typeLabels),
                datasets: [
                  {
                    data: typeData,
                    backgroundColor: ["#16a34a", "#fbbf24", "#818cf8", "#f87171"],
                  },
                ],
              }}
              options={{ plugins: { legend: { position: "bottom" } } }}
            />
          </Card>
          <Card className="rounded-2xl shadow-xl bg-white/90 backdrop-blur-sm border-0 p-6">
            <CardTitle className="mb-4 flex items-center gap-2"><PieChart className="w-5 h-5 text-green-600" /> Répartition par mode de paiement</CardTitle>
            <Pie
              data={{
                labels: Object.values(paymentLabels),
                datasets: [
                  {
                    data: paymentData,
                    backgroundColor: ["#fbbf24", "#16a34a", "#f87171", "#818cf8"],
                  },
                ],
              }}
              options={{ plugins: { legend: { position: "bottom" } } }}
            />
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card className="rounded-2xl shadow-xl bg-white/90 backdrop-blur-sm border-0 p-6">
            <CardTitle className="mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-600" /> Nouveaux donateurs par semaine</CardTitle>
            <Bar
              data={{
                labels: ["S-3", "S-2", "S-1", "Semaine en cours"],
                datasets: [
                  {
                    label: "Nouveaux donateurs",
                    data: weeks,
                    backgroundColor: "#16a34a",
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </Card>
        </div>
        {/* Accès rapide */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/admin/donations">
            <Card className="rounded-xl shadow bg-green-100 hover:bg-green-200 transition p-4 flex flex-col items-center">
              <DollarSign className="w-6 h-6 text-green-700 mb-1" />
              <div className="font-medium text-green-900">Dons</div>
            </Card>
          </Link>
          <Link href="/admin/paroisses">
            <Card className="rounded-xl shadow bg-green-100 hover:bg-green-200 transition p-4 flex flex-col items-center">
              <MapPin className="w-6 h-6 text-green-700 mb-1" />
              <div className="font-medium text-green-900">Paroisses</div>
            </Card>
          </Link>
          <Link href="/admin/users">
            <Card className="rounded-xl shadow bg-green-100 hover:bg-green-200 transition p-4 flex flex-col items-center">
              <Users className="w-6 h-6 text-green-700 mb-1" />
              <div className="font-medium text-green-900">Utilisateurs</div>
            </Card>
          </Link>
          <Link href="/admin/news">
            <Card className="rounded-xl shadow bg-green-100 hover:bg-green-200 transition p-4 flex flex-col items-center">
              <PieChart className="w-6 h-6 text-green-700 mb-1" />
              <div className="font-medium text-green-900">Actualités</div>
            </Card>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
