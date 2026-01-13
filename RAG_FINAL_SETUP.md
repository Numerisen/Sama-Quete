# ✅ Configuration Finale du RAG - Checklist

## 📋 État Actuel

✅ **Repository RAG cloné** : `rag-system/`  
✅ **Fichier `.env` créé** : `rag-system/src/.env`  
✅ **App mobile adaptée** : `assistantService.ts` mis à jour  
✅ **Format de réponse adapté** : Extraction des sources et références bibliques

## ⚠️ Action Requise : Configurer la Clé API Google

**ÉTAPE CRITIQUE** : Vous devez ajouter votre clé API Google dans le fichier `.env` :

```bash
cd rag-system/src
nano .env  # ou votre éditeur préféré
```

**Modifier cette ligne** :
```env
GOOGLE_API_KEY=votre_vraie_cle_google_api_ici
```

**Obtenir une clé** :
1. Aller sur https://aistudio.google.com/apikey
2. Cliquer sur "Create API Key"
3. Copier la clé générée
4. Coller dans `rag-system/src/.env`

## 🚀 Démarrage

### 1. Construire les images Docker

```bash
cd rag-system
docker-compose build
```

### 2. Démarrer les services

```bash
docker-compose up -d
```

**Premier démarrage** : Attendre 5-10 minutes pour l'initialisation RAG.

**Suivre les logs** :
```bash
docker-compose logs -f web
```

### 3. Vérifier que tout fonctionne

```bash
# Health check
curl http://localhost:8000/api/v1/chatbot/health

# Test d'une question
curl -X POST "http://localhost:8000/api/v1/chatbot/query" \
  -H "Content-Type: application/json" \
  -d '{"question": "Qui était Jésus?"}'
```

## 📱 Configuration App Mobile

### Mettre à jour l'URL

```bash
# Dans samaquete-mobile/.env
EXPO_PUBLIC_ASSISTANT_API_URL=http://localhost:8000
```

### Si vous utilisez ngrok

```bash
# Démarrer ngrok
ngrok http 8000

# Mettre à jour .env avec l'URL ngrok
EXPO_PUBLIC_ASSISTANT_API_URL=https://votre-url-ngrok.ngrok-free.app
```

## 🎯 Format de Réponse du RAG

Le RAG FastAPI retourne :

```json
{
  "question": "Qui était Jésus?",
  "answer": "...",
  "sources": [
    {
      "reference": "Matthieu 1:1",
      "text": "...",
      "score": 0.95,
      "type": "verse"
    }
  ],
  "source_count": 5
}
```

L'app mobile adapte automatiquement ce format pour :
- Extraire les références bibliques depuis `sources[].reference`
- Créer une liste de sources pour l'affichage
- Calculer la confiance basée sur `source_count`

## ✅ Checklist Finale

- [ ] Clé API Google configurée dans `rag-system/src/.env`
- [ ] Images Docker construites
- [ ] Services démarrés (`docker-compose up -d`)
- [ ] Initialisation RAG terminée (vérifier logs)
- [ ] Health check OK
- [ ] URL configurée dans `samaquete-mobile/.env`
- [ ] App mobile redémarrée
- [ ] Test réussi depuis l'app mobile

## 📚 Documentation

- **Guide complet** : `RAG_QUICK_START.md`
- **Intégration mobile** : `RAG_MOBILE_INTEGRATION.md`
- **Comparaison systèmes** : `RAG_COMPARISON.md`

