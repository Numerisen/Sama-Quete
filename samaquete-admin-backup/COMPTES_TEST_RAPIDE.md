# 🔐 Comptes de Test - Guide Rapide

## 📋 Comptes Disponibles

### 🔴 Super Admin
- **Email:** `admin@admin.com`
- **Mot de passe:** `admin123`
- **URL:** `/admin/dashboard`

### 🟡 Admin Diocèse
- **Email:** `diocese@admin.com`
- **Mot de passe:** `diocese123`
- **URL:** `/admindiocese/dashboard`

### 🟠 Admin Archidiocèse
- **Email:** `archdiocese.dakar@samaquete.sn`
- **Mot de passe:** `Admin123`
- **URL:** `/adminarchdiocese/dashboard`

---

## 🚀 Création Rapide (Firebase Console)

### 1. Firebase Auth
1. Firebase Console > Authentication > Ajouter un utilisateur
2. Créer les 3 utilisateurs ci-dessus
3. **Copier les UID**

### 2. Firestore
1. Firestore > Collection `users`
2. Créer un document pour chaque UID
3. Utiliser les structures JSON ci-dessous

#### Super Admin
```json
{
  "email": "admin@admin.com",
  "displayName": "Super Administrateur",
  "role": "super_admin",
  "permissions": {
    "canManageUsers": true,
    "canManageArchdioceses": true,
    "canManageDioceses": true,
    "canManageParishes": true,
    "canManageChurches": true,
    "canManageContent": true,
    "canValidateContent": true,
    "canCreateContent": true,
    "canViewReports": true,
    "canViewDonations": true,
    "canManageDonations": true,
    "canManageSettings": true
  },
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Admin Diocèse
```json
{
  "email": "diocese@admin.com",
  "displayName": "Administrateur Diocèse",
  "role": "diocese_admin",
  "dioceseId": "dakar",
  "permissions": {
    "canManageUsers": false,
    "canManageArchdioceses": false,
    "canManageDioceses": false,
    "canManageParishes": false,
    "canManageChurches": false,
    "canManageContent": true,
    "canValidateContent": false,
    "canCreateContent": true,
    "canViewReports": true,
    "canViewDonations": true,
    "canManageDonations": false,
    "canManageSettings": false
  },
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Admin Archidiocèse
```json
{
  "email": "archdiocese.dakar@samaquete.sn",
  "displayName": "Admin Archidiocèse Dakar",
  "role": "archdiocese_admin",
  "archdioceseId": "dakar",
  "permissions": {
    "canManageUsers": false,
    "canManageArchdioceses": false,
    "canManageDioceses": false,
    "canManageParishes": false,
    "canManageChurches": false,
    "canManageContent": true,
    "canValidateContent": false,
    "canCreateContent": true,
    "canViewReports": true,
    "canViewDonations": true,
    "canManageDonations": false,
    "canManageSettings": false
  },
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

> **⚠️ IMPORTANT:** Si vous avez l'erreur `auth/invalid-credential` pour l'archidiocèse, voir le fichier `CREER_COMPTE_ARCHIDIOCESE.md` pour les instructions détaillées.

---

## 🔧 Correction Erreur "Element type is invalid"

### Solution 1: Nettoyer le cache Next.js
```bash
cd samaquete-admin
rm -rf .next
npm run dev
```

### Solution 2: Réinstaller les dépendances
```bash
cd samaquete-admin
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Solution 3: Vérifier les imports
Si l'erreur persiste, vérifier que tous les composants sont bien importés dans les pages créées.

---

## ✅ Test Rapide

1. **Créer les comptes** dans Firebase (voir ci-dessus)
2. **Aller sur** `http://localhost:3000/login`
3. **Se connecter** avec `admin@admin.com` / `admin123`
4. **Vérifier** la redirection vers `/admin/dashboard`

---

## 📝 Notes

- Les comptes Admin Paroisse et Église sont créés automatiquement lors de la création d'une paroisse/église
- Format email: `paroisse-[nom]@samaquete.sn` ou `eglise-[nom]@samaquete.sn`
- Mot de passe par défaut: `Admin123`
