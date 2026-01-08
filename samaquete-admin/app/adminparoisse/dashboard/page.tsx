"use client"
export const dynamic = "force-dynamic"
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
  Clock 
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
import { NewsService, UserService, ParishService, DonationService } from "@/lib/firestore-services"
import { useSearchParams } from "next/navigation"

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
  totalUsers: number;
  totalEglises: number;
  totalDonations: number;
  totalAmount: number;
  activeUsers: number;
  inactiveUsers: number;
  publishedNews: number;
  draftNews: number;
  todayDonations: number;
  weekDonations: number;
  monthDonations: number;
  avgDonation: number;
  topEglise: string;
  recentDonations: any[];
  recentNews: any[];
  recentUsers: any[];
  paroisseName: string;
}

export default function ParoisseDashboardPage() {
  const searchParams = useSearchParams()
  const paroisse = searchParams.get('paroisse') || 'Paroisse Saint Jean Bosco'
  
  const [stats, setStats] = useState<ParoisseStats>({
    totalUsers: 0,
    totalEglises: 0,
    totalDonations: 0,
    totalAmount: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    publishedNews: 0,
    draftNews: 0,
    todayDonations: 0,
    weekDonations: 0,
    monthDonations: 0,
    avgDonation: 0,
    topEglise: "",
    recentDonations: [],
    recentNews: [],
    recentUsers: [],
    paroisseName: paroisse
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  const loadParoisseData = async () => {
    try {
      setLoading(true);
      
      // Charger toutes les données en parallèle depuis Firestore
      const [users, parishes, donations, news] = await Promise.all([
        UserService.getAll(),
        ParishService.getAll(),
        DonationService.getAll(),
        NewsService.getAll()
      ]);

      // Filtrer les données pour la paroisse actuelle (églises = paroisses dans ce contexte)
      const paroisseUsers = users.filter(u => u.parish === paroisse || u.paroisse === paroisse);
      const paroisseEglises = parishes.filter(p => p.name === paroisse || p.paroisse === paroisse);
      const paroisseDonations = donations.filter(d => d.parish === paroisse || d.paroisse === paroisse);
      const paroisseNews = news.filter(n => n.parish === paroisse || n.paroisse === paroisse);

      // Vérifier si des données existent pour cette paroisse
      if (paroisseUsers.length === 0 && paroisseEglises.length === 0 && paroisseDonations.length === 0 && paroisseNews.length === 0) {
        // Aucune donnée pour cette paroisse, afficher des valeurs par défaut
        setStats(prev => ({
          ...prev,
          totalUsers: 0,
          totalEglises: 0,
          totalDonations: 0,
          totalAmount: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          publishedNews: 0,
          draftNews: 0,
          todayDonations: 0,
          weekDonations: 0,
          monthDonations: 0,
          avgDonation: 0,
          topEglise: "Aucune donnée",
          recentDonations: [],
          recentNews: [],
          recentUsers: []
        }));
        setLastUpdate(new Date());
        return;
      }

      // Calculer les statistiques avec les données réelles
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const totalAmount = paroisseDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
      const todayDonations = paroisseDonations.filter(d => d.date?.startsWith(today)).length;
      const weekDonations = paroisseDonations.filter(d => d.date && d.date >= weekAgo).length;
      const monthDonations = paroisseDonations.filter(d => d.date && d.date >= monthAgo).length;
      const avgDonation = paroisseDonations.length > 0 ? Math.round(totalAmount / paroisseDonations.length) : 0;

      // Église avec le plus de dons
      const egliseStats: Record<string, number> = {};
      paroisseDonations.forEach(d => {
        if (d.eglise || d.parish) {
          const egliseName = d.eglise || d.parish;
          egliseStats[egliseName] = (egliseStats[egliseName] || 0) + (d.amount || 0);
        }
      });
      const topEglise = Object.keys(egliseStats).length > 0 
        ? Object.keys(egliseStats).reduce((a, b) => egliseStats[a] > egliseStats[b] ? a : b)
        : "Aucune donnée";

      // Utilisateurs actifs/inactifs
      const activeUsers = paroisseUsers.filter(u => u.status === "Actif").length;
      const inactiveUsers = paroisseUsers.filter(u => u.status === "Inactif").length;

      // Actualités publiées/brouillons
      const publishedNews = paroisseNews.filter(n => n.published).length;
      const draftNews = paroisseNews.filter(n => !n.published).length;

      // Dernières activités (limitées à 5)
      const recentDonations = paroisseDonations
        .filter(d => d.date) // Filtrer les dons avec une date valide
        .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
        .slice(0, 5);

      const recentNews = paroisseNews
        .filter(n => n.createdAt) // Filtrer les actualités avec une date de création
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 5);

      const recentUsers = paroisseUsers
        .filter(u => u.createdAt) // Filtrer les utilisateurs avec une date de création
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 5);

      setStats(prev => ({
        ...prev,
        totalUsers: paroisseUsers.length,
        totalEglises: paroisseEglises.length,
        totalDonations: paroisseDonations.length,
        totalAmount,
        activeUsers,
        inactiveUsers,
        publishedNews,
        draftNews,
        todayDonations,
        weekDonations,
        monthDonations,
        avgDonation,
        topEglise,
        recentDonations,
        recentNews,
        recentUsers
      }));

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du tableau de bord paroisse",
        variant: "destructive"
      });
      
      // En cas d'erreur, afficher des valeurs par défaut
      setStats(prev => ({
        ...prev,
        totalUsers: 0,
        totalEglises: 0,
        totalDonations: 0,
        totalAmount: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        publishedNews: 0,
        draftNews: 0,
        todayDonations: 0,
        weekDonations: 0,
        monthDonations: 0,
        avgDonation: 0,
        topEglise: "Erreur de chargement",
        recentDonations: [],
        recentNews: [],
        recentUsers: []
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParoisseData();
    
    // Actualisation automatique toutes les 5 minutes
    const interval = setInterval(() => {
      loadParoisseData();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [paroisse]);

  // Données pour les graphiques (basées sur les données réelles)
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

  // Données par église (top 5) - basées sur les données réelles
  const egliseStats: Record<string, number> = {};
  stats.recentDonations.forEach(d => {
    const egliseName = d.eglise || d.parish;
    if (egliseName) {
      egliseStats[egliseName] = (egliseStats[egliseName] || 0) + 1;
    }
  });
  const topEglises = Object.entries(egliseStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Si aucune donnée, afficher un message
  const hasData = stats.totalDonations > 0 || stats.totalUsers > 0 || stats.totalEglises > 0 || stats.totalAmount > 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Chargement du tableau de bord paroisse...</span>
        </div>
      </div>
    );
  }

  // Afficher un message si aucune donnée n'est disponible
  if (!hasData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="mb-8">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Church className="w-12 h-12 text-blue-500" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Tableau de bord paroisse vide</h1>
              <p className="text-lg text-gray-600 mb-2">
                Aucune donnée n'est disponible dans Firestore pour la paroisse :
              </p>
              <p className="text-xl font-semibold text-blue-600 mb-8">{stats.paroisseName}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Utilisateurs</h3>
                  <p className="text-sm text-gray-600">0 utilisateurs</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <MapPin className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Églises</h3>
                  <p className="text-sm text-gray-600">0 églises</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Dons</h3>
                  <p className="text-sm text-gray-600">0 FCFA collectés</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                Pour commencer à utiliser le tableau de bord paroisse, ajoutez des données via les sections :
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/adminparoisse/users">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Utilisateurs
                  </Button>
                </Link>
                <Link href="/adminparoisse/eglises">
                  <Button variant="outline" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Églises
                  </Button>
                </Link>
                <Link href="/adminparoisse/donations">
                  <Button variant="outline" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Dons
                  </Button>
                </Link>
                <Link href="/adminparoisse/news">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Actualités
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-6">
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
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total Collecté</p>
                    <p className="text-3xl font-bold">{formatAmount(stats.totalAmount)} FCFA</p>
                    <p className="text-purple-100 text-sm mt-1">{stats.totalDonations} dons</p>
                  </div>
                  <DollarSign className="w-12 h-12 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium">Églises</p>
                    <p className="text-3xl font-bold">{stats.totalEglises}</p>
                    <p className="text-indigo-100 text-sm mt-1">Dans la paroisse</p>
                  </div>
                  <Church className="w-12 h-12 text-indigo-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Utilisateurs</p>
                    <p className="text-3xl font-bold">{stats.activeUsers}</p>
                    <p className="text-green-100 text-sm mt-1">{stats.inactiveUsers} inactifs</p>
                  </div>
                  <Users className="w-12 h-12 text-green-200" />
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
                    <p className="text-orange-100 text-sm font-medium">Actualités</p>
                    <p className="text-3xl font-bold">{stats.publishedNews}</p>
                    <p className="text-orange-100 text-sm mt-1">{stats.draftNews} brouillons</p>
                  </div>
                  <BookOpen className="w-12 h-12 text-orange-200" />
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
                <h3 className="text-lg font-semibold text-gray-900">Aujourd'hui</h3>
                <Calendar className="w-5 h-5 text-purple-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Dons</span>
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
                  <span className="text-gray-600">Top église</span>
                  <span className="font-semibold text-gray-900 truncate max-w-32">{stats.topEglise}</span>
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
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Données synchronisées</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Églises actives</span>
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
                <BarChart2 className="w-5 h-5 text-purple-500" />
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
                      backgroundColor: "rgba(147, 51, 234, 0.8)",
                      borderColor: "rgb(147, 51, 234)",
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
                <PieChart className="w-5 h-5 text-indigo-500" />
                Top 5 Églises
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Doughnut
                data={{
                  labels: topEglises.map(([eglise]) => eglise),
                  datasets: [
                    {
                      data: topEglises.map(([, count]) => count),
                      backgroundColor: [
                        "rgba(147, 51, 234, 0.8)",
                        "rgba(59, 130, 246, 0.8)",
                        "rgba(16, 185, 129, 0.8)",
                        "rgba(245, 158, 11, 0.8)",
                        "rgba(239, 68, 68, 0.8)",
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
                      <p className="font-medium text-gray-900">{donation.fullname || "Anonyme"}</p>
                      <p className="text-sm text-gray-600">{donation.eglise || donation.parish || "Non spécifié"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatAmount(donation.amount || 0)} FCFA</p>
                      <p className="text-xs text-gray-500">{formatDate(donation.date || "")}</p>
                    </div>
                  </div>
                ))}
                {stats.recentDonations.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Aucun don récent</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Actualités récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentNews.map((news, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 truncate">{news.title}</p>
                      <p className="text-sm text-gray-600">{news.category}</p>
                    </div>
                    <Badge variant={news.published ? "default" : "secondary"}>
                      {news.published ? "Publié" : "Brouillon"}
                    </Badge>
                  </div>
                ))}
                {stats.recentNews.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Aucune actualité récente</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                Utilisateurs récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <Badge variant={user.status === "Actif" ? "default" : "secondary"}>
                      {user.status}
                    </Badge>
                  </div>
                ))}
                {stats.recentUsers.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Aucun utilisateur récent</p>
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Link href="/adminparoisse/users">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2">
                  <Users className="w-6 h-6" />
                  <span className="text-sm">Utilisateurs</span>
                </Button>
              </Link>
              <Link href="/adminparoisse/eglises">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2">
                  <MapPin className="w-6 h-6" />
                  <span className="text-sm">Églises</span>
                </Button>
              </Link>
              <Link href="/adminparoisse/donations">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2">
                  <DollarSign className="w-6 h-6" />
                  <span className="text-sm">Dons</span>
                </Button>
              </Link>
              <Link href="/adminparoisse/news">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2">
                  <Activity className="w-6 h-6" />
                  <span className="text-sm">Actualités</span>
                </Button>
              </Link>
              <Link href="/adminparoisse/notifications">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2">
                  <Bell className="w-6 h-6" />
                  <span className="text-sm">Notifications</span>
                </Button>
              </Link>
              <Link href="/adminparoisse/settings">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2">
                  <Clock className="w-6 h-6" />
                  <span className="text-sm">Paramètres</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}