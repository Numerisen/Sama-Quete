"use client"
export const dynamic = "force-dynamic"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Activity, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

interface ÉgliseActivity {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  participants: number;
  maxParticipants?: number;
  organizer: string;
  contact?: string;
}

export default function ÉgliseActivitiesPage() {
  const searchParams = useSearchParams()
  const eglise = searchParams.get('eglise') || 'Église Saint Jean Bosco'
  const { toast } = useToast()

  const [activities, setActivities] = useState<ÉgliseActivity[]>([
    {
      id: "1",
      title: "Messe dominicale",
      description: "Messe principale du dimanche avec la communauté",
      date: "2024-01-21",
      time: "10:00",
      location: "Église principale",
      type: "Liturgie",
      status: "upcoming",
      participants: 150,
      maxParticipants: 200,
      organizer: "Père Jean",
      contact: "+221 77 123 45 67"
    },
    {
      id: "2",
      title: "Catéchisme enfants",
      description: "Séance de catéchisme pour les enfants de 7-12 ans",
      date: "2024-01-22",
      time: "16:00",
      location: "Salle de catéchisme",
      type: "Formation",
      status: "upcoming",
      participants: 25,
      maxParticipants: 30,
      organizer: "Sœur Marie",
      contact: "+221 78 234 56 78"
    },
    {
      id: "3",
      title: "Groupe de prière",
      description: "Réunion hebdomadaire du groupe de prière",
      date: "2024-01-23",
      time: "19:00",
      location: "Chapelle",
      type: "Spiritualité",
      status: "upcoming",
      participants: 12,
      organizer: "Mme Diop",
      contact: "+221 76 345 67 89"
    },
    {
      id: "4",
      title: "Collecte pour les pauvres",
      description: "Collecte de vêtements et nourriture pour les familles démunies",
      date: "2024-01-20",
      time: "14:00",
      location: "Cour de l'église",
      type: "Charité",
      status: "completed",
      participants: 8,
      organizer: "Comité de charité",
      contact: "+221 77 456 78 90"
    },
    {
      id: "5",
      title: "Retraite spirituelle",
      description: "Retraite de 3 jours pour les jeunes adultes",
      date: "2024-01-25",
      time: "08:00",
      location: "Centre de retraite",
      type: "Spiritualité",
      status: "upcoming",
      participants: 0,
      maxParticipants: 20,
      organizer: "Père Paul",
      contact: "+221 78 567 89 01"
    }
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const activityTypes = ["Liturgie", "Formation", "Spiritualité", "Charité", "Social", "Autre"]
  const statusOptions = ["upcoming", "ongoing", "completed", "cancelled"]

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || activity.type === filterType
    const matchesStatus = filterStatus === "all" || activity.status === filterStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  const upcomingActivities = activities.filter(a => a.status === "upcoming").length
  const completedActivities = activities.filter(a => a.status === "completed").length
  const totalParticipants = activities.reduce((sum, a) => sum + a.participants, 0)
  const todayActivities = activities.filter(a => a.date === new Date().toISOString().split('T')[0]).length

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="default" className="bg-blue-100 text-blue-800">À venir</Badge>
      case "ongoing":
        return <Badge variant="default" className="bg-green-100 text-green-800">En cours</Badge>
      case "completed":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Terminé</Badge>
      case "cancelled":
        return <Badge variant="destructive">Annulé</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Clock className="w-4 h-4 text-blue-500" />
      case "ongoing":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-gray-500" />
      case "cancelled":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const handleDeleteActivity = (id: string) => {
    setActivities(activities.filter(a => a.id !== id))
    toast({
      title: "Succès",
      description: "Activité supprimée avec succès"
    })
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    setActivities(activities.map(a => 
      a.id === id ? { ...a, status: newStatus as any } : a
    ))
    toast({
      title: "Succès",
      description: "Statut de l'activité mis à jour"
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activités de la eglise</h1>
            <p className="text-gray-600 mt-1">
              {eglise} • Gestion des activités et événements
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/admineglise/activities/create">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nouvelle activité
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">À venir</p>
                  <p className="text-2xl font-bold text-blue-600">{upcomingActivities}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Terminées</p>
                  <p className="text-2xl font-bold text-green-600">{completedActivities}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Participants</p>
                  <p className="text-2xl font-bold text-purple-600">{totalParticipants}</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aujourd'hui</p>
                  <p className="text-2xl font-bold text-orange-600">{todayActivities}</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Rechercher</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Titre, description, type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="type-filter">Type d'activité</Label>
                <select
                  id="type-filter"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">Tous les types</option>
                  {activityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="status-filter">Statut</Label>
                <select
                  id="status-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="upcoming">À venir</option>
                  <option value="ongoing">En cours</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des activités */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              Liste des activités ({filteredActivities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(activity.status)}
                      <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                      {getStatusBadge(activity.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(activity.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {activity.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {activity.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Filter className="w-4 h-4" />
                        {activity.type}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {activity.participants}
                        {activity.maxParticipants && `/${activity.maxParticipants}`} participants
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Organisateur: {activity.organizer}
                      {activity.contact && ` • Contact: ${activity.contact}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activity.status === "upcoming" && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(activity.id, "ongoing")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Démarrer
                      </Button>
                    )}
                    {activity.status === "ongoing" && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(activity.id, "completed")}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Terminer
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteActivity(activity.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredActivities.length === 0 && (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune activité trouvée</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterType !== "all" || filterStatus !== "all" 
                    ? "Aucune activité ne correspond à vos critères de recherche."
                    : "Aucune activité n'a encore été programmée pour cette eglise."
                  }
                </p>
                {!searchTerm && filterType === "all" && filterStatus === "all" && (
                  <Link href="/admineglise/activities/create">
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Programmer la première activité
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
