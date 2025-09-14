# 🚀 Configuration rapide des profils Firestore

## UIDs récupérés :
- **admin@admin.com** : `IhVf2ekzGNPX5LWzaaTGHQHzMTk1`
- **diocese@admin.com** : `aC9QNeVKXFNKlMQvtTyO1YyAnsi2`

## Étapes à suivre :

### 1. Aller sur la page d'initialisation
Ouvrez : `http://localhost:3000/admin/users/init`

### 2. Créer le profil Super Admin
Remplissez le formulaire avec :
- **UID** : `IhVf2ekzGNPX5LWzaaTGHQHzMTk1`
- **Email** : `admin@admin.com`
- **Nom d'affichage** : `Super Administrateur`
- **Rôle** : `Super Administrateur`

Cliquez sur "Créer le profil Firestore"

### 3. Créer le profil Admin Diocèse
Remplissez le formulaire avec :
- **UID** : `aC9QNeVKXFNKlMQvtTyO1YyAnsi2`
- **Email** : `diocese@admin.com`
- **Nom d'affichage** : `Administrateur Diocèse`
- **Rôle** : `Administrateur Diocèse`

Cliquez sur "Créer le profil Firestore"

### 4. Tester la connexion
- Allez sur `http://localhost:3000/login`
- Connectez-vous avec `admin@admin.com` / `admin123`
- Vérifiez la redirection vers `/admin/dashboard`
- Testez avec `diocese@admin.com` / `diocese123`

## ✅ Résultat attendu :
- Les profils Firestore sont créés
- La connexion fonctionne avec les rôles
- Les redirections se font selon les permissions