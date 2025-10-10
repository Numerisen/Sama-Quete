import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'

export interface ParishNotification {
  id?: string
  parishId: string
  type: 'prayer' | 'news' | 'activity' | 'donation' | 'liturgy' | 'general'
  title: string
  message: string
  icon?: string
  priority: 'low' | 'normal' | 'high'
  read: boolean
  actionUrl?: string
  relatedId?: string // ID de l'élément lié (prayer, news, etc.)
  createdAt?: Timestamp
  expiresAt?: Timestamp
}

export class NotificationDataService {
  /**
   * Récupérer toutes les notifications d'une paroisse
   */
  static async getAll(parishId: string): Promise<ParishNotification[]> {
    try {
      const q = query(
        collection(db, 'parish_notifications'),
        where('parishId', '==', parishId)
      )
      const querySnapshot = await getDocs(q)
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ParishNotification[]

      // Tri côté client par date (plus récent en premier)
      return notifications.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0)
        const dateB = b.createdAt?.toDate?.() || new Date(0)
        return dateB.getTime() - dateA.getTime()
      })
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error)
      return []
    }
  }

  /**
   * Récupérer les notifications non lues
   */
  static async getUnread(parishId: string): Promise<ParishNotification[]> {
    try {
      const q = query(
        collection(db, 'parish_notifications'),
        where('parishId', '==', parishId),
        where('read', '==', false)
      )
      const querySnapshot = await getDocs(q)
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ParishNotification[]

      return notifications.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0)
        const dateB = b.createdAt?.toDate?.() || new Date(0)
        return dateB.getTime() - dateA.getTime()
      })
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications non lues:', error)
      return []
    }
  }

  /**
   * Créer une nouvelle notification
   */
  static async create(notification: Omit<ParishNotification, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'parish_notifications'), {
        ...notification,
        createdAt: serverTimestamp(),
        read: false
      })
      console.log('Notification créée:', docRef.id)
      return docRef.id
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error)
      throw error
    }
  }

  /**
   * Marquer une notification comme lue
   */
  static async markAsRead(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'parish_notifications', id)
      await updateDoc(docRef, {
        read: true
      })
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error)
      throw error
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  static async markAllAsRead(parishId: string): Promise<void> {
    try {
      const notifications = await this.getUnread(parishId)
      const promises = notifications.map(notif => 
        notif.id ? this.markAsRead(notif.id) : Promise.resolve()
      )
      await Promise.all(promises)
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error)
      throw error
    }
  }

  /**
   * Écouter les notifications en temps réel
   */
  static subscribeToNotifications(
    parishId: string,
    callback: (notifications: ParishNotification[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'parish_notifications'),
      where('parishId', '==', parishId)
    )

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ParishNotification[]

      // Tri côté client
      const sortedNotifications = notifications.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0)
        const dateB = b.createdAt?.toDate?.() || new Date(0)
        return dateB.getTime() - dateA.getTime()
      })

      callback(sortedNotifications)
    }, (error) => {
      console.error('Erreur lors de l\'écoute des notifications:', error)
    })
  }

  /**
   * Créer une notification pour une nouvelle heure de prière
   */
  static async notifyPrayerTimeUpdate(parishId: string, prayerName: string, time: string): Promise<void> {
    await this.create({
      parishId,
      type: 'prayer',
      title: '⏰ Nouvelle heure de prière',
      message: `${prayerName} à ${time}`,
      icon: 'time',
      priority: 'normal',
      read: false
    })
  }

  /**
   * Créer une notification pour une nouvelle actualité
   */
  static async notifyNews(parishId: string, newsTitle: string, newsId?: string): Promise<void> {
    await this.create({
      parishId,
      type: 'news',
      title: '📰 Nouvelle actualité',
      message: newsTitle,
      icon: 'newspaper',
      priority: 'normal',
      read: false,
      relatedId: newsId
    })
  }

  /**
   * Créer une notification pour une nouvelle activité
   */
  static async notifyActivity(parishId: string, activityTitle: string, date: string, activityId?: string): Promise<void> {
    await this.create({
      parishId,
      type: 'activity',
      title: '📅 Nouvelle activité',
      message: `${activityTitle} - ${date}`,
      icon: 'calendar',
      priority: 'high',
      read: false,
      relatedId: activityId
    })
  }

  /**
   * Créer une notification pour un don
   */
  static async notifyDonation(parishId: string, amount: number, donorName: string): Promise<void> {
    await this.create({
      parishId,
      type: 'donation',
      title: '💝 Nouveau don reçu',
      message: `${donorName} a fait un don de ${amount} FCFA`,
      icon: 'heart',
      priority: 'low',
      read: false
    })
  }

  /**
   * Créer une notification générale
   */
  static async notifyGeneral(parishId: string, title: string, message: string, priority: 'low' | 'normal' | 'high' = 'normal'): Promise<void> {
    await this.create({
      parishId,
      type: 'general',
      title,
      message,
      icon: 'notifications',
      priority,
      read: false
    })
  }
}

