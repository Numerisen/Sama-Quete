# Mises à jour RAG et Text of the Day

Ce document décrit les améliorations intégrées depuis le dépôt `numerisenSamaQuetesRagAndTextOfTheDay`.

## Date de mise à jour
Date: $(date)

## Améliorations intégrées

### 1. Text of the Day - Scraper amélioré

#### Fichiers modifiés:
- `assistant_biblique_optimized.py`
- `assistant_biblique_enhanced.py`

#### Améliorations apportées:

1. **Extraction améliorée des paragraphes**
   - Nouvelle fonction `extract_paragraph_improved()` qui gère mieux les sauts de ligne HTML
   - Conversion correcte des balises `<br>` en sauts de ligne
   - Désencodage HTML amélioré avec `unescape()`

2. **Gestion d'erreurs renforcée**
   - Gestion des timeouts (10 secondes)
   - Gestion des erreurs de connexion réseau
   - Messages d'erreur plus explicites

3. **Extraction du titre améliorée**
   - Meilleure gestion des espaces insécables (`\xa0`)
   - Normalisation des espaces multiples
   - Préservation de la structure du texte

4. **Extraction des lectures optimisée**
   - Parcours amélioré des paragraphes avec préservation des sauts de ligne
   - Meilleure séparation entre les différents paragraphes
   - Conservation de la structure originale du texte

#### Code source de référence:
Le scraper amélioré est basé sur `TextOfTheDayScraper` du dépôt:
- `src/app/services/text_of_the_day.py`

### 2. RAG Service (Information)

Le dépôt contient un service RAG complet utilisant:
- **LlamaIndex** pour la recherche vectorielle
- **Google Gemini 1.5 Flash** comme LLM
- **Hybrid retrieval** (BM25 + Vector)
- **Query fusion** pour améliorer le rappel
- **Sentence transformer re-ranking** pour la précision

**Note:** Le service RAG du dépôt utilise une architecture FastAPI différente de l'implémentation Flask actuelle. Les fichiers actuels (`assistant_biblique_*.py`) continuent d'utiliser Claude/OpenAI avec une approche différente mais efficace.

Si vous souhaitez migrer vers le système RAG du dépôt, cela nécessiterait:
1. Installation de LlamaIndex et dépendances
2. Création des index RAG (script `init_rag.py`)
3. Configuration de Google Gemini API
4. Adaptation de l'architecture Flask vers FastAPI (ou intégration dans Flask)

### 3. Fichiers de données

Le dépôt contient également des fichiers de données:
- `src/app/text_of_the_day_data/bible-fr.json`
- `src/app/text_of_the_day_data/text_of_the_day.json`

Ces fichiers peuvent être utilisés comme données de référence ou de fallback.

## Utilisation

Les améliorations sont automatiquement actives dans:
- `assistant_biblique_optimized.py`
- `assistant_biblique_enhanced.py`

Le script `textoftheday.js` bénéficie automatiquement des améliorations via l'API.

## Tests recommandés

1. Tester l'endpoint `/api/text-of-the-day` avec différentes timezones
2. Vérifier la qualité de l'extraction des textes
3. Tester la gestion des erreurs (timeout, connexion, etc.)

## Références

- Dépôt source: https://github.com/Numerisen/numerisenSamaQuetesRagAndTextOfTheDay
- Service RAG: `src/app/services/rag_service.py`
- Service Text of Day: `src/app/services/text_of_the_day.py`
- API Endpoints: `src/app/api/v1/text_of_the_day.py` et `src/app/api/v1/chatbot.py`

