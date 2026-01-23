"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ActivityLog } from "@/lib/user-profile-service"
import { UserProfileService } from "@/lib/user-profile-service"
import { useAuth } from "@/lib/auth-context"
import { 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  LogIn, 
  Key, 
  Clock,
  TrendingUp,
  Activity
} from "lucide-react"

interface ActivityStats {
  total: number
  today: number
  thisWeek: number
  byAction: { [key: string]: number }
  byEntity: { [key: string]: number }
  recent: ActivityLog[]
}

export function ActivityStats() {
  const { userRole } = useAuth()
  const [stats, setStats] = useState<ActivityStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userRole?.id) {
      loadStats()
    }
  }, [userRole?.id])

  const loadStats = async () => {
    if (!userRole?.id) return

    setLoading(true)
    try {
      const logs = await UserProfileService.getActivityLogs(userRole.id, 50)
      
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

      const todayLogs = logs.filter(log => {
        const logDate = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp)
        return logDate >= today
      })

      const weekLogs = logs.filter(log => {
        const logDate = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp)
        return logDate >= weekAgo
      })

      const byAction = logs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1
        return acc
      }, {} as { [key: string]: number })

      const byEntity = logs.reduce((acc, log) => {
        if (log.entityType) {
          acc[log.entityType] = (acc[log.entityType] || 0) + 1
        }
        return acc
      }, {} as { [key: string]: number })

      setStats({
        total: logs.length,
        today: todayLogs.length,
        thisWeek: weekLogs.length,
        byAction,
        byEntity,
        recent: logs.slice(0, 5)
      })
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('create')) return <Plus className="w-4 h-4" />
    if (action.includes('update')) return <Edit className="w-4 h-4" />
    if (action.includes('delete')) return <Trash2 className="w-4 h-4" />
    if (action === 'login') return <LogIn className="w-4 h-4" />
    if (action === 'password_change') return <Key className="w-4 h-4" />
    return <Activity className="w-4 h-4" />
  }

  const getActionColor = (action: string) => {
    if (action.includes('create')) return 'bg-green-100 text-green-800'
    if (action.includes('update')) return 'bg-blue-100 text-blue-800'
    if (action.includes('delete')) return 'bg-red-100 text-red-800'
    if (action === 'login') return 'bg-green-100 text-green-800'
    if (action === 'password_change') return 'bg-orange-100 text-orange-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getEntityName = (entityType: string) => {
    switch (entityType) {
      case 'prayer_time': return 'Heures de prière'
      case 'news': return 'Actualités'
      case 'donation': return 'Dons'
      case 'donation_type': return 'Types de dons'
      case 'user': return 'Utilisateurs'
      case 'settings': return 'Paramètres'
      case 'notification': return 'Notifications'
      default: return entityType
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aujourd'hui</p>
                <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cette semaine</p>
                <p className="text-2xl font-bold text-gray-900">{stats.thisWeek}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Moyenne/jour</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(stats.thisWeek / 7)}
                </p>
              </div>
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions par type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions par type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.byAction).map(([action, count]) => (
                <div key={action} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getActionIcon(action)}
                    <span className="text-sm font-medium capitalize">
                      {action.replace('_', ' ')}
                    </span>
                  </div>
                  <Badge className={getActionColor(action)}>
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions par entité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.byEntity).map(([entity, count]) => (
                <div key={entity} className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {getEntityName(entity)}
                  </span>
                  <Badge variant="outline">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activités récentes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activités récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recent.map((log) => (
              <div key={log.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="text-lg">
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {log.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {log.timestamp?.toDate ? 
                      log.timestamp.toDate().toLocaleString('fr-FR') : 
                      new Date(log.timestamp).toLocaleString('fr-FR')
                    }
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getActionColor(log.action)}`}
                >
                  {log.action.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
