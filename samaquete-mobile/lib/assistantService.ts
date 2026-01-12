/**
 * Service pour l'assistant IA biblique de SamaQuete
 * Gère la communication avec l'API backend RAG
 */

// URL de l'API - utilise ngrok en développement, URL de production en production
const API_BASE_URL = process.env.EXPO_PUBLIC_ASSISTANT_API_URL || 'https://16ebbdd7cdcb.ngrok-free.app'; // ngrok ou production

export interface AssistantResponse {
  answer: string;
  sources: string[];
  confidence: number;
  timestamp: string;
}

export interface AssistantSuggestion {
  suggestions: string[];
  timestamp: string;
}

export interface AssistantStatus {
  status: 'active' | 'inactive';
  initialized: boolean;
  timestamp: string;
}

export interface AssistantError {
  error: string;
  message: string;
}

class AssistantService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Pose une question à l'assistant IA biblique
   */
  async askQuestion(question: string, context: string = 'general'): Promise<AssistantResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/assistant/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question,
          context 
        }),
      });

      if (!response.ok) {
        const errorData: AssistantError = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la requête');
      }

      const data: AssistantResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la requête à l\'assistant:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Erreur de connexion à l\'assistant IA'
      );
    }
  }

  /**
   * Obtient des suggestions de questions
   */
  async getSuggestions(): Promise<AssistantSuggestion> {
    try {
      const response = await fetch(`${this.baseUrl}/api/assistant/suggestions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des suggestions');
      }

      const data: AssistantSuggestion = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des suggestions:', error);
      // Retourner des suggestions par défaut en cas d'erreur
      return {
        suggestions: [
          "Qu'est-ce que la Pentecôte ?",
          "Comment prier le rosaire ?",
          "Sens du carême",
          "Saints du Sénégal",
          "Préparation au baptême",
          "Signification de l'Eucharistie"
        ],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtient les statistiques de l'assistant
   */
  async getStats(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/assistant/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  /**
   * Obtient les textes du jour (endpoint existant)
   */
  async getTextOfTheDay(timezone: string = 'Europe/Paris'): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/text-of-the-day?tz=${timezone}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Ne pas logger d'erreur pour 404 - c'est normal si l'API n'est pas disponible
        if (response.status === 404) {
          throw new Error('API endpoint non disponible - utilisation du fallback');
        }
        throw new Error(`Erreur API: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Logger seulement si ce n'est pas une erreur 404 attendue (fallback normal)
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('404') && !errorMessage.includes('non disponible')) {
        console.error('Erreur lors de la récupération du texte du jour:', error);
      } else {
        console.log('API Flask non disponible, utilisation du fallback (normal)');
      }
      throw error;
    }
  }

  /**
   * Vérifie le statut de l'assistant IA
   */
  async getStatus(): Promise<AssistantStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/assistant/status`);

      if (!response.ok) {
        throw new Error('Erreur lors de la vérification du statut');
      }

      const data: AssistantStatus = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
      return {
        status: 'inactive',
        initialized: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Vérifie si l'API backend est accessible
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('API backend non accessible:', error);
      return false;
    }
  }

  /**
   * Obtient l'URL de base de l'API
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Met à jour l'URL de base de l'API
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }
}

// Instance singleton du service
export const assistantService = new AssistantService();

// Export de la classe pour les tests
export default AssistantService;
