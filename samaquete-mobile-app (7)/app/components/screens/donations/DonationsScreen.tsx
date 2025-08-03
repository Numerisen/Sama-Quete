"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Cross, Church, ArrowRight, CandlestickChartIcon as Candle, MapPin } from "lucide-react"

interface DonationsScreenProps {
  setCurrentScreen: (screen: string) => void
  setSelectedDonationType: (type: string) => void
  selectedParish: string
  userProfile: any
}

export default function DonationsScreen({
  setCurrentScreen,
  setSelectedDonationType,
  selectedParish,
  userProfile,
}: DonationsScreenProps) {
  // Tarifs spécifiques par église
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

  const currentPricing =
    parishPricing[selectedParish as keyof typeof parishPricing] || parishPricing["Cathédrale du Souvenir Africain"]

  const donationTypes = [
    {
      id: "quete",
      icon: Heart,
      title: "Quête dominicale",
      description: "Soutien hebdomadaire à la paroisse",
      color: "from-red-400 to-red-500",
      prices: currentPricing.quete,
    },
    {
      id: "denier",
      icon: Cross,
      title: "Denier du culte",
      description: "Contribution annuelle diocésaine",
      color: "from-amber-400 to-amber-500",
      prices: currentPricing.denier,
    },
    {
      id: "cierge",
      icon: Candle,
      title: "Cierge Pascal",
      description: "Lumière pour vos intentions",
      color: "from-yellow-400 to-yellow-500",
      prices: currentPricing.cierge,
    },
    {
      id: "messe",
      icon: Church,
      title: "Messe d'intention",
      description: "Messe célébrée pour vos proches",
      color: "from-blue-400 to-blue-500",
      prices: currentPricing.messe,
    },
  ]

  const handleDonationSelect = (donationType: any) => {
    setSelectedDonationType(donationType.id)
    setCurrentScreen("donation-type")
  }

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-red-50 via-white to-amber-50"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-red-500 to-red-600 p-6 pb-8 rounded-b-3xl shadow-lg"
      >
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentScreen("parish-selection")}
            className="text-white hover:bg-white/20 rounded-full p-2"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-white">Faire un don</h2>
            <div className="flex items-center text-red-100 text-sm mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {selectedParish}
            </div>
          </div>
        </div>

        {/* Parish info */}
        <Card className="bg-white/20 backdrop-blur-sm border-0 p-4 rounded-xl">
          <div className="text-center text-white">
            <div className="text-lg font-bold">Tarifs spéciaux</div>
            <div className="text-red-100 text-sm">Pour {selectedParish}</div>
          </div>
        </Card>
      </motion.div>

      <div className="p-6 -mt-4">
        {/* Donation types with parish-specific pricing */}
        <div className="space-y-3">
          {donationTypes.map((donation, index) => (
            <motion.div
              key={donation.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Card
                className="p-5 cursor-pointer bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                onClick={() => handleDonationSelect(donation)}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${donation.color} rounded-xl flex items-center justify-center shadow-md`}
                  >
                    <donation.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg mb-1">{donation.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{donation.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {donation.prices.slice(0, 3).map((price, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                          {price} FCFA
                        </Badge>
                      ))}
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                        +plus
                      </Badge>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Parish change option */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6"
        >
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Changer d'église ?</h3>
                <p className="text-gray-600 text-sm">Chaque église a ses propres tarifs</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentScreen("parish-selection")}
                className="rounded-lg"
              >
                Changer
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
