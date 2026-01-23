import {
    collection,
    getDocs,
    query,
    where
} from 'firebase/firestore'
import { db } from './firebase'

export interface Parish {
  id: string
  name: string
  dioceseId: string
  dioceseName: string
  location: string
  city: string
  priest: string
  vicaire?: string
  catechists?: string
  contactInfo: {
    email?: string
    phone?: string
    address?: string
  }
  pricing?: {
    quete: string[]
    denier: string[]
    cierge: string[]
    prière: string[]
  }
  isActive: boolean
  createdAt: any
  updatedAt: any
}

export interface Diocese {
  id: string
  name: string
  location: string
  city: string
  type: string
  bishop: string
  contactInfo: {
    email: string
    phone: string
    address: string
  }
  isActive: boolean
  createdAt: any
  updatedAt: any
}

export class ParishService {
  // Récupérer toutes les paroisses actives
  static async getParishes(): Promise<Parish[]> {
    try {
      const parishesRef = collection(db, 'parishes')
      const q = query(parishesRef, where('isActive', '==', true))
      
      const snapshot = await getDocs(q)
      const parishes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Parish[]
      
      // Trier côté client par nom
      return parishes.sort((a, b) => a.name.localeCompare(b.name))
    } catch (error) {
      console.error('Erreur lors de la récupération des paroisses:', error)
      return []
    }
  }

  // Récupérer une paroisse par ID
  static async getParishById(parishId: string): Promise<Parish | null> {
    try {
      const parishes = await this.getParishes()
      return parishes.find(parish => parish.id === parishId) || null
    } catch (error) {
      console.error('Erreur lors de la récupération de la paroisse:', error)
      return null
    }
  }

  // Récupérer les paroisses par diocèse
  static async getParishesByDiocese(dioceseId: string): Promise<Parish[]> {
    try {
      const parishesRef = collection(db, 'parishes')
      const q = query(
        parishesRef, 
        where('dioceseId', '==', dioceseId),
        where('isActive', '==', true)
      )
      
      const snapshot = await getDocs(q)
      const parishes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Parish[]
      
      // Trier côté client par nom
      return parishes.sort((a, b) => a.name.localeCompare(b.name))
    } catch (error) {
      console.error('Erreur lors de la récupération des paroisses par diocèse:', error)
      return []
    }
  }

  // Récupérer tous les diocèses actifs
  static async getDioceses(): Promise<Diocese[]> {
    try {
      const diocesesRef = collection(db, 'dioceses')
      const q = query(diocesesRef, where('isActive', '==', true))
      
      const snapshot = await getDocs(q)
      const dioceses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Diocese[]
      
      // Trier côté client par nom
      return dioceses.sort((a, b) => a.name.localeCompare(b.name))
    } catch (error) {
      console.error('Erreur lors de la récupération des diocèses:', error)
      return []
    }
  }

  // Rechercher des paroisses par nom ou ville
  static async searchParishes(searchTerm: string): Promise<Parish[]> {
    try {
      const parishes = await this.getParishes()
      
      return parishes.filter(parish => 
        parish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parish.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parish.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    } catch (error) {
      console.error('Erreur lors de la recherche de paroisses:', error)
      return []
    }
  }

  // Récupérer les paroisses avec leurs diocèses
  static async getParishesWithDiocese(): Promise<(Parish & { diocese: Diocese | null })[]> {
    try {
      const [parishes, dioceses] = await Promise.all([
        this.getParishes(),
        this.getDioceses()
      ])
      
      return parishes.map(parish => ({
        ...parish,
        diocese: dioceses.find(d => d.id === parish.dioceseId) || null
      }))
    } catch (error) {
      console.error('Erreur lors de la récupération des paroisses avec diocèse:', error)
      return []
    }
  }
}