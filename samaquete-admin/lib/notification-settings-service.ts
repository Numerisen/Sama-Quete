import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore'
import { db } from './firebase'

export interface NotificationSettings {
  id: string
  userId: string
  email: boolean
  push: boolean
  sms: boolean
  donationAlerts: boolean
  prayerTimeAlerts: boolean
  newsAlerts: boolean
  emailAddress?: string
  phoneNumber?: string
  createdAt: any
  updatedAt: any
}

export interface Notification {
  id: string
  userId: string
  type: 'email' | 'push' | 'sms'
  title: string
  message: string
  read: boolean
  priority: 'low' | 'normal' | 'high'
  createdAt: any
  data?: any
}

export class NotificationSettingsService {
  private static settingsCollection = 'notification_settings'
  private static notificationsCollection = 'notifications'

  // Récupérer les paramètres de notification
  static async getSettings(userId: string): Promise<NotificationSettings | null> {
    try {
      const q = query(
        collection(db, this.settingsCollection),
        where('userId', '==', userId)
      )
      
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        return { id: doc.id, ...doc.data() } as NotificationSettings
      }
      return null
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres de notification:', error)
      throw error
    }
  }

  // Sauvegarder les paramètres de notification
  static async saveSettings(userId: string, settings: Partial<NotificationSettings>): Promise<void> {
    try {
      const existingSettings = await this.getSettings(userId)
      
      if (existingSettings) {
        // Mettre à jour
        const docRef = doc(db, this.settingsCollection, existingSettings.id)
        await updateDoc(docRef, {
          ...settings,
          updatedAt: serverTimestamp()
        })
      } else {
        // Créer
        const docRef = doc(collection(db, this.settingsCollection))
        await setDoc(docRef, {
          ...settings,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres de notification:', error)
      throw error
    }
  }

  // Récupérer les notifications non lues
  static async getUnreadNotifications(userId: string, limitCount: number = 10): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, this.notificationsCollection),
        where('userId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[]
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error)
      return []
    }
  }

  // Marquer une notification comme lue
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const docRef = doc(db, this.notificationsCollection, notificationId)
      await updateDoc(docRef, {
        read: true,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error)
      throw error
    }
  }

  // Envoyer une notification
  static async sendNotification(
    userId: string,
    type: 'email' | 'push' | 'sms',
    title: string,
    message: string,
    priority: 'low' | 'normal' | 'high' = 'normal',
    data?: any
  ): Promise<void> {
    try {
      const notificationData: Omit<Notification, 'id'> = {
        userId,
        type,
        title,
        message,
        read: false,
        priority,
        createdAt: serverTimestamp(),
        data
      }
      
      const docRef = doc(collection(db, this.notificationsCollection))
      await setDoc(docRef, notificationData)
      
      // Ici on pourrait ajouter l'envoi réel par email, push, SMS
      console.log(`Notification ${type} envoyée à l'utilisateur ${userId}:`, { title, message })
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error)
      throw error
    }
  }

  // Récupérer les paramètres par défaut
  static getDefaultSettings(userId: string): Partial<NotificationSettings> {
    return {
      userId,
      email: true,
      push: true,
      sms: false,
      donationAlerts: true,
      prayerTimeAlerts: true,
      newsAlerts: true
    }
  }
}
