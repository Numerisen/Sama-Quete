# 🚀 Guide de Déploiement - SamaQuête

Ce guide vous explique comment déployer l'application SamaQuête en production.

## 📋 Table des Matières

- [🌐 Déploiement Web (Next.js)](#-déploiement-web-nextjs)
- [📱 Déploiement Mobile (Expo)](#-déploiement-mobile-expo)
- [🔥 Configuration Firebase](#-configuration-firebase)
- [🔒 Variables d'Environnement](#-variables-denvironnement)
- [📊 Monitoring](#-monitoring)

## 🌐 Déploiement Web (Next.js)

### 1. Vercel (Recommandé)

#### Configuration Vercel
```bash
# Installer Vercel CLI
npm install -g vercel

# Se déplacer dans le dossier admin
cd samaquete-admin

# Déployer
vercel

# Suivre les instructions
```

#### Configuration des Variables d'Environnement
```bash
# Dans le dashboard Vercel
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
# ... autres variables
```

### 2. Netlify

#### Configuration Netlify
```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Build de production
npm run build

# Déployer
netlify deploy --prod --dir=out
```

### 3. Docker

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm ci --only=production

# Copier le code source
COPY . .

# Build de production
RUN npm run build

# Exposer le port
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  samaquete-admin:
    build: ./samaquete-admin
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_FIREBASE_API_KEY=${FIREBASE_API_KEY}
      - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN}
      - NEXT_PUBLIC_FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
    restart: unless-stopped
```

## 📱 Déploiement Mobile (Expo)

### 1. Expo Application Services (EAS)

#### Installation EAS CLI
```bash
npm install -g @expo/eas-cli

# Se connecter à Expo
eas login
```

#### Configuration EAS
```bash
# Se déplacer dans le dossier mobile
cd samaquete-mobile

# Initialiser EAS
eas build:configure
```

#### Configuration eas.json
```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      }
    }
  }
}
```

#### Build de Production
```bash
# Build Android
eas build --platform android --profile production

# Build iOS
eas build --platform ios --profile production

# Build pour les deux plateformes
eas build --platform all --profile production
```

### 2. Google Play Store

#### Préparation
```bash
# Build AAB
eas build --platform android --profile production

# Télécharger le fichier AAB
# Aller sur Google Play Console
# Créer une nouvelle version
# Uploader le fichier AAB
```

#### Configuration Google Play Console
1. Créer un compte développeur Google Play
2. Créer une nouvelle application
3. Remplir les informations de l'application
4. Uploader le fichier AAB
5. Configurer les paramètres de l'application
6. Soumettre pour révision

### 3. Apple App Store

#### Préparation
```bash
# Build iOS
eas build --platform ios --profile production

# Télécharger le fichier IPA
# Aller sur App Store Connect
# Créer une nouvelle version
# Uploader le fichier IPA
```

#### Configuration App Store Connect
1. Créer un compte développeur Apple
2. Créer une nouvelle application
3. Remplir les informations de l'application
4. Uploader le fichier IPA
5. Configurer les paramètres de l'application
6. Soumettre pour révision

## 🔥 Configuration Firebase

### 1. Configuration de Production

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les paroisses
    match /parishes/{parishId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.token.role in ['admin', 'diocese_admin'];
    }
    
    // Règles pour les dons
    match /donations/{donationId} {
      allow read, write: if request.auth != null;
      allow read: if resource.data.userId == request.auth.uid;
    }
    
    // Règles pour les utilisateurs
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // Règles pour les actualités
    match /news/{newsId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.token.role in ['admin', 'diocese_admin'];
    }
  }
}
```

#### Configuration Authentication
```javascript
// Configuration des fournisseurs d'authentification
const authConfig = {
  emailPassword: {
    enabled: true,
    requireEmailVerification: true
  },
  phoneAuth: {
    enabled: true,
    testPhoneNumbers: ['+221701234567']
  }
};
```

### 2. Configuration des Notifications Push

