"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { Bell, Calendar, Church, DollarSign, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DioceseDashboardPage() {
  const { user, userRole, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Church className="w-8 h-8 text-amber-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SamaQuete</h1>
                <p className="text-sm text-gray-600">Administration Diocèse</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bonjour, {userRole?.displayName || user?.email}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Tableau de bord</h2>
          <p className="text-gray-600 mt-2">
            Gérez votre diocèse et vos paroisses
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paroisses</CardTitle>
              <Church className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +2 depuis le mois dernier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +12% depuis le mois dernier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Événements</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">
                Ce mois-ci
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Donations</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€12,345</div>
              <p className="text-xs text-muted-foreground">
                +8% depuis le mois dernier
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides - Layout en une seule colonne */}
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button className="justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Gérer les utilisateurs
                </Button>
                <Button className="justify-start" variant="outline">
                  <Church className="mr-2 h-4 w-4" />
                  Gérer les paroisses
                </Button>
                <Button className="justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Planifier un événement
                </Button>
                <Button className="justify-start" variant="outline">
                  <Bell className="mr-2 h-4 w-4" />
                  Envoyer une notification
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Informations du compte - Plus compact */}
          <Card>
            <CardHeader>
              <CardTitle>Informations du compte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Rôle</p>
                  <p className="text-sm text-gray-600">{userRole?.role}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Permissions</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {userRole?.permissions.canManageUsers && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        Gestion utilisateurs
                      </span>
                    )}
                    {userRole?.permissions.canManageParishes && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        Gestion paroisses
                      </span>
                    )}
                    {userRole?.permissions.canManageContent && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                        Gestion contenu
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}