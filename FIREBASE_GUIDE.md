# 🔥 Guide Firebase - SamaQuête

## 📊 Configuration du Projet

### Informations du Projet
- **Project ID**: `numerisen-14a03`
- **Auth Domain**: `numerisen-14a03.firebaseapp.com`
- **Storage Bucket**: `numerisen-14a03.firebasestorage.app`

### Clés API (Déjà Configurées)

#### Panel d'Administration
```javascript
// samaquete-admin/lib/firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyAR8kwZE9ats8NmUVbIfTzxOZDzmiyToQQ",
  authDomain: "numerisen-14a03.firebaseapp.com",
  projectId: "numerisen-14a03",
  storageBucket: "numerisen-14a03.firebasestorage.app",
  messagingSenderId: "764890122669",
  appId: "1:764890122669:web:6e07cde20ce346bb3b3924",
  measurementId: "G-7KNWL23FBB"
}
```

#### Application Mobile
```javascript
// samaquete-mobile/lib/firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyAR8kwZE9ats8NmUVbIfTzxOZDzmiyToQQ",
  authDomain: "numerisen-14a03.firebaseapp.com",
  projectId: "numerisen-14a03",
  storageBucket: "numerisen-14a03.firebasestorage.app",
  messagingSenderId: "764890122669",
  appId: "1:764890122669:android:a906113ac4b4b37e3b3924"
}
```

## 🗄️ Structure des Collections

### 1. 👥 Collection `users`

**Description**: Gestion des utilisateurs et permissions

```typescript
interface User {
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

**Exemple de document**:
```json
{
  "email": "admin@admin.com",
  "displayName": "Super Administrateur",
  "role": "super_admin",
  "permissions": {
    "canManageUsers": true,
    "canManageDioceses": true,
    "canManageParishes": true,
    "canManageContent": true,
    "canViewReports": true,
    "canManageDonations": true
  },
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 2. 🏛️ Collection `dioceses`

**Description**: Gestion des diocèses

```typescript
interface Diocese {
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

**Exemple de document**:
```json
{
  "name": "Archidiocèse de Dakar",
  "location": "Dakar",
  "city": "Dakar",
  "type": "archdiocese",
  "bishop": "Mgr Benjamin Ndiaye",
  "contactInfo": {
    "email": "contact@archidiocese-dakar.sn",
    "phone": "+221 33 821 00 00",
    "address": "Place de l'Indépendance, Dakar"
  },
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 3. ⛪ Collection `parishes`

**Description**: Gestion des paroisses

```typescript
interface Parish {
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

**Exemple de document**:
```json
{
  "name": "Paroisse Notre-Dame de la Paix",
  "city": "Dakar",
  "dioceseId": "diocese_dakar_id",
  "dioceseName": "Archidiocèse de Dakar",
  "priest": "Père Jean Baptiste",
  "email": "contact@notredame-dakar.sn",
  "phone": "+221 33 821 11 11",
  "address": "Avenue Léopold Sédar Senghor, Dakar",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 4. 💰 Collection `donationEvents`

**Description**: Événements de collecte de dons

```typescript
interface DonationEvent {
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

**Exemple de document**:
```json
{
  "title": "Quête pour la construction de l'église",
  "type": "quete",
  "description": "Collecte de fonds pour la construction de la nouvelle église",
  "targetAmount": 5000000,
  "currentAmount": 1250000,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z",
  "parishId": "parish_notredame_id",
  "parishName": "Paroisse Notre-Dame de la Paix",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 5. 💸 Collection `donations`

**Description**: Dons individuels

```typescript
interface Donation {
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

**Exemple de document**:
```json
{
  "eventId": "event_construction_id",
  "eventTitle": "Quête pour la construction de l'église",
  "amount": 50000,
  "donorName": "Marie Diop",
  "donorPhone": "+221 77 123 45 67",
  "paymentMethod": "mobile_money",
  "parishId": "parish_notredame_id",
  "parishName": "Paroisse Notre-Dame de la Paix",
  "status": "completed",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### 6. 📰 Collection `news`

**Description**: Actualités paroissiales

```typescript
interface News {
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

### 7. 📅 Collection `liturgy`

**Description**: Calendrier liturgique

```typescript
interface Liturgy {
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

### 8. 🔔 Collection `notifications`

**Description**: Notifications système

```typescript
interface Notification {
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

## 🔐 Règles de Sécurité Firestore

### Règles Actuelles
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les utilisateurs
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Règles pour les diocèses
    match /dioceses/{dioceseId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin';
    }
    
    // Règles pour les paroisses
    match /parishes/{parishId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'diocese_admin']);
    }
    
    // Règles pour les événements de dons
    match /donationEvents/{eventId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'diocese_admin']);
    }
    
    // Règles pour les dons
    match /donations/{donationId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'diocese_admin']);
    }
    
    // Règles pour les actualités
    match /news/{newsId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'diocese_admin']);
    }
    
    // Règles pour la liturgie
    match /liturgy/{liturgyId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'diocese_admin']);
    }
    
    // Règles pour les notifications
    match /notifications/{notificationId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'diocese_admin']);
    }
  }
}
```

## 🚨 Gestion des Index

### Index Requis
Firestore nécessite des index pour les requêtes complexes. Les index suivants sont automatiquement créés :

1. **Paroisses par diocèse**:
   - Collection: `parishes`
   - Champs: `dioceseId` (Ascending), `isActive` (Ascending)

2. **Dons par événement**:
   - Collection: `donations`
   - Champs: `eventId` (Ascending), `createdAt` (Descending)

3. **Actualités par paroisse**:
   - Collection: `news`
   - Champs: `parishId` (Ascending), `isPublished` (Ascending)

### Création Automatique
Les index sont créés automatiquement quand vous exécutez les requêtes. Si vous voyez des erreurs d'index :
1. Cliquez sur le lien d'erreur dans la console
2. Firebase créera l'index automatiquement
3. Attendez quelques minutes que l'index soit construit

## 🧪 Scripts de Test

### Tester la Connexion Admin
```bash
cd samaquete-admin
node lib/test-firebase-data.js
```

### Tester la Connexion Mobile
```bash
cd samaquete-mobile
node lib/test-mobile-parishes.js
```

### Créer des Données de Test
```bash
cd samaquete-admin
node lib/init-donation-data.js
```

## 📊 Monitoring et Analytics

### Firebase Console
- **URL**: https://console.firebase.google.com/project/numerisen-14a03
- **Firestore**: Voir les données en temps réel
- **Authentication**: Gérer les utilisateurs
- **Analytics**: Statistiques d'utilisation

### Logs Utiles
- Console du navigateur (Admin)
- Metro bundler (Mobile)
- Firebase Console logs

---

**🔥 Firebase est configuré et prêt à l'emploi !**