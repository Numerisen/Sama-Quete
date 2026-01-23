import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { db } from './firebase'

export interface ParishSettings {
  id: string
  parishId: string
  name: string
  address: string
  phone: string
  email: string
  website: string
  diocese: string
  priest: string
  establishedDate: string
  massTimes: string[]
  confessionTimes: string[]
  officeHours: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    donationAlerts: boolean
    prayerTimeAlerts: boolean
    newsAlerts: boolean
  }
  security: {
    twoFactorAuth: boolean
    sessionTimeout: number
    passwordExpiry: number
  }
  data: {
    autoBackup: boolean
    backupFrequency: string
    retentionPeriod: number
  }
  createdAt: any
  updatedAt: any
}

export class ParishSettingsService {
  private static collection = 'parish_settings'

  private static ensureDb() {
    if (!db) {
      throw new Error('Firestore n\'est pas initialisé')
    }
    return db
  }

  // Récupérer les paramètres de la paroisse
  static async getSettings(parishId: string): Promise<ParishSettings | null> {
    try {
      const q = query(
        collection(this.ensureDb(), this.collection),
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

  // Créer ou mettre à jour les paramètres
  static async saveSettings(parishId: string, settingsData: Partial<ParishSettings>): Promise<void> {
    try {
      const existingSettings = await this.getSettings(parishId)
      
      if (existingSettings) {
        // Mettre à jour
        const docRef = doc(this.ensureDb(), this.collection, existingSettings.id)
        await updateDoc(docRef, {
          ...settingsData,
          updatedAt: serverTimestamp()
        })
      } else {
        // Créer
        const docRef = doc(collection(this.ensureDb(), this.collection))
        await setDoc(docRef, {
          ...settingsData,
          parishId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error)
      throw error
    }
  }

  // Récupérer les paramètres par défaut
  static getDefaultSettings(parishId: string, parishName: string): Partial<ParishSettings> {
    return {
      parishId,
      name: parishName,
      address: "123 Rue de l'Église, Dakar, Sénégal",
      phone: "+221 33 123 45 67",
      email: "contact@paroisse.sn",
      website: "https://paroisse.sn",
      diocese: "Archidiocèse de Dakar",
      priest: "Père Jean Baptiste",
      establishedDate: "1950-01-01",
      massTimes: ["08:00", "10:00", "18:00"],
      confessionTimes: ["17:00-17:30", "Samedi 16:00-17:00"],
      officeHours: "Lundi-Vendredi: 8h-17h",
      notifications: {
        email: true,
        push: true,
        sms: false,
        donationAlerts: true,
        prayerTimeAlerts: true,
        newsAlerts: true
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordExpiry: 90
      },
      data: {
        autoBackup: true,
        backupFrequency: "daily",
        retentionPeriod: 365
      }
    }
  }
}
