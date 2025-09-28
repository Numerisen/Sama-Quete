# 📖 Guide de Configuration - API des Textes Liturgiques

## 🎯 Vue d'ensemble

Ce guide vous accompagne pour configurer l'intégration de votre API Python de textes liturgiques avec votre application mobile Sama-Quete.

## 📋 Prérequis

- ✅ Node.js installé
- ✅ Python installé
- ✅ ngrok installé (`brew install ngrok/ngrok/ngrok`)
- ✅ Votre API Python fonctionnelle

## 🚀 Étapes de Configuration

### 1. Cloner et Configurer l'API Python

```bash
# Cloner votre repository API
git clone https://github.com/Numerisen/TextOfTheDay.git
cd TextOfTheDay

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # macOS/Linux
# ou venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt
```

### 2. Lancer l'API Python

```bash
# Dans le dossier TextOfTheDay
python app.py
```

Votre API devrait être accessible sur `http://localhost:5000`

### 3. Exposer l'API avec ngrok

```bash
# Dans un nouveau terminal
ngrok http 5000
```

Vous obtiendrez une URL comme : `https://abc123.ngrok.io`

### 4. Configurer l'Application Mobile

#### Option A : Configuration Automatique (Recommandée)

```typescript
// Dans votre composant React Native
import { useLiturgyApi } from '../hooks/useLiturgyApi';

function MyComponent() {
  const { 
    todayLiturgy, 
    loading, 
    error, 
    setApiUrl, 
    forceSync 
  } = useLiturgyApi();

  // Configurer l'URL ngrok
  useEffect(() => {
    setApiUrl('https://votre-url-ngrok.ngrok.io');
  }, []);

  // Utiliser les données
  if (loading) return <Text>Chargement...</Text>;
  if (error) return <Text>Erreur: {error.message}</Text>;
  if (todayLiturgy) {
    return (
      <View>
        <Text>{todayLiturgy.title}</Text>
        <Text>{todayLiturgy.gospel}</Text>
        {/* ... */}
      </View>
    );
  }
}
```

#### Option B : Configuration Manuelle

```typescript
// Modifier le fichier lib/liturgyApiService.ts
const LITURGY_API_CONFIG = {
  BASE_URL: 'https://votre-url-ngrok.ngrok.io', // Votre URL ngrok
  // ... reste de la configuration
};
```

### 5. Tester la Configuration

```bash
# Dans le dossier samaquete-mobile
node lib/test-liturgy-api.js
```

## 🔧 Configuration Avancée

### Gestion des Environnements

```typescript
import { liturgyConfigManager } from '../lib/liturgyConfig';

// Basculer entre les environnements
await liturgyConfigManager.setEnvironment('ngrok');
await liturgyConfigManager.setNgrokUrl('https://votre-url.ngrok.io');

// Ou pour la production
await liturgyConfigManager.setEnvironment('production');
```

### Gestion des Erreurs

```typescript
const { todayLiturgy, error, isOnline, refresh } = useLiturgyApi();

if (error) {
  switch (error.code) {
    case 'NETWORK_ERROR':
      // Pas de connexion internet
      break;
    case 'API_ERROR':
      // API indisponible, utiliser le cache
      break;
    case 'CACHE_ERROR':
      // Problème de cache local
      break;
  }
}
```

## 📱 Utilisation dans l'App

### Récupération du Texte du Jour

```typescript
import { useLiturgyApi } from '../hooks/useLiturgyApi';

function LiturgyScreen() {
  const { 
    todayLiturgy, 
    loading, 
    error, 
    refresh,
    forceSync 
  } = useLiturgyApi();

  return (
    <ScrollView>
      {loading && <ActivityIndicator />}
      
      {error && (
        <View>
          <Text>Erreur: {error.message}</Text>
          <Button title="Réessayer" onPress={refresh} />
        </View>
      )}
      
      {todayLiturgy && (
        <View>
          <Text style={styles.title}>{todayLiturgy.title}</Text>
          <Text style={styles.date}>{todayLiturgy.date}</Text>
          
          <Text style={styles.sectionTitle}>Première Lecture</Text>
          <Text style={styles.text}>{todayLiturgy.firstReading}</Text>
          
          <Text style={styles.sectionTitle}>Psaume</Text>
          <Text style={styles.text}>{todayLiturgy.psalm}</Text>
          
          <Text style={styles.sectionTitle}>Évangile</Text>
          <Text style={styles.text}>{todayLiturgy.gospel}</Text>
          
          <Text style={styles.sectionTitle}>Réflexion</Text>
          <Text style={styles.text}>{todayLiturgy.reflection}</Text>
        </View>
      )}
      
      <Button title="Synchroniser" onPress={forceSync} />
    </ScrollView>
  );
}
```

### Synchronisation Automatique

```typescript
// La synchronisation se fait automatiquement :
// - Au démarrage de l'app
// - Toutes les heures
// - Lors de la synchronisation forcée
```

## 🐛 Dépannage

### Problèmes Courants

1. **API non accessible**
   - Vérifiez que l'API Python fonctionne : `curl http://localhost:5000/health`
   - Vérifiez l'URL ngrok

2. **Erreur de CORS**
   - Ajoutez les headers CORS dans votre API Python
   ```python
   from flask_cors import CORS
   app = Flask(__name__)
   CORS(app)
   ```

3. **Cache non mis à jour**
   - Forcez la synchronisation : `forceSync()`
   - Videz le cache : `AsyncStorage.clear()`

4. **ngrok URL change**
   - ngrok génère une nouvelle URL à chaque redémarrage
   - Mettez à jour l'URL dans l'app

### Logs de Debug

```typescript
// Activer les logs détaillés
console.log('Configuration:', liturgyConfigManager.getDebugInfo());
console.log('Statut:', await liturgyApiService.getLastSyncStatus());
```

## 🚀 Déploiement en Production

### Option 1 : Railway (Recommandé)

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Déployer
railway login
railway init
railway up
```

### Option 2 : Heroku

```bash
# Installer Heroku CLI
# Créer un Procfile
echo "web: python app.py" > Procfile

# Déployer
heroku create votre-api-liturgie
git push heroku main
```

### Option 3 : Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel --prod
```

## 📊 Monitoring

### Métriques Importantes

- ✅ Taux de succès des appels API
- ✅ Temps de réponse
- ✅ Utilisation du cache
- ✅ Erreurs de synchronisation

### Alertes Recommandées

- API indisponible > 5 minutes
- Taux d'erreur > 10%
- Cache non mis à jour > 24h

## 🔒 Sécurité

### Bonnes Pratiques

- ✅ Utiliser HTTPS en production
- ✅ Valider les données reçues
- ✅ Limiter le taux de requêtes
- ✅ Chiffrer les données sensibles

### Headers de Sécurité

```python
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response
```

## 📞 Support

En cas de problème :

1. Vérifiez les logs de l'API Python
2. Testez avec `curl` ou Postman
3. Vérifiez la configuration ngrok
4. Consultez les logs de l'app mobile

---

**🎉 Félicitations !** Votre API de textes liturgiques est maintenant intégrée à votre application mobile Sama-Quete.
