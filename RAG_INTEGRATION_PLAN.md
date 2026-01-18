# 📚 Plan d'Intégration du RAG pour l'IA Spirituelle

## 🎯 Objectif

Intégrer le repository RAG `numerisenSamaQuetesRagAndTextOfTheDay` dans le projet Jàngu Bi pour améliorer l'IA spirituelle.

## 📋 Structure Actuelle

### API Flask Actuelle
- **Fichier** : `assistant_biblique_optimized.py`
- **Port** : 8000
- **Endpoints** :
  - `POST /api/assistant/query` - Questions à l'IA
  - `GET /api/assistant/suggestions` - Suggestions de questions
  - `GET /api/assistant/stats` - Statistiques
  - `GET /api/text-of-the-day` - Textes liturgiques
  - `GET /health` - Health check

### App Mobile
- **Service** : `samaquete-mobile/lib/assistantService.ts`
- **URL** : `https://sama-quete.onrender.com` (ngrok) ou variable d'environnement

## 🔄 Plan d'Intégration

### Étape 1 : Cloner et Examiner le Repository RAG

```bash
cd /Users/cheikhahmadoubambakebe/Desktop/Samaquete-RECLONE/Sama-Quete
git clone https://github.com/Numerisen/numerisenSamaQuetesRagAndTextOfTheDay.git rag-system
cd rag-system
```

**À examiner** :
- Structure des fichiers
- Dépendances Python (`requirements.txt` ou `pyproject.toml`)
- Endpoints existants
- Configuration nécessaire
- Base de données ou vecteurs utilisés

### Étape 2 : Créer une Structure d'Intégration

**Option A : Intégration Directe**
- Intégrer le code RAG dans `assistant_biblique_optimized.py`
- Adapter les fonctions existantes pour utiliser le nouveau RAG

**Option B : Service Séparé**
- Créer un nouveau service Flask qui utilise le RAG
- Maintenir la compatibilité avec les endpoints existants

**Option C : Submodule Git**
- Ajouter le repository comme submodule Git
- Importer et utiliser les fonctions du RAG

### Étape 3 : Adapter les Endpoints

Les endpoints doivent rester compatibles avec l'app mobile :

```typescript
// Interface attendue par l'app mobile
interface AssistantResponse {
  answer: string;
  sources: string[];
  confidence: number;
  timestamp: string;
}
```

### Étape 4 : Configuration

**Variables d'environnement à ajouter** :
- `RAG_MODEL_PATH` - Chemin vers le modèle RAG
- `RAG_EMBEDDINGS_PATH` - Chemin vers les embeddings
- `RAG_DATABASE_PATH` - Base de données vectorielle
- Autres variables spécifiques au RAG

### Étape 5 : Tests et Validation

1. Tester les endpoints avec l'app mobile
2. Vérifier la qualité des réponses
3. Valider les performances
4. S'assurer de la compatibilité avec ngrok

## 📁 Structure Proposée

```
Sama-Quete/
├── rag-system/                    # Repository RAG (nouveau)
│   ├── src/
│   ├── models/
│   ├── data/
│   └── requirements.txt
├── assistant_biblique_optimized.py # API Flask (à adapter)
├── services/
│   └── rag-service.py             # Service RAG (nouveau, optionnel)
└── requirements_assistant.txt     # Dépendances (à mettre à jour)
```

## 🔧 Actions Immédiates

1. **Cloner le repository** (quand la connexion sera rétablie)
2. **Examiner la structure** et comprendre comment le RAG fonctionne
3. **Identifier les points d'intégration** avec l'API Flask actuelle
4. **Adapter le code** pour utiliser le nouveau RAG
5. **Tester** avec l'app mobile

## 📝 Notes

- Maintenir la compatibilité avec les endpoints existants
- L'app mobile ne doit pas nécessiter de modifications
- Le RAG doit améliorer la qualité des réponses sans casser l'existant
- Conserver le fallback vers Claude/GPT-4 si le RAG échoue

## 🚀 Prochaines Étapes

Une fois le repository cloné, nous pourrons :
1. Analyser le code RAG
2. Créer l'intégration
3. Tester et déployer

