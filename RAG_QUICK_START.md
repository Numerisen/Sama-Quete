# 🚀 Guide de Démarrage Rapide - RAG FastAPI

## ✅ Étape 1 : Configuration

### 1.1 Créer le fichier `.env`

Le fichier `.env` a été créé dans `rag-system/src/.env`. **IMPORTANT** : Vous devez y ajouter votre clé API Google :

```bash
cd rag-system/src
nano .env  # ou utilisez votre éditeur préféré
```

**Modifier cette ligne** :
```env
GOOGLE_API_KEY=votre_vraie_cle_google_api_ici
```

**Obtenir une clé Google API** :
1. Aller sur https://aistudio.google.com/apikey
2. Créer une nouvelle clé API (gratuite)
3. Copier la clé et la coller dans `.env`

### 1.2 Vérifier les données bibliques

Le fichier `bible-fr.json` doit exister :
```bash
ls -la rag-system/src/app/text_of_the_day_data/bible-fr.json
```

✅ Le fichier existe déjà dans le repository cloné.

## 🐳 Étape 2 : Démarrer le RAG avec Docker

### 2.1 Construire les images

```bash
cd rag-system
docker-compose build
```

**Temps estimé** : 1-2 minutes

### 2.2 Démarrer les services

```bash
docker-compose up -d
```

**Premier démarrage** : L'initialisation prendra 5-10 minutes pour :
- ✅ Créer les indexes RAG (30,742 versets)
- ✅ Initialiser les textes du jour
- ✅ Démarrer l'API FastAPI

**Suivre la progression** :
```bash
docker-compose logs -f web
```

Vous verrez :
- `📚 RAG indexes not found. Initializing RAG system...` → Initialisation en cours
- `✅ RAG initialization completed successfully` → Terminé
- `🎯 Starting main application` → Application prête

### 2.3 Vérifier que tout fonctionne

```bash
# Health check
curl http://localhost:8000/api/v1/chatbot/health

# Test d'une question
curl -X POST "http://localhost:8000/api/v1/chatbot/query" \
  -H "Content-Type: application/json" \
  -d '{"question": "Qui était Jésus?"}'
```

## 📱 Étape 3 : Configurer l'App Mobile

### 3.1 Mettre à jour l'URL dans `.env`

```bash
cd samaquete-mobile
# Éditer .env
EXPO_PUBLIC_ASSISTANT_API_URL=http://localhost:8000
```

### 3.2 Si vous utilisez ngrok (pour tester depuis un appareil physique)

```bash
# Dans un nouveau terminal
ngrok http 8000

# Copier l'URL ngrok (ex: https://abc123.ngrok-free.app)
# Mettre à jour .env
EXPO_PUBLIC_ASSISTANT_API_URL=https://abc123.ngrok-free.app
```

### 3.3 Redémarrer l'app mobile

```bash
cd samaquete-mobile
npm start
```

## 🧪 Étape 4 : Tester

1. **Ouvrir l'app mobile** dans Expo Go
2. **Aller dans l'Assistant Spirituel**
3. **Poser une question** : "Qui était Jésus?"
4. **Vérifier la réponse** avec références bibliques

## 📊 Vérification

### Vérifier les services Docker

```bash
docker-compose ps
```

Vous devriez voir :
- `web` (port 8000) - API FastAPI
- `db` (PostgreSQL)
- `redis` (Cache)
- `worker` (Tâches asynchrones)

### Vérifier les logs

```bash
# Logs de l'API
docker-compose logs web

# Logs de tous les services
docker-compose logs
```

### Accéder à la documentation API

Ouvrir dans votre navigateur :
- **Swagger UI** : http://localhost:8000/docs
- **ReDoc** : http://localhost:8000/redoc

## 🔧 Dépannage

### Le RAG ne démarre pas

1. Vérifier que `GOOGLE_API_KEY` est défini dans `.env`
2. Vérifier les logs : `docker-compose logs web`
3. Vérifier que les ports 8000, 5432, 6379 ne sont pas utilisés

### Erreur "RAG indexes not found"

L'initialisation est en cours. Attendre 5-10 minutes et vérifier les logs :
```bash
docker-compose logs -f web
```

### L'app mobile ne se connecte pas

1. Vérifier que le RAG est accessible : `curl http://localhost:8000/api/v1/chatbot/health`
2. Si vous utilisez ngrok, vérifier que l'URL est correcte dans `.env`
3. Vérifier les logs de l'app mobile dans Expo

### Erreur "Quota exceeded"

Votre clé Google API a atteint sa limite (15 req/min, 1500/jour). Solutions :
- Attendre la réinitialisation du quota (quotidien)
- Créer une nouvelle clé API
- Passer à un plan payant

## 📝 Commandes Utiles

```bash
# Arrêter les services
docker-compose down

# Redémarrer les services
docker-compose restart

# Voir les logs en temps réel
docker-compose logs -f web

# Accéder au shell du container
docker-compose exec web bash

# Réinitialiser les indexes RAG (si nécessaire)
docker-compose down -v
docker-compose up -d
```

## ✅ Checklist

- [ ] Clé API Google configurée dans `rag-system/src/.env`
- [ ] Images Docker construites (`docker-compose build`)
- [ ] Services démarrés (`docker-compose up -d`)
- [ ] Initialisation RAG terminée (vérifier les logs)
- [ ] Health check OK (`curl http://localhost:8000/api/v1/chatbot/health`)
- [ ] URL configurée dans `samaquete-mobile/.env`
- [ ] App mobile redémarrée
- [ ] Test réussi depuis l'app mobile

## 🎯 Prochaines Étapes

Une fois que tout fonctionne :
1. ✅ Tester plusieurs questions depuis l'app mobile
2. ✅ Vérifier la qualité des réponses
3. ✅ Configurer ngrok pour l'accès mobile (si nécessaire)
4. ✅ Préparer le déploiement en production

