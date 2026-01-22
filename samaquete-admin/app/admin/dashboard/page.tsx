"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchDonationStats } from "@/lib/api/donations"
import { getParishes, getChurches, getParishNews } from "@/lib/firestore/services"
import { Users, Church, Newspaper, Heart } from "lucide-react"

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

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenue dans l'interface d'administration
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {claims?.role !== "church_admin" && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paroisses</CardTitle>
                <Church className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.parishes}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Églises</CardTitle>
                <Church className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.churches}</div>
              </CardContent>
            </Card>
          </>
        )}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actualités</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.news}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dons</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.donations.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.donations.totalAmount > 0 
                ? `${stats.donations.totalAmount.toLocaleString()} FCFA`
                : "Aucun don"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
