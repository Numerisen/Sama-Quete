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

export interface Parish {
  id: string
  name: string
  dioceseId: string
  dioceseName: string
  location: string
  city: string
  priest: string // Champ requis par la structure mais non utilisé dans l'UI
  contactInfo: {
    email?: string
    phone?: string
    address?: string
  }
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
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
  createdAt: Timestamp
  updatedAt: Timestamp
}

export class ParishService {
  // ===== GESTION DES DIOCÈSES =====
  
  static async createDiocese(diocese: Omit<Diocese, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const diocesesRef = collection(db, 'dioceses')
      const docRef = await addDoc(diocesesRef, {
        ...diocese,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef.id
    } catch (error) {
      console.error('Erreur lors de la création du diocèse:', error)
      return null
    }
  }

  static async getDioceses(): Promise<Diocese[]> {
    try {
      const diocesesRef = collection(db, 'dioceses')
      const q = query(diocesesRef, where('isActive', '==', true))
      
      const snapshot = await getDocs(q)
      const dioceses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Diocese[]
      
      // Trier par nom
      return dioceses.sort((a, b) => a.name.localeCompare(b.name))
    } catch (error) {
      console.error('Erreur lors de la récupération des diocèses:', error)
      return []
    }
  }

  static async getDioceseById(dioceseId: string): Promise<Diocese | null> {
    try {
      const dioceseRef = doc(db, 'dioceses', dioceseId)
      const dioceseDoc = await getDoc(dioceseRef)
      
      if (dioceseDoc.exists()) {
        return {
          id: dioceseDoc.id,
          ...dioceseDoc.data()
        } as Diocese
      }
      return null
    } catch (error) {
      console.error('Erreur lors de la récupération du diocèse:', error)
      return null
    }
  }

  // ===== GESTION DES PAROISSES =====
  
  static async createParish(parish: Omit<Parish, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const parishesRef = collection(db, 'parishes')
      const docRef = await addDoc(parishesRef, {
        ...parish,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef.id
    } catch (error) {
      console.error('Erreur lors de la création de la paroisse:', error)
      return null
    }
  }

  static async getParishes(filters?: {
    dioceseId?: string
    isActive?: boolean
  }): Promise<Parish[]> {
    try {
      const parishesRef = collection(db, 'parishes')
      let q = query(parishesRef)
      
      if (filters?.dioceseId) {
        q = query(parishesRef, where('dioceseId', '==', filters.dioceseId))
      }
      
      if (filters?.isActive !== undefined) {
        q = query(parishesRef, where('isActive', '==', filters.isActive))
      }
      
      const snapshot = await getDocs(q)
      const parishes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Parish[]
      
      // Trier par nom
      return parishes.sort((a, b) => a.name.localeCompare(b.name))
    } catch (error) {
      console.error('Erreur lors de la récupération des paroisses:', error)
      return []
    }
  }

  static async getParishById(parishId: string): Promise<Parish | null> {
    try {
      const parishRef = doc(db, 'parishes', parishId)
      const parishDoc = await getDoc(parishRef)
      
      if (parishDoc.exists()) {
        return {
          id: parishDoc.id,
          ...parishDoc.data()
        } as Parish
      }
      return null
    } catch (error) {
      console.error('Erreur lors de la récupération de la paroisse:', error)
      return null
    }
  }

  static async updateParish(parishId: string, updates: Partial<Parish>): Promise<boolean> {
    try {
      const parishRef = doc(db, 'parishes', parishId)
      await updateDoc(parishRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      return true
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la paroisse:', error)
      return false
    }
  }

  static async deleteParish(parishId: string): Promise<boolean> {
    try {
      const parishRef = doc(db, 'parishes', parishId)
      await deleteDoc(parishRef)
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression de la paroisse:', error)
      return false
    }
  }

  static async updateDiocese(dioceseId: string, updates: Partial<Diocese>): Promise<boolean> {
    try {
      const dioceseRef = doc(db, 'dioceses', dioceseId)
      await updateDoc(dioceseRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      return true
    } catch (error) {
      console.error('Erreur lors de la mise à jour du diocèse:', error)
      return false
    }
  }

  static async deleteDiocese(dioceseId: string): Promise<boolean> {
    try {
      const dioceseRef = doc(db, 'dioceses', dioceseId)
      await deleteDoc(dioceseRef)
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression du diocèse:', error)
      return false
    }
  }

  // ===== MÉTHODES UTILITAIRES =====
  
  static async getParishesWithDiocese(): Promise<(Parish & { diocese: Diocese | null })[]> {
    try {
      const parishes = await this.getParishes()
      const dioceses = await this.getDioceses()
      
      return parishes.map(parish => ({
        ...parish,
        diocese: dioceses.find(d => d.id === parish.dioceseId) || null
      }))
    } catch (error) {
      console.error('Erreur lors de la récupération des paroisses avec diocèse:', error)
      return []
    }
  }

  static async searchParishes(searchTerm: string): Promise<Parish[]> {
    try {
      const parishes = await this.getParishes()
      
      return parishes.filter(parish => 
        parish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parish.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parish.priest.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (parish.vicaire && parish.vicaire.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (parish.catechists && parish.catechists.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    } catch (error) {
      console.error('Erreur lors de la recherche de paroisses:', error)
      return []
    }
  }
}