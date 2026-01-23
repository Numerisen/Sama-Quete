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
    // Événements supprimés de l'interface super admin
    router.replace("/admin/donations")
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
      case "prière": return "⛪"
      case "quete": return "💰"
      case "evenement": return "🎉"
      case "collecte": return "🎯"
      default: return "📅"
    }
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "prière": return "prière d'intention"
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
      return <Badge variant="outline" className="text-black border-blue-200">À venir</Badge>
    }

    if (now > endDate) {
      return <Badge variant="destructive">Terminé</Badge>
    }

    return <Badge variant="default" className="bg-blue-600">En cours</Badge>
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-black" />
            <p className="text-black">Chargement des événements...</p>
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
            <CardTitle className="text-3xl font-bold text-black mb-1 flex items-center gap-3">
              <Target className="w-8 h-8" />
              Événements de dons
            </CardTitle>
            <p className="text-black/80 text-sm">
              Gérez les événements de collecte de dons (prières, quêtes, événements spéciaux...)
            </p>
          </div>
          <Link href="/admin/donations/events/create">
            <Button className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white shadow-lg rounded-xl px-4 py-2">
              <Plus className="w-5 h-5" />
              Nouvel événement
            </Button>
          </Link>
        </CardHeader>
        
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold text-black mb-2">Aucun événement créé</h3>
              <p className="text-black mb-6">Créez votre premier événement de don pour commencer à collecter</p>
              <Link href="/admin/donations/events/create">
                <Button className="bg-blue-700 hover:bg-blue-800 text-white">
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
                            <CardTitle className="text-lg font-semibold text-black line-clamp-2">
                              {event.title}
                            </CardTitle>
                            <p className="text-sm text-black">
                              {getEventTypeLabel(event.type)}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(event)}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-sm text-black line-clamp-3">
                        {event.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-black">
                          <Church className="w-4 h-4" />
                          <span>Paroisse ID: {event.parishId}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-black">
                          <Calendar className="w-4 h-4" />
                          <span>Du {formatDate(event.startDate)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-black">
                          <Calendar className="w-4 h-4" />
                          <span>Au {formatDate(event.endDate)}</span>
                        </div>
                      </div>
                      
                      {/* Progression */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-black">Collecté</span>
                          <span className="font-semibold text-black">
                            {formatAmount(event.currentAmount)} FCFA
                          </span>
                        </div>
                        
                        {event.targetAmount && (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-black">Objectif</span>
                              <span className="font-semibold text-black">
                                {formatAmount(event.targetAmount)} FCFA
                              </span>
                            </div>
                            
                            <div className="w-full bg-blue-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${getProgressPercentage(event.currentAmount, event.targetAmount)}%` 
                                }}
                              />
                            </div>
                            
                            <div className="text-center text-sm text-black">
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
                          className="flex-1 text-black border-blue-200 hover:bg-blue-50"
                          onClick={() => router.push(`/admin/donations/events/${event.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Voir
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 text-black border-blue-200 hover:bg-blue-50"
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