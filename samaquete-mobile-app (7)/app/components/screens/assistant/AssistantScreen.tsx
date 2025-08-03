"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Send, Cross, BookOpen, Star } from "lucide-react"

interface AssistantScreenProps {
  setCurrentScreen: (screen: string) => void
}

export default function AssistantScreen({ setCurrentScreen }: AssistantScreenProps) {
  const [chatMessages, setChatMessages] = useState([
    {
      type: "bot",
      message:
        "Paix du Christ ! Je suis votre assistant spirituel. Comment puis-je vous aider dans votre cheminement de foi aujourd'hui ?",
      timestamp: "14:30",
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const quickQuestions = [
    "Qu'est-ce que la Pentecôte ?",
    "Comment prier le rosaire ?",
    "Sens du carême",
    "Saints du Sénégal",
    "Préparation au baptême",
    "Signification de l'Eucharistie",
  ]

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const userMessage = {
      type: "user",
      message: newMessage,
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    }

    setChatMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "La Pentecôte célèbre la descente du Saint-Esprit sur les Apôtres, 50 jours après Pâques. C'est la naissance de l'Église et le moment où les disciples reçoivent la force d'évangéliser le monde entier.",
        "Le rosaire se prie en méditant les mystères de la vie du Christ. Commencez par le signe de croix, récitez le Credo, puis alternez entre Notre Père et Je vous salue Marie sur les grains.",
        "Le carême est un temps de 40 jours de préparation à Pâques, marqué par la prière, le jeûne et l'aumône. C'est un temps de conversion et de retour vers Dieu.",
        "Le Sénégal compte de nombreux saints et bienheureux, notamment Sainte Joséphine Bakhita, patronne du Soudan et du Sénégal, et le Vénérable Père Libermann.",
        "La préparation au baptême comprend la catéchèse, la prière et la réflexion sur l'engagement chrétien. C'est un chemin de découverte de la foi.",
        "L'Eucharistie est le sacrement central de la foi catholique, où le pain et le vin deviennent le Corps et le Sang du Christ. C'est le sommet de la vie chrétienne.",
      ]

      const botResponse = {
        type: "bot",
        message: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      }

      setIsTyping(false)
      setChatMessages((prev) => [...prev, botResponse])
    }, 2000)

    setNewMessage("")
  }

  const handleQuickQuestion = (question: string) => {
    setNewMessage(question)
    setTimeout(() => handleSendMessage(), 100)
  }

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 80 }}
        className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 pb-8 rounded-b-3xl shadow-xl"
      >
        <div className="flex items-center space-x-4 mb-4">
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
            <h2 className="text-3xl font-bold text-white">Assistant spirituel</h2>
            <p className="text-purple-100 text-lg">Posez vos questions sur la foi</p>
          </div>
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
        >
          <Card className="bg-white/20 backdrop-blur-sm border-0 p-4 rounded-2xl">
            <div className="flex items-center justify-center space-x-3 text-white">
              <Cross className="w-6 h-6" />
              <div className="text-center">
                <div className="font-bold text-lg">Assistant IA</div>
                <div className="text-purple-100 text-sm">Alimenté par la sagesse biblique</div>
              </div>
              <BookOpen className="w-6 h-6" />
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Chat messages */}
      <div className="flex-1 p-6 -mt-4 overflow-y-auto">
        <div className="space-y-4 mb-6">
          {chatMessages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl ${
                  msg.type === "user"
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                    : "bg-white/90 backdrop-blur-sm text-gray-800 shadow-lg"
                }`}
              >
                {msg.type === "bot" && (
                  <div className="flex items-center space-x-2 mb-3">
                    <motion.div
                      className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center"
                      whileHover={{ rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Cross className="w-4 h-4 text-white" />
                    </motion.div>
                    <span className="text-sm font-semibold text-gray-600">Assistant spirituel</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed mb-2">{msg.message}</p>
                <div className={`text-xs ${msg.type === "user" ? "text-purple-200" : "text-gray-500"} text-right`}>
                  {msg.timestamp}
                </div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
                    <Cross className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-600">Assistant spirituel</span>
                </div>
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: i * 0.2 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick questions */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-6"
        >
          <h3 className="font-bold text-gray-800 mb-4 text-lg">Questions fréquentes</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickQuestions.map((question, index) => (
              <motion.div
                key={question}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge
                  variant="secondary"
                  className="cursor-pointer bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all duration-300 px-3 py-2 text-xs w-full justify-center"
                  onClick={() => handleQuickQuestion(question)}
                >
                  {question}
                </Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Spiritual resources */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <Card className="bg-gradient-to-r from-amber-500 to-amber-600 border-0 shadow-xl p-6 rounded-2xl">
            <div className="text-center text-white">
              <Star className="w-8 h-8 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Ressources spirituelles</h3>
              <p className="text-amber-100 mb-4">Accédez à une bibliothèque de prières, méditations et enseignements</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-white text-amber-600 hover:bg-gray-50 rounded-xl font-semibold px-6">
                  Explorer les ressources
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Message input */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 80 }}
        className="p-6 bg-white/90 backdrop-blur-sm border-t border-gray-200"
      >
        <div className="flex space-x-3">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Posez votre question sur la foi..."
            className="flex-1 h-12 border-2 border-gray-200 rounded-xl text-base focus:border-purple-400 transition-all duration-300"
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isTyping}
              className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl shadow-lg disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
