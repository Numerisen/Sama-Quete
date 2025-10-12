"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  RefreshCw, 
  Download, 
  Church, 
  Users, 
  MapPin, 
  DollarSign, 
  Activity, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  BarChart2, 
  PieChart, 
  Eye, 
  Clock,
  Heart,
  Bell,
  Newspaper,
  Settings
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from "chart.js"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ActivityStats } from "@/components/admin/activity-stats"
import { 
  PrayerTimeService, 
  ParishDonationService, 
  ParishActivityService, 
  ParishNewsService, 
  ParishUserService,
  ParishDonationTypeService
} from "@/lib/parish-services"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement)

function formatAmount(amount: number) {
  return amount.toLocaleString("fr-FR").replace(/\s/g, " ");
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

interface ParoisseStats {
  totalFideles: number;
  totalDonations: number;
  totalAmount: number;
  activeFideles: number;
  inactiveFideles: number;
  publishedNews: number;
  draftNews: number;
  todayDonations: number;
  weekDonations: number;
  monthDonations: number;
  avgDonation: number;
  totalActivities: number;
  upcomingActivities: number;
  prayerTimes: number;
  donationTypes: number;
  recentDonations: any[];
  recentNews: any[];
  recentFideles: any[];
  recentActivities: any[];
  paroisseName: string;
}

export default function ParoisseDashboardPage() {
  const searchParams = useSearchParams()
  const paroisse = searchParams.get('paroisse') || 'Paroisse Saint Jean Bosco'
  const { userRole } = useAuth()
  
  // Obtenir l'ID de la paroisse depuis le profil utilisateur ou utiliser une valeur par défaut
  const parishId = userRole?.parishId || 'paroisse-saint-jean-bosco'
  
  const [stats, setStats] = useState<ParoisseStats>({
    totalFideles: 0,
    totalDonations: 0,
    totalAmount: 0,
    activeFideles: 0,
    inactiveFideles: 0,
    publishedNews: 0,
    draftNews: 0,
    todayDonations: 0,
    weekDonations: 0,
    monthDonations: 0,
    avgDonation: 0,
    totalActivities: 0,
    upcomingActivities: 0,
    prayerTimes: 0,
    donationTypes: 0,
    recentDonations: [],
    recentNews: [],
    recentFideles: [],
    recentActivities: [],
    paroisseName: paroisse
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  const loadParoisseData = async () => {
    try {
      setLoading(true);
      
      // Charger toutes les données en parallèle depuis Firestore
      const [prayerTimes, donations, activities, news, users, donationTypes] = await Promise.all([
        PrayerTimeService.getAll(parishId),
        ParishDonationService.getAll(parishId),
        ParishActivityService.getAll(parishId),
        ParishNewsService.getAll(parishId),
        ParishUserService.getAll(parishId),
        ParishDonationTypeService.getAll(parishId)
      ]);

      // Calculer les statistiques
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Statistiques des dons
      const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
      const confirmedDonations = donations.filter(d => d.status === 'confirmed');
      const todayDonations = donations.filter(d => d.date?.startsWith(today)).length;
      const weekDonations = donations.filter(d => d.date && d.date >= weekAgo).length;
      const monthDonations = donations.filter(d => d.date && d.date >= monthAgo).length;
      const avgDonation = donations.length > 0 ? Math.round(totalAmount / donations.length) : 0;

      // Statistiques des utilisateurs
      const activeFideles = users.filter(u => u.status === 'active').length;
      const inactiveFideles = users.filter(u => u.status === 'inactive').length;

      // Statistiques des actualités
      const publishedNews = news.filter(n => n.published).length;
      const draftNews = news.filter(n => !n.published).length;

      // Statistiques des activités
      const upcomingActivities = activities.filter(a => a.status === 'upcoming').length;

      // Dernières activités (limitées à 5)
      const recentDonations = donations
        .filter(d => d.date)
        .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
        .slice(0, 5);

      const recentNews = news
        .filter(n => n.createdAt)
        .sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        })
        .slice(0, 5);

      const recentFideles = users
        .filter(u => u.createdAt)
        .sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        })
        .slice(0, 5);

      const recentActivities = activities
        .filter(a => a.status === 'upcoming')
        .sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())
        .slice(0, 5);

      setStats({
        totalFideles: users.length,
        totalDonations: donations.length,
        totalAmount,
        activeFideles,
        inactiveFideles,
        publishedNews,
        draftNews,
        todayDonations,
        weekDonations,
        monthDonations,
        avgDonation,
        totalActivities: activities.length,
        upcomingActivities,
        prayerTimes: prayerTimes.filter(p => p.active).length,
        donationTypes: donationTypes.length,
        recentDonations: recentDonations.map(d => ({
          fullname: d.fullname,
          amount: d.amount,
          date: d.date
        })),
        recentNews: recentNews.map(n => ({
          title: n.title,
          category: n.category,
          published: n.published
        })),
        recentFideles: recentFideles.map(u => ({
          name: u.name,
          email: u.email,
          status: u.status === 'active' ? 'Actif' : 'Inactif'
        })),
        recentActivities: recentActivities.map(a => ({
          title: a.title,
          date: a.date,
          time: a.time
        })),
        paroisseName: paroisse
      });

      setLastUpdate(new Date());

      // Afficher un toast de succès uniquement si des données ont été chargées
      if (donations.length > 0 || activities.length > 0 || users.length > 0) {
        toast({
          title: "Données chargées",
          description: "Les données de la paroisse ont été chargées avec succès"
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du tableau de bord paroisse",
        variant: "destructive"
      });
      
      // En cas d'erreur, garder les valeurs par défaut à 0
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (parishId) {
      loadParoisseData();
    }
    
    // Actualisation automatique toutes les 5 minutes
    const interval = setInterval(() => {
      if (parishId) {
        loadParoisseData();
      }
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [parishId, paroisse]);

  // Données pour les graphiques - basées sur les vraies données
  const donationsByDay = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    return stats.recentDonations.filter(d => d.date?.startsWith(dateStr)).length;
  });

  const daysLabels = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString("fr-FR", { weekday: "short" });
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-100">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-green-600" />
          <span className="text-lg text-gray-600">Chargement du tableau de bord paroisse...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête avec actions */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tableau de bord paroisse</h1>
            <p className="text-gray-600 mt-1">
              {stats.paroisseName} • Dernière mise à jour: {lastUpdate.toLocaleTimeString("fr-FR")}
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={loadParoisseData} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </Button>
            <Button className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Total Collecté</p>
                    <p className="text-3xl font-bold">{formatAmount(stats.totalAmount)} FCFA</p>
                    <p className="text-green-100 text-sm mt-1">{stats.totalDonations} dons</p>
                  </div>
                  <DollarSign className="w-12 h-12 text-green-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Types de dons</p>
                    <p className="text-3xl font-bold">{stats.donationTypes || 0}</p>
                    <p className="text-blue-100 text-sm mt-1">Configurés</p>
                  </div>
                  <Heart className="w-12 h-12 text-blue-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Actualités</p>
                    <p className="text-3xl font-bold">{stats.publishedNews + stats.draftNews}</p>
                    <p className="text-purple-100 text-sm mt-1">{stats.publishedNews} publiées</p>
                  </div>
                  <Newspaper className="w-12 h-12 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Heures de prières</p>
                    <p className="text-3xl font-bold">{stats.prayerTimes}</p>
                    <p className="text-orange-100 text-sm mt-1">Configurées</p>
                  </div>
                  <Clock className="w-12 h-12 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Métriques de performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Dons récents</h3>
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Aujourd'hui</span>
                  <span className="font-semibold text-gray-900">{stats.todayDonations}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cette semaine</span>
                  <span className="font-semibold text-gray-900">{stats.weekDonations}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ce mois</span>
                  <span className="font-semibold text-gray-900">{stats.monthDonations}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Don moyen</span>
                  <span className="font-semibold text-gray-900">{formatAmount(stats.avgDonation)} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taux d'activité</span>
                  <span className="font-semibold text-gray-900">{Math.round((stats.activeFideles / stats.totalFideles) * 100)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Statut</h3>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Paroisse opérationnelle</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Fidèles actifs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Activités programmées</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-green-500" />
                Dons des 7 derniers jours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Bar
                data={{
                  labels: daysLabels,
                  datasets: [
                    {
                      label: "Nombre de dons",
                      data: donationsByDay,
                      backgroundColor: "rgba(34, 197, 94, 0.8)",
                      borderColor: "rgb(34, 197, 94)",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-500" />
                Répartition des fidèles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Doughnut
                data={{
                  labels: ["Actifs", "Inactifs"],
                  datasets: [
                    {
                      data: [stats.activeFideles, stats.inactiveFideles],
                      backgroundColor: [
                        "rgba(34, 197, 94, 0.8)",
                        "rgba(156, 163, 175, 0.8)",
                      ],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "bottom" },
                  },
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Activité récente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Dons récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentDonations.map((donation, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{donation.fullname}</p>
                      <p className="text-sm text-gray-600">{formatDate(donation.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatAmount(donation.amount)} FCFA</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-purple-500" />
                Actualités récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentNews.map((news, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 line-clamp-1">{news.title}</p>
                      <p className="text-sm text-gray-600">{news.category}</p>
                    </div>
                    <Badge variant={news.published ? "default" : "secondary"}>
                      {news.published ? "Publiée" : "Brouillon"}
                    </Badge>
                  </div>
                ))}
                {stats.recentNews.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <Newspaper className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>Aucune actualité récente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Accès rapide */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-gray-500" />
              Accès rapide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Link href={`/adminparoisse/prayers?paroisse=${encodeURIComponent(paroisse)}`}>
                <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-300">
                  <Clock className="w-6 h-6 text-green-600" />
                  <span className="text-sm font-medium">Heures de prières</span>
                </Button>
              </Link>
              <Link href={`/adminparoisse/donation-types?paroisse=${encodeURIComponent(paroisse)}`}>
                <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300">
                  <Heart className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-medium">Types de dons</span>
                </Button>
              </Link>
              <Link href={`/adminparoisse/donations?paroisse=${encodeURIComponent(paroisse)}`}>
                <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2 hover:bg-yellow-50 hover:border-yellow-300">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                  <span className="text-sm font-medium">Historique dons</span>
                </Button>
              </Link>
              <Link href={`/adminparoisse/news?paroisse=${encodeURIComponent(paroisse)}`}>
                <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2 hover:bg-purple-50 hover:border-purple-300">
                  <Newspaper className="w-6 h-6 text-purple-600" />
                  <span className="text-sm font-medium">Actualités</span>
                </Button>
              </Link>
              <Link href={`/adminparoisse/settings?paroisse=${encodeURIComponent(paroisse)}`}>
                <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2 hover:bg-gray-50 hover:border-gray-300">
                  <Settings className="w-6 h-6 text-gray-600" />
                  <span className="text-sm font-medium">Paramètres</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques d'activités */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              Statistiques d'activités
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityStats />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
