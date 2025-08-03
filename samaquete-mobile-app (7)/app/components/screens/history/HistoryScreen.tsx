"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Heart, Star, TrendingUp, Calendar, Filter } from "lucide-react"

interface HistoryScreenProps {
  setCurrentScreen: (screen: string) => void
}

export default function HistoryScreen({ setCurrentScreen }: HistoryScreenProps) {
  const donationHistory = [
    {
      id: 1,
      type: "Quête dominicale",
      amount: "5,000 FCFA",
      date: "15 Jan 2024",
      time: "09:30",
      status: "completed",
      method: "Wave",
      parish: "Cathédrale du Souvenir",
    },
    {
      id: 2,
      type: "Cierge Pascal",
      amount: "2,000 FCFA",
      date: "10 Jan 2024",
      time: "14:15",
      status: "completed",
      method: "Orange Money",
      parish: "Cathédrale du Souvenir",
    },
    {
      id: 3,
      type: "Messe d'intention",
      amount: "10,000 FCFA",
      date: "05 Jan 2024",
      time: "16:45",
      status: "completed",
      method: "Carte bancaire",
      parish: "Cathédrale du Souvenir",
    },
    {
      id: 4,
      type: "Denier du culte",
      amount: "15,000 FCFA",
      date: "01 Jan 2024",
      time: "11:20",
      status: "completed",
      method: "Wave",
      parish: "Cathédrale du Souvenir",
    },
    {
      id: 5,
      type: "Quête dominicale",
      amount: "3,000 FCFA",
      date: "31 Déc 2023",
      time: "09:30",
      status: "completed",
      method: "Orange Money",
      parish: "Cathédrale du Souvenir",
    },
    {
      id: 6,
      type: "Cierge Pascal",
      amount: "1,500 FCFA",
      date: "25 Déc 2023",
      time: "20:00",
      status: "completed",
      method: "Carte bancaire",
      parish: "Cathédrale du Souvenir",
    },
  ]

  const monthlyStats = {
    janvier: { total: 32000, count: 4 },
    decembre: { total: 15500, count: 3 },
    total: 47500,
    average: 7916,
  }

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 80 }}
        className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 pb-8 rounded-b-3xl shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
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
              <h2 className="text-3xl font-bold text-white">Historique</h2>
              <p className="text-amber-100 text-lg">Vos contributions spirituelles</p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 rounded-full p-3">
              <Filter className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          >
            <Card className="bg-white/20 backdrop-blur-sm border-0 p-3 rounded-2xl">
              <div className="text-center text-white">
                <TrendingUp className="w-5 h-5 mx-auto mb-1" />
                <div className="text-lg font-bold">{monthlyStats.total.toLocaleString()}</div>
                <div className="text-amber-100 text-xs">Total FCFA</div>
              </div>
            </Card>
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
          >
            <Card className="bg-white/20 backdrop-blur-sm border-0 p-3 rounded-2xl">
              <div className="text-center text-white">
                <Calendar className="w-5 h-5 mx-auto mb-1" />
                <div className="text-lg font-bold">{donationHistory.length}</div>
                <div className="text-amber-100 text-xs">Contributions</div>
              </div>
            </Card>
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
          >
            <Card className="bg-white/20 backdrop-blur-sm border-0 p-3 rounded-2xl">
              <div className="text-center text-white">
                <Star className="w-5 h-5 mx-auto mb-1" />
                <div className="text-lg font-bold">{Math.round(monthlyStats.average).toLocaleString()}</div>
                <div className="text-amber-100 text-xs">Moyenne</div>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      <div className="p-6 -mt-4">
        {/* Timeline */}
        <div className="space-y-4">
          {donationHistory.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
              className="relative"
            >
              {/* Timeline line */}
              {index < donationHistory.length - 1 && (
                <div className="absolute left-8 top-20 w-0.5 h-8 bg-gradient-to-b from-amber-300 to-amber-400" />
              )}

              <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-500 p-6 ml-4 rounded-2xl">
                  <div className="flex items-start space-x-4">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg relative z-10"
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Heart className="w-8 h-8 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">{item.type}</h3>
                          <p className="text-gray-500 text-sm">{item.parish}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-0 font-semibold">Complété</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Date & Heure</div>
                          <div className="font-medium text-gray-800">
                            {item.date} à {item.time}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Méthode</div>
                          <div className="font-medium text-gray-800">{item.method}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-2xl font-bold text-amber-600">{item.amount}</div>
                        <Button variant="ghost" size="sm" className="text-amber-600 hover:bg-amber-50 rounded-xl">
                          Détails
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Summary card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-amber-500 to-amber-600 border-0 shadow-xl p-8 rounded-2xl">
            <div className="text-center text-white">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Star className="w-8 h-8" />
                <h3 className="text-2xl font-bold">Merci pour votre générosité !</h3>
                <Star className="w-8 h-8" />
              </div>
              <div className="text-4xl font-bold mb-2">{monthlyStats.total.toLocaleString()} FCFA</div>
              <p className="text-amber-100 text-lg mb-6">Vos contributions soutiennent la mission de l'Église</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                  <div className="text-2xl font-bold">{monthlyStats.janvier.count}</div>
                  <div className="text-amber-100 text-sm">Ce mois-ci</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                  <div className="text-2xl font-bold">{monthlyStats.decembre.count}</div>
                  <div className="text-amber-100 text-sm">Mois dernier</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
