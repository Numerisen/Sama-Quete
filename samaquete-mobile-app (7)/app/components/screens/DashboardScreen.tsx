"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Heart,
  BookOpen,
  Newspaper,
  MessageCircle,
  User,
  Settings,
  Bell,
  TrendingUp,
  Calendar,
  Star,
  Church,
  Edit,
  Check,
} from "lucide-react"

interface DashboardScreenProps {
  setCurrentScreen: (screen: string) => void
  setSelectionContext: (context: string) => void
  userProfile: any
  isAuthenticated: boolean
  selectedParish: string
  setSelectedParish: (parish: string) => void
  parishes: { name: string; location: string; image: string; description: string }[]
}

export default function DashboardScreen({
  setCurrentScreen,
  setSelectionContext,
  userProfile,
  isAuthenticated,
  selectedParish,
  setSelectedParish,
  parishes,
}: DashboardScreenProps) {
  const mainActions = [
    {
      icon: Heart,
      title: "Faire un don",
      subtitle: "Choisir votre église",
      color: "from-red-400 to-red-500",
      action: () => {
        setSelectionContext("donations")
        setCurrentScreen("parish-selection")
      },
    },
    {
      icon: BookOpen,
      title: "Textes liturgiques",
      subtitle: "Lectures du jour",
      color: "from-blue-400 to-blue-500",
      action: () => setCurrentScreen("liturgy"),
    },
    {
      icon: Newspaper,
      title: "Actualités",
      subtitle: "Choisir votre église",
      color: "from-green-400 to-green-500",
      action: () => {
        setSelectionContext("news")
        setCurrentScreen("parish-selection")
      },
    },
    {
      icon: MessageCircle,
      title: "Assistant spirituel",
      subtitle: "Questions sur la foi",
      color: "from-purple-400 to-purple-500",
      action: () => setCurrentScreen("assistant"),
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 pb-8 rounded-b-3xl shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Paix du Christ !</h3>
              <p className="text-amber-100 text-sm">Bienvenue dans SamaQuête</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-full p-2"
              onClick={() => setCurrentScreen("notifications")}
            >
              <Bell className="w-5 h-5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-full p-2"
              onClick={() => setCurrentScreen("settings")}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Selected Parish Display - Main and prominent */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
        >
          <Card className="bg-white/20 backdrop-blur-sm border-0 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3 text-white">
              <Church className="w-6 h-6" />
              <div className="text-center">
                <div className="font-bold text-lg">{selectedParish}</div>
                <div className="text-amber-100 text-sm">Votre église actuelle</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 rounded-full p-2"
              onClick={() => {
                setSelectionContext("dashboard-change-parish")
                setCurrentScreen("parish-selection")
              }}
            >
              <Edit className="w-5 h-5" />
            </Button>
          </Card>
        </motion.div>

        {/* Quick stats - Now with three cards as requested */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <Card className="bg-white/20 backdrop-blur-sm border-0 p-3 rounded-xl">
            <div className="text-center">
              <TrendingUp className="w-5 h-5 text-white mx-auto mb-1" />
              <div className="text-lg font-bold text-white">
                {isAuthenticated ? userProfile.totalDonations.toLocaleString() : "0"}
              </div>
              <div className="text-amber-100 text-xs">FCFA donnés</div>
            </div>
          </Card>
          <Card className="bg-white/20 backdrop-blur-sm border-0 p-3 rounded-xl">
            <div className="text-center">
              <Calendar className="w-5 h-5 text-white mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{userProfile.prayerDays}</div>
              <div className="text-amber-100 text-xs">Jours de prière</div>
            </div>
          </Card>
          <Card className="bg-white/20 backdrop-blur-sm border-0 p-3 rounded-xl">
            <div className="text-center">
              <Star className="w-5 h-5 text-white mx-auto mb-1" />
              <div className="text-lg font-bold text-white">4.9</div>
              <div className="text-amber-100 text-xs">Engagement</div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Main actions */}
      <div className="p-6 -mt-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {mainActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="p-5 cursor-pointer bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                onClick={action.action}
              >
                <div className="text-center">
                  <div
                    className={`w-14 h-14 mx-auto bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-3 shadow-md`}
                  >
                    <action.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{action.title}</h3>
                  <p className="text-gray-500 text-sm">{action.subtitle}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Vos Églises - Remains as the dedicated section for selecting/viewing all parishes */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg p-5 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 text-lg">Vos Églises</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectionContext("dashboard-change-parish")
                  setCurrentScreen("parish-selection")
                }}
                className="text-amber-600 hover:bg-amber-50 rounded-lg"
              >
                Voir tout
              </Button>
            </div>
            <div className="space-y-3">
              {parishes.slice(0, 3).map(
                (
                  parish,
                  index, // Display first 3 parishes
                ) => (
                  <motion.div
                    key={parish.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => setSelectedParish(parish.name)}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
                      <Church className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{parish.name}</div>
                      <div className="text-gray-500 text-sm">{parish.location}</div>
                    </div>
                    {selectedParish === parish.name && <Check className="w-5 h-5 text-amber-600" />}
                  </motion.div>
                ),
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
