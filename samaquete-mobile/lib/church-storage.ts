/**
 * Service de stockage persistant pour l'église sélectionnée
 * Utilise AsyncStorage pour persister la sélection entre les sessions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Parish } from './parish-service';

const STORAGE_KEYS = {
  SELECTED_CHURCH: 'selected_church',
  CHURCH_SELECTION_DATE: 'church_selection_date',
  PARISH_VISITS: 'parish_visit_stats',
};

export interface StoredChurchData {
  parish: Parish;
  selectedAt: string; // ISO date string
}

export type ParishVisitStatsMap = Record<
  string,
  { count: number; lastVisitAt: string }
>;

export class ChurchStorageService {
  /**
   * Sauvegarde l'église sélectionnée
   */
  static async saveSelectedChurch(parish: Parish): Promise<void> {
    try {
      const churchData: StoredChurchData = {
        parish,
        selectedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.SELECTED_CHURCH,
        JSON.stringify(churchData)
      );
      
      console.log('Église sauvegardée:', parish.name);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'église:', error);
      throw error;
    }
  }

  /**
   * Récupère l'église sélectionnée
   */
  static async getSelectedChurch(): Promise<Parish | null> {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_CHURCH);
      
      if (!storedData) {
        return null;
      }

      const churchData: StoredChurchData = JSON.parse(storedData);
      return churchData.parish;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'église:', error);
      return null;
    }
  }

  /**
   * Récupère les données complètes de l'église stockée
   */
  static async getStoredChurchData(): Promise<StoredChurchData | null> {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_CHURCH);
      
      if (!storedData) {
        return null;
      }

      return JSON.parse(storedData);
    } catch (error) {
      console.error('Erreur lors de la récupération des données d\'église:', error);
      return null;
    }
  }

  /**
   * Supprime l'église sélectionnée (pour reset)
   */
  static async clearSelectedChurch(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SELECTED_CHURCH);
      console.log('Église sélectionnée supprimée');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'église:', error);
      throw error;
    }
  }

  /**
   * Vérifie si une église est déjà sélectionnée
   */
  static async hasSelectedChurch(): Promise<boolean> {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_CHURCH);
      return storedData !== null;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'église:', error);
      return false;
    }
  }

  /**
   * Obtient la date de sélection de l'église
   */
  static async getChurchSelectionDate(): Promise<Date | null> {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_CHURCH);
      
      if (!storedData) {
        return null;
      }

      const churchData: StoredChurchData = JSON.parse(storedData);
      return new Date(churchData.selectedAt);
    } catch (error) {
      console.error('Erreur lors de la récupération de la date de sélection:', error);
      return null;
    }
  }

  /**
   * Incrémente le compteur de visites d'une paroisse (stockage local).
   * Sert à alimenter "Paroisses les plus visitées" dans le dashboard.
   */
  static async incrementParishVisit(parish: Parish): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.PARISH_VISITS);
      const map: ParishVisitStatsMap = raw ? JSON.parse(raw) : {};
      const now = new Date().toISOString();
      const prev = map[parish.id];
      map[parish.id] = {
        count: (prev?.count || 0) + 1,
        lastVisitAt: now,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.PARISH_VISITS, JSON.stringify(map));
    } catch (error) {
      console.warn('Erreur incrementParishVisit:', error);
    }
  }

  /**
   * Retourne les stats locales de visite des paroisses.
   */
  static async getParishVisitStats(): Promise<ParishVisitStatsMap> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.PARISH_VISITS);
      return raw ? (JSON.parse(raw) as ParishVisitStatsMap) : {};
    } catch (error) {
      console.warn('Erreur getParishVisitStats:', error);
      return {};
    }
  }
}
