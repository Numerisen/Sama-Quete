# 🏛️ SamaQuête - Plateforme de Gestion Paroissiale

Une solution complète pour la gestion des paroisses, diocèses et dons avec une application mobile et un panel d'administration.

## 📱 Applications

### 🖥️ Panel d'Administration (`samaquete-admin`)
- **Framework**: Next.js 14 + TypeScript
- **UI**: Tailwind CSS + Radix UI
- **Backend**: Firebase (Auth + Firestore)
- **Port**: http://localhost:3000

### 📱 Application Mobile (`samaquete-mobile`)
- **Framework**: React Native + Expo
- **UI**: React Native + Expo Linear Gradient
- **Backend**: Firebase (Auth + Firestore)
- **Port**: Expo Dev Server

## 🚀 Installation Rapide

### Prérequis
- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g @expo/cli`)
- Compte Firebase

### 1. Cloner le projet
```bash
git clone [URL_DU_REPO]
cd Sama-Quete
```

### 2. Panel d'Administration
```bash
cd samaquete-admin
npm install
npm run dev
```
➡️ Ouvrir http://localhost:3000

### 3. Application Mobile
```bash
cd samaquete-mobile
npm install
npx expo start
```
➡️ Scanner le QR code avec Expo Go

## 🔥 Configuration Firebase

### Projet Firebase
- **Project ID**: `numerisen-14a03`
- **Auth Domain**: `numerisen-14a03.firebaseapp.com`

### Clés API (déjà configurées)
Les clés Firebase sont déjà configurées dans les fichiers :
- `samaquete-admin/lib/firebase.ts`
- `samaquete-mobile/lib/firebase.ts`

### Comptes de Test
- **Super Admin**: `admin@admin.com` / `admin123`
- **Admin Diocèse**: `diocese@diocese.com` / `diocese123`

> 📋 **Note**: Voir `FIREBASE_AUTH_SETUP.md` pour la configuration détaillée des comptes Firebase Auth.

## 📊 Structure Firebase

### Collections Principales

#### 👥 `users`
```typescript
{
  email: string
  displayName: string
  role: 'super_admin' | 'diocese_admin'
  permissions: {
    canManageUsers: boolean
    canManageDioceses: boolean
    canManageParishes: boolean
    canManageContent: boolean
    canViewReports: boolean
    canManageDonations: boolean
  }
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 🏛️ `dioceses`
```typescript
{
  name: string
  location: string
  city: string
  type: 'archdiocese' | 'diocese'
  bishop: string
  contactInfo: {
    email: string
    phone: string
    address: string
  }
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### ⛪ `parishes`
```typescript
{
  name: string
  city: string
  dioceseId: string
  dioceseName: string
  priest: string
  email: string
  phone: string
  address: string
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 💰 `donationEvents`
```typescript
{
  title: string
  type: 'quete' | 'denier' | 'cierge' | 'messe'
  description: string
  targetAmount: number
  currentAmount: number
  startDate: Timestamp
  endDate: Timestamp
  parishId: string
  parishName: string
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 💸 `donations`
```typescript
{
  eventId: string
  eventTitle: string
  amount: number
  donorName: string
  donorPhone: string
  paymentMethod: 'mobile_money' | 'bank_transfer' | 'cash'
  parishId: string
  parishName: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 📰 `news`
```typescript
{
  title: string
  content: string
  author: string
  parishId?: string
  dioceseId?: string
  isPublished: boolean
  publishedAt?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 📅 `liturgy`
```typescript
{
  title: string
  content: string
  date: Timestamp
  type: 'mass' | 'prayer' | 'celebration'
  parishId?: string
  dioceseId?: string
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 🔔 `notifications`
```typescript
{
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  targetUsers: string[] // UIDs
  targetParishes: string[] // Parish IDs
  isRead: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

## 🛠️ Scripts Utiles

### Initialisation des Données
```bash
# Créer les profils utilisateurs
cd samaquete-admin
node lib/create-profiles.js

# Initialiser les diocèses
node lib/init-dioceses.js

# Initialiser les données de test
node lib/init-donation-data.js
```

### Tests de Connexion
```bash
# Tester Firebase Admin
cd samaquete-admin
node lib/test-firebase-data.js

# Tester Firebase Mobile
cd samaquete-mobile
node lib/test-mobile-parishes.js
```

## 📱 Fonctionnalités

### Panel d'Administration
- ✅ Authentification et autorisation
- ✅ Gestion des utilisateurs et rôles
- ✅ Gestion des diocèses
- ✅ Gestion des paroisses
- ✅ Système de dons complet
- ✅ Tableau de bord avec statistiques
- ✅ Gestion du contenu (actualités, liturgie)
- ✅ Notifications

### Application Mobile
- ✅ Interface utilisateur moderne
- ✅ Sélection de paroisse
- ✅ Système de dons
- ✅ Actualités paroissiales
- ✅ Calendrier liturgique
- ✅ Assistant spirituel (interface prête)
- ✅ Thème sombre/clair
- ✅ Connexion Firebase

## 🔧 Développement

### Structure du Projet
```
Sama-Quete/
├── samaquete-admin/          # Panel d'administration
│   ├── app/                  # Pages Next.js
│   ├── components/           # Composants React
│   ├── lib/                  # Services et utilitaires
│   └── public/               # Assets statiques
├── samaquete-mobile/         # Application mobile
│   ├── src/                  # Code source
│   ├── lib/                  # Services Firebase
│   ├── hooks/                # Hooks React
│   └── assets/               # Images et icônes
└── README.md                 # Cette documentation
```

### Commandes de Développement
```bash
# Admin - Mode développement
cd samaquete-admin
npm run dev

# Admin - Build de production
npm run build
npm start

# Mobile - Développement
cd samaquete-mobile
npx expo start

# Mobile - Build Android
npx expo build:android

# Mobile - Build iOS
npx expo build:ios
```

## 🚨 Résolution de Problèmes

### Erreurs Firebase Index
Si vous voyez des erreurs d'index Firestore :
1. Allez sur [Firebase Console](https://console.firebase.google.com)
2. Cliquez sur les liens d'erreur pour créer les index automatiquement
3. Ou utilisez les requêtes sans `orderBy` (déjà implémenté)

### Problèmes Expo
```bash
# Nettoyer le cache
npx expo start --clear

# Réinstaller les dépendances
rm -rf node_modules
npm install
```

### Problèmes de Connexion Firebase
1. Vérifiez que les clés API sont correctes
2. Vérifiez les règles Firestore
3. Testez avec les scripts de test fournis

## 📞 Support

Pour toute question ou problème :
1. Vérifiez cette documentation
2. Consultez les logs dans la console
3. Utilisez les scripts de test pour diagnostiquer

## 🎯 Prochaines Étapes

- [ ] Intégration système de paiement
- [ ] Notifications push
- [ ] Assistant IA spirituel
- [ ] Rapports avancés
- [ ] Export de données
- [ ] API REST pour intégrations externes

---

**Développé avec ❤️ pour la communauté paroissiale**