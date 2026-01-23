# 🔧 Créer le Compte Admin Archidiocèse

## ❌ Erreur Actuelle
```
Firebase: Error (auth/invalid-credential)
```

Cette erreur signifie que le compte **n'existe pas** dans Firebase Auth ou que les identifiants sont incorrects.

---

## ✅ Solution : Créer le Compte Manuellement

### Étape 1 : Créer l'utilisateur dans Firebase Auth

1. **Aller dans Firebase Console**
   - URL: https://console.firebase.google.com/
   - Sélectionner votre projet

2. **Aller dans Authentication**
   - Menu gauche > **Authentication**
   - Onglet **Users**

3. **Ajouter un utilisateur**
   - Cliquer sur **"Ajouter un utilisateur"** ou **"Add user"**
   - **Email:** `archdiocese.dakar@samaquete.sn`
   - **Mot de passe:** `Admin123`
   - **Désactiver** "Envoyer un email de notification" (optionnel)
   - Cliquer sur **"Ajouter"** ou **"Add"**

4. **Copier l'UID**
   - Une fois créé, **copier l'UID** de l'utilisateur (ex: `abc123xyz456...`)
   - Vous en aurez besoin pour l'étape 2

---

### Étape 2 : Créer le Profil dans Firestore

1. **Aller dans Firestore Database**
   - Menu gauche > **Firestore Database**
   - Onglet **Data**

2. **Créer la collection "users" (si elle n'existe pas)**
   - Si la collection `users` n'existe pas, elle sera créée automatiquement

3. **Créer un document**
   - Cliquer sur **"Ajouter un document"** ou **"Add document"**
   - **Document ID:** Coller l'**UID** copié à l'étape 1
   - Cliquer sur **"Enregistrer"** ou **"Save"**

4. **Ajouter les champs suivants**

   Cliquer sur **"Ajouter un champ"** pour chaque champ :

   | Nom du champ | Type | Valeur |
   |-------------|------|--------|
   | `email` | string | `archdiocese.dakar@samaquete.sn` |
   | `displayName` | string | `Admin Archidiocèse Dakar` |
   | `role` | string | `archdiocese_admin` |
   | `archdioceseId` | string | `dakar` |
   | `isActive` | boolean | `true` |
   | `createdAt` | timestamp | Cliquer sur "timestamp" puis "Set to now" |
   | `updatedAt` | timestamp | Cliquer sur "timestamp" puis "Set to now" |

5. **Ajouter les permissions (objet)**

   Cliquer sur **"Ajouter un champ"** :
   - **Nom:** `permissions`
   - **Type:** `map` (objet)

   Puis ajouter les champs suivants **dans l'objet permissions** :

   | Nom | Type | Valeur |
   |-----|------|--------|
   | `canManageUsers` | boolean | `false` |
   | `canManageArchdioceses` | boolean | `false` |
   | `canManageDioceses` | boolean | `false` |
   | `canManageParishes` | boolean | `false` |
   | `canManageChurches` | boolean | `false` |
   | `canManageContent` | boolean | `true` |
   | `canValidateContent` | boolean | `false` |
   | `canCreateContent` | boolean | `true` |
   | `canViewReports` | boolean | `true` |
   | `canViewDonations` | boolean | `true` |
   | `canManageDonations` | boolean | `false` |
   | `canManageSettings` | boolean | `false` |

6. **Enregistrer**
   - Cliquer sur **"Enregistrer"** ou **"Save"**

---

## 📋 Structure JSON Complète (pour référence)

Si vous préférez importer directement, voici la structure complète :

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

> **Note:** Remplacez les timestamps par la date actuelle ou utilisez "Set to now" dans Firebase Console.

---

## ✅ Vérification

Une fois créé, vous devriez pouvoir :

1. **Aller sur** `http://localhost:3000/login`
2. **Se connecter avec:**
   - Email: `archdiocese.dakar@samaquete.sn`
   - Mot de passe: `Admin123`
3. **Être redirigé vers** `/adminarchdiocese/dashboard`

---

## 🔍 Si l'erreur persiste

1. **Vérifier l'email**
   - L'email dans Firebase Auth doit être **exactement** `archdiocese.dakar@samaquete.sn`
   - Pas d'espaces, pas de majuscules (sauf si nécessaire)

2. **Vérifier le mot de passe**
   - Le mot de passe doit être **exactement** `Admin123`
   - Attention à la casse (A majuscule, 123 en chiffres)

3. **Vérifier l'UID**
   - L'UID dans Firestore doit correspondre **exactement** à l'UID dans Firebase Auth

4. **Vérifier le rôle**
   - Le champ `role` dans Firestore doit être **exactement** `archdiocese_admin`

5. **Vérifier que le compte est actif**
   - Le champ `isActive` doit être `true`

---

## 🆘 Alternative : Utiliser le Script

Si vous préférez utiliser un script, vous pouvez exécuter :

```bash
cd samaquete-admin
node lib/create-test-accounts.js
```

> **Note:** Ce script nécessite que `firebase-admin` soit configuré avec un fichier de service account.
