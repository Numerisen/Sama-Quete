"use client"
import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationSettingsService, Notification } from "@/lib/notification-settings-service"
import { useAuth } from "@/lib/auth-context"

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { userRole } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userRole?.id) {
      loadNotifications()
      // Recharger les notifications toutes les 30 secondes
      const interval = setInterval(loadNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [userRole?.id])

  const loadNotifications = async () => {
    if (!userRole?.id) return

    setLoading(true)
    try {
      const notifs = await NotificationSettingsService.getUnreadNotifications(userRole.id)
      setNotifications(notifs)
      setUnreadCount(notifs.filter(n => !n.read).length)
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await NotificationSettingsService.markAsRead(notificationId)
      await loadNotifications() // Recharger les notifications
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email': return '📧'
      case 'push': return '🔔'
      case 'sms': return '📱'
      default: return '🔔'
    }
  }

  const getNotificationColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'normal': return 'text-yellow-600'
      case 'low': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  if (!userRole?.id) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={`relative ${className}`}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-sm text-gray-500">
              ({unreadCount} non lue{unreadCount > 1 ? 's' : ''})
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Chargement...
          </div>
        ) : notifications.length > 0 ? (
          notifications.slice(0, 5).map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex items-start gap-3 p-3 cursor-pointer"
              onClick={() => handleMarkAsRead(notification.id)}
            >
              <span className="text-lg">{getNotificationIcon(notification.type)}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${getNotificationColor(notification.priority)}`}>
                  {notification.title}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {notification.createdAt?.toDate ? 
                    notification.createdAt.toDate().toLocaleString('fr-FR') : 
                    new Date(notification.createdAt).toLocaleString('fr-FR')
                  }
                </p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
              )}
            </DropdownMenuItem>
          ))
        ) : (
          <div className="p-4 text-center text-sm text-gray-500">
            Aucune notification
          </div>
        )}
        
        {notifications.length > 5 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm text-blue-600">
              Voir toutes les notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
