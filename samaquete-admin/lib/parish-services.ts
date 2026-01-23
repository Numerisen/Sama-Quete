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
import {
  DonationType as RawDonationType,
  DonationTypeService,
} from './donation-type-service'

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

// Dons provenant de l'app mobile (collection Firestore: donations)
interface MobileDonation {
  id?: string
  userId: string
  parishId: string
  type: 'quete' | 'denier' | 'cierge' | 'prière'
  amount: number
  customAmount?: number
  message?: string
  status: 'pending' | 'completed' | 'failed'
  createdAt?: any
  updatedAt?: any
}

function mobileStatusToParishStatus(
  status: MobileDonation['status']
): ParishDonation['status'] {
  switch (status) {
    case 'completed':
      return 'confirmed'
    case 'failed':
      return 'cancelled'
    case 'pending':
    default:
      return 'pending'
  }
}

function toIsoString(value: any): string {
  // Firestore Timestamp support (toDate), JS Date, string
  if (value?.toDate) {
    try {
      return value.toDate().toISOString()
    } catch {}
  }
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') return value
  return new Date().toISOString()
}

// Dons synchronisés depuis l'API de paiement (payment-api) vers Firestore (admin_donations)
interface AdminDonationDoc {
  donorName?: string
  fullname?: string // Alias pour compatibilité admin paroisse
  amount: number
  type: string // quete|denier|cierge|prière (ou déjà formaté)
  date?: string
  description?: string
  status: 'confirmed' | 'pending' | 'cancelled'
  uid?: string
  parishId?: string | null
  dioceseId?: string | null
  provider?: string
  providerToken?: string
  createdAt?: any
  updatedAt?: any
}

