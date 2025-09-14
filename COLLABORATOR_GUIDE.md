# 👥 Guide pour Collaborateur - SamaQuête

## 🎯 Bienvenue dans le Projet !

Ce guide vous explique comment démarrer rapidement avec le projet SamaQuête.

## 🚀 Démarrage Rapide (5 minutes)

### 1. Cloner le Projet
```bash
git clone [URL_DU_REPO_PRIVE]
cd Sama-Quete
```

### 2. Setup Automatique
```bash
./setup.sh
```
Ce script fait tout automatiquement :
- ✅ Installe les dépendances
- ✅ Configure Firebase
- ✅ Crée les comptes de test
- ✅ Initialise les données
- ✅ Teste les connexions

### 3. Lancer les Applications
```bash
# Terminal 1 - Panel Admin
cd samaquete-admin
npm run dev

# Terminal 2 - Application Mobile
cd samaquete-mobile
npx expo start
```

## 🔑 Accès Immédiat

### Panel d'Administration
- **URL**: http://localhost:3000
- **Compte**: `admin@admin.com` / `admin123`
- **Rôle**: Super Administrateur

### Application Mobile
- **Lancement**: Scanner le QR code avec Expo Go
- **Données**: Paroisses et diocèses déjà configurés

## 📚 Documentation Complète

### 📖 Fichiers de Documentation
- **`README.md`** - Documentation complète du projet
- **`SETUP.md`** - Guide de démarrage détaillé
- **`FIREBASE_GUIDE.md`** - Guide complet Firebase
- **`TEST_ACCOUNTS.md`** - Comptes et données de test
- **`DEPLOYMENT.md`** - Guide de déploiement

### 🗂️ Structure du Projet
```
Sama-Quete/
├── samaquete-admin/          # Panel d'administration Next.js
├── samaquete-mobile/         # Application mobile React Native
├── setup.sh                  # Script de setup automatique
├── README.md                 # Documentation principale
├── SETUP.md                  # Guide de démarrage
├── FIREBASE_GUIDE.md         # Guide Firebase
├── TEST_ACCOUNTS.md          # Comptes de test
├── DEPLOYMENT.md             # Guide de déploiement
└── .gitignore                # Fichiers à ignorer
```

## 🔥 Configuration Firebase

### ✅ Déjà Configuré
- **Projet**: `numerisen-14a03`
- **Clés API**: Intégrées dans le code
- **Règles**: Configurées et sécurisées
- **Index**: Créés automatiquement

### 📊 Collections Disponibles
- `users` - Utilisateurs et permissions
- `dioceses` - Diocèses
- `parishes` - Paroisses
- `donationEvents` - Événements de dons
- `donations` - Dons individuels
- `news` - Actualités
- `liturgy` - Calendrier liturgique
- `notifications` - Notifications

## 🧪 Tests et Validation

### Scripts de Test
```bash
# Tester Firebase Admin
cd samaquete-admin
node lib/test-firebase-data.js

# Tester Firebase Mobile
cd samaquete-mobile
node lib/test-mobile-parishes.js
```

### Données de Test
- **3 Diocèses** pré-configurés
- **3 Paroisses** avec données complètes
- **3 Événements de dons** actifs
- **Comptes utilisateurs** fonctionnels

## 🛠️ Développement

### Technologies Utilisées
- **Admin**: Next.js 14 + TypeScript + Tailwind CSS
- **Mobile**: React Native + Expo + TypeScript
- **Backend**: Firebase (Auth + Firestore)
- **UI**: Radix UI + Framer Motion

### Commandes Utiles
```bash
# Admin - Développement
cd samaquete-admin
npm run dev

# Admin - Build
npm run build
npm start

# Mobile - Développement
cd samaquete-mobile
npx expo start

# Mobile - Build
npx expo build:android
npx expo build:ios
```

## 🚨 Résolution de Problèmes

### Problèmes Courants
1. **Erreur "Module not found"**:
   ```bash
   rm -rf node_modules
   npm install
   ```

2. **Erreur Firebase Index**:
   - Cliquer sur le lien d'erreur
   - Firebase crée l'index automatiquement

3. **Expo ne se lance pas**:
   ```bash
   npx expo start --clear
   ```

### Support
- Consultez la documentation
- Vérifiez les logs dans la console
- Utilisez les scripts de test

## 🎯 Fonctionnalités Disponibles

### Panel d'Administration
- ✅ Authentification et autorisation
- ✅ Gestion des utilisateurs
- ✅ Gestion des diocèses et paroisses
- ✅ Système de dons complet
- ✅ Tableau de bord avec statistiques
- ✅ Gestion du contenu
- ✅ Notifications

### Application Mobile
- ✅ Interface moderne et responsive
- ✅ Sélection de paroisse
- ✅ Système de dons
- ✅ Actualités paroissiales
- ✅ Calendrier liturgique
- ✅ Thème sombre/clair
- ✅ Connexion Firebase

## 📞 Contact et Support

### En cas de problème :
1. Vérifiez cette documentation
2. Consultez les logs
3. Utilisez les scripts de test
4. Contactez l'équipe de développement

### Ressources Utiles :
- Firebase Console: https://console.firebase.google.com/project/numerisen-14a03
- Documentation Expo: https://docs.expo.dev/
- Documentation Next.js: https://nextjs.org/docs

---

**🎉 Vous êtes prêt à développer ! Bon coding ! 🚀**