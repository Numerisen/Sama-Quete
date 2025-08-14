"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, ArrowRight, Church } from "lucide-react"

interface ParishSelectionScreenProps {
  setCurrentScreen: (screen: string) => void
  selectedParish: string
  setSelectedParish: (parish: string) => void
  selectionContext: string
}

export default function ParishSelectionScreen({
  setCurrentScreen,
  selectedParish,
  setSelectedParish,
  selectionContext,
}: ParishSelectionScreenProps) {
  const parishes = [
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
  ]

  const handleParishSelect = (parish: string) => {
    setSelectedParish(parish)
    // Rediriger selon le contexte
    if (selectionContext === "donations") {
      setCurrentScreen("donations")
    } else if (selectionContext === "news") {
      setCurrentScreen("news")
    }
  }

  const getTitle = () => {
    if (selectionContext === "donations") {
      return "Choisissez votre église"
    } else if (selectionContext === "news") {
      return "Actualités de quelle église ?"
    }
    return "Choisissez votre église"
  }

  const getSubtitle = () => {
    if (selectionContext === "donations") {
      return "Chaque église a ses propres tarifs"
    } else if (selectionContext === "news") {
      return "Pour voir les actualités locales"
    }
    return "Sélectionnez votre communauté"
  }

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 p-6"
    >
      <div className="max-w-md mx-auto pt-12">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentScreen("dashboard")}
            className="absolute top-4 left-4 text-gray-600 hover:bg-gray-100 rounded-full p-2"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </Button>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{getTitle()}</h2>
          <p className="text-gray-600">{getSubtitle()}</p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-3"
        >
          {parishes.map((parish, index) => (
            <motion.div
              key={parish.name}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Card
                className="p-4 cursor-pointer transition-all duration-200 border hover:shadow-md bg-white/90 backdrop-blur-sm rounded-xl"
                onClick={() => handleParishSelect(parish.name)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-200 to-amber-300 rounded-xl flex items-center justify-center">
                    <Church className="w-8 h-8 text-amber-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{parish.name}</h3>
                    <div className="flex items-center text-gray-500 text-sm mt-1 mb-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {parish.location}
                    </div>
                    <p className="text-gray-600 text-sm">{parish.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
