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
import { db } from './firebase' // Utilise votre configuration Firebase existante

// Types pour les données
export interface NewsItem {
  id?: string
  title: string
  excerpt: string
  content?: string
  date: string
  time: string
  location: string
  category: string
  priority: 'low' | 'medium' | 'high'
  image?: string
  diocese?: string
  parishId?: string
  dioceseId?: string
  published: boolean
  createdAt?: any
  updatedAt?: any
}

export interface UserItem {
  id?: string
  name: string
  email: string
  role: 'admin_general' | 'admin_diocesan' | 'admin_parishial' | 'user'
  diocese?: string
  parish?: string
  status: 'Actif' | 'Inactif'
  createdAt?: any
  updatedAt?: any
}

export interface ParishItem {
  id?: string
  name: string
  diocese: string
  city: string
  cure: string
  vicaire: string
  catechists: string
  contactInfo?: {
    email?: string
    phone?: string
    address?: string
  }
  createdAt?: any
  updatedAt?: any
}

export interface DonationItem {
  id?: string
  donorName: string
  amount: number
  type: 'quete' | 'denier' | 'cierge' | 'messe' | 'autre'
  date: string
  diocese: string
  parish?: string
  description?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt?: any
  updatedAt?: any
}

export interface DonationTypeItem {
  id?: string
  name: string
  description?: string
  suggestedAmount?: number
  isActive: boolean
  diocese?: string
  createdAt?: any
  updatedAt?: any
}

export interface LiturgyItem {
  id?: string
  title: string
  date: string
  time: string
  type: 'messe' | 'office' | 'cérémonie'
  diocese: string
  parish?: string
  description?: string
  createdAt?: any
  updatedAt?: any
}

// Service pour les actualités
export class NewsService {
  // Les actualités de l'interface admin sont stockées dans admin_news
  // (cf. scripts de migration et règles Firestore).
  private static collection = 'admin_news'

  static async getAll(): Promise<NewsItem[]> {
    const q = query(collection(db, this.collection), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as NewsItem[]
  }

  static async getByDiocese(diocese: string): Promise<NewsItem[]> {
    const q = query(
      collection(db, this.collection),
      where('diocese', '==', diocese),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as NewsItem[]
  }

  static async getById(id: string): Promise<NewsItem | null> {
    const docRef = doc(db, this.collection, id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as NewsItem
    }
    return null
  }

  static async create(news: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collection), {
      ...news,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  }

  static async update(id: string, news: Partial<NewsItem>): Promise<void> {
    const docRef = doc(db, this.collection, id)
    await updateDoc(docRef, {
      ...news,
      updatedAt: serverTimestamp()
    })
  }

  static async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collection, id)
    await deleteDoc(docRef)
  }

  static subscribeToNews(callback: (news: NewsItem[]) => void): Unsubscribe {
    const q = query(collection(db, this.collection), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (querySnapshot) => {
      const news = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NewsItem[]
      callback(news)
    })
  }

  static subscribeToNewsByDiocese(diocese: string, callback: (news: NewsItem[]) => void): Unsubscribe {
    const q = query(
      collection(db, this.collection),
      where('diocese', '==', diocese),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, (querySnapshot) => {
      const news = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NewsItem[]
      callback(news)
    })
  }
}

// Service pour les utilisateurs
export class UserService {
  private static collection = 'admin_users'

  static async getAll(): Promise<UserItem[]> {
    const q = query(collection(db, this.collection), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserItem[]
  }

  static async getByDiocese(diocese: string): Promise<UserItem[]> {
    const q = query(
      collection(db, this.collection),
      where('diocese', '==', diocese),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserItem[]
  }

  static async getById(id: string): Promise<UserItem | null> {
    const docRef = doc(db, this.collection, id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as UserItem
    }
    return null
  }

  static async create(user: Omit<UserItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collection), {
      ...user,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  }

  static async update(id: string, user: Partial<UserItem>): Promise<void> {
    const docRef = doc(db, this.collection, id)
    await updateDoc(docRef, {
      ...user,
      updatedAt: serverTimestamp()
    })
  }

  static async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collection, id)
    await deleteDoc(docRef)
  }

  static subscribeToUsers(callback: (users: UserItem[]) => void): Unsubscribe {
    const q = query(collection(db, this.collection), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (querySnapshot) => {
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserItem[]
      callback(users)
    })
  }

  static subscribeToUsersByDiocese(diocese: string, callback: (users: UserItem[]) => void): Unsubscribe {
    const q = query(
      collection(db, this.collection),
      where('diocese', '==', diocese),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, (querySnapshot) => {
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserItem[]
      callback(users)
    })
  }
}

// Service pour les paroisses
export class ParishService {
  private static collection = 'admin_parishes'

  static async getAll(): Promise<ParishItem[]> {
    const q = query(collection(db, this.collection), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ParishItem[]
  }

  static async getByDiocese(diocese: string): Promise<ParishItem[]> {
    const q = query(
      collection(db, this.collection),
      where('diocese', '==', diocese),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ParishItem[]
  }

  static async getById(id: string): Promise<ParishItem | null> {
    const docRef = doc(db, this.collection, id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ParishItem
    }
    return null
  }

  static async create(parish: Omit<ParishItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collection), {
      ...parish,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  }

  static async update(id: string, parish: Partial<ParishItem>): Promise<void> {
    const docRef = doc(db, this.collection, id)
    await updateDoc(docRef, {
      ...parish,
      updatedAt: serverTimestamp()
    })
  }

  static async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collection, id)
    await deleteDoc(docRef)
  }

