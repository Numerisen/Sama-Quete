# 🚀 Guide de Déploiement du RAG en Production

## ⚠️ Problème Actuel

**Ngrok n'est PAS adapté pour la production** car :
- ❌ L'URL change à chaque redémarrage
- ❌ Instable et peut expirer
- ❌ Non accessible par d'autres utilisateurs
- ❌ Limite de bande passante

## ✅ Solutions Recommandées

### Option 1 : Railway (Recommandé - Simple et Rapide)

**Avantages :**
- ✅ Déploiement Docker en 1 clic
- ✅ PostgreSQL et Redis inclus
- ✅ URL HTTPS automatique
- ✅ Gratuit pour commencer
- ✅ Configuration simple

**Étapes :**

1. **Créer un compte Railway** : https://railway.app
2. **Connecter votre repo GitHub**
3. **Créer un nouveau projet**
4. **Ajouter les services :**
   - PostgreSQL (base de données)
   - Redis (cache)
   - Docker (pour le RAG FastAPI)

5. **Configurer les variables d'environnement :**
   ```env
   ENVIRONMENT=production
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=[généré par Railway]
   POSTGRES_SERVER=postgres
   POSTGRES_DB=railway
   REDIS_HOST=redis
   REDIS_PORT=6379
   GOOGLE_API_KEY=[votre clé Google AI]
   SECRET_KEY=[générer avec: openssl rand -hex 32]
   ```

6. **Déployer** : Railway détectera automatiquement le `docker-compose.yml`

7. **Obtenir l'URL** : Railway fournira une URL HTTPS stable (ex: `https://rag-api-production.up.railway.app`)

### Option 2 : Render (Alternative)

**Avantages :**
- ✅ Gratuit pour commencer
- ✅ Support Docker
- ✅ PostgreSQL et Redis disponibles

**Étapes similaires à Railway**

### Option 3 : AWS / Google Cloud / Azure

**Pour une solution plus robuste mais plus complexe**

## 📝 Configuration Après Déploiement

Une fois le RAG déployé avec une URL stable (ex: `https://rag-api-production.up.railway.app`), mettre à jour :

### 1. `eas.json`
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_ASSISTANT_API_URL": "https://rag-api-production.up.railway.app"
      }
    }
  }
}
```

### 2. `.env` (pour développement local)
```env
EXPO_PUBLIC_ASSISTANT_API_URL=https://rag-api-production.up.railway.app
```

## 🔍 Vérification

Après déploiement, tester :
```bash
curl https://rag-api-production.up.railway.app/api/v1/chatbot/health
```

Devrait retourner :
```json
{"status":"healthy","initialized":true,...}
```

