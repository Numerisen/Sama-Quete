# 🚀 Instructions d'Installation du RAG pour l'IA Spirituelle

## 📋 Vue d'ensemble

Ce guide vous explique comment intégrer le système RAG FastAPI dans votre projet Jàngu Bi pour améliorer l'IA spirituelle.

## ✅ Prérequis

1. **Docker et Docker Compose** installés
2. **Clé API Google AI Studio** (gratuite) - [Obtenir une clé](https://aistudio.google.com/app/apikey)
3. **2 GB d'espace disque** pour les indexes RAG
4. **4 GB de RAM** minimum recommandés

## 🔧 Installation

### Étape 1 : Cloner le Repository RAG

```bash
cd /Users/cheikhahmadoubambakebe/Desktop/Samaquete-RECLONE/Sama-Quete
git clone https://github.com/Numerisen/numerisenSamaQuetesRagAndTextOfTheDay.git rag-system
```

### Étape 2 : Configurer le RAG

Créer le fichier `rag-system/src/.env` :

```env
# Base de données
POSTGRES_USER=rag_user
POSTGRES_PASSWORD=rag_password_change_me
POSTGRES_DB=rag_bible
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# API Keys
SECRET_KEY=your_super_secret_key_change_me
GOOGLE_API_KEY=votre_cle_google_api_ici  # ⚠️ OBLIGATOIRE

# Application
ENVIRONMENT=production
DEBUG=False
API_V1_STR=/api/v1

# Admin (optionnel)
ADMIN_EMAIL=admin@jangui-bi.com
ADMIN_PASSWORD=changeme
```

**⚠️ IMPORTANT** : Remplacez `GOOGLE_API_KEY` par votre vraie clé API Google.

### Étape 3 : Vérifier les Données Bibliques

Assurez-vous que le fichier `rag-system/src/app/text_of_the_day_data/bible-fr.json` existe. Si le repository ne le contient pas, vous devrez l'ajouter.

### Étape 4 : Construire et Démarrer le RAG

```bash
cd rag-system
docker-compose build
docker-compose up -d
```

**Premier démarrage** : L'initialisation prendra 5-10 minutes pour créer les indexes RAG.

Suivre les logs :
```bash
docker-compose logs -f web
```

Vous verrez :
- `📚 RAG indexes not found. Initializing RAG system...` → Initialisation en cours
- `✅ RAG initialization completed successfully` → Terminé
- `🎯 Starting main application` → Application prête

### Étape 5 : Démarrer l'Adaptateur Flask

L'adaptateur Flask maintient la compatibilité avec l'app mobile existante :

```bash
cd /Users/cheikhahmadoubambakebe/Desktop/Samaquete-RECLONE/Sama-Quete

# Configurer l'URL du RAG (par défaut: http://localhost:8001)
export RAG_API_URL="http://localhost:8001"

# Démarrer l'adaptateur
./start-rag-adapter.sh
```

Ou manuellement :
```bash
python3 services/rag-adapter.py
```

### Étape 6 : Configurer ngrok (pour l'app mobile)

Si vous utilisez ngrok pour exposer l'API à l'app mobile :

```bash
# Dans un nouveau terminal
ngrok http 8000
```

Mettre à jour l'URL dans l'app mobile :
```bash
# Dans samaquete-mobile/.env
EXPO_PUBLIC_ASSISTANT_API_URL=https://votre-url-ngrok.ngrok-free.app
```

## 🧪 Test

### Tester le RAG directement

```bash
curl -X POST "http://localhost:8001/api/v1/chatbot/query" \
  -H "Content-Type: application/json" \
  -d '{"question": "Qui était Jésus?"}'
```

### Tester l'adaptateur Flask

```bash
curl -X POST "http://localhost:8000/api/assistant/query" \
  -H "Content-Type: application/json" \
  -d '{"question": "Qui était Jésus?", "context": "general"}'
```

### Tester depuis l'app mobile

L'app mobile devrait fonctionner sans modification car l'adaptateur maintient la compatibilité avec les endpoints existants.

## 📊 Architecture

```
App Mobile (React Native)
    ↓
Adaptateur Flask (port 8000)
    ↓
RAG FastAPI (port 8001)
    ↓
Google Gemini 1.5 Flash + LlamaIndex
```

## 🔍 Dépannage

### Le RAG ne répond pas

1. Vérifier que le service est démarré :
   ```bash
   docker-compose -f rag-system/docker-compose.yml ps
   ```

2. Vérifier les logs :
   ```bash
   docker-compose -f rag-system/docker-compose.yml logs web
   ```

3. Vérifier le health check :
   ```bash
   curl http://localhost:8001/api/v1/chatbot/health
   ```

### Erreur "Quota exceeded"

Votre clé API Google a atteint sa limite gratuite (15 req/min, 1500 req/jour). Solutions :
- Attendre la réinitialisation du quota (quotidien)
- Créer une nouvelle clé API
- Passer à un plan payant

### L'adaptateur ne peut pas se connecter au RAG

1. Vérifier que `RAG_API_URL` est correct :
   ```bash
   echo $RAG_API_URL
   ```

2. Vérifier que le RAG est accessible :
   ```bash
   curl http://localhost:8001/health
   ```

3. Vérifier les ports :
   - RAG FastAPI : port 8001 (ou celui configuré dans docker-compose)
   - Adaptateur Flask : port 8000

## 📝 Notes

- L'adaptateur Flask maintient la compatibilité totale avec l'app mobile
- Aucune modification nécessaire dans `assistantService.ts`
- Le RAG utilise Google Gemini 1.5 Flash (gratuit avec limites)
- Les indexes RAG sont créés automatiquement au premier démarrage
- Les démarrages suivants sont instantanés (< 5 secondes)

## 🎯 Prochaines Étapes

Une fois que tout fonctionne :
1. Tester avec l'app mobile
2. Vérifier la qualité des réponses
3. Configurer ngrok pour l'accès mobile
4. Mettre à jour la documentation de production

