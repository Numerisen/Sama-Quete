# 🔐 Configuration Firebase Auth - SamaQuête

## 📋 Comptes à Créer dans Firebase Auth

### 1. Super Administrateur
- **Email**: `admin@admin.com`
- **Mot de passe**: `admin123`
- **UID**: `IhVf2ekzGNPX5LWzaaTGHQHzMTk1`
- **Rôle**: `super_admin`

### 2. Administrateur Diocèse
- **Email**: `diocese@diocese.com`
- **Mot de passe**: `diocese123`
- **UID**: `aC9QNeVKXFNKlMQvtTyO1YyAnsi2`
- **Rôle**: `diocese_admin`

## 🚀 Création Automatique des Profils

### Script de Création
```bash
cd samaquete-admin
node lib/create-profiles.js
```

Ce script crée automatiquement les profils Firestore avec les bonnes permissions.

## 🔧 Configuration Manuelle (si nécessaire)

### 1. Aller sur Firebase Console
- **URL**: https://console.firebase.google.com/project/numerisen-14a03
- **Section**: Authentication > Users

### 2. Créer les Comptes
1. Cliquer sur "Add user"
2. Entrer l'email et le mot de passe
3. Copier l'UID généré
4. Mettre à jour le script si nécessaire

### 3. Vérifier les Profils Firestore
1. Aller dans Firestore Database
2. Vérifier la collection `users`
3. S'assurer que les profils ont les bonnes permissions

## 🧪 Test de Connexion

### Panel d'Administration
1. Aller sur http://localhost:3000/login
2. Se connecter avec `admin@admin.com` / `admin123`
3. Vérifier l'accès au dashboard

### Application Mobile
1. Lancer l'app mobile
2. Tester la sélection de paroisse
3. Vérifier l'affichage des données

## 🚨 Résolution de Problèmes

### Erreur "User not found"
- Vérifier que le compte existe dans Firebase Auth
- Vérifier l'email exact
- Vérifier le mot de passe

### Erreur "Permission denied"
- Vérifier que le profil Firestore existe
- Vérifier les permissions dans le profil
- Vérifier les règles Firestore

### Erreur "Invalid credentials"
- Vérifier l'email et le mot de passe
- Vérifier que le compte est activé
- Vérifier la configuration Firebase

## 📊 Structure des Profils Firestore

### Super Admin
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
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Admin Diocèse
```json
{
  "email": "diocese@diocese.com",
  "displayName": "Administrateur Diocèse",
  "role": "diocese_admin",
  "permissions": {
    "canManageUsers": true,
    "canManageDioceses": false,
    "canManageParishes": true,
    "canManageContent": true,
    "canViewReports": true,
    "canManageDonations": true
  },
  "isActive": true,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

**🔐 Les comptes sont maintenant configurés avec les bons mots de passe !**