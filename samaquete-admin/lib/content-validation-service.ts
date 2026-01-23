import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

export type ContentStatus = 'pending' | 'published' | 'rejected'

export interface ContentItem {
  id?: string
  title: string
  content?: string
  excerpt?: string
  image?: string
  status: ContentStatus
  parishId: string      // ⚠️ OBLIGATOIRE: Contenu rattaché à une paroisse
  churchId?: string     // Optionnel: Si créé par une église
  createdBy: string     // UID de l'utilisateur créateur
  createdByRole: 'parish_admin' | 'church_admin'
  validatedBy?: string  // UID du validateur (si validated)
  validatedAt?: any
  rejectionReason?: string
  createdAt?: any
  updatedAt?: any
  published: boolean    // Pour compatibilité avec l'app mobile
}

/**
 * 🔵 Service de validation de contenu (workflow PENDING → PUBLISHED)
 * 
 * RÈGLE FONCTIONNELLE CLÉ:
 * - Tout contenu visible dans l'app doit être PUBLISHED + rattaché à parishId
 * - Les contenus créés par église passent par PENDING → PUBLISHED (validation paroisse)
 * - Les contenus créés par paroisse sont PUBLISHED directement
 */
export class ContentValidationService {
  /**
   * Récupérer les contenus en attente de validation pour une paroisse
   * (contenus créés par les églises rattachées)
   */
  static async getPendingContentsByParish(parishId: string, collectionName: string = 'admin_news'): Promise<ContentItem[]> {
    try {
      if (!db) {
        throw new Error('Firestore n\'est pas initialisé')
      }
      const q = query(
        collection(db, collectionName),
        where('parishId', '==', parishId),
        where('status', '==', 'pending')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContentItem[]
    } catch (error) {
      console.error('Erreur lors de la récupération des contenus en attente:', error)
      throw error
    }
  }

  /**
   * Valider un contenu (PENDING → PUBLISHED)
   * Appelé par l'admin paroisse
   */
  static async validateContent(
    contentId: string,
    validatorUid: string,
    collectionName: string = 'admin_news'
  ): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firestore n\'est pas initialisé')
      }
      const docRef = doc(db, collectionName, contentId)
      await updateDoc(docRef, {
        status: 'published',
        published: true,        // Pour l'app mobile
        validatedBy: validatorUid,
        validatedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Erreur lors de la validation du contenu:', error)
      throw error
    }
  }

  /**
   * Rejeter un contenu avec raison
   * Appelé par l'admin paroisse
   */
  static async rejectContent(
    contentId: string,
    validatorUid: string,
    reason: string,
    collectionName: string = 'admin_news'
  ): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firestore n\'est pas initialisé')
      }
      const docRef = doc(db, collectionName, contentId)
      await updateDoc(docRef, {
        status: 'rejected',
        published: false,
        validatedBy: validatorUid,
        validatedAt: serverTimestamp(),
        rejectionReason: reason,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Erreur lors du rejet du contenu:', error)
      throw error
    }
  }

  /**
   * Récupérer les contenus publiés d'une paroisse (visibles dans l'app)
   */
  static async getPublishedContentsByParish(parishId: string, collectionName: string = 'admin_news'): Promise<ContentItem[]> {
    try {
      if (!db) {
        throw new Error('Firestore n\'est pas initialisé')
      }
      const q = query(
        collection(db, collectionName),
        where('parishId', '==', parishId),
        where('published', '==', true)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContentItem[]
    } catch (error) {
      console.error('Erreur lors de la récupération des contenus publiés:', error)
      throw error
    }
  }

  /**
   * Récupérer les contenus créés par une église (tous statuts)
   */
  static async getContentsByChurch(
    churchId: string,
    collectionName: string = 'admin_news'
  ): Promise<ContentItem[]> {
    try {
      if (!db) {
        throw new Error('Firestore n\'est pas initialisé')
      }
      const q = query(
        collection(db, collectionName),
        where('churchId', '==', churchId)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContentItem[]
    } catch (error) {
      console.error('Erreur lors de la récupération des contenus de l\'église:', error)
      throw error
    }
  }

  /**
   * Vérifier si un contenu peut être validé par un utilisateur
   * (l'utilisateur doit être admin de la paroisse du contenu)
   */
  static async canValidateContent(
    contentId: string,
    userParishId: string | undefined,
    collectionName: string = 'admin_news'
  ): Promise<boolean> {
    if (!userParishId) return false

    try {
      if (!db) {
        throw new Error('Firestore n\'est pas initialisé')
      }
      const docRef = doc(db, collectionName, contentId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) return false

      const content = docSnap.data() as ContentItem
      return content.parishId === userParishId && content.status === 'pending'
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error)
      return false
    }
  }

  /**
   * Statistiques de validation pour un admin paroisse
   */
  static async getValidationStats(parishId: string, collectionName: string = 'admin_news'): Promise<{
    pending: number
    published: number
    rejected: number
    total: number
  }> {
    try {
      if (!db) {
        throw new Error('Firestore n\'est pas initialisé')
      }
      const q = query(
        collection(db, collectionName),
        where('parishId', '==', parishId)
      )
      const querySnapshot = await getDocs(q)
      const contents = querySnapshot.docs.map(doc => doc.data() as ContentItem)

      return {
        pending: contents.filter(c => c.status === 'pending').length,
        published: contents.filter(c => c.status === 'published').length,
        rejected: contents.filter(c => c.status === 'rejected').length,
        total: contents.length
      }
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error)
      return { pending: 0, published: 0, rejected: 0, total: 0 }
    }
  }
}

