import { useState, useEffect } from 'react'
import { NotificationDataService, ParishNotification } from '../lib/notificationDataService'

export function useNotifications(parishId: string) {
  const [notifications, setNotifications] = useState<ParishNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!parishId) {
      setLoading(false)
      return
    }

    console.log('📱 Chargement des notifications pour la paroisse:', parishId)
    
    // Écouter les notifications en temps réel
    const unsubscribe = NotificationDataService.subscribeToNotifications(
      parishId,
      (updatedNotifications) => {
        console.log('📬 Notifications reçues:', updatedNotifications.length)
        setNotifications(updatedNotifications)
        
        // Compter les non lues
        const unread = updatedNotifications.filter(n => !n.read).length
        setUnreadCount(unread)
        
        setLoading(false)
        setError(null)
      }
    )

    // Nettoyer l'abonnement
    return () => {
      console.log('🔌 Déconnexion de l\'écoute des notifications')
      unsubscribe()
    }
  }, [parishId])

  /**
   * Marquer une notification comme lue
   */
  const markAsRead = async (notificationId: string) => {
    try {
      await NotificationDataService.markAsRead(notificationId)
      console.log('✅ Notification marquée comme lue:', notificationId)
    } catch (err) {
      console.error('❌ Erreur lors du marquage:', err)
      setError('Impossible de marquer la notification comme lue')
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  const markAllAsRead = async () => {
    try {
      await NotificationDataService.markAllAsRead(parishId)
      console.log('✅ Toutes les notifications marquées comme lues')
    } catch (err) {
      console.error('❌ Erreur lors du marquage de toutes les notifications:', err)
      setError('Impossible de marquer toutes les notifications comme lues')
    }
  }

  /**
   * Récupérer uniquement les notifications non lues
   */
  const getUnreadNotifications = () => {
    return notifications.filter(n => !n.read)
  }

  return {
    notifications,
    unreadNotifications: getUnreadNotifications(),
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead
  }
}

