"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchDonationStats } from "@/lib/api/donations"
import { getParishes, getChurches, getParishNews } from "@/lib/firestore/services"
import { Users, Church, Newspaper, Heart, RefreshCw, Loader2, Plus, Calendar, Megaphone, Clock, TrendingUp, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChartContainer } from "@/components/ui/chart-container"
import { SimpleChart } from "@/components/ui/simple-chart"

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

  // Fonction pour obtenir le niveau d'administration (UI uniquement)
  const getAdminLevel = () => {
    if (!claims?.role) return "Administration"
    const roleMap: Record<string, string> = {
      super_admin: "Super Administrateur",
      archdiocese_admin: "Archidiocèse de Dakar",
      diocese_admin: "Diocèse",
      parish_admin: "Paroisse",
      church_admin: "Église"
    }
    return roleMap[claims.role] || claims.role.replace("_", " ").toUpperCase()
  }

  // Données mockées pour l'activité récente (UI uniquement)
  const recentActivities = [
    { icon: Newspaper, text: "Nouvelle actualité publiée", date: "Il y a 2 heures", color: "text-blue-600" },
    { icon: Heart, text: "Nouveau don reçu", date: "Il y a 5 heures", color: "text-green-600" },
    { icon: Users, text: "Nouvel utilisateur ajouté", date: "Hier", color: "text-purple-600" },
    { icon: Calendar, text: "Horaire de messe mis à jour", date: "Il y a 2 jours", color: "text-orange-600" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
          <span className="text-lg text-gray-600">Chargement du tableau de bord...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 1. Titre & contexte */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-gray-600 mt-1">
              {getAdminLevel()} • Interface d'administration Jàngu Bi
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

        {/* 2. KPIs principaux - Cartes avec fond blanc, sans gradient */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {claims?.role !== "church_admin" && (
            <>
              <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Paroisses</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.parishes}</p>
                      <p className="text-xs text-gray-500 mt-1">Enregistrées</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Church className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Églises</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.churches}</p>
                      <p className="text-xs text-gray-500 mt-1">Enregistrées</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Church className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Actualités</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.news}</p>
                  <p className="text-xs text-gray-500 mt-1">Publiées</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Newspaper className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Collecté</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.donations.totalAmount > 0 
                      ? `${formatAmount(stats.donations.totalAmount)}`
                      : "0"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stats.donations.total} dons</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. Actions rapides - NOUVELLE SECTION */}
        <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             
              <Link href="/admin/prayer-times/create">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-amber-50 hover:border-amber-300 transition-colors">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium">Ajouter un horaire</span>
                </Button>
              </Link>
              <Link href="/admin/news/create">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-amber-50 hover:border-amber-300 transition-colors">
                  <Megaphone className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium">Publier une annonce</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 4. Activité récente - NOUVELLE SECTION */}
        <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Dernières activités</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center ${activity.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                      <p className="text-xs text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Graphiques statistiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Évolution des dons (Line Chart) */}
          <ChartContainer
            title="Évolution des dons"
            icon={<TrendingUp className="w-5 h-5" />}
          >
            <SimpleChart
              type="line"
              data={[
                { label: "Lun", value: stats.donations.total > 0 ? Math.floor(stats.donations.total * 0.15) : 0 },
                { label: "Mar", value: stats.donations.total > 0 ? Math.floor(stats.donations.total * 0.20) : 0 },
                { label: "Mer", value: stats.donations.total > 0 ? Math.floor(stats.donations.total * 0.18) : 0 },
                { label: "Jeu", value: stats.donations.total > 0 ? Math.floor(stats.donations.total * 0.22) : 0 },
                { label: "Ven", value: stats.donations.total > 0 ? Math.floor(stats.donations.total * 0.25) : 0 },
              ]}
              height={200}
            />
            <p className="text-xs text-gray-500 mt-4 text-center">
              Données des 7 derniers jours (exemple)
            </p>
          </ChartContainer>

          {/* Répartition par type (Bar Chart) */}
          <ChartContainer
            title="Répartition des entités"
            icon={<BarChart3 className="w-5 h-5" />}
          >
            <SimpleChart
              type="bar"
              data={[
                { label: "Paroisses", value: stats.parishes },
                { label: "Églises", value: stats.churches },
                { label: "Actualités", value: stats.news },
                { label: "Dons", value: stats.donations.total },
              ]}
              height={200}
            />
          </ChartContainer>
        </div>

        {/* 5. Informations supplémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Users className="w-5 h-5 text-amber-600" />
                Vue d'ensemble
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Rôle actuel</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {claims?.role?.replace("_", " ").toUpperCase() || "Non défini"}
                  </span>
                </div>
                {claims?.dioceseId && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Diocèse ID</span>
                    <span className="text-sm font-semibold text-gray-900">{claims.dioceseId}</span>
                  </div>
                )}
                {claims?.parishId && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Paroisse ID</span>
                    <span className="text-sm font-semibold text-gray-900">{claims.parishId}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Heart className="w-5 h-5 text-amber-600" />
                Statistiques des dons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Nombre total de dons</span>
                  <span className="text-sm font-semibold text-gray-900">{stats.donations.total}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Montant total</span>
                  <span className="text-sm font-semibold text-green-600">
                    {stats.donations.totalAmount > 0 
                      ? `${formatAmount(stats.donations.totalAmount)} FCFA`
                      : "0 FCFA"}
                  </span>
                </div>
                {stats.donations.total > 0 && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Don moyen</span>
                    <span className="text-sm font-semibold text-gray-900">
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
