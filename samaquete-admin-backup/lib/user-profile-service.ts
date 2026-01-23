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
import { 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  User
} from 'firebase/auth'
import { db } from './firebase'

export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  bio: string
  avatar: string
  role: string
  parishId?: string
  parishName?: string
  preferences: {
    language: string
    timezone: string
    notifications: boolean
    darkMode: boolean
  }
  createdAt: any
  updatedAt: any
}

export interface ActivityLog {
  id: string
  userId: string
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'password_change' | 'profile_update' | 'settings_update' | 'notification_settings_update' | 'prayer_time_create' | 'prayer_time_update' | 'prayer_time_delete' | 'news_create' | 'news_update' | 'news_delete' | 'donation_create' | 'donation_update' | 'donation_delete' | 'donation_type_create' | 'donation_type_update' | 'donation_type_delete'
  description: string
  entityType?: 'prayer_time' | 'news' | 'donation' | 'donation_type' | 'user' | 'settings' | 'notification'
  entityId?: string
  entityName?: string
  timestamp: any
  ipAddress?: string
  userAgent?: string
  details?: any
  changes?: {
    before?: any
    after?: any
    fields?: string[]
  }
}

export class UserProfileService {
  private static collection = 'user_profiles'
  private static activityCollection = 'activity_logs'

  // Récupérer le profil utilisateur
  static async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, this.collection, userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as UserProfile
      }
      return null
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error)
      throw error
    }
  }

  // Mettre à jour le profil utilisateur
  static async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<void> {
    try {
      const docRef = doc(db, this.collection, userId)
      await updateDoc(docRef, {
        ...profileData,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error)
      throw error
    }
  }

  // Changer le mot de passe
  static async changePassword(
    user: User, 
    currentPassword: string, 
    newPassword: string
  ): Promise<void> {
    try {
      // Réauthentifier l'utilisateur avec le mot de passe actuel
      const credential = EmailAuthProvider.credential(user.email!, currentPassword)
      await reauthenticateWithCredential(user, credential)
      
      // Mettre à jour le mot de passe
      await updatePassword(user, newPassword)
      
      // Enregistrer l'activité
      await this.logActivity(user.uid, 'password_change', 'Mot de passe modifié')
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error)
      throw error
    }
  }

  // Enregistrer une activité
  static async logActivity(
    userId: string, 
    action: ActivityLog['action'], 
    description: string, 
    details?: {
      entityType?: ActivityLog['entityType']
      entityId?: string
      entityName?: string
      changes?: ActivityLog['changes']
      ipAddress?: string
      userAgent?: string
    }
  ): Promise<void> {
    try {
      // Construire l'objet de données en excluant explicitement les valeurs undefined
      const activityData: Record<string, any> = {
        userId,
        action,
        description,
        timestamp: serverTimestamp(),
      }
      
      // N'inclure que les champs définis et non-undefined (Firebase n'accepte pas undefined)
      if (details) {
        if (details.entityType !== undefined && details.entityType !== null) {
          activityData.entityType = details.entityType
        }
        if (details.entityId !== undefined && details.entityId !== null) {
          activityData.entityId = details.entityId
        }
        if (details.entityName !== undefined && details.entityName !== null) {
          activityData.entityName = details.entityName
        }
        if (details.ipAddress !== undefined && details.ipAddress !== null && details.ipAddress !== '') {
          activityData.ipAddress = details.ipAddress
        }
        if (details.userAgent !== undefined && details.userAgent !== null && details.userAgent !== '') {
          activityData.userAgent = details.userAgent
        }
        if (details.changes !== undefined && details.changes !== null) {
          activityData.changes = details.changes
        }
      }
      
      const docRef = doc(collection(db, this.activityCollection))
      await setDoc(docRef, activityData)
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'activité:', error)
      throw error // Re-lancer l'erreur pour que le code appelant puisse la gérer
    }
  }

  // Méthodes spécialisées pour différents types d'activités
  static async logCreate(
    userId: string,
    entityType: ActivityLog['entityType'],
    entityName: string,
    entityId?: string,
    changes?: ActivityLog['changes']
  ): Promise<void> {
    const action = `${entityType}_create` as ActivityLog['action']
    const description = `${entityType === 'prayer_time' ? 'Heure de prière' : 
                        entityType === 'news' ? 'Actualité' :
                        entityType === 'donation' ? 'Don' :
                        entityType === 'donation_type' ? 'Type de don' : 'Élément'} créé(e)`
    
    await this.logActivity(userId, action, description, {
      entityType,
      entityId,
      entityName,
      changes
    })
  }

  static async logUpdate(
    userId: string,
    entityType: ActivityLog['entityType'],
    entityName: string,
    entityId?: string,
    changes?: ActivityLog['changes']
  ): Promise<void> {
    const action = `${entityType}_update` as ActivityLog['action']
    const description = `${entityType === 'prayer_time' ? 'Heure de prière' : 
                        entityType === 'news' ? 'Actualité' :
                        entityType === 'donation' ? 'Don' :
                        entityType === 'donation_type' ? 'Type de don' : 'Élément'} modifié(e)`
    
    await this.logActivity(userId, action, description, {
      entityType,
      entityId,
      entityName,
      changes
    })
  }

  static async logDelete(
    userId: string,
    entityType: ActivityLog['entityType'],
    entityName: string,
    entityId?: string
  ): Promise<void> {
    const action = `${entityType}_delete` as ActivityLog['action']
    const description = `${entityType === 'prayer_time' ? 'Heure de prière' : 
                        entityType === 'news' ? 'Actualité' :
                        entityType === 'donation' ? 'Don' :
                        entityType === 'donation_type' ? 'Type de don' : 'Élément'} supprimé(e)`
    
    await this.logActivity(userId, action, description, {
      entityType,
      entityId,
      entityName
    })
  }

  // Récupérer les journaux d'activité
  static async getActivityLogs(userId: string, limitCount: number = 20): Promise<ActivityLog[]> {
    try {
      const q = query(
        collection(db, this.activityCollection),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ActivityLog[]
    } catch (error) {
      console.error('Erreur lors de la récupération des journaux:', error)
      return []
    }
  }

  // Récupérer les connexions récentes
  static async getRecentLogins(userId: string): Promise<ActivityLog[]> {
    try {
      const q = query(
        collection(db, this.activityCollection),
        where('userId', '==', userId),
        where('action', '==', 'login'),
        orderBy('timestamp', 'desc'),
        limit(10)
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ActivityLog[]
    } catch (error) {
      console.error('Erreur lors de la récupération des connexions:', error)
      return []
    }
  }
}
