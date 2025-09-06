/**
 * Service pour l'assistant IA biblique de SamaQuete
 * Gère la communication avec l'API backend RAG
 */

const API_BASE_URL = 'http://192.168.68.108:5001'; // À changer pour la production

export interface AssistantResponse {
  question: string;
  answer: string;
  timestamp: string;
  source: string;
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
  async askQuestion(question: string): Promise<AssistantResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/assistant/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
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
      const response = await fetch(`${this.baseUrl}/api/assistant/suggestions`);

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des suggestions');
      }

      const data: AssistantSuggestion = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des suggestions:', error);
      throw new Error('Impossible de récupérer les suggestions');
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
