# 🔗 Guide d'Intégration du RAG pour l'IA Spirituelle

## 📋 Vue d'ensemble

Intégration du système RAG FastAPI (`numerisenSamaQuetesRagAndTextOfTheDay`) dans le projet Jàngu Bi pour remplacer l'IA spirituelle actuelle basée sur Flask.

## 🔄 Migration Flask → FastAPI RAG

### Système Actuel (Flask)
- **Fichier** : `assistant_biblique_optimized.py`
- **Port** : 8000
- **LLM** : Claude 3.5 Sonnet / GPT-4o
- **Endpoint** : `POST /api/assistant/query`

### Nouveau Système (FastAPI RAG)
- **Repository** : `rag-system/` (à cloner)
- **Port** : 8000 (ou autre si conflit)
- **LLM** : Google Gemini 1.5 Flash
- **Endpoint** : `POST /api/v1/chatbot/query`
- **RAG** : LlamaIndex + Google Embeddings + Cross-encoder

## 🎯 Stratégie d'Intégration

### Option 1 : Remplacement Complet (Recommandé)
Remplacer complètement le système Flask par le FastAPI RAG.

**Avantages** :
- Système RAG plus performant
- Meilleure précision avec 30,742 versets indexés
- Support natif Docker
- Architecture moderne

**Inconvénients** :
- Nécessite de cloner et configurer le repository
- Changement d'endpoints (nécessite un adaptateur)

### Option 2 : Adaptateur de Compatibilité
Créer un adaptateur Flask qui appelle le FastAPI RAG en interne.

**Avantages** :
- Compatibilité totale avec l'app mobile existante
- Pas de changement dans `assistantService.ts`
- Transition progressive possible

**Inconvénients** :
- Double couche (Flask → FastAPI)
- Légère latence supplémentaire

## 📁 Structure Proposée

```
Sama-Quete/
├── rag-system/                    # Repository RAG (à cloner)
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   └── v1/
│   │   │   │       └── chatbot.py  # POST /api/v1/chatbot/query
│   │   │   └── text_of_the_day_data/
│   │   │       └── bible-fr.json
│   │   └── .env                    # Configuration
│   ├── docker-compose.yml
│   └── requirements.txt
├── assistant_biblique_optimized.py # À remplacer ou adapter
├── docker-compose.yml              # À mettre à jour
└── services/
    └── rag-adapter.py              # Adaptateur Flask → FastAPI (Option 2)
```

## 🚀 Étapes d'Intégration

### Étape 1 : Cloner le Repository RAG

```bash
cd /Users/cheikhahmadoubambakebe/Desktop/Samaquete-RECLONE/Sama-Quete
git clone https://github.com/Numerisen/numerisenSamaQuetesRagAndTextOfTheDay.git rag-system
cd rag-system
```

### Étape 2 : Configuration

Créer `rag-system/src/.env` :

```env
# Base de données
POSTGRES_USER=rag_user
POSTGRES_PASSWORD=rag_password
POSTGRES_DB=rag_bible
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# API Keys
SECRET_KEY=your_super_secret_key_here
GOOGLE_API_KEY=your_google_api_key_here  # OBLIGATOIRE

# Application
ENVIRONMENT=production
DEBUG=False
API_V1_STR=/api/v1

# Admin (optionnel)
ADMIN_EMAIL=admin@jangui-bi.com
ADMIN_PASSWORD=changeme
```

### Étape 3 : Intégration Docker

Mettre à jour `docker-compose.yml` pour inclure le service RAG :

```yaml
services:
  rag-api:
    build: ./rag-system
    ports:
      - "8001:8000"  # Port différent pour éviter conflit
    environment:
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      # ... autres variables
    volumes:
      - rag_indexes:/app/rag_indexes
      - rag_data:/app/src/app/text_of_the_day_data
    depends_on:
      - db
      - redis
```

### Étape 4 : Adaptateur de Compatibilité (Option 2)

Créer `services/rag-adapter.py` pour maintenir la compatibilité avec l'app mobile :

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

RAG_API_URL = "http://localhost:8001"  # URL du FastAPI RAG

@app.route('/api/assistant/query', methods=['POST'])
def assistant_query():
    """Adaptateur Flask qui appelle le FastAPI RAG"""
    data = request.get_json()
    question = data.get('question', '').strip()
    context = data.get('context', 'general')
    
    # Appeler le RAG FastAPI
    response = requests.post(
        f"{RAG_API_URL}/api/v1/chatbot/query",
        json={"question": question},
        timeout=30
    )
    
    if response.ok:
        rag_data = response.json()
        # Adapter le format de réponse
        return jsonify({
            "answer": rag_data.get("answer", ""),
            "sources": rag_data.get("sources", []),
            "confidence": rag_data.get("confidence", 0.9),
            "timestamp": rag_data.get("timestamp", ""),
            "bible_references": rag_data.get("bible_references", [])
        })
    else:
        return jsonify({"error": "RAG service unavailable"}), 503

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
```

### Étape 5 : Mise à jour de l'App Mobile (Option 1)

Si on remplace complètement, mettre à jour `assistantService.ts` :

```typescript
// Changer l'URL de base
const API_BASE_URL = process.env.EXPO_PUBLIC_ASSISTANT_API_URL || 'http://localhost:8001';

// Adapter l'endpoint
async askQuestion(question: string, context: string = 'general'): Promise<AssistantResponse> {
  const response = await fetch(`${this.baseUrl}/api/v1/chatbot/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }), // Pas de context dans le nouveau système
  });
  // ...
}
```

## 🔧 Configuration ngrok

Si vous utilisez ngrok pour l'app mobile, mettre à jour l'URL :

```bash
# Démarrer le RAG FastAPI
cd rag-system
docker-compose up -d

# Démarrer ngrok pour le port 8001
ngrok http 8001

# Mettre à jour dans l'app mobile
EXPO_PUBLIC_ASSISTANT_API_URL=https://votre-url-ngrok.ngrok-free.app
```

## ✅ Checklist d'Intégration

- [ ] Cloner le repository RAG
- [ ] Configurer `.env` avec `GOOGLE_API_KEY`
- [ ] Vérifier que `bible-fr.json` existe
- [ ] Construire les images Docker
- [ ] Démarrer le service RAG
- [ ] Tester l'endpoint `/api/v1/chatbot/query`
- [ ] Créer l'adaptateur Flask (si Option 2)
- [ ] Mettre à jour `assistantService.ts` (si Option 1)
- [ ] Tester avec l'app mobile
- [ ] Configurer ngrok si nécessaire
- [ ] Mettre à jour la documentation

## 🎯 Recommandation

**Option 2 (Adaptateur)** est recommandée pour :
- ✅ Compatibilité immédiate avec l'app mobile
- ✅ Pas de changement dans le code mobile
- ✅ Transition progressive possible
- ✅ Fallback possible vers l'ancien système

Une fois que tout fonctionne, on peut migrer progressivement vers l'Option 1.

