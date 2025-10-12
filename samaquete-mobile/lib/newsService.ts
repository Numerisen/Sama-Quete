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
  parishId: string
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
   */
  static async getAll(parishId: string): Promise<ParishNews[]> {
    try {
      const q = query(
        collection(db, 'parish_news'),
        where('parishId', '==', parishId),
        where('published', '==', true)
      )
      const querySnapshot = await getDocs(q)
      const news = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ParishNews[]

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
   */
  static subscribeToNews(
    parishId: string,
    callback: (news: ParishNews[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'parish_news'),
      where('parishId', '==', parishId),
      where('published', '==', true)
    )

    return onSnapshot(q, (snapshot) => {
      const news = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ParishNews[]

      // Tri côté client
      const sortedNews = news.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0)
        const dateB = b.createdAt?.toDate?.() || new Date(0)
        return dateB.getTime() - dateA.getTime()
      })

      callback(sortedNews)
    }, (error) => {
      console.error('Erreur lors de l\'écoute des actualités:', error)
      callback([])
    })
  }
}

