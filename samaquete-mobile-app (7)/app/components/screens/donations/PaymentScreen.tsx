"use client"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, CreditCard, Smartphone, Check, MapPin } from "lucide-react"

interface PaymentScreenProps {
  setCurrentScreen: (screen: string) => void
  selectedParish: string
  selectedDonationType: string
  selectedAmount: string
  selectedPaymentMethod: string
  setSelectedPaymentMethod: (method: string) => void
}

export default function PaymentScreen({
  setCurrentScreen,
  selectedParish,
  selectedDonationType,
  selectedAmount,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
}: PaymentScreenProps) {
  const paymentMethods = [
    { id: "card", icon: CreditCard, title: "Carte bancaire", subtitle: "Visa, Mastercard" },
    { id: "wave", icon: Smartphone, title: "Wave", subtitle: "Paiement mobile" },
    { id: "orange", icon: Smartphone, title: "Orange Money", subtitle: "Paiement mobile" },
  ]

  const donationTitles = {
    quete: "Quête dominicale",
    denier: "Denier du culte",
    cierge: "Cierge Pascal",
    messe: "Messe d'intention",
  }

  const handlePayment = () => {
    // Simuler le processus de paiement
    setTimeout(() => {
      setCurrentScreen("dashboard")
    }, 2000)
  }

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-green-500 to-green-600 p-6 pb-8 rounded-b-3xl shadow-lg"
      >
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentScreen("donation-type")}
            className="text-white hover:bg-white/20 rounded-full p-2"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-white">Finaliser le don</h2>
            <div className="flex items-center text-green-100 text-sm mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {selectedParish}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="p-6 -mt-4 space-y-6">
        {/* Payment summary */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg p-6 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-4">Récapitulatif</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Type de don</span>
                <span className="font-medium">
                  {donationTitles[selectedDonationType as keyof typeof donationTitles]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Église</span>
                <span className="font-medium">{selectedParish}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Montant</span>
                  <span className="font-bold text-green-600">{selectedAmount} FCFA</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Payment methods */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg p-6 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-4">Moyen de paiement</h3>
            <div className="space-y-3">
              {paymentMethods.map((method, index) => (
                <motion.div
                  key={method.id}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div
                    className={`flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                      selectedPaymentMethod === method.id
                        ? "bg-green-50 border-2 border-green-300"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center">
                      <method.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{method.title}</div>
                      <div className="text-gray-500 text-sm">{method.subtitle}</div>
                    </div>
                    {selectedPaymentMethod === method.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Confirm payment */}
        {selectedPaymentMethod && (
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 border-0 shadow-xl p-6 rounded-xl">
              <div className="text-center text-white">
                <h3 className="text-xl font-bold mb-4">Confirmer le don</h3>
                <Button
                  onClick={handlePayment}
                  className="w-full h-12 bg-white text-green-600 hover:bg-gray-50 rounded-xl font-bold text-base shadow-lg"
                >
                  Payer {selectedAmount} FCFA
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <p className="text-green-100 text-sm mt-3">Paiement sécurisé • Votre don sera traité immédiatement</p>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
