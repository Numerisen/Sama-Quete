# 🚀 Configuration Firestore - Guide Rapide

## 📋 Créer les profils utilisateurs directement dans Firebase Console

### **Étape 1 : Aller dans Firestore**
1. Allez sur https://console.firebase.google.com
2. Sélectionnez votre projet "numerisen"
3. Cliquez sur "Firestore Database"
4. Cliquez sur "Commencer une collection"

### **Étape 2 : Créer la collection "users"**
1. **ID de collection** : `users`
2. Cliquez sur "Suivant"

### **Étape 3 : Créer le premier document (Super Admin)**
1. **ID de document** : `IhVf2ekzGNPX5LWzaaTGHQHzMTk1`
2. **Champs** :
   - `email` (string) : `admin@admin.com`
   - `displayName` (string) : `Super Administrateur`
   - `role` (string) : `super_admin`
   - `permissions` (map) :
     - `canManageUsers` (boolean) : `true`
     - `canManageDioceses` (boolean) : `true`
     - `canManageParishes` (boolean) : `true`
     - `canManageContent` (boolean) : `true`
     - `canViewReports` (boolean) : `true`
     - `canManageDonations` (boolean) : `true`
   - `isActive` (boolean) : `true`
   - `createdAt` (timestamp) : `[Sélectionner "Maintenant"]`
   - `updatedAt` (timestamp) : `[Sélectionner "Maintenant"]`

3. Cliquez sur "Sauvegarder"

### **Étape 4 : Créer le deuxième document (Admin Diocèse)**
1. **ID de document** : `aC9QNeVKXFNKlMQvtTyO1YyAnsi2`
2. **Champs** :
   - `email` (string) : `diocese@admin.com`
   - `displayName` (string) : `Administrateur Diocèse`
   - `role` (string) : `diocese_admin`
   - `permissions` (map) :
     - `canManageUsers` (boolean) : `true`
     - `canManageDioceses` (boolean) : `false`
     - `canManageParishes` (boolean) : `true`
     - `canManageContent` (boolean) : `true`
     - `canViewReports` (boolean) : `true`
     - `canManageDonations` (boolean) : `true`
   - `isActive` (boolean) : `true`
   - `createdAt` (timestamp) : `[Sélectionner "Maintenant"]`
   - `updatedAt` (timestamp) : `[Sélectionner "Maintenant"]`

3. Cliquez sur "Sauvegarder"

### **Étape 5 : Tester**
1. Allez sur `http://localhost:3000/login`
2. Connectez-vous avec `admin@admin.com` / `admin123`
3. Vous devriez être redirigé vers `/admin/dashboard`

## ✅ Résultat attendu :
- Plus de "Chargement des permissions..."
- Navigation fluide selon les rôles
- Authentification complètement fonctionnelle