"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DonationEvent, DonationService } from "@/lib/donation-service"
import { motion } from "framer-motion"
import {
    Calendar,
    Church,
    Edit,
    Eye,
    Loader2,
    Plus,
    Target
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function DonationEventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<DonationEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const eventsData = await DonationService.getDonationEvents()
      setEvents(eventsData)
    } catch (error) {
      console.error("Erreur lors du chargement des événements:", error)
      toast.error("Erreur lors du chargement des événements")
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("fr-FR").replace(/\s/g, " ")
  }

  const formatDate = (date: any) => {
    if (!date) return "Non définie"
    const d = date.toDate ? date.toDate() : new Date(date)
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "messe": return "⛪"
      case "quete": return "💰"
      case "evenement": return "🎉"
      case "collecte": return "🎯"
      default: return "📅"
    }
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "messe": return "Messe d'intention"
      case "quete": return "Quête dominicale"
      case "evenement": return "Événement spécial"
      case "collecte": return "Collecte de fonds"
      default: return type
    }
  }

  const getProgressPercentage = (current: number, target?: number) => {
    if (!target || target === 0) return 0
    return Math.min((current / target) * 100, 100)
  }

  const getStatusBadge = (event: DonationEvent) => {
    const now = new Date()
    const startDate = event.startDate.toDate ? event.startDate.toDate() : new Date(event.startDate)
    const endDate = event.endDate.toDate ? event.endDate.toDate() : new Date(event.endDate)

    if (!event.isActive) {
      return <Badge variant="secondary">Inactif</Badge>
    }

    if (now < startDate) {
      return <Badge variant="outline" className="text-blue-600 border-blue-200">À venir</Badge>
    }

    if (now > endDate) {
      return <Badge variant="destructive">Terminé</Badge>
    }

    return <Badge variant="default" className="bg-green-600">En cours</Badge>
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
            <p className="text-green-800">Chargement des événements...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="mb-8 shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-green-900 mb-1 flex items-center gap-3">
              <Target className="w-8 h-8" />
              Événements de dons
            </CardTitle>
            <p className="text-green-800/80 text-sm">
              Gérez les événements de collecte de dons (messes, quêtes, événements spéciaux...)
            </p>
          </div>
          <Link href="/admin/donations/events/create">
            <Button className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white shadow-lg rounded-xl px-4 py-2">
              <Plus className="w-5 h-5" />
              Nouvel événement
            </Button>
          </Link>
        </CardHeader>
        
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 mx-auto mb-4 text-green-300" />
              <h3 className="text-xl font-semibold text-green-900 mb-2">Aucun événement créé</h3>
              <p className="text-green-700 mb-6">Créez votre premier événement de don pour commencer à collecter</p>
              <Link href="/admin/donations/events/create">
                <Button className="bg-green-700 hover:bg-green-800 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un événement
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow border-green-100">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getEventTypeIcon(event.type)}</span>
                          <div>
                            <CardTitle className="text-lg font-semibold text-green-900 line-clamp-2">
                              {event.title}
                            </CardTitle>
                            <p className="text-sm text-green-600">
                              {getEventTypeLabel(event.type)}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(event)}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {event.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Church className="w-4 h-4" />
                          <span>Paroisse ID: {event.parishId}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Du {formatDate(event.startDate)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Au {formatDate(event.endDate)}</span>
                        </div>
                      </div>
                      
                      {/* Progression */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Collecté</span>
                          <span className="font-semibold text-green-700">
                            {formatAmount(event.currentAmount)} FCFA
                          </span>
                        </div>
                        
                        {event.targetAmount && (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Objectif</span>
                              <span className="font-semibold text-gray-700">
                                {formatAmount(event.targetAmount)} FCFA
                              </span>
                            </div>
                            
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${getProgressPercentage(event.currentAmount, event.targetAmount)}%` 
                                }}
                              />
                            </div>
                            
                            <div className="text-center text-sm text-gray-600">
                              {getProgressPercentage(event.currentAmount, event.targetAmount).toFixed(1)}% atteint
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 text-green-700 border-green-200 hover:bg-green-50"
                          onClick={() => router.push(`/admin/donations/events/${event.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Voir
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 text-blue-700 border-blue-200 hover:bg-blue-50"
                          onClick={() => router.push(`/admin/donations/events/${event.id}/edit`)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Modifier
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}