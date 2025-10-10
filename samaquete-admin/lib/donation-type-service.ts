import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  Unsubscribe
} from 'firebase/firestore'
import { db } from './firebase'

export interface DonationType {
  id?: string
  name: string
  description: string
  icon: string // ex: "heart-outline", "add", "flame", "business"
  gradientColors: [string, string] // ex: ["#f87171", "#ef4444"]
  defaultAmounts: [string, string, string, string] // 4 montants par défaut
  isActive: boolean
  parishId?: string
  order?: number // Pour l'ordre d'affichage
  createdAt?: any
  updatedAt?: any
}

export class DonationTypeService {
  private static collectionName = 'donation_types'

  // Créer un nouveau type de don
  static async createDonationType(
    data: Omit<DonationType, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef.id
    } catch (error) {
      console.error('Erreur lors de la création du type de don:', error)
      return null
    }
  }

  // Récupérer tous les types de dons actifs par paroisse
  static async getActiveDonationTypesByParish(
    parishId: string
  ): Promise<DonationType[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('parishId', '==', parishId),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DonationType[]
    } catch (error) {
      console.error('Erreur lors de la récupération des types de dons:', error)
      return []
    }
  }

  // Récupérer tous les types de dons (actifs et inactifs) par paroisse
  static async getAllDonationTypesByParish(
    parishId: string
  ): Promise<DonationType[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('parishId', '==', parishId),
        orderBy('order', 'asc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DonationType[]
    } catch (error) {
      console.error('Erreur lors de la récupération de tous les types de dons:', error)
      return []
    }
  }

  // Mettre à jour un type de don
  static async updateDonationType(
    id: string,
    updates: Partial<Omit<DonationType, 'id' | 'createdAt'>>
  ): Promise<boolean> {
    try {
      const docRef = doc(db, this.collectionName, id)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      return true
    } catch (error) {
      console.error('Erreur lors de la mise à jour du type de don:', error)
      return false
    }
  }

  // Supprimer un type de don
  static async deleteDonationType(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, this.collectionName, id)
      await deleteDoc(docRef)
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression du type de don:', error)
      return false
    }
  }

  // Activer/Désactiver un type de don
  static async toggleDonationType(id: string, isActive: boolean): Promise<boolean> {
    try {
      const docRef = doc(db, this.collectionName, id)
      await updateDoc(docRef, {
        isActive,
        updatedAt: serverTimestamp()
      })
      return true
    } catch (error) {
      console.error('Erreur lors du changement d\'état du type de don:', error)
      return false
    }
  }

  // Écouter les changements en temps réel par paroisse
  static subscribeToDonationTypesByParish(
    parishId: string,
    callback: (types: DonationType[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, this.collectionName),
      where('parishId', '==', parishId),
      orderBy('order', 'asc')
    )

    return onSnapshot(q, (snapshot) => {
      const types = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DonationType[]
      callback(types)
    })
  }

  // Initialiser les types de dons par défaut pour une paroisse
  static async initializeDefaultDonationTypes(
    parishId: string
  ): Promise<boolean> {
    try {
      const defaultTypes: Omit<DonationType, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: 'Quête dominicale',
          description: 'Soutien hebdomadaire à la paroisse',
          icon: 'heart-outline',
          gradientColors: ['#f87171', '#ef4444'],
          defaultAmounts: ['1,500', '3,000', '7,000', '10,000'],
          isActive: true,
          parishId,
          order: 1
        },
        {
          name: 'Denier du culte',
          description: 'Contribution annuelle diocésaine',
          icon: 'add',
          gradientColors: ['#fbbf24', '#f59e0b'],
          defaultAmounts: ['8,000', '15,000', '25,000', '50,000'],
          isActive: true,
          parishId,
          order: 2
        },
        {
          name: 'Cierge Pascal',
          description: 'Lumière pour vos intentions',
          icon: 'flame',
          gradientColors: ['#facc15', '#eab308'],
          defaultAmounts: ['800', '1,500', '2,500', '5,000'],
          isActive: true,
          parishId,
          order: 3
        },
        {
          name: 'Messe d\'intention',
          description: 'Messe célébrée pour vos proches',
          icon: 'business',
          gradientColors: ['#60a5fa', '#3b82f6'],
          defaultAmounts: ['12,000', '20,000', '30,000', '50,000'],
          isActive: true,
          parishId,
          order: 4
        }
      ]

      for (const type of defaultTypes) {
        await this.createDonationType(type)
      }

      return true
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des types de dons:', error)
      return false
    }
  }
}

