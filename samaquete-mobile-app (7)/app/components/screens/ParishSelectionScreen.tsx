"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Church, MapPin, ArrowRight } from "lucide-react"

interface Parish {
  name: string
  location: string
  description: string
}

interface ParishSelectionScreenProps {
  parishes: Parish[] | undefined
  onSelect: (parishName: string) => void
}

export default function ParishSelectionScreen({
  parishes,
  onSelect,
}: ParishSelectionScreenProps) {
  const [selectedParish, setSelectedParish] = useState<string | null>(null)

  const handleParishSelect = (parishName: string) => {
    setSelectedParish(parishName)
    onSelect(parishName)
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-xl font-bold text-center mb-4">Choisissez votre paroisse</h2>

      {Array.isArray(parishes) && parishes.length > 0 ? (
        parishes.map((parish, index) => (
          <motion.div
            key={parish.name}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Card
              className={`p-4 cursor-pointer transition-all duration-200 border hover:shadow-md bg-white/90 backdrop-blur-sm rounded-xl ${
                selectedParish === parish.name ? "border-amber-500 shadow-lg" : ""
              }`}
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
        ))
      ) : (
        <p className="text-center text-gray-500">Aucune paroisse disponible.</p>
      )}

      {selectedParish && (
        <div className="text-center mt-6">
          <Button
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-md"
            onClick={() => onSelect(selectedParish)}
          >
            Continuer avec {selectedParish}
          </Button>
        </div>
      )}
    </div>
  )
}
