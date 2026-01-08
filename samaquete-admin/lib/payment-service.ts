/**
 * Service d'intégration pour l'API de paiement PayDunya
 * 
 * Cette couche d'adaptation isole le submodule payment-api et fournit
 * une interface unifiée pour les paiements dans Jàngu Bi.
 * 
 * IMPORTANT: Ne jamais modifier directement le submodule payment-api.
 * Toute adaptation doit être faite dans cette couche.
 */

import { auth } from './firebase';

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
 * Service de paiement pour l'application admin
 * 
 * Ce service encapsule les appels à l'API payment-api sans exposer
 * les détails d'implémentation du submodule.
 */
export class PaymentService {
  private baseUrl: string;
  private getAuthToken: () => Promise<string | null>;

  constructor(baseUrl?: string) {
    // URL de l'API de paiement (peut être locale ou distante)
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_PAYMENT_API_URL || 'http://localhost:3000';
    
    // Fonction pour obtenir le token Firebase
    this.getAuthToken = async () => {
      const user = auth.currentUser;
      if (!user) return null;
      return await user.getIdToken();
    };
  }

  /**
   * Obtenir le token d'authentification Firebase
   */
  private async getAuthHeader(): Promise<HeadersInit> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Utilisateur non authentifié');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
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
   * @param planId - Identifiant du plan de paiement (ex: 'BOOK_PART_2', 'BOOK_PART_3')
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
   * Adapter un plan de paiement PayDunya pour les dons Jàngu Bi
   * 
   * Cette méthode permet de mapper les types de dons Jàngu Bi
   * vers les plans supportés par l'API de paiement.
   */
  static mapDonationTypeToPlan(donationType: 'quete' | 'denier' | 'cierge' | 'messe', amount: number): string | null {
    // Pour l'instant, l'API payment-api supporte BOOK_PART_2 et BOOK_PART_3
    // Cette méthode peut être étendue pour supporter d'autres plans
    // selon les besoins de Jàngu Bi
    
    // Exemple d'adaptation (à adapter selon vos besoins réels)
    if (donationType === 'messe' && amount >= 10000) {
      return 'BOOK_PART_2';
    }
    
    // Retourne null si aucun plan ne correspond
    return null;
  }
}

/**
 * Instance singleton du service de paiement
 */
export const paymentService = new PaymentService();

