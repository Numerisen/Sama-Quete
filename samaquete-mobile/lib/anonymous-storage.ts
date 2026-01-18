/**
 * Service pour gérer le stockage de l'UID anonyme
 * Permet de suivre les dons des utilisateurs non authentifiés
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const ANONYMOUS_UID_KEY = '@samaquete:anonymous_uid';
// Le backend (payment-api) valide: /^anonymous_[a-f0-9]{16,32}$/
const ANONYMOUS_UID_REGEX = /^anonymous_[a-f0-9]{16,32}$/i;

function generateHex(length: number = 32): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += Math.floor(Math.random() * 16).toString(16);
  }
  return out;
}

export class AnonymousStorage {
  /**
   * Obtenir l'UID anonyme stocké, ou en créer un nouveau
   */
  static async getOrCreateAnonymousUid(): Promise<string> {
    try {
      let anonymousUid = await AsyncStorage.getItem(ANONYMOUS_UID_KEY);
      
      // Migration: si absent ou ancien format (timestamp_random), régénérer un UID compatible backend
      if (!anonymousUid || !ANONYMOUS_UID_REGEX.test(anonymousUid)) {
        anonymousUid = `anonymous_${generateHex(32)}`;
        await AsyncStorage.setItem(ANONYMOUS_UID_KEY, anonymousUid);
        console.log('✅ UID anonyme (format compatible) créé:', anonymousUid);
      }
      
      return anonymousUid;
    } catch (error) {
      console.error('Erreur lors de la gestion de l\'UID anonyme:', error);
      // En cas d'erreur, générer un UID compatible (non persistant)
      return `anonymous_${generateHex(32)}`;
    }
  }

  /**
   * Obtenir l'UID anonyme stocké (sans en créer un nouveau)
   */
  static async getAnonymousUid(): Promise<string | null> {
    try {
      const uid = await AsyncStorage.getItem(ANONYMOUS_UID_KEY);
      if (!uid) return null;
      // Si un ancien UID invalide est encore stocké, on le considère absent
      if (!ANONYMOUS_UID_REGEX.test(uid)) return null;
      return uid;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'UID anonyme:', error);
      return null;
    }
  }

  /**
   * Supprimer l'UID anonyme (par exemple, après connexion)
   */
  static async clearAnonymousUid(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ANONYMOUS_UID_KEY);
      console.log('✅ UID anonyme supprimé');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'UID anonyme:', error);
    }
  }

  /**
   * Définir un UID anonyme spécifique (utile après un don)
   */
  static async setAnonymousUid(uid: string): Promise<void> {
    try {
      if (!ANONYMOUS_UID_REGEX.test(uid)) {
        console.warn('⚠️ UID anonyme invalide ignoré (format backend):', uid);
        return;
      }
      await AsyncStorage.setItem(ANONYMOUS_UID_KEY, uid);
      console.log('✅ UID anonyme défini:', uid);
    } catch (error) {
      console.error('Erreur lors de la définition de l\'UID anonyme:', error);
    }
  }
}

