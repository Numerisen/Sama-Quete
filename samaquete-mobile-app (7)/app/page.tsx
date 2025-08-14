"use client"

import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import SplashScreen from "./components/screens/SplashScreen"
import DashboardScreen from "./components/screens/DashboardScreen"
import AuthScreen from "./components/screens/AuthScreen"
import ParishSelectionScreen from "./components/screens/ParishSelectionScreen"
import DonationsScreen from "./components/screens/donations/DonationsScreen"
import DonationTypeScreen from "./components/screens/donations/DonationTypeScreen"
import PaymentScreen from "./components/screens/donations/PaymentScreen"
import LiturgyScreen from "./components/screens/liturgy/LiturgyScreen"
import NewsScreen from "./components/screens/news/NewsScreen"
import AssistantScreen from "./components/screens/assistant/AssistantScreen"
import HistoryScreen from "./components/screens/history/HistoryScreen"
import NotificationsScreen from "./components/screens/notifications/NotificationsScreen"
import SettingsScreen from "./components/screens/settings/SettingsScreen"

export default function SamaQueteApp() {
  const [currentScreen, setCurrentScreen] = useState("splash")
  const [selectedParish, setSelectedParish] = useState("")
  const [selectedDonationType, setSelectedDonationType] = useState("")
  const [selectedAmount, setSelectedAmount] = useState("")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectionContext, setSelectionContext] = useState("") // "donations" ou "news"
  const [userProfile, setUserProfile] = useState({
    name: "",
    phone: "",
    totalDonations: 0,
    prayerDays: 12,
  })

  // Auto-transition from splash to dashboard after 2 seconds
  useEffect(() => {
    if (currentScreen === "splash") {
      const timer = setTimeout(() => setCurrentScreen("dashboard"), 2000)
      return () => clearTimeout(timer)
    }
  }, [currentScreen])

  const screenProps = {
    setCurrentScreen,
    selectedParish,
    setSelectedParish,
    selectedDonationType,
    setSelectedDonationType,
    selectedAmount,
    setSelectedAmount,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    userProfile,
    setUserProfile,
    isAuthenticated,
    setIsAuthenticated,
    selectionContext,
    setSelectionContext,
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative overflow-hidden">
      <AnimatePresence mode="wait">
        {currentScreen === "splash" && <SplashScreen key="splash" {...screenProps} />}
        {currentScreen === "dashboard" && (
          <DashboardScreen
            key="dashboard"
            {...screenProps}
            parishes={[
              {
                name: "Cathédrale du Souvenir Africain",
                location: "Dakar",
                image: "/placeholder.svg?height=120&width=200",
                description: "Cathédrale principale de Dakar",
              },
              {
                name: "Paroisse Sainte-Anne",
                location: "Rufisque",
                image: "/placeholder.svg?height=120&width=200",
                description: "Communauté dynamique de Rufisque",
              },
              {
                name: "Paroisse Saint-Joseph",
                location: "Thiès",
                image: "/placeholder.svg?height=120&width=200",
                description: "Au cœur de la région de Thiès",
              },
              {
                name: "Paroisse Notre-Dame",
                location: "Saint-Louis",
                image: "/placeholder.svg?height=120&width=200",
                description: "Patrimoine spirituel de Saint-Louis",
              },
            ]}
          />
        )}
        {currentScreen === "parish-selection" && <ParishSelectionScreen key="parish" {...screenProps} />}
        {currentScreen === "donations" && <DonationsScreen key="donations" {...screenProps} />}
        {currentScreen === "donation-type" && <DonationTypeScreen key="donation-type" {...screenProps} />}
        {currentScreen === "auth" && <AuthScreen key="auth" {...screenProps} />}
        {currentScreen === "payment" && <PaymentScreen key="payment" {...screenProps} />}
        {currentScreen === "liturgy" && <LiturgyScreen key="liturgy" {...screenProps} />}
        {currentScreen === "news" && <NewsScreen key="news" {...screenProps} />}
        {currentScreen === "assistant" && <AssistantScreen key="assistant" {...screenProps} />}
        {currentScreen === "history" && <HistoryScreen key="history" {...screenProps} />}
        {currentScreen === "notifications" && <NotificationsScreen key="notifications" {...screenProps} />}
        {currentScreen === "settings" && <SettingsScreen key="settings" {...screenProps} />}
      </AnimatePresence>
    </div>
  )
}
