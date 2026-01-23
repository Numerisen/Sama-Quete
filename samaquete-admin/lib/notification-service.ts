import {
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'

export interface ParishNotification {
  parishId: string
  type: 'prayer' | 'news' | 'activity' | 'donation' | 'liturgy' | 'general'
  title: string
  message: string
  icon?: string
  priority: 'low' | 'normal' | 'high'
  read: boolean
  actionUrl?: string
  relatedId?: string
}

export class AdminNotificationService {
  /**
   * Créer une nouvelle notification
   */
  static async create(notification: ParishNotification): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firestore n\'est pas initialisé')
      }
      const docRef = await addDoc(collection(db, 'parish_notifications'), {
        ...notification,
        createdAt: serverTimestamp(),
        read: false
      })
      console.log('✅ Notification créée:', docRef.id)
      return docRef.id
    } catch (error) {
      console.error('❌ Erreur lors de la création de la notification:', error)
      throw error
    }
  }

  /**
   * Créer une notification pour une nouvelle heure de prière
   */
  static async notifyPrayerTimeUpdate(
    parishId: string,
    prayerName: string,
    time: string,
    isNew: boolean = true
  ): Promise<void> {
    await this.create({
      parishId,
      type: 'prayer',
      title: isNew ? '⏰ Nouvelle heure de prière' : '⏰ Heure de prière modifiée',
      message: `${prayerName} à ${time}`,
      icon: 'time',
      priority: 'normal',
      read: false
    })
  }

  /**
   * Créer une notification pour la suppression d'une heure de prière
   */
  static async notifyPrayerTimeDeleted(
    parishId: string,
    prayerName: string
  ): Promise<void> {
    await this.create({
      parishId,
      type: 'prayer',
      title: '🔕 Heure de prière supprimée',
      message: `L'heure de prière "${prayerName}" a été supprimée`,
      icon: 'time',
      priority: 'low',
      read: false
    })
  }

  /**
   * Créer une notification pour une nouvelle actualité
   */
  static async notifyNews(
    parishId: string,
    newsTitle: string,
    newsId?: string
  ): Promise<void> {
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
  static async notifyActivity(
    parishId: string,
    activityTitle: string,
    date: string,
    activityId?: string
  ): Promise<void> {
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
   * Créer une notification pour une activité modifiée
   */
  static async notifyActivityUpdated(
    parishId: string,
    activityTitle: string
  ): Promise<void> {
    await this.create({
      parishId,
      type: 'activity',
      title: '📝 Activité modifiée',
      message: `L'activité "${activityTitle}" a été mise à jour`,
      icon: 'calendar',
      priority: 'normal',
      read: false
    })
  }

  /**
   * Créer une notification pour un don
   */
  static async notifyDonation(
    parishId: string,
    amount: number,
    donorName: string
  ): Promise<void> {
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
  static async notifyGeneral(
    parishId: string,
    title: string,
    message: string,
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Promise<void> {
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

