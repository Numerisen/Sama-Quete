# Configuration Firebase pour SamaQuete Admin

## 📋 Étapes de Configuration

### 1. Créer un fichier `.env.local`

Créez un fichier `.env.local` à la racine du projet avec le contenu suivant :

```env
# Configuration Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key_ici
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=numerisen-14a03.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=numerisen-14a03
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=numerisen-14a03.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id_ici
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id_ici

# Comptes de test
NEXT_PUBLIC_ADMIN_EMAIL=admin@admin.com
NEXT_PUBLIC_DIOCESE_ADMIN_EMAIL=diocese@admin.com
```

### 2. Récupérer les clés Firebase

1. **Connectez-vous à la [Console Firebase](https://console.firebase.google.com/)**
2. **Sélectionnez votre projet "numerisen"**
3. **Cliquez sur l'icône d'engrenage ⚙️ > Paramètres du projet**
4. **Faites défiler vers le bas jusqu'à "Vos applications"**
5. **Cliquez sur l'icône d'engrenage de votre application web**
6. **Copiez les valeurs de configuration**

### 3. Configuration Firebase Authentication

1. **Dans la console Firebase, allez dans "Authentication"**
2. **Cliquez sur "Commencer"**
3. **Allez dans l'onglet "Méthodes de connexion"**
4. **Activez "Email/Mot de passe"**
5. **Créez les utilisateurs de test :**
   - `admin@admin.com` (Super Admin)
   - `diocese@admin.com` (Admin Diocèse)

### 4. Configuration Firestore Database

1. **Dans la console Firebase, allez dans "Firestore Database"**
2. **Cliquez sur "Créer une base de données"**
3. **Choisissez "Commencer en mode test" (pour le développement)**
4. **Sélectionnez une localisation (Europe-west1 pour la France)**

### 5. Règles de sécurité Firestore

Remplacez les règles par défaut par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les utilisateurs
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Règles pour les paroisses
    match /parishes/{parishId} {
      allow read, write: if request.auth != null;
    }
    
    // Règles pour les diocèses
    match /dioceses/{dioceseId} {
      allow read, write: if request.auth != null;
    }
    
    // Règles pour les donations
    match /donations/{donationId} {
      allow read, write: if request.auth != null;
    }
    
    // Règles pour les actualités
    match /news/{newsId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🔐 Comptes de Test

### Super Admin
- **Email :** `admin@admin.com`
- **Mot de passe :** `admin123`
- **Accès :** Interface admin complète

### Admin Diocèse
- **Email :** `diocese@admin.com`
- **Mot de passe :** `diocese123`
- **Accès :** Interface diocèse uniquement

## 🚀 Démarrage

1. **Installez les dépendances :**
   ```bash
   npm install
   ```

2. **Démarrez l'application :**
   ```bash
   npm run dev
   ```

3. **Accédez à l'application :**
   - **Admin :** http://localhost:3000/admin/dashboard
   - **Login :** http://localhost:3000/login

## 📱 Structure des Données Firestore

### Collections principales :

- **`users`** - Utilisateurs du système
- **`dioceses`** - Diocèses
- **`parishes`** - Paroisses
- **`donations`** - Dons et offrandes
- **`news`** - Actualités
- **`liturgy`** - Informations liturgiques

## 🔧 Fonctionnalités Implémentées

- ✅ **Authentification Firebase**
- ✅ **Protection des routes**
- ✅ **Gestion des rôles (Admin/Diocèse)**
- ✅ **Interface de connexion**
- ✅ **Déconnexion sécurisée**
- ✅ **Intégration Firestore**

## 🛠️ Dépannage

### Erreur de configuration Firebase
- Vérifiez que toutes les clés dans `.env.local` sont correctes
- Redémarrez l'application après modification du fichier `.env.local`

### Erreur d'authentification
- Vérifiez que l'utilisateur existe dans Firebase Authentication
- Vérifiez que la méthode Email/Mot de passe est activée

### Erreur Firestore
- Vérifiez que Firestore est activé dans la console Firebase
- Vérifiez les règles de sécurité Firestore
