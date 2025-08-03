"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Cross, ArrowRight, Phone, User, Lock } from "lucide-react"

interface AuthScreenProps {
  setCurrentScreen: (screen: string) => void
  setIsAuthenticated: (auth: boolean) => void
  setUserProfile: (profile: any) => void
  selectedAmount: string
}

export default function AuthScreen({
  setCurrentScreen,
  setIsAuthenticated,
  setUserProfile,
  selectedAmount,
}: AuthScreenProps) {
  const handleAuth = () => {
    // Simuler l'authentification
    setUserProfile({
      name: "Jean Baptiste",
      phone: "+221 77 123 45 67",
      totalDonations: 47000,
      prayerDays: 12,
    })
    setIsAuthenticated(true)
    setCurrentScreen("payment") // Aller vers l'écran de paiement
  }

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 p-6"
    >
      <div className="max-w-md mx-auto pt-20">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentScreen("donation-type")}
          className="absolute top-4 left-4 text-gray-600 hover:bg-gray-100 rounded-full p-2"
        >
          <ArrowRight className="w-5 h-5 rotate-180" />
        </Button>

        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Cross className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Authentification</h2>
          <p className="text-gray-600 mb-2">Confirmez vos informations pour finaliser</p>
          <div className="text-2xl font-bold text-amber-600">{selectedAmount} FCFA</div>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-4"
        >
          <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input placeholder="Nom complet" className="h-12 pl-10 border-0 bg-gray-50 rounded-xl text-base" />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Numéro de téléphone"
                  className="h-12 pl-10 border-0 bg-gray-50 rounded-xl text-base"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Code PIN (optionnel)"
                  className="h-12 pl-10 border-0 bg-gray-50 rounded-xl text-base"
                />
              </div>
              <Button
                onClick={handleAuth}
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl text-base font-semibold shadow-lg"
              >
                Continuer vers le paiement
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </Card>

          <div className="text-center">
            <p className="text-gray-500 text-sm">Ces informations sécurisent votre transaction</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
