import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'

export interface ParishNews {
  id?: string
  scope?: 'parish' | 'diocese' | 'archdiocese' // Niveau de l'actualité
  parishId?: string // Pour les actualités de paroisse
  dioceseId?: string // Pour les actualités de diocèse
  archdioceseId?: string // Pour les actualités d'archidiocèse
  title: string
  content: string
  excerpt: string
  category: string
  published: boolean
  image?: string
  author?: string
  showAuthor?: boolean
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export class NewsService {
  /**
   * Récupérer toutes les actualités d'une paroisse
   * Inclut : actualités de la paroisse + actualités du diocèse + actualités de l'archidiocèse DAKAR
   */
  static async getAll(parishId: string, dioceseId?: string): Promise<ParishNews[]> {
    try {
      // Récupérer toutes les actualités publiées (on filtrera côté client)
      const q = query(
        collection(db, 'parish_news'),
        where('published', '==', true)
      )
      const querySnapshot = await getDocs(q)
      let news = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ParishNews[]

      // Filtrer selon le scope :
      // 1. Actualités de la paroisse (scope: 'parish', parishId: parishId)
      // 2. Actualités du diocèse (scope: 'diocese', dioceseId: dioceseId)
      // 3. Actualités de l'archidiocèse DAKAR (scope: 'archdiocese', archdioceseId: 'DAKAR')
      news = news.filter(n => {
        // Actualités de la paroisse
        if (n.scope === 'parish' && n.parishId === parishId) return true
        
        // Actualités du diocèse (si dioceseId fourni)
        if (dioceseId && n.scope === 'diocese' && n.dioceseId === dioceseId) return true
        
        // Actualités de l'archidiocèse DAKAR (visibles partout)
        if (n.scope === 'archdiocese' && n.archdioceseId === 'DAKAR') return true
        
        // Compatibilité avec les anciennes actualités (sans scope, seulement parishId)
        if (!n.scope && n.parishId === parishId) return true
        
        return false
      })

      // Tri côté client par date (plus récent en premier)
      return news.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0)
        const dateB = b.createdAt?.toDate?.() || new Date(0)
        return dateB.getTime() - dateA.getTime()
      })
    } catch (error) {
      console.error('Erreur lors de la récupération des actualités:', error)
      return []
    }
  }

  /**
   * Récupérer une actualité par ID
   */
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
      return null
    }
  }

  /**
   * Écouter les actualités en temps réel
   * Inclut : actualités de la paroisse + actualités du diocèse + actualités de l'archidiocèse DAKAR
   */
  static subscribeToNews(
    parishId: string,
    callback: (news: ParishNews[]) => void,
    onError?: (error: unknown) => void,
    dioceseId?: string
  ): Unsubscribe {
    // Récupérer toutes les actualités publiées (on filtrera côté client)
    const q = query(
      collection(db, 'parish_news'),
      where('published', '==', true)
    )

    return onSnapshot(q, (snapshot) => {
      let news = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ParishNews[]

      // Filtrer selon le scope
      news = news.filter(n => {
        if (n.scope === 'parish' && n.parishId === parishId) return true
        if (dioceseId && n.scope === 'diocese' && n.dioceseId === dioceseId) return true
        if (n.scope === 'archdiocese' && n.archdioceseId === 'DAKAR') return true
        // Compatibilité avec les anciennes actualités
        if (!n.scope && n.parishId === parishId) return true
        return false
      })

      // Tri côté client
      const sortedNews = news.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0)
        const dateB = b.createdAt?.toDate?.() || new Date(0)
        return dateB.getTime() - dateA.getTime()
      })

      callback(sortedNews)
    }, (error) => {
      console.error('Erreur lors de l\'écoute des actualités:', error)
      onError?.(error)
      callback([])
    })
  }
}