  static subscribeToParishes(callback: (parishes: ParishItem[]) => void): Unsubscribe {
    const q = query(collection(db, this.collection), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (querySnapshot) => {
      const parishes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ParishItem[]
      callback(parishes)
    })
  }

  static subscribeToParishesByDiocese(diocese: string, callback: (parishes: ParishItem[]) => void): Unsubscribe {
    const q = query(
      collection(db, this.collection),
      where('diocese', '==', diocese),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, (querySnapshot) => {
      const parishes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ParishItem[]
      callback(parishes)
    })
  }
}

// Service pour les dons
export class DonationService {
  private static collection = 'admin_donations'

  static async getAll(): Promise<DonationItem[]> {
    const q = query(collection(db, this.collection), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DonationItem[]
  }

  static async getByDiocese(diocese: string): Promise<DonationItem[]> {
    const q = query(
      collection(db, this.collection),
      where('diocese', '==', diocese),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DonationItem[]
  }

  static async getById(id: string): Promise<DonationItem | null> {
    const docRef = doc(db, this.collection, id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as DonationItem
    }
    return null
  }

  static async create(donation: Omit<DonationItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collection), {
      ...donation,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  }

  static async update(id: string, donation: Partial<DonationItem>): Promise<void> {
    const docRef = doc(db, this.collection, id)
    await updateDoc(docRef, {
      ...donation,
      updatedAt: serverTimestamp()
    })
  }

  static async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collection, id)
    await deleteDoc(docRef)
  }

  static subscribeToDonations(callback: (donations: DonationItem[]) => void): Unsubscribe {
    const q = query(collection(db, this.collection), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (querySnapshot) => {
      const donations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DonationItem[]
      callback(donations)
    })
  }

  static subscribeToDonationsByDiocese(diocese: string, callback: (donations: DonationItem[]) => void): Unsubscribe {
    const q = query(
      collection(db, this.collection),
      where('diocese', '==', diocese),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, (querySnapshot) => {
      const donations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DonationItem[]
      callback(donations)
    })
  }
}

// Service pour la liturgie
export class LiturgyService {
  private static collection = 'admin_liturgy'

  static async getAll(): Promise<LiturgyItem[]> {
    const q = query(collection(db, this.collection), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LiturgyItem[]
  }

  static async getByDiocese(diocese: string): Promise<LiturgyItem[]> {
    const q = query(
      collection(db, this.collection),
      where('diocese', '==', diocese),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LiturgyItem[]
  }

  static async getById(id: string): Promise<LiturgyItem | null> {
    const docRef = doc(db, this.collection, id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as LiturgyItem
    }
    return null
  }

  static async create(liturgy: Omit<LiturgyItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collection), {
      ...liturgy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  }

  static async update(id: string, liturgy: Partial<LiturgyItem>): Promise<void> {
    const docRef = doc(db, this.collection, id)
    await updateDoc(docRef, {
      ...liturgy,
      updatedAt: serverTimestamp()
    })
  }

  static async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collection, id)
    await deleteDoc(docRef)
  }

  static subscribeToLiturgy(callback: (liturgy: LiturgyItem[]) => void): Unsubscribe {
    const q = query(collection(db, this.collection), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (querySnapshot) => {
      const liturgy = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LiturgyItem[]
      callback(liturgy)
    })
  }

  static subscribeToLiturgyByDiocese(diocese: string, callback: (liturgy: LiturgyItem[]) => void): Unsubscribe {
    const q = query(
      collection(db, this.collection),
      where('diocese', '==', diocese),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, (querySnapshot) => {
      const liturgy = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LiturgyItem[]
      callback(liturgy)
    })
  }
}

export class DonationTypeService {
  private static collection = 'admin_donation_types'

  static async getAll(): Promise<DonationTypeItem[]> {
    const q = query(collection(db, this.collection), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DonationTypeItem[]
  }

  static async getByDiocese(diocese: string): Promise<DonationTypeItem[]> {
    const q = query(
      collection(db, this.collection),
      where('diocese', '==', diocese)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DonationTypeItem[]
  }

  static async getActiveByDiocese(diocese: string): Promise<DonationTypeItem[]> {
    const q = query(
      collection(db, this.collection),
      where('diocese', '==', diocese),
      where('isActive', '==', true)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DonationTypeItem[]
  }

  static async getById(id: string): Promise<DonationTypeItem | null> {
    const docRef = doc(db, this.collection, id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as DonationTypeItem
    }
    return null
  }

  static async create(data: Omit<DonationTypeItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collection), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  }

  static async update(id: string, data: Partial<Omit<DonationTypeItem, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const docRef = doc(db, this.collection, id)
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
  }

  static async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collection, id)
    await deleteDoc(docRef)
  }

  static subscribeToDonationTypes(callback: (types: DonationTypeItem[]) => void): Unsubscribe {
    const q = query(collection(db, this.collection), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (querySnapshot) => {
      const types = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DonationTypeItem[]
      callback(types)
    })
  }

  static subscribeToDonationTypesByDiocese(diocese: string, callback: (types: DonationTypeItem[]) => void): Unsubscribe {
    const q = query(
      collection(db, this.collection),
      where('diocese', '==', diocese)
    )
    return onSnapshot(q, (querySnapshot) => {
      const types = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DonationTypeItem[]
      callback(types)
    })
  }
}
