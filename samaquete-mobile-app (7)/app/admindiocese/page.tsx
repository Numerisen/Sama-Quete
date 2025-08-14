"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Users, 
  MapPin, 
  DollarSign, 
  Newspaper, 
  Bell, 
  TrendingUp,
  Church,
  Calendar,
  Activity
} from "lucide-react"
import Link from "next/link"

const diocesesList = [
  "Archidiocèse de Dakar",
  "Diocèse de Thiès",
  "Diocèse de Kaolack",
  "Diocèse de Ziguinchor",
  "Diocèse de Kolda",
  "Diocèse de Tambacounda",
  "Diocèse de Saint-Louis du Sénégal",
]

export default function AdminDioceseDashboard() {
  const searchParams = useSearchParams()
  const diocese = searchParams.get('diocese') || 'Archidiocèse de Dakar'
  
  const [stats, setStats] = useState({
    parishes: 0,
    users: 0,
    donations: 0,
    news: 0,
    notifications: 0,
    recentActivity: [] as Array<{
      id: number;
      type: string;
      message: string;
      time: string;
    }>
  })

  useEffect(() => {
    // Simuler le chargement des statistiques filtrées par diocèse
    const loadStats = () => {
      // Récupérer les données du localStorage et filtrer par diocèse
      const parishes = JSON.parse(localStorage.getItem("admin_parishes") || "[]")
      const dioceseParishes = parishes.filter((p: any) => p.diocese === diocese)
      
      const users = JSON.parse(localStorage.getItem("admin_users") || "[]")
      const dioceseUsers = users.filter((u: any) => u.diocese === diocese)
      
      const donations = JSON.parse(localStorage.getItem("admin_donations") || "[]")
      const dioceseDonations = donations.filter((d: any) => d.diocese === diocese)
      
      const news = JSON.parse(localStorage.getItem("admin_news") || "[]")
      const dioceseNews = news.filter((n: any) => n.diocese === diocese)
      
      const notifications = JSON.parse(localStorage.getItem("admin_notifications") || "[]")
      const dioceseNotifications = notifications.filter((n: any) => n.diocese === diocese)

      setStats({
        parishes: dioceseParishes.length,
        users: dioceseUsers.length,
        donations: dioceseDonations.length,
        news: dioceseNews.length,
        notifications: dioceseNotifications.length,
        recentActivity: [
          {
            id: 1,
            type: "parish",
            message: `${dioceseParishes.length} paroisses dans ${diocese}`,
            time: "Maintenant"
          },
          {
            id: 2,
            type: "donation",
            message: `${dioceseDonations.length} donations enregistrées`,
            time: "Il y a 2h"
          },
          {
            id: 3,
                  type: "news" as const,
            message: `${dioceseNews.length} actualités publiées`,
            time: "Il y a 1j"
          }
        ]
      })
    }

    loadStats()
  }, [diocese])

  const statsCards = [
    {
      title: "Paroisses",
      value: stats.parishes,
      icon: Church,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      link: `/admindiocese/paroisses?diocese=${encodeURIComponent(diocese)}`
    },
    {
      title: "Utilisateurs",
      value: stats.users,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
      link: `/admindiocese/users?diocese=${encodeURIComponent(diocese)}`
    },
    {
      title: "Donations",
      value: stats.donations,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      link: `/admindiocese/donations?diocese=${encodeURIComponent(diocese)}`
    },
    {
      title: "Actualités",
      value: stats.news,
      icon: Newspaper,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      link: `/admindiocese/news?diocese=${encodeURIComponent(diocese)}`
    },
    {
      title: "Notifications",
      value: stats.notifications,
      icon: Bell,
      color: "text-red-600",
      bgColor: "bg-red-100",
      link: `/admindiocese/notifications?diocese=${encodeURIComponent(diocese)}`
    }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-blue-900 mb-2">
          Dashboard - {diocese}
        </h1>
        <p className="text-blue-800/80 text-lg">
          Vue d'ensemble des activités de votre diocèse
        </p>
      </motion.div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={card.link}>
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white/80">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {card.title}
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        {card.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${card.bgColor}`}>
                      <card.icon className={`w-6 h-6 ${card.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 bg-white/80 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Activity className="w-5 h-5" />
                Activité récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/50">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">
                        {activity.message}
                      </p>
                      <p className="text-xs text-blue-600">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 bg-white/80 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <TrendingUp className="w-5 h-5" />
                Actions rapides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href={`/admindiocese/paroisses/create?diocese=${encodeURIComponent(diocese)}`}>
                  <Button className="w-full justify-start bg-blue-900 hover:bg-blue-800">
                    <Church className="w-4 h-4 mr-2" />
                    Ajouter une paroisse
                  </Button>
                </Link>
                <Link href={`/admindiocese/news/create?diocese=${encodeURIComponent(diocese)}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Newspaper className="w-4 h-4 mr-2" />
                    Publier une actualité
                  </Button>
                </Link>
                <Link href={`/admindiocese/donations?diocese=${encodeURIComponent(diocese)}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Voir les donations
                  </Button>
                </Link>
                <Link href={`/admindiocese/liturgy?diocese=${encodeURIComponent(diocese)}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Gérer la liturgie
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
