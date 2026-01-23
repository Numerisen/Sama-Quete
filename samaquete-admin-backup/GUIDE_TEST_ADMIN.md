# 🧪 Guide de Test - Interface Admin

## 📋 Comptes de Test

### 🔴 Super Admin
- **Email:** `admin@admin.com`
- **Mot de passe:** `admin123`
- **Rôle:** `super_admin`
- **Accès:** Toutes les fonctionnalités, toutes les paroisses/églises

### 🟠 Admin Archidiocèse
- **Email:** `archdiocese.dakar@samaquete.sn`
- **Mot de passe:** `Admin123`
- **Rôle:** `archdiocese_admin`
- **Accès:** Lecture globale, publication archidiocésaine

### 🟡 Admin Diocèse
- **Email:** `diocese@admin.com`
- **Mot de passe:** `diocese123`
- **Rôle:** `diocese_admin`
- **Accès:** Gestion de son diocèse uniquement

### 🟢 Admin Paroisse
- **Email:** `paroisse-saint-joseph-medina@samaquete.sn` (ou selon le nom de la paroisse)
- **Mot de passe:** `Admin123`
- **Rôle:** `parish_admin`
- **Accès:** Gestion complète de sa paroisse (validation contenus église)

### 🔵 Admin Église
- **Email:** `eglise-saint-jean-bosco@samaquete.sn` (ou selon le nom de l'église)
- **Mot de passe:** `Admin123`
- **Rôle:** `church_admin`
- **Accès:** Création de contenus (draft/pending), lecture seule sur dons

---

## 🚀 Étapes pour Créer les Comptes de Test

### Option 1: Via Firebase Console (Recommandé)

1. **Aller dans Firebase Console > Authentication**
2. **Créer les utilisateurs manuellement:**

#### Super Admin
```
Email: admin@admin.com
Mot de passe: admin123
```

#### Admin Diocèse
```
Email: diocese@admin.com
Mot de passe: diocese123
```

3. **Créer les profils Firestore dans la collection `users`:**

#### Super Admin
```json
{
  "uid": "[UID_FROM_AUTH]",
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
  "uid": "[UID_FROM_AUTH]",
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

#### Admin Paroisse (exemple)
```json
{
  "uid": "[UID_FROM_AUTH]",
  "email": "paroisse-saint-joseph-medina@samaquete.sn",
  "displayName": "Admin Paroisse Saint-Joseph",
  "role": "parish_admin",
  "dioceseId": "dakar",
  "parishId": "[ID_PAROISSE]",
  "permissions": {
    "canManageUsers": true,
    "canManageArchdioceses": false,
    "canManageDioceses": false,
    "canManageParishes": true,
    "canManageChurches": true,
    "canManageContent": true,
    "canValidateContent": true,
    "canCreateContent": true,
    "canViewReports": true,
    "canViewDonations": true,
    "canManageDonations": true,
    "canManageSettings": false
  },
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Admin Église (exemple)
```json
{
  "uid": "[UID_FROM_AUTH]",
  "email": "eglise-saint-jean-bosco@samaquete.sn",
  "displayName": "Admin Église Saint Jean Bosco",
  "role": "church_admin",
  "dioceseId": "dakar",
  "parishId": "[ID_PAROISSE]",
  "churchId": "[ID_EGLISE]",
  "permissions": {
    "canManageUsers": false,
    "canManageArchdioceses": false,
    "canManageDioceses": false,
    "canManageParishes": false,
    "canManageChurches": false,
    "canManageContent": false,
    "canValidateContent": false,
    "canCreateContent": true,
    "canViewReports": false,
    "canViewDonations": true,
    "canManageDonations": true,
    "canManageSettings": false
  },
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Option 2: Via Script Node.js

Créer un fichier `create-test-accounts.js` dans `samaquete-admin/lib/`:

```javascript
const { initializeApp } = require('firebase/app')
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth')
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore')

// Configuration Firebase (à adapter)
const firebaseConfig = {
  // Vos configs
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

async function createTestAccounts() {
  const accounts = [
    {
      email: 'admin@admin.com',
      password: 'admin123',
      role: 'super_admin',
      displayName: 'Super Administrateur'
    },
    {
      email: 'diocese@admin.com',
      password: 'diocese123',
      role: 'diocese_admin',
      displayName: 'Administrateur Diocèse',
      dioceseId: 'dakar'
    }
  ]

  for (const account of accounts) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, account.email, account.password)
      const user = userCredential.user

      const userData = {
        email: account.email,
        displayName: account.displayName,
        role: account.role,
        dioceseId: account.dioceseId || null,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await setDoc(doc(db, 'users', user.uid), userData)
      console.log(`✅ Compte créé: ${account.email}`)
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️  Compte existe déjà: ${account.email}`)
      } else {
        console.error(`❌ Erreur pour ${account.email}:`, error.message)
      }
    }
  }
}

createTestAccounts()
```

---

## 🧪 Tests à Effectuer

### 1. Test Super Admin
1. Se connecter avec `admin@admin.com` / `admin123`
2. Vérifier l'accès à `/admin/dashboard`
3. Tester la gestion des paroisses, diocèses, utilisateurs
4. Vérifier l'accès global à toutes les données

### 2. Test Admin Paroisse
1. Se connecter avec un compte `parish_admin`
2. Vérifier l'accès à `/adminparoisse/dashboard`
3. Tester toutes les pages:
   - ✅ Informations paroisse
   - ✅ Églises
   - ✅ Actualités & contenus (validation workflow)
   - ✅ Types de dons
   - ✅ Dons (lecture seule)
   - ✅ Notifications
   - ✅ Utilisateurs
   - ✅ Paramètres paroisse

### 3. Test Admin Église
1. Se connecter avec un compte `church_admin`
2. Vérifier l'accès à `/admineglise/dashboard`
3. Tester toutes les pages:
   - ✅ Dashboard
   - ✅ Actualités (création draft/pending)
   - ✅ Activités
   - ✅ prières
   - ✅ Dons (lecture seule)
   - ✅ Paramètres

### 4. Test Workflow de Validation
1. **Admin Église** crée une actualité avec `status: 'pending'`
2. **Admin Paroisse** voit l'actualité en attente
3. **Admin Paroisse** valide → `status: 'published'`
4. Vérifier que l'actualité est visible côté mobile (si testé)

---

## 🔧 Résolution de Problèmes

### Erreur: "Element type is invalid"
- Vérifier que tous les imports sont corrects
- Vérifier que les composants UI sont bien exportés
- Redémarrer le serveur Next.js

### Erreur: "Permission denied"
- Vérifier que les règles Firestore sont déployées
- Vérifier que le `parishId` et `churchId` sont corrects dans le profil utilisateur
- Vérifier que le rôle est bien défini dans Firestore

### Redirection incorrecte
- Vérifier que le rôle est bien chargé depuis Firestore
- Vérifier que `ProtectedRoute` accepte le bon rôle
- Vérifier que la page racine redirige correctement

---

## 📝 Notes Importantes

1. **Les mots de passe par défaut** sont `Admin123` pour les comptes créés automatiquement
2. **Les emails** sont générés automatiquement selon le nom de l'entité
3. **Les UID** doivent correspondre entre Firebase Auth et Firestore
4. **Les IDs** (`parishId`, `churchId`, `dioceseId`) doivent exister dans les collections correspondantes

---

## ✅ Checklist de Test

- [ ] Super Admin peut accéder à toutes les pages
- [ ] Admin Paroisse peut gérer sa paroisse uniquement
- [ ] Admin Église peut créer des contenus (draft/pending)
- [ ] Admin Église ne peut pas publier directement
- [ ] Admin Paroisse peut valider les contenus église
- [ ] Les dons sont en lecture seule pour tous
- [ ] Les filtres par `parishId` fonctionnent correctement
- [ ] Les règles Firestore bloquent l'accès aux autres paroisses
