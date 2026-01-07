/**
 * Service de scraping amélioré pour les textes liturgiques
 * Implémente la même logique améliorée que le scraper Python
 * Permet de scraper directement depuis aelf.org sans dépendre de l'API Flask
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types de données
export interface ScrapedLecture {
  type: string;
  reference: string;
  contenu: string;
}

export interface ScrapedLiturgyData {
  date: string;
  title: string | null;
  lectures: ScrapedLecture[];
}

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

class TextOfDayScraper {
  private readonly BASE_URL = 'https://www.aelf.org/{date}/romain/messe';
  private readonly CACHE_KEY = 'scraped_liturgy_';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures

  /**
   * Extrait un paragraphe amélioré avec gestion des sauts de ligne HTML
   * Implémente la même logique que extract_paragraph_improved() en Python
   */
  private extractParagraphImproved(htmlContent: string): string {
    // Remplacer les balises <br> par des sauts de ligne
    let cleaned = htmlContent
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n');

    // Extraire le texte HTML (simulation de BeautifulSoup.get_text())
    // Supprimer les balises HTML
    cleaned = cleaned
      .replace(/<[^>]+>/g, '') // Supprimer toutes les balises HTML
      .replace(/&nbsp;/g, ' ') // Remplacer &nbsp; par espace
      .replace(/&amp;/g, '&') // Décoder &amp;
      .replace(/&lt;/g, '<') // Décoder &lt;
      .replace(/&gt;/g, '>') // Décoder &gt;
      .replace(/&quot;/g, '"') // Décoder &quot;
      .replace(/&#39;/g, "'") // Décoder &#39;
      .replace(/&apos;/g, "'") // Décoder &apos;
      .replace(/&[a-z]+;/gi, ''); // Supprimer les autres entités HTML

    // Normaliser les espaces et sauts de ligne
    cleaned = cleaned
      .replace(/\u00a0/g, ' ') // Remplacer les espaces insécables
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Normaliser les sauts de ligne multiples
      .trim();

    return cleaned;
  }

  /**
   * Parse le HTML de la page aelf.org pour extraire les textes liturgiques
   * Implémente la même logique améliorée que le scraper Python
   */
  private parseDay(html: string, date: string): ScrapedLiturgyData {
    const result: ScrapedLiturgyData = {
      date,
      title: null,
      lectures: []
    };

    // Extraire le titre avec la même logique améliorée
    const titleMatch = html.match(/#middle-col[^>]*>[\s\S]*?<div[^>]*>[\s\S]*?<p[^>]*>[\s\S]*?<strong[^>]*>([^<]+)<\/strong>/i);
    if (titleMatch) {
      let title = titleMatch[1]
        .replace(/\u00a0/g, ' ') // Remplacer les espaces insécables
        .replace(/\n/g, ' ')
        .trim();
      // Normaliser les espaces multiples
      title = title.replace(/\s+/g, ' ');
      result.title = title;
    }

    // Extraire les lectures avec la même logique améliorée
    // Pattern pour trouver les div.lecture
    const lecturePattern = /<div[^>]*class=["'][^"']*lecture[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi;
    let lectureMatch;

    while ((lectureMatch = lecturePattern.exec(html)) !== null) {
      const lectureBlock = lectureMatch[1];

      // Extraire le titre (h4)
      const titreMatch = lectureBlock.match(/<h4[^>]*>([^<]+)<\/h4>/i);
      const titreText = titreMatch ? titreMatch[1].trim() : null;

      // Extraire la référence (h5)
      const referenceMatch = lectureBlock.match(/<h5[^>]*>([^<]+)<\/h5>/i);
      const referenceText = referenceMatch ? referenceMatch[1].trim() : null;

      // Extraire le contenu (paragraphes) avec la logique améliorée
      const paragraphPattern = /<p[^>]*>([\s\S]*?)<\/p>/gi;
      let paragraphMatch;
      let contenu = '';

      while ((paragraphMatch = paragraphPattern.exec(lectureBlock)) !== null) {
        const paragraphHtml = paragraphMatch[1];
        const texte = this.extractParagraphImproved(paragraphHtml);
        if (texte) {
          contenu += texte + '\n\n';
        }
      }

      if (titreText || referenceText || contenu.trim()) {
        result.lectures.push({
          type: titreText || '',
          reference: referenceText || '',
          contenu: contenu.trim()
        });
      }
    }

    return result;
  }

  /**
   * Récupère le HTML depuis aelf.org
   */
  private async fetchHtml(date: string): Promise<string> {
    const url = this.BASE_URL.replace('{date}', date);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout de 10 secondes

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SamaQuete/1.0)',
        },
        signal: controller.signal as any
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Timeout lors de la récupération des données');
      }
      throw new Error(`Erreur de connexion: ${error.message}`);
    }
  }

  /**
   * Convertit les données scrapées vers le format ProcessedLiturgyData
   */
  private processScrapedData(scrapedData: ScrapedLiturgyData): ProcessedLiturgyData {
    const { date, title, lectures } = scrapedData;

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

      // Classification plus précise (même logique que le scraper Python)
      if (type.includes('première lecture') || 
          (type.includes('lecture') && !type.includes('deuxième') && !type.includes('seconde'))) {
        firstReading = content;
        firstReadingRef = reference;
      } else if (type.includes('psaume') || type.includes('psalm')) {
        // Pour le psaume, nettoyer les répétitions du refrain
        let cleanContent = content.replace(
          /^R\/\s*Chante, ô mon âme, la louange du Seigneur!\s*ou:\s*Alléluia!\s*\(Ps 145, 1b\)\s*/gmi,
          ''
        );
        cleanContent = cleanContent.replace(
          /^R\/\s*Chante, ô mon âme, la louange du Seigneur!\s*ou:\s*Alléluia!\s*\(Ps 145, 1b\)\s*/gmi,
          ''
        );
        psalm = cleanContent;
        psalmRef = reference;
      } else if (type.includes('deuxième lecture') || type.includes('seconde lecture')) {
        secondReading = content;
        secondReadingRef = reference;
      } else if (type.includes('évangile') || type.includes('gospel')) {
        gospel = content;
        gospelRef = reference;
      } else if (type.includes('réflexion') || type.includes('méditation')) {
        reflection = content;
      }
    });

    // Si pas de réflexion trouvée, utiliser le titre
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
      liturgicalSeason: this.extractLiturgicalSeason(title || ''),
      color: this.getLiturgicalColor(title || '')
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
   * Récupère le texte liturgique pour une date donnée
   */
  async scrapeLiturgy(date: string, timezone: string = 'Europe/Paris'): Promise<ProcessedLiturgyData> {
    // Formater la date au format YYYY-MM-DD
    let targetDate: string;
    if (date) {
      targetDate = date;
    } else {
      // Utiliser la date d'aujourd'hui selon le timezone
      const now = new Date();
      // Note: React Native n'a pas de support natif pour les timezones
      // On utilise la date locale pour l'instant
      targetDate = now.toISOString().split('T')[0];
    }

    // Vérifier le cache d'abord
    const cacheKey = `${this.CACHE_KEY}${targetDate}`;
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // Scraper depuis aelf.org
    const html = await this.fetchHtml(targetDate);
    const scrapedData = this.parseDay(html, targetDate);

    // Vérifier que des données ont été récupérées
    if (!scrapedData.title && scrapedData.lectures.length === 0) {
      throw new Error(`Aucun texte liturgique trouvé pour la date ${targetDate}`);
    }

    // Traiter les données
    const processedData = this.processScrapedData(scrapedData);

    // Mettre en cache
    await this.saveToCache(cacheKey, processedData);

    return processedData;
  }

  /**
   * Récupère le texte liturgique du jour
   */
  async scrapeTodayLiturgy(timezone: string = 'Europe/Paris'): Promise<ProcessedLiturgyData> {
    return this.scrapeLiturgy('', timezone);
  }

  /**
   * Sauvegarde dans le cache
   */
  private async saveToCache(key: string, data: ProcessedLiturgyData): Promise<void> {
    try {
      const cacheData = {
        ...data,
        cachedAt: Date.now()
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde du cache:', error);
    }
  }

  /**
   * Récupère depuis le cache
   */
  private async getFromCache(key: string): Promise<ProcessedLiturgyData | null> {
    try {
      const cachedData = await AsyncStorage.getItem(key);
      if (!cachedData) {
        return null;
      }

      const data = JSON.parse(cachedData) as ProcessedLiturgyData & { cachedAt: number };
      
      // Vérifier si le cache est expiré
      const isExpired = Date.now() - data.cachedAt > this.CACHE_DURATION;
      if (isExpired) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      // Retirer cachedAt avant de retourner
      const { cachedAt, ...liturgyData } = data;
      return liturgyData;
    } catch (error) {
      console.warn('Erreur lors de la récupération du cache:', error);
      return null;
    }
  }

  /**
   * Invalide le cache pour une date donnée
   */
  async invalidateCache(date?: string): Promise<void> {
    try {
      if (date) {
        const cacheKey = `${this.CACHE_KEY}${date}`;
        await AsyncStorage.removeItem(cacheKey);
      } else {
        // Invalider tout le cache des textes liturgiques
        const keys = await AsyncStorage.getAllKeys();
        const liturgyKeys = keys.filter(key => key.startsWith(this.CACHE_KEY));
        await AsyncStorage.multiRemove(liturgyKeys);
      }
    } catch (error) {
      console.warn('Erreur lors de l\'invalidation du cache:', error);
    }
  }
}

// Export d'une instance singleton
export const textOfDayScraper = new TextOfDayScraper();

// Export de la classe pour les tests
export { TextOfDayScraper };

