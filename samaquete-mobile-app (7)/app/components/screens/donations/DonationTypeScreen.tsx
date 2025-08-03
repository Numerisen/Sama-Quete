"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowRight, MapPin } from "lucide-react"

interface DonationTypeScreenProps {
  setCurrentScreen: (screen: string) => void
  selectedDonationType: string
  selectedParish: string
  selectedAmount: string
  setSelectedAmount: (amount: string) => void
}

export default function DonationTypeScreen({
  setCurrentScreen,
  selectedDonationType,
  selectedParish,
  selectedAmount,
  setSelectedAmount,
}: DonationTypeScreenProps) {
  const [customAmount, setCustomAmount] = useState("")

  // Tarifs spécifiques par église et type de don
  const parishPricing = {
    "Cathédrale du Souvenir Africain": {
      quete: ["2,000", "5,000", "10,000", "15,000"],
      denier: ["10,000", "20,000", "30,000", "50,000"],
      cierge: ["1,000", "2,000", "3,000", "5,000"],
      messe: ["15,000", "25,000", "35,000", "50,000"],
    },
    "Paroisse Sainte-Anne": {
      quete: ["1,500", "3,000", "7,000", "12,000"],
      denier: ["8,000", "15,000", "25,000", "40,000"],
      cierge: ["800", "1,500", "2,500", "4,000"],
      messe: ["12,000", "20,000", "30,000", "45,000"],
    },
    "Paroisse Saint-Joseph": {
      quete: ["1,000", "2,500", "6,000", "10,000"],
      denier: ["7,000", "12,000", "20,000", "35,000"],
      cierge: ["600", "1,200", "2,000", "3,500"],
      messe: ["10,000", "18,000", "28,000", "40,000"],
    },
    "Paroisse Notre-Dame": {
      quete: ["1,200", "3,000", "6,500", "11,000"],
      denier: ["6,000", "13,000", "22,000", "38,000"],
      cierge: ["700", "1,300", "2,200", "3,800"],
      messe: ["11,000", "19,000", "29,000", "42,000"],
    },
  }

  const donationInfo = {
    quete: {
      title: "Quête dominicale",
      description: "Soutien hebdomadaire à la paroisse",
    },
    denier: {
      title: "Denier du culte",
      description: "Contribution annuelle diocésaine",
    },
    cierge: {
      title: "Cierge Pascal",
      description: "Lumière pour vos intentions",
    },
    messe: {
      title: "Messe d'intention",
      description: "Messe célébrée pour vos proches",
    },
  }

  const currentPricing =
    parishPricing[selectedParish as keyof typeof parishPricing] || parishPricing["Cathédrale du Souvenir Africain"]
  const amounts = currentPricing[selectedDonationType as keyof typeof currentPricing] || []
  const currentDonation = donationInfo[selectedDonationType as keyof typeof donationInfo]

  const handleAmountSelect = (amount: string) => {
    setSelectedAmount(amount)
    setCustomAmount("")
  }

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value)
    setSelectedAmount("")
  }

  const finalAmount = customAmount || selectedAmount

  const handleContinue = () => {
    if (finalAmount) {
      setSelectedAmount(finalAmount)
      setCurrentScreen("auth") // Demander l'authentification avant le paiement
    }
  }

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 pb-8 rounded-b-3xl shadow-lg"
      >
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentScreen("donations")}
            className="text-white hover:bg-white/20 rounded-full p-2"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-white">{currentDonation?.title}</h2>
            <div className="flex items-center text-amber-100 text-sm mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {selectedParish}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="p-6 -mt-4 space-y-6">
        {/* Amount selection */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg p-6 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-4">Choisissez le montant</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {amounts.map((amount, index) => (
                <motion.div
                  key={amount}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant={selectedAmount === amount ? "default" : "outline"}
                    className={`w-full h-12 rounded-xl font-semibold transition-all duration-300 ${
                      selectedAmount === amount
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg"
                        : "border-2 border-gray-200 hover:border-amber-300"
                    }`}
                    onClick={() => handleAmountSelect(amount)}
                  >
                    {amount} FCFA
                  </Button>
                </motion.div>
              ))}
            </div>

            <div className="relative">
              <Input
                placeholder="Montant personnalisé (FCFA)"
                value={customAmount}
                onChange={(e) => handleCustomAmount(e.target.value)}
                className="h-12 border-2 border-gray-200 rounded-xl text-base focus:border-amber-400 transition-all duration-300"
                type="number"
              />
            </div>
          </Card>
        </motion.div>

        {/* Continue button */}
        {finalAmount && (
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
            <Card className="bg-gradient-to-r from-amber-500 to-amber-600 border-0 shadow-xl p-6 rounded-xl">
              <div className="text-center text-white">
                <h3 className="text-lg font-semibold mb-2">Montant sélectionné</h3>
                <div className="text-3xl font-bold mb-4">{finalAmount} FCFA</div>
                <Button
                  onClick={handleContinue}
                  className="w-full h-12 bg-white text-amber-600 hover:bg-gray-50 rounded-xl font-semibold text-base shadow-lg"
                >
                  Continuer vers le paiement
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
