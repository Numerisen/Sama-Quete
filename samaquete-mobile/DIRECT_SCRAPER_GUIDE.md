# Guide du Scraper Direct Amélioré

## Vue d'ensemble

Un nouveau service de scraping direct a été ajouté à l'application mobile (`textOfDayScraper.ts`). Ce service implémente **exactement la même logique améliorée** que le scraper Python mis à jour, permettant de récupérer les textes liturgiques directement depuis aelf.org **sans dépendre de l'API Flask**.

## Avantages

✅ **Même qualité d'extraction** que le scraper Python amélioré  
✅ **Indépendant de l'API Flask** - fonctionne même si le serveur Flask est down  
✅ **Cache local** - les données sont mises en cache pour 24h  
✅ **Gestion d'erreurs robuste** - timeout, erreurs réseau, etc.  
✅ **Pas de modification des fichiers Flask** - respecte la demande de ne pas toucher au repo du dev  

## Architecture

```
┌─────────────────────────────────────┐
│   LiturgyApiService (existant)      │
│   - Utilise maintenant le scraper   │
│     direct en priorité              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   TextOfDayScraper (NOUVEAU)        │
│   - Scrape directement aelf.org     │
│   - Même logique que Python         │
│   - Cache local intégré             │
└─────────────────────────────────────┘
```

## Utilisation

### Utilisation automatique (recommandé)

Le service `LiturgyApiService` utilise maintenant automatiquement le scraper direct en priorité :

```typescript
import { liturgyApiService } from './lib/liturgyApiService';

// Utilise automatiquement le scraper direct amélioré
const todayLiturgy = await liturgyApiService.getTodayLiturgy();
```

### Utilisation directe du scraper

Si vous voulez utiliser directement le scraper sans passer par `LiturgyApiService` :

```typescript
import { textOfDayScraper } from './lib/textOfDayScraper';

// Scraper le texte du jour
const todayLiturgy = await textOfDayScraper.scrapeTodayLiturgy();

// Scraper pour une date spécifique
const specificDate = await textOfDayScraper.scrapeLiturgy('2025-01-15');

// Invalider le cache
await textOfDayScraper.invalidateCache(); // Tout le cache
await textOfDayScraper.invalidateCache('2025-01-15'); // Date spécifique
```

## Améliorations implémentées

Le scraper mobile implémente **exactement les mêmes améliorations** que le scraper Python :

### 1. Extraction améliorée des paragraphes
- Gestion correcte des balises `<br>` → conversion en sauts de ligne
- Désencodage HTML complet (`&nbsp;`, `&amp;`, etc.)
- Normalisation des espaces insécables (`\u00a0`)

### 2. Extraction du titre améliorée
- Gestion des espaces insécables
- Normalisation des espaces multiples
- Préservation de la structure

### 3. Extraction des lectures optimisée
- Parcours amélioré des paragraphes
- Préservation des sauts de ligne
- Meilleure séparation entre paragraphes

### 4. Gestion d'erreurs renforcée
- Timeout de 10 secondes
- Gestion des erreurs réseau
- Messages d'erreur explicites

## Stratégie de fallback

Le service utilise une stratégie de fallback intelligente :

1. **Scraper direct amélioré** (priorité) - scrape directement aelf.org
2. **API Flask** (fallback) - si le scraper échoue
3. **Cache local** - si l'API est indisponible
4. **Firestore** - dernier recours

## Configuration

Le scraper est configuré avec :
- **URL de base** : `https://www.aelf.org/{date}/romain/messe`
- **Timeout** : 10 secondes
- **Cache** : 24 heures
- **Clé de cache** : `scraped_liturgy_{date}`

## Exemple d'utilisation dans un composant

```typescript
import React, { useEffect, useState } from 'react';
import { liturgyApiService } from '../lib/liturgyApiService';
import { CachedLiturgyData } from '../lib/liturgyApiService';

export function LiturgyComponent() {
  const [liturgy, setLiturgy] = useState<CachedLiturgyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLiturgy() {
      try {
        // Utilise automatiquement le scraper direct amélioré
        const data = await liturgyApiService.getTodayLiturgy();
        setLiturgy(data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    }
    loadLiturgy();
  }, []);

  if (loading) return <Text>Chargement...</Text>;
  if (!liturgy) return <Text>Aucun texte disponible</Text>;

  return (
    <View>
      <Text>{liturgy.title}</Text>
      <Text>{liturgy.firstReading}</Text>
      {/* ... */}
    </View>
  );
}
```

## Désactiver le scraper direct

Si vous voulez forcer l'utilisation de l'API Flask uniquement :

```typescript
// Passer false pour désactiver le scraper direct
const liturgy = await liturgyApiService.getTodayLiturgy(false);
```

## Tests

Pour tester le scraper directement :

```typescript
import { textOfDayScraper } from './lib/textOfDayScraper';

// Test du scraper
try {
  const result = await textOfDayScraper.scrapeTodayLiturgy();
  console.log('✅ Scraping réussi:', result);
} catch (error) {
  console.error('❌ Erreur:', error);
}
```

## Compatibilité

- ✅ React Native
- ✅ Expo
- ✅ TypeScript
- ✅ AsyncStorage pour le cache
- ✅ Pas de dépendances supplémentaires

## Notes importantes

1. **Pas de modification des fichiers Flask** - Le scraper mobile est complètement indépendant
2. **Même logique que Python** - Les améliorations sont identiques
3. **Cache séparé** - Le cache du scraper est indépendant de celui de l'API
4. **Fallback automatique** - Si le scraper échoue, l'API Flask est utilisée

## Dépannage

### Le scraper ne fonctionne pas
- Vérifiez votre connexion internet
- Vérifiez que aelf.org est accessible
- Consultez les logs de la console

### Cache expiré
- Le cache est automatiquement invalidé après 24h
- Vous pouvez forcer l'invalidation : `await textOfDayScraper.invalidateCache()`

### Erreur de timeout
- Le timeout est de 10 secondes
- Vérifiez votre connexion réseau
- Le service basculera automatiquement vers l'API Flask

## Migration

Aucune migration nécessaire ! Le service `LiturgyApiService` utilise automatiquement le scraper direct. Les composants existants continuent de fonctionner sans modification.

