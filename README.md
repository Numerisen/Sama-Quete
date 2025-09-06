# 🕊️ SamaQuête - Plateforme de Gestion des Quêtes Paroissiales

<div align="center">
  <img src="samaquete-mobile/assets/icon.png" alt="SamaQuête Logo" width="120" height="120">
  
  **Une solution complète pour la gestion des quêtes et dons paroissiaux au Sénégal**
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.79.6-blue.svg)](https://reactnative.dev/)
  [![Next.js](https://img.shields.io/badge/Next.js-14.2.30-black.svg)](https://nextjs.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-12.2.1-orange.svg)](https://firebase.google.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
  [![Expo](https://img.shields.io/badge/Expo-53.0.22-purple.svg)](https://expo.dev/)
</div>

## 📋 Table des Matières

- [🎯 Aperçu du Projet](#-aperçu-du-projet)
- [🏗️ Architecture](#️-architecture)
- [✨ Fonctionnalités](#-fonctionnalités)
- [🚀 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [📱 Développement Mobile](#-développement-mobile)
- [🌐 Développement Web](#-développement-web)
- [🔥 Configuration Firebase](#-configuration-firebase)
- [🎨 Thèmes](#-thèmes)
- [📁 Structure du Projet](#-structure-du-projet)
- [🤝 Contribution](#-contribution)
- [📄 Licence](#-licence)

## 🎯 Aperçu du Projet

SamaQuête est une plateforme complète de gestion des quêtes paroissiales développée spécifiquement pour l'Église catholique au Sénégal. Le projet comprend :

- **📱 Application Mobile** : Interface utilisateur pour les fidèles
- **🌐 Panel d'Administration** : Interface de gestion pour les administrateurs
- **🔥 Backend Firebase** : Base de données et authentification

### 🎯 Objectifs

- Digitaliser la collecte des quêtes paroissiales
- Faciliter la gestion des dons et offrandes
- Améliorer la communication entre paroisses et fidèles
- Fournir des statistiques en temps réel
- Assurer la transparence financière

## 🏗️ Architecture

```
SamaQuête/
├── 📱 samaquete-mobile/          # Application React Native/Expo
├── 🌐 samaquete-admin/           # Panel d'administration Next.js
├── 🔥 Firebase/                  # Backend (Firestore + Auth)
└── 📄 Documentation/             # Guides et documentation
```

### 🛠️ Technologies Utilisées

**Mobile (React Native/Expo)**
- React Native 0.79.6
- Expo SDK 53
- TypeScript 5.8.3
- React Native Gesture Handler
- React Native Reanimated
- Expo Linear Gradient

**Web (Next.js)**
- Next.js 14.2.30
- React 18
- TypeScript 5
- Tailwind CSS 3.4.17
- Radix UI Components
- Framer Motion

**Backend**
- Firebase 12.2.1
- Firestore Database
- Firebase Authentication
- Firebase Storage

## ✨ Fonctionnalités

### 📱 Application Mobile

#### 🏠 Dashboard
- Vue d'ensemble des statistiques personnelles
- Accès rapide aux fonctionnalités principales
- Sélection de paroisse
- Mode sombre/clair

#### 💰 Gestion des Dons
- Types de dons multiples (dominical, spécial, etc.)
- Montants prédéfinis et personnalisés
- Processus de paiement sécurisé
- Historique des transactions

#### 📖 Textes Liturgiques
- Lectures du jour
- Programme de la semaine
- Calendrier liturgique
- Couleurs liturgiques

#### 🤖 Assistant IA Spirituel
- Questions fréquentes
- Réponses basées sur la doctrine catholique
- Interface de chat intuitive

#### 🔔 Notifications
- Notifications push personnalisables
- Actualités paroissiales
- Rappels de quêtes
- Textes liturgiques quotidiens

#### ⚙️ Paramètres
- Profil utilisateur
- Préférences de notifications
- Gestion du thème
- Authentification sécurisée

### 🌐 Panel d'Administration

#### 👥 Gestion des Utilisateurs
- Création et modification des comptes
- Gestion des rôles et permissions
- Suivi des activités

#### 🏛️ Gestion des Paroisses
- Création et configuration des paroisses
- Gestion des diocèses
- Paramétrage des tarifs

#### 💰 Gestion Financière
- Suivi des dons en temps réel
- Rapports financiers détaillés
- Export des données
- Statistiques avancées

#### 📰 Gestion de Contenu
- Actualités paroissiales
- Textes liturgiques
- Notifications push
- Gestion des médias

## 🚀 Installation

### 📋 Prérequis

- **Node.js** : Version 18 ou supérieure
- **npm** ou **yarn** : Gestionnaire de paquets
- **Git** : Contrôle de version
- **Expo CLI** : Pour le développement mobile
- **Android Studio** : Pour le développement Android (optionnel)
- **Xcode** : Pour le développement iOS (macOS uniquement)

### 🔧 Installation des Outils

#### 1. Node.js et npm
```bash
# Vérifier la version de Node.js
node --version  # Doit être >= 18.0.0

# Vérifier npm
npm --version
```

#### 2. Expo CLI
```bash
# Installation globale d'Expo CLI
npm install -g @expo/cli

# Vérifier l'installation
expo --version
```

#### 3. Cloner le Projet
```bash
# Cloner le repository
git clone https://github.com/votre-username/samaquete.git

# Se déplacer dans le dossier
cd samaquete
```

## ⚙️ Configuration

### 📱 Configuration Mobile

#### 1. Installation des Dépendances
```bash
# Se déplacer dans le dossier mobile
cd samaquete-mobile

# Installer les dépendances
npm install

# Ou avec yarn
yarn install
```

#### 2. Configuration Expo
```bash
# Initialiser Expo (si nécessaire)
expo init

# Démarrer le serveur de développement
npm start
# ou
expo start
```

#### 3. Configuration Firebase (Mobile)
```bash
# Copier le fichier de configuration Firebase
cp firebase-config.example.js lib/firebase.ts

# Éditer le fichier avec vos clés Firebase
nano lib/firebase.ts
```

### 🌐 Configuration Web

#### 1. Installation des Dépendances
```bash
# Se déplacer dans le dossier admin
cd samaquete-admin

# Installer les dépendances
npm install

# Ou avec yarn
yarn install
```

#### 2. Configuration Next.js
```bash
# Démarrer le serveur de développement
npm run dev

# Ou avec yarn
yarn dev
```

#### 3. Configuration Firebase (Web)
```bash
# Copier le fichier de configuration Firebase
cp firebase-config.example.js lib/firebase.ts

# Éditer le fichier avec vos clés Firebase
nano lib/firebase.ts
```

## 📱 Développement Mobile

### 🚀 Commandes de Développement

```bash
# Démarrer le serveur de développement
npm start

# Démarrer sur Android
npm run android

# Démarrer sur iOS
npm run ios

# Démarrer sur Web
npm run web
```

### 📱 Test sur Appareil

#### Android
```bash
# Installer Expo Go sur votre téléphone Android
# Scanner le QR code affiché dans le terminal

# Ou utiliser un émulateur Android
expo run:android
```

#### iOS
```bash
# Installer Expo Go sur votre iPhone
# Scanner le QR code affiché dans le terminal

# Ou utiliser le simulateur iOS (macOS uniquement)
expo run:ios
```

### 🔧 Configuration Avancée

#### Variables d'Environnement
```bash
# Créer un fichier .env
touch .env

# Ajouter vos variables
echo "EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key" >> .env
echo "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain" >> .env
echo "EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id" >> .env
```

#### Configuration TypeScript
```bash
# Vérifier la configuration TypeScript
npx tsc --noEmit

# Lancer le linter
npx eslint src/
```

## 🌐 Développement Web

### 🚀 Commandes de Développement

```bash
# Démarrer le serveur de développement
npm run dev

# Build de production
npm run build

# Démarrer en production
npm run start

# Linter
npm run lint
```

### 🌐 Accès à l'Application

- **Développement** : http://localhost:3000
- **Production** : Votre domaine de déploiement

### 🔧 Configuration Avancée

#### Variables d'Environnement
```bash
# Créer un fichier .env.local
touch .env.local

# Ajouter vos variables
echo "NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key" >> .env.local
echo "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain" >> .env.local
echo "NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id" >> .env.local
```

## 🔥 Configuration Firebase

### 1. Créer un Projet Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquer sur "Créer un projet"
3. Suivre les étapes de configuration

### 2. Configuration Firestore

```javascript
// Règles de sécurité Firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les paroisses
    match /parishes/{parishId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Règles pour les dons
    match /donations/{donationId} {
      allow read, write: if request.auth != null;
    }
    
    // Règles pour les utilisateurs
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. Configuration Authentication

1. Aller dans "Authentication" > "Sign-in method"
2. Activer "Email/Password"
3. Configurer les paramètres de sécurité

### 4. Configuration des Clés

#### Mobile (Expo)
```javascript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id"
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);
```

#### Web (Next.js)
```javascript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

## 🎨 Thèmes

### 🌙 Mode Sombre/Clair

L'application supporte les thèmes sombre et clair avec basculement automatique :

#### Configuration du Thème
```typescript
// lib/ThemeContext.tsx
const lightColors = {
  background: '#fefce8',
  surface: '#ffffff',
  card: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  primary: '#f59e0b',
  accent: '#f59e0b',
  header: ['#f59e0b', '#d97706'],
  // ... autres couleurs
};

const darkColors = {
  background: '#0f172a',
  surface: '#1e293b',
  card: '#334155',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  primary: '#22C55E',
  accent: '#f59e0b',
  header: ['#1e293b', '#0f172a'],
  // ... autres couleurs
};
```

#### Utilisation du Thème
```typescript
import { useTheme } from '../lib/ThemeContext';

function MyComponent() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Mon texte</Text>
    </View>
  );
}
```

## 📁 Structure du Projet

### 📱 Mobile (samaquete-mobile/)
```
samaquete-mobile/
├── 📱 App.tsx                    # Point d'entrée principal
├── 📱 app.json                   # Configuration Expo
├── 📱 index.ts                   # Point d'entrée
├── 📁 assets/                    # Images et ressources
├── 📁 hooks/                     # Hooks personnalisés
│   └── useFirebaseData.ts
├── 📁 lib/                       # Utilitaires et configuration
│   ├── firebase.ts              # Configuration Firebase
│   ├── ThemeContext.tsx         # Gestion des thèmes
│   ├── numberFormat.ts          # Formatage des nombres
│   └── dataServices.ts          # Services de données
├── 📁 src/
│   └── 📁 components/
│       └── 📁 screens/          # Écrans de l'application
│           ├── DashboardScreen.tsx
│           ├── AuthScreen.tsx
│           ├── SettingsScreen.tsx
│           ├── 📁 donations/    # Écrans de dons
│           ├── 📁 notifications/ # Écrans de notifications
│           ├── 📁 assistant/    # Assistant IA
│           └── 📁 liturgy/      # Textes liturgiques
└── 📁 ios/                      # Configuration iOS
```

### 🌐 Web (samaquete-admin/)
```
samaquete-admin/
├── 📁 app/                      # Pages Next.js
│   ├── 📁 admin/               # Panel administrateur
│   ├── 📁 admindiocese/        # Panel diocèse
│   └── 📁 login/               # Authentification
├── 📁 components/              # Composants réutilisables
│   ├── 📁 admin/               # Composants admin
│   ├── 📁 auth/                # Composants auth
│   └── 📁 ui/                  # Composants UI
├── 📁 lib/                     # Utilitaires
│   ├── firebase.ts             # Configuration Firebase
│   ├── auth-context.tsx        # Contexte d'authentification
│   └── utils.ts                # Utilitaires
├── 📁 hooks/                   # Hooks personnalisés
├── 📁 public/                  # Fichiers statiques
└── 📁 styles/                  # Styles CSS
```

## 🤝 Contribution

### 🔧 Guide de Contribution

1. **Fork** le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commiter vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pousser vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une **Pull Request**

### 📝 Standards de Code

- Utiliser **TypeScript** pour tous les nouveaux fichiers
- Suivre les conventions de nommage **camelCase**
- Ajouter des commentaires pour les fonctions complexes
- Tester vos modifications avant de soumettre

### 🐛 Signaler un Bug

1. Aller dans l'onglet **Issues**
2. Cliquer sur **New Issue**
3. Sélectionner **Bug Report**
4. Remplir le template fourni

### ✨ Demander une Fonctionnalité

1. Aller dans l'onglet **Issues**
2. Cliquer sur **New Issue**
3. Sélectionner **Feature Request**
4. Décrire la fonctionnalité souhaitée

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe

- **Développeur Principal** : [Votre Nom](https://github.com/votre-username)
- **Designer UI/UX** : [Nom du Designer](https://github.com/designer-username)
- **Contributeurs** : Voir [CONTRIBUTORS.md](CONTRIBUTORS.md)

## 📞 Support

- **Email** : support@samaquete.sn
- **Documentation** : [docs.samaquete.sn](https://docs.samaquete.sn)
- **Issues** : [GitHub Issues](https://github.com/votre-username/samaquete/issues)

## 🙏 Remerciements

- L'Église catholique du Sénégal pour son soutien
- La communauté React Native
- La communauté Next.js
- Tous les contributeurs du projet

---

<div align="center">
  <p>Fait avec ❤️ pour l'Église catholique du Sénégal</p>
  <p>© 2025 SamaQuête. Tous droits réservés.</p>
</div>