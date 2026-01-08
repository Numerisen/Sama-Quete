/**
 * Service d'intégration pour l'API de paiement PayDunya (Mobile)
 * 
 * Cette couche d'adaptation isole le submodule payment-api et fournit
 * une interface unifiée pour les paiements dans l'app mobile Sama-Quete.
 * 
 * IMPORTANT: Ne jamais modifier directement le submodule payment-api.
 * Toute adaptation doit être faite dans cette couche.
 */

import { auth } from './firebase';
import { Linking } from 'react-native';
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
  private async getAuthHeader(): Promise<HeadersInit> {
    const token = await this.getAuthToken();
    const headers: HeadersInit = {
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
    parishId?: string
  ): Promise<PaymentCheckoutResponse & { donationType: string; amount: number }> {
    try {
      const headers = await this.getAuthHeader();
      const response = await fetch(`${this.baseUrl}/api/paydunya/donation/checkout`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          donationType,
          amount,
          description,
          parishId,
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
  async openCheckout(checkoutUrl: string): Promise<void> {
    try {
      const canOpen = await Linking.canOpenURL(checkoutUrl);
      if (canOpen) {
        await Linking.openURL(checkoutUrl);
      } else {
        throw new Error('Impossible d\'ouvrir l\'URL de paiement');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du checkout:', error);
      throw error;
    }
  }

  /**
   * Gérer le retour de paiement via deep link
   * 
   * Cette méthode doit être appelée lors de la réception d'un deep link
   * après un paiement (ex: samaquete://payment/success?token=...)
   */
  async handlePaymentReturn(url: string): Promise<PaymentStatus | null> {
    try {
      // Parser l'URL manuellement pour extraire le token
      // Supporte les formats: samaquete://payment/success?token=xxx ou http://...
      const tokenMatch = url.match(/[?&]token=([^&]+)/);
      const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
      
      if (!token) {
        console.warn('Token manquant dans l\'URL de retour');
        return null;
      }

      return await this.checkPaymentStatus(token);
    } catch (error) {
      console.error('Erreur lors du traitement du retour de paiement:', error);
      return null;
    }
  }

  /**
   * Adapter un plan de paiement PayDunya pour les dons Sama-Quete
   */
  static mapDonationTypeToPlan(donationType: 'quete' | 'denier' | 'cierge' | 'messe', amount: number): string | null {
    // Adaptation selon les besoins de Sama-Quete
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