function formatDonationTypeLabel(type: string): string {
  const t = (type || '').toLowerCase()
  switch (t) {
    case 'quete':
      return 'Quête dominicale'
    case 'denier':
      return 'Denier du culte'
    case 'cierge':
      return 'Cierge pascal'
    case 'prière':
      return 'prière'
    default:
      return type || 'Don'
  }
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
  private static ensureDb() {
    if (!db) {
      throw new Error('Firestore n\'est pas initialisé')
    }
    return db
  }

  static async getAll(parishId: string): Promise<PrayerTime[]> {
    try {
      const q = query(
        collection(this.ensureDb(), 'parish_prayer_times'),
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
      const docRef = doc(this.ensureDb(), 'parish_prayer_times', id)
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
      const docRef = await addDoc(collection(this.ensureDb(), 'parish_prayer_times'), {
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
      const docRef = doc(this.ensureDb(), 'parish_prayer_times', id)
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
      const docRef = doc(this.ensureDb(), 'parish_prayer_times', id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'heure de prière:', error)
      throw error
    }
  }
}

// Service pour les dons paroissiaux
export class ParishDonationService {
  private static ensureDb() {
    if (!db) {
      throw new Error('Firestore n\'est pas initialisé')
    }
    return db
  }
  static async getAll(parishId: string): Promise<ParishDonation[]> {
    try {
      // 1) Dons saisis côté admin (collection parish_donations)
      const adminQ = query(
        collection(this.ensureDb(), 'parish_donations'),
        where('parishId', '==', parishId)
      )
      const adminSnap = await getDocs(adminQ)
      const adminDonations = adminSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ParishDonation[]
      
      // 2) Dons effectués via l'app mobile (collection donations)
      // Tri côté client pour éviter les index composites.
      let mobileDonations: ParishDonation[] = []
      try {
        const mobileQ = query(
          collection(this.ensureDb(), 'donations'),
          where('parishId', '==', parishId)
        )
        const mobileSnap = await getDocs(mobileQ)
        mobileDonations = mobileSnap.docs.map((d) => {
          const data = d.data() as Omit<MobileDonation, 'id'>
          return {
            id: d.id,
            fullname: data.userId || 'Utilisateur',
            amount: Number(data.amount || 0),
            date: toIsoString(data.createdAt),
            type: data.type,
            description: data.message,
            status: mobileStatusToParishStatus(data.status),
            parishId: data.parishId,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          } satisfies ParishDonation
        })
      } catch (error) {
        console.warn('Impossible de charger les dons mobile (collection donations):', error)
      }

      const combined = [...adminDonations, ...mobileDonations]

      // 3) Dons issus de l'API de paiement (payment-api) synchronisés dans Firestore (admin_donations)
      try {
        const apiQ = query(
          collection(this.ensureDb(), 'admin_donations'),
          where('parishId', '==', parishId)
        )
        const apiSnap = await getDocs(apiQ)
        const apiDonations = apiSnap.docs.map((d) => {
          const data = d.data() as AdminDonationDoc
          return {
            id: d.id,
            fullname: data.fullname || data.donorName || data.uid || 'Donateur',
            amount: Number(data.amount || 0),
            date: data.date || toIsoString(data.createdAt),
            type: formatDonationTypeLabel(data.type),
            description: data.description,
            status: (data.status || 'pending') as ParishDonation['status'],
            parishId: (data.parishId as string) || parishId,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          } satisfies ParishDonation
        })
        combined.push(...apiDonations)
      } catch (error) {
        console.warn('Impossible de charger les dons payment-api (admin_donations):', error)
      }

      // Tri côté client (ISO string)
      return combined.sort((a, b) => b.date.localeCompare(a.date))
    } catch (error) {
      console.error('Erreur lors de la récupération des dons:', error)
      throw error
    }
  }

  static async getById(id: string): Promise<ParishDonation | null> {
    try {
      const docRef = doc(this.ensureDb(), 'parish_donations', id)
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
      const docRef = await addDoc(collection(this.ensureDb(), 'parish_donations'), {
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
      const docRef = doc(this.ensureDb(), 'parish_donations', id)
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
      const docRef = doc(this.ensureDb(), 'parish_donations', id)
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
  private static ensureDb() {
    if (!db) {
      throw new Error('Firestore n\'est pas initialisé')
    }
    return db
  }
  static async getAll(parishId: string): Promise<ParishActivity[]> {
    try {
      const q = query(
        collection(this.ensureDb(), 'parish_activities'),
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
      const docRef = doc(this.ensureDb(), 'parish_activities', id)
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
      const docRef = await addDoc(collection(this.ensureDb(), 'parish_activities'), {
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
      const docRef = doc(this.ensureDb(), 'parish_activities', id)
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
      const docRef = doc(this.ensureDb(), 'parish_activities', id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'activité:', error)
      throw error
    }
  }
}

// Service pour les actualités paroissiales
export class ParishNewsService {
  private static ensureDb() {
    if (!db) {
      throw new Error('Firestore n\'est pas initialisé')
    }
    return db
  }
  static async getAll(parishId: string): Promise<ParishNews[]> {
    try {
      const q = query(
        collection(this.ensureDb(), 'parish_news'),
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
      const docRef = doc(this.ensureDb(), 'parish_news', id)
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
      const docRef = await addDoc(collection(this.ensureDb(), 'parish_news'), {
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
      const docRef = doc(this.ensureDb(), 'parish_news', id)
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
      const docRef = doc(this.ensureDb(), 'parish_news', id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'actualité:', error)
      throw error
    }
  }
}

// Service pour les utilisateurs paroissiaux
export class ParishUserService {
  private static ensureDb() {
    if (!db) {
      throw new Error('Firestore n\'est pas initialisé')
    }
    return db
  }
  static async getAll(parishId: string): Promise<ParishUser[]> {
    try {
      const q = query(
        collection(this.ensureDb(), 'parish_users'),
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
      const docRef = doc(this.ensureDb(), 'parish_users', id)
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
      const docRef = await addDoc(collection(this.ensureDb(), 'parish_users'), {
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
      const docRef = doc(this.ensureDb(), 'parish_users', id)
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
      const docRef = doc(this.ensureDb(), 'parish_users', id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error)
      throw error
    }
  }
}

// Service pour les paramètres paroissiaux
export class ParishSettingsService {
  private static ensureDb() {
    if (!db) {
      throw new Error('Firestore n\'est pas initialisé')
    }
    return db
  }
  static async get(parishId: string): Promise<ParishSettings | null> {
    try {
      const q = query(
        collection(this.ensureDb(), 'parish_settings'),
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
      const docRef = await addDoc(collection(this.ensureDb(), 'parish_settings'), {
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
        collection(this.ensureDb(), 'parish_settings'),
        where('parishId', '==', parishId)
      )
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        const docRef = doc(this.ensureDb(), 'parish_settings', querySnapshot.docs[0].id)
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

// ---------------------------------------------------------------------------
// Donation types (adapter)
// ---------------------------------------------------------------------------

// Type attendu par les pages admin église (UI)
export interface DonationType {
  id?: string
  name: string
  description: string
  icon: string
  defaultAmounts: number[]
  active: boolean
  parishId: string
  order?: number
  createdAt?: any
  updatedAt?: any
}

function parseAmountToNumber(value: string): number {
  const digits = String(value ?? '').replace(/[^\d]/g, '')
  const n = Number(digits)
  return Number.isFinite(n) ? n : 0
}

function numberToAmountString(value: number): string {
  // On stocke simple (sans séparateurs) pour éviter des formats ambigus.
  const n = Math.round(Number(value) || 0)
  return String(n)
}

function mapIconToRaw(icon: string): string {
  switch (icon) {
    case 'heart':
      return 'heart-outline'
    case 'gift':
      return 'add'
    case 'church':
      return 'business'
    case 'users':
      return 'people'
    case 'flame':
      return 'flame'
    default:
      return icon || 'heart-outline'
  }
}

function mapIconFromRaw(icon: string): string {
  switch (icon) {
    case 'heart-outline':
      return 'heart'
    case 'add':
      return 'gift'
    case 'business':
      return 'church'
    case 'people':
      return 'users'
    default:
      return icon || 'heart'
  }
}

function rawToUiType(raw: RawDonationType, parishIdFallback: string): DonationType {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    icon: mapIconFromRaw(raw.icon),
    defaultAmounts: (raw.defaultAmounts || []).map(parseAmountToNumber),
    active: !!raw.isActive,
    parishId: raw.parishId || parishIdFallback,
    order: raw.order,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

function uiToRawType(
  ui: Omit<DonationType, 'id' | 'createdAt' | 'updatedAt'>
): Omit<RawDonationType, 'id' | 'createdAt' | 'updatedAt'> {
  const amounts = (ui.defaultAmounts || []).slice(0, 4)
  while (amounts.length < 4) amounts.push(0)

  return {
    name: ui.name,
    description: ui.description,
    icon: mapIconToRaw(ui.icon),
    gradientColors: ['#22c55e', '#16a34a'],
    defaultAmounts: [
      numberToAmountString(amounts[0]),
      numberToAmountString(amounts[1]),
      numberToAmountString(amounts[2]),
      numberToAmountString(amounts[3]),
    ],
    isActive: ui.active,
    parishId: ui.parishId,
    order: ui.order,
  }
}

export class ParishDonationTypeService {
  private static ensureDb() {
    if (!db) {
      throw new Error('Firestore n\'est pas initialisé')
    }
    return db
  }
  static async getAll(parishId: string): Promise<DonationType[]> {
    const types = await DonationTypeService.getAllDonationTypesByParish(parishId)
    return types.map((t) => rawToUiType(t, parishId))
  }

  static async create(
    data: Omit<DonationType, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string | null> {
    return await DonationTypeService.createDonationType(uiToRawType(data))
  }

  static async update(id: string, updates: Partial<DonationType>): Promise<boolean> {
    const rawUpdates: Partial<Omit<RawDonationType, 'id' | 'createdAt'>> = {}

    if (typeof updates.name === 'string') rawUpdates.name = updates.name
    if (typeof updates.description === 'string') rawUpdates.description = updates.description
    if (typeof updates.icon === 'string') rawUpdates.icon = mapIconToRaw(updates.icon)
    if (typeof updates.active === 'boolean') rawUpdates.isActive = updates.active
    if (typeof updates.order === 'number') rawUpdates.order = updates.order

    if (Array.isArray(updates.defaultAmounts)) {
      const amounts = updates.defaultAmounts.slice(0, 4)
      while (amounts.length < 4) amounts.push(0)
      rawUpdates.defaultAmounts = [
        numberToAmountString(amounts[0]),
        numberToAmountString(amounts[1]),
        numberToAmountString(amounts[2]),
        numberToAmountString(amounts[3]),
      ] as RawDonationType['defaultAmounts']
    }

    return await DonationTypeService.updateDonationType(id, rawUpdates)
  }

  static async delete(id: string): Promise<boolean> {
    return await DonationTypeService.deleteDonationType(id)
  }
}
