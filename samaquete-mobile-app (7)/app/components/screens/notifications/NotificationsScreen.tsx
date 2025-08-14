"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ArrowRight, Bell, Calendar, Heart, BookOpen, Users, Settings, Trash2 } from "lucide-react"

interface NotificationsScreenProps {
  setCurrentScreen: (screen: string) => void
}

export default function NotificationsScreen({ setCurrentScreen }: NotificationsScreenProps) {
  const [notificationSettings, setNotificationSettings] = useState({
    masses: true,
    donations: true,
    news: true,
    prayers: false,
    events: true,
    reminders: true,
  })

  const notifications = [
    {
      id: 1,
      type: "event",
      title: "Messe dominicale dans 1 heure",
      message: "N'oubliez pas la messe de 09:00 à la Cathédrale du Souvenir Africain",
      time: "Il y a 5 min",
      icon: Calendar,
      color: "from-blue-400 to-blue-500",
      unread: true,
    },
    {
      id: 2,
      type: "donation",
      title: "Rappel de quête dominicale",
      message: "Votre contribution hebdomadaire soutient notre communauté paroissiale",
      time: "Il y a 2 heures",
      icon: Heart,
      color: "from-red-400 to-red-500",
      unread: true,
    },
    {
      id: 3,
      type: "news",
      title: "Nouvelle actualité paroissiale",
      message: "Célébration de la Journée Mondiale de la Jeunesse - 25 Janvier",
      time: "Il y a 4 heures",
      icon: Users,
      color: "from-green-400 to-green-500",
      unread: false,
    },
    {
      id: 4,
      type: "liturgy",
      title: "Lectures du jour disponibles",
      message: "Découvrez les textes liturgiques du 3ème Dimanche du Temps Ordinaire",
      time: "Il y a 6 heures",
      icon: BookOpen,
      color: "from-purple-400 to-purple-500",
      unread: false,
    },
    {
      id: 5,
      type: "reminder",
      title: "Préparation au Carême",
      message: "Retraite spirituelle du 10 au 12 Février - Inscriptions ouvertes",
      time: "Hier",
      icon: Calendar,
      color: "from-amber-400 to-amber-500",
      unread: false,
    },
    {
      id: 6,
      type: "prayer",
      title: "Intention de prière",
      message: "Prions pour la paix dans le monde et l'unité de notre communauté",
      time: "Il y a 2 jours",
      icon: Heart,
      color: "from-pink-400 to-pink-500",
      unread: false,
    },
  ]

  const handleSettingChange = (setting: string) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }))
  }

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 80 }}
        className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 pb-8 rounded-b-3xl shadow-xl"
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
              <h2 className="text-3xl font-bold text-white">Notifications</h2>
              <p className="text-blue-100 text-lg">Restez informé</p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 rounded-full p-3">
              <Settings className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
        >
          <Card className="bg-white/20 backdrop-blur-sm border-0 p-4 rounded-2xl">
            <div className="flex items-center justify-center space-x-3 text-white">
              <Bell className="w-6 h-6" />
              <div className="text-center">
                <div className="font-bold text-lg">{unreadCount} nouvelles</div>
                <div className="text-blue-100 text-sm">notifications</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <div className="p-6 -mt-4 space-y-6">

        {/* Notifications list */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-xl">Notifications récentes</h3>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 rounded-xl">
                Tout marquer comme lu
              </Button>
            </div>

            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                    notification.unread ? "bg-blue-50 border-l-4 border-blue-400" : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <motion.div
                      className={`w-12 h-12 bg-gradient-to-br ${notification.color} rounded-full flex items-center justify-center shadow-lg`}
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <notification.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-gray-800">{notification.title}</h4>
                        <div className="flex items-center space-x-2">
                          {notification.unread && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500 p-1">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2 leading-relaxed">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {notification.time}
                        </Badge>
                        {notification.unread && (
                          <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">Nouveau</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Notification settings */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl p-6 rounded-2xl">
            <h3 className="font-bold text-gray-800 mb-4 text-xl">Paramètres de notification</h3>
            <div className="space-y-4">
              {[
                { key: "masses", label: "Messes et célébrations", description: "Horaires et rappels" },
                { key: "donations", label: "Dons et quêtes", description: "Rappels de contribution" },
                { key: "news", label: "Actualités paroissiales", description: "Événements et nouvelles" },
                { key: "prayers", label: "Intentions de prière", description: "Demandes de prière" },
                { key: "events", label: "Événements spéciaux", description: "Fêtes et célébrations" },
                { key: "reminders", label: "Rappels personnels", description: "Vos rendez-vous spirituels" },
              ].map((setting, index) => (
                <motion.div
                  key={setting.key}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{setting.label}</div>
                    <div className="text-gray-500 text-sm">{setting.description}</div>
                  </div>
                  <Switch
                    checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                    onCheckedChange={() => handleSettingChange(setting.key)}
                  />
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 border-0 shadow-xl p-6 rounded-2xl">
            <div className="text-center text-white">
              <Bell className="w-8 h-8 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Restez connecté</h3>
              <p className="text-blue-100 mb-4">
                Activez les notifications push pour ne manquer aucun moment important
              </p>
              <div className="grid grid-cols-2 gap-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="w-full bg-white text-blue-600 hover:bg-gray-50 rounded-xl font-semibold">
                    Activer push
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    className="w-full border-white text-white hover:bg-white/10 rounded-xl font-semibold bg-transparent"
                  >
                    Personnaliser
                  </Button>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
