/**
 * Service pour l'assistant IA biblique de Jàngu Bi
 * Gère la communication avec l'API RAG FastAPI (Google Gemini + LlamaIndex)
 */

// URL de l'API RAG FastAPI - priorité à EXPO_PUBLIC_ASSISTANT_API_URL (Expo/.env/EAS),
// sinon fallback sur l'URL Render (stable) plutôt que localhost (inaccessible sur téléphone).
const API_BASE_URL = process.env.EXPO_PUBLIC_ASSISTANT_API_URL || 'https://sama-quete.onrender.com';

// Détecter si on est en production
const isProduction = process.env.NODE_ENV === 'production' || 
                     !__DEV__ || 
                     (!API_BASE_URL.includes('localhost') && !API_BASE_URL.includes('ngrok'));

/**
 * Nettoie les messages d'erreur pour la production
 * Masque les détails techniques et retourne des messages user-friendly
 */
function sanitizeErrorMessage(error: string, isProd: boolean = isProduction): string {
  if (!isProd) {
    return error; // En développement, on garde les détails
  }
  
  // Masquer les détails techniques en production
  let sanitized = error;
  
  // Masquer les URLs
  sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '[URL masquée]');
  
  // Masquer les codes d'erreur techniques bruts
  sanitized = sanitized.replace(/Erreur HTTP: \d+/g, 'Erreur de connexion');
  sanitized = sanitized.replace(/Erreur \d+:/g, 'Erreur:');
  
  // Masquer les références ngrok (ne devrait jamais apparaître en prod)
  sanitized = sanitized.replace(/ngrok[^\s]*/gi, 'service');
  
  // Messages user-friendly par défaut
  if (sanitized.includes('503') || sanitized.includes('temporairement indisponible')) {
    return 'Le service est temporairement indisponible. Veuillez réessayer dans quelques instants.';
  }
  if (sanitized.includes('429') || sanitized.includes('Trop de requêtes')) {
    return 'Trop de requêtes. Veuillez patienter un moment avant de réessayer.';
  }
  if (sanitized.includes('500') || sanitized.includes('interne du serveur')) {
    return 'Une erreur est survenue. Veuillez réessayer plus tard.';
  }
  if (sanitized.includes('Network') || sanitized.includes('fetch') || sanitized.includes('connexion')) {
    return 'Erreur de connexion. Vérifiez votre connexion internet et réessayez.';
  }
  if (sanitized.includes('404') || sanitized.includes('non trouvé')) {
    return 'Service non disponible. Veuillez réessayer plus tard.';
  }
  if (sanitized.includes('timeout') || sanitized.includes('trop de temps')) {
    return 'La requête a pris trop de temps. Veuillez réessayer.';
  }
  
  // Message générique si on ne reconnaît pas l'erreur
  return 'Une erreur est survenue. Veuillez réessayer.';
}

export interface AssistantResponse {
  answer: string;
  sources: string[];
  timestamp: string;
  bible_references?: string[]; // Références bibliques du RAG
  model?: string; // Modèle utilisé (ex: "Google Gemini 1.5 Flash")
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
  error?: string;
  message?: string;
  detail?: string; // Pour les erreurs FastAPI
}

