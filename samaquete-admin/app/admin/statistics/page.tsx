"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchDonationStats, fetchDonations } from "@/lib/api/donations"
import { getParishes, getChurches, getDioceses } from "@/lib/firestore/services"
import { Users, Church, Newspaper, Heart, TrendingUp, BarChart3, PieChart, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChartContainer } from "@/components/ui/chart-container"
import { SimpleChart } from "@/components/ui/simple-chart"
import { StatsCard } from "@/components/ui/stats-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function StatisticsPage() {
  const { claims } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    parishes: 0,
    churches: 0,
    dioceses: 0,
    donations: {
      total: 0,
      totalAmount: 0,
      completed: 0,
      pending: 0,
    },
  })
  // Stocker les données complètes pour afficher les détails
  const [entitiesData, setEntitiesData] = useState<{
    parishes: any[]
    churches: any[]
    dioceses: any[]
    donations: any[] // Stocker les dons réels
  }>({
    parishes: [],
    churches: [],
    dioceses: [],
    donations: [],
  })
  
  // Filtres pour l'évolution des dons
  const [periodType, setPeriodType] = useState<"month" | "week" | "year">("month") // Mois par défaut
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1) // 1-12
  const [selectedWeek, setSelectedWeek] = useState<number>(1) // Semaine de l'année

  useEffect(() => {
    loadStatistics()
  }, [claims])

  async function loadStatistics() {
    try {
      setLoading(true)
      
      // Super Admin voit TOUT (ce qu'il crée et ce qu'il ne crée pas)
      // Les autres voient selon leur scope
      const dioceseId = (claims?.role === "super_admin" || claims?.role === "archdiocese_admin") 
        ? undefined 
        : claims?.dioceseId;
      const parishId = (claims?.role === "super_admin" || 
                        claims?.role === "archdiocese_admin" || 
                        claims?.role === "diocese_admin") 
        ? undefined 
        : claims?.parishId;
      
      // Charger toutes les données en parallèle
      const results = await Promise.allSettled([
        getParishes(dioceseId),
        getChurches(parishId, dioceseId), // Super admin voit toutes les églises
        fetchDonations(parishId, dioceseId), // Charger les dons réels
        fetchDonationStats(parishId, dioceseId),
        // Charger les diocèses seulement pour super admin
        claims?.role === "super_admin" ? getDioceses() : Promise.resolve([]),
      ])
      
      const parishes = results[0].status === 'fulfilled' ? results[0].value : [];
      const churches = results[1].status === 'fulfilled' ? results[1].value : [];
      const donations = results[2].status === 'fulfilled' ? results[2].value : [];
      const donationStats = results[3].status === 'fulfilled' ? results[3].value : {
        total: 0,
        completed: 0,
        pending: 0,
        failed: 0,
        totalAmount: 0,
      };
      const dioceses = results[4].status === 'fulfilled' ? results[4].value : [];

      // Stocker les données complètes pour afficher les détails
      setEntitiesData({
        parishes,
        churches,
        dioceses,
        donations, // Stocker les dons réels
      })

      setStats({
        parishes: parishes.length,
        churches: churches.length,
        dioceses: dioceses.length,
        donations: {
          total: donationStats.total,
          totalAmount: donationStats.totalAmount,
          completed: donationStats.completed,
          pending: donationStats.pending,
        },
      })
    } catch (error) {
      console.error("Erreur chargement statistiques:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("fr-FR").replace(/\s/g, " ")
  }

  // Données réelles pour l'évolution des dons (groupées par période)
  const getDonationEvolutionData = () => {
    const donations = entitiesData.donations.filter(d => d.status === "completed")
    
    if (donations.length === 0) {
      // Retourner des données vides selon le type de période
      if (periodType === "month") {
        return Array.from({ length: 12 }, (_, i) => ({
          label: new Date(selectedYear, i, 1).toLocaleDateString("fr-FR", { month: "short" }),
          value: 0,
        }))
      } else if (periodType === "week") {
        return Array.from({ length: 4 }, (_, i) => ({
          label: `Sem ${i + 1}`,
          value: 0,
        }))
      } else {
        return Array.from({ length: 5 }, (_, i) => ({
          label: `${selectedYear - 4 + i}`,
          value: 0,
        }))
      }
    }

    if (periodType === "month") {
      // Grouper par mois de l'année sélectionnée
      const months: number[] = Array(12).fill(0)
      
      donations.forEach(donation => {
        const donationDate = donation.createdAt instanceof Date 
          ? donation.createdAt 
          : new Date(donation.createdAt)
        
        if (donationDate.getFullYear() === selectedYear) {
          const monthIndex = donationDate.getMonth() // 0-11
          months[monthIndex] += donation.amount
        }
      })

      return months.map((amount, index) => ({
        label: new Date(selectedYear, index, 1).toLocaleDateString("fr-FR", { month: "short" }),
        value: Math.round(amount),
      }))
    } else if (periodType === "week") {
      // Grouper par semaine du mois sélectionné
      const firstDay = new Date(selectedYear, selectedMonth - 1, 1)
      const lastDay = new Date(selectedYear, selectedMonth, 0)
      const weeksInMonth = Math.ceil((lastDay.getDate() + firstDay.getDay()) / 7)
      const weeks: number[] = Array(weeksInMonth).fill(0)
      
      donations.forEach(donation => {
        const donationDate = donation.createdAt instanceof Date 
          ? donation.createdAt 
          : new Date(donation.createdAt)
        
        if (donationDate.getFullYear() === selectedYear && donationDate.getMonth() === selectedMonth - 1) {
          const dayOfMonth = donationDate.getDate()
          const weekIndex = Math.floor((dayOfMonth + firstDay.getDay() - 1) / 7)
          if (weekIndex >= 0 && weekIndex < weeksInMonth) {
            weeks[weekIndex] += donation.amount
          }
        }
      })

      return weeks.map((amount, index) => ({
        label: `Sem ${index + 1}`,
        value: Math.round(amount),
      }))
    } else {
      // Grouper par année (5 dernières années)
      const years: Record<number, number> = {}
      const currentYear = new Date().getFullYear()
      
      for (let i = 0; i < 5; i++) {
        years[currentYear - 4 + i] = 0
      }
      
      donations.forEach(donation => {
        const donationDate = donation.createdAt instanceof Date 
          ? donation.createdAt 
          : new Date(donation.createdAt)
        const year = donationDate.getFullYear()
        if (years.hasOwnProperty(year)) {
          years[year] += donation.amount
        }
      })

      return Object.entries(years)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([year, amount]) => ({
          label: year,
          value: Math.round(amount),
        }))
    }
  }

  // Obtenir les années disponibles (basées sur les dons)
  const getAvailableYears = () => {
    const donations = entitiesData.donations.filter(d => d.status === "completed")
    const years = new Set<number>()
    const currentYear = new Date().getFullYear()
    
    donations.forEach(donation => {
      const donationDate = donation.createdAt instanceof Date 
        ? donation.createdAt 
        : new Date(donation.createdAt)
      years.add(donationDate.getFullYear())
    })
    
    // Ajouter les 5 dernières années au minimum
    for (let i = 0; i < 5; i++) {
      years.add(currentYear - i)
    }
    
    return Array.from(years).sort((a, b) => b - a)
  }

  const getEntityDistributionData = () => {
    // Pour la répartition, on affiche le nombre total (sans Actualités)
    const data = [
      { label: "Paroisses", value: stats.parishes },
      { label: "Églises", value: stats.churches },
    ]
    
    // Ajouter les diocèses seulement pour super admin
    if (claims?.role === "super_admin") {
      data.unshift({ label: "Diocèses", value: stats.dioceses })
    }
    
    return data
  }

  // Répartition des églises par paroisse (pour le graphique)
  const getChurchesByParishData = () => {
    // Compter les églises par paroisse
    const parishCounts: Record<string, number> = {}
    entitiesData.churches.forEach(church => {
      const parishId = church.parishId || "Sans paroisse"
      parishCounts[parishId] = (parishCounts[parishId] || 0) + 1
    })
    
    // Convertir en tableau et trier par nombre décroissant
    return Object.entries(parishCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10) // Limiter à 10 paroisses max
      .map(([parishId, count]) => ({
        label: parishId.length > 12 ? parishId.substring(0, 12) + "..." : parishId,
        value: count,
        fullLabel: parishId,
      }))
  }

  const getDioceseDistributionData = () => {
    // Données réelles : répartition des dons par diocèse
    if (claims?.role !== "super_admin") return []
    
    const donations = entitiesData.donations.filter(d => d.status === "completed")
    if (donations.length === 0) {
      return []
    }

    // Grouper les dons par diocèse
    const dioceseCounts: Record<string, number> = {}
    
    donations.forEach(donation => {
      // Trouver le diocèse via la paroisse
      const parish = entitiesData.parishes.find(p => p.parishId === donation.parishId)
      if (parish && parish.dioceseId) {
        const diocese = entitiesData.dioceses.find(d => d.dioceseId === parish.dioceseId)
        const dioceseName = diocese?.name || parish.dioceseId || "Autres"
        dioceseCounts[dioceseName] = (dioceseCounts[dioceseName] || 0) + donation.amount
      } else {
        dioceseCounts["Autres"] = (dioceseCounts["Autres"] || 0) + donation.amount
      }
    })

    // Convertir en tableau et trier par montant décroissant
    return Object.entries(dioceseCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([dioceseName, amount]) => ({
        label: dioceseName,
        value: Math.round(amount),
      }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            <span className="text-lg text-gray-600">Chargement des statistiques...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
            <p className="text-gray-600 mt-1">
              Analyses et statistiques détaillées
            </p>
          </div>
          <Button 
            onClick={loadStatistics} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
        </div>

        {/* KPIs principaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {claims?.role === "super_admin" && (
            <StatsCard
              title="Diocèses"
              value={stats.dioceses}
              subtitle="Enregistrés"
              icon={<Church className="w-6 h-6" />}
              iconColor="text-blue-600"
              tooltip={`Nombre réel: ${stats.dioceses} diocèse${stats.dioceses > 1 ? "s" : ""}`}
            />
          )}
          {claims?.role !== "church_admin" && (
            <>
              <StatsCard
                title="Paroisses"
                value={stats.parishes}
                subtitle="Enregistrées"
                icon={<Church className="w-6 h-6" />}
                iconColor="text-purple-600"
                tooltip={`Nombre réel: ${stats.parishes} paroisse${stats.parishes > 1 ? "s" : ""}`}
              />
              <StatsCard
                title="Églises"
                value={stats.churches}
                subtitle="Enregistrées"
                icon={<Church className="w-6 h-6" />}
                iconColor="text-indigo-600"
                tooltip={`Nombre réel: ${stats.churches} église${stats.churches > 1 ? "s" : ""}`}
              />
            </>
          )}
          <StatsCard
            title="Total Collecté"
            value={stats.donations.totalAmount > 0 ? `${formatAmount(stats.donations.totalAmount)} FCFA` : "0 FCFA"}
            subtitle={`${stats.donations.total} dons`}
            icon={<Heart className="w-6 h-6" />}
            iconColor="text-green-600"
            tooltip={`Montant réel: ${formatAmount(stats.donations.totalAmount)} FCFA • ${stats.donations.total} don${stats.donations.total > 1 ? "s" : ""}`}
          />
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Évolution des dons */}
          <ChartContainer
            title="Évolution des dons"
            icon={<TrendingUp className="w-5 h-5" />}
          >
            {/* Filtres pour la période */}
            <div className="mb-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[120px]">
                  <Label htmlFor="period-type" className="text-xs text-gray-600 mb-1 block">
                    Période
                  </Label>
                  <Select value={periodType} onValueChange={(value: "month" | "week" | "year") => setPeriodType(value)}>
                    <SelectTrigger id="period-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Mois</SelectItem>
                      <SelectItem value="week">Semaine</SelectItem>
                      <SelectItem value="year">Année</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1 min-w-[120px]">
                  <Label htmlFor="year" className="text-xs text-gray-600 mb-1 block">
                    Année
                  </Label>
                  <Select 
                    value={selectedYear.toString()} 
                    onValueChange={(value) => setSelectedYear(Number(value))}
                  >
                    <SelectTrigger id="year">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableYears().map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {periodType === "week" && (
                  <div className="flex-1 min-w-[120px]">
                    <Label htmlFor="month" className="text-xs text-gray-600 mb-1 block">
                      Mois
                    </Label>
                    <Select 
                      value={selectedMonth.toString()} 
                      onValueChange={(value) => setSelectedMonth(Number(value))}
                    >
                      <SelectTrigger id="month">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                          <SelectItem key={month} value={month.toString()}>
                            {new Date(selectedYear, month - 1, 1).toLocaleDateString("fr-FR", { month: "long" })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
            
            <SimpleChart
              type="line"
              data={getDonationEvolutionData()}
              height={250}
            />
            <p className="text-xs text-gray-500 mt-4 text-center">
              {periodType === "month" 
                ? `Évolution mensuelle pour ${selectedYear} (données réelles)`
                : periodType === "week"
                ? `Évolution hebdomadaire pour ${new Date(selectedYear, selectedMonth - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })} (données réelles)`
                : `Évolution annuelle sur 5 ans (données réelles)`
              }
            </p>
          </ChartContainer>

          {/* Répartition des entités */}
          <ChartContainer
            title="Répartition des entités"
            icon={<BarChart3 className="w-5 h-5" />}
          >
            <SimpleChart
              type="bar"
              data={getEntityDistributionData()}
              height={250}
            />
          </ChartContainer>
        </div>

        {/* Répartition des églises par paroisse */}
        {entitiesData.churches.length > 0 && (
          <ChartContainer
            title={`Répartition des églises par paroisse (${entitiesData.churches.length} église${entitiesData.churches.length > 1 ? "s" : ""})`}
            icon={<Church className="w-5 h-5" />}
            className="lg:col-span-2"
          >
            <div className="space-y-4">
              <SimpleChart
                type="bar"
                data={getChurchesByParishData().map(p => ({ label: p.label, value: p.value }))}
                height={200}
              />
              {getChurchesByParishData().length < Object.keys(entitiesData.churches.reduce((acc: Record<string, number>, church) => {
                const parishId = church.parishId || "Sans paroisse"
                acc[parishId] = (acc[parishId] || 0) + 1
                return acc
              }, {})).length && (
                <p className="text-xs text-gray-500 text-center">
                  Affichage des 10 paroisses avec le plus d'églises
                </p>
              )}
            </div>
          </ChartContainer>
        )}

        {/* Liste détaillée des églises (Super Admin voit toutes) */}
        {entitiesData.churches.length > 0 && (
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Church className="w-5 h-5 text-amber-600" />
                Liste des églises ({entitiesData.churches.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {entitiesData.churches.map((church) => (
                  <div
                    key={church.churchId}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <p className="font-medium text-gray-900 text-sm">{church.name}</p>
                    <p className="text-xs text-gray-600 mt-1">ID: {church.churchId}</p>
                    {church.parishId && (
                      <p className="text-xs text-gray-500 mt-1">Paroisse: {church.parishId}</p>
                    )}
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        church.isActive 
                          ? "bg-green-100 text-green-700" 
                          : "bg-gray-200 text-gray-600"
                      }`}>
                        {church.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liste détaillée des paroisses (Super Admin voit toutes) */}
        {claims?.role === "super_admin" && entitiesData.parishes.length > 0 && (
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Church className="w-5 h-5 text-amber-600" />
                Liste des paroisses ({entitiesData.parishes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {entitiesData.parishes.map((parish) => (
                  <div
                    key={parish.parishId}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <p className="font-medium text-gray-900 text-sm">{parish.name}</p>
                    <p className="text-xs text-gray-600 mt-1">ID: {parish.parishId}</p>
                    {parish.dioceseId && (
                      <p className="text-xs text-gray-500 mt-1">Diocèse: {parish.dioceseId}</p>
                    )}
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        parish.isActive 
                          ? "bg-green-100 text-green-700" 
                          : "bg-gray-200 text-gray-600"
                      }`}>
                        {parish.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Répartition par diocèse (Super Admin uniquement) */}
        {claims?.role === "super_admin" && stats.donations.total > 0 && getDioceseDistributionData().length > 0 && (
          <ChartContainer
            title="Répartition des dons par diocèse"
            icon={<PieChart className="w-5 h-5" />}
            className="lg:col-span-2"
          >
            <SimpleChart
              type="pie"
              data={getDioceseDistributionData()}
              height={300}
            />
            <p className="text-xs text-gray-500 mt-4 text-center">
              Distribution des dons par archidiocèse/diocèse (données réelles)
            </p>
          </ChartContainer>
        )}

        {/* Statistiques détaillées des dons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-600" />
                Dons complétés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.donations.completed}</div>
              <p className="text-sm text-gray-600 mt-2">
                {stats.donations.total > 0 
                  ? `${Math.round((stats.donations.completed / stats.donations.total) * 100)}% du total`
                  : "Aucun don"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-yellow-600" />
                Dons en attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.donations.pending}</div>
              <p className="text-sm text-gray-600 mt-2">
                {stats.donations.total > 0 
                  ? `${Math.round((stats.donations.pending / stats.donations.total) * 100)}% du total`
                  : "Aucun don"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-amber-600" />
                Don moyen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">
                {stats.donations.completed > 0 
                  ? `${formatAmount(Math.round(stats.donations.totalAmount / stats.donations.completed))}`
                  : "0"}
              </div>
              <p className="text-sm text-gray-600 mt-2">FCFA par don complété</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
