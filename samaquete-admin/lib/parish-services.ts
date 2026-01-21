import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore'
import { db } from './firebase'

// Types pour les données paroissiales
export interface PrayerTime {
  id?: string
  name: string
  time: string
  days: string[]
  active: boolean
  description?: string
  parishId: string
  createdAt?: any
  updatedAt?: any
}

export interface ParishDonation {
  id?: string
  fullname: string
  amount: number
  date: string
  type: string
  description?: string
  phone?: string
  email?: string
  status: "confirmed" | "pending" | "cancelled"
  parishId: string
  createdAt?: any
  updatedAt?: any
}

export interface ParishActivity {
  id?: string
  title: string
  description: string
  date: string
  time: string
  location: string
  type: string
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  participants: number
  maxParticipants?: number
  organizer: string
  contact?: string
  parishId: string
  createdAt?: any
  updatedAt?: any
}

export interface ParishNews {
  id?: string
  title: string
  content: string
  excerpt: string
  category: string
  published: boolean
  image?: string
  parishId: string
  createdAt?: any
  updatedAt?: any
}

export interface ParishUser {
  id?: string
  name: string
  email: string
  phone?: string
  role: "fidele" | "catechiste" | "animateur" | "admin"
  status: "active" | "inactive"
  parishId: string
  createdAt?: any
  updatedAt?: any
}

export interface ParishSettings {
  id?: string
  parishId: string
  name: string
  address: string
  phone?: string
  email?: string
  website?: string
  description?: string
  logo?: string
  banner?: string
  socialMedia?: {
    facebook?: string
    twitter?: string
    instagram?: string
  }
  createdAt?: any
  updatedAt?: any
}

// Service pour les heures de prières
export class PrayerTimeService {
  static async getAll(parishId: string): Promise<PrayerTime[]> {
    try {
      const q = query(
        collection(db, 'parish_prayer_times'),
        where('parishId', '==', parishId)
      )
      const querySnapshot = await getDocs(q)
      const prayerTimes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PrayerTime[]
      
      // Tri côté client pour éviter l'index composite
      return prayerTimes.sort((a, b) => a.time.localeCompare(b.time))
    } catch (error) {
      console.error('Erreur lors de la récupération des heures de prières:', error)
      throw error
    }
  }

  static async getById(id: string): Promise<PrayerTime | null> {
    try {
      const docRef = doc(db, 'parish_prayer_times', id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as PrayerTime
      }
      return null
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'heure de prière:', error)
      throw error
    }
  }

  static async create(prayerTime: Omit<PrayerTime, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'parish_prayer_times'), {
        ...prayerTime,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef.id
    } catch (error) {
      console.error('Erreur lors de la création de l\'heure de prière:', error)
      throw error
    }
  }

  static async update(id: string, updates: Partial<PrayerTime>): Promise<void> {
    try {
      const docRef = doc(db, 'parish_prayer_times', id)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'heure de prière:', error)
      throw error
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'parish_prayer_times', id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'heure de prière:', error)
      throw error
    }
  }
}

// Service pour les dons paroissiaux
export class ParishDonationService {
  static async getAll(parishId: string): Promise<ParishDonation[]> {
    try {
      const q = query(
        collection(db, 'parish_donations'),
        where('parishId', '==', parishId)
      )
      const querySnapshot = await getDocs(q)
      const donations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ParishDonation[]
      
      // Tri côté client pour éviter l'index composite
      return donations.sort((a, b) => b.date.localeCompare(a.date))
    } catch (error) {
      console.error('Erreur lors de la récupération des dons:', error)
      throw error
    }
  }

  static async getById(id: string): Promise<ParishDonation | null> {
    try {
      const docRef = doc(db, 'parish_donations', id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as ParishDonation
      }
      return null
    } catch (error) {
      console.error('Erreur lors de la récupération du don:', error)
      throw error
    }
  }

  static async create(donation: Omit<ParishDonation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'parish_donations'), {
        ...donation,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef.id
    } catch (error) {
      console.error('Erreur lors de la création du don:', error)
      throw error
    }
  }

  static async update(id: string, updates: Partial<ParishDonation>): Promise<void> {
    try {
      const docRef = doc(db, 'parish_donations', id)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour du don:', error)
      throw error
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'parish_donations', id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Erreur lors de la suppression du don:', error)
      throw error
    }
  }

  static async getStats(parishId: string): Promise<{
    totalAmount: number
    totalDonations: number
    confirmedAmount: number
    pendingAmount: number
    todayDonations: number
  }> {
    try {
      const donations = await this.getAll(parishId)
      const today = new Date().toISOString().split('T')[0]
      
      const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0)
      const confirmedAmount = donations
        .filter(d => d.status === 'confirmed')
        .reduce((sum, d) => sum + d.amount, 0)
      const pendingAmount = donations
        .filter(d => d.status === 'pending')
        .reduce((sum, d) => sum + d.amount, 0)
      const todayDonations = donations.filter(d => d.date === today).length

      return {
        totalAmount,
        totalDonations: donations.length,
        confirmedAmount,
        pendingAmount,
        todayDonations
      }
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error)
      throw error
    }
  }
}

