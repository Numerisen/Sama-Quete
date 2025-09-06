# Connexion Admin-Mobile avec Firebase

## 📋 Configuration de la Connexion

### 1. Configuration Firebase

La connexion entre l'admin et le mobile utilise le même projet Firebase. Assurez-vous que :

1. **Le projet Firebase est configuré** dans l'admin (voir `samaquete-admin/FIREBASE_SETUP.md`)
2. **Les mêmes clés Firebase** sont utilisées dans le mobile
3. **Firestore est activé** avec les bonnes règles de sécurité

### 2. Mise à jour des clés Firebase

Dans le fichier `lib/firebase.ts`, remplacez les clés par vos vraies clés Firebase :

```typescript
const firebaseConfig = {
  apiKey: "VOTRE_VRAIE_CLE_API",
  authDomain: "numerisen-14a03.firebaseapp.com",
  projectId: "numerisen-14a03",
  storageBucket: "numerisen-14a03.appspot.com",
  messagingSenderId: "VOTRE_VRAIE_CLE_SENDER",
  appId: "VOTRE_VRAIE_CLE_APP"
};
```

### 3. Structure des Données Firestore

Les collections suivantes sont utilisées pour la synchronisation :

#### `parishes` - Paroisses
```javascript
{
  id: "parish_id",
  name: "Paroisse Saint-Pierre",
  location: "Dakar, Sénégal",
  diocese: "Diocèse de Dakar",
  pricing: {
    quete: ["1,000", "2,500", "6,000"],
    denier: ["7,000", "12,000", "20,000"],
    cierge: ["600", "1,200", "2,000"],
    messe: ["10,000", "18,000", "28,000"]
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `news` - Actualités
```javascript
{
  id: "news_id",
  title: "Titre de l'actualité",
  content: "Contenu complet",
  summary: "Résumé",
  parishId: "parish_id", // Optionnel
  dioceseId: "diocese_id", // Optionnel
  imageUrl: "url_image", // Optionnel
  published: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `liturgy` - Liturgie
```javascript
{
  id: "liturgy_id",
  date: "2024-01-15",
  title: "2ème dimanche du temps ordinaire",
  firstReading: "Lecture 1...",
  psalm: "Psaume...",
  secondReading: "Lecture 2...", // Optionnel
  gospel: "Évangile...",
  reflection: "Réflexion...",
  parishId: "parish_id", // Optionnel
  dioceseId: "diocese_id", // Optionnel
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `notifications` - Notifications
```javascript
{
  id: "notification_id",
  title: "Titre de la notification",
  message: "Message de la notification",
  type: "actualites", // actualites, textesLiturgiques, lecturesDuJour, prieresSemaine, dons, evenements
  parishId: "parish_id", // Optionnel
  dioceseId: "diocese_id", // Optionnel
  published: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `donations` - Dons
```javascript
{
  id: "donation_id",
  userId: "user_id",
  parishId: "parish_id",
  type: "quete", // quete, denier, cierge, messe
  amount: 5000,
  customAmount: 5000, // Si montant personnalisé
  message: "Message du donateur", // Optionnel
  status: "completed", // pending, completed, failed
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🔄 Synchronisation en Temps Réel

### Hooks Disponibles

1. **`useParishes()`** - Synchronise les paroisses
2. **`useNews(parishId?)`** - Synchronise les actualités
3. **`useLiturgy(parishId?)`** - Synchronise la liturgie
4. **`useNotifications(parishId?)`** - Synchronise les notifications
5. **`useAppData(parishId?)`** - Hook principal pour toutes les données

### Utilisation dans les Composants

```typescript
import { useAppData } from '../hooks/useFirebaseData';

function MyComponent() {
  const { parishes, news, notifications, loading, error } = useAppData();
  
  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;
  
  return (
    // Votre composant avec les données synchronisées
  );
}
```

## 📱 Écrans Connectés

### DashboardScreen
- ✅ Paroisses synchronisées depuis Firebase
- ✅ Sélection d'église avec données en temps réel
- ✅ Paroisses les plus visitées basées sur les données Firebase

### DonationsScreen
- ✅ Tarifs spécifiques par paroisse depuis Firebase
- ✅ Mise à jour automatique des prix
- ✅ Données de paroisse en temps réel

### NotificationsScreen
- ✅ Notifications en temps réel depuis Firebase
- ✅ Types de notifications configurables
- ✅ Synchronisation automatique

## 🛠️ Services de Données

### ParishService
- `getAllParishes()` - Récupère toutes les paroisses
- `getParishById(id)` - Récupère une paroisse par ID
- `subscribeToParishes(callback)` - Abonnement temps réel

### NewsService
- `getPublishedNews(parishId?)` - Récupère les actualités publiées
- `subscribeToNews(callback, parishId?)` - Abonnement temps réel

### LiturgyService
- `getTodayLiturgy(parishId?)` - Récupère la liturgie du jour
- `getWeeklyLiturgy(parishId?)` - Récupère la liturgie de la semaine

### NotificationService
- `getPublishedNotifications(parishId?)` - Récupère les notifications publiées
- `subscribeToNotifications(callback, parishId?)` - Abonnement temps réel

### DonationService
- `createDonation(donation)` - Crée un nouveau don
- `getUserDonations(userId)` - Récupère les dons d'un utilisateur

## 🔐 Règles de Sécurité Firestore

Assurez-vous que vos règles Firestore permettent la lecture pour les utilisateurs mobiles :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Lecture publique pour les données publiées
    match /parishes/{parishId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /news/{newsId} {
      allow read: if resource.data.published == true;
      allow write: if request.auth != null;
    }
    
    match /liturgy/{liturgyId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /notifications/{notificationId} {
      allow read: if resource.data.published == true;
      allow write: if request.auth != null;
    }
    
    match /donations/{donationId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 Démarrage

1. **Configurez Firebase** avec vos vraies clés
2. **Créez les collections** dans Firestore
3. **Ajoutez des données de test** via l'interface admin
4. **Lancez l'application mobile** - les données se synchroniseront automatiquement

## 📊 Avantages de cette Architecture

- ✅ **Synchronisation temps réel** entre admin et mobile
- ✅ **Données centralisées** dans Firebase
- ✅ **Mise à jour automatique** des contenus
- ✅ **Gestion des rôles** (admin peut modifier, mobile peut lire)
- ✅ **Scalabilité** - facile d'ajouter de nouvelles fonctionnalités
- ✅ **Offline support** - Firebase gère le cache automatiquement
