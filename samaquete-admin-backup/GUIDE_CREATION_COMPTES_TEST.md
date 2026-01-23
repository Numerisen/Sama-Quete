# 🚀 Guide de Création des Comptes de Test

## 📋 Problèmes Identifiés

1. **Connexion archidiocèse ne marche pas** - Le compte n'existe pas dans Firebase Auth
2. **Header affiche "Archidiocèse" au lieu de "Diocèse"** - ✅ **CORRIGÉ**
3. **Erreur "diocèse non trouvé"** - Le diocèse n'existe pas dans Firestore
4. **Pas de comptes paroisse/église** - Besoin de créer des comptes de test

---

## ✅ Solution : Script Automatique

J'ai créé un script qui crée **automatiquement** :
- ✅ Un diocèse de test
- ✅ Une paroisse de test
- ✅ Une église de test
- ✅ Les comptes admin correspondants (Firebase Auth + Firestore)

---

## 🚀 Utilisation du Script

### Étape 1 : Installer les dépendances (si nécessaire)

```bash
cd samaquete-admin
npm install
```

### Étape 2 : Exécuter le script

```bash
node lib/create-all-test-accounts.js
```

### Étape 3 : Vérifier les résultats

Le script affichera :
- ✅ Les entités créées (diocèse, paroisse, église)
- ✅ Les comptes créés avec leurs emails et mots de passe
- ✅ Les UID générés

---

## 📋 Comptes Créés par le Script

### 1. Admin Diocèse
- **Email:** `diocese.dakar.test@samaquete.sn`
- **Mot de passe:** `Admin123`
- **Rôle:** `diocese_admin`
- **Diocèse:** Diocèse de Dakar

### 2. Admin Paroisse
- **Email:** `paroisse-saint-joseph-de-medina@samaquete.sn`
- **Mot de passe:** `Admin123`
- **Rôle:** `parish_admin`
- **Paroisse:** Paroisse Saint-Joseph de Médina

### 3. Admin Église
- **Email:** `eglise-saint-jean-bosco@samaquete.sn`
- **Mot de passe:** `Admin123`
- **Rôle:** `church_admin`
- **Église:** Église Saint Jean Bosco

---

## 🔧 Si le Script Échoue

### Problème : "Email déjà utilisé"

Si un compte existe déjà dans Firebase Auth, le script affichera un avertissement.

**Solution :**
1. Aller dans **Firebase Console > Authentication**
2. Vérifier si le compte existe
3. Si oui, créer manuellement le profil Firestore (voir ci-dessous)
4. Si non, supprimer le compte et réexécuter le script

### Problème : "Erreur de connexion Firebase"

**Vérifier :**
1. Les variables d'environnement Firebase sont configurées
2. Le fichier `.env.local` existe avec les bonnes clés
3. Firebase est accessible depuis votre réseau

---

## 📝 Création Manuelle (Alternative)

Si le script ne fonctionne pas, vous pouvez créer les comptes manuellement :

### 1. Créer le Diocèse

**Firestore > Collection `dioceses` > Ajouter un document**

**Document ID:** `diocese-de-dakar`