#### Firebase Cloud Messaging
```javascript
// Configuration FCM
const messaging = getMessaging(app);

// Demander la permission
const requestPermission = async () => {
  const permission = await requestPermission();
  if (permission === 'granted') {
    const token = await getToken(messaging);
    console.log('FCM Token:', token);
  }
};
```

## 🔒 Variables d'Environnement

### Production

#### Mobile (.env.production)
```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_production_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_production_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_production_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_production_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_production_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_production_app_id
EXPO_PUBLIC_API_BASE_URL=https://api.samaquete.sn
EXPO_PUBLIC_ENVIRONMENT=production
```

#### Web (.env.production)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_production_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_production_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_production_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_production_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_production_app_id
NEXT_PUBLIC_API_BASE_URL=https://api.samaquete.sn
NODE_ENV=production
```

## 📊 Monitoring

### 1. Sentry (Recommandé)

#### Configuration Sentry
```bash
# Installer Sentry
npm install @sentry/react-native @sentry/nextjs

# Configuration mobile
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: 'production',
});

# Configuration web
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: 'production',
});
```

### 2. Firebase Analytics

#### Configuration Analytics
```javascript
import { getAnalytics, logEvent } from 'firebase/analytics';

const analytics = getAnalytics(app);

// Événements personnalisés
logEvent(analytics, 'donation_completed', {
  amount: 5000,
  currency: 'XOF',
  parish: 'Saint-Pierre'
});
```

### 3. Logs et Monitoring

#### Configuration des Logs
```javascript
// Configuration des logs
const logger = {
  info: (message, data) => {
    console.log(`[INFO] ${message}`, data);
    // Envoyer vers un service de logging
  },
  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error);
    // Envoyer vers Sentry
    Sentry.captureException(error);
  }
};
```

## 🚀 Scripts de Déploiement

### Script de Déploiement Complet
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Déploiement de SamaQuête..."

# Build de production
echo "📦 Building applications..."
npm run build:all

# Déploiement web
echo "🌐 Deploying web application..."
cd samaquete-admin
vercel --prod

# Déploiement mobile
echo "📱 Building mobile application..."
cd ../samaquete-mobile
eas build --platform all --profile production

echo "✅ Déploiement terminé!"
```

### Script de Rollback
```bash
#!/bin/bash
# rollback.sh

echo "🔄 Rollback de SamaQuête..."

# Rollback web
echo "🌐 Rolling back web application..."
cd samaquete-admin
vercel rollback

# Rollback mobile
echo "📱 Rolling back mobile application..."
cd ../samaquete-mobile
eas build:list
# Sélectionner la version précédente

echo "✅ Rollback terminé!"
```

## 🔐 Sécurité

### 1. Configuration HTTPS
- Utiliser HTTPS en production
- Configurer les certificats SSL
- Rediriger HTTP vers HTTPS

### 2. Configuration CORS
```javascript
// Configuration CORS
const corsOptions = {
  origin: ['https://samaquete.sn', 'https://admin.samaquete.sn'],
  credentials: true,
  optionsSuccessStatus: 200
};
```

### 3. Configuration des Headers de Sécurité
```javascript
// Headers de sécurité
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  }
];
```

## 📈 Performance

### 1. Optimisation des Images
- Utiliser des formats modernes (WebP, AVIF)
- Implémenter le lazy loading
- Optimiser la taille des images

### 2. Optimisation du Code
- Minifier le JavaScript et CSS
- Utiliser le code splitting
- Implémenter le caching

### 3. Optimisation de la Base de Données
- Créer des index appropriés
- Optimiser les requêtes
- Implémenter la pagination

---

## 🆘 Support

En cas de problème lors du déploiement :

1. Vérifiez les logs d'erreur
2. Consultez la documentation des services utilisés
3. Contactez l'équipe de développement
4. Ouvrez une issue sur GitHub

---

**Bonne chance pour votre déploiement ! 🚀**