class AssistantService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async initRag(): Promise<boolean> {
    try {
      const res = await this.fetchWithTimeout(
        `${this.baseUrl}/api/v1/chatbot/init`,
        { method: 'POST', headers: this.getHeaders() },
        120000
      );
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Warmup: à appeler à l'ouverture de l'écran IA pour éviter les 502 (Render Free sleep).
   * Retourne true si le service est prêt, false sinon (best-effort).
   */
  async warmup(): Promise<boolean> {
    try {
      await this.ensureInitialized();
      return true;
    } catch {
      return false;
    }
  }

  private async isReady(): Promise<boolean> {
    try {
      const healthRes = await this.fetchWithTimeout(
        `${this.baseUrl}/api/v1/chatbot/health`,
        { method: 'GET', headers: this.getHeaders() },
        15000
      );
      if (!healthRes.ok) return false;
      const health: any = await healthRes.json().catch(() => null);
      return !!(health?.initialized && health?.query_engine_available);
    } catch {
      return false;
    }
  }

  private async ensureInitialized(): Promise<void> {
    // Render Free: on attend VRAIMENT "ready" avant d'envoyer /query.
    // Sinon on déclenche des 502/timeouts.
    const startedAt = Date.now();
    const maxWaitMs = 120000; // 2 min max

    while (Date.now() - startedAt < maxWaitMs) {
      if (await this.isReady()) return;

      // Tenter init (best-effort)
      await this.initRag();

      // Attendre un peu (Render peut redémarrer / cold start)
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    throw new Error('Le service redémarre. Veuillez réessayer dans quelques instants.');
  }

  /**
   * Génère les headers avec le header ngrok si nécessaire
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Ajouter le header ngrok pour éviter la page d'avertissement
    if (this.baseUrl.includes('ngrok')) {
      headers['ngrok-skip-browser-warning'] = 'true';
    }
    
    return headers;
  }

  /**
   * Pose une question à l'assistant IA biblique RAG
   * Utilise directement l'endpoint FastAPI /api/v1/chatbot/query
   */
  async askQuestion(question: string, context: string = 'general'): Promise<AssistantResponse> {
    try {
      // Render Free: initialisation paresseuse, peut prendre >30s
      await this.ensureInitialized();

      // Le RAG FastAPI utilise /api/v1/chatbot/query et n'accepte que {question}
      console.log('📤 Envoi de la question au RAG:', {
        url: `${this.baseUrl}/api/v1/chatbot/query`,
        question: question.substring(0, 50) + '...'
      });
      
      // Timeout plus long sur Render Free (même après init, la 1ère requête peut être lente)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000);
      
      let response: Response;
      try {
        response = await fetch(`${this.baseUrl}/api/v1/chatbot/query`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ 
            question // Le RAG n'utilise pas le paramètre context
          }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        // Render/Cloudflare peut renvoyer 502/504 pendant un redémarrage (sleep/redeploy/OOM).
        // On tente un re-init + retry (plus long sur Render Free).
        if (response.status === 502 || response.status === 504) {
          const maxRetries = 6;
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const delay = Math.min(3000 * attempt, 15000); // 3s, 6s, 9s... (max 15s)
            console.log(`⚠️ Erreur ${response.status} détectée, tentative ${attempt}/${maxRetries} dans ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));

            await this.ensureInitialized(); // re-warmup

            const retryController = new AbortController();
            const retryTimeoutId = setTimeout(() => retryController.abort(), 180000);
            try {
              response = await fetch(`${this.baseUrl}/api/v1/chatbot/query`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ question }),
                signal: retryController.signal,
              });
            } finally {
              clearTimeout(retryTimeoutId);
            }

            if (response.ok) {
              break;
            }

            if ((response.status === 502 || response.status === 504) && attempt === maxRetries) {
              throw new Error('Le service redémarre. Veuillez réessayer dans quelques instants.');
            }
          }
        }

        // Si erreur 503, essayer avec exponential backoff (max 2 tentatives)
        if (response.status === 503) {
          const maxRetries = 2;
          let lastError: Error | null = null;
          
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // 1s, 2s, max 5s
            console.log(`⚠️ Erreur 503 détectée, tentative ${attempt}/${maxRetries} dans ${delay}ms...`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            
            const retryController = new AbortController();
            const retryTimeoutId = setTimeout(() => retryController.abort(), 180000);
            
            try {
              response = await fetch(`${this.baseUrl}/api/v1/chatbot/query`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ question }),
                signal: retryController.signal,
              });
              clearTimeout(retryTimeoutId);
              
              // Si la réponse est OK, sortir de la boucle
              if (response.ok) {
                break;
              }
              
              // Si toujours 503 et dernière tentative, lancer l'erreur
              if (response.status === 503 && attempt === maxRetries) {
                throw new Error('Le service est temporairement indisponible. Veuillez réessayer dans quelques instants.');
              }
            } catch (retryError: any) {
              clearTimeout(retryTimeoutId);
              lastError = retryError;
              
              if (retryError.name === 'AbortError') {
                throw new Error('La requête a pris trop de temps. Veuillez réessayer.');
              }
              
              // Si dernière tentative, lancer l'erreur
              if (attempt === maxRetries) {
                throw retryError;
              }
            }
          }
        }
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('La requête a pris trop de temps. Veuillez réessayer.');
        }
        throw error;
      }

      if (!response.ok) {
        let errorMessage = `Erreur HTTP: ${response.status}`;
        
        // Messages spécifiques selon le code d'erreur
        if (response.status === 503) {
          errorMessage = 'Le service est temporairement indisponible. Veuillez réessayer dans quelques instants.';
        } else if (response.status === 502 || response.status === 504) {
          errorMessage = 'Le service redémarre. Veuillez réessayer dans quelques instants.';
        } else if (response.status === 429) {
          errorMessage = 'Trop de requêtes. Veuillez patienter un moment avant de réessayer.';
        } else if (response.status === 500) {
          errorMessage = 'Erreur interne du serveur. Veuillez réessayer plus tard.';
        } else {
          try {
            const errorData: AssistantError = await response.json();
            // En production, ne pas exposer les détails techniques
            const rawMessage = errorData.message || errorData.error || errorData.detail || errorMessage;
            errorMessage = sanitizeErrorMessage(rawMessage, isProduction);
          } catch (e) {
            // Si la réponse n'est pas du JSON, essayer de lire le texte
            try {
              const text = await response.text();
              if (text) {
                // En production, masquer les détails techniques
                const rawError = `Erreur ${response.status}: ${text.substring(0, 200)}`;
                errorMessage = sanitizeErrorMessage(rawError, isProduction);
              } else {
                errorMessage = sanitizeErrorMessage(errorMessage, isProduction);
              }
            } catch (e2) {
              // Ignorer si on ne peut pas lire le texte, utiliser le message par défaut
              errorMessage = sanitizeErrorMessage(errorMessage, isProduction);
            }
          }
        }
        
        // Logger les détails complets en développement seulement
        if (!isProduction) {
          console.error('❌ Erreur API RAG:', {
            status: response.status,
            statusText: response.statusText,
            url: `${this.baseUrl}/api/v1/chatbot/query`,
            message: errorMessage
          });
        } else {
          // En production, logger seulement les codes d'erreur (sans URL)
          console.error('❌ Erreur API RAG:', {
            status: response.status,
            message: errorMessage
          });
        }
        throw new Error(errorMessage);
      }

      // Le RAG FastAPI retourne un format spécifique, on l'adapte
      const ragData: any = await response.json();
      
      console.log('✅ Réponse RAG reçue:', {
        hasAnswer: !!ragData.answer,
        answerLength: ragData.answer?.length || 0,
        hasSources: !!ragData.sources,
        sourcesCount: ragData.sources?.length || 0,
        fullData: ragData
      });
      
      // Extraire les références bibliques depuis les sources
      const sourcesList: string[] = [];
      const bibleRefs: string[] = [];
      
      if (ragData.sources && Array.isArray(ragData.sources)) {
        ragData.sources.forEach((source: any) => {
          if (source.reference) {
            sourcesList.push(source.reference);
            bibleRefs.push(source.reference);
          } else if (typeof source === 'string') {
            sourcesList.push(source);
            bibleRefs.push(source);
          }
        });
      }
      
      // Vérifier que la réponse n'est pas vide
      if (!ragData.answer || ragData.answer.trim() === '') {
        console.warn('⚠️ Réponse RAG vide ou invalide:', ragData);
        throw new Error('La réponse de l\'assistant est vide. Veuillez réessayer.');
      }
      
      // Nettoyer la réponse : enlever les markdown (#, ***, etc.) et améliorer le formatage
      let cleanedAnswer = ragData.answer
        // Enlever les séparateurs markdown (***, ---, etc.)
        .replace(/\*\*\*/g, '')
        .replace(/---+/g, '')
        .replace(/===+/g, '')
        // Enlever les titres markdown (#, ##, ###, etc.) mais garder le texte
        .replace(/^#{1,6}\s+(.+)$/gm, '$1\n')
        // Enlever les listes markdown (*, -, +) mais garder le texte avec indentation
        .replace(/^[\*\-\+]\s+(.+)$/gm, '  $1')
        // Enlever les numéros de liste (1., 2., etc.) mais garder le texte
        .replace(/^\d+\.\s+(.+)$/gm, '  $1')
        // Enlever les gras/italique markdown (**texte**, *texte*)
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        // Nettoyer les espaces multiples et lignes vides
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+/g, ' ')
        .trim();
      
      // Adapter le format de réponse du RAG au format attendu par l'app
      const adaptedResponse = {
        answer: cleanedAnswer,
        sources: sourcesList.length > 0 ? sourcesList : (ragData.bible_references || []),
        timestamp: ragData.timestamp || new Date().toISOString(),
        bible_references: bibleRefs.length > 0 ? bibleRefs : (ragData.bible_references || []),
        model: ragData.model || 'Google Gemini 1.5 Flash (RAG)'
      };
      
      console.log('✅ Réponse adaptée:', {
        answerLength: adaptedResponse.answer.length,
        sourcesCount: adaptedResponse.sources.length,
      });
      
      return adaptedResponse;
    } catch (error) {
      console.error('Erreur lors de la requête à l\'assistant RAG:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Erreur de connexion à l\'assistant IA RAG'
      );
    }
  }

  /**
   * Obtient des suggestions de questions
   * Le RAG FastAPI n'a peut-être pas cet endpoint, on utilise des suggestions par défaut
   */
  async getSuggestions(): Promise<AssistantSuggestion> {
    try {
      // Essayer d'appeler l'endpoint du RAG s'il existe
      const response = await fetch(`${this.baseUrl}/api/v1/chatbot/suggestions`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const data: AssistantSuggestion = await response.json();
        return data;
      }
      
      // Si l'endpoint n'existe pas, retourner des suggestions par défaut
      throw new Error('Endpoint suggestions non disponible');
    } catch (error) {
      console.log('Utilisation des suggestions par défaut (endpoint RAG non disponible)');
      // Retourner des suggestions par défaut adaptées au contexte biblique
      return {
        suggestions: [
          "Qui était Moïse et quel rôle a-t-il joué dans l'histoire d'Israël?",
          "Qu'est-ce que la Pentecôte ?",
          "Comment prier le rosaire ?",
          "Quel est le sens du carême ?",
          "Qui sont les saints du Sénégal ?",
          "Comment se préparer au baptême ?",
          "Quelle est la signification de l'Eucharistie ?",
          "Qu'est-ce que la Trinité ?",
          "Comment interpréter la parabole du bon samaritain ?",
          "Quel est le message principal de l'Évangile selon Jean ?"
        ],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtient les statistiques de l'assistant RAG
   */
  async getStats(): Promise<any> {
    try {
      // Le RAG FastAPI utilise probablement /api/v1/chatbot/stats ou /health
      const response = await fetch(`${this.baseUrl}/api/v1/chatbot/stats`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (response.ok) {
        return await response.json();
      }
      
      // Fallback vers health check
      const healthResponse = await fetch(`${this.baseUrl}/api/v1/chatbot/health`);
      if (healthResponse.ok) {
        return await healthResponse.json();
      }
      
      throw new Error('Endpoints stats non disponibles');
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      // Retourner des stats par défaut
      return {
        status: 'unknown',
        rag_available: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtient les textes du jour depuis le RAG FastAPI
   */
  async getTextOfTheDay(timezone: string = 'Africa/Dakar'): Promise<any> {
    try {
      // Le RAG FastAPI utilise probablement /api/v1/text-of-the-day
      const response = await fetch(`${this.baseUrl}/api/v1/text-of-the-day?tz=${timezone}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        // Essayer l'ancien endpoint pour compatibilité
        const fallbackResponse = await fetch(`${this.baseUrl}/api/text-of-the-day?tz=${timezone}`, {
          headers: this.getHeaders(),
        });
        if (fallbackResponse.ok) {
          return await fallbackResponse.json();
        }
        
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
        console.log('API RAG non disponible pour textes du jour, utilisation du fallback (normal)');
      }
      throw error;
    }
  }

  /**
   * Vérifie le statut de l'assistant RAG
   */
  async getStatus(): Promise<AssistantStatus> {
    try {
      // Le RAG FastAPI utilise /api/v1/chatbot/health
      const response = await fetch(`${this.baseUrl}/api/v1/chatbot/health`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const healthData: any = await response.json();
        return {
          status: healthData.status === 'ok' ? 'active' : 'inactive',
          initialized: healthData.initialized !== false,
          timestamp: healthData.timestamp || new Date().toISOString()
        };
      }
      
      throw new Error('Health check failed');
    } catch (error) {
      console.error('Erreur lors de la vérification du statut RAG:', error);
      return {
        status: 'inactive',
        initialized: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Vérifie si l'API RAG backend est accessible
   */
  async checkHealth(): Promise<boolean> {
    try {
      // Essayer le health check du RAG FastAPI
      const response = await fetch(`${this.baseUrl}/api/v1/chatbot/health`, {
        headers: this.getHeaders(),
      });
      if (response.ok) {
        return true;
      }
      
      // Fallback vers /health standard
      const fallbackResponse = await fetch(`${this.baseUrl}/health`, {
        headers: this.getHeaders(),
      });
      return fallbackResponse.ok;
    } catch (error) {
      console.error('API RAG backend non accessible:', error);
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