```json
{
  "name": "Diocèse de Dakar",
  "location": "Dakar",
  "city": "Dakar",
  "type": "Diocèse",
  "bishop": "Évêque de test",
  "contactInfo": {
    "email": "contact@diocese-de-dakar.sn",
    "phone": "+221 33 XXX XX XX"
  },
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 2. Créer la Paroisse

**Firestore > Collection `parishes` > Ajouter un document**

**Document ID:** `paroisse-saint-joseph-de-medina`

```json
{
  "name": "Paroisse Saint-Joseph de Médina",
  "dioceseId": "diocese-de-dakar",
  "dioceseName": "Diocèse de Dakar",
  "location": "Dakar",
  "city": "Dakar",
  "priest": "Curé de test",
  "contactInfo": {
    "email": "contact@paroisse-saint-joseph-de-medina.sn",
    "phone": "+221 33 XXX XX XX",
    "address": "Dakar, Sénégal"
  },
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 3. Créer l'Église

**Firestore > Collection `churches` > Ajouter un document**

**Document ID:** `eglise-saint-jean-bosco`

```json
{
  "name": "Église Saint Jean Bosco",
  "parishId": "paroisse-saint-joseph-de-medina",
  "description": "Église Saint Jean Bosco - Paroisse de test",
  "address": "Dakar, Sénégal",
  "city": "Dakar",
  "contactInfo": {
    "email": "contact@eglise-saint-jean-bosco.sn",
    "phone": "+221 33 XXX XX XX"
  },
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 4. Créer les Comptes Admin

Pour chaque compte :

1. **Firebase Auth > Authentication > Ajouter un utilisateur**
   - Email: (voir ci-dessus)
   - Mot de passe: `Admin123`
   - **Copier l'UID**

2. **Firestore > Collection `users` > Ajouter un document**
   - **Document ID:** Coller l'UID
   - Utiliser les structures JSON ci-dessous

#### Admin Diocèse

```json
{
  "email": "diocese.dakar.test@samaquete.sn",
  "displayName": "Admin Diocèse Dakar",
  "role": "diocese_admin",
  "dioceseId": "diocese-de-dakar",
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

#### Admin Paroisse

```json
{
  "email": "paroisse-saint-joseph-de-medina@samaquete.sn",
  "displayName": "Paroisse Saint-Joseph de Médina",
  "role": "parish_admin",
  "parishId": "paroisse-saint-joseph-de-medina",
  "dioceseId": "diocese-de-dakar",
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

#### Admin Église

```json
{
  "email": "eglise-saint-jean-bosco@samaquete.sn",
  "displayName": "Église Saint Jean Bosco",
  "role": "church_admin",
  "parishId": "paroisse-saint-joseph-de-medina",
  "churchId": "eglise-saint-jean-bosco",
  "dioceseId": "diocese-de-dakar",
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

---

## ✅ Vérification

Une fois les comptes créés :

1. **Aller sur** `http://localhost:3000/login`
2. **Se connecter avec un des comptes créés**
3. **Vérifier la redirection** selon le rôle :
   - Admin Diocèse → `/admindiocese/dashboard`
   - Admin Paroisse → `/adminparoisse/dashboard`
   - Admin Église → `/admineglise/dashboard`

---

## 🐛 Dépannage

### Erreur "diocèse non trouvé" lors de la création de paroisse

**Cause:** Le diocèse n'existe pas dans Firestore ou l'ID ne correspond pas.

**Solution:**
1. Vérifier que le diocèse existe dans Firestore > Collection `dioceses`
2. Vérifier que l'ID du diocèse correspond exactement (sensible à la casse)
3. Réexécuter le script ou créer manuellement

### Header affiche le mauvais nom

**✅ CORRIGÉ** - Le header utilise maintenant `userRole.displayName` au lieu d'une valeur en dur.

### Connexion archidiocèse ne marche pas

**Cause:** Le compte n'existe pas dans Firebase Auth.

**Solution:**
1. Créer le compte manuellement dans Firebase Console > Authentication
2. Créer le profil Firestore (voir `CREER_COMPTE_ARCHIDIOCESE.md`)

---

## 📝 Notes

- Le script utilise le **SDK client Firebase** (pas firebase-admin)
- Les mots de passe par défaut sont **`Admin123`**
- Les emails sont générés automatiquement selon le nom de l'entité
- Le script vérifie si les entités existent déjà avant de créer

---

## 🎯 Prochaines Étapes

1. ✅ Exécuter le script `create-all-test-accounts.js`
2. ✅ Vérifier que tous les comptes sont créés
3. ✅ Tester la connexion avec chaque compte
4. ✅ Vérifier que les redirections fonctionnent
5. ✅ Tester la création de paroisse depuis Admin Diocèse
