"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DonationService, DonationStats } from "@/lib/donation-service"
import { motion } from "framer-motion"
import {
    BarChart3,
    Calendar,
    Church,
    DollarSign,
    Eye,
    Loader2,
    Target,
    TrendingUp
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function DonationTransparencyPage() {
  const [stats, setStats] = useState<DonationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("all")

  useEffect(() => {
    loadStats()
  }, [selectedPeriod])

  const loadStats = async () => {
    try {
      setLoading(true)
      const filters: any = {}
      
      if (selectedPeriod !== "all") {
        const now = new Date()
        if (selectedPeriod === "month") {
          filters.startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        } else if (selectedPeriod === "year") {
          filters.startDate = new Date(now.getFullYear(), 0, 1)
        }
      }
      
      const statsData = await DonationService.getDonationStats(filters)
      setStats(statsData)
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error)
      toast.error("Erreur lors du chargement des statistiques")
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("fr-FR").replace(/\s/g, " ")
  }

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "month": return "Ce mois"
      case "year": return "Cette année"
      default: return "Tout le temps"
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-black" />
            <p className="text-black">Chargement des statistiques...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="mb-8 shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-bold text-black mb-1 flex items-center gap-3">
                <Eye className="w-8 h-8" />
                Transparence des dons
              </CardTitle>
              <p className="text-black/80">
                Visualisation publique des montants collectés et de leur utilisation
              </p>
            </div>
            
            <div className="flex gap-2">
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="h-10 rounded px-3 border-blue-200 bg-white/90 text-black"
              >
                <option value="all">Tout le temps</option>
                <option value="year">Cette année</option>
                <option value="month">Ce mois</option>
              </select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {!stats ? (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold text-black mb-2">Aucune donnée disponible</h3>
              <p className="text-black">Les statistiques seront disponibles une fois que des dons auront été effectués.</p>
            </div>
          ) : (
            <>
              {/* Statistiques principales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">Total Collecté</p>
                          <p className="text-2xl font-bold">{formatAmount(stats.totalAmount)} FCFA</p>
                          <p className="text-green-200 text-xs">{getPeriodLabel(selectedPeriod)}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-200" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Nombre de Dons</p>
                          <p className="text-2xl font-bold">{stats.totalDonations}</p>
                          <p className="text-gray-500 text-xs">{getPeriodLabel(selectedPeriod)}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-gray-500" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">Paroisses Actives</p>
                          <p className="text-2xl font-bold">{Object.keys(stats.byParish).length}</p>
                          <p className="text-purple-200 text-xs">Participantes</p>
                        </div>
                        <Church className="w-8 h-8 text-purple-200" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-sm">Don Moyen</p>
                          <p className="text-2xl font-bold">
                            {stats.totalDonations > 0 ? formatAmount(Math.round(stats.totalAmount / stats.totalDonations)) : 0} FCFA
                          </p>
                          <p className="text-orange-200 text-xs">Par don</p>
                        </div>
                        <Target className="w-8 h-8 text-orange-200" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Répartition par type */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <Card className="shadow-lg border-green-100">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-black flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Répartition par Type de Don
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(stats.byType).map(([type, data], index) => (
                        <motion.div
                          key={type}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-black border-green-300">
                              {type === 'prière' ? 'prière' : 
                               type === 'quete' ? 'Quête' : 
                               type === 'cierge' ? 'Cierge' : 
                               type === 'denier' ? 'Denier' : 
                               type === 'evenement' ? 'Événement' : type}
                            </Badge>
                            <span className="text-sm text-black">{data.count} dons</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-black">{formatAmount(data.amount)} FCFA</p>
                            <p className="text-xs text-gray-600">
                              {stats.totalAmount > 0 ? Math.round((data.amount / stats.totalAmount) * 100) : 0}%
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-green-100">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-black flex items-center gap-2">
                      <Church className="w-5 h-5" />
                      Répartition par Paroisse
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(stats.byParish).map(([parishId, data], index) => (
                        <motion.div
                          key={parishId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-black border-blue-300">
                              {parishId}
                            </Badge>
                            <span className="text-sm text-black">{data.count} dons</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-black">{formatAmount(data.amount)} FCFA</p>
                            <p className="text-xs text-gray-600">
                              {stats.totalAmount > 0 ? Math.round((data.amount / stats.totalAmount) * 100) : 0}%
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Méthodes de paiement */}
              <Card className="shadow-lg border-green-100">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-black flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Méthodes de Paiement Utilisées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(stats.byPaymentMethod).map(([method, data], index) => (
                      <motion.div
                        key={method}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                        className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg text-center"
                      >
                        <p className="font-semibold text-black mb-1">
                          {method === 'cb' ? 'Carte Bancaire' :
                           method === 'wave' ? 'Wave' :
                           method === 'orange' ? 'Orange Money' :
                           method === 'especes' ? 'Espèces' : method}
                        </p>
                        <p className="text-2xl font-bold text-black mb-1">{formatAmount(data.amount)} FCFA</p>
                        <p className="text-sm text-black">{data.count} transactions</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Dons récents */}
              {stats.recentDonations.length > 0 && (
                <Card className="shadow-lg border-green-100 mt-8">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-black flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Dons Récents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.recentDonations.slice(0, 10).map((donation, index) => (
                        <motion.div
                          key={donation.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                          className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {donation.donorName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-black">{donation.donorName}</p>
                              <p className="text-sm text-black">{donation.donorPhone}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-black">{formatAmount(donation.amount)} FCFA</p>
                            <Badge 
                              variant={donation.status === 'completed' ? 'default' : 'secondary'}
                              className={donation.status === 'completed' ? 'bg-blue-600' : 'bg-blue-500'}
                            >
                              {donation.status === 'completed' ? 'Complété' : 'En attente'}
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}