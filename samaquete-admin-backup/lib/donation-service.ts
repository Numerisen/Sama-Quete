import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore'
import { db } from './firebase'

export interface DonationEvent {
  id: string
  title: string
  description: string
  type: 'prière' | 'quete' | 'evenement' | 'collecte'
  parishId: string
  dioceseId?: string
  targetAmount?: number
  currentAmount: number
  startDate: Timestamp
  endDate: Timestamp
  isActive: boolean
  createdBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Donation {
  id: string
  eventId: string
  donorName: string
  donorPhone: string
  donorEmail?: string
  amount: number
  type: 'quete' | 'denier' | 'cierge' | 'prière' | 'evenement'
  paymentMethod: 'cb' | 'wave' | 'orange' | 'especes'
  parishId: string
  dioceseId?: string
  message?: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface DonationStats {
  totalAmount: number
  totalDonations: number
  byType: Record<string, { count: number; amount: number }>
  byParish: Record<string, { count: number; amount: number }>
  byPaymentMethod: Record<string, { count: number; amount: number }>
  recentDonations: Donation[]
}

export class DonationService {
  // ===== GESTION DES ÉVÉNEMENTS DE DONS =====
  
  static async createDonationEvent(event: Omit<DonationEvent, 'id' | 'currentAmount' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const eventsRef = collection(db, 'donationEvents')
      const docRef = await addDoc(eventsRef, {
        ...event,
        currentAmount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef.id
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error)
      return null
    }
  }

  static async getDonationEvents(parishId?: string, dioceseId?: string): Promise<DonationEvent[]> {
    try {
      const eventsRef = collection(db, 'donationEvents')
      let q = query(eventsRef, where('isActive', '==', true))
      
      if (parishId) {
        q = query(eventsRef, where('parishId', '==', parishId), where('isActive', '==', true))
      } else if (dioceseId) {
        q = query(eventsRef, where('dioceseId', '==', dioceseId), where('isActive', '==', true))
      }
      
      const snapshot = await getDocs(q)
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DonationEvent[]
      
      // Trier par date de création (plus récent en premier)
      return events.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
        return dateB.getTime() - dateA.getTime()
      })
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error)
      return []
    }
  }

  static async updateDonationEvent(eventId: string, updates: Partial<DonationEvent>): Promise<boolean> {
    try {
      const eventRef = doc(db, 'donationEvents', eventId)
      await updateDoc(eventRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      return true
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'événement:', error)
      return false
    }
  }

  // ===== GESTION DES DONS =====
  
  static async createDonation(donation: Omit<Donation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const donationsRef = collection(db, 'donations')
      const docRef = await addDoc(donationsRef, {
        ...donation,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      // Mettre à jour le montant de l'événement
      if (donation.eventId) {
        await this.updateEventAmount(donation.eventId, donation.amount)
      }
      
      return docRef.id
    } catch (error) {
      console.error('Erreur lors de la création du don:', error)
      return null
    }
  }

  static async getDonations(filters?: {
    parishId?: string
    dioceseId?: string
    eventId?: string
    status?: string
    limit?: number
  }): Promise<Donation[]> {
    try {
      const donationsRef = collection(db, 'donations')
      let q = query(donationsRef)
      
      if (filters?.parishId) {
        q = query(donationsRef, where('parishId', '==', filters.parishId))
      }
      
      if (filters?.dioceseId) {
        q = query(donationsRef, where('dioceseId', '==', filters.dioceseId))
      }
      
      if (filters?.eventId) {
        q = query(donationsRef, where('eventId', '==', filters.eventId))
      }
      
      if (filters?.status) {
        q = query(donationsRef, where('status', '==', filters.status))
      }
      
      if (filters?.limit) {
        q = query(donationsRef, limit(filters.limit))
      }
      
      const snapshot = await getDocs(q)
      const donations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Donation[]
      
      // Trier par date de création (plus récent en premier)
      return donations.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
        return dateB.getTime() - dateA.getTime()
      })
    } catch (error) {
      console.error('Erreur lors de la récupération des dons:', error)
      return []
    }
  }

  static async getDonationStats(filters?: {
    parishId?: string
    dioceseId?: string
    startDate?: Date
    endDate?: Date
  }): Promise<DonationStats> {
    try {
      const donations = await this.getDonations(filters)
      
      const stats: DonationStats = {
        totalAmount: 0,
        totalDonations: donations.length,
        byType: {},
        byParish: {},
        byPaymentMethod: {},
        recentDonations: donations.slice(0, 10)
      }
      
      donations.forEach(donation => {
        // Montant total
        stats.totalAmount += donation.amount
        
        // Par type
        if (!stats.byType[donation.type]) {
          stats.byType[donation.type] = { count: 0, amount: 0 }
        }
        stats.byType[donation.type].count++
        stats.byType[donation.type].amount += donation.amount
        
        // Par paroisse
        if (!stats.byParish[donation.parishId]) {
          stats.byParish[donation.parishId] = { count: 0, amount: 0 }
        }
        stats.byParish[donation.parishId].count++
        stats.byParish[donation.parishId].amount += donation.amount
        
        // Par méthode de paiement
        if (!stats.byPaymentMethod[donation.paymentMethod]) {
          stats.byPaymentMethod[donation.paymentMethod] = { count: 0, amount: 0 }
        }
        stats.byPaymentMethod[donation.paymentMethod].count++
        stats.byPaymentMethod[donation.paymentMethod].amount += donation.amount
      })
      
      return stats
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error)
      return {
        totalAmount: 0,
        totalDonations: 0,
        byType: {},
        byParish: {},
        byPaymentMethod: {},
        recentDonations: []
      }
    }
  }

  // ===== MÉTHODES UTILITAIRES =====
  
  private static async updateEventAmount(eventId: string, amount: number): Promise<void> {
    try {
      const eventRef = doc(db, 'donationEvents', eventId)
      const eventDoc = await getDoc(eventRef)
      
      if (eventDoc.exists()) {
        const currentAmount = eventDoc.data().currentAmount || 0
        await updateDoc(eventRef, {
          currentAmount: currentAmount + amount,
          updatedAt: serverTimestamp()
        })
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du montant de l\'événement:', error)
    }
  }

  static async deleteDonation(donationId: string): Promise<boolean> {
    try {
      const donationRef = doc(db, 'donations', donationId)
      await deleteDoc(donationRef)
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression du don:', error)
      return false
    }
  }

  static async updateDonationStatus(donationId: string, status: Donation['status']): Promise<boolean> {
    try {
      const donationRef = doc(db, 'donations', donationId)
      await updateDoc(donationRef, {
        status,
        updatedAt: serverTimestamp()
      })
      return true
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      return false
    }
  }
}