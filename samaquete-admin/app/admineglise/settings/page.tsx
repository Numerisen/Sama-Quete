"use client"
export const dynamic = "force-dynamic"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Settings, 
  Church, 
  Bell, 
  Shield, 
  Users, 
  Download, 
  Upload, 
  Save, 
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Camera,
  Key,
  Eye,
  EyeOff
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { UserProfileService, UserProfile, ActivityLog } from "@/lib/user-profile-service"
import { ParishSettingsService, ParishSettings } from "@/lib/parish-settings-service"
import { NotificationSettingsService, NotificationSettings, Notification } from "@/lib/notification-settings-service"
import { useRouter } from "next/navigation"
import { ProfileSkeleton, SettingsSkeleton, NotificationsSkeleton } from "@/components/ui/loading-skeleton"

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const eglise = searchParams.get('eglise') || 'Église Saint Jean Bosco'
  const tabParam = searchParams.get('tab')
  const { userRole, user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [settings, setSettings] = useState<ParishSettings | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])

  const [loading, setLoading] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'general' | 'notifications' | 'security' | 'data'>(
    (tabParam as 'profile' | 'general' | 'notifications' | 'security' | 'data') || 'profile'
  )
  const [showPassword, setShowPassword] = useState(false)
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Charger les données au montage du composant (une seule fois)
  useEffect(() => {
    if (!dataLoaded && user?.uid && userRole?.parishId) {
      loadData()
    }
  }, [user?.uid, userRole?.parishId, dataLoaded])

  // Mettre à jour l'onglet actif quand l'URL change
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam as 'profile' | 'general' | 'notifications' | 'security' | 'data')
    }
  }, [tabParam])

  const loadData = async () => {
    if (!user?.uid || !userRole?.parishId) return

    setLoading(true)
    try {
      // Charger les données essentielles en parallèle (profil + paramètres)
      const [profile, parishSettings, notifSettings] = await Promise.all([
        UserProfileService.getProfile(user.uid),
        ParishSettingsService.getSettings(userRole.parishId),
        NotificationSettingsService.getSettings(user.uid)
      ])

      // Traiter le profil
      if (profile) {
        setUserProfile(profile)
      } else {
        const defaultProfile: UserProfile = {
          id: user.uid,
          name: userRole?.displayName || 'Admin Église',
          email: userRole?.email || 'admin.eglise@test.com',
          phone: '+221 77 123 45 67',
          bio: 'Administrateur de la eglise',
          avatar: '/placeholder-user.jpg',
          role: userRole?.role || 'parish_admin',
          parishId: userRole?.parishId,
          parishName: eglise,
          preferences: {
            language: 'fr',
            timezone: 'Africa/Dakar',
            notifications: true,
            darkMode: false
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
        setUserProfile(defaultProfile)
      }

      // Traiter les paramètres de eglise
      if (parishSettings) {
        setSettings(parishSettings)
      } else {
        const defaultSettings = ParishSettingsService.getDefaultSettings(userRole.parishId, eglise)
        setSettings(defaultSettings as ParishSettings)
      }

      // Traiter les paramètres de notification
      if (notifSettings) {
        setNotificationSettings(notifSettings)
      } else {
        const defaultNotifSettings = NotificationSettingsService.getDefaultSettings(user.uid)
        setNotificationSettings(defaultNotifSettings as NotificationSettings)
      }

      // Marquer les données comme chargées
      setDataLoaded(true)

      // Charger les données secondaires en arrière-plan (sans bloquer l'UI)
      loadSecondaryData(user.uid)

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadSecondaryData = async (userId: string) => {
    try {
      // Charger les données secondaires en parallèle
      const [logs, notifs] = await Promise.all([
        UserProfileService.getActivityLogs(userId),
        NotificationSettingsService.getUnreadNotifications(userId)
      ])
      
      setActivityLogs(logs)
      setNotifications(notifs)
    } catch (error) {
      console.error('Erreur lors du chargement des données secondaires:', error)
    }
  }

  const handleSaveProfile = async () => {
    if (!userProfile || !user?.uid) return

    setLoading(true)
    try {
      await UserProfileService.updateProfile(user.uid, userProfile)
      await UserProfileService.logActivity(user.uid, 'profile_update', 'Profil mis à jour')
      
      toast({
        title: "Profil sauvegardé",
        description: "Vos informations personnelles ont été mises à jour"
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!settings || !userRole?.parishId || !user?.uid) return

    setLoading(true)
    try {
      await ParishSettingsService.saveSettings(userRole.parishId, settings)
      await UserProfileService.logActivity(user.uid, 'settings_update', 'Paramètres de la eglise mis à jour')
      
      toast({
        title: "Paramètres sauvegardés",
        description: "Les paramètres de la eglise ont été mis à jour"
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    if (!notificationSettings || !user?.uid) return

    setLoading(true)
    try {
      await NotificationSettingsService.saveSettings(user.uid, notificationSettings)
      await UserProfileService.logActivity(user.uid, 'notification_settings_update', 'Paramètres de notification mis à jour')
      
      toast({
        title: "Paramètres de notification sauvegardés",
        description: "Vos préférences de notification ont été mises à jour"
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres de notification",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    toast({
      title: "Export en cours",
      description: "Préparation de l'export des données..."
    })
  }

  const handleImport = () => {
    toast({
      title: "Import en cours",
      description: "Sélectionnez un fichier à importer..."
    })
  }

  const handleChangePassword = async () => {
    if (!user) return

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      await UserProfileService.changePassword(user, passwordData.currentPassword, passwordData.newPassword)
      
      toast({
        title: "Mot de passe changé",
        description: "Votre mot de passe a été mis à jour avec succès"
      })
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: any) {
      let errorMessage = "Impossible de changer le mot de passe"
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = "Le mot de passe actuel est incorrect"
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Le nouveau mot de passe est trop faible"
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = "Veuillez vous reconnecter avant de changer votre mot de passe"
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'general', label: 'Général', icon: Church },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Journaux d\'activités', icon: Clock },
    { id: 'data', label: 'Données', icon: Download }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
            <p className="text-gray-600 mt-1">
              Configuration de la eglise et des préférences
            </p>
          </div>
          <div className="flex gap-3">
            {activeTab === 'profile' && (
              <Button 
                onClick={handleSaveProfile} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Sauvegarder le profil
              </Button>
            )}
            {activeTab === 'general' && (
              <Button 
                onClick={handleSaveSettings} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Sauvegarder les paramètres
              </Button>
            )}
            {activeTab === 'notifications' && (
              <Button 
                onClick={handleSaveNotifications} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Sauvegarder les notifications
              </Button>
            )}
          </div>
        </div>

        {/* Onglets */}
        <div className="flex space-x-1 mb-8 bg-white p-1 rounded-lg shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-green-100 text-green-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Contenu des onglets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Onglet Profil */}
          {activeTab === 'profile' && (
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-green-600" />
                    Informations personnelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Photo de profil */}
                  {userProfile ? (
                    <>
                      <div className="flex items-center gap-4">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={userProfile.avatar} />
                          <AvatarFallback className="text-lg">
                            {userProfile.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            Changer la photo
                          </Button>
                          <p className="text-sm text-gray-500 mt-1">JPG, PNG jusqu'à 2MB</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="userName">Nom complet</Label>
                          <Input
                            id="userName"
                            value={userProfile.name}
                            onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="userEmail">Email</Label>
                          <Input
                            id="userEmail"
                            type="email"
                            value={userProfile.email}
                            onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="userPhone">Téléphone</Label>
                        <Input
                          id="userPhone"
                          value={userProfile.phone}
                          onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label htmlFor="userBio">Biographie</Label>
                        <Textarea
                          id="userBio"
                          value={userProfile.bio}
                          onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})}
                          rows={3}
                          placeholder="Parlez-nous de vous..."
                        />
                      </div>
                    </>
                  ) : (
                    <ProfileSkeleton />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-red-600" />
                    Changer le mot de passe
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    />
                  </div>

                  <Button onClick={handleChangePassword} disabled={loading} className="w-full">
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Changer le mot de passe
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Onglet Général */}
          {activeTab === 'general' && (
            <div className="lg:col-span-2 space-y-6">
              {settings ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Church className="w-5 h-5 text-green-600" />
                      Informations de la eglise
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nom de la eglise</Label>
                        <Input
                          id="name"
                          value={settings.name}
                          onChange={(e) => setSettings({...settings, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="diocese">Diocèse</Label>
                        <Input
                          id="diocese"
                          value={settings.diocese}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Adresse</Label>
                      <Textarea
                        id="address"
                        value={settings.address}
                        onChange={(e) => setSettings({...settings, address: e.target.value})}
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          value={settings.phone}
                          onChange={(e) => setSettings({...settings, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={settings.email}
                          onChange={(e) => setSettings({...settings, email: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="website">Site web</Label>
                        <Input
                          id="website"
                          value={settings.website}
                          onChange={(e) => setSettings({...settings, website: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="priest">Curé</Label>
                        <Input
                          id="priest"
                          value={settings.priest}
                          onChange={(e) => setSettings({...settings, priest: e.target.value})}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <SettingsSkeleton />
              )}
            </div>
          )}

          {/* Onglet Notifications */}
          {activeTab === 'notifications' && (
            <div className="lg:col-span-2 space-y-6">
              {notificationSettings ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-yellow-600" />
                      Préférences de notification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Notifications par email</Label>
                          <p className="text-sm text-gray-500">Recevoir des notifications par email</p>
                        </div>
                        <Switch
                          checked={notificationSettings.email}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({
                              ...notificationSettings, 
                              email: checked
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Notifications push</Label>
                          <p className="text-sm text-gray-500">Notifications dans l'application</p>
                        </div>
                        <Switch
                          checked={notificationSettings.push}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({
                              ...notificationSettings, 
                              push: checked
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Notifications SMS</Label>
                          <p className="text-sm text-gray-500">Alertes par SMS (optionnel)</p>
                        </div>
                        <Switch
                          checked={notificationSettings.sms}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({
                              ...notificationSettings, 
                              sms: checked
                            })
                          }
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Types de notifications</h4>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Alertes de dons</Label>
                          <p className="text-sm text-gray-500">Nouveaux dons reçus</p>
                        </div>
                        <Switch
                          checked={notificationSettings.donationAlerts}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({
                              ...notificationSettings, 
                              donationAlerts: checked
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Alertes d'heures de prière</Label>
                          <p className="text-sm text-gray-500">Modifications des horaires</p>
                        </div>
                        <Switch
                          checked={notificationSettings.prayerTimeAlerts}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({
                              ...notificationSettings, 
                              prayerTimeAlerts: checked
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Alertes d'actualités</Label>
                          <p className="text-sm text-gray-500">Nouvelles publications</p>
                        </div>
                        <Switch
                          checked={notificationSettings.newsAlerts}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({
                              ...notificationSettings, 
                              newsAlerts: checked
                            })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <NotificationsSkeleton />
              )}
            </div>
          )}

          {/* Onglet Journaux d'activités */}
          {activeTab === 'security' && (
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Journaux d'activités
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    Historique complet de toutes les actions effectuées dans le système
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activityLogs.length > 0 ? (
                      activityLogs.map((log) => {
                        const getActionIcon = (action: string) => {
                          if (action.includes('create')) return '➕'
                          if (action.includes('update')) return '✏️'
                          if (action.includes('delete')) return '🗑️'
                          if (action === 'login') return '🔐'
                          if (action === 'logout') return '🚪'
                          if (action === 'password_change') return '🔑'
                          return '📝'
                        }

                        const getActionColor = (action: string) => {
                          if (action.includes('create')) return 'bg-green-100 text-green-800 border-green-200'
                          if (action.includes('update')) return 'bg-blue-100 text-blue-800 border-blue-200'
                          if (action.includes('delete')) return 'bg-red-100 text-red-800 border-red-200'
                          if (action === 'login') return 'bg-green-100 text-green-800 border-green-200'
                          if (action === 'logout') return 'bg-gray-100 text-gray-800 border-gray-200'
                          if (action === 'password_change') return 'bg-orange-100 text-orange-800 border-orange-200'
                          return 'bg-gray-100 text-gray-800 border-gray-200'
                        }

                        const getEntityIcon = (entityType?: string) => {
                          switch (entityType) {
                            case 'prayer_time': return '🕐'
                            case 'news': return '📰'
                            case 'donation': return '💰'
                            case 'donation_type': return '🎁'
                            case 'user': return '👤'
                            case 'settings': return '⚙️'
                            case 'notification': return '🔔'
                            default: return '📄'
                          }
                        }

                        const formatTime = (timestamp: any) => {
                          if (timestamp?.toDate) {
                            return timestamp.toDate().toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })
                          }
                          return new Date(timestamp).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })
                        }

                        return (
                          <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="text-2xl">
                                  {getActionIcon(log.action)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-gray-900">{log.description}</p>
                                    {log.entityType && (
                                      <span className="text-lg">
                                        {getEntityIcon(log.entityType)}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {log.entityName && (
                                    <p className="text-sm text-gray-600 mb-1">
                                      <span className="font-medium">Élément:</span> {log.entityName}
                                    </p>
                                  )}

                                  {log.changes?.fields && log.changes.fields.length > 0 && (
                                    <p className="text-sm text-gray-600 mb-1">
                                      <span className="font-medium">Champs modifiés:</span> {log.changes.fields.join(', ')}
                                    </p>
                                  )}

                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatTime(log.timestamp)}
                                    </span>
                                    {log.ipAddress && (
                                      <span className="flex items-center gap-1">
                                        <Globe className="w-3 h-3" />
                                        {log.ipAddress}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getActionColor(log.action)}`}
                                >
                                  {log.action.replace('_', ' ').toUpperCase()}
                                </Badge>
                                
                                {log.entityType && (
                                  <Badge variant="secondary" className="text-xs">
                                    {log.entityType.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Détails des changements */}
                            {log.changes && (log.changes.before || log.changes.after) && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <details className="group">
                                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                                    Voir les détails des modifications
                                  </summary>
                                  <div className="mt-2 space-y-2">
                                    {log.changes.before && (
                                      <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">AVANT:</p>
                                        <pre className="text-xs bg-red-50 p-2 rounded border text-red-700 overflow-x-auto">
                                          {JSON.stringify(log.changes.before, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                    {log.changes.after && (
                                      <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">APRÈS:</p>
                                        <pre className="text-xs bg-green-50 p-2 rounded border text-green-700 overflow-x-auto">
                                          {JSON.stringify(log.changes.after, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                </details>
                              </div>
                            )}
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-12">
                        <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 text-lg mb-2">Aucune activité enregistrée</p>
                        <p className="text-gray-400 text-sm">
                          Les actions que vous effectuez apparaîtront ici
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Onglet Données */}
          {activeTab === 'data' && (
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-purple-600" />
                    Gestion des données
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sauvegarde automatique</Label>
                      <p className="text-sm text-gray-500">Sauvegarder automatiquement les données</p>
                    </div>
                    <Switch
                      checked={settings?.data?.autoBackup || false}
                      onCheckedChange={(checked) => 
                        setSettings(prev => prev ? {
                          ...prev, 
                          data: {...prev.data, autoBackup: checked}
                        } : null)
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="backupFrequency">Fréquence de sauvegarde</Label>
                      <select
                        id="backupFrequency"
                        value={settings?.data?.backupFrequency || 'daily'}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev, 
                          data: {...prev.data, backupFrequency: e.target.value}
                        } : null)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="daily">Quotidienne</option>
                        <option value="weekly">Hebdomadaire</option>
                        <option value="monthly">Mensuelle</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="retentionPeriod">Période de rétention (jours)</Label>
                      <Input
                        id="retentionPeriod"
                        type="number"
                        value={settings?.data?.retentionPeriod || 365}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev, 
                          data: {...prev.data, retentionPeriod: parseInt(e.target.value)}
                        } : null)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Export/Import</h4>
                    
                    <div className="flex gap-3">
                      <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Exporter les données
                      </Button>
                      <Button onClick={handleImport} variant="outline" className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Importer des données
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Panneau latéral */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statut du système</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Connexion</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connecté
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sauvegarde</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    À jour
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sécurité</span>
                  <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Attention
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}