// Service pour les activités paroissiales
export class ParishActivityService {
  static async getAll(parishId: string): Promise<ParishActivity[]> {
    try {
      const q = query(
        collection(db, 'parish_activities'),
        where('parishId', '==', parishId)
      )
      const querySnapshot = await getDocs(q)
      const activities = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ParishActivity[]
      
      // Tri côté client pour éviter l'index composite
      return activities.sort((a, b) => a.date.localeCompare(b.date))
    } catch (error) {
      console.error('Erreur lors de la récupération des activités:', error)
      throw error
    }
  }

  static async getById(id: string): Promise<ParishActivity | null> {
    try {
      const docRef = doc(db, 'parish_activities', id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as ParishActivity
      }
      return null
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'activité:', error)
      throw error
    }
  }

  static async create(activity: Omit<ParishActivity, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'parish_activities'), {
        ...activity,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef.id
    } catch (error) {
      console.error('Erreur lors de la création de l\'activité:', error)
      throw error
    }
  }

  static async update(id: string, updates: Partial<ParishActivity>): Promise<void> {
    try {
      const docRef = doc(db, 'parish_activities', id)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'activité:', error)
      throw error
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'parish_activities', id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'activité:', error)
      throw error
    }
  }
}

// Service pour les actualités paroissiales
export class ParishNewsService {
  static async getAll(parishId: string): Promise<ParishNews[]> {
    try {
      const q = query(
        collection(db, 'parish_news'),
        where('parishId', '==', parishId)
      )
      const querySnapshot = await getDocs(q)
      const news = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ParishNews[]
      
      // Tri côté client pour éviter l'index composite
      return news.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0)
        const dateB = b.createdAt?.toDate?.() || new Date(0)
        return dateB.getTime() - dateA.getTime()
      })
    } catch (error) {
      console.error('Erreur lors de la récupération des actualités:', error)
      throw error
    }
  }

  static async getById(id: string): Promise<ParishNews | null> {
    try {
      const docRef = doc(db, 'parish_news', id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as ParishNews
      }
      return null
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'actualité:', error)
      throw error
    }
  }

  static async create(news: Omit<ParishNews, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'parish_news'), {
        ...news,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef.id
    } catch (error) {
      console.error('Erreur lors de la création de l\'actualité:', error)
      throw error
    }
  }

  static async update(id: string, updates: Partial<ParishNews>): Promise<void> {
    try {
      const docRef = doc(db, 'parish_news', id)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'actualité:', error)
      throw error
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'parish_news', id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'actualité:', error)
      throw error
    }
  }
}

// Service pour les utilisateurs paroissiaux
export class ParishUserService {
  static async getAll(parishId: string): Promise<ParishUser[]> {
    try {
      const q = query(
        collection(db, 'parish_users'),
        where('parishId', '==', parishId)
      )
      const querySnapshot = await getDocs(q)
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ParishUser[]
      
      // Tri côté client pour éviter l'index composite
      return users.sort((a, b) => a.name.localeCompare(b.name))
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error)
      throw error
    }
  }

  static async getById(id: string): Promise<ParishUser | null> {
    try {
      const docRef = doc(db, 'parish_users', id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as ParishUser
      }
      return null
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error)
      throw error
    }
  }

  static async create(user: Omit<ParishUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'parish_users'), {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef.id
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error)
      throw error
    }
  }

  static async update(id: string, updates: Partial<ParishUser>): Promise<void> {
    try {
      const docRef = doc(db, 'parish_users', id)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
      throw error
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'parish_users', id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error)
      throw error
    }
  }
}

// Service pour les paramètres paroissiaux
export class ParishSettingsService {
  static async get(parishId: string): Promise<ParishSettings | null> {
    try {
      const q = query(
        collection(db, 'parish_settings'),
        where('parishId', '==', parishId)
      )
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        return { id: doc.id, ...doc.data() } as ParishSettings
      }
      return null
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error)
      throw error
    }
  }

  static async create(settings: Omit<ParishSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'parish_settings'), {
        ...settings,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef.id
    } catch (error) {
      console.error('Erreur lors de la création des paramètres:', error)
      throw error
    }
  }

  static async update(parishId: string, updates: Partial<ParishSettings>): Promise<void> {
    try {
      const q = query(
        collection(db, 'parish_settings'),
        where('parishId', '==', parishId)
      )
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        const docRef = doc(db, 'parish_settings', querySnapshot.docs[0].id)
        await updateDoc(docRef, {
          ...updates,
          updatedAt: serverTimestamp()
        })
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error)
      throw error
    }
  }
}
