# 🤖 Guide d'Installation - Assistant IA Biblique

## 📋 Vue d'ensemble

Ce guide vous accompagne dans l'installation et la configuration de l'assistant IA biblique pour SamaQuete, avec intégration des meilleurs modèles de langage (LLM) pour des réponses précises basées sur la Bible.

## 🎯 LLM Recommandés

### 1. **Claude 3.5 Sonnet (Anthropic) - RECOMMANDÉ**
- **Avantages** : Excellent pour les textes religieux, très précis
- **Coût** : ~$3/million tokens entrée, ~$15/million tokens sortie
- **Qualité** : ⭐⭐⭐⭐⭐

### 2. **GPT-4o (OpenAI) - Alternative**
- **Avantages** : Large écosystème, intégration facile
- **Coût** : ~$2.50/million tokens entrée, ~$10/million tokens sortie
- **Qualité** : ⭐⭐⭐⭐

### 3. **Llama 3.1 70B (Meta) - Open Source**
- **Avantages** : Gratuit, contrôle total
- **Coût** : Gratuit (coûts d'infrastructure)
- **Qualité** : ⭐⭐⭐

## 🚀 Installation Rapide

### Étape 1 : Installation des dépendances

```bash
# Installer les dépendances Python
pip install -r requirements_assistant.txt

# Ou avec conda
conda create -n assistant-ia python=3.9
conda activate assistant-ia
pip install -r requirements_assistant.txt
```

### Étape 2 : Configuration des API Keys

```bash
# Copier le fichier d'exemple
cp env_example.txt .env

# Éditer le fichier .env avec vos clés
nano .env
```

**Contenu du fichier .env :**
```env
# Anthropic Claude (Recommandé)
ANTHROPIC_API_KEY=sk-ant-api03-...

# OpenAI GPT-4 (Alternative)
OPENAI_API_KEY=sk-...

# Configuration du serveur
FLASK_ENV=development
FLASK_DEBUG=True
PORT=8000
```

### Étape 3 : Obtenir les API Keys

#### Pour Claude (Anthropic) :
1. Aller sur [console.anthropic.com](https://console.anthropic.com)
2. Créer un compte
3. Générer une clé API
4. **Coût estimé** : $5-20/mois pour 1000 utilisateurs

#### Pour OpenAI :
1. Aller sur [platform.openai.com](https://platform.openai.com)
2. Créer un compte
3. Ajouter des crédits ($5 minimum)
4. Générer une clé API
5. **Coût estimé** : $3-15/mois pour 1000 utilisateurs

### Étape 4 : Démarrer le serveur

```bash
# Démarrer l'assistant IA
python assistant_biblique_enhanced.py
```

Vous devriez voir :
```
🚀 Démarrage de l'Assistant Biblique IA
📚 Modèles disponibles:
   - Claude 3.5 Sonnet: ✅
   - GPT-4o: ✅
🌐 Serveur démarré sur http://localhost:8000
```

## 📱 Intégration Mobile

### Étape 1 : Mettre à jour l'écran Assistant

```typescript
// Dans votre App.tsx ou composant principal
import AssistantScreenEnhanced from './src/components/screens/assistant/AssistantScreenEnhanced';

// Remplacer l'ancien AssistantScreen par AssistantScreenEnhanced
```

### Étape 2 : Configuration de l'URL API

```typescript
// Dans lib/assistantService.ts
const API_BASE_URL = 'http://votre-serveur.com:8000'; // URL de production
```

## 💰 Stratégies d'Optimisation des Coûts

### 1. **Cache Intelligent**
- Les réponses sont mises en cache pendant 1 heure
- Réduction des coûts de 60-80%

### 2. **Limitation des Tokens**
- Réponses limitées à 1000 tokens
- Prévention des réponses trop longues

### 3. **Fallback Strategy**
- Claude en priorité (meilleure qualité)
- GPT-4 en fallback (coût réduit)
- Réponse basique si erreur

### 4. **Filtrage des Questions**
```python
# Questions trop courtes ou inappropriées
if len(question) < 5 or question.lower() in ['salut', 'bonjour']:
    return "Veuillez poser une question plus spécifique sur la foi."
```

## 🔧 Configuration Avancée

### Variables d'Environnement

```env
# Configuration des modèles
PREFERRED_MODEL=claude  # claude, gpt4, ou auto
MAX_TOKENS=1000
CACHE_DURATION=3600  # secondes

# Configuration de sécurité
RATE_LIMIT=100  # requêtes par heure par IP
MAX_QUESTION_LENGTH=500

# Configuration de monitoring
ENABLE_LOGGING=true
LOG_LEVEL=INFO
```

### Monitoring et Logs

```python
# Les logs incluent :
# - Questions posées
# - Réponses générées
# - Temps de réponse
# - Coûts par requête
# - Erreurs
```

## 🚀 Déploiement en Production

### Option 1 : Serveur Dédié

```bash
# Installation sur Ubuntu/Debian
sudo apt update
sudo apt install python3-pip nginx

# Installation des dépendances
pip3 install -r requirements_assistant.txt

# Configuration Nginx
sudo nano /etc/nginx/sites-available/assistant-ia
```

**Configuration Nginx :**
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Option 2 : Docker

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements_assistant.txt .
RUN pip install -r requirements_assistant.txt

COPY . .
EXPOSE 8000

CMD ["python", "assistant_biblique_enhanced.py"]
```

```bash
# Build et run
docker build -t assistant-ia .
docker run -p 8000:8000 --env-file .env assistant-ia
```

### Option 3 : Cloud (AWS/GCP/Azure)

**AWS Lambda + API Gateway :**
- Coût : ~$10-30/mois
- Scalabilité automatique
- Pas de gestion de serveur

**Google Cloud Run :**
- Coût : ~$15-40/mois
- Déploiement facile
- Monitoring intégré

## 📊 Monitoring et Analytics

### Métriques Importantes

1. **Performance**
   - Temps de réponse moyen
   - Taux de succès des requêtes
   - Utilisation du cache

2. **Coûts**
   - Tokens utilisés par jour
   - Coût par requête
   - Prévision des coûts mensuels

3. **Qualité**
   - Score de confiance moyen
   - Questions les plus fréquentes
   - Taux de satisfaction utilisateur

### Dashboard de Monitoring

```python
# Endpoint de statistiques
GET /api/assistant/stats

# Réponse
{
  "cached_responses": 150,
  "models_available": {
    "claude": true,
    "gpt4": true
  },
  "daily_requests": 45,
  "average_response_time": 2.3,
  "total_cost_today": 0.85
}
```

## 🔒 Sécurité

### Mesures Implémentées

1. **Rate Limiting** : 100 requêtes/heure par IP
2. **Validation des entrées** : Filtrage des questions inappropriées
3. **Logs de sécurité** : Traçabilité des requêtes
4. **HTTPS** : Chiffrement des communications

### Recommandations

```python
# Ajouter à votre configuration
SECRET_KEY = "votre-clé-secrète"
ALLOWED_ORIGINS = ["https://votre-app.com"]
MAX_QUESTION_LENGTH = 500
```

## 🆘 Dépannage

### Problèmes Courants

**1. Erreur de connexion API**
```bash
# Vérifier les clés API
echo $ANTHROPIC_API_KEY
echo $OPENAI_API_KEY

# Tester la connexion
curl -X POST http://localhost:8000/api/assistant/query \
  -H "Content-Type: application/json" \
  -d '{"question": "Test"}'
```

**2. Coûts trop élevés**
- Activer le cache
- Réduire MAX_TOKENS
- Implémenter le rate limiting

**3. Réponses de mauvaise qualité**
- Vérifier le contexte biblique
- Ajuster la température du modèle
- Améliorer les prompts

### Support

- **Logs** : Vérifier les logs du serveur
- **Tests** : Utiliser l'endpoint `/health`
- **Monitoring** : Surveiller les métriques

## 📈 Évolutions Futures

### Améliorations Prévues

1. **Base de données biblique locale**
   - Réduction des coûts
   - Réponses plus rapides
   - Contrôle total

2. **Fine-tuning du modèle**
   - Entraînement sur des textes catholiques
   - Meilleure compréhension du contexte

3. **Interface d'administration**
   - Gestion des questions fréquentes
   - Monitoring en temps réel
   - Configuration des modèles

4. **Intégration multilingue**
   - Support Wolof, Français, Anglais
   - Réponses contextuelles par langue

---

## 🎉 Félicitations !

Votre assistant IA biblique est maintenant prêt ! Vous avez :

✅ Un serveur Python avec intégration LLM  
✅ Une application mobile connectée  
✅ Des stratégies d'optimisation des coûts  
✅ Un système de monitoring  
✅ Des mesures de sécurité  

**Prochaines étapes :**
1. Tester avec quelques questions
2. Configurer le monitoring
3. Déployer en production
4. Former vos utilisateurs

**Besoin d'aide ?** Consultez les logs ou contactez l'équipe de développement.
