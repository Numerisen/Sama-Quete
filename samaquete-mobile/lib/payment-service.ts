/**
 * Service d'intégration pour l'API de paiement PayDunya (Mobile)
 * 
 * Cette couche d'adaptation isole le submodule payment-api et fournit
 * une interface unifiée pour les paiements dans l'app mobile Jàngu Bi.
 * 
 * IMPORTANT: Ne jamais modifier directement le submodule payment-api.
 * Toute adaptation doit être faite dans cette couche.
 */

import { auth } from './firebase';
import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import type { Auth } from 'firebase/auth';

export interface PaymentPlan {
  id: string;
  name: string;
  amount: number;
  description: string;
}

export interface PaymentCheckoutResponse {
  paymentId: number;
  token: string;
  checkout_url: string;
  uid?: string; // UID (authentifié ou anonyme) retourné par l'API
}

export interface PaymentStatus {
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELED';
  paymentId?: number;
  amount?: number;
  currency?: string;
}

export interface Entitlement {
  id: string;
  granted: boolean;
  grantedAt: string | null;
  expiresAt: string | null;
  sourcePaymentId: number | null;
}

export interface EntitlementsResponse {
  userId: string;
  resources: Entitlement[];
}

export interface DonationHistoryItem {
  id: string;
  paymentId: number;
  type: string;
  donationType: string; // Type brut (quete, denier, etc.)
  amount: number;
  currency: string;
  status: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
  provider?: string;
  providerToken?: string;
}

export interface DonationHistoryResponse {
  donations: DonationHistoryItem[];
  statistics: {
    totalAmount: number;
    totalCount: number;
    completedCount: number;
    pendingCount: number;
    failedCount: number;
  };
  uid: string;
}

/**
 * Service de paiement pour l'application mobile
 * 
 * Ce service encapsule les appels à l'API payment-api et gère
 * les deep links pour le retour de paiement.
 */
export class PaymentService {
  private baseUrl: string;
  private getAuthToken: () => Promise<string | null>;

  constructor(baseUrl?: string) {
    // URL de l'API de paiement (port 3001 pour payment-api)
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_PAYMENT_API_URL || 'http://localhost:3001';
    
    // Fonction pour obtenir le token Firebase
    this.getAuthToken = async () => {
      const user = auth.currentUser;
      if (!user) return null;
      return await user.getIdToken();
    };
  }

