"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BookOpen, Calendar, Clock } from "lucide-react"

interface LiturgyScreenProps {
  setCurrentScreen: (screen: string) => void
}

export default function LiturgyScreen({ setCurrentScreen }: LiturgyScreenProps) {
  const todayReadings = {
    date: "Dimanche 21 Janvier 2024",
    liturgicalTime: "3ème Dimanche du Temps Ordinaire",
    color: "Vert",
    readings: [
      {
        reference: "Jonas 3, 1-5.10",
        title: "Première lecture",
        excerpt:
          "En ces jours-là, la parole du Seigneur fut adressée à Jonas : « Lève-toi, va à Ninive, la grande ville, proclame le message que je te donne. »",
      },
      {
        reference: "Psaume 24",
        title: "Psaume responsorial",
        excerpt: "Seigneur, enseigne-moi tes voies.",
      },
      {
        reference: "1 Co 7, 29-31",
        title: "Deuxième lecture",
        excerpt:
          "Frères, je dois vous le dire : le temps est limité. Désormais, que ceux qui ont une épouse vivent comme s'ils n'en avaient pas...",
      },
      {
        reference: "Marc 1, 14-20",
        title: "Évangile",
        excerpt:
          "Après l'arrestation de Jean le Baptiste, Jésus partit pour la Galilée proclamer l'Évangile de Dieu ; il disait : « Les temps sont accomplis : le règne de Dieu est tout proche. Convertissez-vous et croyez à l'Évangile. »",
      },
    ],
  }

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 pb-8 rounded-b-3xl shadow-lg"
      >
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentScreen("dashboard")}
            className="text-white hover:bg-white/20 rounded-full p-2"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-white">Textes liturgiques</h2>
            <p className="text-blue-100">Lectures du jour</p>
          </div>
        </div>

        <Card className="bg-white/20 backdrop-blur-sm border-0 p-4 rounded-xl">
          <div className="text-center text-white">
            <Calendar className="w-5 h-5 mx-auto mb-2" />
            <div className="font-semibold">{todayReadings.date}</div>
            <div className="text-blue-100 text-sm">{todayReadings.liturgicalTime}</div>
          </div>
        </Card>
      </motion.div>

      <div className="p-6 -mt-4">
        {/* Today's readings */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg p-5 rounded-xl mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 text-lg">Lectures d'aujourd'hui</h3>
              <Badge className="bg-green-100 text-green-700 border-0">Couleur {todayReadings.color}</Badge>
            </div>

            <div className="space-y-3">
              {todayReadings.readings.map((reading, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center mt-1">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">{reading.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {reading.reference}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{reading.excerpt}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Weekly schedule */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg p-5 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-3">Programme de la semaine</h3>
            <div className="space-y-2">
              {[
                { day: "Lundi", time: "06:30", type: "Messe quotidienne" },
                { day: "Mardi", time: "06:30", type: "Messe quotidienne" },
                { day: "Mercredi", time: "06:30", type: "Messe quotidienne" },
                { day: "Jeudi", time: "06:30", type: "Messe quotidienne" },
                { day: "Vendredi", time: "06:30", type: "Messe quotidienne" },
                { day: "Samedi", time: "18:00", type: "Messe de vigile" },
                { day: "Dimanche", time: "09:00", type: "Messe dominicale", isToday: true },
              ].map((schedule, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    schedule.isToday ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-800">{schedule.day}</span>
                    <Badge variant="outline" className="text-xs">
                      {schedule.time}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-800">{schedule.type}</div>
                    {schedule.isToday && (
                      <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">Aujourd'hui</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
