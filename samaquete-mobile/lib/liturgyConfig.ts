/**
 * Configuration pour l'API des textes liturgiques
 */

interface LiturgyConfig {
  baseUrl: string;
}

class LiturgyConfigManager {
  private config: LiturgyConfig = {
    baseUrl: 'http://localhost:5000'
  };

  getConfig(): LiturgyConfig {
    return this.config;
  }

  setBaseUrl(url: string): void {
    this.config.baseUrl = url;
  }
}

export const liturgyConfigManager = new LiturgyConfigManager();