/**
 * Service pour l'intégration de l'API des textes liturgiques externes
 * Gère la récupération, le cache et la synchronisation des textes
 * Utilise l'API Flask en priorité, avec fallback vers le scraper direct
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { textOfDayScraper } from './textOfDayScraper';

// Configuration de l'API
const LITURGY_API_CONFIG = {
  // URL de base - changez selon votre configuration
  // BASE_URL: 'http://localhost:5000', // Local
  BASE_URL: 'https://sama-quete.onrender.com', // ngrok
  // BASE_URL: 'https://votre-api-deployee.com', // Production
  
  // Endpoints
  ENDPOINTS: {
    TODAY: '/api/text-of-the-day',
    DATE: '/api/text-of-the-day', // Utilise le même endpoint avec timezone
    WEEK: '/api/text-of-the-day', // Pour l'instant, même endpoint
    MONTH: '/api/text-of-the-day' // Pour l'instant, même endpoint
  },
  
  // Configuration du cache
  CACHE: {
    TODAY_KEY: 'liturgy_today',
    WEEK_KEY: 'liturgy_week',
    LAST_SYNC_KEY: 'liturgy_last_sync',
    CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 heures en millisecondes
  }
};

// Types de données pour l'API externe (format aelf.org)
export interface ExternalLiturgyData {
  date: string;
  title: string;
  lectures: Array<{
    type: string;
    reference: string;
    contenu: string;
  }>;
}

// Types de données converties pour notre app
export interface ProcessedLiturgyData {
  date: string;
  title: string;
  firstReading: string;
  firstReadingRef: string;
  psalm: string;
  psalmRef: string;
  secondReading?: string;
  secondReadingRef?: string;
  gospel: string;
  gospelRef: string;
  reflection: string;
  liturgicalSeason?: string;
  color?: string;
}

// Types de données pour le cache local
export interface CachedLiturgyData extends ProcessedLiturgyData {
  cachedAt: number;
  source: 'api' | 'cache' | 'firestore';
}

// Types d'erreur
export interface LiturgyApiError {
  code: 'NETWORK_ERROR' | 'API_ERROR' | 'CACHE_ERROR' | 'SYNC_ERROR';
  message: string;
  details?: any;
}

class LiturgyApiService {
  private baseUrl: string;
  private isOnline: boolean = true;

  constructor(baseUrl: string = LITURGY_API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Convertit les données de l'API aelf.org vers notre format
   */
  private processApiData(apiData: ExternalLiturgyData): ProcessedLiturgyData {
    const { date, title, lectures } = apiData;
    
    // Extraire les différents types de lectures
    let firstReading = '';
    let firstReadingRef = '';
    let psalm = '';
    let psalmRef = '';
    let secondReading = '';
    let secondReadingRef = '';
    let gospel = '';
    let gospelRef = '';
    let reflection = '';

    lectures.forEach(lecture => {
      const type = lecture.type?.toLowerCase() || '';
      const content = lecture.contenu || '';
      const reference = lecture.reference || '';

      // Utiliser le contenu tel qu'il est fourni par l'API
      let cleanContent = content;

      // Classification plus précise
      if (type.includes('première lecture') || (type.includes('lecture') && !type.includes('deuxième') && !type.includes('seconde'))) {
        firstReading = cleanContent;
        firstReadingRef = reference;
      } else if (type.includes('psaume') || type.includes('psalm')) {
        // Pour le psaume, nettoyer encore plus pour éviter les répétitions
        cleanContent = cleanContent.replace(/^R\/\s*Chante, ô mon âme, la louange du Seigneur!\s*ou:\s*Alléluia!\s*\(Ps 145, 1b\)\s*/gmi, '');
        // Supprimer les répétitions du refrain dans le texte
        cleanContent = cleanContent.replace(/^R\/\s*Chante, ô mon âme, la louange du Seigneur!\s*ou:\s*Alléluia!\s*\(Ps 145, 1b\)\s*/gmi, '');
        psalm = cleanContent;
        psalmRef = reference;
      } else if (type.includes('deuxième lecture') || type.includes('seconde lecture')) {
        secondReading = cleanContent;
        secondReadingRef = reference;
      } else if (type.includes('évangile') || type.includes('gospel')) {
        gospel = cleanContent;
        gospelRef = reference;
      } else if (type.includes('réflexion') || type.includes('méditation')) {
        reflection = cleanContent;
      }
    });

    // Si pas de réflexion trouvée, utiliser le titre comme réflexion
    if (!reflection && title) {
      reflection = `Réflexion sur ${title}`;
    }

    return {
      date,
      title: title || 'Textes du jour',
      firstReading,
      firstReadingRef,
      psalm,
      psalmRef,
      secondReading: secondReading || undefined,
      secondReadingRef: secondReadingRef || undefined,
      gospel,
      gospelRef,
      reflection,
      liturgicalSeason: this.extractLiturgicalSeason(title),
      color: this.getLiturgicalColor(title)
    };
  }

  /**
   * Extrait la saison liturgique du titre
   */
  private extractLiturgicalSeason(title: string): string {
    if (!title) return '';
    
    const titleLower = title.toLowerCase();
    if (titleLower.includes('avent')) return 'Avent';
    if (titleLower.includes('noël')) return 'Noël';
    if (titleLower.includes('carême')) return 'Carême';
    if (titleLower.includes('pâques')) return 'Pâques';
    if (titleLower.includes('temps ordinaire')) return 'Temps Ordinaire';
    if (titleLower.includes('pentecôte')) return 'Pentecôte';
    
    return 'Temps Ordinaire';
  }

  /**
   * Détermine la couleur liturgique
   */
  private getLiturgicalColor(title: string): string {
    if (!title) return 'vert';
    
    const titleLower = title.toLowerCase();
    if (titleLower.includes('avent') || titleLower.includes('carême')) return 'violet';
    if (titleLower.includes('noël') || titleLower.includes('pâques') || titleLower.includes('pentecôte')) return 'blanc';
    if (titleLower.includes('martyr') || titleLower.includes('sang')) return 'rouge';
    
    return 'vert';
  }

  /**
   * Met à jour l'URL de base (utile pour basculer entre local/ngrok/production)
   */
  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  /**
   * Vérifie si l'API est accessible
   */
  async checkApiHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('API non accessible:', error);
      this.isOnline = false;
      return false;
    }
  }

  /**
   * Récupère le texte liturgique du jour depuis l'API externe
   */
  async fetchTodayLiturgy(): Promise<ProcessedLiturgyData | null> {
    try {
      console.log(`Récupération du texte du jour depuis: ${this.baseUrl}${LITURGY_API_CONFIG.ENDPOINTS.TODAY}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${this.baseUrl}${LITURGY_API_CONFIG.ENDPOINTS.TODAY}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Évite l'interstitiel ngrok qui casse les requêtes fetch
          'ngrok-skip-browser-warning': 'true'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }

      const apiData: ExternalLiturgyData = await response.json();
      console.log('Données brutes récupérées:', apiData.date, 'avec', apiData.lectures?.length, 'lectures');
      
      // Convertir les données vers notre format
      const processedData = this.processApiData(apiData);
      console.log('Texte du jour traité avec succès:', processedData.date);
      
      this.isOnline = true;
      return processedData;
    } catch (error) {
      // Ne pas logger d'erreur pour 404 - c'est normal si l'API n'est pas disponible
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('404') && !errorMessage.includes('non trouvé')) {
        console.error('Erreur lors de la récupération du texte du jour:', error);
      }
      this.isOnline = false;
      throw {
        code: 'API_ERROR' as const,
        message: 'Impossible de récupérer le texte du jour depuis l\'API',
        details: error
      } as LiturgyApiError;
    }
  }

  /**
   * Récupère le texte liturgique pour une date spécifique
   */
  async fetchLiturgyByDate(date: string): Promise<ProcessedLiturgyData | null> {
    try {
      // L'API actuelle ne supporte que le jour actuel, donc on utilise le même endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${this.baseUrl}${LITURGY_API_CONFIG.ENDPOINTS.DATE}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }

      const apiData: ExternalLiturgyData = await response.json();
      const processedData = this.processApiData(apiData);
      this.isOnline = true;
      return processedData;
    } catch (error) {
      console.error(`Erreur lors de la récupération du texte pour ${date}:`, error);
      this.isOnline = false;
      throw {
        code: 'API_ERROR' as const,
        message: `Impossible de récupérer le texte pour ${date}`,
        details: error
      } as LiturgyApiError;
    }
  }

  /**
   * Sauvegarde les données dans le cache local
   */
  async saveToCache(data: ProcessedLiturgyData, key: string): Promise<void> {
    try {
      const cachedData: CachedLiturgyData = {
        ...data,
        cachedAt: Date.now(),
        source: 'api'
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(cachedData));
      console.log(`Données sauvegardées dans le cache: ${key}`);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du cache:', error);
      throw {
        code: 'CACHE_ERROR' as const,
        message: 'Impossible de sauvegarder dans le cache local',
        details: error
      } as LiturgyApiError;
    }
  }

  /**
   * Récupère les données depuis le cache local
   */
  async getFromCache(key: string): Promise<CachedLiturgyData | null> {
    try {
      const cachedData = await AsyncStorage.getItem(key);
      if (!cachedData) {
        return null;
      }

      const data: CachedLiturgyData = JSON.parse(cachedData);
      
      // Vérifier si le cache est encore valide
      const isExpired = Date.now() - data.cachedAt > LITURGY_API_CONFIG.CACHE.CACHE_DURATION;
      if (isExpired) {
        console.log('Cache expiré, suppression...');
        await AsyncStorage.removeItem(key);
        return null;
      }

      console.log(`Données récupérées depuis le cache: ${key}`);
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération du cache:', error);
      return null;
    }
  }

  /**
   * Synchronise les données avec Firestore
   */
  async syncToFirestore(data: ProcessedLiturgyData): Promise<void> {
    try {
      // Vérifier si le texte existe déjà pour cette date
      const liturgyRef = collection(db, 'liturgy');
      const q = query(liturgyRef, where('date', '==', data.date));
      const snapshot = await getDocs(q);

      const liturgyData = {
        date: data.date,
        title: data.title,
        firstReading: data.firstReading,
        psalm: data.psalm,
        secondReading: data.secondReading || '',
        gospel: data.gospel,
        reflection: data.reflection,
        liturgicalSeason: data.liturgicalSeason || '',
        color: data.color || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      if (snapshot.empty) {
        // Créer un nouveau document
        await addDoc(liturgyRef, liturgyData);
        console.log(`Nouveau texte liturgique créé pour ${data.date}`);
      } else {
        // Mettre à jour le document existant
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, {
          ...liturgyData,
          updatedAt: Timestamp.now()
        });
        console.log(`Texte liturgique mis à jour pour ${data.date}`);
      }

      // Marquer la dernière synchronisation
      await AsyncStorage.setItem(
        LITURGY_API_CONFIG.CACHE.LAST_SYNC_KEY, 
        Date.now().toString()
      );

    } catch (error) {
      console.error('Erreur lors de la synchronisation avec Firestore:', error);
      throw {
        code: 'SYNC_ERROR' as const,
        message: 'Impossible de synchroniser avec Firestore',
        details: error
      } as LiturgyApiError;
    }
  }

  /**
   * Récupère le texte du jour avec fallback intelligent
   * Utilise l'API Flask en priorité, avec fallback vers le scraper direct si Flask est indisponible
   * @param useDirectScraper Si true, utilise uniquement le scraper direct (ignore Flask). Si false, Flask en priorité puis scraper en fallback.
   */
  async getTodayLiturgy(useDirectScraper: boolean = false): Promise<CachedLiturgyData | null> {
    try {
      // Si useDirectScraper est true, utiliser uniquement le scraper direct
      if (useDirectScraper) {
        try {
          console.log('Utilisation du scraper direct amélioré...');
          const scrapedData = await textOfDayScraper.scrapeTodayLiturgy();
          
          if (scrapedData) {
            // Sauvegarder dans le cache
            await this.saveToCache(scrapedData, LITURGY_API_CONFIG.CACHE.TODAY_KEY);
            
            // Synchroniser avec Firestore
            await this.syncToFirestore(scrapedData);
            
            return {
              ...scrapedData,
              cachedAt: Date.now(),
              source: 'api' // Marqué comme 'api' pour compatibilité
            };
          }
        } catch (scraperError) {
          console.warn('Scraper direct indisponible, utilisation du cache...', scraperError);
          // Continue vers le fallback cache
        }
      } else {
        // 1. PRIORITÉ: Essayer de récupérer depuis l'API Flask
        let flaskFailed = false;
        if (this.isOnline) {
          try {
            console.log('Utilisation de l\'API Flask...');
            const apiData = await this.fetchTodayLiturgy();
            if (apiData) {
              // Sauvegarder dans le cache
              await this.saveToCache(apiData, LITURGY_API_CONFIG.CACHE.TODAY_KEY);
              
              // Synchroniser avec Firestore
              await this.syncToFirestore(apiData);
              
              return {
                ...apiData,
                cachedAt: Date.now(),
                source: 'api'
              };
            }
          } catch (apiError) {
            // Logger seulement si ce n'est pas une erreur 404 attendue
            const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
            if (!errorMessage.includes('404') && !errorMessage.includes('non trouvé')) {
              console.warn('API Flask indisponible, fallback vers scraper direct...', apiError);
            } else {
              console.log('API Flask non disponible, utilisation du scraper direct (fallback normal)');
            }
            flaskFailed = true;
            this.isOnline = false;
          }
        } else {
          flaskFailed = true;
        }

        // 2. FALLBACK: Utiliser le scraper direct amélioré si Flask est indisponible
        if (flaskFailed) {
          try {
            console.log('Utilisation du scraper direct amélioré en fallback...');
            const scrapedData = await textOfDayScraper.scrapeTodayLiturgy();
            
            if (scrapedData) {
              // Sauvegarder dans le cache
              await this.saveToCache(scrapedData, LITURGY_API_CONFIG.CACHE.TODAY_KEY);
              
              // Synchroniser avec Firestore
              await this.syncToFirestore(scrapedData);
              
              return {
                ...scrapedData,
                cachedAt: Date.now(),
                source: 'api' // Marqué comme 'api' pour compatibilité
              };
            }
          } catch (scraperError) {
            console.warn('Scraper direct indisponible, utilisation du cache...', scraperError);
            // Continue vers le fallback cache
          }
        }
      }

      // 3. Fallback vers le cache local
      const cachedData = await this.getFromCache(LITURGY_API_CONFIG.CACHE.TODAY_KEY);
      if (cachedData) {
        return {
          ...cachedData,
          source: 'cache'
        };
      }

      // 4. Fallback vers Firestore
      const today = new Date().toISOString().split('T')[0];
      const liturgyRef = collection(db, 'liturgy');
      const q = query(liturgyRef, where('date', '==', today));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data() as ProcessedLiturgyData;
        return {
          ...data,
          cachedAt: Date.now(),
          source: 'firestore'
        };
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du texte du jour:', error);
      return null;
    }
  }

  /**
   * Force la synchronisation avec l'API
   */
  async forceSync(): Promise<boolean> {
    try {
      console.log('Synchronisation forcée avec l\'API...');
      
      // Vérifier la santé de l'API
      const isHealthy = await this.checkApiHealth();
      if (!isHealthy) {
        throw new Error('API non accessible');
      }

      // Récupérer le texte du jour
      const data = await this.fetchTodayLiturgy();
      if (!data) {
        throw new Error('Aucune donnée reçue de l\'API');
      }

      // Sauvegarder et synchroniser
      await this.saveToCache(data, LITURGY_API_CONFIG.CACHE.TODAY_KEY);
      await this.syncToFirestore(data);

      console.log('Synchronisation réussie');
      return true;
    } catch (error) {
      console.error('Erreur lors de la synchronisation forcée:', error);
      return false;
    }
  }

  /**
   * Obtient le statut de la dernière synchronisation
   */
  async getLastSyncStatus(): Promise<{ lastSync: number | null; isOnline: boolean }> {
    try {
      const lastSyncStr = await AsyncStorage.getItem(LITURGY_API_CONFIG.CACHE.LAST_SYNC_KEY);
      const lastSync = lastSyncStr ? parseInt(lastSyncStr, 10) : null;
      
      return {
        lastSync,
        isOnline: this.isOnline
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du statut:', error);
      return {
        lastSync: null,
        isOnline: false
      };
    }
  }
}

// Instance singleton du service
export const liturgyApiService = new LiturgyApiService();

// Export des types et constantes
export { LITURGY_API_CONFIG };
