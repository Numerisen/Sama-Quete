/**
 * Service pour gérer le stockage de l'UID anonyme
 * Permet de suivre les dons des utilisateurs non authentifiés
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const ANONYMOUS_UID_KEY = '@samaquete:anonymous_uid';

export class AnonymousStorage {
  /**
   * Obtenir l'UID anonyme stocké, ou en créer un nouveau
   */
  static async getOrCreateAnonymousUid(): Promise<string> {
    try {
      let anonymousUid = await AsyncStorage.getItem(ANONYMOUS_UID_KEY);
      
      if (!anonymousUid) {
        // Générer un nouvel UID anonyme
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        anonymousUid = `anonymous_${timestamp}_${random}`;
        
        // Stocker pour réutilisation
        await AsyncStorage.setItem(ANONYMOUS_UID_KEY, anonymousUid);
        console.log('✅ Nouvel UID anonyme créé:', anonymousUid);
      }
      
      return anonymousUid;
    } catch (error) {
      console.error('Erreur lors de la gestion de l\'UID anonyme:', error);
      // En cas d'erreur, générer un UID temporaire
      return `anonymous_temp_${Date.now()}`;
    }
  }

  /**
   * Obtenir l'UID anonyme stocké (sans en créer un nouveau)
   */
  static async getAnonymousUid(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ANONYMOUS_UID_KEY);
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
      await AsyncStorage.setItem(ANONYMOUS_UID_KEY, uid);
      console.log('✅ UID anonyme défini:', uid);
    } catch (error) {
      console.error('Erreur lors de la définition de l\'UID anonyme:', error);
    }
  }
}

