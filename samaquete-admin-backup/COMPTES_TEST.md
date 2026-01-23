# 🔐 Comptes de Test - Interface Admin

## 📋 Comptes Disponibles

### 🔴 Super Admin
```
Email: admin@admin.com
Mot de passe: admin123
Rôle: super_admin
URL après connexion: /admin/dashboard
```

### 🟡 Admin Diocèse
```
Email: diocese@admin.com
Mot de passe: diocese123
Rôle: diocese_admin
URL après connexion: /admindiocese/dashboard
```

### 🟠 Admin Archidiocèse
```
Email: archdiocese.dakar@samaquete.sn
Mot de passe: Admin123
Rôle: archdiocese_admin
URL après connexion: /adminarchdiocese/dashboard
```

---

## 🚀 Comment Créer les Comptes

### Méthode 1: Firebase Console (Recommandé)

1. **Aller dans Firebase Console > Authentication**
2. **Cliquer sur "Ajouter un utilisateur"**
3. **Créer les utilisateurs:**

#### Super Admin
- Email: `admin@admin.com`
- Mot de passe: `admin123`
- Copier l'UID généré

#### Admin Diocèse
- Email: `diocese@admin.com`
- Mot de passe: `diocese123`
- Copier l'UID généré

4. **Aller dans Firestore > collection "users"**
5. **Créer les documents avec les UID copiés:**

**Document pour Super Admin:**
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

**Document pour Admin Diocèse:**
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

### Méthode 2: Via l'Interface Admin (si Super Admin existe)

1. Se connecter avec le compte Super Admin
2. Aller dans `/admin/users/create`
3. Créer les nouveaux comptes depuis l'interface

---

## 🟢 Comptes Admin Paroisse et Église

Ces comptes sont créés automatiquement lors de la création d'une paroisse ou d'une église.

**Format des emails:**
- Paroisse: `paroisse-[nom-normalisé]@samaquete.sn`
- Église: `eglise-[nom-normalisé]@samaquete.sn`

**Mot de passe par défaut:** `Admin123`

**Exemple:**
- Paroisse "Saint-Joseph de Médina" → `paroisse-saint-joseph-de-medina@samaquete.sn`
- Église "Saint Jean Bosco" → `eglise-saint-jean-bosco@samaquete.sn`

---

## 🧪 Tests Rapides

### Test 1: Super Admin
1. Aller sur `http://localhost:3000/login`
2. Se connecter avec `admin@admin.com` / `admin123`
3. Vérifier la redirection vers `/admin/dashboard`
4. Tester la gestion des paroisses, diocèses, utilisateurs

### Test 2: Admin Paroisse
1. Créer une paroisse via Super Admin
2. Le compte admin paroisse est créé automatiquement
3. Se connecter avec l'email généré / `Admin123`
4. Vérifier la redirection vers `/adminparoisse/dashboard`
5. Tester toutes les pages:
   - ✅ Informations paroisse
   - ✅ Églises
   - ✅ Actualités & contenus
   - ✅ Types de dons
   - ✅ Dons (lecture seule)
   - ✅ Notifications
   - ✅ Utilisateurs
   - ✅ Paramètres paroisse

### Test 3: Admin Église
1. Créer une église via Admin Paroisse
2. Le compte admin église est créé automatiquement
3. Se connecter avec l'email généré / `Admin123`
4. Vérifier la redirection vers `/admineglise/dashboard`
5. Tester toutes les pages:
   - ✅ Dashboard
   - ✅ Actualités (création draft/pending)
   - ✅ Activités
   - ✅ prières
   - ✅ Dons (lecture seule)
   - ✅ Paramètres

---

## ⚠️ Résolution de Problèmes

### Erreur: "User not found"
- Vérifier que l'utilisateur existe dans Firebase Auth
- Vérifier que le profil existe dans Firestore collection "users"
- Vérifier que l'UID correspond entre Auth et Firestore

### Erreur: "Permission denied"
- Vérifier que les règles Firestore sont déployées
- Vérifier que le rôle est correct dans Firestore
- Vérifier que `parishId` et `churchId` sont corrects (si applicable)

### Redirection incorrecte
- Vérifier que le rôle est bien chargé depuis Firestore
- Vérifier que `ProtectedRoute` accepte le bon rôle
- Vérifier la console du navigateur pour les erreurs

---

## 📝 Notes

- Les mots de passe par défaut sont `Admin123` pour les comptes créés automatiquement
- Les emails sont générés automatiquement selon le nom de l'entité
- Les UID doivent correspondre entre Firebase Auth et Firestore
- Les IDs (`parishId`, `churchId`, `dioceseId`) doivent exister dans les collections correspondantes
