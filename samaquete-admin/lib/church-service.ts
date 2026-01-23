import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore'
import { db } from './firebase'

/**
 * Service pour gérer les églises dans Firestore
 * ⚠️ IMPORTANT: Les églises sont INTERNES à l'admin, jamais visibles côté mobile
 * Le mobile ne connaît QUE les paroisses (parishId)
 */
export interface Church {
  id: string
  name: string
  parishId: string // OBLIGATOIRE - l'église appartient à une paroisse
  description?: string
  address?: string
  city?: string
  contactInfo?: {
    email?: string
    phone?: string
  }
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export class ChurchService {
  private static collectionName = 'churches'

  /**
   * Créer une nouvelle église
   */
  static async createChurch(
    church: Omit<Church, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string | null> {
    try {
      if (!db) {
        throw new Error('Firestore n\'est pas initialisé')
      }
      if (!church.parishId) {
        throw new Error('parishId est obligatoire pour créer une église')
      }

      const churchesRef = collection(db, this.collectionName)
      const docRef = await addDoc(churchesRef, {
        ...church,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef.id
    } catch (error) {
      console.error('Erreur lors de la création de l\'église:', error)
      return null
    }
  }

  /**
   * Récupérer toutes les églises d'une paroisse
   */
  static async getChurchesByParish(
    parishId: string,
    filters?: { isActive?: boolean }
  ): Promise<Church[]> {
    try {
      if (!db) {
        throw new Error('Firestore n\'est pas initialisé')
      }
      const churchesRef = collection(db, this.collectionName)
      let q = query(churchesRef, where('parishId', '==', parishId))

      if (filters?.isActive !== undefined) {
        q = query(churchesRef, where('parishId', '==', parishId), where('isActive', '==', filters.isActive))
      }

      const snapshot = await getDocs(q)
      const churches = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Church[]

      // Trier par nom
      return churches.sort((a, b) => a.name.localeCompare(b.name))
    } catch (error) {
      console.error('Erreur lors de la récupération des églises:', error)
      return []
    }
  }

  /**
   * Récupérer une église par son ID
   */
  static async getChurchById(churchId: string): Promise<Church | null> {
    try {
      if (!db) {
        throw new Error('Firestore n\'est pas initialisé')
      }
      const churchRef = doc(db, this.collectionName, churchId)
      const churchDoc = await getDoc(churchRef)

      if (churchDoc.exists()) {
        return {
          id: churchDoc.id,
          ...churchDoc.data()
        } as Church
      }
      return null
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'église:', error)
      return null
    }
  }

  /**
   * Mettre à jour une église
   */
  static async updateChurch(
    churchId: string,
    updates: Partial<Omit<Church, 'id' | 'createdAt'>>
  ): Promise<boolean> {
    try {
      if (!db) {
        throw new Error('Firestore n\'est pas initialisé')
      }
      const churchRef = doc(db, this.collectionName, churchId)
      await updateDoc(churchRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      return true
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'église:', error)
      return false
    }
  }

  /**
   * Supprimer une église
   */
  static async deleteChurch(churchId: string): Promise<boolean> {
    try {
      if (!db) {
        throw new Error('Firestore n\'est pas initialisé')
      }
      const churchRef = doc(db, this.collectionName, churchId)
      await deleteDoc(churchRef)
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'église:', error)
      return false
    }
  }

  /**
   * Activer/Désactiver une église
   */
  static async toggleChurch(churchId: string, isActive: boolean): Promise<boolean> {
    try {
      return await this.updateChurch(churchId, { isActive })
    } catch (error) {
      console.error('Erreur lors du changement d\'état de l\'église:', error)
      return false
    }
  }
}
