"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Calendar, Users, MapPin, Clock, Heart } from "lucide-react"

interface NewsScreenProps {
  setCurrentScreen: (screen: string) => void
}

export default function NewsScreen({ setCurrentScreen }: NewsScreenProps) {
  const news = [
    {
      id: 1,
      title: "Célébration de la Journée Mondiale de la Jeunesse",
      excerpt:
        "Rejoignez-nous pour une journée spéciale dédiée aux jeunes de notre paroisse avec des activités spirituelles et culturelles.",
      date: "25 Janvier 2024",
      time: "14:00",
      location: "Salle paroissiale",
      category: "Événement",
      image: "/placeholder.svg?height=200&width=300",
      priority: "high",
    },
    {
      id: 2,
      title: "Collecte pour les familles nécessiteuses",
      excerpt:
        "Notre paroisse organise une collecte de vivres et de vêtements pour soutenir les familles en difficulté de notre communauté.",
      date: "20 Janvier 2024",
      time: "Après chaque messe",
      location: "Entrée de l'église",
      category: "Solidarité",
      image: "/placeholder.svg?height=200&width=300",
      priority: "medium",
    },
    {
      id: 3,
      title: "Retraite spirituelle de Carême",
      excerpt:
        "Préparez-vous au temps du Carême avec une retraite spirituelle de trois jours animée par le Père Antoine Diop.",
      date: "10 Février 2024",
      time: "09:00 - 17:00",
      location: "Centre spirituel",
      category: "Formation",
      image: "/placeholder.svg?height=200&width=300",
      priority: "high",
    },
    {
      id: 4,
      title: "Nouveau groupe de prière des mères",
      excerpt:
        "Formation d'un nouveau groupe de prière dédié aux mères de famille. Première rencontre le samedi prochain.",
      date: "27 Janvier 2024",
      time: "16:00",
      location: "Salle de catéchèse",
      category: "Groupe",
      image: "/placeholder.svg?height=200&width=300",
      priority: "medium",
    },
    {
      id: 5,
      title: "Travaux de rénovation de l'église",
      excerpt:
        "Début des travaux de rénovation de la toiture de l'église. Merci pour votre patience et vos contributions.",
      date: "15 Janvier 2024",
      time: "08:00",
      location: "Église principale",
      category: "Information",
      image: "/placeholder.svg?height=200&width=300",
      priority: "low",
    },
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Événement":
        return "bg-blue-100 text-blue-700"
      case "Solidarité":
        return "bg-green-100 text-green-700"
      case "Formation":
        return "bg-purple-100 text-purple-700"
      case "Groupe":
        return "bg-amber-100 text-amber-700"
      case "Information":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return "🔥"
      case "medium":
        return "⭐"
      case "low":
        return "📢"
      default:
        return "📢"
    }
  }

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 80 }}
        className="bg-gradient-to-r from-green-500 to-green-600 p-6 pb-8 rounded-b-3xl shadow-xl"
      >
        <div className="flex items-center space-x-4 mb-4">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentScreen("dashboard")}
              className="text-white hover:bg-white/20 rounded-full p-3"
            >
              <ArrowRight className="w-6 h-6 rotate-180" />
            </Button>
          </motion.div>
          <div>
            <h2 className="text-3xl font-bold text-white">Actualités</h2>
            <p className="text-green-100 text-lg">Vie paroissiale</p>
          </div>
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
        >
          <Card className="bg-white/20 backdrop-blur-sm border-0 p-4 rounded-2xl">
            <div className="text-center text-white">
              <Users className="w-6 h-6 mx-auto mb-2" />
              <div className="font-bold text-lg">5 nouvelles actualités</div>
              <div className="text-green-100 text-sm">Cette semaine</div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <div className="p-6 -mt-4">
        {/* Featured news */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-6"
        >
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
            <div className="relative">
              <img src={news[0].image || "/placeholder.svg"} alt={news[0].title} className="w-full h-48 object-cover" />
              <div className="absolute top-4 left-4">
                <Badge className={`${getCategoryColor(news[0].category)} border-0 font-semibold`}>
                  {getPriorityIcon(news[0].priority)} {news[0].category}
                </Badge>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-gray-800 text-xl mb-3">{news[0].title}</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">{news[0].excerpt}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{news[0].date}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{news[0].time}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{news[0].location}</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Other news */}
        <div className="space-y-4">
          {news.slice(1).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-500 rounded-2xl overflow-hidden cursor-pointer">
                <div className="flex">
                  <img src={item.image || "/placeholder.svg"} alt={item.title} className="w-24 h-24 object-cover" />
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-800 text-lg leading-tight">{item.title}</h4>
                      <Badge className={`${getCategoryColor(item.category)} border-0 text-xs ml-2`}>
                        {getPriorityIcon(item.priority)}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3" />
                        <span>{item.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-20">{item.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-green-500 to-green-600 border-0 shadow-xl p-6 rounded-2xl">
            <div className="text-center text-white">
              <Heart className="w-8 h-8 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Restez connecté</h3>
              <p className="text-green-100 mb-4">
                Activez les notifications pour ne manquer aucune actualité de votre paroisse
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className="bg-white text-green-600 hover:bg-gray-50 rounded-xl font-semibold px-6"
                  onClick={() => setCurrentScreen("notifications")}
                >
                  Gérer les notifications
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
