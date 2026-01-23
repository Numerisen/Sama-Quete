"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchDonationStats } from "@/lib/api/donations"
import { getParishes, getChurches, getParishNews } from "@/lib/firestore/services"
import { Users, Church, Newspaper, Heart, RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const { claims } = useAuth()
  const [stats, setStats] = useState({
    parishes: 0,
    churches: 0,
    news: 0,
    donations: {
      total: 0,
      totalAmount: 0,
    },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        console.log("📊 Chargement des stats avec claims:", claims);
        
        // Super Admin et Archdiocese Admin voient tout, les autres voient selon leur scope
        const dioceseId = (claims?.role === "super_admin" || claims?.role === "archdiocese_admin") 
          ? undefined 
          : claims?.dioceseId;
        const parishId = (claims?.role === "super_admin" || 
                          claims?.role === "archdiocese_admin" || 
                          claims?.role === "diocese_admin") 
          ? undefined 
          : claims?.parishId;
        
        console.log("🔍 Filtres appliqués:", { parishId, dioceseId, role: claims?.role });
        
        // Utiliser Promise.allSettled pour que les erreurs d'une requête n'empêchent pas les autres
        const results = await Promise.allSettled([
          getParishes(dioceseId),
          getChurches(parishId, dioceseId),
          getParishNews(parishId), // Utiliser parish_news (actualités de l'app mobile)
          fetchDonationStats(parishId, dioceseId),
        ])
        
        // Extraire les résultats (ou valeurs par défaut en cas d'erreur)
        const parishes = results[0].status === 'fulfilled' ? results[0].value : [];
        const churches = results[1].status === 'fulfilled' ? results[1].value : [];
        const news = results[2].status === 'fulfilled' ? results[2].value : [];
        const donationStats = results[3].status === 'fulfilled' ? results[3].value : {
          total: 0,
          completed: 0,
          pending: 0,
          failed: 0,
          totalAmount: 0,
        };
        
        // Logger les erreurs si nécessaire
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            const names = ['parishes', 'churches', 'news', 'donationStats'];
            console.error(`❌ Erreur chargement ${names[index]}:`, result.reason);
          }
        });

        console.log("📊 Données récupérées:", {
          parishes: parishes.length,
          churches: churches.length,
          news: news.length,
          donations: {
            total: donationStats.total,
            completed: donationStats.completed,
            pending: donationStats.pending,
            failed: donationStats.failed,
            totalAmount: donationStats.totalAmount,
          },
        });

        setStats({
          parishes: parishes.length,
          churches: churches.length,
          news: news.length,
          donations: {
            total: donationStats.total,
            totalAmount: donationStats.totalAmount,
          },
        })
      } catch (error) {
        console.error("❌ Erreur chargement stats:", error)
        // En cas d'erreur, on garde les valeurs par défaut mais on ne bloque pas l'affichage
        setStats(prev => ({
          ...prev,
          donations: { total: 0, totalAmount: 0 },
        }))
      } finally {
        setLoading(false)
      }
    }

    if (claims) {
      loadStats()
    } else {
      console.log("⏳ En attente des claims...");
      setLoading(false);
    }
  }, [claims])

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("fr-FR").replace(/\s/g, " ")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
          <span className="text-lg text-gray-600">Chargement du tableau de bord...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête avec actions */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-gray-600 mt-1">
              Bienvenue dans l'interface d'administration Sama-Quête
            </p>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {claims?.role !== "church_admin" && (
            <>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Paroisses</p>
                      <p className="text-3xl font-bold">{stats.parishes}</p>
                      <p className="text-blue-100 text-sm mt-1">Enregistrées</p>
                    </div>
                    <Church className="w-12 h-12 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Églises</p>
                      <p className="text-3xl font-bold">{stats.churches}</p>
                      <p className="text-purple-100 text-sm mt-1">Enregistrées</p>
                    </div>
                    <Church className="w-12 h-12 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Actualités</p>
                  <p className="text-3xl font-bold">{stats.news}</p>
                  <p className="text-orange-100 text-sm mt-1">Publiées</p>
                </div>
                <Newspaper className="w-12 h-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Collecté</p>
                  <p className="text-3xl font-bold">
                    {stats.donations.totalAmount > 0 
                      ? `${formatAmount(stats.donations.totalAmount)} FCFA`
                      : "0 FCFA"}
                  </p>
                  <p className="text-green-100 text-sm mt-1">{stats.donations.total} dons</p>
                </div>
                <Heart className="w-12 h-12 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informations supplémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Vue d'ensemble
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Rôle actuel</span>
                  <span className="font-semibold text-gray-900">
                    {claims?.role?.replace("_", " ").toUpperCase() || "Non défini"}
                  </span>
                </div>
                {claims?.dioceseId && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Diocèse ID</span>
                    <span className="font-semibold text-gray-900">{claims.dioceseId}</span>
                  </div>
                )}
                {claims?.parishId && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Paroisse ID</span>
                    <span className="font-semibold text-gray-900">{claims.parishId}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-500" />
                Statistiques des dons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Nombre total de dons</span>
                  <span className="font-semibold text-gray-900">{stats.donations.total}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Montant total</span>
                  <span className="font-semibold text-green-600">
                    {stats.donations.totalAmount > 0 
                      ? `${formatAmount(stats.donations.totalAmount)} FCFA`
                      : "0 FCFA"}
                  </span>
                </div>
                {stats.donations.total > 0 && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Don moyen</span>
                    <span className="font-semibold text-gray-900">
                      {formatAmount(Math.round(stats.donations.totalAmount / stats.donations.total))} FCFA
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
