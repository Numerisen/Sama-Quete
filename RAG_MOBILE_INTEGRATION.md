# 📱 Intégration RAG FastAPI dans l'App Mobile

## ✅ Modifications Apportées

### 1. `assistantService.ts` - Adapté pour le RAG FastAPI

**Changements principaux** :

- ✅ **Endpoint principal** : `/api/assistant/query` → `/api/v1/chatbot/query`
- ✅ **Format de requête** : Le RAG n'accepte que `{question}`, pas `{question, context}`
- ✅ **Format de réponse** : Adaptation du format RAG au format attendu par l'app
- ✅ **Health check** : `/health` → `/api/v1/chatbot/health`
- ✅ **Suggestions** : Fallback vers suggestions par défaut si endpoint non disponible
- ✅ **Textes du jour** : `/api/text-of-the-day` → `/api/v1/text-of-the-day` (avec fallback)

### 2. `AssistantScreenEnhanced.tsx` - URL par défaut mise à jour

- ✅ URL par défaut : `http://localhost:8000` (RAG FastAPI)
- ✅ Commentaires mis à jour pour refléter l'utilisation du RAG

## 🔧 Configuration

### Variables d'Environnement

**Développement local** :
```bash
# Dans samaquete-mobile/.env
EXPO_PUBLIC_ASSISTANT_API_URL=http://localhost:8000
```

**Avec ngrok** :
```bash
# 1. Démarrer le RAG FastAPI
cd rag-system
docker-compose up -d

# 2. Démarrer ngrok pour exposer le RAG
ngrok http 8000

# 3. Mettre à jour .env avec l'URL ngrok
EXPO_PUBLIC_ASSISTANT_API_URL=https://votre-url-ngrok.ngrok-free.app
```

**Production (EAS Build)** :
```json
// Dans eas.json
{
  "preview": {
    "env": {
      "EXPO_PUBLIC_ASSISTANT_API_URL": "https://votre-rag-production.com"
    }
  },
  "production": {
    "env": {
      "EXPO_PUBLIC_ASSISTANT_API_URL": "https://votre-rag-production.com"
    }
  }
}
```

## 📡 Endpoints RAG FastAPI Utilisés

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/v1/chatbot/query` | POST | Question à l'IA (principal) |
| `/api/v1/chatbot/health` | GET | Health check |
| `/api/v1/chatbot/stats` | GET | Statistiques (optionnel) |
| `/api/v1/text-of-the-day` | GET | Textes liturgiques (optionnel) |

## 🔄 Format de Requête/Réponse

### Requête
```json
{
  "question": "Qui était Jésus?"
}
```

### Réponse RAG (format brut)
```json
{
  "answer": "...",
  "sources": [...],
  "confidence": 0.9,
  "bible_references": [...],
  "timestamp": "..."
}
```

### Réponse Adaptée (format app mobile)
```typescript
{
  answer: string;
  sources: string[];
  confidence: number;
  timestamp: string;
  bible_references?: string[];
  model?: string;
}
```

## 🧪 Test

### 1. Démarrer le RAG FastAPI

```bash
cd rag-system
docker-compose up -d

# Vérifier que c'est démarré
curl http://localhost:8000/api/v1/chatbot/health
```

### 2. Tester depuis l'app mobile

L'app mobile devrait maintenant :
- ✅ Se connecter directement au RAG FastAPI
- ✅ Envoyer les questions au bon endpoint
- ✅ Recevoir et afficher les réponses du RAG
- ✅ Afficher les références bibliques si disponibles

### 3. Vérifier les logs

Dans l'app mobile, vous devriez voir :
```
🔗 RAG FastAPI URL configurée: http://localhost:8000
```

## ⚠️ Notes Importantes

1. **Pas d'adaptateur Flask nécessaire** : L'app appelle directement le RAG FastAPI
2. **Format de réponse adapté automatiquement** : Le service adapte le format RAG au format attendu
3. **Fallback pour suggestions** : Si l'endpoint suggestions n'existe pas, utilise des suggestions par défaut
4. **Health check amélioré** : Essaie plusieurs endpoints pour vérifier la disponibilité

## 🚀 Prochaines Étapes

1. **Cloner le repository RAG** (quand la connexion sera rétablie)
2. **Configurer le RAG** avec `GOOGLE_API_KEY`
3. **Démarrer le RAG** avec Docker
4. **Configurer ngrok** si nécessaire pour l'app mobile
5. **Tester** l'intégration complète

## 📝 Checklist

- [x] `assistantService.ts` adapté pour `/api/v1/chatbot/query`
- [x] Format de requête adapté (seulement `{question}`)
- [x] Format de réponse adapté automatiquement
- [x] Health check mis à jour
- [x] Suggestions avec fallback
- [x] Textes du jour avec fallback
- [x] URL par défaut mise à jour dans `AssistantScreenEnhanced.tsx`
- [ ] Cloner le repository RAG
- [ ] Configurer et démarrer le RAG
- [ ] Tester l'intégration complète