  /**
   * Obtenir le token d'authentification Firebase (optionnel)
   * Retourne les headers avec ou sans token selon l'authentification
   */
  private async getAuthHeader(): Promise<Record<string, string>> {
    const token = await this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Ajouter le token seulement si l'utilisateur est authentifié
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Vérifier les entitlements (droits d'accès) d'un utilisateur
   */
  async checkEntitlements(): Promise<EntitlementsResponse> {
    try {
      const headers = await this.getAuthHeader();
      const response = await fetch(`${this.baseUrl}/api/entitlements`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la vérification des entitlements:', error);
      throw error;
    }
  }

  /**
   * Créer une session de paiement (checkout)
   * 
   * @param planId - Identifiant du plan de paiement
   * @returns Informations de checkout incluant l'URL de paiement
   */
  async createCheckout(planId: string): Promise<PaymentCheckoutResponse> {
    try {
      const headers = await this.getAuthHeader();
      const response = await fetch(`${this.baseUrl}/api/paydunya/checkout`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création du checkout:', error);
      throw error;
    }
  }

  /**
   * Créer une session de paiement pour un don
   * 
   * @param donationType - Type de don ('quete' | 'denier' | 'cierge' | 'messe')
   * @param amount - Montant en FCFA (XOF) - peut être 10000 ou plus
   * @param description - Description optionnelle du don
   * @param parishId - ID de la paroisse (optionnel)
   * @returns Informations de checkout incluant l'URL de paiement
   */
  async createDonationCheckout(
    donationType: 'quete' | 'denier' | 'cierge' | 'messe',
    amount: number,
    description?: string,
    parishId?: string,
    anonymousUid?: string
  ): Promise<PaymentCheckoutResponse & { donationType: string; amount: number }> {
    try {
      const headers = await this.getAuthHeader();
      
      // Ajouter l'UID anonyme dans le header si fourni et si pas authentifié
      if (anonymousUid && !headers['Authorization']) {
        headers['x-anonymous-uid'] = anonymousUid;
      }
      
      const response = await fetch(`${this.baseUrl}/api/paydunya/donation/checkout`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          donationType,
          amount,
          description,
          parishId,
          anonymousUid, // Aussi dans le body pour compatibilité
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création du checkout de don:', error);
      throw error;
    }
  }

  /**
   * Vérifier le statut d'un paiement
   * 
   * @param token - Token PayDunya retourné lors de la création du checkout
   * @returns Statut du paiement
   */
  async checkPaymentStatus(token: string): Promise<PaymentStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/paydunya/status?token=${encodeURIComponent(token)}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
      throw error;
    }
  }

  /**
   * Ouvrir l'URL de checkout dans le navigateur
   * 
   * @param checkoutUrl - URL de checkout PayDunya
   */
  async openCheckout(checkoutUrl: string): Promise<string | null> {
    try {
      // ✅ IMPORTANT iOS/Safari:
      // Au lieu de dépendre du deep link "jangui-bi://" depuis Safari (souvent "address invalid" en Expo Go),
      // on capture la redirection finale HTTPS vers /payment/return via openAuthSessionAsync.
      const returnUrl = `${this.baseUrl.replace(/\/+$/, '')}/payment/return`;

      try {
        const result = await WebBrowser.openAuthSessionAsync(checkoutUrl, returnUrl);
        if (result.type === 'success' && result.url) {
          return result.url;
        }
        return null;
      } catch (e) {
        // Fallback: ouvrir dans Safari si openAuthSessionAsync n'est pas disponible
        console.warn('openAuthSessionAsync échoué, fallback Linking.openURL:', e);
      }

      const canOpen = await Linking.canOpenURL(checkoutUrl);
      if (!canOpen) throw new Error('Impossible d\'ouvrir l\'URL de paiement');
      await Linking.openURL(checkoutUrl);
      return null;
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du checkout:', error);
      throw error;
    }
  }

  /**
   * Gérer le retour de paiement via deep link
   * 
   * Cette méthode doit être appelée lors de la réception d'un deep link
   * après un paiement (ex: jangui-bi://payment/success?token=...)
   */
  async handlePaymentReturn(url: string): Promise<PaymentStatus | null> {
    try {
      // Parser l'URL manuellement pour extraire le token
      // Supporte les formats: jangui-bi://payment/return?token=xxx ou http://...
      const tokenMatch = url.match(/[?&]token=([^&]+)/);
      const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
      
      if (!token) {
        console.warn('⚠️ Token manquant dans l\'URL de retour, vérification de l\'historique récent');
        // Si pas de token, on peut quand même vérifier l'historique pour voir le dernier paiement
        // L'utilisateur sera redirigé vers l'historique qui affichera les paiements récents
        return {
          status: 'PENDING', // Statut par défaut si on ne peut pas vérifier
          paymentId: undefined,
          amount: undefined,
          currency: undefined
        };
      }

      return await this.checkPaymentStatus(token);
    } catch (error) {
      console.error('Erreur lors du traitement du retour de paiement:', error);
      // Même en cas d'erreur, retourner un statut pour que l'app puisse afficher l'historique
      return {
        status: 'PENDING',
        paymentId: undefined,
        amount: undefined,
        currency: undefined
      };
    }
  }

  /**
   * Récupérer l'historique des contributions
   * 
   * Fonctionne avec ou sans authentification :
   * - Si authentifié : utilise le token Firebase
   * - Si anonyme : utilise l'UID anonyme fourni
   * 
   * @param anonymousUid - UID anonyme (optionnel, pour les utilisateurs non authentifiés)
   * @returns Historique des contributions avec statistiques
   */
  async getDonationHistory(anonymousUid?: string): Promise<DonationHistoryResponse> {
    try {
      const headers = await this.getAuthHeader();
      
      // Ajouter l'UID anonyme dans le header si fourni et si pas authentifié
      if (anonymousUid && !headers['Authorization']) {
        headers['x-anonymous-uid'] = anonymousUid;
      }
      
      // Construire l'URL avec query param si nécessaire (fallback)
      let url = `${this.baseUrl}/api/donations/history`;
      if (anonymousUid && !headers['Authorization']) {
        url += `?anonymousUid=${encodeURIComponent(anonymousUid)}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw error;
    }
  }

  /**
   * Adapter un plan de paiement PayDunya pour les dons Jàngu Bi
   */
  static mapDonationTypeToPlan(donationType: 'quete' | 'denier' | 'cierge' | 'messe', amount: number): string | null {
    // Adaptation selon les besoins de Jàngu Bi
    // Pour l'instant, l'API supporte BOOK_PART_2 et BOOK_PART_3
    if (donationType === 'messe' && amount >= 10000) {
      return 'BOOK_PART_2';
    }
    
    return null;
  }
}

/**
 * Instance singleton du service de paiement
 */
export const paymentService = new PaymentService();

